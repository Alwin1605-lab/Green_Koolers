import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";
import { getDatabaseHealth } from "../config/db.js";

let smtpHealth = {
  checkedAt: null,
  ready: false,
  status: "not_checked",
  message: "SMTP has not been checked yet"
};

let imapHealth = {
  checkedAt: null,
  ready: false,
  status: "not_checked",
  message: "IMAP has not been checked yet"
};

function getSmtpConfig() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;

  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };
}

function getImapConfig() {
  if (!process.env.IMAP_HOST || !process.env.IMAP_USER) return null;

  return {
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT) || 993,
    secure: process.env.IMAP_SECURE !== "false",
    connectionTimeout: Number(process.env.IMAP_CONNECTION_TIMEOUT_MS) || 15000,
    socketTimeout: Number(process.env.IMAP_SOCKET_TIMEOUT_MS) || 180000,
    authTimeout: Number(process.env.IMAP_AUTH_TIMEOUT_MS) || 15000,
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASS
    },
    logger: false
  };
}

export function isIssueBookingSubject(subject = "") {
  const normalized = subject.toLowerCase();
  const patterns = [
    /issue\s*report/,
    /issue\s*booking/,
    /book(ing)?\s*(an\s*)?(issue|service)/,
    /service\s*request/
  ];
  return patterns.some((pattern) => pattern.test(normalized));
}

export async function checkSmtpHealth() {
  const config = getSmtpConfig();

  if (!config) {
    smtpHealth = {
      checkedAt: new Date().toISOString(),
      ready: false,
      status: "not_configured",
      message: "SMTP env vars are missing"
    };
    return smtpHealth;
  }

  try {
    const transporter = nodemailer.createTransport(config);
    await transporter.verify();
    smtpHealth = {
      checkedAt: new Date().toISOString(),
      ready: true,
      status: "ok",
      message: "SMTP connection verified"
    };
  } catch (error) {
    smtpHealth = {
      checkedAt: new Date().toISOString(),
      ready: false,
      status: "degraded",
      message: error.message || "SMTP verification failed"
    };
  }

  return smtpHealth;
}

export async function checkImapHealth() {
  const config = getImapConfig();

  if (!config) {
    imapHealth = {
      checkedAt: new Date().toISOString(),
      ready: false,
      status: "not_configured",
      message: "IMAP env vars are missing"
    };
    return imapHealth;
  }

  const client = new ImapFlow(config);
  client.on("error", (error) => {
    console.error("[health] IMAP runtime error:", error.message);
  });
  try {
    await client.connect();
    await client.mailboxOpen(process.env.IMAP_MAILBOX || "INBOX");
    await client.logout();
    imapHealth = {
      checkedAt: new Date().toISOString(),
      ready: true,
      status: "ok",
      message: "IMAP connection verified"
    };
  } catch (error) {
    try {
      await client.logout();
    } catch {
      // ignore
    }
    imapHealth = {
      checkedAt: new Date().toISOString(),
      ready: false,
      status: "degraded",
      message: error.message || "IMAP verification failed"
    };
  }

  return imapHealth;
}

export function getReadinessStatus() {
  const db = getDatabaseHealth();
  const ready = db.ready;

  return {
    ready,
    status: ready ? "ready" : "not_ready",
    checks: {
      database: db,
      smtp: smtpHealth,
      imap: imapHealth
    }
  };
}
