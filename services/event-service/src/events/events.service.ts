import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitmq: RabbitmqService,
  ) {}

  async findAll(filters: {
    category?: string;
    status?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    const events = await this.prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return {
      success: true,
      count: events.length,
      data: events,
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return {
      success: true,
      data: event,
    };
  }

  async create(createEventDto: CreateEventDto) {
    // Validate date is in the future
    if (new Date(createEventDto.date) <= new Date()) {
      throw new BadRequestException('Event date must be in the future');
    }

    // Validate capacity
    if (createEventDto.capacity <= 0) {
      throw new BadRequestException('Capacity must be greater than 0');
    }

    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        status: 'published',
      },
    });

    // Publish EventCreatedEvent to RabbitMQ
    await this.rabbitmq.publishEventCreated(event);

    return {
      success: true,
      message: 'Event created successfully',
      data: event,
    };
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    // Check if event exists
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Cannot update cancelled events
    if (existingEvent.status === 'cancelled') {
      throw new BadRequestException('Cannot update a cancelled event');
    }

    // Validate date if provided
    if (updateEventDto.date && new Date(updateEventDto.date) <= new Date()) {
      throw new BadRequestException('Event date must be in the future');
    }

    // Validate capacity if provided
    if (updateEventDto.capacity !== undefined && updateEventDto.capacity <= 0) {
      throw new BadRequestException('Capacity must be greater than 0');
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: updateEventDto,
    });

    // Publish EventUpdatedEvent to RabbitMQ
    await this.rabbitmq.publishEventUpdated(event);

    return {
      success: true,
      message: 'Event updated successfully',
      data: event,
    };
  }

  async cancel(id: string) {
    // Check if event exists
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Cannot cancel already cancelled events
    if (existingEvent.status === 'cancelled') {
      throw new BadRequestException('Event is already cancelled');
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    // Publish EventCancelledEvent to RabbitMQ
    await this.rabbitmq.publishEventCancelled(event);

    return {
      success: true,
      message: 'Event cancelled successfully',
      data: event,
    };
  }
}
