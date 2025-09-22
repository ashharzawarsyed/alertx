import { motion } from "framer-motion";
import React from "react";

/**
 * Reusable Button Component with various styles and animations
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-400/90 to-indigo-500/90 text-white hover:from-blue-500/90 hover:to-indigo-600/90 focus:ring-blue-400 shadow-lg hover:shadow-xl",
    secondary:
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-400 border border-gray-300",
    success:
      "bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600 focus:ring-emerald-400 shadow-lg hover:shadow-xl",
    danger:
      "bg-gradient-to-r from-red-400 to-red-500 text-white hover:from-red-500 hover:to-red-600 focus:ring-red-400 shadow-lg hover:shadow-xl",
    outline:
      "border border-blue-400 text-blue-600 hover:bg-blue-50 focus:ring-blue-400",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
