import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import { requireAuth } from "../middleware/auth.js";
import { sendWelcomeEmail } from "../services/emailService.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

function isProfileCompletePayload(payload = {}) {
  return Boolean(
    (payload.name || "").trim() &&
    (payload.phone || "").trim() &&
    (payload.city || "").trim() &&
    (payload.locality || "").trim() &&
    (payload.pincode || "").trim()
  );
}

function shouldRequirePasswordChange(role = "staff") {
  return role !== "customer";
}

function serializeAuthUser(user) {
  const requirePasswordChange = shouldRequirePasswordChange(user.role) && Boolean(user.mustChangePassword);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    customerId: user.customerId,
    mustChangePassword: requirePasswordChange,
    profileCompleted: user.profileCompleted
  };
}

// Register a new user (admin/staff/technician/customer)
router.post("/signup", async (req, res) => {
  const { name, email, password, role, phone, address, city, locality, pincode, photoUrl } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, password are required" });
  }

  const allowedRoles = ["admin", "staff", "technician", "customer"];
  const normalizedRole = allowedRoles.includes(role) ? role : "staff";

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const hashed = await bcrypt.hash(password, 10);
  let customerId;
  if (normalizedRole === "customer") {
    if (!phone) {
      return res.status(400).json({ message: "phone is required for customer accounts" });
    }
    const customer = await Customer.create({
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      address: address || "",
      city: city || "",
      locality: locality || "",
      pincode: pincode || ""
    });
    customerId = customer._id;
  }

  const requirePasswordChange = shouldRequirePasswordChange(normalizedRole);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    role: normalizedRole,
    passwordHash: hashed,
    phone: phone || "",
    address: address || "",
    city: city || "",
    locality: locality || "",
    pincode: pincode || "",
    photoUrl: photoUrl || "",
    customerId,
    mustChangePassword: requirePasswordChange,
    profileCompleted: false
  });

  // Issue JWT on successful signup
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      customerId: user.customerId,
      name: user.name,
      mustChangePassword: requirePasswordChange,
      profileCompleted: user.profileCompleted
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );

  sendWelcomeEmail(user).catch(() => {});

  return res.status(201).json({
    user: serializeAuthUser(user),
    token
  });

});

// Login with email/password and optional role portal check
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (role && user.role !== role) {
    return res.status(403).json({ message: "Access denied for this portal" });
  }

  // Issue JWT on successful login
  const requirePasswordChange = shouldRequirePasswordChange(user.role) && Boolean(user.mustChangePassword);

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      customerId: user.customerId,
      name: user.name,
      mustChangePassword: requirePasswordChange,
      profileCompleted: user.profileCompleted
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );

  return res.json({
    user: serializeAuthUser(user),
    token
  });
});

// Get current user profile
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // If customer, also get customer details
    let customerDetails = null;
    if (user.role === "customer" && user.customerId) {
      customerDetails = await Customer.findById(user.customerId);
    }
    
    const requirePasswordChange = shouldRequirePasswordChange(user.role) && Boolean(user.mustChangePassword);

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || customerDetails?.phone || "",
      address: user.address || customerDetails?.address || "",
      city: user.city || customerDetails?.city || "",
      locality: user.locality || customerDetails?.locality || "",
      pincode: user.pincode || customerDetails?.pincode || "",
      photoUrl: user.photoUrl || "",
      company: customerDetails?.company || "",
      customerId: user.customerId,
      specialization: user.specialization || "",
      department: user.department || "",
      mustChangePassword: requirePasswordChange,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Failed to get profile" });
  }
});

// Update profile
router.put("/update-profile", requireAuth, async (req, res) => {
  try {
    const { name, phone, address, city, locality, pincode, photoUrl, company, specialization, department } = req.body;
    
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (shouldRequirePasswordChange(user.role) && user.mustChangePassword) {
      return res.status(403).json({ message: "Change password before updating profile" });
    }
    
    // Update user fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (locality !== undefined) user.locality = locality;
    if (pincode !== undefined) user.pincode = pincode;
    if (photoUrl !== undefined) user.photoUrl = photoUrl;
    if (specialization !== undefined) user.specialization = specialization;
    if (department !== undefined) user.department = department;

    const profileCompleted = isProfileCompletePayload({
      name: user.name,
      phone: user.phone,
      city: user.city,
      locality: user.locality,
      pincode: user.pincode
    });
    user.profileCompleted = profileCompleted;
    
    await user.save();
    
    // If customer, also update customer record
    if (user.role === "customer" && user.customerId) {
      const customer = await Customer.findById(user.customerId);
      if (customer) {
        if (name) customer.name = name;
        if (phone !== undefined) customer.phone = phone;
        if (address !== undefined) customer.address = address;
        if (city !== undefined) customer.city = city;
        if (locality !== undefined) customer.locality = locality;
        if (pincode !== undefined) customer.pincode = pincode;
        if (company !== undefined) customer.company = company;
        await customer.save();
      }
    }
    
    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        locality: user.locality,
        pincode: user.pincode,
        photoUrl: user.photoUrl,
        mustChangePassword: shouldRequirePasswordChange(user.role) && Boolean(user.mustChangePassword),
        profileCompleted: user.profileCompleted
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

// Change password
router.put("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.mustChangePassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const matches = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!matches) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
    }
    
    // Hash and save new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();
    
    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Failed to change password" });
  }
});

export default router;
