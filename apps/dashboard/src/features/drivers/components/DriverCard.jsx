/**
 * Driver Card Component
 * Displays driver information with approval actions
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Car,
  Award,
  Shield,
} from "lucide-react";

const DriverCard = ({ driver, onApprove, onReject, onViewDetails }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(driver.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(driver.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason("");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDocumentStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
      >
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="bg-opacity-80 absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white">
            <div className="flex items-center gap-2 text-blue-600">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-teal-400">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{driver.name}</h3>
              <p className="text-sm text-gray-600">{driver.email}</p>
            </div>
          </div>

          <div
            className={`rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(driver.approvalStatus)}`}
          >
            {driver.approvalStatus.charAt(0).toUpperCase() +
              driver.approvalStatus.slice(1)}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{driver.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              Applied {new Date(driver.registrationDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Driver Info */}
        <div className="mb-4 rounded-xl bg-gray-50 p-4">
          <h4 className="mb-3 font-semibold text-gray-900">
            Driver Information
          </h4>
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">License:</span>
              <span className="font-medium">
                {driver.driverInfo.licenseNumber}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Ambulance:</span>
              <span className="font-medium">
                {driver.driverInfo.ambulanceNumber || "Not assigned"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Experience:</span>
              <span className="font-medium">
                {driver.experience?.years || 0} years
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Background:</span>
              <span className="font-medium">
                {driver.background?.criminalCheck || "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Documents Status */}
        <div className="mb-4">
          <h4 className="mb-2 font-semibold text-gray-900">Documents</h4>
          <div className="space-y-2">
            {driver.documents?.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium capitalize">
                    {doc.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getDocumentStatusIcon(doc.status)}
                  <span className="text-xs text-gray-600 capitalize">
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        {driver.experience?.certifications && (
          <div className="mb-4">
            <h4 className="mb-2 font-semibold text-gray-900">Certifications</h4>
            <div className="flex flex-wrap gap-2">
              {driver.experience.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {driver.approvalStatus === "pending" && (
          <div className="flex gap-3 border-t border-gray-200 pt-4">
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              Approve Driver
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => onViewDetails?.(driver)}
              className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Details
            </button>
          </div>
        )}

        {/* Current Status */}
        {driver.approvalStatus === "approved" && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    driver.driverInfo.status === "available"
                      ? "bg-green-500"
                      : driver.driverInfo.status === "busy"
                        ? "bg-red-500"
                        : "bg-gray-500"
                  }`}
                />
                <span className="text-sm font-medium capitalize">
                  {driver.driverInfo.status}
                </span>
              </div>
              {driver.driverInfo.currentLocation && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>Online</span>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 w-full max-w-md rounded-xl bg-white p-6"
          >
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              Reject Driver Application
            </h3>
            <p className="mb-4 text-gray-600">
              Please provide a reason for rejecting {driver.name}&apos;s
              application:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isProcessing}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default DriverCard;
