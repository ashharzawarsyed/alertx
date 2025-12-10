import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter, useLocalSearchParams } from "expo-router";
import { emergencyService, Emergency } from "../../services/emergencyService";
import CrossPlatformMap, { Marker } from "../../components/CrossPlatformMap";
import { generatePolylineCode, PolylineSegment } from "../../components/maps/MapPolyline";

// Socket service will be dynamically imported when needed
let socketService: any = null;

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;

// Extended Emergency type with tracking data
interface ExtendedEmergency extends Emergency {
  patientLocation?: {
    coordinates: [number, number];
    address?: string;
  };
  assignedAmbulance?: {
    _id: string;
    vehicleNumber: string;
    currentLocation?: {
      coordinates: [number, number];
    };
  };
  triageData?: {
    severity: string;
    symptoms: string[];
    score: number;
  };
  timeline?: Array<{
    status: string;
    timestamp: Date;
    note?: string;
  }>;
  estimatedArrival?: Date;
}

interface DriverLocation {
  latitude: number;
  longitude: number;
}

export default function EmergencyTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const emergencyId = params.emergencyId as string;

  const [emergency, setEmergency] = useState<ExtendedEmergency | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<'en_route_to_patient' | 'transporting_to_hospital' | 'completed'>('en_route_to_patient');
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{lat: number, lng: number}>>([]);
  const [traveledPath, setTraveledPath] = useState<Array<{lat: number, lng: number}>>([]);
  const [remainingPath, setRemainingPath] = useState<Array<{lat: number, lng: number}>>([]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Generate polyline code for WebView with traveled/remaining paths
  const polylineCode = React.useMemo(() => {
    const segments: PolylineSegment[] = [];
    
    // Traveled path (blue dashed)
    if (traveledPath.length > 1) {
      segments.push({
        coordinates: traveledPath,
        color: '#3b82f6',
        weight: 5,
        opacity: 0.7,
        dashArray: '10, 5',
        zIndex: 2,
      });
    }
    
    // Remaining path (green for to patient, orange for to hospital)
    if (remainingPath.length > 1) {
      const color = trackingStatus === 'transporting_to_hospital' ? '#f97316' : '#10b981';
      segments.push({
        coordinates: remainingPath,
        color: color,
        weight: 5,
        opacity: 0.9,
        zIndex: 1,
      });
    }
    
    return generatePolylineCode(segments);
  }, [traveledPath, remainingPath, trackingStatus]);

  // Pulse animation for ambulance marker
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Fetch route from Google Directions API
  const fetchRoute = useCallback(async (origin: {lat: number, lng: number}, destination: {lat: number, lng: number}) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || Constants.expoConfig?.extra?.googleMapsApiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const encodedPolyline = route.overview_polyline.points;
        const decodedPath = decodePolyline(encodedPolyline);
        
        console.log(`✅ Route fetched: ${decodedPath.length} points`);
        setRouteCoordinates(decodedPath);
        setRemainingPath(decodedPath);
        setTraveledPath([]);
        
        return decodedPath;
      }
    } catch (error) {
      console.error('❌ Error fetching route:', error);
    }
    return [];
  }, []);

  // Decode Google's encoded polyline format
  const decodePolyline = (encoded: string): Array<{lat: number, lng: number}> => {
    const points: Array<{lat: number, lng: number}> = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        lat: lat / 1e5,
        lng: lng / 1e5,
      });
    }

    return points;
  };

  // Update traveled/remaining path based on current location
  const updateRoutePaths = useCallback((currentLat: number, currentLng: number) => {
    if (routeCoordinates.length === 0) return;

    // Find closest point on route
    let minDistance = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < routeCoordinates.length; i++) {
      const point = routeCoordinates[i];
      const dist = Math.sqrt(
        Math.pow(point.lat - currentLat, 2) + Math.pow(point.lng - currentLng, 2)
      );

      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    // Split route into traveled and remaining
    const traveled = routeCoordinates.slice(0, closestIndex + 1);
    const remaining = routeCoordinates.slice(closestIndex);

    setTraveledPath(traveled);
    setRemainingPath(remaining);
  }, [routeCoordinates]);

  // Calculate distance and ETA using Haversine formula
  const calculateETA = useCallback((coords1: [number, number], coords2: [number, number]) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((coords2[1] - coords1[1]) * Math.PI) / 180;
    const dLon = ((coords2[0] - coords1[0]) * Math.PI) / 180;
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coords1[1] * Math.PI) / 180) *
        Math.cos((coords2[1] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    
    // Assume average speed of 40 km/h in city traffic
    const etaMinutes = Math.round((distanceKm / 40) * 60);
    
    setDistance(`${distanceKm.toFixed(1)} km`);
    setEta(`${etaMinutes} min`);
  }, []);

  // Fetch emergency details
  const fetchEmergencyDetails = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      if (!showLoader) setRefreshing(true);

      const response = await emergencyService.getEmergencyById(emergencyId);
      
      if (response.success && response.data) {
        const emergencyData = response.data.emergency as ExtendedEmergency;
        setEmergency(emergencyData);

        // Update tracking status based on emergency status
        if (emergencyData.status === 'completed') {
          setTrackingStatus('completed');
        } else if (emergencyData.status === 'in_progress' || emergencyData.pickupTime) {
          setTrackingStatus('transporting_to_hospital');
        } else {
          setTrackingStatus('en_route_to_patient');
        }

        // Calculate ETA if ambulance is assigned and has location
        if (emergencyData.assignedAmbulance?.currentLocation) {
          const patientCoords: [number, number] = emergencyData.patientLocation
            ? emergencyData.patientLocation.coordinates
            : [emergencyData.location.lng, emergencyData.location.lat];
          
          const ambulanceCoords = emergencyData.assignedAmbulance.currentLocation.coordinates;
          
          calculateETA(ambulanceCoords, patientCoords);
          
          // Set driver location for marker
          const driverLoc = {
            latitude: ambulanceCoords[1],
            longitude: ambulanceCoords[0],
          };
          setDriverLocation(driverLoc);
          
          // Fetch route from Google Directions API
          const destination = trackingStatus === 'transporting_to_hospital'
            ? {
                lat: (emergencyData.assignedHospital as any)?.location?.lat || 33.7077,
                lng: (emergencyData.assignedHospital as any)?.location?.lng || 73.0533,
              }
            : { lat: patientCoords[1], lng: patientCoords[0] };
          
          await fetchRoute(
            { lat: driverLoc.latitude, lng: driverLoc.longitude },
            destination
          );
        } else if (
          emergencyData.assignedDriver &&
          emergencyData.status !== "pending"
        ) {
          // Simulate driver location if not available (for demo purposes)
          const patientLat = emergencyData.location.lat;
          const patientLng = emergencyData.location.lng;
          
          const offset = 0.02;
          const simulatedLocation: DriverLocation = {
            latitude: patientLat + (Math.random() - 0.5) * offset,
            longitude: patientLng + (Math.random() - 0.5) * offset,
          };
          
          setDriverLocation(simulatedLocation);
          
          // Calculate simulated ETA
          calculateETA(
            [simulatedLocation.longitude, simulatedLocation.latitude],
            [patientLng, patientLat]
          );
        }
      } else {
        // Fallback: show error but don't crash
        console.warn('Failed to fetch emergency details:', response.message);
        if (showLoader) {
          Alert.alert(
            "Limited Access",
            "Unable to load full emergency details. Some features may be unavailable.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error: any) {
      console.error("Error fetching emergency:", error);
      // Don't show alert on background refresh
      if (showLoader) {
        Alert.alert(
          "Connection Error",
          "Unable to load emergency details. Please check your connection and try again.",
          [
            { text: "Retry", onPress: () => fetchEmergencyDetails(true) },
            { text: "Go Back", onPress: () => router.back(), style: "cancel" },
          ]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [emergencyId, router]);

  useEffect(() => {
    fetchEmergencyDetails();

    // Setup socket listener for real-time ambulance location
    setupAmbulanceTracking();

    // Poll for updates every 30 seconds (reduced since we have real-time updates)
    const interval = setInterval(() => {
      fetchEmergencyDetails(false);
    }, 30000);

    return () => {
      clearInterval(interval);
      cleanupAmbulanceTracking();
    };
  }, [fetchEmergencyDetails]);

  const setupAmbulanceTracking = async () => {
    try {
      // Dynamically import socket service
      const { default: service } = await import('../../services/socketService');
      socketService = service;

      // Connect socket if not already connected
      if (!socketService.isConnected()) {
        const connected = await socketService.connect();
        if (!connected) {
          console.warn('⚠️ Could not connect socket for tracking');
          return;
        }
      }

      // Join emergency room
      socketService.joinEmergencyRoom(emergencyId);

      // Listen for ambulance location updates
      socketService.onAmbulanceLocationUpdate((data: any) => {
        if (data.emergencyId === emergencyId) {
          console.log('🚑 Ambulance location update received:', data.location);
          
          setDriverLocation({
            latitude: data.location.lat,
            longitude: data.location.lng,
          });

          // Update route progress (traveled vs remaining)
          updateRoutePaths(data.location.lat, data.location.lng);

          // Recalculate ETA if we have patient location
          if (emergency?.location) {
            calculateETA(
              [data.location.lng, data.location.lat],
              [emergency.location.lng, emergency.location.lat]
            );
          }
        }
      });
    } catch (error) {
      console.error('Error setting up ambulance tracking:', error);
    }
  };

  const cleanupAmbulanceTracking = () => {
    if (socketService && socketService.isConnected()) {
      socketService.leaveEmergencyRoom(emergencyId);
      socketService.offAmbulanceLocationUpdate();
    }
  };

  const handleCancelEmergency = () => {
    // Check if emergency is in progress (use force cancel)
    const isInProgress = emergency?.status === 'accepted' || emergency?.status === 'in_progress';
    
    const title = isInProgress ? "Cancel In-Progress Emergency" : "Cancel Emergency";
    const message = isInProgress 
      ? "This emergency is already in progress. Are you sure you want to cancel? This should only be used if there's a technical issue."
      : "Are you sure you want to cancel this emergency request?";

    Alert.alert(
      title,
      message,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const response = isInProgress
                ? await emergencyService.forceCancelEmergency(
                    emergencyId,
                    "Cancelled by patient due to technical issue"
                  )
                : await emergencyService.cancelEmergency(
                    emergencyId,
                    "Cancelled by user"
                  );

              if (response.success) {
                Alert.alert("Emergency Cancelled", "Your emergency request has been cancelled.", [
                  { text: "OK", onPress: () => router.back() },
                ]);
              } else {
                Alert.alert("Error", response.message);
              }
            } catch (error) {
              Alert.alert("Error", "Failed to cancel emergency");
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "accepted":
      case "ambulance_dispatched":
        return "#3B82F6";
      case "in_progress":
      case "ambulance_arrived":
      case "patient_picked_up":
        return "#8B5CF6";
      case "en_route_to_hospital":
        return "#7C3AED";
      case "arrived_at_hospital":
      case "completed":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "#DC2626";
      case "high":
        return "#EF4444";
      case "medium":
      case "moderate":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading emergency details...</Text>
      </SafeAreaView>
    );
  }

  if (!emergency) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Emergency Not Found</Text>
        <Text style={styles.errorSubtitle}>Unable to load emergency details</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle}>Emergency Tracking</Text>
          <Text style={styles.topBarSubtitle}>ID: {emergency._id.slice(-8)}</Text>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => fetchEmergencyDetails(false)}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color={refreshing ? "#EF4444" : "#111827"} 
          />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <CrossPlatformMap
          initialRegion={{
            latitude: emergency.location.lat,
            longitude: emergency.location.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02 * ASPECT_RATIO,
          }}
          style={styles.map}
          customMapScript={polylineCode}
          markers={[
            // Patient Location Marker
            {
              latitude: emergency.location.lat,
              longitude: emergency.location.lng,
              title: "Your Location",
              description: emergency.location.address || "Emergency Location",
              color: "#EF4444",
              icon: "user-injured", // Injured person icon
            },
            // Ambulance Marker (if available)
            ...(driverLocation ? [{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
              title: "Ambulance",
              description: "En route to your location",
              color: "#10b981",
              icon: "ambulance", // Ambulance icon
            }] : []),
            // Hospital Marker (if assigned)
            ...(emergency.assignedHospital ? [{
              latitude: (emergency.assignedHospital as any)?.location?.lat || 33.7077,
              longitude: (emergency.assignedHospital as any)?.location?.lng || 73.0533,
              title: emergency.assignedHospital.name || "Hospital",
              description: "Destination Hospital",
              color: "#3B82F6",
              icon: "hospital", // Hospital icon
            }] : []),
          ]}
        />

        {/* ETA Overlay */}
        {driverLocation && eta && (
          <View style={styles.etaOverlay}>
            <Ionicons name="time" size={20} color="#FFFFFF" />
            <Text style={styles.etaText}>ETA: {eta}</Text>
            {distance && <Text style={styles.etaDistance}>• {distance}</Text>}
          </View>
        )}
      </View>

      {/* Bottom Info Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(emergency.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusLabel(emergency.status)}
              </Text>
            </View>
            {emergency.severityLevel && (
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(emergency.severityLevel) },
                ]}
              >
                <Text style={styles.severityText}>
                  {emergency.severityLevel.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Triage Info */}
          {emergency.triageData && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="pulse" size={24} color="#EF4444" />
                <Text style={styles.cardTitle}>Triage Assessment</Text>
              </View>
              <Text style={styles.triageScore}>
                Score: {emergency.triageData.score}/10
              </Text>
              {emergency.triageData.symptoms && emergency.triageData.symptoms.length > 0 && (
                <View style={styles.symptomsContainer}>
                  <Text style={styles.symptomsLabel}>Symptoms:</Text>
                  <Text style={styles.symptomsText}>
                    {emergency.triageData.symptoms.join(", ")}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Driver Info Card */}
          {emergency.assignedDriver && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="car" size={24} color="#EF4444" />
                <Text style={styles.cardTitle}>Ambulance Driver</Text>
              </View>
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverInitials}>
                    {(emergency.assignedDriver as any).name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase() || "DR"}
                  </Text>
                </View>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>
                    {(emergency.assignedDriver as any).name || "Driver"}
                  </Text>
                  {(emergency.assignedDriver as any).phone && (
                    <View style={styles.contactRow}>
                      <Ionicons name="call" size={16} color="#6B7280" />
                      <Text style={styles.driverSubtext}>
                        {(emergency.assignedDriver as any).phone}
                      </Text>
                    </View>
                  )}
                  {(emergency.assignedDriver as any).driverInfo?.ambulanceNumber && (
                    <View style={styles.contactRow}>
                      <Ionicons name="medical" size={16} color="#6B7280" />
                      <Text style={styles.driverSubtext}>
                        {(emergency.assignedDriver as any).driverInfo.ambulanceNumber}
                      </Text>
                    </View>
                  )}
                  {(emergency.assignedDriver as any).driverInfo?.licenseNumber && (
                    <View style={styles.contactRow}>
                      <Ionicons name="card" size={16} color="#6B7280" />
                      <Text style={styles.driverSubtext}>
                        License: {(emergency.assignedDriver as any).driverInfo.licenseNumber}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Hospital Info Card */}
          {emergency.assignedHospital && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="business" size={24} color="#3B82F6" />
                <Text style={styles.cardTitle}>Destination Hospital</Text>
              </View>
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>
                  {(emergency.assignedHospital as any).name || "Hospital"}
                </Text>
                <Text style={styles.hospitalAddress}>
                  {(emergency.assignedHospital as any).address || "Address not available"}
                </Text>
                {(emergency.assignedHospital as any).phone && (
                  <Text style={styles.hospitalPhone}>
                    {(emergency.assignedHospital as any).phone}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Timeline */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={24} color="#8B5CF6" />
              <Text style={styles.cardTitle}>Emergency Timeline</Text>
            </View>
            <View style={styles.timeline}>
              {emergency.timeline && emergency.timeline.length > 0 ? (
                emergency.timeline
                  .slice()
                  .reverse()
                  .map((event, index) => (
                    <View key={index} style={styles.timelineItem}>
                      <View
                        style={[
                          styles.timelineDot,
                          { backgroundColor: getStatusColor(event.status) },
                        ]}
                      />
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>
                          {getStatusLabel(event.status)}
                        </Text>
                        <Text style={styles.timelineTime}>
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </Text>
                        {event.note && (
                          <Text style={styles.timelineNote}>{event.note}</Text>
                        )}
                      </View>
                    </View>
                  ))
              ) : (
                <>
                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: "#10B981" }]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>Emergency Requested</Text>
                      <Text style={styles.timelineTime}>
                        {new Date(emergency.createdAt).toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>

                  {emergency.responseTime && (
                    <View style={styles.timelineItem}>
                      <View style={[styles.timelineDot, { backgroundColor: "#3B82F6" }]} />
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>Ambulance Accepted</Text>
                        <Text style={styles.timelineTime}>
                          {new Date(emergency.responseTime).toLocaleTimeString()}
                        </Text>
                      </View>
                    </View>
                  )}

                  {emergency.completedTime && (
                    <View style={styles.timelineItem}>
                      <View style={[styles.timelineDot, { backgroundColor: "#10B981" }]} />
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>Emergency Completed</Text>
                        <Text style={styles.timelineTime}>
                          {new Date(emergency.completedTime).toLocaleTimeString()}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>

          {/* Cancel Button - Available for pending, accepted, and in_progress */}
          {["pending", "accepted", "in_progress"].includes(emergency.status) && (
            <View style={styles.cancelSection}>
              {emergency.status === 'in_progress' && (
                <Text style={styles.cancelWarning}>
                  ⚠️ Emergency is in progress. Use cancel only if there's a technical issue.
                </Text>
              )}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEmergency}
              >
                <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                <Text style={styles.cancelButtonText}>
                  {emergency.status === 'in_progress' ? 'Force Cancel Emergency' : 'Cancel Emergency'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#EF4444",
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Top Bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  topBarSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  // Map
  mapContainer: {
    height: 300,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  patientMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  ambulanceMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  etaOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#EF4444",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  etaText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  etaDistance: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Bottom Sheet
  bottomSheet: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Status
  statusContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  severityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  // Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  triageScore: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  symptomsContainer: {
    marginTop: 8,
  },
  symptomsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  symptomsText: {
    fontSize: 14,
    color: "#111827",
  },

  // Driver Info
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  driverInitials: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  driverSubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },

  // Hospital Info
  hospitalInfo: {
    gap: 8,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  hospitalAddress: {
    fontSize: 14,
    color: "#6B7280",
  },
  hospitalPhone: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },

  // Timeline
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  timelineTime: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  timelineNote: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontStyle: "italic",
  },

  // Cancel Button
  cancelSection: {
    padding: 16,
    backgroundColor: "#FEF2F2",
    borderTopWidth: 1,
    borderTopColor: "#FEE2E2",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  cancelWarning: {
    fontSize: 13,
    color: "#DC2626",
    marginBottom: 12,
    fontWeight: "500",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
