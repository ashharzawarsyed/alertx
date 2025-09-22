import { motion } from "framer-motion";
import { Warning, X, Clock, FirstAid, MapPin, Bell } from "phosphor-react";
import React from "react";

/**
 * Critical Alert Component - Shows urgent system-wide alerts
 */
export const CriticalAlert = ({ alert, onDismiss, onAction }) => {
  const {
    id,
    title,
    message,
    severity,
    timestamp,
    location,
    estimatedArrival,
    actionRequired,
    details,
  } = alert;

  const severityStyles = {
    critical: "bg-red-50 border-red-200 text-red-800",
    high: "bg-orange-50 border-orange-200 text-orange-800",
    medium: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const severityIcons = {
    critical: <Warning size={20} className="text-red-600" />,
    high: <FirstAid size={20} className="text-orange-600" />,
    medium: <Bell size={20} className="text-yellow-600" />,
    info: <Bell size={20} className="text-blue-600" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`relative rounded-lg border p-4 mb-3 ${severityStyles[severity]} shadow-sm`}
    >
      {/* Close Button */}
      <button
        onClick={() => onDismiss(id)}
        className="absolute top-3 right-3 p-1 hover:bg-black/10 rounded-full transition-colors"
      >
        <X size={16} />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 mt-0.5">{severityIcons[severity]}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>

      {/* Details */}
      {details && (
        <div className="mb-3 pl-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {location && (
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span className="font-medium">Location:</span>
                <span className="opacity-90">{location}</span>
              </div>
            )}
            {estimatedArrival && (
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span className="font-medium">ETA:</span>
                <span className="opacity-90">{estimatedArrival} minutes</span>
              </div>
            )}
          </div>
          {details.additionalInfo && (
            <p className="text-sm opacity-90 mt-2">{details.additionalInfo}</p>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div className="flex items-center justify-between">
        <span className="text-xs opacity-75">
          {new Date(timestamp).toLocaleTimeString()}
        </span>

        {/* Action Button */}
        {actionRequired && (
          <button
            onClick={() => onAction(alert)}
            className="px-3 py-1 bg-white/80 hover:bg-white rounded-md text-sm font-medium transition-colors"
          >
            {actionRequired}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default CriticalAlert;
