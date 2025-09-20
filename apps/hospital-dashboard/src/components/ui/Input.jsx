import React, { forwardRef } from 'react';

const inputVariants = {
  // Size variants
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
};

const inputStyles = {
  // Standard glass input
  default: 'glass border-white/30 focus:border-blue-400 focus:ring-blue-400/50',
  
  // Solid white
  solid: 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/50',
  
  // Medical theme
  medical: 'glass border-green-300/50 focus:border-green-500 focus:ring-green-500/50',
  
  // Error state
  error: 'bg-red-50 border-red-300 focus:border-red-500 focus:ring-red-500/50',
  
  // Success state
  success: 'bg-green-50 border-green-300 focus:border-green-500 focus:ring-green-500/50',
};

export const Input = forwardRef(({ 
  variant = 'default',
  size = 'md',
  leftIcon = null,
  rightIcon = null,
  error = false,
  success = false,
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'block w-full rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-400';
  
  // Auto-select variant based on state
  let selectedVariant = variant;
  if (error) selectedVariant = 'error';
  if (success) selectedVariant = 'success';
  
  const classes = `${baseClasses} ${inputVariants[size]} ${inputStyles[selectedVariant]} ${className}`;

  if (leftIcon || rightIcon) {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}
        <input
          ref={ref}
          className={`${classes} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
          disabled={disabled}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      className={classes}
      disabled={disabled}
      {...props}
    />
  );
});

// Textarea component
export const Textarea = forwardRef(({ 
  variant = 'default',
  rows = 4,
  error = false,
  success = false,
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'block w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-400 resize-none';
  
  // Auto-select variant based on state
  let selectedVariant = variant;
  if (error) selectedVariant = 'error';
  if (success) selectedVariant = 'success';
  
  const classes = `${baseClasses} ${inputStyles[selectedVariant]} ${className}`;

  return (
    <textarea
      ref={ref}
      rows={rows}
      className={classes}
      disabled={disabled}
      {...props}
    />
  );
});

// Select component
export const Select = forwardRef(({ 
  variant = 'default',
  size = 'md',
  error = false,
  success = false,
  disabled = false,
  children,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'block w-full rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-right bg-select-arrow';
  
  // Auto-select variant based on state
  let selectedVariant = variant;
  if (error) selectedVariant = 'error';
  if (success) selectedVariant = 'success';
  
  const classes = `${baseClasses} ${inputVariants[size]} ${inputStyles[selectedVariant]} ${className}`;

  return (
    <div className="relative">
      <select
        ref={ref}
        className={classes}
        disabled={disabled}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
});

// Label component
export const Label = ({ children, required = false, className = '', htmlFor, ...props }) => (
  <label 
    className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}
    htmlFor={htmlFor}
    {...props}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

// Form group wrapper
export const FormGroup = ({ children, className = '', ...props }) => (
  <div className={`mb-6 ${className}`} {...props}>
    {children}
  </div>
);

// Error message
export const ErrorMessage = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-red-600 mt-2 ${className}`} {...props}>
    {children}
  </p>
);

// Success message
export const SuccessMessage = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-green-600 mt-2 ${className}`} {...props}>
    {children}
  </p>
);

Input.displayName = 'Input';
Textarea.displayName = 'Textarea';
Select.displayName = 'Select';

export default Input;