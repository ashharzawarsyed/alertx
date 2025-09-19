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
      stable: { bg: "bg-green-100", text: "text-green-800", label: "Stable" },
      monitoring: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Monitoring",
      },
      critical: { bg: "bg-red-100", text: "text-red-800", label: "Critical" },
    };

    const config = statusConfig[status] || statusConfig.stable;
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
      >
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
    <div className="relative min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Patient Registry
              </h1>
              <p className="text-lg text-gray-600">
                Manage patient records and assignments across hospital networks
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddNew}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
            >
              <Plus className="h-5 w-5" />
              Add Patient
            </motion.button>
          </div>

          {/* Stats Cards - Simplified colors */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              whileHover={{ y: -2 }}
              className="overflow-hidden rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalPatients}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="overflow-hidden rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Emergencies</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.activeEmergencies}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <Activity className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="overflow-hidden rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Cases</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.criticalCases}
                  </p>
                </div>
                <div className="rounded-lg bg-orange-50 p-3">
                  <Heart className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="overflow-hidden rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recent Admissions</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.recentAdmissions}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative max-w-md flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="stable">Stable</option>
                <option value="monitoring">Monitoring</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => refetch()}
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isLoading
                  ? "cursor-not-allowed bg-gray-300 text-gray-500"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No patients found
              </h3>
              <p className="mb-6 text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first patient"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddNew}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                  Add First Patient
                </motion.button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Medical Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Hospital
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Last Visit
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  <AnimatePresence>
                    {filteredPatients.map((patient, index) => (
                      <motion.tr
                        key={patient.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <span className="text-sm font-medium text-blue-600">
                                  {patient.firstName[0]}
                                  {patient.lastName[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {patient.id} • Age: {patient.age}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="mb-1 flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {patient.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              {patient.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">
                              Blood: {patient.bloodType}
                            </div>
                            <div className="text-gray-500">
                              {patient.allergies.length > 0
                                ? `Allergies: ${patient.allergies.join(", ")}`
                                : "No known allergies"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(patient.currentStatus)}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {patient.assignedHospital}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {formatDate(patient.lastVisit)}
                        </td>
                        <td className="relative px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setActionMenuOpen(
                                actionMenuOpen === patient.id
                                  ? null
                                  : patient.id,
                              )
                            }
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </motion.button>

                          {actionMenuOpen === patient.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="ring-opacity-5 absolute top-8 right-0 z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black"
                            >
                              <button
                                onClick={() => handleViewDetails(patient)}
                                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => handleEdit(patient)}
                                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(patient)}
                                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
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
