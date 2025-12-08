import {
  Activity,
  Bed,
  Users,
  TrendUp,
  TrendDown,
  Heartbeat,
  Clock,
  CheckCircle,
  Warning,
  Truck,
  ChartBar,
  CircleDashed,
  FirstAid,
  User,
  Bell,
  X,
  Phone,
} from "phosphor-react";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

import { AmbulanceCard } from "../../../components/emergency/EmergencyCards";
import PatientCarouselErrorBoundary from "../../../components/emergency/PatientCarouselErrorBoundary";
import { PatientNavigationCarousel } from "../../../components/emergency/PatientNavigationCarousel";
import { HospitalTrackingMap } from "../../../components/tracking/HospitalTrackingMap";
import { useAuth } from "../../../hooks/useAuth";
import hospitalService from "../../../services/hospitalService";
import patientService from "../../../services/patientService";
import socketService from "../../../services/socketService";

const DashboardHome = () => {
  const { user, hospital, token } = useAuth();
  // User's Priority 1 state
  const [hospitalData, setHospitalData] = useState(null);
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Umer's tracking state
  const [emergencies, setEmergencies] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [incomingPatients, setIncomingPatients] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [lastNotificationTime, setLastNotificationTime] = useState(Date.now());
  
  // Tracking modal state
  const [trackingModal, setTrackingModal] = useState({
    isOpen: false,
    patient: null,
    ambulance: null,
    hospital: null,
  });

  const hospitalId =
    hospital?.id || hospital?._id || user?.hospitalInfo?.hospitalId;

  // Load hospital data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!hospitalId) {
        setError("Hospital ID not found. Please logout and login again.");
        setLoading(false);
        return;
      }

      // Validate hospitalId format
      if (
        hospitalId === "undefined" ||
        hospitalId === "null" ||
        typeof hospitalId !== "string" ||
        hospitalId.length < 10
      ) {
        setError("Invalid hospital ID format. Please logout and login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Loading dashboard data for hospital:", hospitalId);

        // Fetch hospital details and stats in parallel
        const [hospitalResponse, statsResponse, patientsResponse] =
          await Promise.all([
            hospitalService.getHospitalDetails(hospitalId),
            hospitalService.getHospitalStats(hospitalId).catch(() => null),
            patientService
              .getHospitalPatients(hospitalId)
              .catch(() => ({ data: { patients: [] } })),
          ]);

        console.log("Hospital data loaded:", hospitalResponse);

        if (hospitalResponse.success) {
          setHospitalData(
            hospitalResponse.data.hospital || hospitalResponse.data
          );
        }

        if (statsResponse?.success) {
          setStats(statsResponse.data);
        }

        if (patientsResponse?.success) {
          setPatients(patientsResponse.data.patients || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [hospitalId]);

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    if (!hospitalId || !token) return;

    // Connect to Socket.IO
    socketService.connect(hospitalId, token);
    socketService.joinHospitalRoom(hospitalId);

    // Listen for bed updates
    socketService.onBedUpdate((data) => {
      console.log("🛏️ Bed updated:", data);
      setHospitalData((prev) => ({
        ...prev,
        availableBeds: data.availableBeds,
        lastBedUpdate: data.lastBedUpdate,
      }));

      // Show toast notification
      if (data.action === 'occupied') {
        toast.success(`${data.bedType.toUpperCase()} bed automatically reserved for incoming emergency`, {
          duration: 4000,
          icon: '🛏️',
        });
      }
    });

    // Listen for incoming emergencies
    socketService.onEmergencyIncoming((data) => {
      console.log("🚨 Incoming emergency:", data);
      
      // Add to emergency queue
      setIncomingPatients((prev) => [{
        id: data.emergency.id,
        patientName: data.emergency.patient.name || 'Emergency Patient',
        severity: data.emergency.severity,
        symptoms: data.emergency.symptoms,
        eta: data.emergency.estimatedArrival,
        driverName: data.driver.name,
        ambulanceNumber: data.driver.ambulanceNumber,
        reservedBedType: data.reservedBedType,
        timestamp: data.timestamp,
      }, ...prev]);

      // Add to critical alerts if high severity
      if (data.emergency.severity === 'critical' || data.emergency.severity === 'high') {
        setCriticalAlerts((prev) => [{
          id: data.emergency.id,
          type: 'incoming_emergency',
          severity: data.emergency.severity,
          message: `Critical patient incoming - ETA: ${data.emergency.estimatedArrival}`,
          patientName: data.emergency.patient.name,
          timestamp: data.timestamp,
        }, ...prev.slice(0, 4)]); // Keep only last 5 alerts
      }

      // Show toast notification
      toast((t) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-red-600" weight="fill" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {data.emergency.severity === 'critical' ? '🚨 Critical Emergency' : '⚠️ Emergency Incoming'}
            </p>
            <p className="text-sm text-gray-600">
              {data.emergency.patient.name} - ETA: {data.emergency.estimatedArrival}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X weight="bold" />
          </button>
        </div>
      ), {
        duration: 6000,
        style: {
          padding: '12px',
        },
      });
    });

    // Listen for emergency updates
    socketService.onEmergencyUpdate((data) => {
      console.log("📋 Emergency updated:", data);
      
      // Update emergency in the list
      setIncomingPatients((prev) => 
        prev.map((p) => p.id === data.emergencyId ? { ...p, ...data.updates } : p)
      );
    });

    // Listen for emergency completed
    socketService.onEmergencyCompleted((data) => {
      console.log("✅ Emergency completed:", data);
      
      // Remove from incoming patients
      setIncomingPatients((prev) => prev.filter((p) => p.id !== data.emergencyId));
      
      // Add to patients list if admitted
      if (data.patient) {
        setPatients((prev) => [data.patient, ...prev]);
        
        toast.success(`Patient ${data.patient.name} admitted successfully`, {
          icon: '✅',
        });
      }

      // Update stats
      setStats((prev) => prev ? {
        ...prev,
        totalServed: (prev.totalServed || 0) + 1,
      } : null);
    });

    // Listen for patient admitted
    socketService.onPatientAdmitted((data) => {
      console.log("👤 Patient admitted:", data);
      setPatients((prev) => [data.patient, ...prev]);
      
      toast.success(`Patient ${data.patient.name} admitted`, {
        icon: '👤',
      });
    });

    // Listen for patient discharged
    socketService.onPatientDischarged((data) => {
      console.log("🚪 Patient discharged:", data);
      setPatients((prev) => prev.filter((p) => p._id !== data.patientId));
      
      toast.info(`Patient discharged`, {
        icon: '🚪',
      });
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [hospitalId, token]);

  // Periodic stats refresh
  useEffect(() => {
    if (!hospitalId) return;

    const refreshStats = async () => {
      try {
        const statsResponse = await hospitalService.getHospitalStats(hospitalId);
        if (statsResponse?.success) {
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Failed to refresh stats:', error);
      }
    };

    // Refresh stats every 30 seconds
    const statsInterval = setInterval(refreshStats, 30000);

    return () => clearInterval(statsInterval);
  }, [hospitalId]);

  // Refresh recent activity
  useEffect(() => {
    if (!hospitalId) return;

    const refreshPatients = async () => {
      try {
        const patientsResponse = await patientService.getHospitalPatients(hospitalId);
        if (patientsResponse?.success) {
          setPatients(patientsResponse.data.patients || []);
        }
      } catch (error) {
        console.error('Failed to refresh patients:', error);
      }
    };

    // Refresh patients every minute
    const patientsInterval = setInterval(refreshPatients, 60000);

    return () => clearInterval(patientsInterval);
  }, [hospitalId]);

  const getBedUtilization = (bedType) => {
    if (!hospitalData) return 0;
    const total = hospitalData.totalBeds?.[bedType] || 0;
    const available = hospitalData.availableBeds?.[bedType] || 0;
    if (total === 0) return 0;
    return Math.round(((total - available) / total) * 100);
  };

  const getTotalBedUtilization = () => {
    if (!hospitalData) return 0;
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

    if (totalBeds === 0) return 0;
    return Math.round(((totalBeds - availableBeds) / totalBeds) * 100);
  };

  const getStatusColor = (utilization) => {
    if (utilization >= 90) return "text-red-600 bg-red-50";
    if (utilization >= 70) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  const getProgressColor = (utilization) => {
    if (utilization >= 90) return "bg-red-500";
    if (utilization >= 70) return "bg-orange-500";
    return "bg-green-500";
  };

  // Umer's tracking functions
  const handleTrackAmbulance = (ambulance) => {
    console.log("Tracking ambulance:", ambulance.id);
    
    // Find patient assigned to this ambulance
    const assignedPatient = incomingPatients.find(
      p => p.ambulanceId === ambulance.id || 
           p.id === ambulance.assignedEmergencyId ||
           p.id === ambulance.assignedEmergency
    );
    
    if (assignedPatient) {
      setTrackingModal({
        isOpen: true,
        patient: assignedPatient,
        ambulance: ambulance,
        hospital: hospital,
      });
    } else {
      toast.error("No patient assigned to this ambulance");
    }
  };

  const handleViewTracking = (patient, ambulance, hospitalData) => {
    setTrackingModal({
      isOpen: true,
      patient: patient,
      ambulance: ambulance,
      hospital: hospitalData || hospital,
    });
  };

  const closeTrackingModal = () => {
    setTrackingModal({
      isOpen: false,
      patient: null,
      ambulance: null,
      hospital: null,
    });
  };

  const handleAcceptPatient = (patient) => {
    console.log("Accepting patient:", patient);
    toast.success(`Patient ${patient.patientName} accepted`);
  };

  const handlePrepareForPatient = (patient) => {
    console.log("Preparing for patient:", patient);
    toast.success(`Preparing resources for ${patient.patientName}`);
  };

  const handleCallParamedic = (patient) => {
    console.log("Calling paramedic for:", patient);
    toast.success(`Calling paramedic: ${patient.paramedic?.phone || 'Unknown'}`);
  };

  const handleAssignAmbulance = (ambulance) => {
    console.log("Assigning ambulance:", ambulance);
    toast.success(`Ambulance ${ambulance.vehicleNumber} assigned`);
  };

  console.log("Dashboard state:", {
    emergencies,
    ambulances,
    metrics,
    incomingPatients,
    criticalAlerts,
  });

  // User's loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-300 text-lg font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // User's error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl border border-red-500/30 shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/30">
                <Warning weight="duotone" className="text-red-400 text-5xl" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Error Loading Dashboard
              </h2>
              <p className="text-gray-400">{error}</p>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("hospital_token");
                  window.location.href = "/";
                }}
                className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all border border-gray-600/50"
              >
                Logout
              </button>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
              <p className="text-sm text-blue-300 font-semibold mb-2">
                💡 Troubleshooting:
              </p>
              <ul className="text-xs text-blue-200/80 space-y-1.5">
                <li>• Make sure backend server is running on port 5001</li>
                <li>
                  • Check if you're logged in with a valid hospital account
                </li>
                <li>• Verify your hospital profile is approved</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Process patients for user's dashboard
  const admittedPatients = patients.filter(
    (p) => p.status === "admitted" || p.admissionStatus === "admitted"
  );
  const criticalPatients = admittedPatients.filter(
    (p) => p.severity === "critical" || p.condition === "critical"
  );

  // Combined return with both tracking features and user's Priority 1 bed management
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-6">
      {/* Umer's Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg rounded-2xl">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Warning size={20} className="text-white" />
              </div>
              <h2 className="text-lg font-semibold">Critical System Alerts</h2>
              <div className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
                {criticalAlerts.length} Active
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-80 border border-white/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white text-sm">
                      {alert.title}
                    </h3>
                    <button
                      onClick={() =>
                        setCriticalAlerts((prev) =>
                          prev.filter((a) => a.id !== alert.id)
                        )
                      }
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-white/90 text-xs mb-3">{alert.message}</p>
                  {alert.actionRequired && (
                    <button className="px-3 py-1.5 bg-white text-red-600 text-xs rounded-lg font-medium hover:bg-white/90 transition-colors">
                      {alert.actionRequired}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Umer's Incoming Patients Carousel */}
      {incomingPatients.length > 0 && (
        <PatientCarouselErrorBoundary>
          <PatientNavigationCarousel
            patients={incomingPatients}
            ambulances={ambulances}
            hospital={hospital}
            onAccept={handleAcceptPatient}
            onPrepare={handlePrepareForPatient}
            onCallParamedic={handleCallParamedic}
            onViewTracking={handleViewTracking}
            autoAdvanceInterval={null}
          />
        </PatientCarouselErrorBoundary>
      )}
      
      {/* User's Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {hospitalData?.name || "Hospital Dashboard"}
          </h1>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <span className="text-blue-400 font-semibold">
              {hospitalData?.type || "General Hospital"}
            </span>
            <span className="text-gray-600">•</span>
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isLoading && <CircleDashed size={20} className="animate-spin text-blue-500" />}
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl backdrop-blur-xl border transition-all ${
              socketService.isConnected
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                socketService.isConnected
                  ? "bg-green-400 shadow-lg shadow-green-400/50 animate-pulse"
                  : "bg-red-400"
              }`}
            ></div>
            <span className="text-sm font-bold uppercase tracking-wider">
              {socketService.isConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* User's Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Beds */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Bed size={28} className="text-white" weight="duotone" />
              </div>
              <span className="text-sm font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/30">
                {getTotalBedUtilization()}% Used
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wide">
              Total Beds
            </h3>
            <p className="text-4xl font-bold text-white mb-2">
              {(hospitalData?.totalBeds?.general || 0) +
                (hospitalData?.totalBeds?.icu || 0) +
                (hospitalData?.totalBeds?.emergency || 0) +
                (hospitalData?.totalBeds?.operation || 0)}
            </p>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              <CheckCircle weight="fill" className="text-green-400" size={16} />
              {(hospitalData?.availableBeds?.general || 0) +
                (hospitalData?.availableBeds?.icu || 0) +
                (hospitalData?.availableBeds?.emergency || 0) +
                (hospitalData?.availableBeds?.operation || 0)}{" "}
              available
            </p>
          </div>
        </motion.div>

        {/* Admitted Patients */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Users size={28} className="text-white" weight="duotone" />
              </div>
              {criticalPatients.length > 0 && (
                <span className="text-sm font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/30 flex items-center gap-1">
                  <Warning weight="fill" size={14} />
                  {criticalPatients.length} Critical
                </span>
              )}
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wide">
              Admitted Patients
            </h3>
            <p className="text-4xl font-bold text-white mb-2">
              {admittedPatients.length}
            </p>
            <p className="text-gray-500 text-sm">Currently in hospital</p>
          </div>
        </motion.div>

        {/* Avg Response Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-green-500/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <Clock size={28} className="text-white" weight="duotone" />
              </div>
              <TrendDown size={24} className="text-green-400" weight="bold" />
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wide">
              Avg Response
            </h3>
            <p className="text-4xl font-bold text-white mb-2">
              {stats?.averageResponseTime ||
                hospitalData?.statistics?.averageResponseTime ||
                "8"}{" "}
              <span className="text-2xl text-gray-500">min</span>
            </p>
            <p className="text-gray-500 text-sm">Last 24 hours</p>
          </div>
        </motion.div>

        {/* Patients Served */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <CheckCircle
                  size={28}
                  className="text-white"
                  weight="duotone"
                />
              </div>
              <TrendUp size={24} className="text-orange-400" weight="bold" />
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wide">
              Total Served
            </h3>
            <p className="text-4xl font-bold text-white mb-2">
              {stats?.totalPatientsServed ||
                hospitalData?.statistics?.totalPatientsServed ||
                0}
            </p>
            <p className="text-gray-500 text-sm">All time</p>
          </div>
        </motion.div>
      </div>

      {/* Bed Capacity Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
        <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bed weight="duotone" className="text-indigo-400" />
                Bed Capacity Status
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Real-time bed availability across all departments
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/dashboard/beds")}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              Manage Beds
              <TrendUp weight="bold" size={16} />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* General Beds */}
            <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg">General Beds</h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {hospitalData?.availableBeds?.general || 0} of{" "}
                    {hospitalData?.totalBeds?.general || 0} available
                  </p>
                </div>
                <div
                  className={`text-3xl font-bold ${
                    getBedUtilization("general") >= 90
                      ? "text-red-400"
                      : getBedUtilization("general") >= 70
                        ? "text-orange-400"
                        : "text-green-400"
                  } bg-gray-800/50 px-3 py-2 rounded-xl border ${
                    getBedUtilization("general") >= 90
                      ? "border-red-500/30"
                      : getBedUtilization("general") >= 70
                        ? "border-orange-500/30"
                        : "border-green-500/30"
                  }`}
                >
                  {getBedUtilization("general")}%
                </div>
              </div>
              <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden border border-gray-700/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getBedUtilization("general")}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className={`h-full ${
                    getBedUtilization("general") >= 90
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : getBedUtilization("general") >= 70
                        ? "bg-gradient-to-r from-orange-500 to-orange-600"
                        : "bg-gradient-to-r from-green-500 to-green-600"
                  } shadow-lg ${
                    getBedUtilization("general") >= 90
                      ? "shadow-red-500/50"
                      : getBedUtilization("general") >= 70
                        ? "shadow-orange-500/50"
                        : "shadow-green-500/50"
                  }`}
                ></motion.div>
              </div>
            </div>

            {/* ICU Beds */}
            <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg">ICU Beds</h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {hospitalData?.availableBeds?.icu || 0} of{" "}
                    {hospitalData?.totalBeds?.icu || 0} available
                  </p>
                </div>
                <div
                  className={`text-3xl font-bold ${
                    getBedUtilization("icu") >= 90
                      ? "text-red-400"
                      : getBedUtilization("icu") >= 70
                        ? "text-orange-400"
                        : "text-green-400"
                  } bg-gray-800/50 px-3 py-2 rounded-xl border ${
                    getBedUtilization("icu") >= 90
                      ? "border-red-500/30"
                      : getBedUtilization("icu") >= 70
                        ? "border-orange-500/30"
                        : "border-green-500/30"
                  }`}
                >
                  {getBedUtilization("icu")}%
                </div>
              </div>
              <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden border border-gray-700/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getBedUtilization("icu")}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className={`h-full ${
                    getBedUtilization("icu") >= 90
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : getBedUtilization("icu") >= 70
                        ? "bg-gradient-to-r from-orange-500 to-orange-600"
                        : "bg-gradient-to-r from-green-500 to-green-600"
                  } shadow-lg ${
                    getBedUtilization("icu") >= 90
                      ? "shadow-red-500/50"
                      : getBedUtilization("icu") >= 70
                        ? "shadow-orange-500/50"
                        : "shadow-green-500/50"
                  }`}
                ></motion.div>
              </div>
            </div>

            {/* Emergency Beds */}
            <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-red-500/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg">
                    Emergency Beds
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {hospitalData?.availableBeds?.emergency || 0} of{" "}
                    {hospitalData?.totalBeds?.emergency || 0} available
                  </p>
                </div>
                <div
                  className={`text-3xl font-bold ${
                    getBedUtilization("emergency") >= 90
                      ? "text-red-400"
                      : getBedUtilization("emergency") >= 70
                        ? "text-orange-400"
                        : "text-green-400"
                  } bg-gray-800/50 px-3 py-2 rounded-xl border ${
                    getBedUtilization("emergency") >= 90
                      ? "border-red-500/30"
                      : getBedUtilization("emergency") >= 70
                        ? "border-orange-500/30"
                        : "border-green-500/30"
                  }`}
                >
                  {getBedUtilization("emergency")}%
                </div>
              </div>
              <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden border border-gray-700/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getBedUtilization("emergency")}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className={`h-full ${
                    getBedUtilization("emergency") >= 90
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : getBedUtilization("emergency") >= 70
                        ? "bg-gradient-to-r from-orange-500 to-orange-600"
                        : "bg-gradient-to-r from-green-500 to-green-600"
                  } shadow-lg ${
                    getBedUtilization("emergency") >= 90
                      ? "shadow-red-500/50"
                      : getBedUtilization("emergency") >= 70
                        ? "shadow-orange-500/50"
                        : "shadow-green-500/50"
                  }`}
                ></motion.div>
              </div>
            </div>

            {/* Operation Beds */}
            <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:border-pink-500/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg">
                    Operation Theater
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {hospitalData?.availableBeds?.operation || 0} of{" "}
                    {hospitalData?.totalBeds?.operation || 0} available
                  </p>
                </div>
                <div
                  className={`text-3xl font-bold ${
                    getBedUtilization("operation") >= 90
                      ? "text-red-400"
                      : getBedUtilization("operation") >= 70
                        ? "text-orange-400"
                        : "text-green-400"
                  } bg-gray-800/50 px-3 py-2 rounded-xl border ${
                    getBedUtilization("operation") >= 90
                      ? "border-red-500/30"
                      : getBedUtilization("operation") >= 70
                        ? "border-orange-500/30"
                        : "border-green-500/30"
                  }`}
                >
                  {getBedUtilization("operation")}%
                </div>
              </div>
              <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden border border-gray-700/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getBedUtilization("operation")}%` }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className={`h-full ${
                    getBedUtilization("operation") >= 90
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : getBedUtilization("operation") >= 70
                        ? "bg-gradient-to-r from-orange-500 to-orange-600"
                        : "bg-gradient-to-r from-green-500 to-green-600"
                  } shadow-lg ${
                    getBedUtilization("operation") >= 90
                      ? "shadow-red-500/50"
                      : getBedUtilization("operation") >= 70
                        ? "shadow-orange-500/50"
                        : "shadow-green-500/50"
                  }`}
                ></motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl h-full">
            <div className="flex items-center gap-2 mb-4">
              <Activity weight="duotone" className="text-cyan-400 text-2xl" />
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {hospitalData?.lastBedUpdate && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bed weight="duotone" className="text-blue-400" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      Bed status updated
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(hospitalData.lastBedUpdate).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              )}
              {admittedPatients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/50 rounded-2xl flex items-center justify-center border border-gray-700/30">
                    <Heartbeat
                      weight="duotone"
                      size={40}
                      className="text-gray-600"
                    />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No recent patient activity
                  </p>
                </div>
              ) : (
                admittedPatients.slice(0, 4).map((patient, index) => (
                  <motion.div
                    key={patient._id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all"
                  >
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users
                        weight="duotone"
                        className="text-purple-400"
                        size={20}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        Patient admitted
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {patient.bedType || "General"} •{" "}
                        {patient.admittedAt
                          ? new Date(patient.admittedAt).toLocaleString()
                          : "Just now"}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl h-full">
            <div className="flex items-center gap-2 mb-4">
              <ChartBar weight="duotone" className="text-purple-400 text-2xl" />
              <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (window.location.href = "/dashboard/beds")}
                className="group/btn relative overflow-hidden flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-2xl border border-blue-500/30 hover:border-blue-400/50 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover/btn:from-blue-500/10 group-hover/btn:to-cyan-500/10 transition-all"></div>
                <Bed
                  size={40}
                  className="text-blue-400 mb-3 group-hover/btn:scale-110 transition-transform relative z-10"
                  weight="duotone"
                />
                <span className="text-sm font-bold text-white relative z-10">
                  Manage Beds
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (window.location.href = "/dashboard/patients")}
                className="group/btn relative overflow-hidden flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover/btn:from-purple-500/10 group-hover/btn:to-pink-500/10 transition-all"></div>
                <Users
                  size={40}
                  className="text-purple-400 mb-3 group-hover/btn:scale-110 transition-transform relative z-10"
                  weight="duotone"
                />
                <span className="text-sm font-bold text-white relative z-10">
                  View Patients
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  (window.location.href = "/dashboard/emergencies")
                }
                className="group/btn relative overflow-hidden flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 rounded-2xl border border-red-500/30 hover:border-red-400/50 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-orange-500/0 group-hover/btn:from-red-500/10 group-hover/btn:to-orange-500/10 transition-all"></div>
                <Warning
                  size={40}
                  className="text-red-400 mb-3 group-hover/btn:scale-110 transition-transform relative z-10"
                  weight="duotone"
                />
                <span className="text-sm font-bold text-white relative z-10">
                  Emergencies
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (window.location.href = "/dashboard/ambulances")}
                className="group/btn relative overflow-hidden flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-2xl border border-green-500/30 hover:border-green-400/50 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover/btn:from-green-500/10 group-hover/btn:to-emerald-500/10 transition-all"></div>
                <Truck
                  size={40}
                  className="text-green-400 mb-3 group-hover/btn:scale-110 transition-transform relative z-10"
                  weight="duotone"
                />
                <span className="text-sm font-bold text-white relative z-10">
                  Fleet
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Umer's Tracking Modal */}
      {trackingModal.isOpen && trackingModal.patient && trackingModal.ambulance && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold mb-1">Live Ambulance Tracking</h2>
                <p className="text-blue-100 text-sm">
                  Patient: {trackingModal.patient.patientName || trackingModal.patient.name} • 
                  Ambulance: {trackingModal.ambulance.vehicleNumber || trackingModal.ambulance.id}
                </p>
              </div>
              <button
                onClick={closeTrackingModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close tracking modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Map Container */}
            <div className="flex-1 p-6 bg-slate-50 overflow-hidden">
              <HospitalTrackingMap
                ambulance={trackingModal.ambulance}
                patient={trackingModal.patient}
                hospital={trackingModal.hospital}
                status={
                  trackingModal.patient.status === 'pickedUp' || trackingModal.patient.pickupTime
                    ? 'transporting_to_hospital'
                    : 'en_route_to_patient'
                }
                className="h-full w-full"
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-slate-600">Condition:</span>
                  <span className="ml-2 font-semibold text-slate-900">
                    {trackingModal.patient.condition || trackingModal.patient.emergencyType}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-600">ETA:</span>
                  <span className="ml-2 font-semibold text-slate-900">
                    {trackingModal.patient.eta || trackingModal.patient.estimatedArrival || 'Calculating...'}
                  </span>
                </div>
              </div>
              <button
                onClick={closeTrackingModal}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#374151",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            fontSize: "14px",
            fontWeight: "500",
          },
        }}
      />
    </div>
  );
};

export default DashboardHome;
