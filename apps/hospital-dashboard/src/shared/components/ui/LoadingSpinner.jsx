import { motion } from "framer-motion";
import React from "react";

/**
 * Reusable Loading Spinner Component
 */
const LoadingSpinner = ({
  size = "md",
  color = "blue",
  className = "",
  text = "",
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colors = {
    blue: "border-blue-500",
    white: "border-white",
    gray: "border-gray-500",
    green: "border-green-500",
    red: "border-red-500",
  };

  const sizeClass = sizes[size] || sizes.md;
  const colorClass = colors[color] || colors.blue;

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-2 ${className}`}
    >
      <motion.div
        className={`${sizeClass} border-2 ${colorClass} border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <motion.p
          className="text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

/**
 * Full Page Loading Component
 */
export const PageLoader = ({ text = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
};

export default LoadingSpinner;
