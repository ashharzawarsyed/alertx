import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";
import { Emergency } from "../../services/emergencyService";

interface EmergencyCardProps {
  emergency: Emergency;
  onPress?: () => void;
  showDetails?: boolean;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({
  emergency,
  onPress,
  showDetails = false,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#DC2626";
      case "high":
        return "#EA580C";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return "alert-circle";
      case "high":
        return "warning";
      case "medium":
        return "information-circle";
      case "low":
        return "checkmark-circle";
      default:
        return "help-circle";
    }
  };

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={getSeverityIcon(emergency.severityLevel)}
            size={24}
            color={getSeverityColor(emergency.severityLevel)}
          />
          <View style={styles.headerText}>
            <Text style={styles.title}>Emergency Request</Text>
            <Text style={styles.date}>{formatDate(emergency.requestTime)}</Text>
          </View>
        </View>
        <StatusBadge status={emergency.status} size="small" />
      </View>

      {/* Symptoms */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Symptoms</Text>
        <View style={styles.symptomsContainer}>
          {emergency.symptoms.slice(0, 3).map((symptom, index) => (
            <View key={index} style={styles.symptomTag}>
              <Text style={styles.symptomText}>{symptom}</Text>
            </View>
          ))}
          {emergency.symptoms.length > 3 && (
            <View style={styles.symptomTag}>
              <Text style={styles.symptomText}>
                +{emergency.symptoms.length - 3} more
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Severity Level */}
      <View style={styles.severityRow}>
        <View style={styles.severityItem}>
          <Text style={styles.severityLabel}>Severity</Text>
          <Text
            style={[
              styles.severityValue,
              { color: getSeverityColor(emergency.severityLevel) },
            ]}
          >
            {emergency.severityLevel.toUpperCase()}
          </Text>
        </View>
        <View style={styles.severityItem}>
          <Text style={styles.severityLabel}>Triage Score</Text>
          <Text
            style={[
              styles.severityValue,
              { color: getSeverityColor(emergency.severityLevel) },
            ]}
          >
            {emergency.triageScore.toFixed(1)}/10
          </Text>
        </View>
      </View>

      {/* Additional Details (only if showDetails is true) */}
      {showDetails && (
        <>
          {/* Assigned Driver */}
          {emergency.assignedDriver && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Assigned Driver</Text>
              <View style={styles.driverInfo}>
                <Ionicons name="person" size={16} color="#6B7280" />
                <Text style={styles.driverText}>
                  {emergency.assignedDriver.name} •{" "}
                  {emergency.assignedDriver.driverInfo.ambulanceNumber}
                </Text>
              </View>
            </View>
          )}

          {/* Assigned Hospital */}
          {emergency.assignedHospital && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Assigned Hospital</Text>
              <View style={styles.hospitalInfo}>
                <Ionicons name="medical" size={16} color="#6B7280" />
                <Text style={styles.hospitalText}>
                  {emergency.assignedHospital.name}
                </Text>
              </View>
            </View>
          )}

          {/* Location */}
          {emergency.location.address && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Location</Text>
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text style={styles.locationText} numberOfLines={2}>
                  {emergency.location.address}
                </Text>
              </View>
            </View>
          )}
        </>
      )}

      {/* Action Hint */}
      {onPress && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Tap for details</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  symptomsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  symptomTag: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  symptomText: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "500",
  },
  severityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 4,
  },
  severityItem: {
    flex: 1,
  },
  severityLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  severityValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
  },
  driverText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
  },
  hospitalInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
  },
  hospitalText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginRight: 4,
  },
});
