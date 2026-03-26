import User from "../models/User.js";
import ServiceRequest from "../models/ServiceRequest.js";
import ServiceHistory from "../models/ServiceHistory.js";

// ---------------------------------------------------------------------------
// Category → keyword mapping for specialty matching + email inference
// ---------------------------------------------------------------------------
const CATEGORY_KEYWORDS = {
  "Residential AC": ["residential", "ac", "air conditioning", "air-conditioning", "home ac", "split ac", "window ac"],
  "Industrial AC": ["industrial", "commercial", "factory", "warehouse", "central ac", "large scale"],
  "HVAC": ["hvac", "ventilation", "heating", "duct", "ductwork", "air handling", "ahu", "vav"],
  "Cassette AC": ["cassette", "ceiling cassette", "four way", "4-way"],
  "Refrigeration": ["refrigeration", "cooling", "fridge", "freezer", "cold storage", "chiller", "cold room"],
  "Bakery Equipment": ["bakery", "oven", "proofer", "dough", "bread", "pastry", "baking equipment"],
  "Projects": ["project", "installation", "fit-out", "fitout", "new build", "construction", "turnkey"]
};

// ---------------------------------------------------------------------------
// Infer best service category from free text (email subject + body)
// ---------------------------------------------------------------------------
export function inferCategoryFromText(text) {
  if (!text) return "Residential AC";

  const lower = text.toLowerCase();
  const scores = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 1;
    }
    scores[category] = score;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  // If no keyword matched at all, default to Residential AC
  return best[1] > 0 ? best[0] : "Residential AC";
}

// ---------------------------------------------------------------------------
// Infer service type from free text
// ---------------------------------------------------------------------------
export function inferServiceTypeFromText(text) {
  if (!text) return "Maintenance";
  const lower = text.toLowerCase();
  if (lower.includes("install")) return "Installation";
  if (lower.includes("repair") || lower.includes("fix") || lower.includes("broken") || lower.includes("fault")) return "Repair";
  if (lower.includes("inspect") || lower.includes("check")) return "Inspection";
  if (lower.includes("consult") || lower.includes("advice") || lower.includes("quote")) return "Consultation";
  return "Maintenance";
}

// ---------------------------------------------------------------------------
// Score a single technician against a service request context
// ---------------------------------------------------------------------------
async function scoreTechnician(tech, { category, customerId, openTaskCounts, servedCustomerIds }) {
  let score = 0;
  const breakdown = {
    specialties: 0,
    ratingExperience: 0,
    workload: 0,
    history: 0,
    availability: 0
  };

  // --- Availability (10 pts) — "Busy" is excluded before calling this function ---
  const avail = (tech.availability || "").toLowerCase();
  if (avail.includes("today")) {
    breakdown.availability = 10;
  } else if (avail.includes("this week") || avail.includes("week")) {
    breakdown.availability = 7;
  } else if (avail.includes("next week")) {
    breakdown.availability = 4;
  } else {
    breakdown.availability = 2; // unknown / other
  }

  // --- Specialties match (30 pts) ---
  const keywords = CATEGORY_KEYWORDS[category] || [];
  const specialtyText = [
    ...(tech.specialties || []),
    tech.bio || ""
  ].join(" ").toLowerCase();

  // Full match: category name directly in specialties array
  const hasFullMatch = (tech.specialties || []).some(
    (s) => s.toLowerCase() === category.toLowerCase()
  );

  if (hasFullMatch) {
    breakdown.specialties = 30;
  } else {
    // Partial keyword match
    const matchedKeywords = keywords.filter((kw) => specialtyText.includes(kw));
    if (matchedKeywords.length > 0) {
      breakdown.specialties = 15;
    } else {
      breakdown.specialties = 0;
    }
  }

  // --- Rating + Experience (25 pts) ---
  // Rating: 0–5 → 0–15 pts
  const ratingScore = Math.round(((tech.rating || 0) / 5) * 15);
  // Experience: capped at 10 years → 0–10 pts
  const expScore = Math.round((Math.min(tech.experienceYears || 0, 10) / 10) * 10);
  breakdown.ratingExperience = ratingScore + expScore;

  // --- Workload — fewer open tasks is better (20 pts) ---
  const openTasks = openTaskCounts[tech._id.toString()] || 0;
  const workloadPoints = [20, 16, 12, 8, 4, 0];
  breakdown.workload = workloadPoints[Math.min(openTasks, 5)];

  // --- Past service history (15 pts) ---
  if (customerId && servedCustomerIds.has(tech._id.toString())) {
    breakdown.history = 15;
  }

  score =
    breakdown.availability +
    breakdown.specialties +
    breakdown.ratingExperience +
    breakdown.workload +
    breakdown.history;

  return { score, breakdown };
}

// ---------------------------------------------------------------------------
// Build a human-readable explanation string
// ---------------------------------------------------------------------------
function buildExplanation(tech, breakdown, category) {
  const parts = [];

  if (breakdown.specialties === 30) {
    parts.push(`specialties match ${category}`);
  } else if (breakdown.specialties === 15) {
    parts.push(`partial specialties match for ${category}`);
  } else {
    parts.push(`no direct specialty match`);
  }

  if (tech.experienceYears) parts.push(`${tech.experienceYears} yrs experience`);
  if (tech.rating) parts.push(`rating ${tech.rating.toFixed(1)}/5`);

  const openTasksScore = breakdown.workload;
  if (openTasksScore === 20) parts.push("no active tasks");
  else if (openTasksScore >= 12) parts.push("low workload");
  else if (openTasksScore >= 4) parts.push("moderate workload");
  else parts.push("high workload");

  if (breakdown.history === 15) parts.push("has served this customer before");

  const avail = (tech.availability || "").trim();
  if (avail) parts.push(`availability: ${avail}`);

  return parts.join(", ");
}

// ---------------------------------------------------------------------------
// Main export: rank all eligible technicians for a service request
// Returns: [{ technician, score, breakdown, explanation }, ...] sorted desc
// ---------------------------------------------------------------------------
export async function rankTechnicians({ category, customerId }) {
  // Fetch all technicians who are NOT marked Busy
  const allTechs = await User.find({ role: "technician" }).lean();
  const eligibleTechs = allTechs.filter(
    (t) => (t.availability || "").toLowerCase() !== "busy"
  );

  if (eligibleTechs.length === 0) {
    // Fallback: include all technicians if none are available
    // (so the request still gets assigned rather than orphaned)
    eligibleTechs.push(...allTechs);
  }

  const techIds = eligibleTechs.map((t) => t._id);

  // --- Batch: count open tasks per technician ---
  const openTaskAgg = await ServiceRequest.aggregate([
    {
      $match: {
        assignedTechnician: { $in: techIds },
        status: { $nin: ["Completed", "Cancelled"] }
      }
    },
    { $group: { _id: "$assignedTechnician", count: { $sum: 1 } } }
  ]);
  const openTaskCounts = {};
  for (const row of openTaskAgg) {
    openTaskCounts[row._id.toString()] = row.count;
  }

  // --- Batch: find which technicians have served this customer before ---
  const servedCustomerIds = new Set();
  if (customerId) {
    const historyRecords = await ServiceHistory.find({
      customer: customerId,
      performedBy: { $in: techIds }
    }).lean();
    for (const h of historyRecords) {
      if (h.performedBy) servedCustomerIds.add(h.performedBy.toString());
    }
  }

  // --- Score all eligible technicians ---
  const results = await Promise.all(
    eligibleTechs.map(async (tech) => {
      const { score, breakdown } = await scoreTechnician(tech, {
        category,
        customerId,
        openTaskCounts,
        servedCustomerIds
      });
      const explanation = buildExplanation(tech, breakdown, category);
      return { technician: tech, score, breakdown, explanation };
    })
  );

  // Sort descending by score, then by rating as tiebreaker
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.technician.rating || 0) - (a.technician.rating || 0);
  });

  return results;
}
