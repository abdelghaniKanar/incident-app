import { Router } from "express";
const router = Router();
import { auth } from "../middlewares/auth";
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController";

router.post("/", auth, createTicket);
router.get("/", auth, getTickets);
router.get("/:id", auth, getTicketById);
router.put("/:id", auth, updateTicket);
router.delete("/:id", auth, deleteTicket);

export default router;
