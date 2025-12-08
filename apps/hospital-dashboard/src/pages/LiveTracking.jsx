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
  const [mapCenter, setMapCenter] = useState({ lat: 33.7426, lng: 72.7847 });
  const [mapZoom, setMapZoom] = useState(12);
  const [statistics, setStatistics] = useState({
    total: 0,
    enRoute: 0,
    available: 0,
    critical: 0,
  });
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [hospitalLocation, setHospitalLocation] = useState(null);

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

        console.log("🏥 [TRACKING] Initializing tracking...");
        console.log("🏥 [TRACKING] Hospital data:", hospitalData);
        console.log("🏥 [TRACKING] Token exists:", !!token);

        if (!hospitalData || !token) {
          console.error("❌ [TRACKING] No hospital data or token found");
          console.error("❌ [TRACKING] Hospital data:", hospitalData);
          console.error("❌ [TRACKING] Token:", !!token);
          return;
        }

        setHospital(hospitalData);
        
        // Handle different coordinate formats from backend
        // MongoDB stores as {type: "Point", coordinates: [lng, lat]}
        let lat, lng;
        
        if (hospitalData.location?.coordinates && Array.isArray(hospitalData.location.coordinates)) {
          // MongoDB GeoJSON format: [longitude, latitude]
          lng = hospitalData.location.coordinates[0];
          lat = hospitalData.location.coordinates[1];
        } else if (hospitalData.coordinates?.latitude && hospitalData.coordinates?.longitude) {
          lat = hospitalData.coordinates.latitude;
          lng = hospitalData.coordinates.longitude;
        } else if (hospitalData.latitude && hospitalData.longitude) {
          lat = hospitalData.latitude;
          lng = hospitalData.longitude;
        } else {
          // Fallback to POF Hospital
          lat = 33.7500;
          lng = 72.7847;
        }
        
        console.log("📍 [TRACKING] Hospital location data:", hospitalData.location);
        console.log("📍 [TRACKING] Extracted coordinates:", { lat, lng });
        console.log("📍 [TRACKING] Map will center at:", { lat, lng });
        
        const hospitalPos = { lat, lng };
        setHospitalLocation(hospitalPos);
        setMapCenter(hospitalPos);

        // Connect to tracking service
        const hospitalId = hospitalData._id || hospitalData.id;
        console.log("🔌 [TRACKING] Connecting to socket with hospital ID:", hospitalId);
        console.log("🔌 [TRACKING] Hospital Name:", hospitalData.name);
        console.log("⚠️ [TRACKING] IMPORTANT: Make sure you're logged in as the correct hospital!");
        console.log("⚠️ [TRACKING] Emergencies will only appear if assigned to hospital ID:", hospitalId);
        
        trackingService.connect(hospitalId, token);
        setConnectionStatus("connected");
        console.log("✅ [TRACKING] Socket connection initiated");

        // IMPORTANT: Wait for socket to connect before setting up listeners
        trackingService.socket.on('connect', () => {
          console.log('🔌 [TRACKING] Socket connected, joining hospital room...');
          trackingService.socket.emit('hospital:join', hospitalId);
          console.log(`📡 [TRACKING] Emitted hospital:join for: ${hospitalId}`);
        });

        // Listen for room join confirmation
        trackingService.socket.on('hospital:joined', (data) => {
          console.log('✅ [TRACKING] Successfully joined hospital room:', data);
        });

        // Listen for emergency assignments
        trackingService.socket.on('emergency:incoming', (data) => {
          console.log('🚨 [TRACKING] ========================================');
          console.log('🚨 [TRACKING] NEW EMERGENCY INCOMING!');
          console.log('🚨 [TRACKING] ========================================');
          console.log('🚨 [TRACKING] Full data:', JSON.stringify(data, null, 2));
          console.log('🚨 [TRACKING] Emergency ID:', data.emergency?.id);
          console.log('🚨 [TRACKING] Patient:', data.emergency?.patient?.name);
          console.log('🚨 [TRACKING] Severity:', data.emergency?.severity);
          console.log('🚨 [TRACKING] Ambulance:', data.driver?.ambulanceNumber);
          console.log('🚨 [TRACKING] Driver:', data.driver?.name);
          console.log('🚨 [TRACKING] Reserved Bed Type:', data.reservedBedType);
          console.log('🚨 [TRACKING] My Hospital ID:', hospitalId);
          console.log('🚨 [TRACKING] ========================================');
          
          // Refresh ambulance data
          trackingService.getAmbulances(hospitalId).then(responseData => {
            console.log('✅ [TRACKING] Ambulances refreshed after emergency');
            console.log('✅ [TRACKING] Own ambulances:', responseData.ownAmbulances?.length || 0);
            console.log('✅ [TRACKING] Incoming ambulances:', responseData.incomingAmbulances?.length || 0);
            const allAmbulances = [
              ...(responseData.ownAmbulances || []),
              ...(responseData.incomingAmbulances || []),
            ];
            setAmbulances(allAmbulances);
            updateStatistics(allAmbulances);
          }).catch(err => console.error('❌ [TRACKING] Error refreshing ambulances:', err));
        });

        // Listen for emergency completion
        trackingService.socket.on('emergency:completed', (data) => {
          console.log('✅ [TRACKING] Emergency completed:', data);
          // Refresh ambulance data
          trackingService.getAmbulances(hospitalId).then(responseData => {
            const allAmbulances = [
              ...(responseData.ownAmbulances || []),
              ...(responseData.incomingAmbulances || []),
            ];
            setAmbulances(allAmbulances);
            updateStatistics(allAmbulances);
          }).catch(err => console.error('❌ [TRACKING] Error refreshing ambulances:', err));
        });

        // Listen for ambulance location updates
        trackingService.socket.on('ambulance:location:update', (data) => {
          console.log('📍 [TRACKING] Ambulance location update:', data);
          setAmbulances(prev => prev.map(amb => 
            amb._id === data.ambulanceId 
              ? { ...amb, currentLocation: data.location }
              : amb
          ));
        });

        // If socket is already connected, join immediately
        if (trackingService.socket.connected) {
          console.log('🔌 [TRACKING] Socket already connected, joining hospital room...');
          trackingService.socket.emit('hospital:join', hospitalId);
          console.log(`📡 [TRACKING] Emitted hospital:join for: ${hospitalId}`);
        }

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

  // Dynamic map centering based on active emergencies
  useEffect(() => {
    const activeAmbulances = ambulances.filter(amb => 
      amb.status === 'on_route' || amb.status === 'busy'
    );

    if (activeAmbulances.length > 0 && mapRef.current) {
      // Center on active ambulances
      const bounds = new window.google.maps.LatLngBounds();
      
      // Add hospital location
      if (hospitalLocation) {
        bounds.extend(hospitalLocation);
      }
      
      // Add all active ambulances
      activeAmbulances.forEach(amb => {
        if (amb.currentLocation) {
          bounds.extend({
            lat: amb.currentLocation.coordinates[1],
            lng: amb.currentLocation.coordinates[0],
          });
        }
      });

      mapRef.current.fitBounds(bounds);
      console.log('📍 [TRACKING] Centered map on active ambulances');
    } else if (hospitalLocation && mapRef.current) {
      // No active emergencies, center on hospital
      setMapCenter(hospitalLocation);
      setMapZoom(14);
      console.log('📍 [TRACKING] Centered map on hospital');
    }
  }, [ambulances, hospitalLocation]);

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
        {hospital && mapCenter && (
          <Marker
            position={mapCenter}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="#DC2626" stroke="white" stroke-width="3"/>
                  <path d="M24 12 L24 36 M12 24 L36 24" stroke="white" stroke-width="4" stroke-linecap="round"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(48, 48),
              anchor: new window.google.maps.Point(24, 24),
            }}
            title={hospital.name || 'Hospital'}
            label={{
              text: hospital.name || 'Hospital',
              color: '#DC2626',
              fontSize: '14px',
              fontWeight: 'bold',
              className: 'hospital-marker-label'
            }}
          />
        )}

        {/* Ambulance Markers */}
        {ambulances.map((ambulance) => {
          if (!ambulance.currentLocation) return null;

          const isOwn = ambulance.hospitalId === hospital?._id;
          const color = isOwn ? "#3B82F6" : "#10B981";
          const statusColor = ambulance.status === 'on_route' ? '#F59E0B' : 
                             ambulance.status === 'busy' ? '#DC2626' : '#10B981';

          return (
            <Marker
              key={ambulance._id}
              position={{
                lat: ambulance.currentLocation.coordinates[1],
                lng: ambulance.currentLocation.coordinates[0],
              }}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" fill="${statusColor}" stroke="white" stroke-width="3"/>
                    <path d="M12 20 L20 14 L28 20 L20 26 Z" fill="white"/>
                    <circle cx="20" cy="20" r="4" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 20),
              }}
              onClick={() => handleMarkerClick(ambulance)}
              title={`${ambulance.vehicleNumber || 'Ambulance'} - ${ambulance.status}`}
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
