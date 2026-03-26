import { Router } from "express";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole(["admin", "staff"]), async (req, res) => {
  const filter = {};
  if (req.query.role) {
    filter.role = req.query.role;
  }

  const users = await User.find(filter).select("name email role phone createdAt");
  res.json(users);
});

router.get("/technicians", requireAuth, requireRole(["customer", "admin", "staff", "technician"]), async (req, res) => {
  const { minExperience, availability, minRating } = req.query;
  const filter = { role: "technician" };

  if (availability) {
    filter.availability = availability;
  }

  if (minExperience || minRating) {
    filter.$and = [];
    if (minExperience) {
      const parsedExperience = Number(minExperience);
      if (!Number.isNaN(parsedExperience)) {
        filter.$and.push({ experienceYears: { $gte: parsedExperience } });
      }
    }
    if (minRating) {
      const parsedRating = Number(minRating);
      if (!Number.isNaN(parsedRating)) {
        filter.$and.push({ rating: { $gte: parsedRating } });
      }
    }
    if (filter.$and.length === 0) {
      delete filter.$and;
    }
  }

  const technicians = await User.find(filter).select(
    "name email phone age experienceYears rating availability photoUrl specialties bio"
  );

  let recommendedTechnicianId = null;
  if (technicians.length > 0) {
    const recommended = [...technicians].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.experienceYears - a.experienceYears;
    })[0];
    recommendedTechnicianId = recommended._id;
  }

  res.json({ technicians, recommendedTechnicianId });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub).select("name email role phone");
  res.json(user);
});

export default router;
