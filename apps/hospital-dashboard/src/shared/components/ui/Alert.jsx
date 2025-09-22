import { motion } from "framer-motion";
import React from "react";

/**
 * Reusable Alert/Notification Component
 */
const Alert = ({
  type = "info",
  title,
  message,
  onClose,
  className = "",
  icon: CustomIcon,
  autoClose = false,
  autoCloseDelay = 5000,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const types = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
      titleText: "text-emerald-900",
      icon: "text-emerald-400",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      titleText: "text-red-900",
      icon: "text-red-400",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      titleText: "text-yellow-900",
      icon: "text-yellow-400",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      titleText: "text-blue-900",
      icon: "text-blue-400",
    },
  };

  const typeStyles = types[type] || types.info;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className={`p-4 rounded-lg border ${typeStyles.bg} ${typeStyles.border} ${className}`}
    >
      <div className="flex items-start">
        {CustomIcon && (
          <CustomIcon className={`w-5 h-5 mr-3 mt-0.5 ${typeStyles.icon}`} />
        )}

        <div className="flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${typeStyles.titleText} mb-1`}>
              {title}
            </h3>
          )}
          {message && <p className={`text-sm ${typeStyles.text}`}>{message}</p>}
        </div>

        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(), 300);
            }}
            className={`ml-3 -mr-1 -mt-1 p-1 rounded-md hover:bg-black/5 transition-colors ${typeStyles.icon}`}
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Alert;
