import { Router } from "express";
import nodemailer from "nodemailer";

const router = Router();

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

// POST /api/contact — public contact form submission
router.post("/", async (req, res) => {
  const { name, email, phone, company, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "name, email, subject, and message are required" });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    try {
      const transporter = getTransporter();
      if (transporter) {
        const bodyLines = [
          "New contact form submission from the Green Koolers website.",
          "",
          "Name:    " + name,
          "Email:   " + email,
          phone ? "Phone:   " + phone : null,
          company ? "Company: " + company : null,
          "",
          "Subject: " + subject,
          "",
          "Message:",
          message
        ].filter((l) => l !== null).join("\n");

        await transporter.sendMail({
          from: process.env.SMTP_FROM || adminEmail,
          to: adminEmail,
          replyTo: email,
          subject: "[Contact Form] " + subject,
          text: bodyLines
        });
      }
    } catch (err) {
      // Non-fatal — log and continue
      console.error("[contact] Email send error:", err.message);
    }
  }

  return res.status(200).json({ message: "Message received. We will be in touch shortly." });
});

export default router;