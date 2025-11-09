import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import emergencyService, { Emergency as ServiceEmergency } from "../../services/emergencyService";
import Config from "../../config/config";
import CrossPlatformMap, { Marker } from "../../components/CrossPlatformMap";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Extended Emergency type for tracking screen with additional backend fields
interface ExtendedEmergency extends ServiceEmergency {
  patientLocation?: {
    coordinates: [number, number];
    address?: string;
  };
  assignedAmbulance?: {
    _id: string;
    vehicleNumber: string;
    currentLocation: {
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

const EmergencyTrackingScreen: React.FC = () => {
  const { emergencyId } = useLocalSearchParams<{ emergencyId: string }>();
  
  const [emergency, setEmergency] = useState<ExtendedEmergency | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [eta, setEta] = useState<string | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Pulse animation for ambulance marker
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Fetch emergency details
  const fetchEmergencyDetails = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      if (!showLoader) setRefreshing(true);

      const response = await emergencyService.getEmergencyById(emergencyId);
      
      if (response.success && response.data) {
        const emergencyData = response.data.emergency as ExtendedEmergency;
        setEmergency(emergencyData);
        
        // Calculate ETA if ambulance is assigned
        if (emergencyData.assignedAmbulance?.currentLocation && emergencyData.patientLocation) {
          calculateETA(
            emergencyData.assignedAmbulance.currentLocation.coordinates,
            emergencyData.patientLocation.coordinates
          );
        }
        
        // Map functionality disabled - install react-native-maps to enable
      }
    } catch (error: any) {
      console.error("Error fetching emergency:", error);
      Alert.alert("Error", "Failed to load emergency details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate ETA using Haversine formula
  const calculateETA = (ambulanceCoords: [number, number], patientCoords: [number, number]) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((patientCoords[1] - ambulanceCoords[1]) * Math.PI) / 180;
    const dLon = ((patientCoords[0] - ambulanceCoords[0]) * Math.PI) / 180;
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((ambulanceCoords[1] * Math.PI) / 180) *
        Math.cos((patientCoords[1] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    
    // Assume average speed of 40 km/h in city traffic
    const etaMinutes = Math.round((distanceKm / 40) * 60);
    
    setDistance(`${distanceKm.toFixed(1)} km`);
    setEta(`${etaMinutes} min`);
  };

  // Map functionality disabled - install react-native-maps to enable
  // Fit map to show both patient and ambulance
  // const fitMapToMarkers = (patientCoords: [number, number], ambulanceCoords: [number, number]) => {
  //   ...map ref code removed
  // };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchEmergencyDetails();
    
    refreshIntervalRef.current = setInterval(() => {
      fetchEmergencyDetails(false);
    }, 10000) as unknown as NodeJS.Timeout;
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [emergencyId]);

  // Cancel emergency
  const handleCancelEmergency = () => {
    Alert.alert(
      "Cancel Emergency",
      "Are you sure you want to cancel this emergency request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await emergencyService.cancelEmergency(emergencyId, "Cancelled by user");
              if (response.success) {
                Alert.alert("Emergency Cancelled", "Your emergency request has been cancelled.", [
                  { text: "OK", onPress: () => router.back() }
                ]);
              }
            } catch (error) {
              Alert.alert("Error", "Failed to cancel emergency");
            }
          },
        },
      ]
    );
  };

  // Status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "ambulance_dispatched":
        return "#4A90E2";
      case "ambulance_arrived":
        return "#7B68EE";
      case "patient_picked_up":
        return "#9370DB";
      case "en_route_to_hospital":
        return "#8A2BE2";
      case "arrived_at_hospital":
        return "#50C878";
      case "completed":
        return "#228B22";
      case "cancelled":
        return "#DC143C";
      default:
        return "#808080";
    }
  };

  // Status label
  const getStatusLabel = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "#DC143C";
      case "high":
        return "#FF6347";
      case "medium":
        return "#FFA500";
      case "low":
        return "#32CD32";
      default:
        return "#808080";
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF3B30" />
        <Text style={styles.loaderText}>Loading emergency details...</Text>
      </View>
    );
  }

  if (!emergency) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>Emergency not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Use fallback coordinates if patientLocation is not available
  const patientCoords = emergency.patientLocation
    ? {
        latitude: emergency.patientLocation.coordinates[1],
        longitude: emergency.patientLocation.coordinates[0],
      }
    : {
        latitude: emergency.location.lat,
        longitude: emergency.location.lng,
      };

  const ambulanceCoords = emergency.assignedAmbulance?.currentLocation
    ? {
        latitude: emergency.assignedAmbulance.currentLocation.coordinates[1],
        longitude: emergency.assignedAmbulance.currentLocation.coordinates[0],
      }
    : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Emergency Tracking</Text>
          <Text style={styles.headerSubtitle}>ID: {emergency._id.slice(-8)}</Text>
        </View>
        <TouchableOpacity onPress={() => fetchEmergencyDetails(false)}>
          <Ionicons name="refresh" size={24} color={refreshing ? "#FF3B30" : "#1F2937"} />
        </TouchableOpacity>
      </View>

      {/* Real-time Tracking Map */}
      <CrossPlatformMap
        initialRegion={{
          latitude: emergency.location.lat,
          longitude: emergency.location.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02 * ASPECT_RATIO,
        }}
        style={styles.map}
        onMapReady={() => setMapReady(true)}
      >
        {/* Patient Marker */}
        <Marker
          coordinate={{
            latitude: emergency.location.lat,
            longitude: emergency.location.lng,
          }}
          title="Your Location"
          pinColor="#FF3B30"
        >
          <View style={styles.patientMarker}>
            <Ionicons name="person" size={24} color="#FFF" />
          </View>
        </Marker>

        {/* Ambulance Marker - if assigned and has location */}
        {emergency.assignedDriver && (
          <Marker
            coordinate={{
              latitude: emergency.location.lat + 0.005,
              longitude: emergency.location.lng + 0.005,
            }}
            title="Ambulance"
            pinColor="#34D399"
          >
            <Animated.View
              style={[
                styles.ambulanceMarker,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Ionicons name="medical" size={28} color="#FFF" />
            </Animated.View>
          </Marker>
        )}
      </CrossPlatformMap>

      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: getStatusColor(emergency.status) }]}>
        <Text style={styles.statusBannerText}>{getStatusLabel(emergency.status)}</Text>
        {eta && (
          <View style={styles.etaBadge}>
            <Ionicons name="time-outline" size={16} color="#FFF" />
            <Text style={styles.etaText}>ETA: {eta}</Text>
          </View>
        )}
      </View>

      {/* Bottom Sheet */}
      <ScrollView style={styles.bottomSheet} contentContainerStyle={styles.bottomSheetContent}>
        {/* Triage Info */}
        {emergency.triageData && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="pulse" size={20} color="#FF3B30" />
              <Text style={styles.cardTitle}>Triage Assessment</Text>
            </View>
            <View style={styles.triageRow}>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(emergency.triageData.severity) },
                ]}
              >
                <Text style={styles.severityText}>
                  {emergency.triageData.severity?.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.triageScore}>Score: {emergency.triageData.score}/10</Text>
            </View>
            {emergency.triageData.symptoms && emergency.triageData.symptoms.length > 0 && (
              <View style={styles.symptomsContainer}>
                <Text style={styles.symptomsLabel}>Symptoms:</Text>
                <View style={styles.symptomsList}>
                  {emergency.triageData.symptoms.map((symptom, index) => (
                    <View key={index} style={styles.symptomTag}>
                      <Text style={styles.symptomText}>{symptom}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Driver Info */}
        {emergency.assignedDriver && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle" size={20} color="#4A90E2" />
              <Text style={styles.cardTitle}>Driver Information</Text>
            </View>
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <Ionicons name="person" size={32} color="#FFF" />
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{emergency.assignedDriver.name}</Text>
                <Text style={styles.driverPhone}>{emergency.assignedDriver.phone}</Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => Alert.alert("Call", `Call ${emergency.assignedDriver?.phone}?`)}
              >
                <Ionicons name="call" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Ambulance Info */}
        {emergency.assignedAmbulance && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="car-sport" size={20} color="#FF3B30" />
              <Text style={styles.cardTitle}>Ambulance Details</Text>
            </View>
            <View style={styles.ambulanceInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vehicle Number:</Text>
                <Text style={styles.infoValue}>
                  {emergency.assignedAmbulance.vehicleNumber}
                </Text>
              </View>
              {distance && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Distance:</Text>
                  <Text style={styles.infoValue}>{distance}</Text>
                </View>
              )}
              {eta && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Estimated Arrival:</Text>
                  <Text style={styles.infoValue}>{eta}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Hospital Info */}
        {emergency.assignedHospital && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="medical" size={20} color="#50C878" />
              <Text style={styles.cardTitle}>Destination Hospital</Text>
            </View>
            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>{emergency.assignedHospital.name}</Text>
              <Text style={styles.hospitalAddress}>{emergency.assignedHospital.address}</Text>
              <Text style={styles.hospitalPhone}>{emergency.assignedHospital.phone}</Text>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={20} color="#9370DB" />
            <Text style={styles.cardTitle}>Timeline</Text>
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
                      <Text style={styles.timelineStatus}>{getStatusLabel(event.status)}</Text>
                      <Text style={styles.timelineTime}>
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </Text>
                      {event.note && <Text style={styles.timelineNote}>{event.note}</Text>}
                    </View>
                  </View>
                ))
            ) : (
              <Text style={styles.noTimelineText}>No timeline events yet</Text>
            )}
          </View>
        </View>

        {/* Cancel Button */}
        {emergency.status !== "completed" && emergency.status !== "cancelled" && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEmergency}>
            <Ionicons name="close-circle" size={20} color="#FFF" />
            <Text style={styles.cancelButtonText}>Cancel Emergency</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  map: {
    width: "100%",
    height: height * 0.4,
  },
  patientMarker: {
    width: 50,
    height: 50,
    backgroundColor: "#4A90E2",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  ambulanceMarker: {
    width: 60,
    height: 60,
    backgroundColor: "#FF3B30",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusBannerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  etaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  etaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginLeft: 4,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  bottomSheetContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  triageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },
  triageScore: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  symptomsContainer: {
    marginTop: 8,
  },
  symptomsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  symptomsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  symptomTag: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  symptomText: {
    fontSize: 12,
    color: "#4F46E5",
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  driverDetails: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  driverPhone: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  ambulanceInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  hospitalInfo: {
    gap: 8,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  hospitalAddress: {
    fontSize: 14,
    color: "#6B7280",
  },
  hospitalPhone: {
    fontSize: 14,
    color: "#4A90E2",
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  timelineTime: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  timelineNote: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
    fontStyle: "italic",
  },
  noTimelineText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 16,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    marginLeft: 8,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 24,
  },
  mapPlaceholderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  mapPlaceholderHint: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

export default EmergencyTrackingScreen;
