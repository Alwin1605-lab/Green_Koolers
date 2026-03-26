import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 }
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest" },
    items: [lineItemSchema],
    status: { type: String, enum: ["Draft", "Sent", "Paid"], default: "Draft" },
    issueDate: { type: Date, default: Date.now }
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

invoiceSchema.virtual("total").get(function total() {
  return this.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
});

export default mongoose.model("Invoice", invoiceSchema);
