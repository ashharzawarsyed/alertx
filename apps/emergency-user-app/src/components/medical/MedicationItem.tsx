import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MedicationItemProps {
  name: string;
  dosage?: string;
  frequency?: string;
  isActive?: boolean;
  onPress?: () => void;
  showDelete?: boolean;
  onDelete?: () => void;
}

export const MedicationItem: React.FC<MedicationItemProps> = ({
  name,
  dosage,
  frequency,
  isActive = true,
  onPress,
  showDelete = false,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.container, !isActive && styles.inactiveContainer]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name="medical"
          size={20}
          color={isActive ? "#3B82F6" : "#9CA3AF"}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, !isActive && styles.inactiveName]}>
            {name}
          </Text>
          {!isActive && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>INACTIVE</Text>
            </View>
          )}
        </View>

        {(dosage || frequency) && (
          <View style={styles.details}>
            {dosage && (
              <View style={styles.detailItem}>
                <Ionicons name="flask-outline" size={14} color="#6B7280" />
                <Text style={styles.detailText}>{dosage}</Text>
              </View>
            )}
            {frequency && (
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.detailText}>{frequency}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {showDelete && onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  inactiveContainer: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  inactiveName: {
    color: "#6B7280",
  },
  inactiveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#FEE2E2",
  },
  inactiveBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#DC2626",
    letterSpacing: 0.5,
  },
  details: {
    flexDirection: "row",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#6B7280",
  },
  deleteButton: {
    padding: 8,
  },
});
