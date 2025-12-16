import 'dotenv/config';
import express from "express";
import { ticketsRouter } from "./tickets/tickets.controller.js";
import { RabbitService } from "./rabbit/rabbit.services.js";
import { prisma } from "./prisma/prisma.service.js";

async function bootstrap() {
  await RabbitService.connect(process.env.RABBITMQ_URL!);

  // ---- CONSUMERS (via subscribe) ----

  RabbitService.subscribe("event.updated", async (data) => {
    await prisma.eventSnapshot.upsert({
      where: { eventId: data.eventId },
      update: { capacity: data.capacity },
      create: { eventId: data.eventId, capacity: data.capacity },
    });
  });

  RabbitService.subscribe("event.cancelled", async (data) => {
    await prisma.eventSnapshot.update({
      where: { eventId: data.eventId },
      data: { cancelled: true },
    });

    await prisma.ticket.updateMany({
      where: { eventId: data.eventId },
      data: { status: "cancelled" },
    });
  });

  RabbitService.subscribe("payment.processed", async (data) => {
    await prisma.ticket.update({
      where: { id: data.ticketId },
      data: { status: "paid" },
    });
  });

  RabbitService.subscribe("payment.failed", async (data) => {
    await prisma.ticket.update({
      where: { id: data.ticketId },
      data: { status: "cancelled" },
    });
  });

  // ---- API REST ----
  const app = express();
  app.use(express.json());
  app.use("/tickets", ticketsRouter);

  const port = process.env.PORT || 3006;
  app.listen(port, () => {
    console.log(`🎫 tickets-service running on port ${port}`);
  });
}

bootstrap();