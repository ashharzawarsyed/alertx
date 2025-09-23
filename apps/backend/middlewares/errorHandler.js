import { sendResponse } from "../utils/helpers.js";
import { RESPONSE_CODES } from "../utils/constants.js";

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res) => {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendResponse(
      res,
      RESPONSE_CODES.BAD_REQUEST,
      "Validation error",
      null,
      errors
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendResponse(
      res,
      RESPONSE_CODES.CONFLICT,
      `${field} already exists`
    );
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendResponse(res, RESPONSE_CODES.UNAUTHORIZED, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return sendResponse(res, RESPONSE_CODES.UNAUTHORIZED, "Token expired");
  }

  // MongoDB cast error
  if (err.name === "CastError") {
    return sendResponse(res, RESPONSE_CODES.BAD_REQUEST, "Invalid ID format");
  }

  // Default error
  const statusCode = err.statusCode || RESPONSE_CODES.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal server error";

  return sendResponse(res, statusCode, message);
};

/**
 * 404 Not Found handler
 */
export const notFound = (req, res) => {
  console.warn(`[404] Not Found: ${req.method} ${req.originalUrl}`);
  return sendResponse(
    res,
    RESPONSE_CODES.NOT_FOUND,
    `Route ${req.originalUrl} not found`
  );
};

/**
 * Async error wrapper - catches async errors and passes to error handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
