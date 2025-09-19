/**
 * Ambulances Management Page
 * Main page for ambulance fleet management with filters, real-time updates, and detailed views
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Grid3X3,
  List,
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import { AmbulanceCard } from "./components/AmbulanceCard";
import { StatusBadge } from "./components/StatusBadge";
import { useAmbulances } from "./hooks/useAmbulances";
import { AMBULANCE_STATUS, PRIORITY_LEVELS } from "./types/ambulanceTypes";

const AmbulancesPage = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);

  // Build filters object
  const filters = useMemo(() => {
    const filterObj = {};
    if (statusFilter !== "all") filterObj.status = statusFilter;
    if (priorityFilter !== "all") filterObj.priority = priorityFilter;
    return filterObj;
  }, [statusFilter, priorityFilter]);

  // Fetch ambulances data
  const { ambulances, loading, error, lastUpdated, retry } =
    useAmbulances(filters);

  // Filter and search ambulances
  const filteredAmbulances = useMemo(() => {
    let filtered = ambulances;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (ambulance) =>
          ambulance.callSign.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ambulance.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ambulance.location?.address
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          ambulance.crew?.some((member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    return filtered;
  }, [ambulances, searchTerm]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = ambulances.length;
    const active = ambulances.filter((amb) =>
      [
        AMBULANCE_STATUS.ON_ROUTE,
        AMBULANCE_STATUS.AT_SCENE,
        AMBULANCE_STATUS.TRANSPORTING,
      ].includes(amb.status),
    ).length;
    const idle = ambulances.filter(
      (amb) => amb.status === AMBULANCE_STATUS.IDLE,
    ).length;
    const maintenance = ambulances.filter((amb) =>
      [AMBULANCE_STATUS.MAINTENANCE, AMBULANCE_STATUS.OUT_OF_SERVICE].includes(
        amb.status,
      ),
    ).length;
    const avgResponseTime =
      ambulances.reduce(
        (acc, amb) => acc + (amb.metrics?.averageResponseTime || 0),
        0,
      ) / total || 0;

    return {
      total,
      active,
      idle,
      maintenance,
      avgResponseTime: avgResponseTime.toFixed(1),
    };
  }, [ambulances]);

  // Handle status update
  const handleStatusUpdate = async (ambulanceId, newStatus) => {
    // This would typically call the API to update status
    // For now, we'll just trigger a refetch
    retry();
  };

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-md p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-900">
            Failed to Load Ambulances
          </h3>
          <p className="mb-4 text-red-700">{error.message}</p>
          <button
            onClick={retry}
            className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ambulance Fleet</h1>
          <p className="mt-1 text-gray-600">
            Manage and monitor your ambulance fleet in real-time
            {lastUpdated && (
              <span className="ml-2 text-sm">
                • Last updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={retry}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add Ambulance
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fleet</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.total}
              </p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Units</p>
              <p className="text-2xl font-bold text-green-600">
                {statistics.active}
              </p>
            </div>
            <div className="rounded-xl bg-green-100 p-3">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-blue-600">
                {statistics.idle}
              </p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-purple-600">
                {statistics.avgResponseTime}m
              </p>
            </div>
            <div className="rounded-xl bg-purple-100 p-3">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Controls */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search ambulances, crew, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {Object.values(AMBULANCE_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              {Object.values(PRIORITY_LEVELS).map((priority) => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ambulances Grid/List */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6"
              >
                <div className="mb-4 h-6 rounded bg-gray-200"></div>
                <div className="mb-2 h-4 rounded bg-gray-200"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            }
          >
            <AnimatePresence>
              {filteredAmbulances.map((ambulance) => (
                <AmbulanceCard
                  key={ambulance.id}
                  ambulance={ambulance}
                  onSelect={setSelectedAmbulance}
                  onStatusUpdate={handleStatusUpdate}
                  variant={viewMode === "list" ? "compact" : "default"}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredAmbulances.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No ambulances found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? `No ambulances match "${searchTerm}"`
                : "No ambulances match the current filters"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmbulancesPage;
