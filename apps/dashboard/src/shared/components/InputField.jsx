import React, { useState, forwardRef } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Eye, EyeOff } from "lucide-react";

const InputField = forwardRef(
  (
    {
      label,
      type = "text",
      placeholder,
      error,
      icon: Icon,
      className,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = type === "password" && showPassword ? "text" : type;

    return (
      <div className={clsx("relative", className)}>
        {label && (
          <label className="mb-3 block font-sans text-sm font-semibold tracking-wide text-gray-800 uppercase">
            {label}
          </label>
        )}

        <div className="relative">
          {/* Icon */}
          {Icon && (
            <div className="absolute top-1/2 left-4 z-10 -translate-y-1/2 transform">
              <Icon className="h-5 w-5 text-gray-600" />
            </div>
          )}

          {/* Input field */}
          <motion.input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={clsx(
              "w-full rounded-xl border bg-white/20 px-4 py-3 font-sans text-gray-800 placeholder-gray-500 backdrop-blur-sm transition-all duration-300 focus:ring-4 focus:outline-none",
              Icon && "pl-12",
              type === "password" && "pr-12",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/25"
                : isFocused
                  ? "border-blue-500 bg-white/30 shadow-lg focus:ring-blue-500/25"
                  : "border-white/30 hover:border-white/50 hover:bg-white/25",
            )}
            {...props}
          />

          {/* Glow effect on focus */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-teal-500/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: isFocused ? 1 : 0,
              scale: isFocused ? 1 : 0.95,
            }}
            transition={{ duration: 0.2 }}
          />

          {/* Password toggle */}
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-4 z-10 -translate-y-1/2 transform text-gray-600 transition-colors hover:text-gray-800"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 font-sans text-sm font-medium text-red-600"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);

InputField.displayName = "InputField";

export default InputField;
