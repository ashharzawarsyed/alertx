import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

const AdminApprovals = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch pending admins
  const fetchPendingAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("alertx_admin_token");
      const response = await fetch(
        "http://localhost:5000/api/v1/auth/admin/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setPendingAdmins(data.data.admins || []);
      } else {
        // Handle fetch error
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  // Handle approval
  const handleApprove = async (adminId) => {
    try {
      setActionLoading(adminId);
      const token = localStorage.getItem("alertx_admin_token");
      const response = await fetch(
        `http://localhost:5000/api/v1/auth/admin/${adminId}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ approved: true }),
        },
      );

      if (response.ok) {
        // Remove from pending list
        setPendingAdmins((prev) =>
          prev.filter((admin) => admin._id !== adminId),
        );
        // Show success message
        alert("Admin approved successfully!");
      } else {
        const data = await response.json();
        alert(`Failed to approve admin: ${data.message}`);
      }
    } catch {
      alert("Error approving admin");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle rejection
  const handleReject = async (adminId) => {
    try {
      setActionLoading(adminId);
      const token = localStorage.getItem("alertx_admin_token");
      const response = await fetch(
        `http://localhost:5000/api/v1/auth/admin/${adminId}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            approved: false,
            reason: rejectReason || "Application rejected",
          }),
        },
      );

      if (response.ok) {
        // Remove from pending list
        setPendingAdmins((prev) =>
          prev.filter((admin) => admin._id !== adminId),
        );
        setShowRejectModal(null);
        setRejectReason("");
        alert("Admin rejected successfully!");
      } else {
        const data = await response.json();
        alert(`Failed to reject admin: ${data.message}`);
      }
    } catch {
      alert("Error rejecting admin");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Pending Admin Approvals
          </h3>
          <p className="text-sm text-gray-500">
            Review and approve admin account requests
          </p>
        </div>
        <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          {pendingAdmins.length} pending
        </div>
      </div>

      {/* Pending Admins List */}
      {pendingAdmins.length === 0 ? (
        <div className="py-12 text-center">
          <CheckCircleSolid className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No pending approvals
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            All admin requests have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingAdmins.map((admin) => (
            <motion.div
              key={admin._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Admin Info */}
                  <div className="mb-4 flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {admin.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Admin Account Request
                      </p>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {admin.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {admin.phone}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Requested: {formatDate(admin.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Status: {admin.approvalStatus}
                      </span>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
                      <div className="ml-3">
                        <p className="text-sm text-amber-800">
                          Admin access grants full system privileges. Please
                          verify the user&apos;s identity before approval.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(admin._id)}
                    disabled={actionLoading === admin._id}
                    className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                  >
                    {actionLoading === admin._id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    ) : (
                      <>
                        <CheckCircleIcon className="mr-2 h-4 w-4" />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(admin._id)}
                    disabled={actionLoading === admin._id}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                  >
                    <XCircleIcon className="mr-2 h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-gray-500 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-lg bg-white p-6"
            >
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Reject Admin Request
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Please provide a reason for rejecting this admin request:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                rows="3"
                placeholder="Enter rejection reason..."
              />
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectReason("");
                  }}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  disabled={
                    !rejectReason.trim() || actionLoading === showRejectModal
                  }
                  className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading === showRejectModal
                    ? "Rejecting..."
                    : "Reject Request"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminApprovals;
