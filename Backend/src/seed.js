import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDatabase } from "./config/db.js";
import User from "./models/User.js";
import Customer from "./models/Customer.js";
import ServiceRequest from "./models/ServiceRequest.js";
import InventoryItem from "./models/InventoryItem.js";
import ServiceHistory from "./models/ServiceHistory.js";
import Invoice from "./models/Invoice.js";

async function seed() {
  await connectDatabase();

  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    ServiceRequest.deleteMany({}),
    InventoryItem.deleteMany({}),
    ServiceHistory.deleteMany({}),
    Invoice.deleteMany({})
  ]);

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const [admin, staff, technicianA, technicianB, technicianC, technicianD] = await User.create([
    { name: "Admin User", email: "admin@consultancy.com", role: "admin", passwordHash },
    { name: "Service Staff", email: "staff@consultancy.com", role: "staff", passwordHash },
    {
      name: "Maya Patel",
      email: "maya.patel@consultancy.com",
      role: "technician",
      passwordHash,
      phone: "+971 50 111 2233",
      age: 29,
      experienceYears: 7,
      rating: 4.7,
      availability: "Available Today",
      photoUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=300&h=300&facepad=2&crop=faces",
      specialties: ["Residential AC", "HVAC Systems", "Maintenance"],
      bio: "Detail-oriented technician known for fast diagnostics and clear communication."
    },
    {
      name: "Omar Hassan",
      email: "omar.hassan@consultancy.com",
      role: "technician",
      passwordHash,
      phone: "+971 50 222 3344",
      age: 38,
      experienceYears: 14,
      rating: 4.9,
      availability: "This Week",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=300&h=300&facepad=2&crop=faces",
      specialties: ["Industrial AC", "Projects", "Refrigeration"],
      bio: "Senior technician specializing in large-scale installations and complex refrigeration systems."
    },
    {
      name: "Lina Alvarez",
      email: "lina.alvarez@consultancy.com",
      role: "technician",
      passwordHash,
      phone: "+971 50 333 4455",
      age: 33,
      experienceYears: 10,
      rating: 4.6,
      availability: "Next Week",
      photoUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=300&h=300&facepad=2&crop=faces",
      specialties: ["Cassette AC", "Residential AC", "Inspection"],
      bio: "Focused on precision installation and preventive inspections for long-term performance."
    },
    {
      name: "Daniel Kim",
      email: "daniel.kim@consultancy.com",
      role: "technician",
      passwordHash,
      phone: "+971 50 444 5566",
      age: 41,
      experienceYears: 18,
      rating: 4.8,
      availability: "Busy",
      photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&w=300&h=300&facepad=2&crop=faces",
      specialties: ["Bakery Equipment", "HVAC Systems", "Repairs"],
      bio: "Veteran troubleshooter for commercial equipment with a calm, methodical approach."
    }
  ]);

  const customers = await Customer.create([
    {
      name: "Al Noor Bakery",
      email: "contact@alnoor.com",
      phone: "+971 50 123 4567",
      address: "Industrial Area 3",
      createdBy: staff._id
    },
    {
      name: "Skyline Residences",
      email: "admin@skyline.com",
      phone: "+971 50 555 2222",
      address: "Dubai Marina",
      createdBy: staff._id
    }
  ]);

  const [requestA, requestB] = await ServiceRequest.create([
    {
      customer: customers[0]._id,
      category: "Bakery Equipment",
      serviceType: "Maintenance",
      description: "Quarterly inspection and refrigeration calibration",
      status: "In Progress",
      scheduledDate: new Date(),
      assignedTechnician: technicianA._id
    },
    {
      customer: customers[1]._id,
      category: "HVAC",
      serviceType: "Installation",
      description: "New HVAC installation for tower A",
      status: "Requested",
      scheduledDate: new Date(Date.now() + 86400000 * 2)
    }
  ]);

  await InventoryItem.create([
    {
      name: "Compressor Oil",
      sku: "AC-CO-002",
      quantity: 18,
      unit: "L",
      location: "Main Warehouse",
      minStock: 10
    },
    {
      name: "Filter Set",
      sku: "HV-FT-010",
      quantity: 6,
      unit: "Box",
      location: "Van Stock",
      minStock: 4
    }
  ]);

  await ServiceHistory.create({
    serviceRequest: requestA._id,
    customer: customers[0]._id,
    notes: "Replaced thermostat sensor and tested cooling cycles.",
    performedBy: technicianA._id,
    visitDate: new Date()
  });

  await Invoice.create({
    customer: customers[0]._id,
    serviceRequest: requestA._id,
    items: [
      { name: "Inspection", quantity: 1, unitPrice: 200 },
      { name: "Thermostat Sensor", quantity: 1, unitPrice: 150 }
    ],
    status: "Draft"
  });

  // eslint-disable-next-line no-console
  console.log("Seed data inserted.");
  process.exit(0);
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed", error);
  process.exit(1);
});
