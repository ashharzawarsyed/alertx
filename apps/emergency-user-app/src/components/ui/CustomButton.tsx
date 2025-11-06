import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonColors = (): [string, string] => {
    switch (variant) {
      case "primary":
        return ["#EF4444", "#DC2626"]; // Red gradient
      case "secondary":
        return ["#3B82F6", "#2563EB"]; // Blue gradient
      case "danger":
        return ["#DC2626", "#B91C1C"]; // Dark red gradient
      default:
        return ["#EF4444", "#DC2626"];
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case "large":
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return 14;
      case "large":
        return 18;
      default:
        return 16;
    }
  };

  const isOutlineOrGhost = variant === "outline" || variant === "ghost";

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={isOutlineOrGhost ? "#EF4444" : "#ffffff"} />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={getTextSize() + 2}
              color={isOutlineOrGhost ? "#EF4444" : "#ffffff"}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.buttonText,
              { fontSize: getTextSize() },
              isOutlineOrGhost && styles.outlineText,
              variant === "ghost" && styles.ghostText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={getTextSize() + 2}
              color={isOutlineOrGhost ? "#EF4444" : "#ffffff"}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </>
  );

  const buttonStyle = [
    styles.button,
    getSizeStyles(),
    fullWidth && styles.fullWidth,
    isOutlineOrGhost && styles.outlineButton,
    variant === "ghost" && styles.ghostButton,
    (disabled || loading) && styles.disabled,
    style,
  ];

  if (isOutlineOrGhost) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={buttonStyle}
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[fullWidth && styles.fullWidth]}
    >
      <LinearGradient
        colors={getButtonColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[buttonStyle, (disabled || loading) && styles.disabledGradient]}
      >
        {renderContent()}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  fullWidth: {
    width: "100%",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  ghostButton: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  outlineText: {
    color: "#EF4444",
  },
  ghostText: {
    color: "#6B7280",
  },
  disabled: {
    opacity: 0.5,
  },
  disabledGradient: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
