import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Warning,
  Wrench,
  NavigationArrow,
  Phone,
  User,
  Heart,
  Lightning,
  ArrowRight,
  X,
  Package,
  Activity,
  Gauge,
  Broadcast,
} from "phosphor-react";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../../../hooks/useAuth";
import EmergencyService from "../../../services/EmergencyService";
import socketService from "../../../services/socketService";

const AmbulanceFleet = () => {
  const { user, hospital, token } = useAuth();
  const [ambulances, setAmbulances] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all"); // all, available, dispatched, enroute, maintenance
  const [viewMode, setViewMode] = useState("grid"); // grid, map, list

  const hospitalId =
    hospital?.id || hospital?._id || user?.hospitalInfo?.hospitalId;

  // Load fleet and emergency data
  const loadData = useCallback(async () => {
    if (!token || !hospitalId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load ambulance fleet
      const ambulanceData =
        await EmergencyService.getAmbulanceFleet(hospitalId);
      setAmbulances(ambulanceData || []);

      // Load pending emergencies for dispatch
      const emergencyData = await EmergencyService.getActiveEmergencies();
      const pendingEmergencies = (emergencyData || []).filter(
        (e) => e.status === "pending"
      );
      setEmergencies(pendingEmergencies);
    } catch (err) {
      console.error("Error loading fleet data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, hospitalId]);

  useEffect(() => {
    loadData();

    // Set up real-time listeners for ambulance updates
    if (hospitalId && socketService.socket?.connected) {
      socketService.onNewEmergency((data) => {
        console.log("New emergency for dispatch:", data);
        loadData();
      });

      socketService.onEmergencyUpdate((data) => {
        console.log("Emergency updated:", data);
        loadData();
      });
    }
  }, [loadData, hospitalId]);

  // Handle ambulance dispatch
  const handleDispatch = async (ambulanceId, emergencyId) => {
    try {
      await EmergencyService.dispatchAmbulance(emergencyId, ambulanceId);
      setShowDispatchModal(false);
      setSelectedAmbulance(null);
      setSelectedEmergency(null);
      loadData(); // Reload to show updated status
    } catch (err) {
      console.error("Error dispatching ambulance:", err);
      alert("Failed to dispatch ambulance. Please try again.");
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      available: {
        color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        icon: CheckCircle,
        label: "Available",
        pulse: false,
      },
      dispatched: {
        color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        icon: Lightning,
        label: "Dispatched",
        pulse: true,
      },
      enroute: {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        icon: NavigationArrow,
        label: "En Route",
        pulse: true,
      },
      maintenance: {
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        icon: Wrench,
        label: "Maintenance",
        pulse: false,
      },
    };

    const config = statusConfig[status] || statusConfig.available;
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color} backdrop-blur-sm`}
      >
        {config.pulse && (
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color.includes("blue") ? "bg-blue-400" : config.color.includes("amber") ? "bg-amber-400" : "bg-emerald-400"} opacity-75`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${config.color.includes("blue") ? "bg-blue-500" : config.color.includes("amber") ? "bg-amber-500" : "bg-emerald-500"}`}
            ></span>
          </span>
        )}
        {!config.pulse && <Icon weight="bold" className="text-sm" />}
        <span className="text-xs font-semibold tracking-wide uppercase">
          {config.label}
        </span>
      </div>
    );
  };

  // Filter ambulances by status
  const filteredAmbulances = ambulances.filter((amb) =>
    filterStatus === "all" ? true : amb.status === filterStatus
  );

  // Calculate metrics
  const metrics = {
    total: ambulances.length,
    available: ambulances.filter((a) => a.status === "available").length,
    dispatched: ambulances.filter((a) => a.status === "dispatched").length,
    enroute: ambulances.filter((a) => a.status === "enroute").length,
    maintenance: ambulances.filter((a) => a.status === "maintenance").length,
  };

  // Ambulance Card Component
  const AmbulanceCard = ({ ambulance }) => {
    const isActive = ["dispatched", "enroute"].includes(ambulance.status);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4 }}
        className="group relative bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 backdrop-blur-xl overflow-hidden transition-all duration-300"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Active pulse effect */}
        {isActive && (
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        )}

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${isActive ? "bg-blue-500/20 border border-blue-500/30" : "bg-gray-700/50 border border-gray-600/30"} backdrop-blur-sm`}
              >
                <Truck
                  weight="duotone"
                  className={`text-2xl ${isActive ? "text-blue-400" : "text-gray-400"}`}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {ambulance.callSign}
                </h3>
                <p className="text-sm text-gray-400">ID: {ambulance.id}</p>
              </div>
            </div>
            <StatusBadge status={ambulance.status} />
          </div>

          {/* Driver Info */}
          <div className="flex items-center gap-2 mb-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
            <User weight="duotone" className="text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-400">Driver</p>
              <p className="text-sm font-semibold text-white">
                {ambulance.driver?.name || "Not Assigned"}
              </p>
            </div>
            <Phone
              weight="duotone"
              className="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors"
            />
          </div>

          {/* Current Assignment */}
          {ambulance.currentAssignment && (
            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Warning weight="fill" className="text-amber-400" />
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                  Active Assignment
                </p>
              </div>
              <p className="text-sm text-white">
                Emergency ID: {ambulance.currentAssignment.id}
              </p>
              {ambulance.estimatedArrival && (
                <div className="flex items-center gap-2 mt-2 text-amber-300">
                  <Clock weight="bold" className="text-xs" />
                  <p className="text-xs font-medium">
                    ETA: {ambulance.estimatedArrival} mins
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 mb-4 text-gray-300">
            <MapPin weight="duotone" className="text-blue-400" />
            <p className="text-sm">
              {ambulance.location || "Unknown Location"}
            </p>
          </div>

          {/* Equipment */}
          {ambulance.equipment && ambulance.equipment.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Package weight="duotone" className="text-purple-400 text-sm" />
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Equipment
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ambulance.equipment.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-purple-500/10 text-purple-300 rounded-md border border-purple-500/20"
                  >
                    {item}
                  </span>
                ))}
                {ambulance.equipment.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-700/50 text-gray-400 rounded-md">
                    +{ambulance.equipment.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-700/50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedAmbulance(ambulance);
                setShowDetailsModal(true);
              }}
              className="flex-1 px-4 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg font-medium text-sm transition-colors border border-gray-600/30 hover:border-gray-500/50"
            >
              View Details
            </motion.button>
            {ambulance.status === "available" && emergencies.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedAmbulance(ambulance);
                  setShowDispatchModal(true);
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                <span className="flex items-center justify-center gap-2">
                  <Lightning weight="fill" />
                  Dispatch
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Dispatch Modal
  const DispatchModal = () => (
    <AnimatePresence>
      {showDispatchModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDispatchModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl border border-gray-700/50 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                    <Lightning
                      weight="fill"
                      className="text-2xl text-blue-400"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Dispatch Ambulance
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedAmbulance?.callSign} -{" "}
                      {selectedAmbulance?.driver?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <X className="text-xl text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Emergency List */}
            <div className="p-6 overflow-y-auto max-h-96">
              <p className="text-sm text-gray-400 mb-4">
                Select an emergency to assign to {selectedAmbulance?.callSign}
              </p>
              <div className="space-y-3">
                {emergencies.map((emergency) => (
                  <motion.div
                    key={emergency.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedEmergency(emergency)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedEmergency?.id === emergency.id
                        ? "bg-blue-500/20 border-blue-500/50"
                        : "bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-white">
                          {emergency.patientName}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {emergency.patientAge}y, {emergency.patientGender}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          emergency.priority === "critical"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {emergency.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      {emergency.condition}
                    </p>
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <MapPin weight="fill" />
                      <span>{emergency.location}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700/50 bg-gray-800/30">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl font-medium transition-colors border border-gray-600/30"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedEmergency) {
                      handleDispatch(
                        selectedAmbulance.id,
                        selectedEmergency.id
                      );
                    }
                  }}
                  disabled={!selectedEmergency}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg disabled:shadow-none"
                >
                  <span className="flex items-center justify-center gap-2">
                    Confirm Dispatch
                    <ArrowRight weight="bold" />
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Details Modal
  const DetailsModal = () => (
    <AnimatePresence>
      {showDetailsModal && selectedAmbulance && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl border border-gray-700/50 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                    <Truck
                      weight="duotone"
                      className="text-3xl text-blue-400"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedAmbulance.callSign}
                    </h2>
                    <p className="text-sm text-gray-400">
                      ID: {selectedAmbulance.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <X className="text-xl text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              {/* Status */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">
                  Status
                </label>
                <StatusBadge status={selectedAmbulance.status} />
              </div>

              {/* Driver Info */}
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-3 block">
                  Driver Information
                </label>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <User weight="duotone" className="text-xl text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {selectedAmbulance.driver?.name || "Not Assigned"}
                    </p>
                    <p className="text-sm text-gray-400">Primary Driver</p>
                  </div>
                  <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors">
                    <Phone weight="fill" className="text-blue-400" />
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-3 block">
                  Current Location
                </label>
                <div className="flex items-center gap-3">
                  <MapPin
                    weight="duotone"
                    className="text-xl text-purple-400"
                  />
                  <p className="text-white">{selectedAmbulance.location}</p>
                </div>
              </div>

              {/* Equipment */}
              {selectedAmbulance.equipment && (
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-3 block">
                    Onboard Equipment
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedAmbulance.equipment.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20"
                      >
                        <Package weight="duotone" className="text-purple-400" />
                        <span className="text-sm text-purple-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Assignment */}
              {selectedAmbulance.currentAssignment && (
                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  <label className="text-xs text-amber-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Warning weight="fill" />
                    Active Assignment
                  </label>
                  <div className="space-y-2">
                    <p className="text-white font-semibold">
                      Emergency ID: {selectedAmbulance.currentAssignment.id}
                    </p>
                    {selectedAmbulance.estimatedArrival && (
                      <div className="flex items-center gap-2 text-amber-300">
                        <Clock weight="bold" />
                        <p className="text-sm">
                          ETA: {selectedAmbulance.estimatedArrival} minutes
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700/50 bg-gray-800/30">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl font-medium transition-colors border border-gray-600/30"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Truck className="text-5xl text-blue-400" weight="duotone" />
          </motion.div>
          <p className="text-gray-400">Loading fleet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Ambulance Fleet
            </h1>
            <p className="text-gray-400">
              Real-time tracking and dispatch coordination
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 p-1 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                viewMode === "list"
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                viewMode === "map"
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Map
            </button>
          </div>
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="relative group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 backdrop-blur-xl overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <Truck weight="duotone" className="text-3xl text-blue-400" />
                <Gauge weight="duotone" className="text-gray-600" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {metrics.total}
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Total Fleet
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="relative group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 hover:border-emerald-500/50 backdrop-blur-xl overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle
                  weight="duotone"
                  className="text-3xl text-emerald-400"
                />
                <Activity weight="duotone" className="text-gray-600" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {metrics.available}
              </p>
              <p className="text-xs text-emerald-400 uppercase tracking-wide">
                Available
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="relative group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/50 backdrop-blur-xl overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <Lightning weight="fill" className="text-3xl text-amber-400" />
                <Broadcast weight="duotone" className="text-gray-600" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {metrics.dispatched}
              </p>
              <p className="text-xs text-amber-400 uppercase tracking-wide">
                Dispatched
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="relative group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 backdrop-blur-xl overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <NavigationArrow
                  weight="duotone"
                  className="text-3xl text-blue-400"
                />
                <MapPin weight="duotone" className="text-gray-600" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {metrics.enroute}
              </p>
              <p className="text-xs text-blue-400 uppercase tracking-wide">
                En Route
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="relative group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 hover:border-gray-500/50 backdrop-blur-xl overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <Wrench weight="duotone" className="text-3xl text-gray-400" />
                <Warning weight="duotone" className="text-gray-600" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {metrics.maintenance}
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Maintenance
              </p>
            </div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2 p-1 bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm"
        >
          {[
            { key: "all", label: "All Units", count: metrics.total },
            { key: "available", label: "Available", count: metrics.available },
            {
              key: "dispatched",
              label: "Dispatched",
              count: metrics.dispatched,
            },
            { key: "enroute", label: "En Route", count: metrics.enroute },
            {
              key: "maintenance",
              label: "Maintenance",
              count: metrics.maintenance,
            },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                filterStatus === filter.key
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              {filter.label}
              <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                {filter.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Ambulance Grid */}
        {viewMode === "grid" && (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredAmbulances.map((ambulance) => (
                <AmbulanceCard key={ambulance.id} ambulance={ambulance} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-3">
            {filteredAmbulances.map((ambulance) => (
              <motion.div
                key={ambulance.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/50 hover:border-blue-500/50 backdrop-blur-xl transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Truck
                      weight="duotone"
                      className="text-2xl text-blue-400"
                    />
                    <div>
                      <h3 className="font-bold text-white">
                        {ambulance.callSign}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {ambulance.driver?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {ambulance.location}
                      </p>
                      {ambulance.currentAssignment && (
                        <p className="text-xs text-amber-400">
                          Assignment: {ambulance.currentAssignment.id}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={ambulance.status} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Map View Placeholder */}
        {viewMode === "map" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-xl p-12 text-center"
          >
            <MapPin
              weight="duotone"
              className="text-6xl text-blue-400 mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-white mb-2">
              Interactive Map View
            </h3>
            <p className="text-gray-400 mb-6">
              Real-time ambulance tracking with GPS integration
            </p>
            <div className="inline-block px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 font-medium">
              Map integration coming soon
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredAmbulances.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Truck
              className="text-6xl text-gray-600 mx-auto mb-4"
              weight="duotone"
            />
            <p className="text-gray-400">No ambulances found for this filter</p>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <DispatchModal />
      <DetailsModal />
    </div>
  );
};

export default AmbulanceFleet;
