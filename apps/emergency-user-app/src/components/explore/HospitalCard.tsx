import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Hospital } from "../../services/exploreService";

interface HospitalCardProps {
  hospital: Hospital;
  onPress: () => void;
}

export default function HospitalCard({ hospital, onPress }: HospitalCardProps) {
  const totalAvailable =
    (hospital.availableBeds?.general || 0) +
    (hospital.availableBeds?.icu || 0) +
    (hospital.availableBeds?.emergency || 0);

  const hasAvailability = totalAvailable > 0;

  const getTypeColor = (type: string): string => {
    const typeColors: { [key: string]: string } = {
      "General Hospital": "#3B82F6",
      "Specialty Hospital": "#8B5CF6",
      "Emergency Center": "#EF4444",
      "Urgent Care": "#F59E0B",
      "Trauma Center": "#DC2626",
      "Children's Hospital": "#EC4899",
    };
    return typeColors[type] || "#6B7280";
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.typeIcon,
              { backgroundColor: getTypeColor(hospital.type) + "20" },
            ]}
          >
            <Ionicons
              name="business"
              size={20}
              color={getTypeColor(hospital.type)}
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {hospital.name}
            </Text>
            <Text style={styles.type}>{hospital.type}</Text>
          </View>
        </View>
        {hospital.operatingHours?.isOpen24x7 && (
          <View style={styles.badge24}>
            <Text style={styles.badge24Text}>24/7</Text>
          </View>
        )}
      </View>

      {/* Distance & Rating */}
      <View style={styles.metaRow}>
        {hospital.distance !== undefined && (
          <View style={styles.metaItem}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              {hospital.distance.toFixed(1)} km away
            </Text>
          </View>
        )}
        <View style={styles.metaItem}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.metaText}>
            {hospital.rating?.average.toFixed(1) || "N/A"} (
            {hospital.rating?.count || 0})
          </Text>
        </View>
      </View>

      {/* Bed Availability */}
      <View style={styles.bedsContainer}>
        <View style={styles.bedsHeader}>
          <Text style={styles.bedsTitle}>Available Beds</Text>
          <View
            style={[
              styles.availabilityBadge,
              {
                backgroundColor: hasAvailability ? "#D1FAE5" : "#FEE2E2",
              },
            ]}
          >
            <View
              style={[
                styles.availabilityDot,
                {
                  backgroundColor: hasAvailability ? "#10B981" : "#EF4444",
                },
              ]}
            />
            <Text
              style={[
                styles.availabilityText,
                {
                  color: hasAvailability ? "#065F46" : "#991B1B",
                },
              ]}
            >
              {hasAvailability ? "Available" : "Full"}
            </Text>
          </View>
        </View>

        <View style={styles.bedsGrid}>
          <View style={styles.bedItem}>
            <Text style={styles.bedCount}>
              {hospital.availableBeds?.general || 0}
            </Text>
            <Text style={styles.bedLabel}>General</Text>
          </View>
          <View style={styles.bedItem}>
            <Text style={styles.bedCount}>
              {hospital.availableBeds?.icu || 0}
            </Text>
            <Text style={styles.bedLabel}>ICU</Text>
          </View>
          <View style={styles.bedItem}>
            <Text style={styles.bedCount}>
              {hospital.availableBeds?.emergency || 0}
            </Text>
            <Text style={styles.bedLabel}>Emergency</Text>
          </View>
        </View>
      </View>

      {/* Facilities */}
      {hospital.facilities && hospital.facilities.length > 0 && (
        <View style={styles.facilities}>
          <Text style={styles.facilitiesLabel}>Facilities:</Text>
          <View style={styles.facilitiesTags}>
            {hospital.facilities.slice(0, 3).map((facility, index) => (
              <View key={index} style={styles.facilityTag}>
                <Text style={styles.facilityText}>
                  {facility.replace(/_/g, " ")}
                </Text>
              </View>
            ))}
            {hospital.facilities.length > 3 && (
              <View style={styles.facilityTag}>
                <Text style={styles.facilityText}>
                  +{hospital.facilities.length - 3} more
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="call" size={16} color="#10B981" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="navigate" size={16} color="#3B82F6" />
          <Text style={styles.actionText}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="information-circle" size={16} color="#6B7280" />
          <Text style={styles.actionText}>Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  type: {
    fontSize: 13,
    color: "#6B7280",
  },
  badge24: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badge24Text: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  bedsContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  bedsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bedsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  bedsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bedItem: {
    alignItems: "center",
    flex: 1,
  },
  bedCount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  bedLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  facilities: {
    marginBottom: 12,
  },
  facilitiesLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },
  facilitiesTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  facilityTag: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  facilityText: {
    fontSize: 11,
    color: "#6B21A8",
    textTransform: "capitalize",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    justifyContent: "center",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
});
