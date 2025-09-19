import React from "react";
import { motion } from "framer-motion";

const SettingsSection = ({
  title,
  description,
  children,
  icon: Icon,
  actions,
  collapsible = false,
  defaultExpanded = true,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="rounded-lg bg-blue-50 p-2">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {actions}
            {collapsible && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded p-1 transition-colors duration-200 hover:bg-gray-100"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.div>
              </button>
            )}
          </div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsSection;
