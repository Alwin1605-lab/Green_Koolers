import mongoose from "mongoose";

const serviceHistorySchema = new mongoose.Schema(
  {
    serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    notes: { type: String, default: "" },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    visitDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("ServiceHistory", serviceHistorySchema);
