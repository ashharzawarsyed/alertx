/**
 * Ambulance Card Component
 * Beautiful, interactive card displaying ambulance information with real-time updates
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Users,
  Phone,
  Fuel,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertCircle,
} from "lucide-react";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { AMBULANCE_STATUS } from "../types/ambulanceTypes";

export const AmbulanceCard = ({
  ambulance,
  onSelect,
  onStatusUpdate,
  className = "",
  variant = "default", // 'default', 'compact', 'detailed'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate?.(ambulance.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const cardVariants = {
    default: "p-6",
    compact: "p-4",
    detailed: "p-8",
  };

  const isActive =
    ambulance.status === AMBULANCE_STATUS.ON_ROUTE ||
    ambulance.status === AMBULANCE_STATUS.AT_SCENE ||
    ambulance.status === AMBULANCE_STATUS.TRANSPORTING;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
      }}
      className={`relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all duration-300 ${cardVariants[variant]} ${className} `}
      onClick={() => onSelect?.(ambulance)}
    >
      {/* Loading overlay */}
      {isUpdating && (
        <div className="bg-opacity-80 absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm font-medium">Updating...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">
              {ambulance.callSign}
            </h3>
            <StatusBadge
              status={ambulance.status}
              showPulse={isActive}
              size="small"
            />
          </div>
          <p className="text-sm font-medium text-gray-600">{ambulance.id}</p>
        </div>

        {ambulance.currentCall?.priority && (
          <PriorityBadge
            priority={ambulance.currentCall.priority}
            size="small"
          />
        )}
      </div>

      {/* Current Call Information */}
      {ambulance.currentCall && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3"
        >
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">
              Active Call
            </span>
          </div>
          <p className="mb-2 text-sm text-blue-800">
            {ambulance.currentCall.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-blue-700">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>ETA: {ambulance.currentCall.eta}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {ambulance.currentCall.destination?.address}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Key Metrics */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        {/* Location */}
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gray-100 p-2">
            <MapPin className="h-4 w-4 text-gray-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500">Location</p>
            <p className="truncate text-sm text-gray-900">
              {ambulance.location?.address || "Location updating..."}
            </p>
          </div>
        </div>

        {/* Response Time */}
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gray-100 p-2">
            <Activity className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500">Avg Response</p>
            <p className="text-sm text-gray-900">
              {ambulance.metrics?.averageResponseTime || 0}m
            </p>
          </div>
        </div>
      </div>

      {/* Crew & Vehicle Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{ambulance.crew?.length || 0} crew members</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Fuel className="h-4 w-4" />
            <span>{ambulance.vehicle?.fuelLevel || 0}%</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="rounded-lg p-1 transition-colors hover:bg-gray-100"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        {isExpanded && (
          <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
            {/* Crew Details */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">Crew</h4>
              <div className="space-y-2">
                {ambulance.crew?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {member.role}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`tel:${member.phoneNumber}`);
                      }}
                      className="rounded-lg p-2 transition-colors hover:bg-blue-100"
                    >
                      <Phone className="h-4 w-4 text-blue-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment Status */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">
                Equipment
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {ambulance.equipment &&
                  Object.entries(ambulance.equipment)
                    .slice(0, 4)
                    .map(([key, equipment]) => (
                      <div
                        key={key}
                        className={`rounded-lg border px-2 py-1 ${
                          equipment.status === "operational"
                            ? "border-green-200 bg-green-50 text-green-800"
                            : "border-red-200 bg-red-50 text-red-800"
                        } `}
                      >
                        <span className="capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </div>
                    ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">
                Quick Actions
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(AMBULANCE_STATUS.IDLE);
                  }}
                  className="flex-1 rounded-lg bg-green-100 px-3 py-2 text-xs font-medium text-green-800 transition-colors hover:bg-green-200"
                >
                  Set Idle
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(AMBULANCE_STATUS.MAINTENANCE);
                  }}
                  className="flex-1 rounded-lg bg-orange-100 px-3 py-2 text-xs font-medium text-orange-800 transition-colors hover:bg-orange-200"
                >
                  Maintenance
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
