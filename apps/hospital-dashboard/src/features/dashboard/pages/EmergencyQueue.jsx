import {
  Clock,
  MapPin,
  Heart,
  Activity,
  CheckCircle,
  XCircle,
  Bed,
  Warning,
} from "phosphor-react";
import React, { useState, useEffect, useCallback } from "react";

import { useAuth } from "../../../hooks/useAuth";
import EmergencyService from "../../../services/EmergencyService";
import hospitalService from "../../../services/hospitalService";
import socketService from "../../../services/socketService";

const EmergencyQueue = () => {
  const { user, hospital, token } = useAuth();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [bedAssignment, setBedAssignment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [hospitalData, setHospitalData] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, accepted
  const [sortBy, setSortBy] = useState("time"); // time, priority

  const hospitalId =
    hospital?.id || hospital?._id || user?.hospitalInfo?.hospitalId;

  // Load emergencies and hospital data
  const loadData = useCallback(async () => {
    if (!token || !hospitalId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load hospital data for bed availability
      const hospitalResponse =
        await hospitalService.getHospitalDetails(hospitalId);
      setHospitalData(hospitalResponse.data);

      // Load emergencies - use the mock data from service
      const emergenciesData = await EmergencyService.getActiveEmergencies();

      // Filter for pending and assigned to this hospital
      const filteredEmergencies = emergenciesData.filter(
        (em) => em.status === "pending" || em.assignedHospital === hospitalId
      );

      setEmergencies(filteredEmergencies);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, hospitalId]);

  useEffect(() => {
    loadData();

    // Set up real-time listeners
    if (hospitalId && socketService.socket?.connected) {
      socketService.onNewEmergency((data) => {
        console.log("New emergency received:", data);
        loadData(); // Reload data when new emergency arrives
      });

      socketService.onEmergencyUpdate((data) => {
        console.log("Emergency updated:", data);
        loadData(); // Reload data when emergency is updated
      });
    }

    // Cleanup is handled by socketService internally
    return () => {
      // No need to manually remove listeners, socketService manages them
    };
  }, [loadData, hospitalId]);

  // Handle accept emergency
  const handleAccept = async () => {
    if (!selectedEmergency || !bedAssignment) return;

    try {
      await EmergencyService.acceptIncomingPatient(selectedEmergency.id, {
        bedType: bedAssignment,
        hospitalId,
      });

      // Emit socket event
      socketService.emit("emergency:accept", {
        emergencyId: selectedEmergency.id,
        hospitalId,
        bedType: bedAssignment,
      });

      setShowAcceptModal(false);
      setSelectedEmergency(null);
      setBedAssignment("");
      loadData();

      // Show success message
      alert("Emergency accepted successfully!");
    } catch (err) {
      console.error("Error accepting emergency:", err);
      alert("Failed to accept emergency: " + err.message);
    }
  };

  // Handle reject emergency
  const handleReject = async () => {
    if (!selectedEmergency || !rejectReason) return;

    try {
      await EmergencyService.updateEmergencyStatus(
        selectedEmergency.id,
        "rejected"
      );

      setShowRejectModal(false);
      setSelectedEmergency(null);
      setRejectReason("");
      loadData();

      alert("Emergency rejected.");
    } catch (err) {
      console.error("Error rejecting emergency:", err);
      alert("Failed to reject emergency: " + err.message);
    }
  };

  // Filter and sort emergencies
  const getFilteredEmergencies = () => {
    let filtered = emergencies;

    // Apply filter
    if (filter === "pending") {
      filtered = filtered.filter((em) => em.status === "pending");
    } else if (filter === "accepted") {
      filtered = filtered.filter((em) => em.status === "accepted");
    }

    // Apply sort
    if (sortBy === "priority") {
      filtered = [...filtered].sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    } else {
      // Sort by time (newest first)
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return filtered;
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "dispatched":
        return "bg-blue-100 text-blue-800";
      case "enroute":
        return "bg-indigo-100 text-indigo-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Format time ago
  const timeAgo = (date) => {
    const minutes = Math.floor((new Date() - new Date(date)) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 min ago";
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    return `${hours} hours ago`;
  };

  const filteredEmergencies = getFilteredEmergencies();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity
            size={48}
            className="mx-auto mb-4 text-blue-600 animate-pulse"
          />
          <p className="text-slate-600">Loading emergency queue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Warning size={64} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Error Loading Queue
          </h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <Warning size={32} className="text-white" weight="fill" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Emergency Queue
                </h1>
                <p className="text-gray-400 mt-1">
                  Manage incoming emergency requests and coordinate patient admissions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-4 py-2 bg-red-500/20 text-red-300 rounded-xl text-sm font-bold border border-red-500/30 shadow-lg shadow-red-500/20">
                {filteredEmergencies.filter((e) => e.status === "pending").length}{" "}
                Pending
              </span>
            </div>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-red-500/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-1">Critical</p>
                <p className="text-4xl font-bold text-white">
                  {emergencies.filter((e) => e.priority === "critical").length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <Warning size={32} className="text-white" weight="fill" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-1">
                  High Priority
                </p>
                <p className="text-4xl font-bold text-white">
                  {emergencies.filter((e) => e.priority === "high").length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Warning size={32} className="text-white" weight="fill" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-1">En Route</p>
                <p className="text-4xl font-bold text-white">
                  {emergencies.filter((e) => e.status === "enroute").length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Activity size={32} className="text-white" weight="fill" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-green-500/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-1">
                  Beds Available
                </p>
                <p className="text-4xl font-bold text-white">
                  {hospitalData?.availableBeds?.emergency || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <Bed size={32} className="text-white" weight="fill" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
        <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 p-5 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Filter:</span>
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === "all"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50"
                }`}
              >
                All ({emergencies.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === "pending"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50"
                }`}
              >
                Pending (
                {emergencies.filter((e) => e.status === "pending").length})
              </button>
              <button
                onClick={() => setFilter("accepted")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === "accepted"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50"
                }`}
              >
                Accepted (
                {emergencies.filter((e) => e.status === "accepted").length})
              </button>
            </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Sort by:</span>
            <button
              onClick={() => setSortBy("time")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                sortBy === "time"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50"
              }`}
            >
              <Clock size={18} weight="bold" />
              Time
            </button>
            <button
              onClick={() => setSortBy("priority")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                sortBy === "priority"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50"
              }`}
            >
              <Warning size={18} weight="bold" />
              Priority
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Emergency List */}
      {filteredEmergencies.length === 0 ? (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/30">
              <CheckCircle size={64} className="text-green-400" weight="duotone" />
            </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            No Emergencies
          </h3>
          <p className="text-gray-400 text-lg">
            {filter === "all"
              ? "There are no emergency requests at the moment"
              : `No ${filter} emergencies found`}
          </p>
        </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEmergencies.map((emergency) => (
            <div
              key={emergency.id}
              className="relative group"
            >
              <div className={`absolute inset-0 ${
                emergency.priority === "critical"
                  ? "bg-gradient-to-r from-red-500/20 to-pink-500/20"
                  : emergency.priority === "high"
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20"
                    : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
              } rounded-2xl blur-xl group-hover:blur-2xl transition-all`}></div>
              <div className={`relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 ${
                emergency.priority === "critical"
                  ? "border-red-500/50 hover:border-red-500/70"
                  : emergency.priority === "high"
                    ? "border-orange-500/50 hover:border-orange-500/70"
                    : "border-gray-700/50 hover:border-gray-600/70"
              } transition-all hover:shadow-2xl`}>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-4 rounded-xl ${
                        emergency.priority === "critical"
                          ? "bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30"
                          : emergency.priority === "high"
                            ? "bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30"
                            : "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
                      } shadow-lg`}
                    >
                      <Warning
                        size={28}
                        className={
                          emergency.priority === "critical"
                            ? "text-red-400"
                            : emergency.priority === "high"
                              ? "text-orange-400"
                              : "text-blue-400"
                        }
                        weight="fill"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {emergency.patientName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold border ${getPriorityColor(
                            emergency.priority
                          )} shadow-sm`}
                        >
                          {emergency.priority?.toUpperCase()}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(
                            emergency.status
                          )} shadow-sm`}
                        >
                          {emergency.status?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 font-medium">
                        {emergency.patientAge} years • {emergency.patientGender}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Clock size={18} weight="bold" />
                      <span className="font-semibold">{timeAgo(emergency.createdAt)}</span>
                    </div>
                    {emergency.estimatedResponseTime && (
                      <div className="flex items-center gap-2 text-sm text-blue-400 font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/30">
                        <Activity size={18} weight="bold" />
                        <span>ETA: {emergency.estimatedResponseTime} mins</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Condition */}
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-3 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                    <Heart
                      size={22}
                      className="text-red-400 mt-0.5"
                      weight="fill"
                    />
                    <div>
                      <p className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-1">
                        Condition
                      </p>
                      <p className="text-white font-semibold">{emergency.condition}</p>
                    </div>
                  </div>

                  {emergency.symptoms && emergency.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {emergency.symptoms.map((symptom, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-blue-500/10 text-blue-300 rounded-lg text-xs font-semibold border border-blue-500/30"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vitals (if available) */}
                {emergency.vitals && (
                  <div className="mb-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wide mb-3">
                      Vital Signs
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {emergency.vitals.heartRate && (
                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/30">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Heart Rate</p>
                          <p className="text-lg font-bold text-white mt-1">
                            {emergency.vitals.heartRate}
                          </p>
                        </div>
                      )}
                      {emergency.vitals.bloodPressure && (
                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/30">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">
                            Blood Pressure
                          </p>
                          <p className="text-lg font-bold text-white mt-1">
                            {emergency.vitals.bloodPressure}
                          </p>
                        </div>
                      )}
                      {emergency.vitals.temperature && (
                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/30">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Temperature</p>
                          <p className="text-lg font-bold text-white mt-1">
                            {emergency.vitals.temperature}
                          </p>
                        </div>
                      )}
                      {emergency.vitals.oxygenSaturation && (
                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/30">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">
                            O2 Saturation
                          </p>
                          <p className="text-lg font-bold text-white mt-1">
                            {emergency.vitals.oxygenSaturation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-start gap-3 mb-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                  <MapPin size={22} className="text-purple-400 mt-0.5" weight="fill" />
                  <div>
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">Location</p>
                    <p className="text-white font-semibold mt-1">
                      {emergency.location}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {emergency.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t border-gray-700/50">
                    <button
                      onClick={() => {
                        setSelectedEmergency(emergency);
                        setShowAcceptModal(true);
                      }}
                      className="flex-1 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} weight="fill" />
                      Accept & Assign Bed
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEmergency(emergency);
                        setShowRejectModal(true);
                      }}
                      className="px-5 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-500/30 flex items-center gap-2"
                    >
                      <XCircle size={20} weight="fill" />
                      Reject
                    </button>
                  </div>
                )}

                {emergency.status === "enroute" && (
                  <div className="pt-4 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Activity size={20} weight="fill" />
                      <span className="font-semibold">
                        Ambulance en route • ETA{" "}
                        {emergency.estimatedResponseTime} mins
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept Modal */}
      {showAcceptModal && selectedEmergency && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 shadow-lg">
                  <CheckCircle
                    size={28}
                    className="text-green-400"
                    weight="fill"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Accept Emergency
                </h2>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  Accept emergency for{" "}
                  <strong className="text-white">{selectedEmergency.patientName}</strong> and assign a
                  bed type:
                </p>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-400 mb-2 block uppercase tracking-wide">
                      Bed Type *
                    </span>
                    <select
                      value={bedAssignment}
                      onChange={(e) => setBedAssignment(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    >
                      <option value="" className="bg-gray-800">Select bed type...</option>
                      <option value="general" className="bg-gray-800">
                        General ({hospitalData?.availableBeds?.general || 0}{" "}
                        available)
                      </option>
                      <option value="icu" className="bg-gray-800">
                        ICU ({hospitalData?.availableBeds?.icu || 0} available)
                      </option>
                      <option value="emergency" className="bg-gray-800">
                        Emergency ({hospitalData?.availableBeds?.emergency || 0}{" "}
                        available)
                      </option>
                      <option value="operation" className="bg-gray-800">
                        Operation ({hospitalData?.availableBeds?.operation || 0}{" "}
                        available)
                      </option>
                    </select>
                  </label>

                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                    <p className="text-sm text-blue-300 mb-2">
                      <strong className="text-blue-200">Priority:</strong>{" "}
                      {selectedEmergency.priority?.toUpperCase()}
                    </p>
                    <p className="text-sm text-blue-300">
                      <strong className="text-blue-200">Condition:</strong> {selectedEmergency.condition}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAcceptModal(false);
                    setSelectedEmergency(null);
                    setBedAssignment("");
                  }}
                  className="flex-1 px-5 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all border border-gray-600/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccept}
                  disabled={!bedAssignment}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Confirm Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedEmergency && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl border border-red-500/30 shadow-lg">
                  <XCircle size={28} className="text-red-400" weight="fill" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Reject Emergency
                </h2>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  Provide a reason for rejecting emergency for{" "}
                  <strong className="text-white">{selectedEmergency.patientName}</strong>:
                </p>

                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., No available beds, specialty not available..."
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 min-h-[120px]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedEmergency(null);
                    setRejectReason("");
                  }}
                  className="flex-1 px-5 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all border border-gray-600/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default EmergencyQueue;
