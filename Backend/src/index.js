// dotenv/config must be the FIRST import so env vars are available
// to all subsequent module-level code (ESM hoists imports).
import "dotenv/config";
import app from "./app.js";
import { startDatabaseConnection, getDatabaseHealth } from "./config/db.js";
import { startEmailPoller } from "./jobs/emailPoller.js";
import { checkSmtpHealth, checkImapHealth } from "./services/healthService.js";

const DEFAULT_PORT = Number(process.env.PORT) || 4000;
let pollerStarted = false;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
    startDatabaseConnection();
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = port + 1;
      console.warn(`[server] Port ${port} is in use. Retrying on ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    throw error;
  });
};

startServer(DEFAULT_PORT);

setInterval(() => {
  const db = getDatabaseHealth();
  if (!db.ready) return;
  if (pollerStarted) return;

  pollerStarted = true;

  checkSmtpHealth().then((smtpHealth) => {
    if (!smtpHealth.ready) {
      console.warn(`[health] SMTP check status: ${smtpHealth.status}. ${smtpHealth.message}`);
    } else {
      console.log("[health] SMTP verified.");
    }
  });

  checkImapHealth().then((imapHealth) => {
    if (!imapHealth.ready) {
      console.warn(`[health] IMAP check status: ${imapHealth.status}. ${imapHealth.message}`);
    } else {
      console.log("[health] IMAP verified.");
    }
  });

  startEmailPoller();
}, 1500);
