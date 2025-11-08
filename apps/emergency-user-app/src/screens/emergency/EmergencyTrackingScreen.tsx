import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import { emergencyService, Emergency } from "../../services/emergencyService";

interface DriverLocation {
  latitude: number;
  longitude: number;
}

export default function EmergencyTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const emergencyId = params.emergencyId as string;

  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(
    null
  );
  const [eta, setEta] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const mapRef = useRef<MapView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for ambulance marker
  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, []);

  // Fetch emergency details
  const fetchEmergencyDetails = useCallback(async () => {
    try {
      const response = await emergencyService.getEmergencyDetails(emergencyId);

      if (response.success && response.data) {
        setEmergency(response.data.emergency);

        // Simulate driver location if driver is assigned
        if (
          response.data.emergency.assignedDriver &&
          response.data.emergency.status !== "pending"
        ) {
          // Simulate driver location near patient (in production, use real-time data)
          const patientLat = response.data.emergency.location.lat;
          const patientLng = response.data.emergency.location.lng;

          // Random offset for simulation (0.01 degrees ≈ 1km)
          const offset = 0.02;
          const simulatedLocation: DriverLocation = {
            latitude: patientLat + (Math.random() - 0.5) * offset,
            longitude: patientLng + (Math.random() - 0.5) * offset,
          };

          setDriverLocation(simulatedLocation);

          // Calculate ETA
          const calculatedEta = emergencyService.calculateETA(
            {
              lat: simulatedLocation.latitude,
              lng: simulatedLocation.longitude,
            },
            { lat: patientLat, lng: patientLng }
          );
          setEta(calculatedEta);

          // Fit map to show both markers
          setTimeout(() => {
            mapRef.current?.fitToCoordinates(
              [
                {
                  latitude: patientLat,
                  longitude: patientLng,
                },
                simulatedLocation,
              ],
              {
                edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                animated: true,
              }
            );
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error fetching emergency:", error);
      Alert.alert("Error", "Failed to load emergency details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [emergencyId]);

  useEffect(() => {
    fetchEmergencyDetails();

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchEmergencyDetails();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchEmergencyDetails]);

  const handleCallDriver = () => {
    if (emergency?.assignedDriver) {
      const phone = (emergency.assignedDriver as any).phone;
      if (phone) {
        Linking.openURL(`tel:${phone}`);
      }
    }
  };

  const handleCallHospital = () => {
    if (emergency?.assignedHospital) {
      const phone = (emergency.assignedHospital as any).phone;
      if (phone) {
        Linking.openURL(`tel:${phone}`);
      }
    }
  };

  const handleCancelEmergency = () => {
    Alert.alert(
      "Cancel Emergency",
      "Are you sure you want to cancel this emergency request? This cannot be undone.",
      [
        { text: "No, Keep Active", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await emergencyService.cancelEmergency(
                emergencyId,
                "Cancelled by patient"
              );

              if (response.success) {
                Alert.alert("Cancelled", "Emergency has been cancelled", [
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
        return "#3B82F6";
      case "in_progress":
        return "#8B5CF6";
      case "completed":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    return status.replace("_", " ").toUpperCase();
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
        <Text style={styles.errorSubtitle}>
          Unable to load emergency details
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle}>Emergency Tracking</Text>
          <Text style={styles.topBarSubtitle}>ID: {emergency._id.slice(-6)}</Text>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            setRefreshing(true);
            fetchEmergencyDetails();
          }}
        >
          <Ionicons name="refresh" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: emergency.location.lat,
            longitude: emergency.location.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {/* Patient Location Marker */}
          <Marker
            coordinate={{
              latitude: emergency.location.lat,
              longitude: emergency.location.lng,
            }}
            title="Your Location"
            description={emergency.location.address || "Emergency Location"}
          >
            <View style={styles.patientMarker}>
              <Ionicons name="person" size={24} color="#FFFFFF" />
            </View>
          </Marker>

          {/* Ambulance Marker */}
          {driverLocation && (
            <>
              <Marker
                coordinate={driverLocation}
                title="Ambulance"
                description={
                  emergency.assignedDriver
                    ? (emergency.assignedDriver as any).name
                    : "Ambulance"
                }
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <Animated.View
                  style={[
                    styles.ambulanceMarker,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <Ionicons name="medkit" size={24} color="#FFFFFF" />
                </Animated.View>
              </Marker>

              {/* Route */}
              <MapViewDirections
                origin={driverLocation}
                destination={{
                  latitude: emergency.location.lat,
                  longitude: emergency.location.lng,
                }}
                apikey="YOUR_GOOGLE_MAPS_API_KEY" // Replace with actual API key
                strokeWidth={4}
                strokeColor="#EF4444"
                optimizeWaypoints
                onError={(error) =>
                  console.log("Directions error:", error)
                }
              />
            </>
          )}
        </MapView>

        {/* ETA Overlay */}
        {driverLocation && eta > 0 && (
          <View style={styles.etaOverlay}>
            <Ionicons name="time" size={20} color="#FFFFFF" />
            <Text style={styles.etaText}>ETA: {eta} min</Text>
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
                {getStatusText(emergency.status)}
              </Text>
            </View>
            {emergency.severityLevel && (
              <View
                style={[
                  styles.severityBadge,
                  {
                    backgroundColor:
                      emergency.severityLevel === "critical"
                        ? "#DC2626"
                        : emergency.severityLevel === "high"
                          ? "#EF4444"
                          : emergency.severityLevel === "medium"
                            ? "#F59E0B"
                            : "#10B981",
                  },
                ]}
              >
                <Text style={styles.severityText}>
                  {emergency.severityLevel.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

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
                  <Text style={styles.driverSubtext}>
                    {(emergency.assignedDriver as any).driverInfo
                      ?.ambulanceNumber || "Ambulance"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={handleCallDriver}
                >
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Hospital Info Card */}
          {emergency.assignedHospital && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="business" size={24} color="#3B82F6" />
                <Text style={styles.cardTitle}>Assigned Hospital</Text>
              </View>
              <View style={styles.hospitalInfo}>
                <View style={styles.hospitalDetails}>
                  <Text style={styles.hospitalName}>
                    {(emergency.assignedHospital as any).name ||
                      "Hospital"}
                  </Text>
                  <Text style={styles.hospitalAddress}>
                    {(emergency.assignedHospital as any).address ||
                      "Address not available"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.callButton, { backgroundColor: "#3B82F6" }]}
                  onPress={handleCallHospital}
                >
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                </TouchableOpacity>
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
              {/* Request Time */}
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: "#10B981" }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Emergency Requested</Text>
                  <Text style={styles.timelineTime}>
                    {new Date(emergency.requestTime).toLocaleTimeString()}
                  </Text>
                </View>
              </View>

              {/* Response Time */}
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

              {/* Pickup Time */}
              {emergency.pickupTime && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: "#8B5CF6" }]} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Patient Picked Up</Text>
                    <Text style={styles.timelineTime}>
                      {new Date(emergency.pickupTime).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Hospital Time */}
              {emergency.hospitalTime && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: "#F59E0B" }]} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Arrived at Hospital</Text>
                    <Text style={styles.timelineTime}>
                      {new Date(emergency.hospitalTime).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Completed */}
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
            </View>
          </View>

          {/* Emergency Details */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color="#6B7280" />
              <Text style={styles.cardTitle}>Emergency Details</Text>
            </View>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Symptoms</Text>
                <Text style={styles.detailValue}>
                  {emergency.symptoms.join(", ")}
                </Text>
              </View>
              {emergency.description && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{emergency.description}</Text>
                </View>
              )}
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Triage Score</Text>
                <Text style={styles.detailValue}>
                  {emergency.triageScore}/10
                </Text>
              </View>
            </View>
          </View>

          {/* Cancel Button */}
          {["pending", "accepted"].includes(emergency.status) && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelEmergency}
            >
              <Ionicons name="close-circle" size={20} color="#FFFFFF" />
              <Text style={styles.cancelButtonText}>Cancel Emergency</Text>
            </TouchableOpacity>
          )}

          {/* Bottom Padding */}
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
    padding: 24,
    backgroundColor: "#FFFFFF",
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
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },

  // Hospital Info
  hospitalInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hospitalDetails: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  hospitalAddress: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
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

  // Details
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
  },

  // Cancel Button
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
