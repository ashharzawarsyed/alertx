import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { NavigationArrow, Truck, Activity } from "phosphor-react";

import AmbulanceInfoPanel from "../components/AmbulanceInfoPanel";
import trackingService from "../services/trackingService";

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  "AIzaSyCgEmYHXUzysg6yRptadI6kv1BnXaNAIPI";

const libraries = ["places", "geometry"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Dark theme map styles
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const LiveTracking = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [ambulances, setAmbulances] = useState([]);
  const [hospital, setHospital] = useState(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 });
  const [mapZoom, setMapZoom] = useState(12);
  const [statistics, setStatistics] = useState({
    total: 0,
    enRoute: 0,
    available: 0,
    critical: 0,
  });
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const mapRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Initialize tracking
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        const hospitalData = JSON.parse(localStorage.getItem("hospital_data"));
        const token = localStorage.getItem("hospital_token");

        if (!hospitalData || !token) {
          console.error("No hospital data found");
          return;
        }

        setHospital(hospitalData);
        setMapCenter({
          lat: hospitalData.coordinates?.latitude || 40.7128,
          lng: hospitalData.coordinates?.longitude || -74.006,
        });

        // Connect to tracking service
        trackingService.connect(hospitalData._id, token);
        setConnectionStatus("connected");

        // Fetch initial ambulance data
        const data = await trackingService.getAmbulances(hospitalData._id);
        const allAmbulances = [
          ...(data.ownAmbulances || []),
          ...(data.incomingAmbulances || []),
        ];

        setAmbulances(allAmbulances);
        updateStatistics(allAmbulances);

        // Auto-fit bounds to show all ambulances
        if (allAmbulances.length > 0 && mapRef.current) {
          const bounds = new window.google.maps.LatLngBounds();

          // Add hospital to bounds
          bounds.extend({
            lat: hospitalData.coordinates?.latitude,
            lng: hospitalData.coordinates?.longitude,
          });

          // Add all ambulances to bounds
          allAmbulances.forEach((amb) => {
            if (amb.currentLocation) {
              bounds.extend({
                lat: amb.currentLocation.coordinates[1],
                lng: amb.currentLocation.coordinates[0],
              });
            }
          });

          mapRef.current.fitBounds(bounds);
        }

        // Subscribe to real-time updates
        trackingService.onLocationUpdate((data) => {
          setAmbulances((prev) => {
            const updated = prev.map((amb) =>
              amb._id === data.ambulanceId
                ? {
                    ...amb,
                    currentLocation: data.location,
                    heading: data.heading,
                    speed: data.speed,
                  }
                : amb
            );
            updateStatistics(updated);
            return updated;
          });
        });

        trackingService.onStatusUpdate((data) => {
          setAmbulances((prev) => {
            const updated = prev.map((amb) =>
              amb._id === data.ambulanceId
                ? { ...amb, status: data.status }
                : amb
            );
            updateStatistics(updated);
            return updated;
          });
        });

        trackingService.onNewDispatch((data) => {
          if (data.destinationHospitalId === hospitalData._id) {
            setAmbulances((prev) => {
              const updated = [...prev, data.ambulance];
              updateStatistics(updated);
              return updated;
            });
          }
        });

        trackingService.onAmbulanceArrived((data) => {
          setAmbulances((prev) => {
            const updated = prev.filter((amb) => amb._id !== data.ambulanceId);
            updateStatistics(updated);
            return updated;
          });

          if (selectedAmbulance?._id === data.ambulanceId) {
            setShowInfoPanel(false);
            setSelectedAmbulance(null);
          }
        });
      } catch (error) {
        console.error("Error initializing tracking:", error);
        setConnectionStatus("error");
      }
    };

    if (isLoaded) {
      initializeTracking();
    }

    return () => {
      trackingService.removeAllListeners();
      trackingService.disconnect();
    };
  }, [isLoaded]);

  const updateStatistics = (ambulanceList) => {
    const stats = {
      total: ambulanceList.length,
      enRoute: ambulanceList.filter(
        (a) => a.status === "en-route" || a.status === "responding"
      ).length,
      available: ambulanceList.filter((a) => a.status === "available").length,
      critical: ambulanceList.filter(
        (a) => a.currentEmergency?.priority === "critical"
      ).length,
    };
    setStatistics(stats);
  };

  const handleMarkerClick = (ambulance) => {
    setSelectedAmbulance(ambulance);
    setShowInfoPanel(true);
  };

  const handleClosePanel = () => {
    setShowInfoPanel(false);
    setSelectedAmbulance(null);
  };

  if (loadError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">Error loading maps</div>
          <div className="text-gray-400">{loadError.message}</div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-gray-400">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Statistics Overlay */}
      <div className="absolute top-6 left-6 right-6 z-10 pointer-events-none">
        <div className="grid grid-cols-4 gap-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <Truck size={24} weight="duotone" className="text-purple-400" />
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {statistics.total}
              </div>
            </div>
            <div className="text-sm text-gray-400">Total Ambulances</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <NavigationArrow
                size={24}
                weight="duotone"
                className="text-blue-400"
              />
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {statistics.enRoute}
              </div>
            </div>
            <div className="text-sm text-gray-400">En Route</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-xl p-4 border border-green-500/30 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <Activity size={24} weight="duotone" className="text-green-400" />
              <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {statistics.available}
              </div>
            </div>
            <div className="text-sm text-gray-400">Available</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-xl p-4 border border-red-500/30 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-2">
              <Activity size={24} weight="fill" className="text-red-400" />
              <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                {statistics.critical}
              </div>
            </div>
            <div className="text-sm text-gray-400">Critical Cases</div>
          </motion.div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="absolute top-6 right-6 z-10">
        <div
          className={`px-4 py-2 rounded-full backdrop-blur-xl border ${
            connectionStatus === "connected"
              ? "bg-green-500/20 border-green-500/30 text-green-400"
              : "bg-red-500/20 border-red-500/30 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-400 animate-pulse"
                  : "bg-red-400"
              }`}
            ></div>
            <span className="text-sm font-medium">
              {connectionStatus === "connected" ? "Live" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={onMapLoad}
        options={{
          styles: darkMapStyles,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Hospital Marker */}
        {hospital && hospital.coordinates && (
          <Marker
            position={{
              lat: hospital.coordinates.latitude,
              lng: hospital.coordinates.longitude,
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: "#a855f7",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            }}
            title={hospital.name}
          />
        )}

        {/* Ambulance Markers */}
        {ambulances.map((ambulance) => {
          if (!ambulance.currentLocation) return null;

          const isOwn = ambulance.hospitalId === hospital?._id;
          const color = isOwn ? "#3b82f6" : "#10b981";

          return (
            <Marker
              key={ambulance._id}
              position={{
                lat: ambulance.currentLocation.coordinates[1],
                lng: ambulance.currentLocation.coordinates[0],
              }}
              icon={{
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                fillColor: color,
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
                scale: 1.5,
                anchor: new window.google.maps.Point(12, 22),
                rotation: ambulance.heading || 0,
              }}
              onClick={() => handleMarkerClick(ambulance)}
              title={`${ambulance.vehicleNumber} - ${ambulance.status}`}
            />
          );
        })}
      </GoogleMap>

      {/* Ambulance Info Panel */}
      <AnimatePresence>
        {showInfoPanel && selectedAmbulance && (
          <AmbulanceInfoPanel
            ambulance={selectedAmbulance}
            hospital={hospital}
            onClose={handleClosePanel}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveTracking;
