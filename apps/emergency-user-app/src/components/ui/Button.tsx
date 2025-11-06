import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? "#FFFFFF" : "#3B82F6"}
            style={styles.loader}
          />
        ) : (
          icon && (
            <Ionicons
              name={icon}
              size={size === "small" ? 16 : size === "large" ? 24 : 20}
              color={variant === "primary" ? "#FFFFFF" : "#3B82F6"}
              style={styles.icon}
            />
          )
        )}
        <Text
          style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}
        >
          {loading ? "Loading..." : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  // Variants
  primary: {
    backgroundColor: "#3B82F6",
  },
  secondary: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  // Text styles
  text: {
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#374151",
  },
  outlineText: {
    color: "#3B82F6",
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  // States
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  // Elements
  icon: {
    marginRight: 8,
  },
  loader: {
    marginRight: 8,
  },
});
