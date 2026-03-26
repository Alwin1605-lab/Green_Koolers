export function notFound(req, res, next) {
  res.status(404).json({ message: "Route not found" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const message = err?.message || "Server error";
  const dbUnavailable =
    err?.name === "MongooseServerSelectionError" ||
    /buffering timed out/i.test(message) ||
    /before initial connection is complete/i.test(message) ||
    /could not connect to any servers/i.test(message) ||
    /server selection timed out/i.test(message);

  const status = err.status || (dbUnavailable ? 503 : 500);

  if (status >= 500) {
    console.error("[error]", message);
  }

  res.status(status).json({
    message: dbUnavailable ? "Service temporarily unavailable. Database connection is not ready." : message
  });
}
