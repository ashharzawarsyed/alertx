import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { emergencyService, Emergency } from "../../services/emergencyService";
import { useAuthStore } from "../../store/authStore";

type FilterStatus = "all" | "active" | "completed" | "cancelled";

export default function EmergenciesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [filteredEmergencies, setFilteredEmergencies] = useState<Emergency[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("all");

  const fetchEmergencies = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await emergencyService.getEmergencies(1, 50);
      if (response.success && response.data) {
        setEmergencies(response.data.emergencies || []);
      }
    } catch {
      // Silent - auth errors are expected when not logged in
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEmergencies();
    }
  }, [fetchEmergencies, user]);

  useEffect(() => {
    // Filter emergencies based on selected filter
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

  const handleEmergencyPress = (emergency: Emergency) => {
    try {
      // Navigate to tracking screen for active emergencies
      if (["pending", "accepted", "in_progress"].includes(emergency.status)) {
        router.push({
          pathname: "/emergency/tracking" as any,
          params: { emergencyId: emergency._id },
        });
      } else {
        // Show details alert for completed/cancelled emergencies
        const aiPrediction = (emergency as any).aiPrediction;
        const detailsText = [
          `ID: ${emergency._id}`,
          ``,
          `Status: ${emergency.status.replace("_", " ").toUpperCase()}`,
          `Severity: ${emergency.severityLevel.toUpperCase()}`,
          `Triage Score: ${emergency.triageScore}/10`,
          ``,
          `Symptoms:`,
          ...emergency.symptoms.map((s) => `• ${s}`),
          ``,
          aiPrediction?.emergencyType ? `Emergency Type: ${aiPrediction.emergencyType}` : null,
          aiPrediction?.confidence ? `AI Confidence: ${Math.round(aiPrediction.confidence)}%` : null,
          ``,
          `Location: ${emergency.location.address || "Address not available"}`,
        ].filter(Boolean).join("\n");

        Alert.alert("Emergency Details", detailsText, [{ text: "OK" }]);
      }
    } catch (error) {
      console.error('Error handling emergency press:', error);
      Alert.alert(
        "Emergency Details",
        `Unable to load full details\n\nID: ${emergency._id}\nStatus: ${emergency.status}\nSeverity: ${emergency.severityLevel}`,
        [{ text: "OK" }]
      );
    }
  };

  const filters: { key: FilterStatus; label: string; icon: string }[] = [
    { key: "all", label: "All", icon: "list" },
    { key: "active", label: "Active", icon: "pulse" },
    { key: "completed", label: "Completed", icon: "checkmark-circle" },
    { key: "cancelled", label: "Cancelled", icon: "close-circle" },
  ];

  const getEmptyMessage = () => {
    switch (filter) {
      case "active":
        return "No active emergencies";
      case "completed":
        return "No completed emergencies";
      case "cancelled":
        return "No cancelled emergencies";
      default:
        return "No emergencies yet";
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="medical" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>{getEmptyMessage()}</Text>
      <Text style={styles.emptySubtitle}>
        Your emergency requests will appear here
      </Text>
    </View>
  );

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
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const renderItem = ({ item }: { item: Emergency }) => {
    const statusColor = getStatusColor(item.status);
    const severityColor = getSeverityColor(item.severityLevel);

    return (
      <TouchableOpacity
        style={styles.emergencyCard}
        onPress={() => handleEmergencyPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "15" },
            ]}
          >
            <Ionicons
              name={getStatusIcon(item.status)}
              size={14}
              color={statusColor}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.replace("_", " ").toUpperCase()}
            </Text>
          </View>
          <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.severityContainer}>
            <View
              style={[styles.severityDot, { backgroundColor: severityColor }]}
            />
            <Text style={styles.severityLabel}>
              {item.severityLevel.toUpperCase()}
            </Text>
            <Text style={styles.scoreBadge}>Score: {item.triageScore}/10</Text>
          </View>

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

  const renderHeader = () => (
    <View style={styles.filterContainer}>
      {filters.map((f) => (
        <TouchableOpacity
          key={f.key}
          onPress={() => setFilter(f.key)}
          style={[
            styles.filterButton,
            filter === f.key && styles.filterButtonActive,
          ]}
        >
          <Ionicons
            name={f.icon as any}
            size={18}
            color={filter === f.key ? "#ffffff" : "#6B7280"}
          />
          <Text
            style={[
              styles.filterText,
              filter === f.key && styles.filterTextActive,
            ]}
          >
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

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
            {emergencies.length} total request
            {emergencies.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="filter-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* List */}
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
    marginBottom: 20,
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
    gap: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
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
    fontFamily: "monospace",
  },
});
