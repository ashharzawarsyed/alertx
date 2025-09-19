import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  CheckCircle,
  Edit3,
  ShieldAlert,
  FileText,
  Shield,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { clsx } from "clsx";

const PatientDetailsModal = ({ patient, isOpen, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!patient || !isOpen) return null;

  const getStatusConfig = (status) => {
    switch (status) {
      case "critical":
        return {
          color: "text-red-600",
          bg: "bg-red-100",
          icon: AlertTriangle,
          label: "Critical",
        };
      case "monitoring":
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          icon: AlertTriangle,
          label: "Monitoring",
        };
      case "stable":
        return {
          color: "text-green-600",
          bg: "bg-green-100",
          icon: CheckCircle,
          label: "Stable",
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-100",
          icon: CheckCircle,
          label: "Unknown",
        };
    }
  };

  const statusConfig = getStatusConfig(patient.currentStatus);
  const StatusIcon = statusConfig.icon;

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "medical", label: "Medical", icon: Heart },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "insurance", label: "Insurance", icon: Shield },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h4 className="mb-3 text-lg font-semibold text-gray-900">
                Patient Information
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-lg text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Patient ID
                  </p>
                  <p className="text-lg text-gray-900">{patient.id}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-lg text-gray-900">{patient.age} years</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-lg text-gray-900">{patient.gender}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Blood Type
                  </p>
                  <p className="text-lg text-gray-900">{patient.bloodType}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}
                    >
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hospital Assignment */}
            <div>
              <h4 className="mb-3 text-lg font-semibold text-gray-900">
                Hospital Assignment
              </h4>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-600">
                  Assigned Hospital
                </p>
                <p className="text-lg text-gray-900">
                  {patient.assignedHospital}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="mb-3 text-lg font-semibold text-gray-900">
                Recent Activity
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Last Visit
                  </p>
                  <p className="text-lg text-gray-900">
                    {formatDate(patient.lastVisit)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-500">
                    Registration Date
                  </p>
                  <p className="text-lg text-gray-900">
                    {formatDate(patient.registrationDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "medical":
        return (
          <div className="space-y-6">
            {/* Medical Conditions */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Heart className="h-5 w-5 text-red-500" />
                Medical Conditions
              </h4>
              <div className="rounded-lg bg-gray-50 p-4">
                {patient.medicalConditions &&
                patient.medicalConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.medicalConditions.map((condition, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No known medical conditions</p>
                )}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <ShieldAlert className="h-5 w-5 text-orange-500" />
                Allergies
              </h4>
              <div className="rounded-lg bg-gray-50 p-4">
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm text-red-800"
                      >
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No known allergies</p>
                )}
              </div>
            </div>

            {/* Blood Type */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="h-5 w-5 text-blue-500" />
                Blood Information
              </h4>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Blood Type
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {patient.bloodType}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            {/* Patient Contact */}
            <div>
              <h4 className="mb-3 text-lg font-semibold text-gray-900">
                Patient Contact Information
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                  <Phone className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                  <Mail className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                  <MapPin className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-gray-900">{patient.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <UserCheck className="h-5 w-5 text-orange-500" />
                Emergency Contact
              </h4>
              <div className="space-y-3 rounded-lg bg-orange-50 p-4">
                <div>
                  <p className="text-sm font-medium text-orange-600">Name</p>
                  <p className="text-gray-900">
                    {patient.emergencyContact?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Relationship
                  </p>
                  <p className="text-gray-900">
                    {patient.emergencyContact?.relationship}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-600">Phone</p>
                  <p className="text-gray-900">
                    {patient.emergencyContact?.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "insurance":
        return (
          <div className="space-y-6">
            {/* Insurance Information */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <CreditCard className="h-5 w-5 text-blue-500" />
                Insurance Information
              </h4>
              <div className="space-y-3 rounded-lg bg-blue-50 p-4">
                <div>
                  <p className="text-sm font-medium text-blue-600">Provider</p>
                  <p className="text-lg text-gray-900">
                    {patient.insurance?.provider}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Policy Number
                  </p>
                  <p className="font-mono text-gray-900">
                    {patient.insurance?.policyNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl rounded-xl bg-white shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-lg font-semibold text-blue-600">
                    {patient.firstName[0]}
                    {patient.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Patient ID: {patient.id} • Age: {patient.age}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onEdit();
                    onClose();
                  }}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
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
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      )}
                    >
                      <TabIcon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto p-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default PatientDetailsModal;
