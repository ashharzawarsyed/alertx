import { motion } from "framer-motion";
import React from "react";

/**
 * Reusable Metric Card Component
 * Used for displaying key metrics like response times, bed counts, etc.
 */
export const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = "neutral",
  color = "blue",
  size = "normal",
}) => {
  const colorVariants = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
    teal: "from-teal-500 to-teal-600",
  };

  const sizeVariants = {
    small: "p-4",
    normal: "p-6",
    large: "p-8",
  };

  const getTrendColor = () => {
    switch (trendDirection) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 ${sizeVariants[size]}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p
            className={`font-bold text-slate-800 ${size === "large" ? "text-3xl" : size === "small" ? "text-lg" : "text-2xl"}`}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-xs font-medium mt-1 ${getTrendColor()}`}>
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`bg-gradient-to-br ${colorVariants[color]} rounded-lg flex items-center justify-center text-white shadow-sm ${size === "large" ? "w-16 h-16" : size === "small" ? "w-8 h-8" : "w-12 h-12"}`}
          >
            {typeof icon === "string" ? (
              <span
                className={
                  size === "large"
                    ? "text-2xl"
                    : size === "small"
                      ? "text-sm"
                      : "text-lg"
                }
              >
                {icon}
              </span>
            ) : (
              icon
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Emergency Priority Badge Component
 */
export const PriorityBadge = ({ priority, size = "normal" }) => {
  const priorityConfig = {
    critical: { color: "bg-red-500", text: "text-white", label: "Critical" },
    high: { color: "bg-orange-500", text: "text-white", label: "High" },
    medium: { color: "bg-yellow-500", text: "text-white", label: "Medium" },
    low: { color: "bg-green-500", text: "text-white", label: "Low" },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;
  const sizeClass =
    size === "small" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center ${sizeClass} font-medium rounded-full ${config.color} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

/**
 * Status Badge Component
 */
export const StatusBadge = ({ status, size = "normal" }) => {
  const statusConfig = {
    active: { color: "bg-green-100", text: "text-green-800", label: "Active" },
    pending: {
      color: "bg-yellow-100",
      text: "text-yellow-800",
      label: "Pending",
    },
    dispatched: {
      color: "bg-blue-100",
      text: "text-blue-800",
      label: "Dispatched",
    },
    enroute: {
      color: "bg-purple-100",
      text: "text-purple-800",
      label: "En Route",
    },
    arrived: { color: "bg-teal-100", text: "text-teal-800", label: "Arrived" },
    completed: {
      color: "bg-gray-100",
      text: "text-gray-800",
      label: "Completed",
    },
    cancelled: {
      color: "bg-red-100",
      text: "text-red-800",
      label: "Cancelled",
    },
  };

  const config = statusConfig[status] || statusConfig.active;
  const sizeClass =
    size === "small" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center ${sizeClass} font-medium rounded-full ${config.color} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

/**
 * Time Display Component
 */
export const TimeDisplay = ({ timestamp, label, format = "relative" }) => {
  const formatTime = (time) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;

    if (format === "relative") {
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    }

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="text-xs text-slate-500">
      {label && <span className="font-medium">{label}: </span>}
      <span>{formatTime(timestamp)}</span>
    </div>
  );
};

/**
 * Progress Bar Component
 */
export const ProgressBar = ({
  value,
  max = 100,
  color = "blue",
  size = "normal",
  showLabel = true,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colorVariants = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
  };

  const heightClass =
    size === "small" ? "h-2" : size === "large" ? "h-4" : "h-3";

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>
            {value}/{max}
          </span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full ${heightClass}`}>
        <div
          className={`${heightClass} ${colorVariants[color]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
