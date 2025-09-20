import { motion } from 'framer-motion';
import React from 'react';

const cardVariants = {
  // Glass variants
  glass: 'glass shadow-glass',
  glassDark: 'glass-dark shadow-glass',
  glassLight: 'glass-light shadow-glass',
  
  // Solid variants
  white: 'bg-white border border-gray-200 shadow-card',
  gradient: 'bg-gradient-card border border-white/30 shadow-glass',
  
  // Medical status variants
  success: 'bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 shadow-card',
  warning: 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-card',
  danger: 'bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 shadow-card',
  info: 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 shadow-card',
};

const sizeVariants = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

export const Card = ({ 
  children, 
  variant = 'white', 
  size = 'md',
  rounded = 'xl',
  animate = true,
  hover = true,
  className = '',
  ...props 
}) => {
  const baseClasses = `rounded-${rounded} transition-all duration-300`;
  const hoverClasses = hover ? 'hover-lift hover:shadow-lg' : '';
  const classes = `${baseClasses} ${cardVariants[variant]} ${sizeVariants[size]} ${hoverClasses} ${className}`;

  if (animate) {
    return (
      <motion.div
        className={classes}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={hover ? { y: -2 } : {}}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Card components for structured content
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-xl font-semibold text-gray-900 font-['Poppins'] ${className}`} {...props}>
    {children}
  </h3>
);

export const CardSubtitle = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`text-gray-700 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-6 pt-4 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

// Specialized medical cards
export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend = null, 
  variant = 'white',
  animate = true 
}) => {
  return (
    <Card variant={variant} animate={animate} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 font-mono">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.direction === 'up' ? 'text-green-600' : 
              trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend.direction === 'up' && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {trend.direction === 'down' && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {trend.value}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white">
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;