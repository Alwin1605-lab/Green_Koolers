import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import Customer from "../models/Customer.js";
import ServiceRequest from "../models/ServiceRequest.js";
import InboxEmail from "../models/InboxEmail.js";
import { rankTechnicians, inferCategoryFromText, inferServiceTypeFromText } from "./assignmentEngine.js";
import { sendRequestCreated, sendTechnicianAssigned } from "./emailService.js";
import { isIssueBookingSubject } from "./healthService.js";

// ---------------------------------------------------------------------------
// Build IMAP client config from env vars
// ---------------------------------------------------------------------------
function buildImapConfig() {
  return {
    host: process.env.IMAP_HOST || "",
    port: Number(process.env.IMAP_PORT) || 993,
    secure: process.env.IMAP_SECURE !== "false", // default true
    connectionTimeout: Number(process.env.IMAP_CONNECTION_TIMEOUT_MS) || 15000,
    socketTimeout: Number(process.env.IMAP_SOCKET_TIMEOUT_MS) || 180000,
    authTimeout: Number(process.env.IMAP_AUTH_TIMEOUT_MS) || 15000,
    auth: {
      user: process.env.IMAP_USER || "",
      pass: process.env.IMAP_PASS || ""
    },
    logger: false // suppress imapflow verbose logging
  };
}

let pollInProgress = false;

function formatImapError(error) {
  if (!error) return "Unknown IMAP error";
  const code = error.code ? ` [${error.code}]` : "";
  return `${error.message || "IMAP error"}${code}`;
}

async function safeCloseImapClient(client) {
  if (!client) return;

  try {
    if (client.usable) {
      await client.logout();
      return;
    }
  } catch {
    // ignore
  }

  try {
    client.close();
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Main poll function — called by the cron job every 5 minutes
// ---------------------------------------------------------------------------
export async function pollInbox() {
  if (!process.env.IMAP_HOST || !process.env.IMAP_USER) {
    console.warn("[imapService] IMAP env vars not configured — skipping poll.");
    return;
  }

  if (pollInProgress) {
    console.warn("[imapService] Previous poll still running — skipping overlapping poll.");
    return;
  }

  pollInProgress = true;

  try {
    const messages = [];
    try {
      const mailbox = process.env.IMAP_MAILBOX || "INBOX";
      await withImapClient(async (client) => {
        await client.mailboxOpen(mailbox);

        // Search for unseen messages
        const uids = await client.search({ seen: false });

        if (!uids || uids.length === 0) {
          return;
        }

        for await (const message of client.fetch(uids, { uid: true, source: true })) {
          messages.push({ uid: message.uid, source: message.source });
        }
      });
    } catch (err) {
      console.error("[imapService] IMAP connection error:", formatImapError(err));
      return;
    }

    if (messages.length === 0) {
      console.log("[imapService] No new messages.");
      return;
    }

    console.log(`[imapService] Found ${messages.length} unseen message(s).`);

    const processedUids = [];
    for (const message of messages) {
      try {
        const markSeen = await processMessage(message);
        if (markSeen) processedUids.push(message.uid);
      } catch (err) {
        console.error("[imapService] Error processing message:", formatImapError(err));
      }
    }

    if (processedUids.length > 0) {
      try {
        await markMessagesSeen(processedUids);
      } catch (err) {
        console.error("[imapService] Failed to mark messages as seen:", formatImapError(err));
      }
    }

    console.log(`[imapService] Poll complete. Processed: ${processedUids.length}/${messages.length}.`);
  } finally {
    pollInProgress = false;
  }
}

// ---------------------------------------------------------------------------
// Process a single IMAP message
// ---------------------------------------------------------------------------
async function processMessage(message) {
  // Parse the raw email source
  const parsed = await simpleParser(message.source);

  const messageId = parsed.messageId || `generated-${Date.now()}-${Math.random()}`;
  const fromAddress = parsed.from?.value?.[0]?.address || "";
  const fromName = parsed.from?.value?.[0]?.name || "";
  const subject = parsed.subject || "(no subject)";
  const bodyText = parsed.text || "";
  const bodyHtml = parsed.html || "";
  const receivedAt = parsed.date || new Date();

  // Dedup — skip if already in DB
  const existing = await InboxEmail.findOne({ messageId });
  if (existing) {
    return true;
  }

  // Infer category and service type from email content
  const combinedText = `${subject} ${bodyText}`;
  const inferredCategory = inferCategoryFromText(combinedText);
  const inferredServiceType = inferServiceTypeFromText(combinedText);

  // Look up customer by email address
  const matchedCustomer = fromAddress
    ? await Customer.findOne({ email: fromAddress.toLowerCase() })
    : null;

  let serviceRequest = null;
  let status = "unread";
  const eligibleForAutoRequest = Boolean(matchedCustomer) && isIssueBookingSubject(subject);

  if (eligibleForAutoRequest) {
    // -----------------------------------------------------------------------
    // Known customer: auto-create a service request
    // -----------------------------------------------------------------------
    try {
      // AI assign best technician
      const ranked = await rankTechnicians({
        category: inferredCategory,
        customerId: matchedCustomer._id
      });

      const bestMatch = ranked[0] || null;
      const resolvedTechnician = bestMatch?.technician?._id || null;

      serviceRequest = await ServiceRequest.create({
        customer: matchedCustomer._id,
        category: inferredCategory,
        serviceType: inferredServiceType,
        description: `[Auto-created from email]\n\nSubject: ${subject}\n\n${bodyText.slice(0, 2000)}`,
        status: resolvedTechnician ? "Assigned" : "Requested",
        priority: "medium",
        scheduledDate: null,
        assignedTechnician: resolvedTechnician,
        assignedAt: resolvedTechnician ? new Date() : null,
        notes: []
      });

      const populatedRequest = await ServiceRequest.findById(serviceRequest._id)
        .populate("customer")
        .populate("assignedTechnician", "name email role phone age experienceYears rating availability photoUrl specialties bio");

      // Send confirmation email to customer
      await sendRequestCreated(populatedRequest, matchedCustomer);

      // Send assignment email if technician assigned
      if (resolvedTechnician && bestMatch) {
        await sendTechnicianAssigned(
          populatedRequest,
          matchedCustomer,
          bestMatch.technician,
          { explanation: bestMatch.explanation }
        );
      }

      status = "auto-processed";
      console.log(`[imapService] Auto-created service request for customer ${matchedCustomer.name} (${fromAddress}).`);
    } catch (err) {
      console.error("[imapService] Failed to auto-create service request:", err.message);
      status = "unread"; // Fall back to manual review
    }
  } else {
    if (!matchedCustomer) {
      console.log(`[imapService] No customer match for ${fromAddress} — saving for manual review.`);
      status = "unread";
    } else {
      console.log(`[imapService] Ignoring auto-request for ${fromAddress}; subject not marked as issue booking.`);
      status = "read";
    }
  }

  // Save to InboxEmail collection
  await InboxEmail.create({
    messageId,
    from: { name: fromName, address: fromAddress },
    subject,
    bodyText: bodyText.slice(0, 10000), // cap stored text
    bodyHtml: bodyHtml.slice(0, 50000),
    receivedAt,
    processed: status === "auto-processed",
    serviceRequest: serviceRequest?._id || null,
    matchedCustomer: matchedCustomer?._id || null,
    inferredCategory,
    inferredServiceType,
    status
  });

  return true;
}

async function withImapClient(work) {
  const client = new ImapFlow(buildImapConfig());
  client.on("error", (error) => {
    console.error("[imapService] IMAP runtime error:", formatImapError(error));
  });

  try {
    await client.connect();
    console.log("[imapService] Connected to IMAP server.");
    return await work(client);
  } finally {
    await safeCloseImapClient(client);
  }
}

async function markMessagesSeen(uids) {
  if (!uids.length) return;
  const mailbox = process.env.IMAP_MAILBOX || "INBOX";

  await withImapClient(async (client) => {
    await client.mailboxOpen(mailbox);
    await client.messageFlagsAdd(uids, ["\\Seen"], { uid: true });
  });
}
