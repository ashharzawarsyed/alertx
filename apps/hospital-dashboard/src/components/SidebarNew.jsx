import { motion, AnimatePresence } from "framer-motion";
import {
  ChartLineUp,
  House,
  Buildings,
  Users,
  Truck,
  MapPin,
  ChartBar,
  Gear,
  List,
} from "phosphor-react";
import React, { useState } from "react";

import { useSidebar } from "../contexts/SidebarContext";

const SidebarItem = ({ icon: Icon, label, isActive, isCollapsed, onClick }) => {
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
  const [activeItem, setActiveItem] = useState("Dashboard");

  const navigationItems = [
    { icon: House, label: "Dashboard" },
    { icon: Buildings, label: "Hospitals" },
    { icon: Users, label: "Patients" },
    { icon: Truck, label: "Ambulances" },
    { icon: MapPin, label: "Maps" },
    { icon: ChartLineUp, label: "Analytics" },
    { icon: Gear, label: "Controls" },
  ];

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
            <motion.div
              className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              onClick={toggleSidebar}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 bg-slate-100 text-slate-600">
                <List size={20} />
              </div>
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Menu
              </motion.span>
            </motion.div>
          )}
        </div>

        {/* Navigation Items */}
        <div
          className={`flex-1 space-y-2 overflow-hidden ${isCollapsed ? "p-4" : "p-4"}`}
        >
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={activeItem === item.label}
              isCollapsed={isCollapsed}
              onClick={() => setActiveItem(item.label)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
