import { motion, AnimatePresence } from "framer-motion";
import { X } from "phosphor-react";
import React, { useEffect } from "react";

import Button from "./Button";

const modalSizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full mx-4",
};

export const Modal = ({
  isOpen = false,
  onClose,
  size = "md",
  title = "",
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = "",
  ...props
}) => {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className={`relative w-full ${modalSizes[size]} glass shadow-glass rounded-2xl ${className}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.3,
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              {...props}
            >
              {/* Close Button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-xl"
                >
                  <X size={20} />
                </button>
              )}

              {/* Header */}
              {title && (
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 font-['Poppins'] pr-8">
                    {title}
                  </h3>
                </div>
              )}

              {/* Content */}
              <div className="px-6 py-6">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Modal components for structured content
export const ModalHeader = ({ children, className = "", ...props }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

export const ModalTitle = ({ children, className = "", ...props }) => (
  <h3
    className={`text-xl font-semibold text-gray-900 font-['Poppins'] ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const ModalContent = ({ children, className = "", ...props }) => (
  <div className={`px-6 py-6 ${className}`} {...props}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className = "", ...props }) => (
  <div
    className={`px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Pre-built confirmation modal
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>

      <ModalContent>
        <p className="text-gray-600">{message}</p>
      </ModalContent>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// Alert modal for notifications
export const AlertModal = ({
  isOpen,
  onClose,
  title = "Alert",
  message = "",
  variant = "info",
  buttonText = "OK",
}) => {
  const variantIcons = {
    success: "✅",
    warning: "⚠️",
    error: "❌",
    info: "ℹ️",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        <div className="text-center">
          <div className="text-4xl mb-4">{variantIcons[variant]}</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <Button
            variant={variant === "error" ? "danger" : "primary"}
            onClick={onClose}
          >
            {buttonText}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default Modal;
