const logger = require("../utils/logger");

// 404 handler - for any route that doesn't match
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Central error handler - keep this LAST in the middleware chain
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  logger.error(`${req.method} ${req.originalUrl} -> ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error" : err.message,
    // Never leak stack traces or internals in production responses
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

// Wraps async route handlers so thrown errors reach errorHandler
// instead of crashing the process or requiring try/catch everywhere.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { notFound, errorHandler, asyncHandler, ApiError };