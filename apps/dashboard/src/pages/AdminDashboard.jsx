import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Hospital,
  Truck,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const AdminDashboard = () => {
  // Sample data for charts
  const emergencyData = [
    { time: "00:00", critical: 2, moderate: 8, minor: 15 },
    { time: "04:00", critical: 1, moderate: 5, minor: 12 },
    { time: "08:00", critical: 4, moderate: 12, minor: 25 },
    { time: "12:00", critical: 6, moderate: 18, minor: 32 },
    { time: "16:00", critical: 8, moderate: 22, minor: 28 },
    { time: "20:00", critical: 5, moderate: 15, minor: 20 },
    { time: "23:59", critical: 3, moderate: 10, minor: 16 },
  ];

  const bedUsageData = [
    { name: "Occupied", value: 65, color: "#dc2626" },
    { name: "Available", value: 25, color: "#16a34a" },
    { name: "Reserved", value: 10, color: "#2563eb" },
  ];

  const ambulanceActivityData = [
    { hour: "6AM", active: 8 },
    { hour: "9AM", active: 12 },
    { hour: "12PM", active: 15 },
    { hour: "3PM", active: 18 },
    { hour: "6PM", active: 14 },
    { hour: "9PM", active: 10 },
    { hour: "12AM", active: 6 },
  ];

  // Custom tooltip component with frosted glass style
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white/80 p-3 shadow-lg backdrop-blur-sm">
          <p className="font-medium text-gray-700">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="text-sm font-semibold"
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.6, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const radarVariants = {
    rotate: {
      rotate: 360,
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const alertPulseVariants = {
    pulse: {
      opacity: [1, 0.4, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="bg-grey-50 h-full space-y-6 overflow-y-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 font-sans text-gray-600">
            Real-time emergency management and system monitoring
          </p>
        </div>
        <div className="font-sans text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </motion.div>

      {/* Top Row - Hero Cards (Black / Dominant) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* System Health & AI Monitoring */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.01 }}
          className="relative h-80 overflow-hidden rounded-2xl border border-gray-800 bg-black p-8 shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
          }}
        >
          {/* AI Activity Pin - Animated Radar */}
          <div className="absolute top-6 right-6">
            <div className="relative h-8 w-8">
              {/* Radar Circle */}
              <motion.div
                variants={radarVariants}
                animate="rotate"
                className="absolute inset-0 rounded-full border-2 border-green-400/30"
              />
              {/* Radar Sweep Line */}
              <motion.div
                variants={radarVariants}
                animate="rotate"
                className="absolute top-1/2 left-1/2 h-0.5 w-4 origin-left -translate-y-0.5 transform bg-green-400"
                style={{ transformOrigin: "0 50%" }}
              />
              {/* Center Pulse Dot */}
              <motion.div
                variants={pulseVariants}
                animate="pulse"
                className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-green-400 shadow-lg"
              />
            </div>
          </div>

          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-8 flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/20 backdrop-blur-sm">
                <Activity className="h-7 w-7 text-blue-400" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  System Health & AI Monitoring
                </h3>
                <p className="font-sans text-gray-400">
                  Live system status & AI activity
                </p>
              </div>
            </div>

            {/* System Status Grid */}
            <div className="mb-6 grid flex-1 grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="font-sans text-gray-300">AI Service</span>
                  </div>
                  <span className="font-bold text-green-400">99%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="font-sans text-gray-300">Backend API</span>
                  </div>
                  <span className="font-bold text-green-400">100%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="font-sans text-gray-300">Database</span>
                  </div>
                  <span className="font-bold text-green-400">98%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <span className="font-sans text-gray-300">
                      Notifications
                    </span>
                  </div>
                  <span className="font-bold text-yellow-400">95%</span>
                </div>
              </div>

              {/* Live Counter */}
              <div className="flex flex-col items-center justify-center">
                <div className="mb-4 text-center">
                  <div className="font-display mb-2 text-4xl font-bold text-white">
                    4/4
                  </div>
                  <div className="font-sans text-sm text-gray-400">
                    Active Services
                  </div>
                </div>
                <div className="mb-2 h-3 w-full rounded-full bg-gray-800">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500 shadow-lg transition-all duration-500"
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="text-center">
                  <div className="font-sans text-sm font-semibold text-green-400">
                    System Uptime: 99.97%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Critical Alerts (AI / Emergency Feed) */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.01 }}
          className="relative h-80 overflow-hidden rounded-2xl border border-gray-800 bg-black p-8 shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
          }}
        >
          {/* AI Pin Indicator */}
          <motion.div
            variants={pulseVariants}
            animate="pulse"
            className="absolute top-6 right-6 h-3 w-3 rounded-full bg-red-500 shadow-lg"
          />

          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-8 flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-600/20 backdrop-blur-sm">
                <AlertTriangle className="h-7 w-7 text-red-400" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Critical Alerts Feed
                </h3>
                <p className="font-sans text-gray-400">
                  Live stream of critical issues
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {/* Hospital at Full Capacity */}
              <motion.div
                variants={alertPulseVariants}
                animate="pulse"
                className="flex items-center space-x-4 rounded-xl border border-red-800/50 bg-red-900/30 p-4 backdrop-blur-sm"
              >
                <div className="h-3 w-3 animate-ping rounded-full bg-red-400" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-sans font-semibold text-red-300">
                      🚨 City General Hospital - Full Capacity
                    </p>
                    <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-medium text-white">
                      CRITICAL
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-sm text-gray-400">
                    2 minutes ago • 0 beds available
                  </p>
                </div>
              </motion.div>

              {/* Ambulance Stuck */}
              <motion.div
                variants={alertPulseVariants}
                animate="pulse"
                className="flex items-center space-x-4 rounded-xl border border-yellow-800/50 bg-yellow-900/30 p-4 backdrop-blur-sm"
              >
                <div className="h-3 w-3 animate-pulse rounded-full bg-yellow-400" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-sans font-semibold text-yellow-300">
                      🚑 Ambulance AMB-003 - Driver Unresponsive
                    </p>
                    <span className="rounded-full bg-yellow-600 px-2 py-1 text-xs font-medium text-white">
                      WARNING
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-sm text-gray-400">
                    5 minutes ago • Last location: Downtown
                  </p>
                </div>
              </motion.div>

              {/* Failed AI Triage */}
              <div className="flex items-center space-x-4 rounded-xl border border-orange-800/50 bg-orange-900/30 p-4 backdrop-blur-sm">
                <div className="h-3 w-3 rounded-full bg-orange-400" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-sans font-semibold text-orange-300">
                      ❌ AI Triage System - Processing Error
                    </p>
                    <span className="rounded-full bg-orange-600 px-2 py-1 text-xs font-medium text-white">
                      ERROR
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-sm text-gray-400">
                    8 minutes ago • Emergency ID: EM-2401
                  </p>
                </div>
              </div>

              {/* Pending Hospital Approval */}
              <div className="flex items-center space-x-4 rounded-xl border border-purple-800/50 bg-purple-900/30 p-4 backdrop-blur-sm">
                <div className="h-3 w-3 rounded-full bg-purple-400" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-sans font-semibold text-purple-300">
                      ⚠️ Regional Medical Center - Pending Approval
                    </p>
                    <span className="rounded-full bg-purple-600 px-2 py-1 text-xs font-medium text-white">
                      PENDING
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-sm text-gray-400">
                    1 hour ago • Hospital registration review needed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Second Layer - Supporting KPI Cards (Subtle) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Hospitals */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Hospital className="h-6 w-6 text-blue-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-display text-2xl font-bold text-gray-900">
                24
              </p>
              <p className="text-sm font-medium text-gray-600">🏥 Hospitals</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-green-600">22 Approved</span>
                <span className="font-medium text-orange-600">2 Pending</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-gray-600">
                    Bed Availability
                  </span>
                  <span className="font-mono text-sm font-bold text-blue-600">
                    1,247
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ambulances */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-display text-2xl font-bold text-gray-900">
                18
              </p>
              <p className="text-sm font-medium text-gray-600">🚑 Ambulances</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-green-600">12 Active</span>
                <span className="font-medium text-gray-600">6 Idle</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-sans text-gray-600">Fleet Usage</span>
                  <span className="font-bold text-green-600">67%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: "67%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Patients */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-display text-2xl font-bold text-gray-900">
                147
              </p>
              <p className="text-sm font-medium text-gray-600">
                👥 Emergencies Today
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-red-600">8 Critical</span>
                <span className="font-medium text-yellow-600">23 Moderate</span>
              </div>
              <div className="flex items-center justify-center text-xs">
                <span className="font-medium text-green-600">116 Minor</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs text-gray-600">
                    Resolved Today
                  </span>
                  <span className="font-mono text-sm font-bold text-green-600">
                    116
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Response Time */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-display text-2xl font-bold text-gray-900">
                4.2m
              </p>
              <p className="text-sm font-medium text-gray-600">
                ⏱️ Response Time
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-600">Target: 5.0m</span>
                <span className="font-medium text-green-600">↓ 16% Better</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-sans text-gray-600">
                    Performance vs Target
                  </span>
                  <span className="font-bold text-orange-600">84%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-orange-500 transition-all duration-500"
                    style={{ width: "84%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts & Analytics Section */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.7 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900">
              Charts & Analytics
            </h2>
            <p className="font-sans text-gray-600">
              Real-time data visualization and insights
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Large Line Chart */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900">
                  Patient Emergencies Over Time
                </h3>
                <p className="font-sans text-sm text-gray-600">
                  24-hour emergency trends by severity
                </p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={emergencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="critical"
                    stroke="#dc2626"
                    strokeWidth={3}
                    dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#dc2626", strokeWidth: 2 }}
                    name="Critical"
                  />
                  <Line
                    type="monotone"
                    dataKey="moderate"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
                    name="Moderate"
                  />
                  <Line
                    type="monotone"
                    dataKey="minor"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#16a34a", strokeWidth: 2 }}
                    name="Minor"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right Column - Stacked Charts */}
          <div className="space-y-6">
            {/* Donut Chart - Hospital Bed Usage */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.9 }}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center space-x-3">
                <PieChart className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-display text-lg font-bold text-gray-900">
                    Hospital Bed Usage
                  </h3>
                  <p className="font-sans text-sm text-gray-600">
                    Current capacity overview
                  </p>
                </div>
              </div>
              <div className="relative h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={bedUsageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {bedUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-gray-900">
                      65%
                    </div>
                    <div className="font-sans text-sm text-gray-600">
                      Occupied
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                {bedUsageData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-sans text-xs text-gray-600">
                      {item.name}: {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bar Chart - Ambulance Activity */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.0 }}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center space-x-3">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-display text-lg font-bold text-gray-900">
                    Ambulance Activity
                  </h3>
                  <p className="font-sans text-sm text-gray-600">
                    Active units by hour
                  </p>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ambulanceActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="hour"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="active"
                      fill="#16a34a"
                      radius={[4, 4, 0, 0]}
                      name="Active Ambulances"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
