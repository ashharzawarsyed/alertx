import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  MagnifyingGlass,
  User,
  Gear,
  SignOut,
  UserCircle,
  CaretDown,
} from "phosphor-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

// Utility function to format hospital names
const formatHospitalName = (name) => {
  if (!name) return "AlertX";

  // Remove generic prefixes and suffixes
  const cleanName = name
    .replace(/^(Professional Email|Demo|Test)\s+/gi, "")
    .replace(/\s+\d+$/g, "") // Remove trailing numbers
    .replace(/Hospital$/, "") // Remove trailing "Hospital"
    .trim();

  // If name is still too long, create abbreviation
  if (cleanName.length > 20) {
    const words = cleanName.split(" ");
    if (words.length > 1) {
      // Create abbreviation from first letters
      return (
        words.map((word) => word.charAt(0).toUpperCase()).join("") + " Medical"
      );
    } else {
      // Truncate single word
      return cleanName.substring(0, 15) + "...";
    }
  }

  return cleanName || "AlertX";
};

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(3); // Sample notification count
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    console.log("Logout clicked");
    setShowUserMenu(false);
    logout();
  };

  const handleProfile = () => {
    console.log("Profile clicked");
    setShowUserMenu(false);
    navigate("/dashboard/profile");
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    console.log("Toggle clicked, current state:", showUserMenu);
    setShowUserMenu(!showUserMenu);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showUserMenu]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full bg-white"
    >
      {/* Navigation Bar Container - Simplified for internal layout */}
      <div className="px-6 py-4 border-b border-slate-100/60">
        `
        <div className="relative flex items-center justify-between">
          {/* Left Section - Hospital Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Medical cross icon */}
              <svg
                className="w-6 h-6 opacity-90"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="25"
                  y="5"
                  width="10"
                  height="50"
                  rx="4"
                  fill="#38bdf8"
                />
                <rect
                  x="5"
                  y="25"
                  width="50"
                  height="10"
                  rx="4"
                  fill="#38bdf8"
                />
                <rect
                  x="27"
                  y="7"
                  width="6"
                  height="46"
                  rx="3"
                  fill="#0ea5e9"
                />
                <rect
                  x="7"
                  y="27"
                  width="46"
                  height="6"
                  rx="3"
                  fill="#0ea5e9"
                />
              </svg>
              <h1 className="font-extrabold text-base tracking-tight text-blue-700 font-display select-none drop-shadow-sm pr-3 letter-spacing-wide">
                {formatHospitalName(user?.name)}&nbsp;
                <span className="text-teal-500">Hospital</span>
              </h1>
            </div>
          </div>

          {/* Center Section - Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <MagnifyingGlass size={14} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients, staff, rooms..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50/50 border border-slate-200/60 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200"
              />
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <button
                    onClick={() => setSearchQuery("")}
                    className="w-5 h-5 bg-slate-300 hover:bg-slate-400 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <span className="text-white text-xs">×</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Actions */}

            {/* Divider */}
            <div className="w-px h-5 bg-slate-200"></div>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-8 h-8 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg flex items-center justify-center transition-all duration-200 group"
              title="Notifications"
            >
              <Bell
                size={14}
                className="text-slate-600 group-hover:text-slate-700"
                weight="duotone"
              />
              {notifications > 0 && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {notifications}
                  </span>
                </div>
              )}
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg flex items-center justify-center transition-all duration-200 group"
              title="Settings"
            >
              <Gear
                size={14}
                className="text-slate-600 group-hover:text-slate-700"
                weight="duotone"
              />
            </motion.button>

            {/* Divider */}
            <div className="w-px h-5 bg-slate-200"></div>

            {/* Hospital Profile */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={toggleUserMenu}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50/50 hover:bg-slate-100/50 rounded-lg border border-slate-200/60 cursor-pointer transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <User size={16} className="text-white" weight="duotone" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-700">
                    {formatHospitalName(user?.name) || "Admin"}
                  </p>
                  <p className="text-xs text-slate-500">Hospital Admin</p>
                </div>
                <CaretDown
                  size={16}
                  className={`text-slate-500 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
                  weight="bold"
                />
              </button>

              {/* User Menu Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden"
                    style={{ zIndex: 99999 }}
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-slate-50 border-b border-slate-200">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {formatHospitalName(user?.name)} Hospital
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleProfile}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 transition-colors flex items-center gap-3 group"
                      >
                        <UserCircle
                          size={18}
                          weight="duotone"
                          className="text-slate-500 group-hover:text-blue-600 transition-colors"
                        />
                        <span className="font-medium">Hospital Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/dashboard");
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 transition-colors flex items-center gap-3 group"
                      >
                        <Gear
                          size={18}
                          weight="duotone"
                          className="text-slate-500 group-hover:text-blue-600 transition-colors"
                        />
                        <span className="font-medium">Settings</span>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-200"></div>

                    {/* Logout Button */}
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 group"
                      >
                        <SignOut
                          size={18}
                          weight="duotone"
                          className="text-red-500 group-hover:text-red-700 transition-colors"
                        />
                        <span className="font-semibold">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NavigationBar;
