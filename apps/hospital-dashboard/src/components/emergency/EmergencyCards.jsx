import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  Phone,
  User,
  Heart,
  Truck,
  ArrowRight,
  Warning,
} from "phosphor-react";
import React from "react";

import {
  PriorityBadge,
  StatusBadge,
  TimeDisplay,
} from "../ui/DashboardComponents";

/**
 * Emergency Card Component - Displays active emergency calls
 */
export const EmergencyCard = ({ emergency, onDispatch, onViewDetails }) => {
  const {
    id,
    patientName,
    patientAge,
    patientGender,
    condition,
    priority,
    status,
    location,
    createdAt,
    assignedAmbulance,
    estimatedResponseTime,
    symptoms,
    vitals,
  } = emergency;

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "critical":
        return <Warning size={16} weight="fill" className="text-red-500" />;
      case "high":
        return <Heart size={16} weight="fill" className="text-orange-500" />;
      default:
        return <Heart size={16} weight="duotone" className="text-blue-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 p-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getPriorityIcon(priority)}
          <span className="font-semibold text-slate-800">#{id}</span>
          <PriorityBadge priority={priority} size="small" />
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} size="small" />
          <TimeDisplay timestamp={createdAt} format="relative" />
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <User size={16} className="text-slate-600" />
          <span className="font-medium text-slate-800">
            {patientName}, {patientAge}y ({patientGender})
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin size={14} className="text-slate-500" />
          <span className="truncate">{location}</span>
        </div>
      </div>

      {/* Condition */}
      <div className="mb-3">
        <div className="text-sm font-medium text-slate-700 mb-1">Condition</div>
        <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-2">
          {condition}
        </div>
        {symptoms && symptoms.length > 0 && (
          <div className="mt-2">
            <div className="text-xs font-medium text-slate-600 mb-1">
              Symptoms
            </div>
            <div className="flex flex-wrap gap-1">
              {symptoms.slice(0, 3).map((symptom, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                >
                  {symptom}
                </span>
              ))}
              {symptoms.length > 3 && (
                <span className="text-xs text-slate-500">
                  +{symptoms.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Vitals if available */}
      {vitals && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {vitals.heartRate && (
            <div className="text-center bg-red-50 rounded-lg p-2">
              <div className="text-xs text-red-600 font-medium">HR</div>
              <div className="text-sm font-bold text-red-700">
                {vitals.heartRate}
              </div>
            </div>
          )}
          {vitals.bloodPressure && (
            <div className="text-center bg-blue-50 rounded-lg p-2">
              <div className="text-xs text-blue-600 font-medium">BP</div>
              <div className="text-sm font-bold text-blue-700">
                {vitals.bloodPressure}
              </div>
            </div>
          )}
          {vitals.temperature && (
            <div className="text-center bg-orange-50 rounded-lg p-2">
              <div className="text-xs text-orange-600 font-medium">Temp</div>
              <div className="text-sm font-bold text-orange-700">
                {vitals.temperature}°F
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ambulance Status */}
      {assignedAmbulance ? (
        <div className="mb-3 flex items-center gap-2 text-sm bg-green-50 rounded-lg p-2">
          <Truck size={14} className="text-green-600" />
          <span className="text-green-700 font-medium">
            Ambulance {assignedAmbulance.id} assigned
          </span>
          {estimatedResponseTime && (
            <div className="ml-auto flex items-center gap-1 text-green-600">
              <Clock size={12} />
              <span className="text-xs">{estimatedResponseTime} min</span>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-3 flex items-center gap-2 text-sm bg-yellow-50 rounded-lg p-2">
          <Warning size={14} className="text-yellow-600" />
          <span className="text-yellow-700 font-medium">
            Awaiting ambulance dispatch
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          onClick={() => onViewDetails(emergency)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View Details
          <ArrowRight size={14} />
        </button>

        {!assignedAmbulance && status !== "completed" && (
          <button
            onClick={() => onDispatch(emergency)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Truck size={14} />
            Dispatch
          </button>
        )}

        {assignedAmbulance && (
          <button className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
            <Phone size={14} />
            Contact
          </button>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Ambulance Status Card Component
 */
export const AmbulanceCard = ({ ambulance, onAssign, onTrack }) => {
  const {
    id = ambulance._id,
    callSign = ambulance.vehicleNumber,
    status,
    driver = ambulance.crew?.[0],
    location = ambulance.currentLocation?.address,
    currentAssignment,
    estimatedArrival,
    equipment = ambulance.equipment || [],
    type,
    fuelLevel,
    crew,
  } = ambulance;

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-100";
      case "dispatched":
        return "text-blue-600 bg-blue-100";
      case "enroute":
      case "en-route":
        return "text-purple-600 bg-purple-100";
      case "busy":
        return "text-orange-600 bg-orange-100";
      case "maintenance":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Truck size={20} className="text-slate-600" />
          <div>
            <div className="font-semibold text-slate-800">{callSign}</div>
            <div className="text-xs text-slate-500">ID: {id}</div>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* Driver/Crew Info */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm">
          <User size={14} className="text-slate-500" />
          <span className="text-slate-700">
            {driver?.name ||
              (crew && crew.length > 0 ? crew[0].name : "No crew assigned")}
          </span>
        </div>
        {crew && crew.length > 1 && (
          <div className="text-xs text-slate-500 ml-4">
            +{crew.length - 1} more crew member{crew.length > 2 ? "s" : ""}
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2 text-sm mt-1">
            <MapPin size={14} className="text-slate-500" />
            <span className="text-slate-600 truncate">{location}</span>
          </div>
        )}
        {type && (
          <div className="text-xs text-slate-500 mt-1">Type: {type}</div>
        )}
        {fuelLevel && (
          <div className="text-xs text-slate-500 mt-1">Fuel: {fuelLevel}%</div>
        )}
      </div>

      {/* Current Assignment */}
      {currentAssignment && (
        <div className="mb-3 bg-blue-50 rounded-lg p-2">
          <div className="text-xs font-medium text-blue-700 mb-1">
            Current Assignment
          </div>
          <div className="text-sm text-blue-800">
            Emergency #{currentAssignment.id}
          </div>
          {estimatedArrival && (
            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
              <Clock size={12} />
              ETA: {estimatedArrival} min
            </div>
          )}
        </div>
      )}

      {/* Equipment */}
      {equipment && equipment.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium text-slate-600 mb-1">
            Equipment
          </div>
          <div className="flex flex-wrap gap-1">
            {equipment.map((item, index) => {
              // Handle both string and object equipment formats
              const equipmentName = typeof item === "string" ? item : item.name;
              const equipmentStatus =
                typeof item === "object" ? item.status : "operational";
              const statusColor =
                equipmentStatus === "operational"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600";

              return (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded ${typeof item === "string" ? "bg-slate-100 text-slate-600" : statusColor}`}
                >
                  {equipmentName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        {status === "available" && (
          <button
            onClick={() => onAssign(ambulance)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <ArrowRight size={14} />
            Assign
          </button>
        )}

        <button
          onClick={() => onTrack(ambulance)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
        >
          <MapPin size={14} />
          Track
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Ambulance Fleet Empty State Component
 */
export const AmbulanceEmptyState = ({ isLoading, onRefresh }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 px-6"
    >
      <div className="max-w-md mx-auto">
        {isLoading ? (
          // Loading State
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Truck size={32} className="text-blue-500" />
              </motion.div>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Loading Ambulance Fleet
            </h3>
            <p className="text-slate-500 text-sm">
              Fetching real-time ambulance data...
            </p>
          </>
        ) : (
          // Empty State
          <>
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck size={32} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No Ambulances Available
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Your ambulance fleet appears to be empty. This could mean all
              ambulances are currently deployed, or none have been registered to
              your hospital yet.
            </p>

            <div className="space-y-3">
              <button
                onClick={onRefresh}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ArrowRight size={16} />
                Refresh Fleet Status
              </button>

              <div className="text-xs text-slate-400">
                <p>
                  💡 <strong>Next steps:</strong>
                </p>
                <ul className="mt-1 space-y-1 text-left">
                  <li>• Check if ambulances are registered to your hospital</li>
                  <li>• Verify ambulance crews are logged in</li>
                  <li>• Contact fleet management if issues persist</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
