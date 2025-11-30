import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { emergencyService, Emergency } from "../../services/emergencyService";
import { useAuthStore } from "../../store/authStore";
import Config from "../../config/config";
import CrossPlatformMap, { Marker } from "../../components/CrossPlatformMap";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

type FilterStatus = "all" | "active" | "completed" | "cancelled";
type ViewMode = "list" | "map";

// Extended Emergency type with tracking data
interface ExtendedEmergency extends Emergency {
  assignedAmbulance?: {
    _id: string;
    vehicleNumber: string;
    currentLocation?: {
      coordinates: [number, number];
    };
  };
  estimatedArrival?: string;
  distance?: number;
}

export default function EmergenciesScreen() {
  const { user } = useAuthStore();
  const [emergencies, setEmergencies] = useState<ExtendedEmergency[]>([]);
  const [filteredEmergencies, setFilteredEmergencies] = useState<ExtendedEmergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedEmergency, setSelectedEmergency] = useState<ExtendedEmergency | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const fetchEmergencies = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await emergencyService.getEmergencies(1, 50);
      if (response.success && response.data) {
        const emergenciesData = response.data.emergencies || [];
        
        // Calculate ETA for active emergencies
        const enrichedEmergencies = await Promise.all(
          emergenciesData.map(async (emergency) => {
            if (["pending", "accepted", "in_progress"].includes(emergency.status)) {
              try {
                const details = await emergencyService.getEmergencyById(emergency._id);
                if (details.success && details.data) {
                  const fullData = details.data.emergency as any;
                  
                  // Calculate ETA if ambulance assigned
                  if (fullData.assignedAmbulance?.currentLocation && emergency.location) {
                    const distance = calculateDistance(
                      fullData.assignedAmbulance.currentLocation.coordinates,
                      [emergency.location.lng, emergency.location.lat]
                    );
                    const etaMinutes = Math.round((distance / 40) * 60); // Assume 40 km/h
                    
                    return {
                      ...emergency,
                      assignedAmbulance: fullData.assignedAmbulance,
                      estimatedArrival: `${etaMinutes} min`,
                      distance: distance,
                    };
                  }
                }
              } catch (error) {
                console.error("Error fetching emergency details:", error);
              }
            }
            return emergency;
          })
        );
        
        setEmergencies(enrichedEmergencies);
      }
    } catch (error) {
      console.error("Error fetching emergencies:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Calculate distance using Haversine formula
  const calculateDistance = (coords1: [number, number], coords2: [number, number]) => {
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
    return R * c;
  };

  useEffect(() => {
    if (user) {
      fetchEmergencies();
    }
  }, [fetchEmergencies, user]);

  useEffect(() => {
    let filtered = emergencies;

    switch (filter) {
      case "active":
        filtered = emergencies.filter((e) =>
          ["pending", "accepted", "in_progress"].includes(e.status)
        );
        break;
      case "completed":
        filtered = emergencies.filter((e) => e.status === "completed");
        break;
      case "cancelled":
        filtered = emergencies.filter((e) => e.status === "cancelled");
        break;
      default:
        filtered = emergencies;
    }

    setFilteredEmergencies(filtered);
  }, [emergencies, filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEmergencies();
    setRefreshing(false);
  };

  const openModal = (emergency: ExtendedEmergency) => {
    setSelectedEmergency(emergency);
    setModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedEmergency(null);
    });
  };

  const handleCancelEmergency = async (emergencyId: string) => {
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
              const response = await emergencyService.cancelEmergency(
                emergencyId,
                "Cancelled by user"
              );
              
              if (response.success) {
                Alert.alert("Success", "Emergency cancelled successfully. You can now request a new emergency.");
                closeModal();
                await fetchEmergencies();
              } else {
                Alert.alert("Error", response.message || "Failed to cancel emergency");
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to cancel emergency");
            }
          },
        },
      ]
    );
  };

  const handleTrackEmergency = (emergency: ExtendedEmergency) => {
    closeModal();
    router.push({
      pathname: "/emergency/tracking" as any,
      params: { emergencyId: emergency._id },
    });
  };

  const filters: { key: FilterStatus; label: string; icon: string }[] = [
    { key: "all", label: "All", icon: "list" },
    { key: "active", label: "Active", icon: "pulse" },
    { key: "completed", label: "Completed", icon: "checkmark-circle" },
    { key: "cancelled", label: "Cancelled", icon: "close-circle" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "accepted":
      case "in_progress":
        return "#3B82F6";
      case "completed":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return "#9CA3AF";
    }
  };

  const getStatusIcon = (status: string): any => {
    switch (status) {
      case "pending":
        return "time";
      case "accepted":
      case "in_progress":
        return "medical";
      case "completed":
        return "checkmark-circle";
      case "cancelled":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
        return "#9CA3AF";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="medical" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>
        {filter === "all" ? "No emergencies yet" : `No ${filter} emergencies`}
      </Text>
      <Text style={styles.emptySubtitle}>
        Your emergency requests will appear here
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: ExtendedEmergency }) => {
    const statusColor = getStatusColor(item.status);
    const severityColor = getSeverityColor(item.severityLevel);
    const isActive = ["pending", "accepted", "in_progress"].includes(item.status);

    return (
      <TouchableOpacity
        style={styles.emergencyCard}
        onPress={() => openModal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.replace("_", " ").toUpperCase()}
            </Text>
          </View>
          <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.severityContainer}>
            <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
            <Text style={styles.severityLabel}>{item.severityLevel.toUpperCase()}</Text>
            <Text style={styles.scoreBadge}>Score: {item.triageScore}/10</Text>
          </View>

          {/* ETA Display */}
          {isActive && item.estimatedArrival && (
            <View style={styles.etaContainer}>
              <Ionicons name="time-outline" size={16} color="#3B82F6" />
              <Text style={styles.etaText}>ETA: {item.estimatedArrival}</Text>
              {item.distance && (
                <Text style={styles.distanceText}>• {item.distance.toFixed(1)} km</Text>
              )}
            </View>
          )}

          {item.symptoms && item.symptoms.length > 0 && (
            <View style={styles.symptomsContainer}>
              <Text style={styles.symptomsLabel}>Symptoms:</Text>
              <Text style={styles.symptomsText} numberOfLines={2}>
                {item.symptoms.join(", ")}
              </Text>
            </View>
          )}

          {item.location?.address && (
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color="#9CA3AF" />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.location.address}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.idText}>ID: {item._id.slice(-8)}</Text>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderMapView = () => {
    const activeEmergencies = filteredEmergencies.filter((e) =>
      ["pending", "accepted", "in_progress"].includes(e.status)
    );

    // Calculate center from emergencies with locations
    const emergenciesWithLocation = activeEmergencies.filter(
      (e) => e.location?.lat && e.location?.lng
    );

    // Use user location or default to Islamabad if no emergencies
    let centerLat = 33.6844; // Default: Islamabad
    let centerLng = 73.0479;
    
    if (emergenciesWithLocation.length > 0) {
      centerLat =
        emergenciesWithLocation.reduce(
          (sum, e) => sum + e.location.lat,
          0
        ) / emergenciesWithLocation.length;
      centerLng =
        emergenciesWithLocation.reduce(
          (sum, e) => sum + e.location.lng,
          0
        ) / emergenciesWithLocation.length;
    } else if (user?.location?.lat && user?.location?.lng) {
      // Use user's location if available
      centerLat = user.location.lat;
      centerLng = user.location.lng;
    }

    return (
      <View style={styles.mapContainer}>
        {/* Cross-Platform Map */}
        <CrossPlatformMap
          initialRegion={{
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {/* Patient Markers */}
          {emergenciesWithLocation.map((emergency) => (
            <Marker
              key={`patient-${emergency._id}`}
              coordinate={{
                latitude: emergency.location.lat,
                longitude: emergency.location.lng,
              }}
              title="Emergency Location"
              description={emergency.description || "Patient location"}
              pinColor="#FF3B30"
            >
              <View style={styles.patientMarker}>
                <Ionicons name="person" size={20} color="#FFF" />
              </View>
            </Marker>
          ))}

          {/* Ambulance Markers */}
          {activeEmergencies
            .filter((e) => e.assignedAmbulance?.currentLocation)
            .map((emergency) => (
              <Marker
                key={`ambulance-${emergency._id}`}
                coordinate={{
                  latitude: emergency.assignedAmbulance!.currentLocation!.coordinates[1],
                  longitude: emergency.assignedAmbulance!.currentLocation!.coordinates[0],
                }}
                title="Ambulance"
                description="En route"
                pinColor="#34D399"
              >
                <View style={styles.ambulanceMarker}>
                  <Ionicons name="medical" size={20} color="#FFF" />
                </View>
              </Marker>
            ))}
        </CrossPlatformMap>

        {/* Map Overlay Card */}
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayTitle}>
            {filteredEmergencies.length === 0 ? "No Emergencies" : "Active Emergencies"}
          </Text>
          <Text style={styles.mapOverlaySubtitle}>
            {filteredEmergencies.length === 0 
              ? "Map showing your area" 
              : `${activeEmergencies.length} active emergency request${activeEmergencies.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      <View style={styles.filterContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterButton, filter === f.key && styles.filterButtonActive]}
          >
            <Ionicons
              name={f.icon as any}
              size={18}
              color={filter === f.key ? "#ffffff" : "#6B7280"}
            />
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === "list" && styles.viewModeActive]}
          onPress={() => setViewMode("list")}
        >
          <Ionicons name="list" size={20} color={viewMode === "list" ? "#FFF" : "#6B7280"} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === "map" && styles.viewModeActive]}
          onPress={() => setViewMode("map")}
        >
          <Ionicons name="map" size={20} color={viewMode === "map" ? "#FFF" : "#6B7280"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDetailModal = () => {
    if (!selectedEmergency) return null;

    const statusColor = getStatusColor(selectedEmergency.status);
    const severityColor = getSeverityColor(selectedEmergency.severityLevel);
    const isActive = ["pending", "accepted", "in_progress"].includes(selectedEmergency.status);
    const canCancel = isActive;

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Handle Bar */}
            <TouchableOpacity onPress={closeModal} activeOpacity={0.8}>
              <View style={styles.modalHandle} />
            </TouchableOpacity>

              <ScrollView
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* Header */}
                <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Emergency Details</Text>
                  <Text style={styles.modalId}>ID: {selectedEmergency._id.slice(-12)}</Text>
                </View>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Status Banner */}
              <View style={[styles.statusBanner, { backgroundColor: statusColor }]}>
                <Ionicons name={getStatusIcon(selectedEmergency.status)} size={20} color="#FFF" />
                <Text style={styles.statusBannerText}>
                  {selectedEmergency.status.replace("_", " ").toUpperCase()}
                </Text>
              </View>

              {/* ETA Card */}
              {isActive && selectedEmergency.estimatedArrival && (
                <View style={styles.etaCard}>
                  <View style={styles.etaCardHeader}>
                    <Ionicons name="time" size={24} color="#3B82F6" />
                    <Text style={styles.etaCardTitle}>Estimated Arrival</Text>
                  </View>
                  <Text style={styles.etaCardTime}>{selectedEmergency.estimatedArrival}</Text>
                  {selectedEmergency.distance && (
                    <Text style={styles.etaCardDistance}>
                      Distance: {selectedEmergency.distance.toFixed(2)} km
                    </Text>
                  )}
                </View>
              )}

              {/* Triage Info */}
              <View style={styles.detailCard}>
                <View style={styles.detailCardHeader}>
                  <Ionicons name="pulse" size={20} color={severityColor} />
                  <Text style={styles.detailCardTitle}>Triage Assessment</Text>
                </View>
                <View style={styles.triageRow}>
                  <View style={[styles.severityBadgeLarge, { backgroundColor: severityColor }]}>
                    <Text style={styles.severityBadgeText}>
                      {selectedEmergency.severityLevel.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.triageScore}>
                    Score: {selectedEmergency.triageScore}/10
                  </Text>
                </View>
              </View>

              {/* Symptoms */}
              {selectedEmergency.symptoms && selectedEmergency.symptoms.length > 0 && (
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <Ionicons name="list" size={20} color="#F59E0B" />
                    <Text style={styles.detailCardTitle}>Symptoms</Text>
                  </View>
                  <View style={styles.symptomsList}>
                    {selectedEmergency.symptoms.map((symptom, index) => (
                      <View key={index} style={styles.symptomItem}>
                        <Ionicons name="ellipse" size={6} color="#6B7280" />
                        <Text style={styles.symptomItemText}>{symptom}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Location */}
              {selectedEmergency.location?.address && (
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <Ionicons name="location" size={20} color="#10B981" />
                    <Text style={styles.detailCardTitle}>Location</Text>
                  </View>
                  <Text style={styles.locationDetailText}>
                    {selectedEmergency.location.address}
                  </Text>
                </View>
              )}

              {/* Ambulance Info */}
              {selectedEmergency.assignedAmbulance && (
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <Ionicons name="car-sport" size={20} color="#3B82F6" />
                    <Text style={styles.detailCardTitle}>Assigned Ambulance</Text>
                  </View>
                  <Text style={styles.ambulanceNumber}>
                    {selectedEmergency.assignedAmbulance.vehicleNumber}
                  </Text>
                </View>
              )}

              {/* Driver Info */}
              {selectedEmergency.assignedDriver && (
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <Ionicons name="person-circle" size={20} color="#8B5CF6" />
                    <Text style={styles.detailCardTitle}>Driver</Text>
                  </View>
                  <Text style={styles.driverName}>{selectedEmergency.assignedDriver.name}</Text>
                  <Text style={styles.driverPhone}>{selectedEmergency.assignedDriver.phone}</Text>
                </View>
              )}

              {/* Hospital Info */}
              {selectedEmergency.assignedHospital && (
                <View style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <Ionicons name="medical" size={20} color="#EF4444" />
                    <Text style={styles.detailCardTitle}>Destination Hospital</Text>
                  </View>
                  <Text style={styles.hospitalName}>
                    {selectedEmergency.assignedHospital.name}
                  </Text>
                  <Text style={styles.hospitalAddress}>
                    {selectedEmergency.assignedHospital.address}
                  </Text>
                  <Text style={styles.hospitalPhone}>
                    {selectedEmergency.assignedHospital.phone}
                  </Text>
                </View>
              )}

              {/* Timestamps */}
              <View style={styles.detailCard}>
                <View style={styles.detailCardHeader}>
                  <Ionicons name="time-outline" size={20} color="#6B7280" />
                  <Text style={styles.detailCardTitle}>Timeline</Text>
                </View>
                <View style={styles.timestampRow}>
                  <Text style={styles.timestampLabel}>Created:</Text>
                  <Text style={styles.timestampValue}>
                    {new Date(selectedEmergency.createdAt).toLocaleString()}
                  </Text>
                </View>
                {selectedEmergency.responseTime && (
                  <View style={styles.timestampRow}>
                    <Text style={styles.timestampLabel}>Responded:</Text>
                    <Text style={styles.timestampValue}>
                      {new Date(selectedEmergency.responseTime).toLocaleString()}
                    </Text>
                  </View>
                )}
                {selectedEmergency.completedTime && (
                  <View style={styles.timestampRow}>
                    <Text style={styles.timestampLabel}>Completed:</Text>
                    <Text style={styles.timestampValue}>
                      {new Date(selectedEmergency.completedTime).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {isActive && (
                  <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() => handleTrackEmergency(selectedEmergency)}
                  >
                    <Ionicons name="navigate" size={20} color="#FFF" />
                    <Text style={styles.trackButtonText}>Track on Map</Text>
                  </TouchableOpacity>
                )}

                {canCancel && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelEmergency(selectedEmergency._id)}
                  >
                    <Ionicons name="close-circle" size={20} color="#FFF" />
                    <Text style={styles.cancelButtonText}>Cancel Emergency</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading emergencies...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appName}>Emergencies</Text>
          <Text style={styles.subtitle}>
            {emergencies.length} total request{emergencies.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === "list" ? (
        <FlatList
          data={filteredEmergencies}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#EF4444"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={{ flex: 1 }}>
          {renderHeader()}
          {renderMapView()}
        </View>
      )}

      {/* Detail Modal */}
      {renderDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: "#111827",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  viewModeContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  viewModeActive: {
    backgroundColor: "#111827",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#9CA3AF",
    textAlign: "center",
  },
  emergencyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 12,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  severityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  severityLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    letterSpacing: 0.5,
  },
  scoreBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    marginLeft: 8,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  etaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  etaText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 6,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  symptomsContainer: {
    marginBottom: 10,
  },
  symptomsLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  symptomsText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#374151",
    lineHeight: 18,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#9CA3AF",
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F9FAFB",
  },
  idText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D1D5DB",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
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
  patientMarker: {
    width: 44,
    height: 44,
    backgroundColor: "#3B82F6",
    borderRadius: 22,
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
    width: 52,
    height: 52,
    backgroundColor: "#EF4444",
    borderRadius: 26,
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
  mapOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapOverlayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  mapOverlaySubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 9999,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  modalId: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  etaCard: {
    backgroundColor: "#EFF6FF",
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  etaCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  etaCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
  },
  etaCardTime: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  etaCardDistance: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  detailCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  detailCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  detailCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  triageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  severityBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  severityBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  triageScore: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  symptomsList: {
    gap: 8,
  },
  symptomItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  symptomItemText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#374151",
    flex: 1,
  },
  locationDetailText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#374151",
    lineHeight: 20,
  },
  ambulanceNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    marginBottom: 4,
  },
  hospitalPhone: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3B82F6",
  },
  timestampRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timestampLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  timestampValue: {
    fontSize: 13,
    fontWeight: "400",
    color: "#374151",
  },
  actionButtons: {
    paddingHorizontal: 24,
    gap: 12,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});
