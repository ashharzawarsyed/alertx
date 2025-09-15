import React from "react";
import { motion } from "framer-motion";
import {
  Home,
  Building2,
  Users,
  Truck,
  Map,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, active: true },
  { id: "hospitals", label: "Hospitals", icon: Building2 },
  { id: "patients", label: "Patients", icon: Users },
  { id: "ambulances", label: "Ambulances", icon: Truck },
  { id: "maps", label: "Maps", icon: Map },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "controls", label: "Controls", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, userRole = "admin" }) => {
  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "80px" },
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 },
  };

  return (
    <motion.div
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-4 bottom-4 left-4 z-40 overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-2xl"
    >
      {/* Sidebar Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <motion.div
            variants={contentVariants}
            animate={isCollapsed ? "collapsed" : "expanded"}
            className="flex items-center gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-teal-500">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-gray-900">
                AlertX
              </h2>
              <p className="text-xs font-medium text-gray-600">
                {userRole === "admin" ? "Admin Panel" : "Hospital Panel"}
              </p>
            </div>
          </motion.div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-xl p-2 transition-colors hover:bg-white/20"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                item.active
                  ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/20 hover:text-gray-900",
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />

              <motion.span
                variants={contentVariants}
                animate={isCollapsed ? "collapsed" : "expanded"}
                className="font-sans text-sm font-medium"
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </nav>

      {/* User Info */}
      <motion.div
        variants={contentVariants}
        animate={isCollapsed ? "collapsed" : "expanded"}
        className="absolute right-4 bottom-6 left-4"
      >
        <div className="rounded-xl bg-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-teal-500">
              <span className="text-sm font-bold text-white">SA</span>
            </div>
            <div>
              <p className="font-sans text-sm font-medium text-gray-900">
                System Admin
              </p>
              <p className="text-xs text-gray-600">admin@alertx.com</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
