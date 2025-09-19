import React from "react";
import { motion } from "framer-motion";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

const SettingCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  rightElement,
  className = "",
  variant = "default",
  disabled = false,
}) => {
  const variants = {
    default: "bg-white hover:bg-gray-50 border-gray-200",
    success: "bg-green-50 hover:bg-green-100 border-green-200",
    warning: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
    danger: "bg-red-50 hover:bg-red-100 border-red-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200 ${variants[variant]} ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className} `}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div
              className={`rounded-lg p-2 ${variant === "success" ? "bg-green-100" : ""} ${variant === "warning" ? "bg-yellow-100" : ""} ${variant === "danger" ? "bg-red-100" : ""} ${variant === "default" ? "bg-gray-100" : ""} `}
            >
              <Icon
                className={`h-5 w-5 ${variant === "success" ? "text-green-600" : ""} ${variant === "warning" ? "text-yellow-600" : ""} ${variant === "danger" ? "text-red-600" : ""} ${variant === "default" ? "text-gray-600" : ""} `}
              />
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {rightElement}
          {onClick && <ChevronRightIcon className="h-4 w-4 text-gray-400" />}
        </div>
      </div>
    </motion.div>
  );
};

export default SettingCard;
