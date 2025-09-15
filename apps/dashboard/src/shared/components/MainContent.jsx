import React from "react";
import { motion } from "framer-motion";

const MainContent = ({ children }) => {
  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="fixed top-20 right-4 bottom-4 left-80 overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-2xl"
    >
      <div className="h-full overflow-y-auto p-8">
        {children || (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-md"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500">
                <span className="text-3xl">🚨</span>
              </div>
              <h2 className="font-display mb-4 text-3xl font-bold text-gray-900">
                Welcome to AlertX Dashboard
              </h2>
              <p className="font-sans text-lg leading-relaxed text-gray-600">
                Your smart emergency management system is ready. Monitor
                emergencies, manage hospitals, and coordinate ambulance
                dispatches all from one powerful dashboard.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-white/30 bg-white/20 p-4 backdrop-blur-sm">
                  <div className="mb-1 font-semibold text-gray-900">
                    Active Emergencies
                  </div>
                  <div className="text-2xl font-bold text-red-600">12</div>
                </div>
                <div className="rounded-xl border border-white/30 bg-white/20 p-4 backdrop-blur-sm">
                  <div className="mb-1 font-semibold text-gray-900">
                    Available Ambulances
                  </div>
                  <div className="text-2xl font-bold text-green-600">8</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.main>
  );
};

export default MainContent;
