import nodemailer from "nodemailer";

const COMPANY_NAME = "Green Koolers";
const COMPANY_EMAIL = process.env.SMTP_FROM || `"Green Koolers" <noreply@greenkoolers.com>`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const APP_URL = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")[0].trim()
  : "http://localhost:5173";

// ---------------------------------------------------------------------------
// Transporter — created lazily so missing env vars don't crash the server
// ---------------------------------------------------------------------------
let _transporter = null;
let _etherealUrl = null;

async function getTransporter() {
  if (_transporter) return _transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log(`[emailService] SMTP configured — ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}`);
    return _transporter;
  }

  // Dev/test mode: auto-create Ethereal account for capturing test emails
  if (process.env.NODE_ENV !== "production") {
    try {
      const testAccount = await nodemailer.createTestAccount();
      _transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      _etherealUrl = "https://ethereal.email/login";
      console.log("[emailService] Ethereal test account created:");
      console.log(`  User: ${testAccount.user}`);
      console.log(`  Pass: ${testAccount.pass}`);
      console.log(`  View emails: ${_etherealUrl}`);
      return _transporter;
    } catch (err) {
      console.warn("[emailService] Failed to create Ethereal account:", err.message);
      return null;
    }
  }

  console.warn("[emailService] SMTP env vars not configured — email sending disabled.");
  return null;
}

// ---------------------------------------------------------------------------
// Core send helper — fire-and-forget, never throws
// ---------------------------------------------------------------------------
async function send({ to, subject, html }) {
  const transporter = await getTransporter();
  if (!transporter) return;
  if (!to) return;

  try {
    const info = await transporter.sendMail({
      from: COMPANY_EMAIL,
      to,
      subject,
      html
    });
    console.log(`[emailService] Sent "${subject}" to ${to}`);

    // Show Ethereal preview URL in dev mode
    if (_etherealUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[emailService] Preview: ${previewUrl}`);
      }
    }
  } catch (err) {
    console.error(`[emailService] Failed to send "${subject}" to ${to}:`, err.message);
  }
}

export async function sendWelcomeEmail(user) {
  const to = user?.email;
  if (!to) return;

  const portalPath =
    user.role === "customer"
      ? "/login/customer"
      : "/login/staff";

  const html = layout(`
    <p>Hi <strong>${user?.name || "there"}</strong>,</p>
    <p>Welcome to <strong>${COMPANY_NAME}</strong>! Your account has been created successfully.</p>
    <div class="info-box">
      <div class="row"><span class="label">Portal</span><span class="value">${user?.role || "User"}</span></div>
      <div class="row"><span class="label">Login Email</span><span class="value">${to}</span></div>
      <div class="row"><span class="label">Support</span><span class="value">${ADMIN_EMAIL || "support@greenkoolers.com"}</span></div>
    </div>
    <p>At Green Koolers you can book service issues, track technician assignments, and monitor issue completion from one dashboard.</p>
    <p class="cta"><a href="${APP_URL}${portalPath}">Go to your portal</a></p>
  `);

  await send({
    to,
    subject: `[${COMPANY_NAME}] Welcome to Green Koolers`,
    html
  });
}

// ---------------------------------------------------------------------------
// Shared HTML layout wrapper
// ---------------------------------------------------------------------------
function layout(bodyContent) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f1f5f9; font-family: Arial, sans-serif; }
    .wrapper { max-width:600px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
    .header { background:#059669; padding:28px 32px; }
    .header h1 { margin:0; color:#ffffff; font-size:20px; font-weight:700; }
    .header p  { margin:4px 0 0; color:#a7f3d0; font-size:13px; }
    .body { padding:28px 32px; color:#1e293b; }
    .body p { font-size:15px; line-height:1.6; margin:0 0 16px; }
    .info-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px 20px; margin:20px 0; }
    .info-box .row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #e2e8f0; font-size:14px; }
    .info-box .row:last-child { border-bottom:none; }
    .info-box .label { color:#64748b; font-weight:600; }
    .info-box .value { color:#0f172a; text-align:right; max-width:55%; }
    .badge { display:inline-block; padding:4px 12px; border-radius:99px; font-size:12px; font-weight:700; }
    .badge-blue { background:#dbeafe; color:#1d4ed8; }
    .badge-amber { background:#fef3c7; color:#b45309; }
    .badge-green { background:#d1fae5; color:#065f46; }
    .badge-red { background:#fee2e2; color:#b91c1c; }
    .tech-card { background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:16px 20px; margin:20px 0; }
    .tech-card h3 { margin:0 0 8px; font-size:16px; color:#065f46; }
    .tech-card p  { margin:3px 0; font-size:13px; color:#047857; }
    .score-bar-wrap { margin-top:12px; }
    .score-label { font-size:12px; color:#64748b; margin-bottom:3px; display:flex; justify-content:space-between; }
    .score-bar-bg { background:#e2e8f0; border-radius:99px; height:6px; }
    .score-bar-fill { background:#059669; border-radius:99px; height:6px; }
    .cta { margin:24px 0 0; }
    .cta a { display:inline-block; background:#059669; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-size:14px; font-weight:700; }
    .footer { padding:16px 32px; background:#f8fafc; border-top:1px solid #e2e8f0; font-size:12px; color:#94a3b8; text-align:center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${COMPANY_NAME}</h1>
      <p>Professional HVAC &amp; Refrigeration Solutions</p>
    </div>
    <div class="body">${bodyContent}</div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.<br/>
      This is an automated message — please do not reply directly to this email.
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 1. Request Created
// ---------------------------------------------------------------------------
export async function sendRequestCreated(serviceRequest, customer) {
  const to = customer?.email;
  const subject = `[${COMPANY_NAME}] Service Request Received — #${serviceRequest._id.toString().slice(-6).toUpperCase()}`;

  const html = layout(`
    <p>Hi <strong>${customer?.name || "Valued Customer"}</strong>,</p>
    <p>We have received your service request. Our team will review it and assign a technician shortly.</p>
    <div class="info-box">
      <div class="row"><span class="label">Reference</span><span class="value">#${serviceRequest._id.toString().slice(-6).toUpperCase()}</span></div>
      <div class="row"><span class="label">Category</span><span class="value">${serviceRequest.category}</span></div>
      <div class="row"><span class="label">Service Type</span><span class="value">${serviceRequest.serviceType}</span></div>
      <div class="row"><span class="label">Priority</span><span class="value">${serviceRequest.priority || "medium"}</span></div>
      <div class="row"><span class="label">Scheduled Date</span><span class="value">${serviceRequest.scheduledDate ? new Date(serviceRequest.scheduledDate).toDateString() : "To be confirmed"}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="badge badge-blue">Received</span></span></div>
    </div>
    ${serviceRequest.description ? `<p><strong>Description:</strong> ${serviceRequest.description}</p>` : ""}
    <p>Your issue ID is <strong>#${serviceRequest._id.toString().slice(-6).toUpperCase()}</strong>. We will notify you once a technician is assigned.</p>
    <p>Thank you for choosing ${COMPANY_NAME}.</p>
  `);

  await send({ to, subject, html });
}

// ---------------------------------------------------------------------------
// 2. Technician Assigned — sent to both customer and technician
// ---------------------------------------------------------------------------
export async function sendTechnicianAssigned(serviceRequest, customer, technician, assignmentReason) {
  const ref = `#${serviceRequest._id.toString().slice(-6).toUpperCase()}`;

  // Email to customer
  const customerHtml = layout(`
    <p>Hi <strong>${customer?.name || "Valued Customer"}</strong>,</p>
    <p>Great news! A technician has been assigned to your service request <strong>${ref}</strong>.</p>
    <div class="info-box">
      <div class="row"><span class="label">Category</span><span class="value">${serviceRequest.category}</span></div>
      <div class="row"><span class="label">Service Type</span><span class="value">${serviceRequest.serviceType}</span></div>
      <div class="row"><span class="label">Scheduled Date</span><span class="value">${serviceRequest.scheduledDate ? new Date(serviceRequest.scheduledDate).toDateString() : "To be confirmed"}</span></div>
    </div>
    <div class="tech-card">
      <h3>Your Assigned Technician</h3>
      <p><strong>Name:</strong> ${technician?.name || "N/A"}</p>
      ${technician?.phone ? `<p><strong>Phone:</strong> ${technician.phone}</p>` : ""}
      ${technician?.email ? `<p><strong>Email:</strong> ${technician.email}</p>` : ""}
      ${technician?.experienceYears ? `<p><strong>Experience:</strong> ${technician.experienceYears} years</p>` : ""}
      ${technician?.rating ? `<p><strong>Rating:</strong> ${technician.rating.toFixed(1)} / 5.0</p>` : ""}
      ${technician?.specialties?.length ? `<p><strong>Specialties:</strong> ${technician.specialties.join(", ")}</p>` : ""}
      ${assignmentReason?.explanation ? `<p style="margin-top:10px;font-size:12px;color:#047857;"><em>Why this technician: ${assignmentReason.explanation}</em></p>` : ""}
    </div>
    <p>Your technician will contact you to confirm the visit. Thank you for choosing ${COMPANY_NAME}.</p>
  `);

  await send({
    to: customer?.email,
    subject: `[${COMPANY_NAME}] Technician Assigned to Your Request ${ref}`,
    html: customerHtml
  });

  // Email to technician
  if (technician?.email) {
    const techHtml = layout(`
      <p>Hi <strong>${technician.name}</strong>,</p>
      <p>You have been assigned a new service request. Please review the details below.</p>
      <div class="info-box">
        <div class="row"><span class="label">Reference</span><span class="value">${ref}</span></div>
        <div class="row"><span class="label">Customer</span><span class="value">${customer?.name || "N/A"}</span></div>
        <div class="row"><span class="label">Customer Phone</span><span class="value">${customer?.phone || "N/A"}</span></div>
        <div class="row"><span class="label">Customer Address</span><span class="value">${customer?.address || "N/A"}</span></div>
        <div class="row"><span class="label">Category</span><span class="value">${serviceRequest.category}</span></div>
        <div class="row"><span class="label">Service Type</span><span class="value">${serviceRequest.serviceType}</span></div>
        <div class="row"><span class="label">Priority</span><span class="value">${serviceRequest.priority || "medium"}</span></div>
        <div class="row"><span class="label">Scheduled Date</span><span class="value">${serviceRequest.scheduledDate ? new Date(serviceRequest.scheduledDate).toDateString() : "To be confirmed"}</span></div>
      </div>
      ${serviceRequest.description ? `<p><strong>Description:</strong> ${serviceRequest.description}</p>` : ""}
      <p>Please log in to the technician portal to view and update the task status.</p>
    `);

    await send({
      to: technician.email,
      subject: `[${COMPANY_NAME}] New Assignment ${ref} — ${serviceRequest.category}`,
      html: techHtml
    });
  }
}

// ---------------------------------------------------------------------------
// 3. Status Changed
// ---------------------------------------------------------------------------
export async function sendStatusChanged(serviceRequest, customer, newStatus) {
  const to = customer?.email;
  if (!to) return;

  const ref = `#${serviceRequest._id.toString().slice(-6).toUpperCase()}`;

  const statusMessages = {
    "In Progress": {
      badge: `<span class="badge badge-amber">In Progress</span>`,
      body: "Your technician has arrived and work has begun on your service request."
    },
    Completed: {
      badge: `<span class="badge badge-green">Completed</span>`,
      body: "Your service has been marked as completed. Please confirm if the issue is fully resolved and share your review."
    },
    Cancelled: {
      badge: `<span class="badge badge-red">Cancelled</span>`,
      body: "Your service request has been cancelled. If you believe this is an error, please contact us."
    }
  };

  const info = statusMessages[newStatus];
  if (!info) return; // Don't send email for other status transitions

  const html = layout(`
    <p>Hi <strong>${customer?.name || "Valued Customer"}</strong>,</p>
    <p>${info.body}</p>
    <div class="info-box">
      <div class="row"><span class="label">Reference</span><span class="value">${ref}</span></div>
      <div class="row"><span class="label">Category</span><span class="value">${serviceRequest.category}</span></div>
      <div class="row"><span class="label">Service Type</span><span class="value">${serviceRequest.serviceType}</span></div>
      <div class="row"><span class="label">Status</span><span class="value">${info.badge}</span></div>
      ${newStatus === "Completed" ? `<div class="row"><span class="label">Completed On</span><span class="value">${new Date().toDateString()}</span></div>` : ""}
    </div>
    ${newStatus === "Completed" ? `<p class="cta"><a href="${APP_URL}/customer/bookings?review=${serviceRequest._id}">Confirm resolution & leave a review</a></p>` : ""}
    <p>Thank you for choosing ${COMPANY_NAME}. We look forward to serving you again.</p>
  `);

  await send({
    to,
    subject: `[${COMPANY_NAME}] Service Request ${ref} — ${newStatus}`,
    html
  });
}

export async function sendIssueSolvedReviewRequest(serviceRequest, customer) {
  const to = customer?.email;
  if (!to) return;

  const ref = `#${serviceRequest._id.toString().slice(-6).toUpperCase()}`;
  const html = layout(`
    <p>Hi <strong>${customer?.name || "Valued Customer"}</strong>,</p>
    <p>Your issue <strong>${ref}</strong> is marked as completed by our team.</p>
    <div class="info-box">
      <div class="row"><span class="label">Issue ID</span><span class="value">${ref}</span></div>
      <div class="row"><span class="label">Category</span><span class="value">${serviceRequest.category}</span></div>
      <div class="row"><span class="label">Service Type</span><span class="value">${serviceRequest.serviceType}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="badge badge-green">Completed</span></span></div>
    </div>
    <p>Could you please confirm if the issue is solved and share your review?</p>
    <p class="cta"><a href="${APP_URL}/customer/bookings?review=${serviceRequest._id}">Confirm & Leave Review</a></p>
  `);

  await send({
    to,
    subject: `[${COMPANY_NAME}] Issue ${ref} completed - please confirm and review`,
    html
  });
}

// ---------------------------------------------------------------------------
// 4. Invoice Sent
// ---------------------------------------------------------------------------
export async function sendInvoiceSent(invoice, customer) {
  const to = customer?.email;
  if (!to) return;

  const ref = `#${invoice._id.toString().slice(-6).toUpperCase()}`;
  const total = (invoice.items || []).reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  const itemsHtml = (invoice.items || [])
    .map(
      (item) => `
      <div class="row">
        <span class="label">${item.name} × ${item.quantity}</span>
        <span class="value">AED ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}</span>
      </div>`
    )
    .join("");

  const html = layout(`
    <p>Hi <strong>${customer?.name || "Valued Customer"}</strong>,</p>
    <p>Please find your invoice from ${COMPANY_NAME} below.</p>
    <div class="info-box">
      <div class="row"><span class="label">Invoice</span><span class="value">${ref}</span></div>
      <div class="row"><span class="label">Issue Date</span><span class="value">${invoice.issueDate ? new Date(invoice.issueDate).toDateString() : new Date().toDateString()}</span></div>
      ${itemsHtml}
      <div class="row" style="font-weight:700;"><span class="label">Total</span><span class="value">AED ${total.toFixed(2)}</span></div>
    </div>
    <p>Please arrange payment at your earliest convenience. If you have any questions, reply to this email or contact our support team.</p>
    <p>Thank you for your business.</p>
  `);

  await send({
    to,
    subject: `[${COMPANY_NAME}] Invoice ${ref} — AED ${total.toFixed(2)}`,
    html
  });
}

// ---------------------------------------------------------------------------
// 5. Admin Alert — for high / urgent priority requests
// ---------------------------------------------------------------------------
export async function sendAdminAlert(serviceRequest, customer) {
  const to = ADMIN_EMAIL;
  if (!to) return;

  const ref = `#${serviceRequest._id.toString().slice(-6).toUpperCase()}`;
  const priorityBadge =
    serviceRequest.priority === "urgent"
      ? `<span class="badge badge-red">URGENT</span>`
      : `<span class="badge badge-amber">HIGH</span>`;

  const html = layout(`
    <p>A <strong>${serviceRequest.priority?.toUpperCase()}</strong> priority service request has been submitted and requires immediate attention.</p>
    <div class="info-box">
      <div class="row"><span class="label">Reference</span><span class="value">${ref}</span></div>
      <div class="row"><span class="label">Priority</span><span class="value">${priorityBadge}</span></div>
      <div class="row"><span class="label">Customer</span><span class="value">${customer?.name || "N/A"}</span></div>
      <div class="row"><span class="label">Customer Phone</span><span class="value">${customer?.phone || "N/A"}</span></div>
      <div class="row"><span class="label">Category</span><span class="value">${serviceRequest.category}</span></div>
      <div class="row"><span class="label">Service Type</span><span class="value">${serviceRequest.serviceType}</span></div>
      <div class="row"><span class="label">Scheduled Date</span><span class="value">${serviceRequest.scheduledDate ? new Date(serviceRequest.scheduledDate).toDateString() : "Not set"}</span></div>
    </div>
    ${serviceRequest.description ? `<p><strong>Description:</strong> ${serviceRequest.description}</p>` : ""}
    <p>Please log in to the admin portal to review and action this request immediately.</p>
  `);

  await send({
    to,
    subject: `[ALERT] ${serviceRequest.priority?.toUpperCase()} Service Request ${ref} — ${serviceRequest.category}`,
    html
  });
}

// ---------------------------------------------------------------------------
// Exported helpers for test-email route
// ---------------------------------------------------------------------------
export { getTransporter, _etherealUrl };
