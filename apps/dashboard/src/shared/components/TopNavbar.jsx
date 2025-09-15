import React from "react";
import { motion } from "framer-motion";
import { Search, Bell, User } from "lucide-react";

const TopNavbar = ({ user }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 left-80 z-30 rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-teal-500">
              <span className="text-sm font-bold text-white">🚨</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-gray-900">
                AlertX
              </h1>
              <p className="text-xs font-medium text-gray-600">
                Emergency Management
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mx-8 max-w-xl flex-1">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
            <input
              type="text"
              placeholder="Search hospitals, patients, or emergencies..."
              className="w-full rounded-xl border border-white/30 bg-white/20 py-3 pr-4 pl-12 font-sans text-gray-800 placeholder-gray-500 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative rounded-xl p-3 transition-colors hover:bg-white/20"
          >
            <Bell className="h-5 w-5 text-gray-700" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></div>
          </motion.button>

          {/* Profile Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2 transition-colors hover:bg-white/20"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-teal-500">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <p className="font-sans text-sm font-medium text-gray-900">
                {user?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-600">
                {user?.role || "Administrator"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default TopNavbar;
