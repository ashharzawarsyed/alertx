import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import {
  X,
  Phone,
  User,
  MapPin,
  Clock,
  Activity,
  Heart,
  Users,
  NavigationArrow,
} from "phosphor-react";

import trackingService from "../services/trackingService";

const AmbulanceInfoPanel = ({ ambulance, hospital, onClose }) => {
  const [eta, setEta] = useState(null);
  const [countdown, setCountdown] = useState("--:--");

  useEffect(() => {
    if (ambulance.currentEmergency?.eta) {
      setEta(new Date(ambulance.currentEmergency.eta));
    }
  }, [ambulance]);

  useEffect(() => {
    if (!eta) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = eta - now;

      if (diff <= 0) {
        setCountdown("Arriving...");
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setCountdown(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [eta]);

  const handleCallDriver = () => {
    if (ambulance.driver?.phone) {
      window.location.href = `tel:${ambulance.driver.phone}`;
    }
  };

  const handleMarkArrived = async () => {
    try {
      await trackingService.markArrived(ambulance._id, hospital._id);
      onClose();
    } catch (error) {
      console.error("Error marking arrived:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: "green",
      "en-route": "blue",
      responding: "blue",
      "at-scene": "yellow",
      returning: "purple",
      "out-of-service": "red",
    };
    return colors[status] || "gray";
  };

  const getStatusText = (status) => {
    const texts = {
      available: "Available",
      "en-route": "En Route",
      responding: "Responding",
      "at-scene": "At Scene",
      returning: "Returning",
      "out-of-service": "Out of Service",
    };
    return texts[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: "red",
      high: "orange",
      medium: "yellow",
      low: "green",
    };
    return colors[priority] || "gray";
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute top-0 right-0 h-full w-96 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-l border-gray-700/50 shadow-2xl z-20 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-700/50 p-6 backdrop-blur-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {ambulance.vehicleNumber}
            </h2>
            <div
              className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-${getStatusColor(ambulance.status)}-500/20 border border-${getStatusColor(ambulance.status)}-500/30`}
            >
              <div
                className={`w-2 h-2 rounded-full bg-${getStatusColor(ambulance.status)}-400 animate-pulse`}
              ></div>
              <span
                className={`text-sm font-medium text-${getStatusColor(ambulance.status)}-400`}
              >
                {getStatusText(ambulance.status)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* ETA */}
        {eta && (
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400">
                <Clock size={20} weight="duotone" />
                <span className="text-sm font-medium">Estimated Arrival</span>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {countdown}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Driver Info */}
        {ambulance.driver && (
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4 text-purple-400">
              <User size={20} weight="duotone" />
              <h3 className="font-semibold">Driver</h3>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                {ambulance.driver.name?.charAt(0) || "D"}
              </div>
              <div>
                <div className="text-white font-medium">
                  {ambulance.driver.name}
                </div>
                <div className="text-gray-400 text-sm">
                  {ambulance.driver.phone}
                </div>
              </div>
            </div>
            <button
              onClick={handleCallDriver}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Phone size={20} weight="fill" />
              Call Driver
            </button>
          </div>
        )}

        {/* Crew Members */}
        {ambulance.crew && ambulance.crew.length > 0 && (
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <Users size={20} weight="duotone" />
              <h3 className="font-semibold">Crew Members</h3>
            </div>
            <div className="space-y-3">
              {ambulance.crew.map((member, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {member.name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {member.name}
                    </div>
                    <div className="text-gray-400 text-xs">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patient Info */}
        {ambulance.currentEmergency?.patient && (
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4 text-pink-400">
              <Activity size={20} weight="duotone" />
              <h3 className="font-semibold">Patient Information</h3>
            </div>

            {/* Priority Badge */}
            {ambulance.currentEmergency.priority && (
              <div
                className={`inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-${getPriorityColor(ambulance.currentEmergency.priority)}-500/20 border border-${getPriorityColor(ambulance.currentEmergency.priority)}-500/30`}
              >
                <div
                  className={`w-2 h-2 rounded-full bg-${getPriorityColor(ambulance.currentEmergency.priority)}-400`}
                ></div>
                <span
                  className={`text-sm font-medium text-${getPriorityColor(ambulance.currentEmergency.priority)}-400 capitalize`}
                >
                  {ambulance.currentEmergency.priority} Priority
                </span>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Age:</span>
                <span className="text-white">
                  {ambulance.currentEmergency.patient.age || "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Gender:</span>
                <span className="text-white capitalize">
                  {ambulance.currentEmergency.patient.gender || "N/A"}
                </span>
              </div>
              {ambulance.currentEmergency.condition && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Condition:</span>
                  <span className="text-white">
                    {ambulance.currentEmergency.condition}
                  </span>
                </div>
              )}
            </div>

            {/* Vitals */}
            {ambulance.currentEmergency.vitals && (
              <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                <div className="text-xs text-gray-400 mb-2">Current Vitals</div>

                {ambulance.currentEmergency.vitals.heartRate && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart size={16} weight="fill" className="text-red-400" />
                      <span className="text-xs text-gray-400">Heart Rate</span>
                    </div>
                    <span className="text-sm text-white font-medium">
                      {ambulance.currentEmergency.vitals.heartRate} bpm
                    </span>
                  </div>
                )}

                {ambulance.currentEmergency.vitals.bloodPressure && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity
                        size={16}
                        weight="duotone"
                        className="text-blue-400"
                      />
                      <span className="text-xs text-gray-400">
                        Blood Pressure
                      </span>
                    </div>
                    <span className="text-sm text-white font-medium">
                      {ambulance.currentEmergency.vitals.bloodPressure}
                    </span>
                  </div>
                )}

                {ambulance.currentEmergency.vitals.oxygenLevel && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity
                        size={16}
                        weight="fill"
                        className="text-green-400"
                      />
                      <span className="text-xs text-gray-400">
                        Oxygen Level
                      </span>
                    </div>
                    <span className="text-sm text-white font-medium">
                      {ambulance.currentEmergency.vitals.oxygenLevel}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Location Info */}
        {ambulance.currentLocation && (
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4 text-cyan-400">
              <NavigationArrow size={20} weight="duotone" />
              <h3 className="font-semibold">Location</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Latitude:</span>
                <span className="text-white">
                  {ambulance.currentLocation.coordinates[1].toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Longitude:</span>
                <span className="text-white">
                  {ambulance.currentLocation.coordinates[0].toFixed(6)}
                </span>
              </div>
              {ambulance.speed && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Speed:</span>
                  <span className="text-white">{ambulance.speed} km/h</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {(ambulance.status === "en-route" ||
          ambulance.status === "returning") && (
          <button
            onClick={handleMarkArrived}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <MapPin size={20} weight="fill" />
            Mark as Arrived
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default AmbulanceInfoPanel;
