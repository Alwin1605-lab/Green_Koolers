import express from "express";
import cors from "cors";
import morgan from "morgan";
import "./utils/patchAsyncRoutes.js";
import customersRouter from "./routes/customers.js";
import serviceRequestsRouter from "./routes/serviceRequests.js";
import inventoryRouter from "./routes/inventory.js";
import authRouter from "./routes/auth.js";
import serviceHistoryRouter from "./routes/serviceHistory.js";
import invoicesRouter from "./routes/invoices.js";
import usersRouter from "./routes/users.js";
import inboxRouter from "./routes/inbox.js";
import contactRouter from "./routes/contact.js";
import testEmailRouter from "./routes/testEmail.js";
import { getReadinessStatus } from "./services/healthService.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Global middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((u) => u.trim())
  : [];

app.use(
  cors(
    allowedOrigins.length > 0
      ? {
          origin(origin, cb) {
            // Allow requests with no origin (mobile apps, curl, server-to-server)
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error("Not allowed by CORS"));
          },
          credentials: true
        }
      : {} // Open CORS for local development when FRONTEND_URL is not set
  )
);
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/ready", (req, res) => {
  const readiness = getReadinessStatus();
  if (!readiness.ready) {
    return res.status(503).json(readiness);
  }
  return res.status(200).json(readiness);
});

// REST API routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/customers", customersRouter);
app.use("/api/service-requests", serviceRequestsRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/history", serviceHistoryRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/inbox", inboxRouter);
app.use("/api/contact", contactRouter);
app.use("/api/test-email", testEmailRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
