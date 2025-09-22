import {
  Activity,
  Clock,
  Phone,
  Truck,
  Warning,
  CircleDashed,
  FirstAid,
  User,
  Bell,
} from "phosphor-react";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

import { AmbulanceCard } from "../../../components/emergency/EmergencyCards";
import PatientCarouselErrorBoundary from "../../../components/emergency/PatientCarouselErrorBoundary";
import { PatientNavigationCarousel } from "../../../components/emergency/PatientNavigationCarousel";
import { useAuth } from "../../../hooks/useAuth";
import EmergencyService from "../../../services/EmergencyService";

const DashboardHome = () => {
  const { user, hospital } = useAuth();
  const [emergencies, setEmergencies] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [incomingPatients, setIncomingPatients] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [lastNotificationTime, setLastNotificationTime] = useState(Date.now());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load data using EmergencyService
  useEffect(() => {
    const loadDashboardData = async () => {
      // Only load data if user is authenticated and hospital info is available
      if (!user || !hospital?.id) {
        console.log("Waiting for user authentication and hospital data...");
        return;
      }

      setIsLoading(true);
      try {
        console.log("Loading dashboard data for hospital:", hospital.id);
        // Load all dashboard data
        const [
          emergenciesData,
          ambulancesData,
          metricsData,
          incomingData,
          alertsData,
        ] = await Promise.all([
          EmergencyService.getActiveEmergencies(),
          EmergencyService.getAmbulanceFleet(hospital.id),
          EmergencyService.getHospitalMetrics(),
          EmergencyService.getIncomingPatients(hospital.id),
          EmergencyService.getCriticalAlerts(hospital.id),
        ]);

        console.log("Loaded data:", {
          emergenciesData,
          ambulancesData,
          metricsData,
          incomingData,
          alertsData,
        });
        setEmergencies(emergenciesData);
        setAmbulances(ambulancesData);
        setMetrics(metricsData);
        setIncomingPatients(incomingData);

        // Process new alerts and show notifications
        const newAlerts = alertsData.filter(
          (alert) => alert.timestamp.getTime() > lastNotificationTime
        );

        newAlerts.forEach((alert) => {
          if (alert.priority === "critical") {
            toast.error(alert.message, {
              duration: 8000,
              icon: "🚨",
              style: {
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
              },
            });
          } else if (alert.priority === "high") {
            toast(alert.message, {
              duration: 6000,
              icon: "⚠️",
              style: {
                background: "#fffbeb",
                border: "1px solid #fed7aa",
                color: "#92400e",
              },
            });
          }
        });

        setCriticalAlerts(alertsData);
        setLastNotificationTime(Date.now());
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Fallback to service mock data if API fails
        const mockEmergencies = EmergencyService.getMockEmergencies();
        const mockAmbulances = EmergencyService.getMockAmbulances();
        const mockMetrics = EmergencyService.getMockMetrics();
        const mockIncoming = EmergencyService.getMockIncomingPatients();
        const mockAlerts = EmergencyService.getMockCriticalAlerts();

        console.log("Using mock data:", {
          mockEmergencies,
          mockAmbulances,
          mockMetrics,
          mockIncoming,
          mockAlerts,
        });
        setEmergencies(mockEmergencies);
        setAmbulances(mockAmbulances);
        setMetrics(mockMetrics);
        setIncomingPatients(mockIncoming);
        setCriticalAlerts(mockAlerts);

        // Show initial mock notifications
        toast.error(
          "🚨 Critical Patient Incoming: Chest pain patient arriving in 3 minutes!",
          {
            duration: 8000,
            style: {
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
            },
          }
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();

    // Simulate new patient arrivals every 2-3 minutes with notifications
    const simulatePatientArrivals = () => {
      const newPatients = [
        {
          id: "sim-" + Date.now(),
          patientName: "Maria Rodriguez",
          age: 34,
          condition: "Severe Asthma Attack",
          emergencyType: "High",
          eta: 4,
          vitals: { hr: 125, bp: "110/70", spo2: 89 },
          paramedic: { name: "Dr. Williams", phone: "+1-555-0789" },
        },
        {
          id: "sim-" + (Date.now() + 1),
          patientName: "James Mitchell",
          age: 67,
          condition: "Stroke Symptoms",
          emergencyType: "Critical",
          eta: 6,
          vitals: { hr: 95, bp: "180/120", spo2: 96 },
          paramedic: { name: "Dr. Chen", phone: "+1-555-0890" },
        },
        {
          id: "sim-" + (Date.now() + 2),
          patientName: "Lisa Thompson",
          age: 29,
          condition: "Car Accident Injuries",
          emergencyType: "High",
          eta: 8,
          vitals: { hr: 110, bp: "85/55", spo2: 94 },
          paramedic: { name: "Dr. Johnson", phone: "+1-555-0567" },
        },
      ];

      const randomPatient =
        newPatients[Math.floor(Math.random() * newPatients.length)];

      // Add to incoming patients
      setIncomingPatients((prev) => {
        const exists = prev.find(
          (p) => p.patientName === randomPatient.patientName
        );
        if (!exists) {
          return [...prev, randomPatient];
        }
        return prev;
      });

      // Show notification based on priority
      if (randomPatient.emergencyType === "Critical") {
        toast.error(
          `🚨 CRITICAL: ${randomPatient.patientName} incoming with ${randomPatient.condition}!`,
          {
            duration: 10000,
            style: {
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontWeight: "bold",
            },
          }
        );
      } else if (randomPatient.emergencyType === "High") {
        toast.success(
          `🚑 HIGH PRIORITY: ${randomPatient.patientName} arriving in ${randomPatient.eta} minutes`,
          {
            duration: 7000,
            icon: "🚑",
            style: {
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#ea580c",
            },
          }
        );
      }

      // Also simulate ambulance dispatch notification
      const ambulanceNumbers = ["AMB-001", "AMB-002", "AMB-003", "AMB-004"];
      const randomAmbulance =
        ambulanceNumbers[Math.floor(Math.random() * ambulanceNumbers.length)];

      setTimeout(() => {
        toast(
          `🚑 ${randomAmbulance} dispatched to ${randomPatient.patientName}`,
          {
            duration: 5000,
            icon: "🚑",
            style: {
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              color: "#0369a1",
            },
          }
        );
      }, 2000);
    };

    // Start simulation after initial load
    const simulationTimeout = setTimeout(simulatePatientArrivals, 10000); // First arrival after 10 seconds
    const simulationInterval = setInterval(simulatePatientArrivals, 120000); // Then every 2 minutes

    // Set up polling for real-time updates every 30 seconds (reduced from 15)
    const interval = setInterval(() => {
      // Only poll if user is still authenticated
      if (user && hospital?.id) {
        loadDashboardData();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(simulationTimeout);
      clearInterval(simulationInterval);
    };
  }, [user, hospital?.id, lastNotificationTime]);

  // Handle accepting incoming patient
  const handleAcceptPatient = async (patient) => {
    try {
      const bedAssignment = prompt(
        `Assign bed for ${patient.patientName} (${patient.condition}):`
      );
      if (!bedAssignment) return;

      await EmergencyService.acceptIncomingPatient(patient.id, bedAssignment);

      // Remove from incoming patients
      setIncomingPatients((prev) => prev.filter((p) => p.id !== patient.id));

      toast.success(
        `✅ Patient ${patient.patientName} accepted and assigned to ${bedAssignment}`,
        {
          duration: 5000,
          style: {
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
          },
        }
      );
    } catch (error) {
      console.error("Failed to accept patient:", error);
      toast.error("Failed to accept patient. Please try again.");
    }
  };

  // Handle preparing for incoming patient
  const handlePrepareForPatient = (patient) => {
    toast(`🏥 Preparing for ${patient.patientName} - ${patient.condition}`, {
      duration: 4000,
      icon: "🏃‍♂️",
      style: {
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        color: "#1e40af",
      },
    });
  };

  // Handle calling paramedic
  const handleCallParamedic = (patient) => {
    toast(`📞 Calling ${patient.paramedic.name} - ${patient.paramedic.phone}`, {
      duration: 3000,
      icon: "📞",
    });
  };

  const handleAssignAmbulance = (ambulance) => {
    console.log("Assigning ambulance:", ambulance.id);
    // Open assignment interface - could show pending emergencies
  };

  const handleTrackAmbulance = (ambulance) => {
    console.log("Tracking ambulance:", ambulance.id);
    // Open tracking interface or map view
  };

  console.log("Dashboard state:", {
    emergencies,
    ambulances,
    metrics,
    incomingPatients,
    criticalAlerts,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Critical Alerts Sticky Header - Most Important */}
      {criticalAlerts.length > 0 && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
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
                      ✕
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

      {/* Main Content - Full Width */}
      <div className="full-width-container responsive-padding py-6">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Emergency Command Center
              </h1>
              <p className="text-slate-600 text-lg">
                {hospital?.name || user?.name} • Real-time Patient Management
                System
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 text-slate-500 bg-white rounded-xl px-4 py-2 shadow-sm border border-slate-200">
                <Clock size={20} />
                <span className="font-medium text-slate-700">
                  {currentTime.toLocaleTimeString()}
                </span>
                {isLoading && (
                  <CircleDashed
                    size={20}
                    className="animate-spin text-blue-500"
                  />
                )}
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Phone size={18} />
                  Emergency Line
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Activity size={18} />
                  System Status
                </button>
                <button
                  onClick={() => {
                    // Trigger a test patient arrival
                    const testPatient = {
                      id: "test-" + Date.now(),
                      patientName: "Test Emergency Patient",
                      age: 45,
                      condition: "Cardiac Emergency",
                      emergencyType: "Critical",
                      eta: 3,
                      vitals: { hr: 140, bp: "160/90", spo2: 88 },
                      paramedic: {
                        name: "Dr. Emergency",
                        phone: "+1-555-0000",
                      },
                    };

                    setIncomingPatients((prev) => [...prev, testPatient]);

                    toast.error(
                      `🚨 TEST EMERGENCY: ${testPatient.patientName} incoming with ${testPatient.condition}!`,
                      {
                        duration: 8000,
                        style: {
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          color: "#991b1b",
                          fontWeight: "bold",
                        },
                      }
                    );
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Bell size={18} />
                  Test Alert
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards - Full Width Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500 rounded-xl text-white shadow-lg">
                  <FirstAid size={24} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-red-700">
                    {incomingPatients.length}
                  </p>
                  <p className="text-red-600 text-sm font-medium">
                    Incoming Patients
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 text-sm font-medium">
                  Live Updates Active
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-xl text-white shadow-lg">
                  <User size={24} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-700">
                    {metrics.hospitalCapacity?.emergency.available || 0}
                  </p>
                  <p className="text-green-600 text-sm font-medium">
                    Available Beds
                  </p>
                </div>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width: `${((metrics.hospitalCapacity?.emergency.available || 0) / (metrics.hospitalCapacity?.emergency.total || 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-xl text-white shadow-lg">
                  <Truck size={24} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-700">
                    {ambulances.filter((a) => a.status === "available").length}
                  </p>
                  <p className="text-blue-600 text-sm font-medium">
                    Available Units
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-600 text-sm font-medium">
                  {ambulances.length} Total Fleet
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500 rounded-xl text-white shadow-lg">
                  <Bell size={24} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-orange-700">
                    {criticalAlerts.length}
                  </p>
                  <p className="text-orange-600 text-sm font-medium">
                    Active Alerts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${criticalAlerts.length > 0 ? "bg-orange-500 animate-pulse" : "bg-slate-300"}`}
                ></div>
                <span className="text-orange-600 text-sm font-medium">
                  System Monitor
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - No Nested Cards */}
        <div className="space-y-8">
          {/* Incoming Patients Section - Full Width with Navigation */}
          <PatientCarouselErrorBoundary>
            <PatientNavigationCarousel
              patients={incomingPatients}
              onAccept={handleAcceptPatient}
              onPrepare={handlePrepareForPatient}
              onCallParamedic={handleCallParamedic}
              autoAdvanceInterval={null} // Set to 10000 for 10-second auto-advance if desired
            />
          </PatientCarouselErrorBoundary>

          {/* Bottom Section - Hospital Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ambulance Fleet */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck size={24} className="text-blue-600" />
                </div>
                Ambulance Fleet
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ambulances.map((ambulance) => (
                  <AmbulanceCard
                    key={ambulance.id}
                    ambulance={ambulance}
                    onAssign={handleAssignAmbulance}
                    onTrack={handleTrackAmbulance}
                  />
                ))}
              </div>
            </div>

            {/* Hospital Capacity */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity size={24} className="text-green-600" />
                </div>
                Hospital Capacity
              </h2>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-700">
                        Emergency Beds
                      </span>
                      <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                        {metrics.hospitalCapacity?.emergency.available || 0}/
                        {metrics.hospitalCapacity?.emergency.total || 0}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          width: `${((metrics.hospitalCapacity?.emergency.available || 0) / (metrics.hospitalCapacity?.emergency.total || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-700">
                        ICU Beds
                      </span>
                      <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                        {metrics.hospitalCapacity?.icu.available || 0}/
                        {metrics.hospitalCapacity?.icu.total || 0}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-4 rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          width: `${((metrics.hospitalCapacity?.icu.available || 0) / (metrics.hospitalCapacity?.icu.total || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-700">
                        General Beds
                      </span>
                      <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                        {metrics.hospitalCapacity?.general.available || 0}/
                        {metrics.hospitalCapacity?.general.total || 0}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          width: `${((metrics.hospitalCapacity?.general.available || 0) / (metrics.hospitalCapacity?.general.total || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
