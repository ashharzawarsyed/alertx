import { motion } from "framer-motion";
import React, { forwardRef } from "react";

/**
 * Reusable Input Component with enhanced styling and validation states
 */
const Input = forwardRef(
  (
    {
      label,
      error,
      icon: Icon,
      type = "text",
      placeholder,
      value,
      onChange,
      required = false,
      disabled = false,
      className = "",
      containerClassName = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseInputClasses =
      "w-full py-3 border rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-colors bg-gray-50/50 disabled:bg-gray-100 disabled:cursor-not-allowed";
    const errorClasses = error
      ? "border-red-300 focus:ring-red-400 focus:border-red-400"
      : "border-gray-200";
    const iconClasses = Icon ? "pl-12 pr-4" : "px-4";

    return (
      <motion.div
        className={`space-y-2 ${containerClassName}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <Icon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              size={20}
            />
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`${baseInputClasses} ${errorClasses} ${iconClasses} ${className}`}
            {...props}
          />
        </div>

        {error && (
          <motion.p
            className="text-sm text-red-600"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

Input.displayName = "Input";

export default Input;
