import React from 'react';

const badgeVariants = {
  // Medical status badges
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
  normal: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  
  // General status badges
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  
  // Neutral badges
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
  white: 'bg-white text-gray-800 border-gray-200',
  
  // Gradient badges
  gradient: 'bg-gradient-to-r from-blue-500 to-teal-500 text-white border-transparent',
  gradientGreen: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-transparent',
  
  // Bed status specific
  available: 'bg-green-100 text-green-800 border-green-200',
  occupied: 'bg-red-100 text-red-800 border-red-200',
  maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  reserved: 'bg-blue-100 text-blue-800 border-blue-200',
};

const sizeVariants = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const Badge = ({ 
  children, 
  variant = 'gray', 
  size = 'sm',
  rounded = true,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium border';
  const roundedClasses = rounded ? 'rounded-full' : 'rounded-md';
  const classes = `${baseClasses} ${roundedClasses} ${badgeVariants[variant]} ${sizeVariants[size]} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

// Specialized badges for medical context
export const StatusBadge = ({ status, size = 'sm', ...props }) => {
  const statusMap = {
    critical: { variant: 'critical', text: 'Critical' },
    high: { variant: 'high', text: 'High Priority' },
    medium: { variant: 'medium', text: 'Medium' },
    low: { variant: 'low', text: 'Low Priority' },
    normal: { variant: 'normal', text: 'Normal' },
    stable: { variant: 'success', text: 'Stable' },
    pending: { variant: 'warning', text: 'Pending' },
    completed: { variant: 'success', text: 'Completed' },
    cancelled: { variant: 'error', text: 'Cancelled' },
  };

  const config = statusMap[status] || { variant: 'gray', text: status };

  return (
    <Badge variant={config.variant} size={size} {...props}>
      {config.text}
    </Badge>
  );
};

export const BedStatusBadge = ({ status, count, size = 'sm', ...props }) => {
  const statusMap = {
    available: { variant: 'available', icon: '✓' },
    occupied: { variant: 'occupied', icon: '●' },
    maintenance: { variant: 'maintenance', icon: '⚠' },
    reserved: { variant: 'reserved', icon: '◐' },
  };

  const config = statusMap[status] || { variant: 'gray', icon: '○' };

  return (
    <Badge variant={config.variant} size={size} {...props}>
      <span className="mr-1">{config.icon}</span>
      {count !== undefined ? `${count} ${status}` : status}
    </Badge>
  );
};

export const PriorityBadge = ({ priority, size = 'sm', ...props }) => {
  const priorityMap = {
    1: { variant: 'critical', text: 'Critical', icon: '🚨' },
    2: { variant: 'high', text: 'High', icon: '⚡' },
    3: { variant: 'medium', text: 'Medium', icon: '⚠' },
    4: { variant: 'low', text: 'Low', icon: '○' },
    5: { variant: 'normal', text: 'Normal', icon: '✓' },
  };

  const config = priorityMap[priority] || { variant: 'gray', text: `Priority ${priority}`, icon: '○' };

  return (
    <Badge variant={config.variant} size={size} {...props}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </Badge>
  );
};

export const CountBadge = ({ count, label, variant = 'info', size = 'sm', ...props }) => {
  return (
    <Badge variant={variant} size={size} className="font-mono" {...props}>
      <span className="font-bold mr-1">{count}</span>
      {label}
    </Badge>
  );
};

export default Badge;