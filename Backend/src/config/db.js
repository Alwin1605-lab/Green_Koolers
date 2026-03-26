import mongoose from "mongoose";

const DEFAULT_DB_NAME = "consultancy";
const RETRY_DELAY_MS = Number(process.env.DB_RETRY_DELAY_MS) || 10000;

let reconnectTimer = null;
let connecting = false;
let connectionInitialized = false;

function ensureDatabaseName(uri) {
  if (!uri || !/^mongodb(\+srv)?:\/\//.test(uri)) return uri;

  const [withoutQuery, queryString] = uri.split("?");
  const schemeIdx = withoutQuery.indexOf("://");
  const slashAfterHost = withoutQuery.indexOf("/", schemeIdx + 3);

  let normalized = withoutQuery;

  if (slashAfterHost === -1) {
    normalized = `${withoutQuery}/${DEFAULT_DB_NAME}`;
  } else {
    const path = withoutQuery.slice(slashAfterHost);
    if (path === "/") {
      normalized = `${withoutQuery}${DEFAULT_DB_NAME}`;
    }
  }

  if (normalized !== withoutQuery) {
    console.warn(`[db] MONGO_URI had no database name. Using "${DEFAULT_DB_NAME}".`);
  }

  return queryString ? `${normalized}?${queryString}` : normalized;
}

export async function connectDatabase() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/consultancy";
  const normalizedUri = ensureDatabaseName(uri);
  mongoose.set("strictQuery", true);
  mongoose.set("bufferCommands", false);
  await mongoose.connect(normalizedUri, {
    serverSelectionTimeoutMS: 8000
  });
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void attemptConnect();
  }, RETRY_DELAY_MS);
}

async function attemptConnect() {
  if (connecting || mongoose.connection.readyState === 1) return;
  connecting = true;
  try {
    await connectDatabase();
    console.log("[db] Connected.");
  } catch (error) {
    const message = error?.message || "Unknown database error";
    console.error(`[db] Connection failed. Retrying in ${Math.round(RETRY_DELAY_MS / 1000)}s. ${message}`);
    scheduleReconnect();
  } finally {
    connecting = false;
  }
}

export function startDatabaseConnection() {
  if (connectionInitialized) return;
  connectionInitialized = true;

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] Disconnected.");
    scheduleReconnect();
  });

  mongoose.connection.on("error", (error) => {
    console.error("[db] Connection error:", error.message);
  });

  void attemptConnect();
}

export function getDatabaseHealth() {
  const stateByCode = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  const stateCode = mongoose.connection.readyState;
  return {
    ready: stateCode === 1,
    state: stateByCode[stateCode] || "unknown",
    host: mongoose.connection.host || null,
    database: mongoose.connection.name || null
  };
}
