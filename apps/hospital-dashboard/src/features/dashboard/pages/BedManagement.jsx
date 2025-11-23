import {
  Plus,
  Minus,
  ArrowsClockwise,
  Warning,
  X,
  Bed,
  CheckCircle,
  Clock,
} from "phosphor-react";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../../../hooks/useAuth";
import hospitalService from "../../../services/hospitalService";
import socketService from "../../../services/socketService";

const BedManagement = () => {
  const { user, hospital, token } = useAuth();
  const [hospitalData, setHospitalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  const [bedChanges, setBedChanges] = useState({
    general: 0,
    icu: 0,
    emergency: 0,
    operation: 0,
  });

  const hospitalId =
    hospital?.id || hospital?._id || user?.hospitalInfo?.hospitalId;

  const loadHospitalData = useCallback(async () => {
    if (!hospitalId) return;

    try {
      setLoading(true);
      const response = await hospitalService.getHospitalDetails(hospitalId);

      if (response.success) {
        setHospitalData(response.data.hospital || response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading hospital data:", error);
      showToast(error.message, "error");
      setLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    loadHospitalData();
  }, [loadHospitalData]);

  useEffect(() => {
    if (!hospitalId || !token) return;

    socketService.connect(hospitalId, token);
    socketService.joinHospitalRoom(hospitalId);

    socketService.onBedUpdate((data) => {
      console.log("Bed updated via socket:", data);
      setHospitalData((prev) => ({
        ...prev,
        availableBeds: data.availableBeds,
        lastBedUpdate: data.lastBedUpdate,
      }));
      showToast("Bed status updated in real-time", "success");
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [hospitalId, token]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBedChange = (bedType, delta) => {
    const currentAvailable = hospitalData.availableBeds[bedType];
    const total = hospitalData.totalBeds[bedType];
    const newValue = currentAvailable + delta;

    if (newValue < 0 || newValue > total) {
      showToast(
        `Cannot set ${bedType} beds to ${newValue}. Must be between 0 and ${total}.`,
        "error"
      );
      return;
    }

    setBedChanges((prev) => ({
      ...prev,
      [bedType]: (prev[bedType] || 0) + delta,
    }));
  };

  const getCurrentAvailable = (bedType) => {
    return hospitalData.availableBeds[bedType] + (bedChanges[bedType] || 0);
  };

  const hasChanges = () => {
    return Object.values(bedChanges).some((val) => val !== 0);
  };

  const handleUpdateBeds = async () => {
    if (!hasChanges()) {
      showToast("No changes to save", "info");
      return;
    }

    try {
      setUpdating(true);

      const newAvailableBeds = {
        general: getCurrentAvailable("general"),
        icu: getCurrentAvailable("icu"),
        emergency: getCurrentAvailable("emergency"),
        operation: getCurrentAvailable("operation"),
      };

      const response = await hospitalService.updateBedAvailability(
        hospitalId,
        newAvailableBeds
      );

      if (response.success) {
        setHospitalData(response.data);
        setBedChanges({ general: 0, icu: 0, emergency: 0, operation: 0 });
        showToast("Bed availability updated successfully", "success");

        // Emit socket event
        socketService.emitBedUpdate({
          hospitalId,
          availableBeds: newAvailableBeds,
        });
      }

      setUpdating(false);
    } catch (error) {
      console.error("Error updating beds:", error);
      showToast(error.message, "error");
      setUpdating(false);
    }
  };

  const handleResetChanges = () => {
    setBedChanges({ general: 0, icu: 0, emergency: 0, operation: 0 });
    showToast("Changes reset", "info");
  };

  const getBedTypeConfig = () => [
    {
      type: "general",
      label: "General Beds",
      description: "Standard patient beds for general admission",
      color: "blue",
      icon: "💙",
    },
    {
      type: "icu",
      label: "ICU Beds",
      description: "Intensive Care Unit beds for critical patients",
      color: "red",
      icon: "❤️",
    },
    {
      type: "emergency",
      label: "Emergency Beds",
      description: "Emergency department beds for urgent care",
      color: "orange",
      icon: "🧡",
    },
    {
      type: "operation",
      label: "Operation Theater",
      description: "Operating rooms for surgical procedures",
      color: "purple",
      icon: "💜",
    },
  ];

  const getUtilization = (bedType) => {
    const total = hospitalData.totalBeds[bedType];
    const available = getCurrentAvailable(bedType);
    if (total === 0) return 0;
    return Math.round(((total - available) / total) * 100);
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return "text-red-600";
    if (utilization >= 70) return "text-orange-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-300 text-lg font-medium">Loading bed management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${
              toast.type === "success"
                ? "bg-green-500/90 text-white border-green-400/50"
                : toast.type === "error"
                  ? "bg-red-500/90 text-white border-red-400/50"
                  : "bg-blue-500/90 text-white border-blue-400/50"
            }`}
          >
            {toast.type === "success" && (
              <CheckCircle size={24} weight="bold" className="flex-shrink-0" />
            )}
            {toast.type === "error" && (
              <Warning size={24} weight="bold" className="flex-shrink-0" />
            )}
            {toast.type === "info" && (
              <ArrowsClockwise size={24} weight="bold" className="flex-shrink-0" />
            )}
            <span className="font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
            <Bed weight="duotone" className="text-blue-400" size={48} />
            Bed Management
          </h1>
          <p className="text-gray-400 mt-2 ml-16">
            Update bed availability in real-time across all departments
          </p>
        </div>
        {hasChanges() && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetChanges}
              disabled={updating}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all border border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={18} weight="bold" />
              Reset
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpdateBeds}
              disabled={updating}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? (
                <>
                  <ArrowsClockwise size={20} className="animate-spin" weight="bold" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={20} weight="bold" />
                  Save Changes
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Warning for High Utilization */}
      <AnimatePresence>
        {getBedTypeConfig().some(
          (config) => getUtilization(config.type) >= 90
        ) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-5 flex items-start gap-4 shadow-xl">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Warning size={28} className="text-red-400" weight="fill" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg mb-1">
                  Critical Capacity Alert
                </h3>
                <p className="text-red-200 text-sm">
                  One or more bed types are at 90% or higher utilization. Consider
                  coordinating with nearby hospitals for patient overflow.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bed Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {getBedTypeConfig().map((config, index) => {
          const total = hospitalData.totalBeds[config.type];
          const currentAvailable = getCurrentAvailable(config.type);
          const occupied = total - currentAvailable;
          const utilization = getUtilization(config.type);
          const change = bedChanges[config.type];

          const colorMap = {
            blue: { gradient: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", text: "text-blue-400", bg: "bg-blue-500/10" },
            red: { gradient: "from-red-500/20 to-pink-500/20", border: "border-red-500/30", text: "text-red-400", bg: "bg-red-500/10" },
            orange: { gradient: "from-orange-500/20 to-amber-500/20", border: "border-orange-500/30", text: "text-orange-400", bg: "bg-orange-500/10" },
            purple: { gradient: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", text: "text-purple-400", bg: "bg-purple-500/10" },
          };

          const colors = colorMap[config.color];

          return (
            <motion.div
              key={config.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all`}></div>
              <div className={`relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border ${change !== 0 ? colors.border + " border-2 shadow-lg shadow-" + config.color + "-500/20" : "border-gray-700/50"} shadow-xl hover:shadow-2xl transition-all`}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center border ${colors.border}`}>
                        <span className="text-2xl">{config.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {config.label}
                        </h3>
                        <p className="text-sm text-gray-400">{config.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl ${
                    utilization >= 90 ? "bg-red-500/20 border border-red-500/30" :
                    utilization >= 70 ? "bg-orange-500/20 border border-orange-500/30" :
                    "bg-green-500/20 border border-green-500/30"
                  }`}>
                    <span className={`text-2xl font-bold ${
                      utilization >= 90 ? "text-red-400" :
                      utilization >= 70 ? "text-orange-400" : "text-green-400"
                    }`}>
                      {utilization}%
                    </span>
                  </div>
                </div>

                {/* Current Status */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="text-center p-3 bg-gray-700/30 rounded-xl border border-gray-600/30">
                    <p className="text-3xl font-bold text-white">{total}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Total</p>
                  </div>
                  <div className="text-center p-3 bg-gray-700/30 rounded-xl border border-gray-600/30 relative">
                    <p className={`text-3xl font-bold ${change !== 0 ? colors.text : "text-green-400"}`}>
                      {currentAvailable}
                    </p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Available</p>
                    {change !== 0 && (
                      <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-lg font-bold text-xs ${
                        change > 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      } shadow-lg`}>
                        {change > 0 ? "+" : ""}{change}
                      </div>
                    )}
                  </div>
                  <div className="text-center p-3 bg-gray-700/30 rounded-xl border border-gray-600/30">
                    <p className="text-3xl font-bold text-white">{occupied}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Occupied</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800/50 rounded-full h-4 mb-5 overflow-hidden border border-gray-700/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${utilization}%` }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                    className={`h-full ${
                      utilization >= 90
                        ? "bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/50"
                        : utilization >= 70
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/50"
                          : "bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/50"
                    }`}
                  ></motion.div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBedChange(config.type, -1)}
                    disabled={currentAvailable <= 0}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-300 hover:text-red-200 font-bold rounded-xl transition-all border border-red-500/30 hover:border-red-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-red-500/10"
                  >
                    <Minus size={20} weight="bold" />
                    Occupy
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBedChange(config.type, 1)}
                    disabled={currentAvailable >= total}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 text-green-300 hover:text-green-200 font-bold rounded-xl transition-all border border-green-500/30 hover:border-green-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-green-500/10"
                  >
                    <Plus size={20} weight="bold" />
                    Release
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Last Update Info */}
      {hospitalData.lastBedUpdate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50">
            <Clock weight="duotone" className="text-gray-400" size={16} />
            <span className="text-sm text-gray-400">
              Last updated: {new Date(hospitalData.lastBedUpdate).toLocaleString()}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BedManagement;
