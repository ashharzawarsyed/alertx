import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

interface StatusBadgeProps {
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "medium",
  style,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          backgroundColor: "#FEF3C7",
          textColor: "#92400E",
          icon: "⏳",
        };
      case "accepted":
        return {
          label: "Accepted",
          backgroundColor: "#DBEAFE",
          textColor: "#1E40AF",
          icon: "✓",
        };
      case "in_progress":
        return {
          label: "In Progress",
          backgroundColor: "#E0E7FF",
          textColor: "#3730A3",
          icon: "🚑",
        };
      case "completed":
        return {
          label: "Completed",
          backgroundColor: "#D1FAE5",
          textColor: "#065F46",
          icon: "✓",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          backgroundColor: "#FEE2E2",
          textColor: "#991B1B",
          icon: "✕",
        };
      default:
        return {
          label: status,
          backgroundColor: "#F3F4F6",
          textColor: "#374151",
          icon: "•",
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { paddingVertical: 4, paddingHorizontal: 8, fontSize: 12 };
      case "large":
        return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 16 };
      default:
        return { paddingVertical: 6, paddingHorizontal: 12, fontSize: 14 };
    }
  };

  const config = getStatusConfig();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: config.textColor, fontSize: sizeStyles.fontSize },
        ]}
      >
        {config.icon} {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontWeight: "600",
  },
});
