import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
  showIcon?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title = "AlertX",
  subtitle = "Emergency Response System",
  showIcon = true,
}) => {
  return (
    <LinearGradient
      colors={["#EF4444", "#DC2626", "#B91C1C"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.content}>
          {showIcon && (
            <View style={styles.iconContainer}>
              <Ionicons name="medical" size={48} color="#FFFFFF" />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 60,
  },
  safeArea: {
    paddingTop: 20,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
});
