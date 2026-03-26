import "dotenv/config";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "../src/config/db.js";
import User from "../src/models/User.js";

const employees = [
  { designation: "Admin", name: "Tulasi mani", phone: "9750077088", experienceYears: 3, role: "admin", department: "Administration" },
  { designation: "Accountant", name: "Abdul jaffer sadique", phone: "9750077099", experienceYears: 4, role: "staff", department: "Accounts" },
  { designation: "Stores Manager", name: "Store Manager", phone: "", experienceYears: 7, role: "staff", department: "Stores" },
  { designation: "Project Manager", name: "Dinesh Kumar", phone: "9750088088", experienceYears: 5, role: "staff", department: "Projects" },
  { designation: "Service Manager", name: "Viju", phone: "9842713050", experienceYears: 12, role: "staff", department: "Service" },
  { designation: "Marketing Manager", name: "Prasath", phone: "99943601583", experienceYears: 8, role: "staff", department: "Marketing" },
  { designation: "Assistant Marketing", name: "Senthil Kumar", phone: "9845678990", experienceYears: 1, role: "staff", department: "Marketing" },
  { designation: "Assistant Marketing", name: "Divya", phone: "9845453990", experienceYears: 1, role: "staff", department: "Marketing" },
  { designation: "Service Person", name: "Kathir", phone: "", experienceYears: 0, role: "technician", department: "Field Service" },
  { designation: "Service Person", name: "Uthaanduraman", phone: "", experienceYears: 0, role: "technician", department: "Field Service" },
  { designation: "Service Person", name: "Karthi", phone: "", experienceYears: 0, role: "technician", department: "Field Service" },
  { designation: "Service Person", name: "Dinesh", phone: "", experienceYears: 0, role: "technician", department: "Field Service" },
  { designation: "Service Person", name: "Selva", phone: "", experienceYears: 0, role: "technician", department: "Field Service" },
  { designation: "Service Person", name: "Pradeep", phone: "", experienceYears: 0, role: "technician", department: "Field Service" },
  { designation: "Service Person", name: "Suresh", phone: "", experienceYears: 0, role: "technician", department: "Field Service" },
  { designation: "Service Person", name: "Mani", phone: "", experienceYears: 0, role: "technician", department: "Field Service" },
  { designation: "Service Person", name: "Murugappa", phone: "", experienceYears: 0, role: "technician", department: "Field Service" },
  { designation: "Service Person", name: "Ganesh", phone: "", experienceYears: 0, role: "technician", department: "Field Service" },
  { designation: "Service Person", name: "Moorthi", phone: "", experienceYears: 0, role: "technician", department: "Field Service" },
  { designation: "Service Person", name: "Velu", phone: "", experienceYears: 0, role: "technician", department: "Field Service" },
  { designation: "Training", name: "Bala", phone: "", experienceYears: 0, role: "staff", department: "Training" },
  { designation: "Training", name: "Thiyagu", phone: "", experienceYears: 0, role: "staff", department: "Training" }
];

function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, ".");
}

function generateUniqueEmail(baseName, name, usedEmails, existingByEmail) {
  const localBase = slugifyName(baseName) || "employee";
  let candidate = `${localBase}@gmail.com`;
  let counter = 2;

  while (true) {
    const existing = existingByEmail.get(candidate);
    const inUseByBatch = usedEmails.has(candidate);
    const reusableForSamePerson = existing && existing.name.toLowerCase() === name.toLowerCase();
    if (!inUseByBatch && (!existing || reusableForSamePerson)) {
      break;
    }
    candidate = `${localBase}${counter}@gmail.com`;
    counter += 1;
  }

  usedEmails.add(candidate);
  return candidate;
}

function generateTempPassword() {
  return crypto.randomBytes(9).toString("base64url");
}

async function run() {
  await connectDatabase();

  const existingUsers = await User.find({}, "name email");
  const existingByEmail = new Map(existingUsers.map((u) => [u.email, u]));
  const usedEmails = new Set();

  const credentials = [];

  for (const employee of employees) {
    const name = (employee.name || employee.designation || "Employee").trim();
    const email = generateUniqueEmail(name, name, usedEmails, existingByEmail);
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const payload = {
      name,
      email,
      role: employee.role,
      phone: employee.phone || "",
      experienceYears: Number.isFinite(employee.experienceYears) ? employee.experienceYears : 0,
      department: employee.department || employee.designation || "",
      specialization: employee.designation || "",
      mustChangePassword: true,
      profileCompleted: false,
      passwordHash,
      availability: employee.role === "technician" ? "Available" : "",
      rating: employee.role === "technician" ? 4 : 0,
      specialties: employee.role === "technician" ? ["General Service"] : []
    };

    const user = await User.findOneAndUpdate(
      { email },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    existingByEmail.set(email, user);

    credentials.push({
      designation: employee.designation,
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone,
      experienceYears: user.experienceYears,
      temporaryPassword: tempPassword
    });
  }

  const mdLines = [
    "# Employee Accounts (Temporary Passwords)",
    "",
    "Rotate these passwords after first login.",
    "",
    "| Name | Designation | Role | Email | Phone | Experience | Temporary Password |",
    "|---|---|---|---|---|---:|---|"
  ];

  for (const c of credentials) {
    mdLines.push(
      `| ${c.name} | ${c.designation} | ${c.role} | ${c.email} | ${c.phone || ""} | ${c.experienceYears} | ${c.temporaryPassword} |`
    );
  }

  const outputPath = path.resolve(process.cwd(), "EMPLOYEE_CREDENTIALS.md");
  await fs.writeFile(outputPath, `${mdLines.join("\n")}\n`, "utf8");

  process.stdout.write(`${JSON.stringify({ count: credentials.length, credentials }, null, 2)}\n`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((error) => {
  console.error("Employee provisioning failed", error);
  mongoose.disconnect().catch(() => {});
  process.exit(1);
});
