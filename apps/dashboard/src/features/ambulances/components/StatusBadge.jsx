/**
 * Status Badge Component
 * Reusable status indicator for ambulances with animated effects
 */

import React from "react";
import { motion } from "framer-motion";
import { STATUS_COLORS, PRIORITY_COLORS } from "../types/ambulanceTypes";

export const StatusBadge = ({
  status,
  size = "medium",
  showPulse = false,
  className = "",
}) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.idle;

  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    medium: "px-3 py-1.5 text-sm",
    large: "px-4 py-2 text-base",
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 rounded-full font-medium capitalize ${colors.bg} ${colors.text} ${colors.border} border ${sizeClasses[size]} ${className} `}
    >
      <div
        className={`h-2 w-2 rounded-full ${colors.dot} ${showPulse ? "animate-pulse" : ""} `}
      />
      {status.replace("_", " ")}
    </motion.div>
  );
};

export const PriorityBadge = ({
  priority,
  size = "medium",
  className = "",
}) => {
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.low;

  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    medium: "px-3 py-1.5 text-sm",
    large: "px-4 py-2 text-base",
  };

  const priorityIcons = {
    low: "↓",
    medium: "→",
    high: "↑",
    critical: "⚠",
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 rounded-full font-medium capitalize ${colors.bg} ${colors.text} ${colors.border} border ${sizeClasses[size]} ${className} `}
    >
      <span className="text-current">{priorityIcons[priority]}</span>
      {priority}
    </motion.div>
  );
};
