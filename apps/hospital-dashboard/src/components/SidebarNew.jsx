import { motion, AnimatePresence } from "framer-motion";
import {
  ChartLineUp,
  House,
  Bed,
  Users,
  UserCircle,
  Warning,
  ChartBar,
  Heartbeat,
  List,
  Truck,
  MapTrifold,
} from "phosphor-react";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useSidebar } from "../contexts/SidebarContext";

const SidebarItem = ({
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  onClick,
  path,
}) => {
  return (
    <motion.div
      className={`
        flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 border-b border-slate-100
        ${
          isActive
            ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100"
            : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
        }
        ${isCollapsed ? "justify-center" : ""}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={`
        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0
        ${
          isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
        }
      `}
      >
        <Icon size={20} weight={isActive ? "duotone" : "regular"} />
      </div>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { icon: House, label: "Dashboard", path: "/dashboard" },
    { icon: Bed, label: "Bed Management", path: "/dashboard/beds" },
    { icon: Warning, label: "Emergency Queue", path: "/dashboard/emergencies" },
    {
      icon: Truck,
      label: "Ambulance Fleet",
      path: "/dashboard/ambulances",
    },
    { icon: MapTrifold, label: "Live Tracking", path: "/dashboard/tracking" },
    { icon: Users, label: "Patients", path: "/dashboard/patients" },
    { icon: UserCircle, label: "Staff", path: "/dashboard/staff" },
    { icon: Heartbeat, label: "Hospital Profile", path: "/dashboard/profile" },
    { icon: ChartBar, label: "Reports", path: "/dashboard/reports" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <motion.div
      animate={{
        width: isCollapsed ? 140 : 280,
      }}
      transition={{
        duration: 0.6,
        ease: [0.6, 0, 0.2, 1],
      }}
      className="fixed left-4 top-4 bottom-4 z-50 flex flex-col"
    >
      {/* Main Sidebar Container */}
      <div className="h-full bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div
          className={`border-b border-slate-100 ${isCollapsed ? "flex justify-center py-4" : "p-4"}`}
        >
          {isCollapsed ? (
            <motion.div
              className="flex items-center justify-center cursor-pointer transition-all duration-300 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-2xl"
              onClick={toggleSidebar}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 bg-slate-100 text-slate-600">
                <List size={20} />
              </div>
            </motion.div>
          ) : (
            <div>
              <motion.div
                className="flex items-center gap-3 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Heartbeat
                    size={20}
                    className="text-white"
                    weight="duotone"
                  />
                </div>
                <div>
                  <h1 className="text-slate-800 font-semibold text-lg tracking-tight">
                    AlertX
                  </h1>
                  <p className="text-slate-500 text-xs">Hospital Dashboard</p>
                </div>
              </motion.div>
              <motion.div
                className="flex items-center gap-4 px-4 py-2 rounded-2xl cursor-pointer transition-all duration-300 text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                onClick={toggleSidebar}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 bg-slate-100 text-slate-600">
                  <List size={16} />
                </div>
                <span className="text-xs font-medium">Collapse Menu</span>
              </motion.div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div
          className={`flex-1 space-y-2 overflow-y-auto overflow-x-hidden ${isCollapsed ? "p-4" : "p-4"}`}
        >
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.path}
              isCollapsed={isCollapsed}
              onClick={() => handleNavigation(item.path)}
              path={item.path}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
