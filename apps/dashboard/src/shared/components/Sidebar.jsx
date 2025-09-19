import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Building2,
  Users,
  Truck,
  Map,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
  {
    id: "hospitals",
    label: "Hospitals",
    icon: Building2,
    path: "/dashboard/hospitals",
  },
  {
    id: "patients",
    label: "Patients",
    icon: Users,
    path: "/dashboard/patients",
  },
  {
    id: "ambulances",
    label: "Ambulances",
    icon: Truck,
    path: "/dashboard/ambulances",
  },
  { id: "drivers", label: "Drivers", icon: Users, path: "/dashboard/drivers" },
  { id: "maps", label: "Maps", icon: Map, path: "/dashboard/maps" },
  {
    id: "controls",
    label: "Controls",
    icon: Shield,
    path: "/dashboard/controls",
  },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, userRole = "admin" }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
      className="fixed top-4 bottom-4 left-4 z-40 overflow-hidden rounded-2xl border border-gray-300 bg-gray-800 shadow-xl"
    >
      {/* Sidebar Header */}
      <div className="border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <motion.div
            variants={contentVariants}
            animate={isCollapsed ? "collapsed" : "expanded"}
            className="flex items-center gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-teal-400">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                AlertX
              </h2>
              <p className="text-xs font-medium text-gray-300">
                {userRole === "admin" ? "Admin Panel" : "Hospital Panel"}
              </p>
            </div>
          </motion.div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-xl p-2 transition-colors hover:bg-gray-700"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-300" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === "/dashboard" && location.pathname === "/dashboard/");

          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-lg"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
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
        <div className="rounded-xl bg-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-teal-400">
              <span className="text-sm font-bold text-white">SA</span>
            </div>
            <div>
              <p className="font-sans text-sm font-medium text-white">
                System Admin
              </p>
              <p className="text-xs text-gray-300">admin@alertx.com</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expand Button for Collapsed State */}
      {isCollapsed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => setIsCollapsed(false)}
          className="absolute top-20 left-1/2 flex h-10 w-10 -translate-x-1/2 transform items-center justify-center rounded-full bg-blue-600 shadow-lg transition-colors hover:bg-blue-700"
          title="Expand Sidebar"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default Sidebar;
