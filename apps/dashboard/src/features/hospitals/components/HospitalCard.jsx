import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Bed,
  Activity,
  Clock,
  Star,
  Eye,
  Edit3,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { clsx } from "clsx";

const HospitalCard = ({ hospital, onViewDetails, onEdit }) => {
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
          label: "Maintenance",
        };
      case "critical":
        return {
          color: "text-red-600",
          bg: "bg-red-100",
          icon: XCircle,
          label: "Critical",
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

  // Helper to sum beds, handling both numbers and objects
  function sumBeds(val) {
    if (typeof val === "number") return val;
    if (typeof val === "object" && val !== null) {
      return Object.values(val).reduce(
        (a, b) => a + (typeof b === "number" ? b : 0),
        0,
      );
    }
    return 0;
  }

  // For display: show details if object, else just the number
  function bedDetails(val) {
    if (typeof val === "number") return val;
    if (typeof val === "object" && val !== null) {
      return Object.entries(val)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    }
    return "";
  }

  const totalBeds = sumBeds(hospital.totalBeds);
  const availableBeds = sumBeds(hospital.availableBeds);
  const icuBeds = sumBeds(hospital.icuBeds);
  const availableIcuBeds = sumBeds(hospital.availableIcuBeds);
  const bedUtilization =
    totalBeds > 0 ? ((totalBeds - availableBeds) / totalBeds) * 100 : 0;
  const icuUtilization =
    icuBeds > 0 ? ((icuBeds - availableIcuBeds) / icuBeds) * 100 : 0;

  const getUtilizationColor = (percentage) => {
    if (percentage >= 90) return "text-red-600 bg-red-100";
    if (percentage >= 75) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all hover:shadow-2xl"
    >
      {/* Card Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="mb-4 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-display truncate text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
              {hospital.name}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate text-sm">
                {typeof hospital.location === "string"
                  ? hospital.location
                  : hospital.location && typeof hospital.location === "object"
                    ? `(${hospital.location.lat}, ${hospital.location.lng})`
                    : ""}
              </span>
            </div>
          </div>

          <div
            className={clsx(
              "ml-2 flex items-center gap-2 rounded-lg px-3 py-1",
              statusConfig.bg,
            )}
          >
            <StatusIcon className={clsx("h-4 w-4", statusConfig.color)} />
            <span className={clsx("text-sm font-medium", statusConfig.color)}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Rating and Response Time */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">
              {typeof hospital.rating === "object" && hospital.rating !== null
                ? hospital.rating.average !== undefined
                  ? hospital.rating.average
                  : JSON.stringify(hospital.rating)
                : hospital.rating}
            </span>
            <span className="text-sm text-gray-600">rating</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">
              {hospital.responseTime} avg response
            </span>
          </div>
        </div>
      </div>

      {/* Card Body - Flexible content area */}
      <div className="flex flex-1 flex-col px-6">
        {/* Bed Capacity */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                General Beds
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-semibold text-gray-900"
                title={
                  bedDetails(hospital.availableBeds) +
                  "/" +
                  bedDetails(hospital.totalBeds)
                }
              >
                {availableBeds}/{totalBeds}
              </span>
              <span
                className={clsx(
                  "rounded-full px-2 py-1 text-xs font-medium",
                  getUtilizationColor(bedUtilization),
                )}
              >
                {Math.round(bedUtilization)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                ICU Beds
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-semibold text-gray-900"
                title={
                  bedDetails(hospital.availableIcuBeds) +
                  "/" +
                  bedDetails(hospital.icuBeds)
                }
              >
                {availableIcuBeds}/{icuBeds}
              </span>
              <span
                className={clsx(
                  "rounded-full px-2 py-1 text-xs font-medium",
                  getUtilizationColor(icuUtilization),
                )}
              >
                {Math.round(icuUtilization)}%
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Services */}
        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {typeof hospital.emergencyRoom === "object" &&
              hospital.emergencyRoom !== null
                ? Array.isArray(hospital.emergencyRoom)
                  ? hospital.emergencyRoom.join(", ")
                  : Object.entries(hospital.emergencyRoom)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(", ")
                : hospital.emergencyRoom}
            </span>
          </div>
        </div>

        {/* Specialties - Fixed height container */}
        <div className="mb-4">
          <div className="h-16 overflow-hidden">
            <div className="flex flex-wrap gap-1">
              {(hospital.specialties || [])
                .slice(0, 4)
                .map((specialty, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium whitespace-nowrap text-blue-700"
                  >
                    {specialty}
                  </span>
                ))}
              {(hospital.specialties || []).length > 4 && (
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium whitespace-nowrap text-gray-600">
                  +{(hospital.specialties || []).length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-3 flex items-center gap-2 text-gray-600">
          <Phone className="h-4 w-4" />
          <span className="truncate text-sm">
            {typeof hospital.phone === "object"
              ? JSON.stringify(hospital.phone)
              : hospital.phone}
          </span>
        </div>

        {/* Last Updated - Push to bottom */}
        <div className="mt-auto text-xs text-gray-500">
          Last updated:{" "}
          {typeof hospital.lastUpdated === "object"
            ? JSON.stringify(hospital.lastUpdated)
            : hospital.lastUpdated}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onViewDetails(hospital);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Eye className="h-4 w-4" />
            View Details
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(hospital);
            }}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </motion.button>
        </div>
      </div>

      {/* Hover Gradient Overlay */}
      <motion.div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/0 to-teal-500/0 opacity-0 transition-opacity group-hover:opacity-5" />
    </motion.div>
  );
};

export default HospitalCard;
