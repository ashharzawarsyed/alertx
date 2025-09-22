import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Warning, Info, X } from "phosphor-react";
import React, { createContext, useState } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = "info", duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };

    setNotifications((prev) => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const success = (message, duration) =>
    addNotification(message, "success", duration);
  const error = (message, duration) =>
    addNotification(message, "error", duration);
  const warning = (message, duration) =>
    addNotification(message, "warning", duration);
  const info = (message, duration) =>
    addNotification(message, "info", duration);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            onRemove={() => onRemove(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const Notification = ({ notification, onRemove }) => {
  const { message, type } = notification;

  const typeConfig = {
    success: {
      icon: <CheckCircle size={20} />,
      className: "bg-green-50 border-green-200 text-green-800",
      iconClassName: "text-green-500",
    },
    error: {
      icon: <Warning size={20} />,
      className: "bg-red-50 border-red-200 text-red-800",
      iconClassName: "text-red-500",
    },
    warning: {
      icon: <Warning size={20} />,
      className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      iconClassName: "text-yellow-500",
    },
    info: {
      icon: <Info size={20} />,
      className: "bg-blue-50 border-blue-200 text-blue-800",
      iconClassName: "text-blue-500",
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`max-w-sm w-full border rounded-lg p-4 shadow-lg ${config.className}`}
    >
      <div className="flex items-start gap-3">
        <div className={config.iconClassName}>{config.icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationProvider;
