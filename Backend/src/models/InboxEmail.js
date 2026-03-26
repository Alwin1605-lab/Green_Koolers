import mongoose from "mongoose";

const inboxEmailSchema = new mongoose.Schema(
  {
    messageId: { type: String, required: true, unique: true },
    from: {
      name: { type: String, default: "" },
      address: { type: String, default: "" }
    },
    subject: { type: String, default: "(no subject)" },
    bodyText: { type: String, default: "" },
    bodyHtml: { type: String, default: "" },
    receivedAt: { type: Date, default: Date.now },
    processed: { type: Boolean, default: false },
    serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", default: null },
    matchedCustomer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    inferredCategory: { type: String, default: "" },
    inferredServiceType: { type: String, default: "" },
    status: {
      type: String,
      enum: ["unread", "read", "auto-processed", "ignored"],
      default: "unread"
    }
  },
  { timestamps: true }
);

inboxEmailSchema.index({ status: 1 });
inboxEmailSchema.index({ receivedAt: -1 });

export default mongoose.model("InboxEmail", inboxEmailSchema);
