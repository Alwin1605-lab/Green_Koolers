import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: String },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    category: {
      type: String,
      enum: [
        "Residential AC",
        "Industrial AC",
        "HVAC",
        "Cassette AC",
        "Refrigeration",
        "Bakery Equipment",
        "Projects"
      ],
      required: true
    },
    serviceType: { type: String, required: true },
    description: { type: String, default: "" },
    status: { 
      type: String, 
      enum: ["Requested", "Assigned", "In Progress", "Completed", "Cancelled"], 
      default: "Requested" 
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    scheduledDate: { type: Date },
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedAt: { type: Date },
    completedAt: { type: Date },
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: "" },
      submittedAt: { type: Date }
    },
    notes: [noteSchema]
  },
  { timestamps: true }
);

// Index for efficient queries
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ assignedTechnician: 1 });
serviceRequestSchema.index({ customer: 1 });
serviceRequestSchema.index({ scheduledDate: 1 });

export default mongoose.model("ServiceRequest", serviceRequestSchema);
