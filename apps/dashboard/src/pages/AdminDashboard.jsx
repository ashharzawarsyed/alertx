import React from "react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full space-y-6"
    >
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 font-sans text-gray-600">
            Monitor and manage emergency operations
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/30 bg-white/20 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Emergencies
              </p>
              <p className="text-3xl font-bold text-red-600">12</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <span className="text-xl text-red-600">🚨</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span className="text-red-600">+3</span> from last hour
          </div>
        </div>

        <div className="rounded-xl border border-white/30 bg-white/20 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Available Ambulances
              </p>
              <p className="text-3xl font-bold text-green-600">8</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <span className="text-xl text-green-600">🚑</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span className="text-green-600">2</span> dispatched
          </div>
        </div>

        <div className="rounded-xl border border-white/30 bg-white/20 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Registered Hospitals
              </p>
              <p className="text-3xl font-bold text-blue-600">24</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <span className="text-xl text-blue-600">🏥</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span className="text-blue-600">22</span> online
          </div>
        </div>

        <div className="rounded-xl border border-white/30 bg-white/20 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-3xl font-bold text-purple-600">4.2m</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <span className="text-xl text-purple-600">⏱️</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span className="text-green-600">-0.3m</span> from average
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Emergencies */}
        <div className="rounded-xl border border-white/30 bg-white/20 p-6 backdrop-blur-sm">
          <h3 className="font-display mb-4 text-xl font-semibold text-gray-900">
            Recent Emergencies
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-lg bg-white/10 p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Emergency #{1000 + item}
                    </p>
                    <p className="text-sm text-gray-600">
                      Medical emergency • 5 mins ago
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
                  In Progress
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hospital Status */}
        <div className="rounded-xl border border-white/30 bg-white/20 p-6 backdrop-blur-sm">
          <h3 className="font-display mb-4 text-xl font-semibold text-gray-900">
            Hospital Status
          </h3>
          <div className="space-y-4">
            {[
              { name: "City General Hospital", beds: 12, status: "High" },
              { name: "Medical Center East", beds: 8, status: "Medium" },
              { name: "Emergency Care Unit", beds: 3, status: "Low" },
              { name: "Regional Medical Center", beds: 15, status: "High" },
            ].map((hospital, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-white/10 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{hospital.name}</p>
                  <p className="text-sm text-gray-600">
                    {hospital.beds} available beds
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    hospital.status === "High"
                      ? "bg-green-100 text-green-800"
                      : hospital.status === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {hospital.status} Capacity
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
