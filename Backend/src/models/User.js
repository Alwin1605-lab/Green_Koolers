import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff", "technician", "customer"], default: "staff" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    locality: { type: String, default: "" },
    pincode: { type: String, default: "" },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    age: { type: Number, min: 18, default: 18 },
    experienceYears: { type: Number, min: 0, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    availability: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    specialties: { type: [String], default: [] },
    bio: { type: String, default: "" },
    specialization: { type: String, default: "" },
    department: { type: String, default: "" },
    mustChangePassword: {
      type: Boolean,
      default() {
        return this.role !== "customer";
      }
    },
    profileCompleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
