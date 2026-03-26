import { Router } from "express";
import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { sendInvoiceSent } from "../services/emailService.js";

const router = Router();

// List invoices
router.get("/", requireAuth, async (req, res) => {
  const invoices = await Invoice.find()
    .populate("customer")
    .populate("serviceRequest")
    .sort({ createdAt: -1 });
  res.json(invoices);
});

// Create invoice
router.post("/", requireAuth, requireRole(["admin", "staff"]), async (req, res) => {
  const { customer, serviceRequest, items, status } = req.body;
  if (!customer) {
    return res.status(400).json({ message: "customer is required" });
  }

  const invoice = await Invoice.create({
    customer,
    serviceRequest: serviceRequest || null,
    items: Array.isArray(items) ? items : [],
    status: status || "Draft"
  });

  // If created directly as Sent, fire the email
  if (invoice.status === "Sent") {
    const customerDoc = await Customer.findById(customer);
    sendInvoiceSent(invoice, customerDoc).catch(() => {});
  }

  return res.status(201).json(invoice);
});

// Update invoice — fire email when status transitions to Sent
router.put("/:id", requireAuth, requireRole(["admin", "staff"]), async (req, res) => {
  const existing = await Invoice.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Invoice not found" });

  const wasSent = existing.status === "Sent";
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });

  // Send email only when transitioning INTO "Sent" state
  if (!wasSent && invoice.status === "Sent") {
    const customerDoc = await Customer.findById(invoice.customer);
    sendInvoiceSent(invoice, customerDoc).catch(() => {});
  }

  return res.json(invoice);
});

export default router;
