import { motion } from "framer-motion";
import React from "react";

/**
 * Reusable Card Component for consistent layout and styling
 */
const Card = ({
  children,
  className = "",
  padding = "md",
  shadow = "md",
  hover = false,
  onClick,
  ...props
}) => {
  const baseClasses =
    "bg-white rounded-lg border border-gray-200 transition-all duration-200";

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  const hoverClasses = hover
    ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    : "";
  const clickableClasses = onClick ? "cursor-pointer" : "";

  const paddingClass = paddingClasses[padding] || paddingClasses.md;
  const shadowClass = shadowClasses[shadow] || shadowClasses.md;

  const Component = onClick || hover ? motion.div : "div";
  const motionProps =
    onClick || hover
      ? {
          whileHover: { scale: 1.02 },
          whileTap: onClick ? { scale: 0.98 } : undefined,
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3 },
        }
      : {};

  return (
    <Component
      className={`${baseClasses} ${paddingClass} ${shadowClass} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
