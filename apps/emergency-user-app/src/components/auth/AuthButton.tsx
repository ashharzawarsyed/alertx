import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = "primary",
  icon,
  fullWidth = true,
}) => {
  const isDisabled = disabled || isLoading;

  if (variant === "primary") {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          fullWidth && styles.fullWidth,
          isDisabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isLoading ? ["#9CA3AF", "#6B7280"] : ["#EF4444", "#DC2626"]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingDot} />
              <Text style={styles.primaryText}>{title}...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.primaryText}>{title}</Text>
              {icon && <Ionicons name={icon} size={20} color="#FFFFFF" />}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === "outline") {
    return (
      <TouchableOpacity
        style={[
          styles.outlineButton,
          fullWidth && styles.fullWidth,
          isDisabled && styles.outlineButtonDisabled,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <Text style={styles.outlineText}>{title}</Text>
        {icon && <Ionicons name={icon} size={20} color="#EF4444" />}
      </TouchableOpacity>
    );
  }

  // Secondary variant
  return (
    <TouchableOpacity
      style={[styles.secondaryButton, fullWidth && styles.fullWidth]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <Text style={styles.secondaryText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fullWidth: {
    width: "100%",
  },
  buttonDisabled: {
    shadowOpacity: 0.1,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  primaryText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#EF4444",
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  outlineButtonDisabled: {
    borderColor: "#E5E7EB",
    opacity: 0.5,
  },
  outlineText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#EF4444",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
