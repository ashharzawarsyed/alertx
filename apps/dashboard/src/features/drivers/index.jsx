/**
 * Enhanced Drivers Management Page
 * Beautiful, professional UI with modern design patterns and comprehensive functionality
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  UserPlus,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  MoreVertical,
  Eye,
  Car,
  MapPin,
  Phone,
  Calendar,
  Award,
  FileText,
  Ban,
  UserCheck,
} from "lucide-react";
import { useDrivers, usePendingDrivers } from "./hooks/useDrivers";

const DriversPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'block'
  const [actionReason, setActionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch data based on active tab
  const {
    drivers,
    loading,
    error,
    refetch,
    approveDriver,
    rejectDriver,
    updateDriverStatus,
  } = useDrivers();
  const {
    pendingDrivers,
    loading: pendingLoading,
    refetch: refetchPending,
  } = usePendingDrivers();

  // Get current data based on active tab
  const currentData = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return pendingDrivers;
      case "approved":
        return drivers.filter((d) => d.approvalStatus === "approved");
      case "rejected":
        return drivers.filter((d) => d.approvalStatus === "rejected");
      case "blocked":
        return drivers.filter((d) => d.approvalStatus === "blocked");
      default:
        return drivers;
    }
  }, [activeTab, drivers, pendingDrivers]);

  const isLoading = activeTab === "pending" ? pendingLoading : loading;

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let filtered = currentData;

    if (searchTerm) {
      filtered = filtered.filter(
        (driver) =>
          driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.driverInfo?.licenseNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          driver.driverInfo?.ambulanceNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all" && activeTab === "approved") {
      filtered = filtered.filter(
        (driver) => driver.driverInfo?.status === statusFilter,
      );
    }

    return filtered;
  }, [currentData, searchTerm, statusFilter, activeTab]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = drivers.length;
    const pending = pendingDrivers.length;
    const approved = drivers.filter(
      (d) => d.approvalStatus === "approved",
    ).length;
    const active = drivers.filter(
      (d) =>
        d.approvalStatus === "approved" && d.driverInfo?.status === "available",
    ).length;
    const blocked = drivers.filter(
      (d) => d.approvalStatus === "blocked",
    ).length;

    return { total, pending, approved, active, blocked };
  }, [drivers, pendingDrivers]);

  // Handle actions
  const handleAction = async (driver, action) => {
    setSelectedDriver(driver);
    setActionType(action);
    setShowDriverModal(true);
  };

  const executeAction = async () => {
    if (!selectedDriver || !actionType) return;

    setIsProcessing(true);
    try {
      switch (actionType) {
        case "approve":
          await approveDriver(selectedDriver.id);
          break;
        case "reject":
          await rejectDriver(selectedDriver.id, actionReason);
          break;
        case "block":
          await updateDriverStatus(selectedDriver.id, "blocked", actionReason);
          break;
        default:
          break;
      }

      await refetch();
      await refetchPending();
      setShowDriverModal(false);
      setActionReason("");
    } catch (err) {
      // Handle error appropriately - could show toast notification
      alert(`Action failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = [
    {
      id: "pending",
      label: "Pending Review",
      count: stats.pending,
      color: "text-amber-600",
    },
    {
      id: "approved",
      label: "Active Drivers",
      count: stats.approved,
      color: "text-emerald-600",
    },
    {
      id: "all",
      label: "All Drivers",
      count: stats.total,
      color: "text-blue-600",
    },
    {
      id: "blocked",
      label: "Blocked",
      count: stats.blocked,
      color: "text-red-600",
    },
  ];

  if (error) {
    return (
      <div className="mx-auto max-w-md p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-900">
            Failed to Load Drivers
          </h3>
          <p className="mb-4 text-red-700">{error}</p>
          <button
            onClick={refetch}
            className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-slate-900">
              Driver Management
            </h1>
            <p className="text-lg text-slate-600">
              Review applications, manage driver status, and oversee your fleet
              team
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                refetch();
                refetchPending();
              }}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-colors hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
              <UserPlus className="h-4 w-4" />
              Invite Driver
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Drivers",
              value: stats.total,
              icon: Users,
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-50",
            },
            {
              label: "Pending Review",
              value: stats.pending,
              icon: Clock,
              color: "from-amber-500 to-amber-600",
              bgColor: "bg-amber-50",
            },
            {
              label: "Active Now",
              value: stats.active,
              icon: CheckCircle,
              color: "from-emerald-500 to-emerald-600",
              bgColor: "bg-emerald-50",
            },
            {
              label: "Blocked",
              value: stats.blocked,
              icon: Ban,
              color: "from-red-500 to-red-600",
              bgColor: "bg-red-50",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} rounded-2xl border border-white/20 p-6 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`rounded-xl bg-gradient-to-r p-3 ${stat.color} shadow-lg`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* Tabs */}
          <div className="border-b border-slate-200 px-6">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b-2 px-2 py-4 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none ${
                    activeTab === tab.id
                      ? `border-blue-500 ${tab.color}`
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-2 rounded-full px-2 py-1 text-xs ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="border-b border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                <input
                  type="text"
                  placeholder="Search drivers by name, email, license..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                {activeTab === "approved" && (
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                )}

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor="experience-filter"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Experience
                    </label>
                    <select
                      id="experience-filter"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Any Experience</option>
                      <option>0-2 years</option>
                      <option>2-5 years</option>
                      <option>5+ years</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="certification-filter"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Certification
                    </label>
                    <select
                      id="certification-filter"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Any Certification</option>
                      <option>EMT-Basic</option>
                      <option>EMT-Paramedic</option>
                      <option>Advanced Life Support</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="date-filter"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Registration Date
                    </label>
                    <select
                      id="date-filter"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Any Date</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Drivers Grid */}
          <div className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-xl bg-slate-50 p-6"
                  >
                    <div className="mb-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-200"></div>
                      <div className="flex-1">
                        <div className="mb-2 h-4 rounded bg-slate-200"></div>
                        <div className="h-3 w-2/3 rounded bg-slate-200"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 rounded bg-slate-200"></div>
                      <div className="h-3 w-3/4 rounded bg-slate-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredData.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                  <Users className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  No drivers found
                </h3>
                <p className="text-slate-600">
                  {searchTerm
                    ? `No drivers match "${searchTerm}"`
                    : "No drivers in this category yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence>
                  {filteredData.map((driver) => (
                    <DriverCard
                      key={driver.id}
                      driver={driver}
                      onAction={handleAction}
                      showActions={
                        activeTab === "pending" || activeTab === "approved"
                      }
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showDriverModal && (
        <ActionModal
          driver={selectedDriver}
          actionType={actionType}
          reason={actionReason}
          setReason={setActionReason}
          onConfirm={executeAction}
          onCancel={() => {
            setShowDriverModal(false);
            setActionReason("");
          }}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

// Enhanced Driver Card Component
const DriverCard = ({ driver, onAction, showActions }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
              <span className="text-lg font-bold text-white">
                {driver.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {driver.name}
              </h3>
              <p className="text-sm text-slate-600">{driver.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                driver.approvalStatus
                  ? getStatusColor(driver.approvalStatus)
                  : getStatusColor("pending")
              }`}
            >
              {(driver.approvalStatus || "pending").charAt(0).toUpperCase() +
                (driver.approvalStatus || "pending").slice(1)}
            </div>

            {showActions && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded-lg p-2 transition-colors hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <MoreVertical className="h-4 w-4 text-slate-600" />
                </button>
                {showMenu && (
                  <div className="absolute top-full right-0 z-10 mt-1 min-w-[160px] rounded-lg border border-slate-200 bg-white shadow-lg">
                    <button
                      onClick={() => {
                        onAction(driver, "view");
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    {driver.approvalStatus === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            onAction(driver, "approve");
                            setShowMenu(false);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-emerald-600 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                        >
                          <UserCheck className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            onAction(driver, "reject");
                            setShowMenu(false);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {driver.approvalStatus === "approved" && (
                      <button
                        onClick={() => {
                          onAction(driver, "block");
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                      >
                        <Ban className="h-4 w-4" />
                        Block Driver
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="h-4 w-4 text-slate-400" />
            <span>{driver.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>
              {new Date(driver.registrationDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Driver Details */}
        <div className="mb-4 rounded-lg bg-slate-50 p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="mb-1 flex items-center gap-2 text-slate-600">
                <FileText className="h-3 w-3" />
                <span className="font-medium">License</span>
              </div>
              <p className="font-mono text-xs text-slate-900">
                {driver.driverInfo?.licenseNumber}
              </p>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-slate-600">
                <Car className="h-3 w-3" />
                <span className="font-medium">Ambulance</span>
              </div>
              <p className="font-mono text-xs text-slate-900">
                {driver.driverInfo?.ambulanceNumber || "Not assigned"}
              </p>
            </div>
          </div>
        </div>

        {/* Experience & Certifications */}
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <Award className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">
              Experience: {driver.experience?.years || 0} years
            </span>
          </div>
          {driver.experience?.certifications && (
            <div className="flex flex-wrap gap-1">
              {driver.experience.certifications
                .slice(0, 2)
                .map((cert, index) => (
                  <span
                    key={index}
                    className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    {cert}
                  </span>
                ))}
              {driver.experience.certifications.length > 2 && (
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  +{driver.experience.certifications.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status for Approved Drivers */}
        {driver.approvalStatus === "approved" && driver.driverInfo?.status && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  driver.driverInfo.status === "available"
                    ? "bg-emerald-500"
                    : driver.driverInfo.status === "busy"
                      ? "bg-red-500"
                      : "bg-slate-400"
                }`}
              />
              <span className="text-sm font-medium text-slate-700 capitalize">
                {driver.driverInfo.status}
              </span>
            </div>
            {driver.driverInfo.currentLocation && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3" />
                <span>Location tracked</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Action Modal Component
const ActionModal = ({
  driver,
  actionType,
  reason,
  setReason,
  onConfirm,
  onCancel,
  isProcessing,
}) => {
  const getModalContent = () => {
    switch (actionType) {
      case "approve":
        return {
          title: "Approve Driver",
          description: `Are you sure you want to approve ${driver?.name}? They will be added to your active driver fleet.`,
          confirmText: "Approve Driver",
          confirmColor: "bg-emerald-600 hover:bg-emerald-700",
          showReason: false,
        };
      case "reject":
        return {
          title: "Reject Application",
          description: `Please provide a reason for rejecting ${driver?.name}'s application:`,
          confirmText: "Reject Application",
          confirmColor: "bg-red-600 hover:bg-red-700",
          showReason: true,
        };
      case "block":
        return {
          title: "Block Driver",
          description: `This will block ${driver?.name} from accessing the system. Please provide a reason:`,
          confirmText: "Block Driver",
          confirmColor: "bg-red-600 hover:bg-red-700",
          showReason: true,
        };
      default:
        return {
          title: "Confirm Action",
          description: "Are you sure you want to perform this action?",
          confirmText: "Confirm",
          confirmColor: "bg-blue-600 hover:bg-blue-700",
          showReason: false,
        };
    }
  };

  const content = getModalContent();

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h3 className="mb-3 text-xl font-bold text-slate-900">
          {content.title}
        </h3>
        <p className="mb-4 text-slate-600">{content.description}</p>

        {content.showReason && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason..."
            className="mb-4 w-full resize-none rounded-xl border border-slate-200 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 transition-colors hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 focus:outline-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing || (content.showReason && !reason.trim())}
            className={`flex-1 rounded-xl px-4 py-2.5 text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50 ${content.confirmColor}`}
          >
            {isProcessing ? "Processing..." : content.confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "busy":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "offline":
      return "bg-slate-100 text-slate-800 border-slate-200";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "approved":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "rejected":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "blocked":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

export default DriversPage;
