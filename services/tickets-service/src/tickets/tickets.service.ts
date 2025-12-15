import { prisma } from "../prisma/prisma.service.js";
import { RabbitService } from "../rabbit/rabbit.services.js";
import { randomUUID } from "crypto";


export class TicketsService {
  static async reserve(userId: string, eventId: string) {
    const event = await prisma.eventSnapshot.findUnique({
      where: { eventId },
    });

    if (!event || event.cancelled) {
      throw new Error("Event not available");
    }

    const used = await prisma.ticket.count({
      where: {
        eventId,
        status: { in: ["waiting_payment", "paid"] },
      },
    });

    if (used >= event.capacity) {
      throw new Error("Event sold out");
    }

    const ticket = await prisma.ticket.create({
      data: {
        userId,
        eventId,
        status: "waiting_payment",
      },
    });

    // ✅ STATIC call
    RabbitService.publish("ticket.booked", {
      messageId: randomUUID(),
      ticketId: ticket.id,
      userId,
      eventId,
    });

    return ticket;
  }

  static async cancel(ticketId: string) {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "cancelled" },
    });

    // ✅ STATIC call
    RabbitService.publish("ticket.cancelled", {
      messageId: randomUUID(),
      ticketId: ticket.id,
      userId: ticket.userId,
      eventId: ticket.eventId,
    });

    return ticket;
  }
}