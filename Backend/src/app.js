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

// ✅ CORS configuration
const normalizeOrigin = (value) => value.trim().replace(/\/+$/, "").toLowerCase();

const explicitAllowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
      .map((u) => u.trim())
      .filter(Boolean)
      .map(normalizeOrigin)
  : [];

const builtInAllowedOrigins = [
  "https://green-koolers.vercel.app",
  "https://greenkoolers.vercel.app"
].map(normalizeOrigin);

const builtInAllowedOriginRegexes = [
  /^https:\/\/green-koolers(-[a-z0-9-]+)?\.vercel\.app$/i,
  /^https:\/\/greenkoolers(-[a-z0-9-]+)?\.vercel\.app$/i
];

const envAllowedOriginRegexes = process.env.FRONTEND_URL_REGEX
  ? process.env.FRONTEND_URL_REGEX.split(",")
      .map((pattern) => pattern.trim())
      .filter(Boolean)
      .flatMap((pattern) => {
        try {
          return [new RegExp(pattern, "i")];
        } catch {
          console.warn(`[cors] Ignoring invalid FRONTEND_URL_REGEX pattern: ${pattern}`);
          return [];
        }
      })
  : [];

const allowedOrigins = [...new Set([...explicitAllowedOrigins, ...builtInAllowedOrigins])];
const allowedOriginRegexes = [...builtInAllowedOriginRegexes, ...envAllowedOriginRegexes];

const isAllowedOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalizedOrigin)) return true;
  return allowedOriginRegexes.some((regex) => regex.test(normalizedOrigin));
};

app.use(
  cors({
    origin(origin, cb) {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin || isAllowedOrigin(origin)) return cb(null, true);
      console.warn(`[cors] Blocked origin: ${origin}`);
      return cb(null, false);
    },
    credentials: true
  })
);

// ✅ Middleware
app.use(express.json());
app.use(morgan("dev"));

// ✅ Root route (FIXED - prevents 404 on Render)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Health check routes
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

// ✅ API Routes
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

// ❌ 404 handler
app.use(notFound);

// ❌ Global error handler
app.use(errorHandler);

export default app;
