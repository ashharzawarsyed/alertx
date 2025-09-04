import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/helpers.js";
import { RESPONSE_CODES, USER_ROLES } from "../utils/constants.js";

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendResponse(
        res,
        RESPONSE_CODES.UNAUTHORIZED,
        "Access token required"
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return sendResponse(res, RESPONSE_CODES.UNAUTHORIZED, "Token expired");
      }
      return sendResponse(res, RESPONSE_CODES.UNAUTHORIZED, "Invalid token");
    }
  } catch {
    return sendResponse(
      res,
      RESPONSE_CODES.INTERNAL_SERVER_ERROR,
      "Authentication error"
    );
  }
};

/**
 * Authorization middleware - checks user roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendResponse(
        res,
        RESPONSE_CODES.UNAUTHORIZED,
        "Authentication required"
      );
    }

    if (!roles.includes(req.user.role)) {
      return sendResponse(
        res,
        RESPONSE_CODES.FORBIDDEN,
        "Insufficient permissions"
      );
    }

    next();
  };
};

/**
 * Admin only middleware
 */
export const adminOnly = authorize(USER_ROLES.ADMIN);

/**
 * Hospital staff or admin middleware
 */
export const hospitalStaffOrAdmin = authorize(
  USER_ROLES.HOSPITAL_STAFF,
  USER_ROLES.ADMIN
);

/**
 * Driver or admin middleware
 */
export const driverOrAdmin = authorize(USER_ROLES.DRIVER, USER_ROLES.ADMIN);
