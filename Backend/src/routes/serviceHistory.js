import { Router } from "express";
import ServiceHistory from "../models/ServiceHistory.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// List service history with optional filters
router.get("/", requireAuth, async (req, res) => {
  const filter = {};
  if (req.query.customer) {
    filter.customer = req.query.customer;
  }
  if (req.query.serviceRequest) {
    filter.serviceRequest = req.query.serviceRequest;
  }

  const history = await ServiceHistory.find(filter)
    .populate("customer")
    .populate("serviceRequest")
    .populate("performedBy", "name email role")
    .sort({ createdAt: -1 });

  res.json(history);
});

// Create service history entry
router.post("/", requireAuth, requireRole(["admin", "staff", "technician"]), async (req, res) => {
  const { serviceRequest, customer, notes, visitDate } = req.body;
  if (!serviceRequest || !customer) {
    return res.status(400).json({ message: "serviceRequest and customer are required" });
  }

  const entry = await ServiceHistory.create({
    serviceRequest,
    customer,
    notes: notes || "",
    visitDate: visitDate ? new Date(visitDate) : new Date(),
    performedBy: req.user.sub
  });

  return res.status(201).json(entry);
});

export default router;
