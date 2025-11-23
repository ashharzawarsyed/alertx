import {
  Users,
  User,
  Heart,
  Activity,
  Clock,
  TrendUp,
  TrendDown,
  Calendar,
  Phone,
  Pill,
  FileText,
  Download,
  MagnifyingGlass,
  X,
  Warning,
  Package,
  Heartbeat,
  ChartBar,
  Bed,
  Bell,
} from "phosphor-react";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useAuth } from "../../../hooks/useAuth";
import EmergencyService from "../../../services/EmergencyService";

const PatientRecords = () => {
  const { user, hospital, token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, admitted, discharged, critical
  const [viewMode, setViewMode] = useState("patients"); // patients, analytics

  const hospitalId =
    hospital?.id || hospital?._id || user?.hospitalInfo?.hospitalId;

  // Mock data for patients (will be replaced with API)
  const getMockPatients = () => {
    return [
      {
        id: "P001",
        name: "Sarah Johnson",
        age: 34,
        gender: "Female",
        admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        diagnosis: "Acute Myocardial Infarction",
        status: "admitted",
        bedNumber: "ICU-A12",
        department: "Cardiology",
        doctor: "Dr. Michael Chen",
        condition: "Stable",
        vitals: {
          heartRate: 78,
          bloodPressure: "120/80",
          temperature: 98.6,
          oxygenSaturation: 97,
          respiratoryRate: 16,
        },
        medications: [
          "Aspirin 81mg daily",
          "Atorvastatin 40mg",
          "Metoprolol 25mg",
        ],
        allergies: ["Penicillin"],
        emergencyContact: {
          name: "John Johnson",
          relationship: "Husband",
          phone: "(555) 123-4567",
        },
        insuranceProvider: "Blue Cross Blue Shield",
        insuranceNumber: "BCBS-123456789",
      },
      {
        id: "P002",
        name: "Robert Williams",
        age: 67,
        gender: "Male",
        admissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        diagnosis: "Ischemic Stroke",
        status: "admitted",
        bedNumber: "Neuro-B08",
        department: "Neurology",
        doctor: "Dr. Emily Parker",
        condition: "Critical",
        vitals: {
          heartRate: 88,
          bloodPressure: "165/95",
          temperature: 98.4,
          oxygenSaturation: 94,
          respiratoryRate: 18,
        },
        medications: [
          "tPA (Tissue Plasminogen Activator)",
          "Aspirin 325mg",
          "Lisinopril 10mg",
        ],
        allergies: [],
        emergencyContact: {
          name: "Mary Williams",
          relationship: "Wife",
          phone: "(555) 234-5678",
        },
        insuranceProvider: "Medicare",
        insuranceNumber: "MED-987654321",
      },
      {
        id: "P003",
        name: "Emma Rodriguez",
        age: 45,
        gender: "Female",
        admissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        diagnosis: "Severe Allergic Reaction",
        status: "admitted",
        bedNumber: "ER-C05",
        department: "Emergency",
        doctor: "Dr. James Wilson",
        condition: "Improving",
        vitals: {
          heartRate: 72,
          bloodPressure: "118/76",
          temperature: 98.8,
          oxygenSaturation: 98,
          respiratoryRate: 14,
        },
        medications: ["Epinephrine", "Diphenhydramine 50mg", "Prednisone 60mg"],
        allergies: ["Shellfish", "Latex"],
        emergencyContact: {
          name: "Carlos Rodriguez",
          relationship: "Brother",
          phone: "(555) 345-6789",
        },
        insuranceProvider: "United Healthcare",
        insuranceNumber: "UHC-456789123",
      },
      {
        id: "P004",
        name: "Michael Chen",
        age: 28,
        gender: "Male",
        admissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        diagnosis: "Multiple Fractures (MVA)",
        status: "admitted",
        bedNumber: "Ortho-D15",
        department: "Orthopedics",
        doctor: "Dr. Sarah Martinez",
        condition: "Stable",
        vitals: {
          heartRate: 76,
          bloodPressure: "125/82",
          temperature: 99.1,
          oxygenSaturation: 96,
          respiratoryRate: 15,
        },
        medications: [
          "Morphine 5mg PRN",
          "Cephalexin 500mg",
          "Enoxaparin 40mg",
        ],
        allergies: [],
        emergencyContact: {
          name: "Linda Chen",
          relationship: "Mother",
          phone: "(555) 456-7890",
        },
        insuranceProvider: "Aetna",
        insuranceNumber: "AET-789123456",
      },
      {
        id: "P005",
        name: "Jessica Taylor",
        age: 29,
        gender: "Female",
        admissionDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
        diagnosis: "Preterm Labor",
        status: "admitted",
        bedNumber: "L&D-E02",
        department: "Labor & Delivery",
        doctor: "Dr. Patricia Anderson",
        condition: "Stable",
        vitals: {
          heartRate: 82,
          bloodPressure: "115/72",
          temperature: 98.7,
          oxygenSaturation: 99,
          respiratoryRate: 16,
        },
        medications: [
          "Terbutaline 0.25mg",
          "Betamethasone",
          "Magnesium Sulfate",
        ],
        allergies: [],
        emergencyContact: {
          name: "David Taylor",
          relationship: "Husband",
          phone: "(555) 567-8901",
        },
        insuranceProvider: "Cigna",
        insuranceNumber: "CGN-321654987",
      },
      {
        id: "P006",
        name: "David Smith",
        age: 52,
        gender: "Male",
        admissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        diagnosis: "Chemical Burns",
        status: "recovering",
        bedNumber: "Burn-F10",
        department: "Burn Unit",
        doctor: "Dr. Robert Kumar",
        condition: "Improving",
        vitals: {
          heartRate: 84,
          bloodPressure: "128/84",
          temperature: 99.8,
          oxygenSaturation: 95,
          respiratoryRate: 17,
        },
        medications: [
          "Silver Sulfadiazine cream",
          "Fentanyl patch 25mcg",
          "Ciprofloxacin 500mg",
        ],
        allergies: [],
        emergencyContact: {
          name: "Jennifer Smith",
          relationship: "Wife",
          phone: "(555) 678-9012",
        },
        insuranceProvider: "Kaiser Permanente",
        insuranceNumber: "KP-147258369",
      },
      {
        id: "P007",
        name: "Maria Garcia",
        age: 38,
        gender: "Female",
        admissionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        diagnosis: "Pneumonia",
        status: "admitted",
        bedNumber: "Med-G21",
        department: "Internal Medicine",
        doctor: "Dr. Thomas Lee",
        condition: "Stable",
        vitals: {
          heartRate: 92,
          bloodPressure: "122/78",
          temperature: 100.2,
          oxygenSaturation: 93,
          respiratoryRate: 22,
        },
        medications: [
          "Azithromycin 500mg",
          "Albuterol inhaler",
          "Acetaminophen 650mg",
        ],
        allergies: ["Sulfa drugs"],
        emergencyContact: {
          name: "Jose Garcia",
          relationship: "Husband",
          phone: "(555) 789-0123",
        },
        insuranceProvider: "Humana",
        insuranceNumber: "HUM-963852741",
      },
      {
        id: "P008",
        name: "James Thompson",
        age: 71,
        gender: "Male",
        admissionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        diagnosis: "Congestive Heart Failure",
        status: "discharged",
        bedNumber: null,
        department: "Cardiology",
        doctor: "Dr. Michael Chen",
        condition: "Discharged",
        dischargeDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        vitals: {
          heartRate: 68,
          bloodPressure: "118/76",
          temperature: 98.6,
          oxygenSaturation: 96,
          respiratoryRate: 14,
        },
        medications: [
          "Furosemide 40mg",
          "Carvedilol 12.5mg",
          "Lisinopril 20mg",
        ],
        allergies: [],
        emergencyContact: {
          name: "Susan Thompson",
          relationship: "Daughter",
          phone: "(555) 890-1234",
        },
        insuranceProvider: "Medicare",
        insuranceNumber: "MED-741852963",
      },
    ];
  };

  // Mock analytics data
  const getMockAnalytics = () => {
    return {
      overview: {
        totalPatients: 42,
        admittedToday: 5,
        dischargedToday: 3,
        criticalCondition: 4,
        averageStayDuration: 4.2,
      },
      departmentBreakdown: [
        { department: "Emergency", count: 8, percentage: 19 },
        { department: "ICU", count: 6, percentage: 14 },
        { department: "Cardiology", count: 7, percentage: 17 },
        { department: "Neurology", count: 5, percentage: 12 },
        { department: "Orthopedics", count: 6, percentage: 14 },
        { department: "Internal Medicine", count: 5, percentage: 12 },
        { department: "Labor & Delivery", count: 3, percentage: 7 },
        { department: "Burn Unit", count: 2, percentage: 5 },
      ],
      admissionTrend: [
        { date: "Nov 16", admissions: 8, discharges: 5 },
        { date: "Nov 17", admissions: 6, discharges: 7 },
        { date: "Nov 18", admissions: 10, discharges: 4 },
        { date: "Nov 19", admissions: 7, discharges: 6 },
        { date: "Nov 20", admissions: 9, discharges: 8 },
        { date: "Nov 21", admissions: 5, discharges: 9 },
        { date: "Nov 22", admissions: 8, discharges: 6 },
        { date: "Nov 23", admissions: 5, discharges: 3 },
      ],
      responseMetrics: {
        averageAdmissionTime: 18,
        averageDischargeTime: 45,
        emergencyResponseTime: 8,
        bedTurnoverRate: 85,
      },
      conditionBreakdown: [
        { condition: "Stable", count: 22, color: "#10b981" },
        { condition: "Improving", count: 12, color: "#3b82f6" },
        { condition: "Critical", count: 4, color: "#ef4444" },
        { condition: "Recovering", count: 4, color: "#8b5cf6" },
      ],
    };
  };

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data for now
      const patientData = getMockPatients();
      const analyticsData = getMockAnalytics();

      setPatients(patientData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Error loading patient data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter and search patients
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "critical"
          ? patient.condition === "Critical"
          : patient.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Status badge component
  const StatusBadge = ({ status, condition }) => {
    const configs = {
      admitted: {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        label: "Admitted",
      },
      discharged: {
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        label: "Discharged",
      },
      recovering: {
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        label: "Recovering",
      },
    };

    const conditionColors = {
      Stable: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      Improving: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      Critical: "bg-red-500/20 text-red-400 border-red-500/30",
      Recovering: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      Discharged: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };

    const config = configs[status] || configs.admitted;

    return (
      <div className="flex items-center gap-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}
        >
          {config.label}
        </span>
        {condition && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${conditionColors[condition]}`}
          >
            {condition}
          </span>
        )}
      </div>
    );
  };

  // Patient Card Component
  const PatientCard = ({ patient }) => {
    const isCritical = patient.condition === "Critical";
    const daysSinceAdmission = Math.floor(
      (Date.now() - patient.admissionDate) / (1000 * 60 * 60 * 24)
    );

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4 }}
        className={`group relative bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-900/50 rounded-2xl border ${
          isCritical ? "border-red-500/50" : "border-gray-700/50"
        } hover:border-blue-500/50 backdrop-blur-xl overflow-hidden transition-all duration-300 cursor-pointer`}
        onClick={() => {
          setSelectedPatient(patient);
          setShowDetailsModal(true);
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Critical pulse effect */}
        {isCritical && (
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        )}

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  isCritical
                    ? "bg-red-500/20 border border-red-500/30"
                    : "bg-blue-500/20 border border-blue-500/30"
                } backdrop-blur-sm`}
              >
                <User
                  weight="duotone"
                  className={`text-2xl ${isCritical ? "text-red-400" : "text-blue-400"}`}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{patient.name}</h3>
                <p className="text-sm text-gray-400">
                  {patient.age}y, {patient.gender} • {patient.id}
                </p>
              </div>
            </div>
            <StatusBadge
              status={patient.status}
              condition={patient.condition}
            />
          </div>

          {/* Diagnosis */}
          <div className="mb-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
            <p className="text-xs text-gray-400 mb-1">Diagnosis</p>
            <p className="text-sm font-semibold text-white">
              {patient.diagnosis}
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-gray-700/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Package
                  weight="duotone"
                  className="text-purple-400 text-sm"
                />
                <p className="text-xs text-gray-400">Department</p>
              </div>
              <p className="text-sm font-semibold text-white">
                {patient.department}
              </p>
            </div>
            <div className="p-3 bg-gray-700/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Bed weight="duotone" className="text-blue-400 text-sm" />
                <p className="text-xs text-gray-400">Bed</p>
              </div>
              <p className="text-sm font-semibold text-white">
                {patient.bedNumber || "N/A"}
              </p>
            </div>
          </div>

          {/* Vitals */}
          {patient.vitals && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-2 text-xs">
                <Heart weight="fill" className="text-red-400" />
                <span className="text-gray-400">HR:</span>
                <span className="text-white font-medium">
                  {patient.vitals.heartRate} bpm
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Activity weight="bold" className="text-green-400" />
                <span className="text-gray-400">BP:</span>
                <span className="text-white font-medium">
                  {patient.vitals.bloodPressure}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Heartbeat weight="bold" className="text-blue-400" />
                <span className="text-gray-400">O₂:</span>
                <span className="text-white font-medium">
                  {patient.vitals.oxygenSaturation}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Activity weight="bold" className="text-amber-400" />
                <span className="text-gray-400">Temp:</span>
                <span className="text-white font-medium">
                  {patient.vitals.temperature}°F
                </span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock weight="bold" />
              <span>
                {daysSinceAdmission === 0
                  ? "Today"
                  : `${daysSinceAdmission} day${daysSinceAdmission > 1 ? "s" : ""} ago`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <User weight="duotone" />
              <span>{patient.doctor}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Patient Details Modal
  const PatientDetailsModal = () => (
    <AnimatePresence>
      {showDetailsModal && selectedPatient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl border border-gray-700/50 max-w-4xl w-full my-8 shadow-2xl"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                    <User weight="duotone" className="text-3xl text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedPatient.name}
                    </h2>
                    <p className="text-sm text-gray-400">
                      Patient ID: {selectedPatient.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <X className="text-xl text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                    Age & Gender
                  </p>
                  <p className="text-lg font-bold text-white">
                    {selectedPatient.age} years, {selectedPatient.gender}
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                    Department
                  </p>
                  <p className="text-lg font-bold text-white">
                    {selectedPatient.department}
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                    Bed Number
                  </p>
                  <p className="text-lg font-bold text-white">
                    {selectedPatient.bedNumber || "N/A"}
                  </p>
                </div>
              </div>

              {/* Diagnosis & Status */}
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                    Diagnosis & Status
                  </h3>
                  <StatusBadge
                    status={selectedPatient.status}
                    condition={selectedPatient.condition}
                  />
                </div>
                <p className="text-lg text-white font-semibold">
                  {selectedPatient.diagnosis}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Attending: {selectedPatient.doctor}
                </p>
              </div>

              {/* Vital Signs */}
              {selectedPatient.vitals && (
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                    Vital Signs
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <Heart weight="fill" className="text-red-400 mb-2" />
                      <p className="text-xs text-gray-400">Heart Rate</p>
                      <p className="text-lg font-bold text-white">
                        {selectedPatient.vitals.heartRate}
                      </p>
                      <p className="text-xs text-gray-500">bpm</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Activity weight="bold" className="text-green-400 mb-2" />
                      <p className="text-xs text-gray-400">Blood Pressure</p>
                      <p className="text-lg font-bold text-white">
                        {selectedPatient.vitals.bloodPressure}
                      </p>
                      <p className="text-xs text-gray-500">mmHg</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Heartbeat weight="bold" className="text-blue-400 mb-2" />
                      <p className="text-xs text-gray-400">O₂ Saturation</p>
                      <p className="text-lg font-bold text-white">
                        {selectedPatient.vitals.oxygenSaturation}
                      </p>
                      <p className="text-xs text-gray-500">%</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <Activity weight="bold" className="text-amber-400 mb-2" />
                      <p className="text-xs text-gray-400">Temperature</p>
                      <p className="text-lg font-bold text-white">
                        {selectedPatient.vitals.temperature}
                      </p>
                      <p className="text-xs text-gray-500">°F</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <Activity
                        weight="bold"
                        className="text-purple-400 mb-2"
                      />
                      <p className="text-xs text-gray-400">Resp. Rate</p>
                      <p className="text-lg font-bold text-white">
                        {selectedPatient.vitals.respiratoryRate}
                      </p>
                      <p className="text-xs text-gray-500">/min</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Medications */}
              {selectedPatient.medications && (
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Pill weight="duotone" className="text-purple-400" />
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                      Current Medications
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {selectedPatient.medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-300"
                      >
                        {med}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergies */}
              {selectedPatient.allergies && (
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Warning weight="fill" className="text-red-400" />
                    <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide">
                      Allergies
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.allergies.length > 0 ? (
                      selectedPatient.allergies.map((allergy, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-medium"
                        >
                          {allergy}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">
                        No known allergies
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {selectedPatient.emergencyContact && (
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone weight="duotone" className="text-blue-400" />
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                      Emergency Contact
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Name</p>
                      <p className="text-white font-semibold">
                        {selectedPatient.emergencyContact.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Relationship</p>
                      <p className="text-white font-semibold">
                        {selectedPatient.emergencyContact.relationship}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-blue-400 font-semibold">
                        {selectedPatient.emergencyContact.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Insurance */}
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <FileText weight="duotone" className="text-green-400" />
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    Insurance Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Provider</p>
                    <p className="text-white font-semibold">
                      {selectedPatient.insuranceProvider}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Policy Number</p>
                    <p className="text-white font-semibold">
                      {selectedPatient.insuranceNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-700/50 bg-gray-800/30">
              <div className="flex gap-3">
                {selectedPatient.status === "admitted" && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowDischargeModal(true);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all shadow-lg"
                  >
                    Discharge Patient
                  </button>
                )}
                <button
                  onClick={() => {
                    alert("Download medical records feature coming soon!");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl font-medium transition-colors border border-gray-600/30 flex items-center justify-center gap-2"
                >
                  <Download weight="bold" />
                  Download Records
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Analytics View
  const AnalyticsView = () => {
    if (!analytics) return null;

    return (
      <div className="space-y-6">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <Users weight="duotone" className="text-3xl text-blue-400" />
              <ChartBar weight="duotone" className="text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {analytics.overview.totalPatients}
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Total Patients
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <TrendUp weight="duotone" className="text-3xl text-green-400" />
              <Activity weight="duotone" className="text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {analytics.overview.admittedToday}
            </p>
            <p className="text-xs text-green-400 uppercase tracking-wide">
              Admitted Today
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <TrendDown
                weight="duotone"
                className="text-3xl text-purple-400"
              />
              <Activity weight="duotone" className="text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {analytics.overview.dischargedToday}
            </p>
            <p className="text-xs text-purple-400 uppercase tracking-wide">
              Discharged Today
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <Warning weight="fill" className="text-3xl text-red-400" />
              <Bell weight="duotone" className="text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {analytics.overview.criticalCondition}
            </p>
            <p className="text-xs text-red-400 uppercase tracking-wide">
              Critical Cases
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <Clock weight="duotone" className="text-3xl text-amber-400" />
              <Calendar weight="duotone" className="text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {analytics.overview.averageStayDuration}
            </p>
            <p className="text-xs text-amber-400 uppercase tracking-wide">
              Avg Stay (days)
            </p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admission Trend */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4">
              Admission & Discharge Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.admissionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="admissions"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Admissions"
                />
                <Line
                  type="monotone"
                  dataKey="discharges"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Discharges"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Department Breakdown */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4">
              Department Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.departmentBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="department"
                  stroke="#9ca3af"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Condition Breakdown */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4">
              Patient Condition Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.conditionBreakdown}
                  dataKey="count"
                  nameKey="condition"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {analytics.conditionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Response Metrics */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4">
              Response Time Metrics
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Avg Admission Time</p>
                  <Clock weight="bold" className="text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {analytics.responseMetrics.averageAdmissionTime} min
                </p>
              </div>
              <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Avg Discharge Time</p>
                  <Clock weight="bold" className="text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {analytics.responseMetrics.averageDischargeTime} min
                </p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Emergency Response</p>
                  <Bell weight="fill" className="text-red-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {analytics.responseMetrics.emergencyResponseTime} min
                </p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Bed Turnover Rate</p>
                  <TrendUp weight="bold" className="text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {analytics.responseMetrics.bedTurnoverRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Users className="text-5xl text-blue-400" weight="duotone" />
          </motion.div>
          <p className="text-gray-400">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Patient Records & Analytics
            </h1>
            <p className="text-gray-400">
              Comprehensive patient management and insights
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 p-1 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <button
                onClick={() => setViewMode("patients")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  viewMode === "patients"
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Patients
              </button>
              <button
                onClick={() => setViewMode("analytics")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  viewMode === "analytics"
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </motion.div>

        {/* Patients View */}
        {viewMode === "patients" && (
          <>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlass
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  weight="bold"
                />
                <input
                  type="text"
                  placeholder="Search patients by name, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 backdrop-blur-xl"
                />
              </div>
              <div className="flex gap-2 p-1 bg-gray-800/50 rounded-xl border border-gray-700/50">
                {[
                  { key: "all", label: "All" },
                  { key: "admitted", label: "Admitted" },
                  { key: "critical", label: "Critical" },
                  { key: "discharged", label: "Discharged" },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterStatus(filter.key)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filterStatus === filter.key
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Patient Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredPatients.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredPatients.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Users
                  className="text-6xl text-gray-600 mx-auto mb-4"
                  weight="duotone"
                />
                <p className="text-gray-400">No patients found</p>
              </motion.div>
            )}
          </>
        )}

        {/* Analytics View */}
        {viewMode === "analytics" && <AnalyticsView />}
      </div>

      {/* Modals */}
      <PatientDetailsModal />
    </div>
  );
};

export default PatientRecords;
