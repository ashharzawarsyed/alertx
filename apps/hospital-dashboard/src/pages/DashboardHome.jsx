import {
  Activity,
  Clock,
  Phone,
  Truck,
  Warning,
  Heartbeat,
} from "phosphor-react";
import React, { useState, useEffect } from "react";

import {
  EmergencyCard,
  AmbulanceCard,
  AmbulanceEmptyState,
} from "../components/emergency/EmergencyCards";
import { PatientNavigationCarousel } from "../components/emergency/PatientNavigationCarousel";
import { MetricCard, ProgressBar } from "../components/ui/DashboardComponents";
import { useAuth } from "../hooks/useAuth";
import EmergencyService from "../services/EmergencyService";

const DashboardHome = () => {
  const { user, hospital } = useAuth();
  console.log('DashboardHome - user:', user);
  console.log('DashboardHome - hospital:', hospital);
  
  const [emergencies, setEmergencies] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");

  // Load data using EmergencyService
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get hospital ID from user data
        const hospitalId = hospital?.id || user?.hospitalInfo?.hospitalId || user?._id;
        
        if (!hospitalId) {
          console.error('No hospital ID available');
          throw new Error('Hospital ID not found');
        }

        console.log('Loading dashboard data for hospital:', hospitalId);

        // Load all dashboard data
        const [emergenciesData, ambulancesData, metricsData] =
          await Promise.all([
            EmergencyService.getActiveEmergencies(),
            EmergencyService.getAmbulanceFleet(hospitalId),
            EmergencyService.getHospitalMetrics(),
          ]);

        console.log('Loaded ambulances:', ambulancesData);
        setEmergencies(emergenciesData);
        setAmbulances(ambulancesData);
        setMetrics(metricsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Fallback to service mock data if API fails
        setEmergencies(EmergencyService.getMockEmergencies());
        setAmbulances(EmergencyService.getMockAmbulances());
        setMetrics(EmergencyService.getMockMetrics());
      }
    };

    // Only load data if we have user/hospital information
    if (user || hospital) {
      loadDashboardData();
    }

    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(() => {
      if (user || hospital) {
        loadDashboardData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, hospital]);

  const handleDispatchAmbulance = async (emergency) => {
    try {
      // Find available ambulance
      const availableAmbulance = ambulances.find(
        (a) => a.status === "available"
      );
      if (!availableAmbulance) {
        alert("No ambulances available for dispatch");
        return;
      }

      // Dispatch ambulance via API
      await EmergencyService.dispatchAmbulance(
        emergency.id,
        availableAmbulance.id
      );

      // Update local state
      setEmergencies((prev) =>
        prev.map((e) =>
          e.id === emergency.id
            ? {
                ...e,
                status: "dispatched",
                assignedAmbulance: { id: availableAmbulance.id },
              }
            : e
        )
      );

      setAmbulances((prev) =>
        prev.map((a) =>
          a.id === availableAmbulance.id
            ? {
                ...a,
                status: "dispatched",
                currentAssignment: { id: emergency.id },
              }
            : a
        )
      );

      alert(
        `Successfully dispatched ${availableAmbulance.callSign} for emergency ${emergency.id}`
      );
    } catch (error) {
      console.error("Failed to dispatch ambulance:", error);
      alert("Failed to dispatch ambulance. Please try again.");
    }
  };

  const handleViewEmergencyDetails = (emergency) => {
    console.log("Viewing details for emergency:", emergency.id);
    // Open emergency details modal or navigate to details page
    // This could be implemented with a modal component
  };

  const handleAssignAmbulance = (ambulance) => {
    console.log("Assigning ambulance:", ambulance.id);
    // Open assignment interface - could show pending emergencies
  };

  const handleTrackAmbulance = (ambulance) => {
    console.log("Tracking ambulance:", ambulance.id);
    // Open tracking interface or map view
  };

  const filteredEmergencies = emergencies.filter((emergency) => {
    if (activeFilter === "all") return true;
    return (
      emergency.priority === activeFilter || emergency.status === activeFilter
    );
  });

  return (
    <div className="p-6 space-y-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Emergency Dispatch Center
          </h1>
          <p className="text-slate-600">
            Real-time emergency management for {hospital?.name || user?.name} •{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
            <Phone size={16} />
            Emergency Line
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            <Activity size={16} />
            System Status
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Emergencies"
          value={metrics.activeEmergencies}
          icon={<Warning size={20} />}
          color="red"
          subtitle="Requiring immediate attention"
        />

        <MetricCard
          title="Available Ambulances"
          value={`${metrics.availableAmbulances}/${metrics.totalAmbulances}`}
          icon={<Truck size={20} />}
          color="green"
          subtitle="Ready for dispatch"
        />

        <MetricCard
          title="Avg Response Time"
          value={`${metrics.averageResponseTime} min`}
          icon={<Clock size={20} />}
          color="blue"
          subtitle="Last 24 hours"
          trend="↓ 2 min from yesterday"
          trendDirection="up"
        />

        <MetricCard
          title="Completed Today"
          value={metrics.completedToday}
          icon={<Activity size={20} />}
          color="purple"
          subtitle="Successfully handled"
          trend="↑ 12% from yesterday"
          trendDirection="up"
        />
      </div>

      {/* Hospital Capacity Overview */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Hospital Capacity Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-700">Emergency Beds</span>
              <span className="text-sm text-slate-600">
                {metrics.hospitalCapacity?.emergency.available}/
                {metrics.hospitalCapacity?.emergency.total}
              </span>
            </div>
            <ProgressBar
              value={metrics.hospitalCapacity?.emergency.available || 0}
              max={metrics.hospitalCapacity?.emergency.total || 1}
              color="green"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-700">ICU Beds</span>
              <span className="text-sm text-slate-600">
                {metrics.hospitalCapacity?.icu.available}/
                {metrics.hospitalCapacity?.icu.total}
              </span>
            </div>
            <ProgressBar
              value={metrics.hospitalCapacity?.icu.available || 0}
              max={metrics.hospitalCapacity?.icu.total || 1}
              color="orange"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-700">General Beds</span>
              <span className="text-sm text-slate-600">
                {metrics.hospitalCapacity?.general.available}/
                {metrics.hospitalCapacity?.general.total}
              </span>
            </div>
            <ProgressBar
              value={metrics.hospitalCapacity?.general.available || 0}
              max={metrics.hospitalCapacity?.general.total || 1}
              color="blue"
            />
          </div>
        </div>
      </div>

      {/* Active Emergencies - Full Width */}
      <div className="mb-6">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Incoming Patients
              </h3>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                  {["all", "critical", "high", "pending"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                        activeFilter === filter
                          ? "bg-blue-100 text-blue-700"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {filteredEmergencies.length > 0 ? (
                <PatientNavigationCarousel 
                  patients={filteredEmergencies}
                  onAccept={(emergency) => {
                    console.log("Accepting emergency:", emergency.id);
                    // Handle emergency acceptance
                  }}
                  onPrepare={(emergency) => {
                    console.log("Preparing for emergency:", emergency.id);
                    // Handle preparation
                  }}
                  onCallParamedic={(emergency) => {
                    console.log("Calling paramedic for emergency:", emergency.id);
                    // Handle calling paramedic
                  }}
                />
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Heartbeat size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No active emergencies matching filter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ambulance Fleet */}
      <div className="mb-6">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">
              Ambulance Fleet
            </h3>
          </div>

          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {ambulances && ambulances.length > 0 ? (
              ambulances.map((ambulance) => (
                <AmbulanceCard
                  key={ambulance._id || ambulance.id}
                  ambulance={ambulance}
                  onAssign={handleAssignAmbulance}
                  onTrack={handleTrackAmbulance}
                />
              ))
            ) : (
              <AmbulanceEmptyState 
                isLoading={!ambulances} 
                onRefresh={() => window.location.reload()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
