import { motion } from "framer-motion";
import React from "react";

import SidebarNew from "../components/SidebarNew";
import TopNavbar from "../components/TopNavbar";
import { useSidebar } from "../contexts/SidebarContext";

const LayoutV2 = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 relative overflow-hidden">
      {/* Very subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.4) 1px, transparent 1px),
              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Ultra-subtle floating elements */}
      <div className="absolute top-24 right-24 w-40 h-40 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 right-40 w-32 h-32 bg-indigo-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-purple-100/20 rounded-full blur-3xl pointer-events-none" />

      {/* Sidebar */}
      <SidebarNew />

      {/* Main Content Area - Responsive margin with smooth transition */}
      <motion.div
        animate={{
          marginLeft: isCollapsed ? 160 : 304, // Increased margin: 144px + 16px padding vs 288px + 16px padding
        }}
        transition={{
          duration: 0.6,
          ease: [0.6, 0, 0.2, 1],
        }}
        className="min-h-screen relative z-10"
      >
        {/* Main Content Container with proper spacing and rounded borders */}
        <main className="p-4 relative z-20">
          <motion.div
            className="bg-white border border-slate-200/60 rounded-3xl shadow-xl overflow-visible min-h-[calc(100vh-2rem)] relative z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.3,
              ease: [0.6, 0, 0.2, 1],
            }}
          >
            {/* Navigation Bar inside content area */}
            <TopNavbar />

            {/* Inner content with proper padding and centering */}
            <div className="bg-white relative z-40">
              <div className="max-w-full mx-auto relative z-50">
                {/* Render children component (DashboardHome) */}
                {children}
              </div>
            </div>
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
};

export default LayoutV2;
