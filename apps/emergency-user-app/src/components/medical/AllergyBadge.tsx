import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AllergyBadgeProps {
  allergen: string;
  severity: "mild" | "moderate" | "severe" | "life-threatening";
  reaction?: string;
  onPress?: () => void;
  showDelete?: boolean;
  onDelete?: () => void;
}

export const AllergyBadge: React.FC<AllergyBadgeProps> = ({
  allergen,
  severity,
  reaction,
  onPress,
  showDelete = false,
  onDelete,
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case "mild":
        return { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" };
      case "moderate":
        return { bg: "#FED7AA", text: "#9A3412", border: "#FDBA74" };
      case "severe":
        return { bg: "#FECACA", text: "#991B1B", border: "#FCA5A5" };
      case "life-threatening":
        return { bg: "#FEE2E2", text: "#7F1D1D", border: "#FCA5A5" };
      default:
        return { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" };
    }
  };

  const colors = getSeverityColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.container,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.content}>
        <Ionicons name="alert-circle" size={16} color={colors.text} />
        <View style={styles.textContainer}>
          <Text
            style={[styles.allergen, { color: colors.text }]}
            numberOfLines={1}
          >
            {allergen}
          </Text>
          {reaction && (
            <Text
              style={[styles.reaction, { color: colors.text }]}
              numberOfLines={1}
            >
              {reaction}
            </Text>
          )}
        </View>
        <View style={[styles.severityBadge, { backgroundColor: colors.text }]}>
          <Text style={styles.severityText}>{severity.toUpperCase()}</Text>
        </View>
      </View>
      {showDelete && onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={20} color={colors.text} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  allergen: {
    fontSize: 15,
    fontWeight: "600",
  },
  reaction: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  deleteButton: {
    marginLeft: 8,
  },
});
