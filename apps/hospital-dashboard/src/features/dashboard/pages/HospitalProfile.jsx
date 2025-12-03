import {
  MapPin,
  Phone,
  Envelope,
  Clock,
  Star,
  Users,
  Bed,
  Activity,
  CheckCircle,
  Heart,
} from "phosphor-react";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

import { useAuth } from "../../../hooks/useAuth";
import hospitalService from "../../../services/hospitalService";

const HospitalProfile = () => {
  const { user, hospital } = useAuth();
  const [hospitalData, setHospitalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hospitalId =
    hospital?.id || hospital?._id || user?.hospitalInfo?.hospitalId;

  const loadHospitalData = useCallback(async () => {
    if (!hospitalId) {
      setError("Hospital ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await hospitalService.getHospitalDetails(hospitalId);

      if (response.success) {
        setHospitalData(response.data.hospital || response.data);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading hospital data:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    loadHospitalData();
  }, [loadHospitalData]);

  const getFacilityLabel = (facility) => {
    const labels = {
      cardiology: "Cardiology",
      neurology: "Neurology",
      orthopedics: "Orthopedics",
      pediatrics: "Pediatrics",
      gynecology: "Gynecology",
      oncology: "Oncology",
      emergency: "Emergency Care",
      trauma_center: "Trauma Center",
      burn_unit: "Burn Unit",
      psychiatric: "Psychiatric Care",
      radiology: "Radiology",
      laboratory: "Laboratory",
    };
    return labels[facility] || facility;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-300 text-lg font-medium">
            Loading hospital profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30">
            <Activity weight="duotone" size={48} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadHospitalData}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all"
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const totalBeds =
    (hospitalData.totalBeds?.general || 0) +
    (hospitalData.totalBeds?.icu || 0) +
    (hospitalData.totalBeds?.emergency || 0) +
    (hospitalData.totalBeds?.operation || 0);

  const availableBeds =
    (hospitalData.availableBeds?.general || 0) +
    (hospitalData.availableBeds?.icu || 0) +
    (hospitalData.availableBeds?.emergency || 0) +
    (hospitalData.availableBeds?.operation || 0);

  const utilizationRate =
    totalBeds > 0
      ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
            <Heart weight="duotone" className="text-blue-400" size={48} />
            Hospital Profile
          </h1>
          <p className="text-gray-400 mt-2 ml-16">
            View and manage hospital information and services
          </p>
        </div>
      </motion.div>

      {/* Main Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
        <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  {hospitalData.name}
                </h2>
                <p className="text-blue-100 text-xl font-medium">
                  {hospitalData.type}
                </p>
              </div>
              {hospitalData.approvalStatus === "approved" && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/30 shadow-lg">
                  <CheckCircle size={24} className="text-white" weight="fill" />
                  <span className="text-white font-bold">Verified</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8 space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Phone weight="duotone" className="text-blue-400" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-5 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-blue-500/30 transition-all">
                  <MapPin
                    size={24}
                    className="text-blue-400 mt-0.5"
                    weight="fill"
                  />
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide">
                      Address
                    </p>
                    <p className="text-white font-semibold mt-1">
                      {hospitalData.address}
                    </p>
                    {hospitalData.location?.lat &&
                      hospitalData.location?.lng && (
                        <p className="text-xs text-gray-500 mt-1">
                          {hospitalData.location.lat.toFixed(4)},{" "}
                          {hospitalData.location.lng.toFixed(4)}
                        </p>
                      )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-5 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-green-500/30 transition-all">
                  <Phone
                    size={24}
                    className="text-green-400 mt-0.5"
                    weight="fill"
                  />
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide">
                      Contact Number
                    </p>
                    <p className="text-white font-semibold mt-1">
                      {hospitalData.contactNumber}
                    </p>
                    {hospitalData.emergencyContact && (
                      <p className="text-xs text-red-400 mt-1 font-semibold">
                        Emergency: {hospitalData.emergencyContact}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-5 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-purple-500/30 transition-all">
                  <Envelope
                    size={24}
                    className="text-purple-400 mt-0.5"
                    weight="fill"
                  />
                  <div>
                    <p className="text-sm text-slate-500">Email Address</p>
                    <p className="text-slate-800 font-medium">
                      {hospitalData.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <Star
                    size={20}
                    className="text-orange-600 mt-0.5"
                    weight="fill"
                  />
                  <div>
                    <p className="text-sm text-slate-500">License Number</p>
                    <p className="text-slate-800 font-medium">
                      {hospitalData.licenseNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Hospital Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <Bed size={24} className="text-blue-600" weight="duotone" />
                    <span className="text-2xl font-bold text-blue-900">
                      {totalBeds}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 font-medium">
                    Total Beds
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {availableBeds} available
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <Activity
                      size={24}
                      className="text-green-600"
                      weight="duotone"
                    />
                    <span className="text-2xl font-bold text-green-900">
                      {utilizationRate}%
                    </span>
                  </div>
                  <p className="text-sm text-green-700 font-medium">
                    Utilization
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Bed occupancy rate
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <Users
                      size={24}
                      className="text-purple-600"
                      weight="duotone"
                    />
                    <span className="text-2xl font-bold text-purple-900">
                      {hospitalData.statistics?.totalPatientsServed || 0}
                    </span>
                  </div>
                  <p className="text-sm text-purple-700 font-medium">
                    Patients Served
                  </p>
                  <p className="text-xs text-purple-600 mt-1">All time</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <Star size={24} className="text-orange-600" weight="fill" />
                    <span className="text-2xl font-bold text-orange-900">
                      {hospitalData.rating?.average?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                  <p className="text-sm text-orange-700 font-medium">Rating</p>
                  <p className="text-xs text-orange-600 mt-1">
                    {hospitalData.rating?.count || 0} reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Bed Capacity Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Bed Capacity
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">
                    General Beds
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {hospitalData.totalBeds?.general || 0}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {hospitalData.availableBeds?.general || 0} available
                  </p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">
                    ICU Beds
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {hospitalData.totalBeds?.icu || 0}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {hospitalData.availableBeds?.icu || 0} available
                  </p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">
                    Emergency Beds
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {hospitalData.totalBeds?.emergency || 0}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {hospitalData.availableBeds?.emergency || 0} available
                  </p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1 uppercase tracking-wide">
                    Operation Theater
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {hospitalData.totalBeds?.operation || 0}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {hospitalData.availableBeds?.operation || 0} available
                  </p>
                </div>
              </div>
            </div>

            {/* Facilities */}
            {hospitalData.facilities && hospitalData.facilities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Facilities & Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {hospitalData.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg text-sm border border-blue-200"
                    >
                      {getFacilityLabel(facility)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Operating Hours */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Operating Hours
              </h3>
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Clock size={24} className="text-green-600" weight="fill" />
                <div>
                  <p className="text-green-900 font-semibold">
                    {hospitalData.operatingHours?.isOpen24x7
                      ? "Open 24/7"
                      : "Limited Hours"}
                  </p>
                  <p className="text-sm text-green-700">
                    {hospitalData.operatingHours?.isOpen24x7
                      ? "Emergency services available around the clock"
                      : "Check specific department hours"}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="pt-6 border-t border-gray-700/50">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Clock weight="duotone" size={16} />
                  Created:{" "}
                  {new Date(hospitalData.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-2">
                  Last updated:{" "}
                  {new Date(hospitalData.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HospitalProfile;
