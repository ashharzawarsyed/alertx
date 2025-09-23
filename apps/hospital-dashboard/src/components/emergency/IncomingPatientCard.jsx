import { motion } from "framer-motion";
import {
  Heart,
  Phone,
  Timer,
  User,
  FirstAid,
  MapPin,
  CheckCircle,
  Bell,
  Activity,
  Calendar,
} from "phosphor-react";
import React from "react";

import { PriorityBadge } from "../ui/DashboardComponents";

/**
 * Incoming Patient Card Component - Shows patients en route to hospital
 */
export const IncomingPatientCard = ({
  patient,
  onAccept,
  onPrepare,
  onCallParamedic,
  isFullWidth = false,
}) => {
  console.log("IncomingPatientCard received:", {
    patient,
    patientType: typeof patient,
    patientKeys: patient ? Object.keys(patient) : null,
    isFullWidth,
  });

  // Safety check for patient data
  if (!patient) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
        <p className="text-gray-500">No patient data available</p>
      </div>
    );
  }

  const {
    patientName = patient.name || "Unknown Patient",
    patientAge = patient.age || 0,
    patientGender = patient.gender || "Unknown",
    condition = "Unknown Condition",
    priority = patient.emergencyType || "moderate",
    estimatedArrival = null,
    vitals = {},
    symptoms = [],
    allergies = [],
    medications = [],
    emergencyContact = patient.contactInfo?.emergencyContact || null,
    paramedic = null,
    location = null,
    notes = patient.description || "No additional notes",
    ambulanceId = null,
  } = patient || {};

  // Calculate arrival time in minutes if it's an ISO string
  let arrivalMinutes = estimatedArrival;
  if (typeof estimatedArrival === "string") {
    const arrivalTime = new Date(estimatedArrival);
    const now = new Date();
    arrivalMinutes = Math.max(0, Math.round((arrivalTime - now) / (1000 * 60)));
  }

  const arrivalColor =
    arrivalMinutes <= 5
      ? "text-red-600"
      : arrivalMinutes <= 10
        ? "text-orange-600"
        : "text-blue-600";
  const arrivalBg =
    arrivalMinutes <= 5
      ? "bg-red-50 border-red-200"
      : arrivalMinutes <= 10
        ? "bg-orange-50 border-orange-200"
        : "bg-blue-50 border-blue-200";

  // Layout classes based on full width mode
  const containerClasses = isFullWidth
    ? "bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200/60 shadow-sm h-full min-h-[120px] flex flex-col"
    : "bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden min-h-[120px]";

  const headerClasses = isFullWidth
    ? "bg-gradient-to-r from-slate-50 to-white p-2 border-b border-slate-200 flex-shrink-0"
    : "bg-gradient-to-r from-slate-50 to-white p-3 border-b border-slate-200";

  const bodyClasses = isFullWidth ? "p-2 flex-1 flex flex-col" : "p-3";

  const vitalsGridClasses = isFullWidth
    ? "grid grid-cols-2 md:grid-cols-4 gap-2"
    : "grid grid-cols-2 md:grid-cols-4 gap-2";

  const infoGridClasses = isFullWidth
    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2"
    : "grid grid-cols-1 md:grid-cols-2 gap-3";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={containerClasses}
    >
      {/* Header with Patient Info */}
      <div className={headerClasses}>
        <div
          className={`flex items-center justify-between ${isFullWidth ? "mb-2" : "mb-3"}`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`${isFullWidth ? "w-10 h-10" : "w-12 h-12"} bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg`}
            >
              <User size={isFullWidth ? 16 : 18} />
            </div>
            <div>
              <h3
                className={`font-bold text-slate-800 ${isFullWidth ? "text-base mb-0.5" : "text-lg mb-0.5"}`}
              >
                {patientName}
              </h3>
              <p
                className={`text-slate-600 ${isFullWidth ? "text-xs" : "text-xs"}`}
              >
                {patientAge} yrs • {patientGender}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <FirstAid size={12} className="text-red-500" />
                <span className="font-medium text-slate-700 text-xs">
                  {condition}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <PriorityBadge priority={priority} />
            <div
              className={`flex items-center gap-1 px-1 py-0.5 rounded font-medium text-xs ${arrivalBg} ${arrivalColor}`}
            >
              <Timer size={12} />
              <span>{arrivalMinutes} min</span>
            </div>
          </div>
        </div>

        {/* Ambulance Info */}
        <div
          className={`flex items-center gap-2 text-xs text-slate-600 bg-white rounded-lg px-3 py-2 border ${isFullWidth ? "text-sm" : ""}`}
        >
          <MapPin size={14} className="text-blue-500" />
          <span className="font-medium">
            Ambulance {ambulanceId || "En Route"}:
          </span>
          <span>
            {location?.address || location?.current || "Location updating..."}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className={bodyClasses}>
        {/* Vitals Grid - compact, modern look */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-2 mb-2 border border-red-100">
          <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1 text-xs">
            <Heart size={12} className="text-red-500" />
            Vitals
          </h4>
          <div className={vitalsGridClasses}>
            <div className="text-center">
              <p className="text-base font-bold text-red-600 mb-0.5">
                {vitals?.heartRate || "N/A"}
              </p>
              <p className="text-red-500 text-[10px] font-medium">HR</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-red-600 mb-0.5">
                {vitals?.bloodPressure || "N/A"}
              </p>
              <p className="text-red-500 text-[10px] font-medium">BP</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-red-600 mb-0.5">
                {vitals?.oxygenSaturation || "N/A"}
              </p>
              <p className="text-red-500 text-[10px] font-medium">O2</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-red-600 mb-0.5">
                {vitals?.temperature || "N/A"}
              </p>
              <p className="text-red-500 text-[10px] font-medium">Temp</p>
            </div>
          </div>
        </div>

        {/* Symptoms & Medical Info */}
        <div className={`${infoGridClasses} mb-4`}>
          <div>
            <h4
              className={`font-semibold text-slate-700 mb-2 flex items-center gap-2 text-sm`}
            >
              <Activity size={14} className="text-blue-500" />
              Symptoms & Medical History
            </h4>
            <div className="flex flex-wrap gap-1">
              {(symptoms && symptoms.length > 0
                ? symptoms
                : patient.medicalHistory || []
              ).map((item, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 bg-red-100 text-red-700 text-xs rounded border border-red-200 font-medium`}
                >
                  {item}
                </span>
              ))}
              {(!symptoms || symptoms.length === 0) &&
                (!patient.medicalHistory ||
                  patient.medicalHistory.length === 0) && (
                  <span
                    className={`px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200 font-medium`}
                  >
                    No symptoms or medical history available
                  </span>
                )}
            </div>
          </div>

          <div>
            <h4
              className={`font-semibold text-slate-700 mb-2 flex items-center gap-2 text-sm`}
            >
              <Calendar size={14} className="text-green-500" />
              Medical History
            </h4>
            <div className={`space-y-1 text-xs`}>
              <div>
                <span className="font-medium text-slate-600">Allergies:</span>
                <span className="ml-2 text-slate-700">
                  {allergies && allergies.length > 0
                    ? allergies.join(", ")
                    : "None known"}
                </span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Medications:</span>
                <span className="ml-2 text-slate-700">
                  {medications && medications.length > 0
                    ? medications.join(", ")
                    : "None"}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Contact (when in full width, show as third column) */}
          {isFullWidth && emergencyContact && (
            <div>
              <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2 text-sm">
                <User size={14} className="text-purple-500" />
                Emergency Contact
              </h4>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-1 text-xs">
                  Contact Information
                </h4>
                <p className="text-blue-700 text-xs">
                  <span className="font-medium">{emergencyContact.name}</span> (
                  {emergencyContact.relationship})
                </p>
                <p className="text-blue-600 text-xs">
                  {emergencyContact.phone}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contact (when not in full width, show separately) */}
        {!isFullWidth && emergencyContact && (
          <div
            className={`bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100`}
          >
            <h4 className="font-semibold text-blue-800 mb-1 text-sm">
              Emergency Contact
            </h4>
            <p className={`text-blue-700 text-xs`}>
              <span className="font-medium">{emergencyContact.name}</span> (
              {emergencyContact.relationship})
            </p>
            <p className={`text-blue-600 text-xs`}>{emergencyContact.phone}</p>
          </div>
        )}

        {/* Paramedic Report */}
        <div
          className={`bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-4 border border-green-100`}
        >
          <h4
            className={`font-semibold text-green-800 mb-2 flex items-center gap-2 text-sm`}
          >
            <Bell size={14} />
            Paramedic Report
          </h4>
          <p className={`text-green-700 text-xs mb-2`}>
            {notes || "No additional notes"}
          </p>
          {paramedic && (
            <p className={`text-green-600 text-xs`}>
              <span className="font-medium">{paramedic.name}</span> •{" "}
              {paramedic.phone}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-3`}>
          <button
            onClick={() => onAccept && onAccept(patient)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm`}
          >
            <CheckCircle size={16} />
            Accept Patient
          </button>
          <button
            onClick={() => onPrepare && onPrepare(patient)}
            className={`px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm`}
          >
            Prepare Team
          </button>
          <button
            onClick={() => onCallParamedic && onCallParamedic(patient)}
            className={`px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`}
          >
            <Phone size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default IncomingPatientCard;
