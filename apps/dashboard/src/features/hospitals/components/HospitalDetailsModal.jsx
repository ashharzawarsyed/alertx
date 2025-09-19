import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Phone,
  Mail,
  Bed,
  Activity,
  Star,
  Car,
  Heart,
  Shield,
  Edit3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { clsx } from "clsx";

const HospitalDetailsModal = ({ hospital, isOpen, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!hospital || !isOpen) return null;

  const getStatusConfig = (status) => {
    switch (status) {
      case "operational":
        return {
          color: "text-green-600",
          bg: "bg-green-100",
          icon: CheckCircle,
          label: "Operational",
        };
      case "maintenance":
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          icon: AlertTriangle,
          label: "Under Maintenance",
        };
      case "critical":
        return {
          color: "text-red-600",
          bg: "bg-red-100",
          icon: XCircle,
          label: "Critical Status",
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-100",
          icon: AlertTriangle,
          label: "Unknown",
        };
    }
  };

  const statusConfig = getStatusConfig(hospital.status);
  const StatusIcon = statusConfig.icon;

  const bedUtilization =
    ((hospital.totalBeds - hospital.availableBeds) / hospital.totalBeds) * 100;
  const icuUtilization =
    ((hospital.icuBeds - hospital.availableIcuBeds) / hospital.icuBeds) * 100;

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "capacity", label: "Capacity", icon: Bed },
    { id: "services", label: "Services", icon: Heart },
    { id: "performance", label: "Performance", icon: TrendingUp },
  ];

  const performanceMetrics = [
    {
      label: "Patient Satisfaction",
      value: "94%",
      trend: "up",
      change: "+2.3%",
    },
    {
      label: "Average Wait Time",
      value: "18 min",
      trend: "down",
      change: "-5 min",
    },
    { label: "Bed Turnover Rate", value: "85%", trend: "up", change: "+1.2%" },
    {
      label: "Emergency Response",
      value: hospital.responseTime,
      trend: "down",
      change: "-2 min",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="relative flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <StatusIcon className={clsx("h-6 w-6", statusConfig.color)} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900">
                  {hospital.name}
                </h2>
                <div className="mt-1 flex items-center gap-4">
                  <div
                    className={clsx(
                      "flex items-center gap-2 rounded-lg px-3 py-1",
                      statusConfig.bg,
                    )}
                  >
                    <span
                      className={clsx(
                        "text-sm font-medium",
                        statusConfig.color,
                      )}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">
                      {hospital.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onEdit(hospital)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Edit3 className="h-4 w-4" />
                Edit Hospital
              </motion.button>

              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700",
                  )}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Basic Information */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {hospital.location}
                          </p>
                          <p className="text-sm text-gray-600">
                            {hospital.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <p className="text-sm text-gray-900">
                          {hospital.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <p className="text-sm text-gray-900">
                          info@{hospital.name.toLowerCase().replace(/\s+/g, "")}
                          .com
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Facilities</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            Emergency Parking
                          </span>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          Available
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            Trauma Center Level
                          </span>
                        </div>
                        <span className="text-sm font-medium text-blue-600">
                          {hospital.emergencyRoom}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <h3 className="mb-4 font-semibold text-gray-900">
                    Medical Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {hospital.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "capacity" && (
              <motion.div
                key="capacity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* General Beds */}
                  <div className="rounded-lg border border-gray-200 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                        <Bed className="h-5 w-5" />
                        General Beds
                      </h3>
                      <span className="text-2xl font-bold text-gray-900">
                        {hospital.availableBeds}/{hospital.totalBeds}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilization</span>
                        <span className="font-medium">
                          {Math.round(bedUtilization)}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={clsx(
                            "h-2 rounded-full transition-all",
                            bedUtilization >= 90
                              ? "bg-red-500"
                              : bedUtilization >= 75
                                ? "bg-yellow-500"
                                : "bg-green-500",
                          )}
                          style={{ width: `${bedUtilization}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ICU Beds */}
                  <div className="rounded-lg border border-gray-200 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                        <Activity className="h-5 w-5" />
                        ICU Beds
                      </h3>
                      <span className="text-2xl font-bold text-gray-900">
                        {hospital.availableIcuBeds}/{hospital.icuBeds}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilization</span>
                        <span className="font-medium">
                          {Math.round(icuUtilization)}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={clsx(
                            "h-2 rounded-full transition-all",
                            icuUtilization >= 90
                              ? "bg-red-500"
                              : icuUtilization >= 75
                                ? "bg-yellow-500"
                                : "bg-green-500",
                          )}
                          style={{ width: `${icuUtilization}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capacity Breakdown */}
                <div className="rounded-lg border border-gray-200 p-6">
                  <h3 className="mb-4 font-semibold text-gray-900">
                    Detailed Capacity
                  </h3>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">24</p>
                      <p className="text-sm text-gray-600">Emergency Beds</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">18</p>
                      <p className="text-sm text-gray-600">Surgery Rooms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">6</p>
                      <p className="text-sm text-gray-600">Trauma Bays</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">12</p>
                      <p className="text-sm text-gray-600">Isolation Rooms</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "services" && (
              <motion.div
                key="services"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-4 font-semibold text-gray-900">
                      Emergency Services
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                        <span className="text-sm font-medium">
                          Trauma Center
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {hospital.emergencyRoom}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                        <span className="text-sm font-medium">
                          24/7 Emergency Room
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 font-semibold text-gray-900">
                      Operating Hours
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                        <span className="text-sm font-medium">
                          Emergency Services
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          24/7
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                        <span className="text-sm font-medium">
                          Outpatient Services
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          6:00 AM - 10:00 PM
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                        <span className="text-sm font-medium">
                          Visitor Hours
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          8:00 AM - 8:00 PM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "performance" && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {performanceMetrics.map((metric, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 p-6"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          {metric.label}
                        </span>
                        <div className="flex items-center gap-1">
                          {metric.trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={clsx(
                              "text-sm font-medium",
                              metric.trend === "up"
                                ? "text-green-600"
                                : "text-red-600",
                            )}
                          >
                            {metric.change}
                          </span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-gray-200 p-6">
                  <h3 className="mb-4 font-semibold text-gray-900">
                    Recent Updates
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Equipment maintenance completed
                        </p>
                        <p className="text-xs text-gray-600">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          New ICU beds operational
                        </p>
                        <p className="text-xs text-gray-600">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HospitalDetailsModal;
