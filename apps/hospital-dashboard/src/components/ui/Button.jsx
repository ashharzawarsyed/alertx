import { motion } from "framer-motion";
import React from "react";

const buttonVariants = {
  // Size variants
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg",
};

const buttonStyles = {
  // Primary - Healthcare gradient
  primary:
    "bg-gradient-to-r from-blue-600 to-teal-600 text-white border-transparent hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl",

  // Secondary - Glass effect
  secondary:
    "glass text-gray-700 border-white/30 hover:bg-white/80 hover:text-gray-900",

  // Success - Medical green
  success:
    "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-transparent hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl",

  // Warning - Amber
  warning:
    "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl",

  // Danger - Medical critical
  danger:
    "bg-gradient-to-r from-red-500 to-pink-600 text-white border-transparent hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl",

  // Ghost - Transparent with border
  ghost:
    "bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900",

  // Outline - Bordered
  outline:
    "bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700",
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  className = "",
  animate = true,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const classes = `${baseClasses} ${buttonVariants[size]} ${buttonStyles[variant]} ${className}`;

  const buttonContent = (
    <>
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  );

  if (animate) {
    return (
      <motion.button
        className={classes}
        disabled={disabled || loading}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {buttonContent}
      </motion.button>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {buttonContent}
    </button>
  );
};

export default Button;
