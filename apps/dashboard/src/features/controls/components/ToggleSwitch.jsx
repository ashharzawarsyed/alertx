import React from "react";
import { motion } from "framer-motion";

const ToggleSwitch = ({
  enabled,
  onChange,
  size = "md",
  disabled = false,
  label,
  description,
  variant = "primary",
}) => {
  const sizes = {
    sm: "h-4 w-7",
    md: "h-5 w-9",
    lg: "h-6 w-11",
  };

  const toggleSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const variants = {
    primary: enabled ? "bg-blue-600" : "bg-gray-200",
    success: enabled ? "bg-green-600" : "bg-gray-200",
    warning: enabled ? "bg-yellow-600" : "bg-gray-200",
    danger: enabled ? "bg-red-600" : "bg-gray-200",
  };

  return (
    <div className={`flex items-center ${label ? "justify-between" : ""}`}>
      {label && (
        <div className="mr-4">
          <div className="text-sm font-medium text-gray-900">{label}</div>
          {description && (
            <div className="text-xs text-gray-500">{description}</div>
          )}
        </div>
      )}

      <motion.button
        type="button"
        className={`relative inline-flex items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${sizes[size]} ${variants[variant]} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} `}
        role="switch"
        aria-checked={enabled}
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
      >
        <span className="sr-only">{label || "Toggle"}</span>
        <motion.span
          className={`pointer-events-none relative inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${toggleSizes[size]} `}
          animate={{
            x: enabled ? (size === "sm" ? 12 : size === "md" ? 16 : 20) : 0,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <span
            className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ${enabled ? "opacity-0 duration-100" : "opacity-100 duration-200"} `}
            aria-hidden="true"
          >
            <svg
              className="h-2 w-2 text-gray-400"
              fill="none"
              viewBox="0 0 12 12"
            >
              <path
                d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-100 ${enabled ? "opacity-100 duration-200" : "opacity-0 duration-100"} `}
            aria-hidden="true"
          >
            <svg
              className="h-2 w-2 text-green-600"
              fill="currentColor"
              viewBox="0 0 12 12"
            >
              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
            </svg>
          </span>
        </motion.span>
      </motion.button>
    </div>
  );
};

export default ToggleSwitch;
