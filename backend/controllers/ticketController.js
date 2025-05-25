import Ticket, { find, findById } from "../models/Ticket";

// Create new ticket (only user role)
export async function createTicket(req, res) {
  try {
    const { title, request } = req.body;
    const ticket = new Ticket({
      user: req.user.id,
      title,
      request,
      status: "pending",
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
}

// Get tickets for dashboard
export async function getTickets(req, res) {
  try {
    const { status } = req.query;
    let filter = {};

    // User sees only their tickets
    if (req.user.role === "user") {
      filter.user = req.user.id;
      filter.status = status || "pending";
    } else if (req.user.role === "admin") {
      // Admin sees tickets of all users, filtered by status or default pending
      filter.status = status || "pending";
    }

    const tickets = await find(filter).populate("user", "name email");
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
}

// Get ticket by ID (user can get only their tickets, admin can get any)
export async function getTicketById(req, res) {
  try {
    const ticket = await findById(req.params.id).populate("user", "name email");
    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    if (
      req.user.role === "user" &&
      ticket.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
}

// Update ticket (user can update only their ticket's title/request if status is pending, admin can update response and status)
export async function updateTicket(req, res) {
  try {
    const ticket = await findById(req.params.id);
    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    if (req.user.role === "user") {
      if (ticket.user.toString() !== req.user.id) {
        return res.status(403).json({ msg: "Access denied" });
      }
      if (ticket.status !== "pending") {
        return res
          .status(400)
          .json({ msg: "Cannot update ticket after review" });
      }
      // Update title and request only
      ticket.title = req.body.title || ticket.title;
      ticket.request = req.body.request || ticket.request;
    } else if (req.user.role === "admin") {
      // Admin updates response and status only
      ticket.response =
        req.body.response !== undefined ? req.body.response : ticket.response;
      if (
        req.body.status &&
        ["pending", "on review", "reviewed"].includes(req.body.status)
      ) {
        ticket.status = req.body.status;
      }
    }

    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
}

// Delete ticket (only user can delete their tickets if pending)
export async function deleteTicket(req, res) {
  try {
    const ticket = await findById(req.params.id);
    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    if (req.user.role !== "user" || ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (ticket.status !== "pending") {
      return res.status(400).json({ msg: "Cannot delete ticket after review" });
    }

    await ticket.deleteOne();
    res.json({ msg: "Ticket deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
}
