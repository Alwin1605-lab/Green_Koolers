import { Router } from "express";
import Customer from "../models/Customer.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// List customers
router.get("/", requireAuth, async (req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.json(customers);
});

// Create customer
router.post("/", requireAuth, requireRole(["admin", "staff"]), async (req, res) => {
  const { name, phone, email, address, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  const customer = await Customer.create({
    name,
    phone,
    email: email || "",
    address: address || "",
    notes: notes || "",
    createdBy: req.user.sub
  });

  return res.status(201).json(customer);
});

// Get customer by id
router.get("/:id", requireAuth, async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }
  return res.json(customer);
});

// Update customer
router.put("/:id", requireAuth, requireRole(["admin", "staff"]), async (req, res) => {
  const { name, phone, email, address, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { name, phone, email: email || "", address: address || "", notes: notes || "" },
    { new: true }
  );

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  return res.json(customer);
});

// Delete customer (admin only)
router.delete("/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }
  return res.json(customer);
});

export default router;
