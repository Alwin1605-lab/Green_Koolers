import { Router } from "express";
import InventoryItem from "../models/InventoryItem.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// List inventory items
router.get("/", requireAuth, async (req, res) => {
  const items = await InventoryItem.find().sort({ createdAt: -1 });
  res.json(items);
});

// Create inventory item
router.post("/", requireAuth, requireRole(["admin", "staff"]), async (req, res) => {
  const { name, sku, quantity, unit, location, minStock } = req.body;
  if (!name || !sku) {
    return res.status(400).json({ message: "name and sku are required" });
  }

  const item = await InventoryItem.create({
    name,
    sku,
    quantity: Number(quantity) || 0,
    unit: unit || "",
    location: location || "",
    minStock: Number(minStock) || 0
  });

  return res.status(201).json(item);
});

// Update inventory item
router.put("/:id", requireAuth, requireRole(["admin", "staff"]), async (req, res) => {
  const { name, sku, quantity, unit, location, minStock } = req.body;
  if (!name || !sku) {
    return res.status(400).json({ message: "name and sku are required" });
  }

  const item = await InventoryItem.findByIdAndUpdate(
    req.params.id,
    {
      name,
      sku,
      quantity: Number(quantity) || 0,
      unit: unit || "",
      location: location || "",
      minStock: Number(minStock) || 0
    },
    { new: true }
  );

  if (!item) {
    return res.status(404).json({ message: "Inventory item not found" });
  }

  return res.json(item);
});

// Delete inventory item (admin only)
router.delete("/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  const item = await InventoryItem.findByIdAndDelete(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Inventory item not found" });
  }
  return res.json(item);
});

export default router;
