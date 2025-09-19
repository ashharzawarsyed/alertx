import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Users,
  Activity,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Heart,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Filter,
  Download,
  UserPlus,
  Stethoscope,
  Clock,
} from "lucide-react";
import { PatientProvider } from "./context/PatientContext";
import { usePatients } from "./hooks/usePatients";
import PatientDetailsModal from "./components/PatientDetailsModal";
import AddEditPatientModal from "./components/AddEditPatientModal";

// Main Management Component (Inside Provider)
const PatientManagementContent = () => {
  const {
    patients,
    stats,
    isLoading,
    error,
    refetch,
    createPatient,
    updatePatient,
    deletePatient,
  } = usePatients();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Filter patients based on search and filters
  const getFilteredPatients = () => {
    if (!patients) return [];

    return patients.filter((patient) => {
      const matchesSearch =
        searchTerm === "" ||
        `${patient.firstName} ${patient.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || patient.currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const filteredPatients = getFilteredPatients();

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
    setActionMenuOpen(null);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowAddEditModal(true);
    setActionMenuOpen(null);
  };

  const handleDelete = async (patient) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`,
      )
    ) {
      try {
        await deletePatient.mutateAsync(patient.id);
      } catch {
        alert("Failed to delete patient. Please try again.");
      }
    }
    setActionMenuOpen(null);
  };

  const handleAddNew = () => {
    setEditingPatient(null);
    setShowAddEditModal(true);
  };

  const handleSavePatient = async (patientData) => {
    try {
      if (editingPatient) {
        await updatePatient.mutateAsync({
          id: editingPatient.id,
          data: patientData,
        });
      } else {
        await createPatient.mutateAsync(patientData);
      }
      setShowAddEditModal(false);
      setEditingPatient(null);
    } catch (error) {
      alert("Failed to save patient. Please try again.");
      throw error;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      stable: {
        bg: "bg-gradient-to-r from-green-100 to-emerald-100",
        text: "text-green-800",
        border: "border-green-200",
        dot: "bg-green-500",
        label: "Stable",
      },
      monitoring: {
        bg: "bg-gradient-to-r from-yellow-100 to-amber-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
        dot: "bg-yellow-500",
        label: "Monitoring",
      },
      critical: {
        bg: "bg-gradient-to-r from-red-100 to-rose-100",
        text: "text-red-800",
        border: "border-red-200",
        dot: "bg-red-500",
        label: "Critical",
      },
    };

    const config = statusConfig[status] || statusConfig.stable;
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold ${config.bg} ${config.text} ${config.border} border`}
      >
        <div className={`h-2 w-2 rounded-full ${config.dot}`}></div>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (error) {
    return (
      <div className="relative min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-white p-8 text-center shadow-lg">
            <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Error Loading Patients
            </h2>
            <p className="mb-4 text-gray-600">
              {error.message || "Failed to load patient data"}
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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Enhanced Header with subtle gradient */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="mb-2 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-4xl font-bold text-transparent">
                Patient Registry
              </h1>
              <p className="text-lg font-medium text-gray-600">
                Manage patient records and assignments across hospital networks
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <UserPlus className="h-4 w-4" />
                  {filteredPatients.length} patients
                </div>
                <div className="h-1 w-1 rounded-full bg-gray-400"></div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  Updated {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl border border-gray-200/50 bg-white/80 px-4 py-2.5 text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
              >
                <Download className="h-4 w-4" />
                Export
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddNew}
                className="flex items-center gap-2 rounded-xl border-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                Add Patient
              </motion.button>
            </div>
          </div>

          {/* Enhanced Stats Cards with better visual hierarchy */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="relative flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">
                    Total Patients
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalPatients}
                  </p>
                  <p className="text-xs font-medium text-green-600">
                    ↗ 12% this month
                  </p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="relative flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">
                    Active Emergencies
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.activeEmergencies}
                  </p>
                  <p className="text-xs font-medium text-red-600">
                    Urgent attention
                  </p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-3 shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="relative flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">
                    Critical Cases
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.criticalCases}
                  </p>
                  <p className="text-xs font-medium text-orange-600">
                    Monitoring closely
                  </p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-3 shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="relative flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">
                    Recent Admissions
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.recentAdmissions}
                  </p>
                  <p className="text-xs font-medium text-green-600">
                    Last 24 hours
                  </p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row">
              <div className="relative max-w-lg flex-1">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200/50 bg-white/70 py-3.5 pr-6 pl-12 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="relative">
                <Filter className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="min-w-[140px] appearance-none rounded-2xl border border-gray-200/50 bg-white/70 py-3.5 pr-10 pl-12 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Status</option>
                  <option value="stable">Stable</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => refetch()}
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-medium transition-all duration-200 ${
                isLoading
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : "border border-gray-200/50 bg-white/70 text-gray-700 shadow-sm backdrop-blur-sm hover:bg-white hover:shadow-md"
              }`}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Enhanced Patients Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200/50 bg-white/70 shadow-lg backdrop-blur-sm">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <p className="mt-6 font-medium text-gray-600">
                Loading patients...
              </p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                No patients found
              </h3>
              <p className="mx-auto mb-8 max-w-md text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search criteria or filters to find patients"
                  : "Get started by adding your first patient to the registry"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddNew}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  Add First Patient
                </motion.button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gradient-to-r from-gray-50/80 to-blue-50/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                      Patient Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                      Contact Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                      Medical Overview
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                      Current Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                      Hospital Assignment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase">
                      Last Activity
                    </th>
                    <th className="relative px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/30 bg-white/50 backdrop-blur-sm">
                  <AnimatePresence>
                    {filteredPatients.map((patient, index) => (
                      <motion.tr
                        key={patient.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="group transition-all duration-200 hover:bg-blue-50/30"
                      >
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                                <span className="text-sm font-bold text-white">
                                  {patient.firstName[0]}
                                  {patient.lastName[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="inline-flex items-center gap-1">
                                  <Stethoscope className="h-3 w-3" />
                                  ID: {patient.id}
                                </span>
                                •<span>Age: {patient.age}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                                <Phone className="h-3 w-3 text-green-600" />
                              </div>
                              {patient.phone}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                <Mail className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="max-w-[180px] truncate">
                                {patient.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
                              <Heart className="h-3 w-3" />
                              {patient.bloodType}
                            </div>
                            <div className="text-sm text-gray-600">
                              {patient.allergies.length > 0
                                ? `${patient.allergies.length} known allergies`
                                : "No known allergies"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          {getStatusBadge(patient.currentStatus)}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.assignedHospital}
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {formatDate(patient.lastVisit)}
                          </div>
                        </td>
                        <td className="relative px-6 py-6 text-right text-sm font-medium whitespace-nowrap">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setActionMenuOpen(
                                actionMenuOpen === patient.id
                                  ? null
                                  : patient.id,
                              )
                            }
                            className="rounded-xl p-2 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </motion.button>

                          {actionMenuOpen === patient.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute top-12 right-0 z-50 w-56 rounded-2xl border border-gray-200/50 bg-white/95 py-2 shadow-xl ring-1 ring-black/5 backdrop-blur-sm"
                            >
                              <button
                                onClick={() => handleViewDetails(patient)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors duration-150 hover:bg-blue-50"
                              >
                                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-100">
                                  <Eye className="h-3 w-3 text-blue-600" />
                                </div>
                                View Details
                              </button>
                              <button
                                onClick={() => handleEdit(patient)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors duration-150 hover:bg-indigo-50"
                              >
                                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-100">
                                  <Edit className="h-3 w-3 text-indigo-600" />
                                </div>
                                Edit Patient
                              </button>
                              <div className="mx-2 my-1 h-px bg-gray-200"></div>
                              <button
                                onClick={() => handleDelete(patient)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition-colors duration-150 hover:bg-red-50"
                              >
                                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-red-100">
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </div>
                                Delete Patient
                              </button>
                            </motion.div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Click outside to close action menu */}
        {actionMenuOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActionMenuOpen(null)}
            onKeyDown={(e) => e.key === "Escape" && setActionMenuOpen(null)}
            role="button"
            tabIndex={0}
            aria-label="Close menu"
          />
        )}

        {/* Modals */}
        <PatientDetailsModal
          patient={selectedPatient}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onEdit={() => {
            setEditingPatient(selectedPatient);
            setShowDetailsModal(false);
            setShowAddEditModal(true);
          }}
        />

        <AddEditPatientModal
          patient={editingPatient}
          isOpen={showAddEditModal}
          onClose={() => {
            setShowAddEditModal(false);
            setEditingPatient(null);
          }}
          onSave={handleSavePatient}
          isLoading={createPatient.isPending || updatePatient.isPending}
        />
      </div>
    </div>
  );
};

// Main Component with Provider
const PatientManagement = () => {
  return (
    <PatientProvider>
      <PatientManagementContent />
    </PatientProvider>
  );
};

export default PatientManagement;
