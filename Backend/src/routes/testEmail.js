import { Router } from "express";
import nodemailer from "nodemailer";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getTransporter, _etherealUrl } from "../services/emailService.js";

const router = Router();

// GET /api/test-email — admin only, sends a test email
router.get("/", requireAuth, requireRole(["admin"]), async (req, res) => {
  try {
    const transporter = await getTransporter();

    if (!transporter) {
      return res.status(503).json({
        success: false,
        message: "SMTP is not configured and Ethereal fallback failed — set SMTP_HOST and SMTP_USER in .env"
      });
    }

    const recipient = process.env.ADMIN_EMAIL || "test@example.com";

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || '"Green Koolers" <noreply@greenkoolers.com>',
      to: recipient,
      subject: "[Green Koolers] SMTP Test Email",
      html: `<h2>SMTP Test Successful</h2>
             <p>SMTP is configured and working correctly.</p>
             <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
             <p><strong>To:</strong> ${recipient}</p>`
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    return res.json({
      success: true,
      message: `Test email sent to ${recipient}`,
      previewUrl: previewUrl || null,
      ethereal: _etherealUrl ? true : false,
      smtp: {
        host: process.env.SMTP_HOST || "ethereal (auto)",
        port: process.env.SMTP_PORT || "587",
        user: process.env.SMTP_USER || "ethereal (auto)"
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: err.message
    });
  }
});

export default router;
