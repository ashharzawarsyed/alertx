import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Building2,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { HospitalProvider } from "./context/HospitalContext";
import { useHospitals } from "./hooks/useHospitals";
import HospitalCard from "./components/HospitalCard";
import HospitalDetailsModal from "./components/HospitalDetailsModal";
import AddEditHospitalModal from "./components/AddEditHospitalModal";

// Main Management Component (Inside Provider)
const HospitalManagementContent = () => {
  const {
    hospitals,
    isLoading,
    error,
    refetch,
    createHospital,
    updateHospital,
    deleteHospital,
  } = useHospitals();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);

  // Filter hospitals based on search and filters
  const getFilteredHospitals = () => {
    if (!hospitals) return [];

    // Handle both direct array and object with hospitals property
    const hospitalList = Array.isArray(hospitals)
      ? hospitals
      : hospitals.hospitals || [];

    return hospitalList.filter((hospital) => {
      const matchesSearch =
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === "all" || hospital.type === filterType;

      const matchesStatus =
        statusFilter === "all" || hospital.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const filteredData = getFilteredHospitals();

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!hospitals) return { total: 0, active: 0, capacity: 0, utilization: 0 };

    // Handle both direct array and object with hospitals property
    const hospitalList = Array.isArray(hospitals)
      ? hospitals
      : hospitals.hospitals || [];

    const total = hospitalList.length;
    const active = hospitalList.filter(
      (h) => h.status === "operational",
    ).length;
    const totalBeds = hospitalList.reduce((sum, h) => sum + h.totalBeds, 0);
    const occupiedBeds = hospitalList.reduce(
      (sum, h) => sum + h.occupiedBeds,
      0,
    );
    const utilization =
      totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return {
      total,
      active,
      capacity: totalBeds,
      utilization,
    };
  }, [hospitals]);

  const handleViewDetails = (hospital) => {
    setSelectedHospital(hospital);
    setShowDetailsModal(true);
  };

  const handleEdit = (hospital) => {
    setEditingHospital(hospital);
    setShowAddEditModal(true);
  };

  const handleDelete = async (hospital) => {
    if (window.confirm(`Are you sure you want to delete ${hospital.name}?`)) {
      try {
        await deleteHospital.mutateAsync(hospital.id);
      } catch {
        alert("Failed to delete hospital. Please try again.");
      }
    }
  };

  const handleAddNew = () => {
    setEditingHospital(null);
    setShowAddEditModal(true);
  };

  const handleSaveHospital = async (hospitalData) => {
    try {
      if (editingHospital) {
        await updateHospital.mutateAsync({
          id: editingHospital.id,
          data: hospitalData,
        });
      } else {
        await createHospital.mutateAsync(hospitalData);
      }
      setShowAddEditModal(false);
      setEditingHospital(null);
    } catch (error) {
      alert("Failed to save hospital. Please try again.");
      throw error;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-white p-8 text-center shadow-lg">
            <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Error Loading Hospitals
            </h2>
            <p className="mb-4 text-gray-600">
              {error.message || "Failed to load hospital data"}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-gray-900">
                Hospital Management
              </h1>
              <p className="text-gray-600">
                Monitor and manage healthcare facilities across the network
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNew}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-lg transition-colors hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Add Hospital
            </motion.button>
          </div>

          {/* Stats Dashboard */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex h-20 items-center justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-sm font-semibold text-blue-700">
                    Total Hospitals
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats.total}
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    Network facilities
                  </p>
                </div>
                <div className="rounded-xl bg-blue-600 p-3">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex h-20 items-center justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-sm font-semibold text-green-700">
                    Active Facilities
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {stats.active}
                  </p>
                  <p className="mt-1 text-xs text-green-600">
                    Operational status
                  </p>
                </div>
                <div className="rounded-xl bg-green-600 p-3">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex h-20 items-center justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-sm font-semibold text-purple-700">
                    Total Capacity
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {stats.capacity}
                  </p>
                  <p className="mt-1 text-xs text-purple-600">Available beds</p>
                </div>
                <div className="rounded-xl bg-purple-600 p-3">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex h-20 items-center justify-between">
                <div className="flex-1">
                  <p className="mb-1 text-sm font-semibold text-orange-700">
                    Bed Utilization
                  </p>
                  <p className="text-3xl font-bold text-orange-900">
                    {stats.utilization}%
                  </p>
                  <p className="mt-1 text-xs text-orange-600">Current usage</p>
                </div>
                <div className="rounded-xl bg-orange-600 p-3">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
            <div className="flex flex-wrap gap-4">
              <div className="min-w-64 flex-1">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search hospitals by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="general">General Hospital</option>
                  <option value="specialized">Specialized</option>
                  <option value="trauma">Trauma Center</option>
                  <option value="pediatric">Pediatric</option>
                  <option value="cardiac">Cardiac Center</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="operational">Operational</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="emergency">Emergency Only</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-5 py-2 font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Refreshing..." : "Refresh"}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !hospitals && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-lg bg-white p-6 shadow-lg"
              >
                <div className="mb-4 h-4 rounded bg-gray-200"></div>
                <div className="mb-2 h-6 rounded bg-gray-200"></div>
                <div className="mb-4 h-4 rounded bg-gray-200"></div>
                <div className="flex gap-2">
                  <div className="h-8 flex-1 rounded bg-gray-200"></div>
                  <div className="h-8 flex-1 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hospital Grid */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filteredData.map((hospital, index) => (
                <motion.div
                  key={hospital.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <HospitalCard
                    hospital={hospital}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredData.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <Building2 className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-600">
              No hospitals found
            </h3>
            <p className="mb-6 text-gray-500">
              {searchTerm || filterType !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first hospital"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNew}
              className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Add Hospital
            </motion.button>
          </motion.div>
        )}

        {/* Modals */}
        <HospitalDetailsModal
          hospital={selectedHospital}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onEdit={() => {
            setEditingHospital(selectedHospital);
            setShowDetailsModal(false);
            setShowAddEditModal(true);
          }}
          onDelete={() => {
            setShowDetailsModal(false);
            handleDelete(selectedHospital);
          }}
        />

        <AddEditHospitalModal
          hospital={editingHospital}
          isOpen={showAddEditModal}
          onClose={() => {
            setShowAddEditModal(false);
            setEditingHospital(null);
          }}
          onSave={handleSaveHospital}
          isLoading={createHospital.isPending || updateHospital.isPending}
        />
      </div>
    </div>
  );
};

// Main Component with Provider
const HospitalManagement = () => {
  return (
    <HospitalProvider>
      <HospitalManagementContent />
    </HospitalProvider>
  );
};

export default HospitalManagement;
