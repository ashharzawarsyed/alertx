import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit3,
  Pill,
  ShieldAlert,
  Calendar,
} from "lucide-react";
import { clsx } from "clsx";

const PatientCard = ({ patient, onViewDetails, onEdit }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "critical":
        return {
          color: "text-red-600",
          bg: "bg-red-100",
          icon: AlertTriangle,
          label: "Critical",
          borderColor: "border-red-200",
        };
      case "monitoring":
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          icon: Clock,
          label: "Monitoring",
          borderColor: "border-yellow-200",
        };
      case "stable":
        return {
          color: "text-green-600",
          bg: "bg-green-100",
          icon: CheckCircle,
          label: "Stable",
          borderColor: "border-green-200",
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-100",
          icon: User,
          label: "Unknown",
          borderColor: "border-gray-200",
        };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "high":
        return {
          color: "text-red-600",
          bg: "bg-red-50",
          label: "High Priority",
        };
      case "medium":
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          label: "Medium Priority",
        };
      case "low":
        return {
          color: "text-green-600",
          bg: "bg-green-50",
          label: "Low Priority",
        };
      default:
        return { color: "text-gray-600", bg: "bg-gray-50", label: "Normal" };
    }
  };

  const statusConfig = getStatusConfig(patient.currentStatus);
  const priorityConfig = getPriorityConfig(patient.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={clsx(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-lg transition-all hover:shadow-2xl",
        statusConfig.borderColor,
      )}
    >
      {/* Priority Banner */}
      {patient.priority === "high" && (
        <div className="absolute top-0 right-0 z-10">
          <div className="rounded-bl-lg bg-red-500 px-3 py-1 text-xs font-bold text-white">
            URGENT
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={clsx("rounded-full p-3", statusConfig.bg)}>
              <User className={clsx("h-6 w-6", statusConfig.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                {patient.firstName} {patient.lastName}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-gray-600">
                <span className="text-sm">
                  {patient.age} years • {patient.gender}
                </span>
              </div>
            </div>
          </div>

          <div
            className={clsx(
              "flex items-center gap-2 rounded-lg px-3 py-1",
              statusConfig.bg,
            )}
          >
            <StatusIcon className={clsx("h-4 w-4", statusConfig.color)} />
            <span className={clsx("text-sm font-medium", statusConfig.color)}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-4 grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="truncate text-sm">{patient.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate text-sm">{patient.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate text-sm">{patient.address}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col px-6">
        {/* Medical Summary */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700">
                Blood Type
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {patient.bloodType}
            </span>
          </div>

          {patient.assignedHospital && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  Current Hospital
                </span>
              </div>
              <span className="max-w-32 truncate text-sm font-semibold text-gray-900">
                {patient.assignedHospital}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">
                Last Visit
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {new Date(patient.lastVisit).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Allergies & Conditions */}
        <div className="mb-4">
          {patient.allergies.length > 0 && (
            <div className="mb-3">
              <div className="mb-2 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">
                  Allergies
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {patient.allergies.slice(0, 2).map((allergy, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700"
                  >
                    {allergy}
                  </span>
                ))}
                {patient.allergies.length > 2 && (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    +{patient.allergies.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {patient.currentMedications.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Pill className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">
                  Current Medications
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {patient.currentMedications
                  .slice(0, 2)
                  .map((medication, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700"
                    >
                      {medication}
                    </span>
                  ))}
                {patient.currentMedications.length > 2 && (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    +{patient.currentMedications.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Priority Indicator */}
        <div className={clsx("mt-auto mb-4 rounded-lg p-3", priorityConfig.bg)}>
          <div className="flex items-center justify-between">
            <span className={clsx("text-sm font-medium", priorityConfig.color)}>
              {priorityConfig.label}
            </span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-current opacity-60"></div>
              <div className="h-2 w-2 rounded-full bg-current opacity-40"></div>
              <div className="h-2 w-2 rounded-full bg-current opacity-20"></div>
            </div>
          </div>
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
              onViewDetails(patient);
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
              onEdit(patient);
            }}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </motion.button>
        </div>
      </div>

      {/* Hover Gradient Overlay */}
      <motion.div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 opacity-0 transition-opacity group-hover:opacity-5" />
    </motion.div>
  );
};

export default PatientCard;
