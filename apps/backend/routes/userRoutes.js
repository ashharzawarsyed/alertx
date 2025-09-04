import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  approveDriver,
  getDrivers,
  getNearbyDrivers,
  getUserStats,
} from "../controllers/userController.js";
import { validateObjectId } from "../middlewares/validation.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get("/", authenticate, adminOnly, getAllUsers);

/**
 * @route   GET /api/v1/users/drivers
 * @desc    Get all drivers
 * @access  Private (Admin only)
 */
router.get("/drivers", authenticate, adminOnly, getDrivers);

/**
 * @route   GET /api/v1/users/drivers/nearby
 * @desc    Get nearby drivers
 * @access  Private (Admin only)
 */
router.get("/drivers/nearby", authenticate, adminOnly, getNearbyDrivers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get(
  "/:id",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  getUserById
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put("/:id", authenticate, adminOnly, validateObjectId("id"), updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  deleteUser
);

/**
 * @route   PUT /api/v1/users/:id/approve-driver
 * @desc    Approve driver
 * @access  Private (Admin only)
 */
router.put(
  "/:id/approve-driver",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  approveDriver
);

/**
 * @route   GET /api/v1/users/:id/stats
 * @desc    Get user statistics
 * @access  Private (Admin only)
 */
router.get(
  "/:id/stats",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  getUserStats
);

export default router;
