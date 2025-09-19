import React from "react";
import { motion } from "framer-motion";

const ConfigForm = ({
  title,
  description,
  fields,
  values,
  onChange,
  onSubmit,
  onReset,
  loading = false,
  errors = {},
  className = "",
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(values);
    }
  };

  const renderField = (field) => {
    const {
      key,
      label,
      type = "text",
      placeholder,
      required = false,
      options = [],
      disabled = false,
      helperText,
    } = field;

    const value = values[key] || "";
    const error = errors[key];

    const baseInputClasses = `
      mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
      ${disabled ? "bg-gray-50 cursor-not-allowed" : ""}
    `;

    return (
      <div key={key} className="space-y-1">
        <label
          htmlFor={key}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {type === "select" ? (
          <select
            id={key}
            value={value}
            onChange={(e) => onChange(key, e.target.value)}
            disabled={disabled}
            className={baseInputClasses}
          >
            <option value="">
              {placeholder || `Select ${label.toLowerCase()}`}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            id={key}
            rows={3}
            value={value}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={baseInputClasses}
          />
        ) : type === "checkbox" ? (
          <div className="flex items-center">
            <input
              id={key}
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(key, e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={key} className="ml-2 block text-sm text-gray-700">
              {helperText || label}
            </label>
          </div>
        ) : (
          <input
            id={key}
            type={type}
            value={value}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
          />
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && type !== "checkbox" && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white ${className}`}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(renderField)}

        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={loading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              Reset
            </button>
          )}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                Saving...
              </div>
            ) : (
              "Save Changes"
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ConfigForm;
