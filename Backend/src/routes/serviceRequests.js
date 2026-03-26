import { Router } from "express";
import ServiceRequest from "../models/ServiceRequest.js";
import ServiceHistory from "../models/ServiceHistory.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { rankTechnicians } from "../services/assignmentEngine.js";
import {
  sendRequestCreated,
  sendTechnicianAssigned,
  sendStatusChanged,
  sendAdminAlert,
  sendIssueSolvedReviewRequest
} from "../services/emailService.js";

const router = Router();

// ---------------------------------------------------------------------------
// Helper: populate fields consistently
// ---------------------------------------------------------------------------
const TECH_FIELDS = "name email role phone age experienceYears rating availability photoUrl specialties bio";

function populateRequest(query) {
  return query
    .populate("customer")
    .populate("assignedTechnician", TECH_FIELDS);
}

// ---------------------------------------------------------------------------
// GET / — list service requests
// ---------------------------------------------------------------------------
router.get("/", requireAuth, async (req, res) => {
  const filter = {};
  if (req.user.role === "customer") {
    filter.customer = req.user.customerId;
  }

  const requests = await populateRequest(
    ServiceRequest.find(filter).sort({ createdAt: -1 })
  );
  res.json(requests);
});

// ---------------------------------------------------------------------------
// GET /my-requests — customer's own requests
// ---------------------------------------------------------------------------
router.get("/my-requests", requireAuth, requireRole(["customer"]), async (req, res) => {
  try {
    const requests = await populateRequest(
      ServiceRequest.find({ customer: req.user.customerId }).sort({ createdAt: -1 })
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

// ---------------------------------------------------------------------------
// GET /my-assignments — technician's own assignments
// ---------------------------------------------------------------------------
router.get("/my-assignments", requireAuth, requireRole(["technician"]), async (req, res) => {
  try {
    const requests = await populateRequest(
      ServiceRequest.find({ assignedTechnician: req.user.sub }).sort({ scheduledDate: 1, createdAt: -1 })
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
});

// ---------------------------------------------------------------------------
// POST / — create service request with AI assignment
// ---------------------------------------------------------------------------
router.post("/", requireAuth, requireRole(["admin", "staff", "customer"]), async (req, res) => {
  try {
    const {
      customer,
      category,
      serviceType,
      description,
      status,
      scheduledDate,
      assignedTechnician,
      preferredTechnicianId,
      priority
    } = req.body;

    const resolvedCustomer = req.user.role === "customer" ? req.user.customerId : customer;

    if (!resolvedCustomer || !category || !serviceType) {
      return res.status(400).json({ message: "customer, category, serviceType are required" });
    }

    let resolvedTechnician = assignedTechnician || preferredTechnicianId || null;
    let resolvedStatus = status || "Requested";
    let assignedAt = null;
    let assignmentReason = null;

    if (resolvedTechnician) {
      // Explicit technician chosen — validate
      const validTechnician = await User.findOne({ _id: resolvedTechnician, role: "technician" });
      if (!validTechnician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      resolvedStatus = resolvedStatus === "Requested" ? "Assigned" : resolvedStatus;
      assignedAt = new Date();
    } else {
      // AI engine selects the best technician
      const ranked = await rankTechnicians({
        category,
        customerId: resolvedCustomer
      });

      const bestMatch = ranked[0] || null;

      if (bestMatch) {
        resolvedTechnician = bestMatch.technician._id;
        resolvedStatus = "Assigned";
        assignedAt = new Date();
        assignmentReason = {
          score: bestMatch.score,
          breakdown: bestMatch.breakdown,
          explanation: bestMatch.explanation
        };
      }
    }

    const request = await ServiceRequest.create({
      customer: resolvedCustomer,
      category,
      serviceType,
      description: description || "",
      status: resolvedStatus,
      priority: priority || "medium",
      scheduledDate: scheduledDate || null,
      assignedTechnician: resolvedTechnician,
      assignedAt,
      notes: []
    });

    const populated = await populateRequest(ServiceRequest.findById(request._id));

    // ---- Fire emails (non-blocking) ----------------------------------------
    const customerDoc = await Customer.findById(resolvedCustomer);

    // Email: request created
    sendRequestCreated(populated, customerDoc).catch(() => {});

    // Email: technician assigned
    if (resolvedTechnician && populated.assignedTechnician) {
      sendTechnicianAssigned(
        populated,
        customerDoc,
        populated.assignedTechnician,
        assignmentReason
      ).catch(() => {});
    }

    // Email: admin alert for high/urgent
    if (["high", "urgent"].includes(priority)) {
      sendAdminAlert(populated, customerDoc).catch(() => {});
    }
    // ------------------------------------------------------------------------

    return res.status(201).json({ ...populated.toObject(), assignmentReason });
  } catch (err) {
    console.error("Create service request error:", err);
    return res.status(500).json({ message: "Failed to create service request" });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — single request
// ---------------------------------------------------------------------------
router.get("/:id", requireAuth, async (req, res) => {
  const request = await populateRequest(ServiceRequest.findById(req.params.id));
  if (!request) {
    return res.status(404).json({ message: "Service request not found" });
  }
  return res.json(request);
});

router.post("/:id/review", requireAuth, requireRole(["customer"]), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const parsedRating = Number(rating);

    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "rating must be an integer between 1 and 5" });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    if (!request.customer || request.customer.toString() !== req.user.customerId) {
      return res.status(403).json({ message: "You can only review your own requests" });
    }

    if (request.status !== "Completed") {
      return res.status(400).json({ message: "Review can only be submitted after completion" });
    }

    request.review = {
      rating: parsedRating,
      comment: (comment || "").trim(),
      submittedAt: new Date()
    };

    await request.save();
    const populated = await populateRequest(ServiceRequest.findById(request._id));
    return res.json(populated);
  } catch (error) {
    console.error("Review submit error:", error);
    return res.status(500).json({ message: "Failed to submit review" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id/status — update status + send email
// ---------------------------------------------------------------------------
router.patch("/:id/status", requireAuth, requireRole(["admin", "staff", "technician"]), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Requested", "Assigned", "In Progress", "Completed", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    // Technicians can only update their own assignments
    if (req.user.role === "technician") {
      if (!request.assignedTechnician || request.assignedTechnician.toString() !== req.user.sub) {
        return res.status(403).json({ message: "You can only update your own assignments" });
      }
      const allowedTransitions = {
        Assigned: ["In Progress"],
        "In Progress": ["Completed"]
      };
      if (!allowedTransitions[request.status]?.includes(status)) {
        return res.status(400).json({ message: `Cannot transition from ${request.status} to ${status}` });
      }
    }

    request.status = status;
    if (status === "Completed") request.completedAt = new Date();
    if (status === "Assigned" && !request.assignedAt) request.assignedAt = new Date();

    await request.save();

    // Auto-create ServiceHistory record when a job is completed
    if (status === "Completed") {
      const lastNote = request.notes?.length
        ? request.notes[request.notes.length - 1].text
        : "";
      await ServiceHistory.create({
        serviceRequest: request._id,
        customer: request.customer,
        performedBy: request.assignedTechnician || null,
        notes: lastNote,
        visitDate: request.completedAt || new Date()
      }).catch((err) => console.error("Failed to create service history:", err.message));
    }

    const populated = await populateRequest(ServiceRequest.findById(request._id));

    // Fire status-change email (skip "Assigned" and "Completed")
    if (!["Assigned", "Completed"].includes(status)) {
      const customerDoc = await Customer.findById(request.customer);
      sendStatusChanged(populated, customerDoc, status).catch(() => {});
    }

    if (status === "Completed") {
      const customerDoc = await Customer.findById(request.customer);
      sendIssueSolvedReviewRequest(populated, customerDoc).catch(() => {});
    }

    return res.json(populated);
  } catch (error) {
    console.error("Status update error:", error);
    return res.status(500).json({ message: "Failed to update status" });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/notes — add a note
// ---------------------------------------------------------------------------
router.post("/:id/notes", requireAuth, requireRole(["admin", "staff", "technician"]), async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ message: "Note text is required" });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    if (req.user.role === "technician") {
      if (!request.assignedTechnician || request.assignedTechnician.toString() !== req.user.sub) {
        return res.status(403).json({ message: "You can only add notes to your own assignments" });
      }
    }

    const user = await User.findById(req.user.sub);

    request.notes.push({
      text: note.trim(),
      author: user?.name || "Unknown",
      authorId: req.user.sub
    });

    await request.save();

    const populated = await populateRequest(ServiceRequest.findById(request._id));
    return res.json(populated);
  } catch (error) {
    console.error("Add note error:", error);
    return res.status(500).json({ message: "Failed to add note" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id/assign — manually reassign technician (admin/staff)
// ---------------------------------------------------------------------------
router.patch("/:id/assign", requireAuth, requireRole(["admin", "staff"]), async (req, res) => {
  try {
    const { technicianId } = req.body;

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    if (technicianId) {
      const technician = await User.findOne({ _id: technicianId, role: "technician" });
      if (!technician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      request.assignedTechnician = technicianId;
      request.assignedAt = new Date();
      if (request.status === "Requested") request.status = "Assigned";
    } else {
      request.assignedTechnician = null;
      request.assignedAt = null;
      if (request.status === "Assigned") request.status = "Requested";
    }

    await request.save();

    const populated = await populateRequest(ServiceRequest.findById(request._id));

    // Send assignment email when manually assigning
    if (technicianId) {
      const customerDoc = await Customer.findById(request.customer);
      sendTechnicianAssigned(populated, customerDoc, populated.assignedTechnician, null).catch(() => {});
    }

    return res.json(populated);
  } catch (error) {
    console.error("Assign error:", error);
    return res.status(500).json({ message: "Failed to assign technician" });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — full update
// ---------------------------------------------------------------------------
router.put("/:id", requireAuth, requireRole(["admin", "staff", "technician"]), async (req, res) => {
  const update = { ...req.body };

  if (update.assignedTechnician && update.status === "Requested") {
    update.status = "Assigned";
    update.assignedAt = new Date();
  }

  if (update.status === "Completed" && !update.completedAt) {
    update.completedAt = new Date();
  }

  const request = await populateRequest(
    ServiceRequest.findByIdAndUpdate(req.params.id, update, { new: true })
  );

  if (!request) {
    return res.status(404).json({ message: "Service request not found" });
  }

  // Auto-create ServiceHistory record when a job is completed via full update
  if (update.status === "Completed") {
    const lastNote = request.notes?.length
      ? request.notes[request.notes.length - 1].text
      : "";
    await ServiceHistory.create({
      serviceRequest: request._id,
      customer: request.customer?._id || request.customer,
      performedBy: request.assignedTechnician?._id || request.assignedTechnician || null,
      notes: lastNote,
      visitDate: request.completedAt || new Date()
    }).catch((err) => console.error("Failed to create service history:", err.message));
  }

  return res.json(request);
});

// ---------------------------------------------------------------------------
// DELETE /:id — admin only
// ---------------------------------------------------------------------------
router.delete("/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  const request = await ServiceRequest.findByIdAndDelete(req.params.id);
  if (!request) {
    return res.status(404).json({ message: "Service request not found" });
  }
  return res.json(request);
});

export default router;
