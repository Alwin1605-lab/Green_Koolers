import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: "" },
    location: { type: String, default: "" },
    minStock: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("InventoryItem", inventoryItemSchema);
