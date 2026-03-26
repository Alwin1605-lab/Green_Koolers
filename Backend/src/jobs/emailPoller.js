import cron from "node-cron";
import { pollInbox } from "../services/imapService.js";

// Poll every 5 minutes: minute 0,5,10,...
const CRON_SCHEDULE = "*/5 * * * *";
let pollRunInProgress = false;

async function runPoll(trigger) {
  if (pollRunInProgress) {
    console.warn(`[emailPoller] Skipping ${trigger} poll because previous run is still in progress.`);
    return;
  }

  pollRunInProgress = true;
  try {
    await pollInbox();
  } catch (err) {
    console.error(`[emailPoller] ${trigger} poll error:`, err.message);
  } finally {
    pollRunInProgress = false;
  }
}

export function startEmailPoller() {
  if (!process.env.IMAP_HOST || !process.env.IMAP_USER) {
    console.warn("[emailPoller] IMAP not configured — poller will not start.");
    return;
  }

  console.log("[emailPoller] Starting IMAP polling job (every 5 minutes).");

  // Run once immediately on start
  void runPoll("initial");

  // Then run on schedule
  cron.schedule(CRON_SCHEDULE, () => {
    console.log("[emailPoller] Running scheduled IMAP poll...");
    void runPoll("scheduled");
  });
}
