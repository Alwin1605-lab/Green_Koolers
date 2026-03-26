// dotenv/config must be the FIRST import so env vars are available
import "dotenv/config";

import app from "./app.js";
import { startDatabaseConnection, getDatabaseHealth } from "./config/db.js";
import { startEmailPoller } from "./jobs/emailPoller.js";
import { checkSmtpHealth, checkImapHealth } from "./services/healthService.js";

const PORT = process.env.PORT || 4000;
let pollerStarted = false;

// ✅ Start server (Render-safe)
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  startDatabaseConnection();
});

// ✅ Email poller + health checks (UNCHANGED)
setInterval(() => {
  const db = getDatabaseHealth();
  if (!db.ready) return;
  if (pollerStarted) return;

  pollerStarted = true;

  checkSmtpHealth().then((smtpHealth) => {
    if (!smtpHealth.ready) {
      console.warn(
        `[health] SMTP check status: ${smtpHealth.status}. ${smtpHealth.message}`
      );
    } else {
      console.log("[health] SMTP verified.");
    }
  });

  checkImapHealth().then((imapHealth) => {
    if (!imapHealth.ready) {
      console.warn(
        `[health] IMAP check status: ${imapHealth.status}. ${imapHealth.message}`
      );
    } else {
      console.log("[health] IMAP verified.");
    }
  });

  startEmailPoller();
}, 1500);
