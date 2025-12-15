import { Router } from "express";
import { TicketsService } from "./tickets.service.js";

export const ticketsRouter = Router();

ticketsRouter.post("/", async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    const ticket = await TicketsService.reserve(userId, eventId);
    res.status(201).json(ticket);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

ticketsRouter.post("/cancel", async (req, res) => {
  try {
    const { ticketId } = req.body;
    const ticket = await TicketsService.cancel(ticketId);
    res.json(ticket);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
