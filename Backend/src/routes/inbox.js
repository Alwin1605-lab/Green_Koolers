import { Router } from "express";
import InboxEmail from "../models/InboxEmail.js";
import Customer from "../models/Customer.js";
import ServiceRequest from "../models/ServiceRequest.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { rankTechnicians } from "../services/assignmentEngine.js";
import { sendRequestCreated, sendTechnicianAssigned } from "../services/emailService.js";

const router = Router();

// All inbox routes require admin or staff
router.use(requireAuth, requireRole(["admin", "staff"]));

// ---------------------------------------------------------------------------
// GET /api/inbox — list emails, paginated, filterable by status
// ---------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [emails, total] = await Promise.all([
      InboxEmail.find(filter)
        .populate("matchedCustomer", "name email phone")
        .populate("serviceRequest", "category status serviceType createdAt")
        .sort({ receivedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      InboxEmail.countDocuments(filter)
    ]);

    res.json({
      emails,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch inbox" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/inbox/unread-count — for nav badge
// ---------------------------------------------------------------------------
router.get("/unread-count", async (req, res) => {
  try {
    const count = await InboxEmail.countDocuments({ status: "unread" });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Failed to get count" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/inbox/:id — single email detail
// ---------------------------------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const email = await InboxEmail.findById(req.params.id)
      .populate("matchedCustomer", "name email phone address")
      .populate({
        path: "serviceRequest",
        populate: [
          { path: "customer" },
          { path: "assignedTechnician", select: "name email phone rating experienceYears specialties" }
        ]
      });

    if (!email) return res.status(404).json({ message: "Email not found" });

    // Auto-mark as read when viewed
    if (email.status === "unread") {
      email.status = "read";
      await email.save();
    }

    res.json(email);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch email" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/inbox/:id/status — mark read / ignored
// ---------------------------------------------------------------------------
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["unread", "read", "ignored"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const email = await InboxEmail.findById(req.params.id);
    if (!email) return res.status(404).json({ message: "Email not found" });

    email.status = status;
    await email.save();
    res.json(email);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/inbox/:id/create-request — manually create a service request
// from an unmatched email, with a customer selected by the staff member
// ---------------------------------------------------------------------------
router.post("/:id/create-request", async (req, res) => {
  try {
    const { customerId, category, serviceType, priority, scheduledDate } = req.body;

    if (!customerId) return res.status(400).json({ message: "customerId is required" });

    const email = await InboxEmail.findById(req.params.id);
    if (!email) return res.status(404).json({ message: "Email not found" });

    if (email.processed) {
      return res.status(400).json({ message: "A service request has already been created from this email" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const resolvedCategory = category || email.inferredCategory || "Residential AC";
    const resolvedServiceType = serviceType || email.inferredServiceType || "Maintenance";

    // AI assign best technician
    const ranked = await rankTechnicians({
      category: resolvedCategory,
      customerId: customer._id
    });
    const bestMatch = ranked[0] || null;
    const resolvedTechnician = bestMatch?.technician?._id || null;

    const serviceRequest = await ServiceRequest.create({
      customer: customer._id,
      category: resolvedCategory,
      serviceType: resolvedServiceType,
      description: `[Created from inbox email]\n\nFrom: ${email.from.name} <${email.from.address}>\nSubject: ${email.subject}\n\n${email.bodyText.slice(0, 2000)}`,
      status: resolvedTechnician ? "Assigned" : "Requested",
      priority: priority || "medium",
      scheduledDate: scheduledDate || null,
      assignedTechnician: resolvedTechnician,
      assignedAt: resolvedTechnician ? new Date() : null,
      notes: []
    });

    const populated = await ServiceRequest.findById(serviceRequest._id)
      .populate("customer")
      .populate("assignedTechnician", "name email role phone age experienceYears rating availability photoUrl specialties bio");

    // Send emails
    await sendRequestCreated(populated, customer);
    if (resolvedTechnician && bestMatch) {
      await sendTechnicianAssigned(
        populated,
        customer,
        bestMatch.technician,
        { explanation: bestMatch.explanation }
      );
    }

    // Update inbox email record
    email.processed = true;
    email.status = "auto-processed";
    email.serviceRequest = serviceRequest._id;
    email.matchedCustomer = customer._id;
    await email.save();

    res.status(201).json({ serviceRequest: populated, inboxEmail: email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create service request from email" });
  }
});

export default router;
