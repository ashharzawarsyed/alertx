import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  MagnifyingGlass,
  Phone,
  EnvelopeSimple,
  IdentificationCard,
  Briefcase,
  CalendarBlank,
  Clock,
  CheckCircle,
  XCircle,
  PencilSimple,
  Trash,
  UserCircle,
  Heart,
  FirstAid,
  Heartbeat,
  Activity,
} from "phosphor-react";
import React, { useState, useEffect } from "react";

const StaffManagement = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "nurse",
    department: "emergency",
    employeeId: "",
    qualification: "",
    experience: "",
    shift: "morning",
    status: "active",
  });

  // Mock data - replace with API call
  useEffect(() => {
    const mockStaff = [
      {
        id: 1,
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@hospital.com",
        phone: "+1 234-567-8901",
        role: "doctor",
        department: "emergency",
        employeeId: "DOC001",
        qualification: "MD, Emergency Medicine",
        experience: "12 years",
        shift: "morning",
        status: "active",
        joiningDate: "2015-03-15",
        lastActive: "2 hours ago",
      },
      {
        id: 2,
        name: "Emily Chen",
        email: "emily.chen@hospital.com",
        phone: "+1 234-567-8902",
        role: "nurse",
        department: "icu",
        employeeId: "NUR001",
        qualification: "BSN, Critical Care Certified",
        experience: "8 years",
        shift: "night",
        status: "active",
        joiningDate: "2018-06-20",
        lastActive: "30 minutes ago",
      },
      {
        id: 3,
        name: "Dr. Michael Brown",
        email: "michael.brown@hospital.com",
        phone: "+1 234-567-8903",
        role: "doctor",
        department: "surgery",
        employeeId: "DOC002",
        qualification: "MD, MS Surgery",
        experience: "15 years",
        shift: "morning",
        status: "active",
        joiningDate: "2012-01-10",
        lastActive: "1 hour ago",
      },
      {
        id: 4,
        name: "Jessica Williams",
        email: "jessica.williams@hospital.com",
        phone: "+1 234-567-8904",
        role: "paramedic",
        department: "emergency",
        employeeId: "PAR001",
        qualification: "EMT-P Certified",
        experience: "6 years",
        shift: "evening",
        status: "active",
        joiningDate: "2019-04-12",
        lastActive: "15 minutes ago",
      },
      {
        id: 5,
        name: "Robert Garcia",
        email: "robert.garcia@hospital.com",
        phone: "+1 234-567-8905",
        role: "technician",
        department: "radiology",
        employeeId: "TEC001",
        qualification: "Radiologic Technology",
        experience: "10 years",
        shift: "morning",
        status: "active",
        joiningDate: "2016-08-22",
        lastActive: "3 hours ago",
      },
      {
        id: 6,
        name: "Dr. Amanda Lee",
        email: "amanda.lee@hospital.com",
        phone: "+1 234-567-8906",
        role: "doctor",
        department: "icu",
        employeeId: "DOC003",
        qualification: "MD, Intensive Care",
        experience: "9 years",
        shift: "evening",
        status: "on-leave",
        joiningDate: "2017-11-05",
        lastActive: "2 days ago",
      },
      {
        id: 7,
        name: "David Martinez",
        email: "david.martinez@hospital.com",
        phone: "+1 234-567-8907",
        role: "nurse",
        department: "emergency",
        employeeId: "NUR002",
        qualification: "RN, Emergency Care",
        experience: "5 years",
        shift: "night",
        status: "active",
        joiningDate: "2020-02-18",
        lastActive: "45 minutes ago",
      },
      {
        id: 8,
        name: "Lisa Anderson",
        email: "lisa.anderson@hospital.com",
        phone: "+1 234-567-8908",
        role: "admin",
        department: "administration",
        employeeId: "ADM001",
        qualification: "MBA Healthcare Management",
        experience: "7 years",
        shift: "morning",
        status: "active",
        joiningDate: "2018-09-30",
        lastActive: "1 hour ago",
      },
    ];

    setTimeout(() => {
      setStaffMembers(mockStaff);
      setLoading(false);
    }, 800);
  }, []);

  const departments = [
    { value: "all", label: "All Departments" },
    { value: "emergency", label: "Emergency" },
    { value: "icu", label: "ICU" },
    { value: "surgery", label: "Surgery" },
    { value: "radiology", label: "Radiology" },
    { value: "administration", label: "Administration" },
  ];

  const roles = [
    { value: "all", label: "All Roles" },
    { value: "doctor", label: "Doctor" },
    { value: "nurse", label: "Nurse" },
    { value: "paramedic", label: "Paramedic" },
    { value: "technician", label: "Technician" },
    { value: "admin", label: "Admin" },
  ];

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "on-leave", label: "On Leave" },
    { value: "inactive", label: "Inactive" },
  ];

  const shifts = [
    { value: "morning", label: "Morning (6AM - 2PM)" },
    { value: "evening", label: "Evening (2PM - 10PM)" },
    { value: "night", label: "Night (10PM - 6AM)" },
  ];

  // Filter staff
  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" || staff.department === selectedDepartment;
    const matchesRole = selectedRole === "all" || staff.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" || staff.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: staffMembers.length,
    active: staffMembers.filter((s) => s.status === "active").length,
    onLeave: staffMembers.filter((s) => s.status === "on-leave").length,
    doctors: staffMembers.filter((s) => s.role === "doctor").length,
    nurses: staffMembers.filter((s) => s.role === "nurse").length,
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "doctor":
        return Heart;
      case "nurse":
        return FirstAid;
      case "paramedic":
        return Heartbeat;
      case "technician":
        return Activity;
      default:
        return UserCircle;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "doctor":
        return "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400";
      case "nurse":
        return "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400";
      case "paramedic":
        return "from-red-500/20 to-pink-500/20 border-red-500/30 text-red-400";
      case "technician":
        return "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400";
      default:
        return "from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-400";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-300 border-green-500/30";
      case "on-leave":
        return "bg-orange-500/10 text-orange-300 border-orange-500/30";
      case "inactive":
        return "bg-gray-500/10 text-gray-300 border-gray-500/30";
      default:
        return "bg-gray-500/10 text-gray-300 border-gray-500/30";
    }
  };

  const handleAddStaff = () => {
    // API call would go here
    const newStaff = {
      id: staffMembers.length + 1,
      ...formData,
      joiningDate: new Date().toISOString().split("T")[0],
      lastActive: "Just now",
    };
    setStaffMembers([...staffMembers, newStaff]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditStaff = () => {
    // API call would go here
    setStaffMembers(
      staffMembers.map((staff) =>
        staff.id === selectedStaff.id ? { ...staff, ...formData } : staff
      )
    );
    setShowEditModal(false);
    setSelectedStaff(null);
    resetForm();
  };

  const handleDeleteStaff = (id) => {
    if (window.confirm("Are you sure you want to remove this staff member?")) {
      setStaffMembers(staffMembers.filter((staff) => staff.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "nurse",
      department: "emergency",
      employeeId: "",
      qualification: "",
      experience: "",
      shift: "morning",
      status: "active",
    });
  };

  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      department: staff.department,
      employeeId: staff.employeeId,
      qualification: staff.qualification,
      experience: staff.experience,
      shift: staff.shift,
      status: staff.status,
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Staff Management
            </h1>
            <p className="text-gray-400">Manage your hospital staff members</p>
          </div>
          <motion.button
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            <UserPlus size={20} weight="bold" />
            Add Staff Member
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                  Total Staff
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                <Users size={28} className="text-blue-400" weight="fill" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                  Active
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.active}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                <CheckCircle size={28} className="text-green-400" weight="fill" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                  On Leave
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.onLeave}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl border border-orange-500/30">
                <CalendarBlank size={28} className="text-orange-400" weight="fill" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                  Doctors
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.doctors}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                <Heart size={28} className="text-blue-400" weight="fill" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                  Nurses
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.nurses}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                <FirstAid size={28} className="text-green-400" weight="fill" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-gray-900/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlass
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value} className="bg-gray-800">
                  {dept.label}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value} className="bg-gray-800">
                  {role.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value} className="bg-gray-800">
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStaff.map((staff) => {
          const RoleIcon = getRoleIcon(staff.role);
          return (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-gray-900/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl hover:border-gray-600/70 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${getRoleColor(staff.role)} border`}>
                      <RoleIcon size={28} weight="fill" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{staff.name}</h3>
                      <p className="text-sm text-gray-400 font-medium capitalize">
                        {staff.role} • {staff.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => openEditModal(staff)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30"
                    >
                      <PencilSimple size={18} weight="bold" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteStaff(staff.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30"
                    >
                      <Trash size={18} weight="bold" />
                    </motion.button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusBadge(
                      staff.status
                    )}`}
                  >
                    {staff.status === "active"
                      ? "Active"
                      : staff.status === "on-leave"
                      ? "On Leave"
                      : "Inactive"}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <IdentificationCard
                      size={18}
                      className="text-gray-400"
                      weight="fill"
                    />
                    <span className="text-gray-300">{staff.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <EnvelopeSimple
                      size={18}
                      className="text-gray-400"
                      weight="fill"
                    />
                    <span className="text-gray-300">{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={18} className="text-gray-400" weight="fill" />
                    <span className="text-gray-300">{staff.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase
                      size={18}
                      className="text-gray-400"
                      weight="fill"
                    />
                    <span className="text-gray-300">{staff.qualification}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarBlank
                      size={18}
                      className="text-gray-400"
                      weight="fill"
                    />
                    <span className="text-gray-300">
                      {staff.experience} experience
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock size={18} className="text-gray-400" weight="fill" />
                    <span className="text-gray-300 capitalize">
                      {staff.shift} Shift
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Joined {new Date(staff.joiningDate).toLocaleDateString()}</span>
                    <span className="text-blue-400">Last active: {staff.lastActive}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredStaff.length === 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-gray-900/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-12 rounded-2xl border border-gray-700/50 shadow-xl text-center">
            <Users size={64} className="mx-auto text-gray-600 mb-4" weight="duotone" />
            <h3 className="text-xl font-bold text-white mb-2">No Staff Found</h3>
            <p className="text-gray-400">
              Try adjusting your filters or add a new staff member
            </p>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Add Staff Member</h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-700/50 rounded-lg"
                  >
                    <XCircle size={24} className="text-gray-400" weight="fill" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Dr. John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) =>
                        setFormData({ ...formData, employeeId: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="DOC001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="john.doe@hospital.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="+1 234-567-8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="doctor" className="bg-gray-800">Doctor</option>
                      <option value="nurse" className="bg-gray-800">Nurse</option>
                      <option value="paramedic" className="bg-gray-800">Paramedic</option>
                      <option value="technician" className="bg-gray-800">Technician</option>
                      <option value="admin" className="bg-gray-800">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="emergency" className="bg-gray-800">Emergency</option>
                      <option value="icu" className="bg-gray-800">ICU</option>
                      <option value="surgery" className="bg-gray-800">Surgery</option>
                      <option value="radiology" className="bg-gray-800">Radiology</option>
                      <option value="administration" className="bg-gray-800">Administration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Qualification *
                    </label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) =>
                        setFormData({ ...formData, qualification: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="MD, Emergency Medicine"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Experience *
                    </label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="5 years"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Shift *
                    </label>
                    <select
                      value={formData.shift}
                      onChange={(e) =>
                        setFormData({ ...formData, shift: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {shifts.map((shift) => (
                        <option key={shift.value} value={shift.value} className="bg-gray-800">
                          {shift.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="active" className="bg-gray-800">Active</option>
                      <option value="on-leave" className="bg-gray-800">On Leave</option>
                      <option value="inactive" className="bg-gray-800">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-semibold border border-gray-600/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddStaff}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30"
                  >
                    Add Staff Member
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Staff Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Edit Staff Member</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedStaff(null);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-700/50 rounded-lg"
                  >
                    <XCircle size={24} className="text-gray-400" weight="fill" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) =>
                        setFormData({ ...formData, employeeId: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="doctor" className="bg-gray-800">Doctor</option>
                      <option value="nurse" className="bg-gray-800">Nurse</option>
                      <option value="paramedic" className="bg-gray-800">Paramedic</option>
                      <option value="technician" className="bg-gray-800">Technician</option>
                      <option value="admin" className="bg-gray-800">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="emergency" className="bg-gray-800">Emergency</option>
                      <option value="icu" className="bg-gray-800">ICU</option>
                      <option value="surgery" className="bg-gray-800">Surgery</option>
                      <option value="radiology" className="bg-gray-800">Radiology</option>
                      <option value="administration" className="bg-gray-800">Administration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Qualification *
                    </label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) =>
                        setFormData({ ...formData, qualification: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Experience *
                    </label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Shift *
                    </label>
                    <select
                      value={formData.shift}
                      onChange={(e) =>
                        setFormData({ ...formData, shift: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      {shifts.map((shift) => (
                        <option key={shift.value} value={shift.value} className="bg-gray-800">
                          {shift.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="active" className="bg-gray-800">Active</option>
                      <option value="on-leave" className="bg-gray-800">On Leave</option>
                      <option value="inactive" className="bg-gray-800">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedStaff(null);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-semibold border border-gray-600/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditStaff}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffManagement;
