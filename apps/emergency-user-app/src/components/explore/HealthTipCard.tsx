import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HealthTip } from "../../services/exploreService";

interface HealthTipCardProps {
  tip: HealthTip;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 64; // Account for padding

export default function HealthTipCard({ tip }: HealthTipCardProps) {
  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      general: "#6B7280",
      emergency: "#EF4444",
      prevention: "#F59E0B",
      wellness: "#10B981",
    };
    return colors[category] || "#6B7280";
  };

  const getCategoryBg = (category: string): string => {
    const colors: { [key: string]: string } = {
      general: "#F3F4F6",
      emergency: "#FEE2E2",
      prevention: "#FEF3C7",
      wellness: "#D1FAE5",
    };
    return colors[category] || "#F3F4F6";
  };

  return (
    <View
      style={[styles.card, { backgroundColor: getCategoryBg(tip.category) }]}
    >
      <View style={styles.content}>
        <View
          style={[styles.iconContainer, { backgroundColor: tip.color + "20" }]}
        >
          <Ionicons name={tip.icon as any} size={28} color={tip.color} />
        </View>

        <View style={styles.textContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{tip.title}</Text>
            <View
              style={[styles.categoryBadge, { backgroundColor: "#FFFFFF" }]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(tip.category) },
                ]}
              >
                {tip.category}
              </Text>
            </View>
          </View>
          <Text style={styles.description}>{tip.description}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
});
