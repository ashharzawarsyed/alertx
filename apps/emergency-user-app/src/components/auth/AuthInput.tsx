import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AuthInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
  touched?: boolean;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  icon,
  error,
  touched,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
  ...textInputProps
}) => {
  const hasError = touched && error;

  return (
    <View style={styles.container}>
      {/* Label with Icon */}
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={18} color="#6B7280" />
        <Text style={styles.label}>{label}</Text>
      </View>

      {/* Input Wrapper */}
      <View style={[styles.inputWrapper, hasError && styles.inputError]}>
        <TextInput
          style={[styles.input, showPasswordToggle && styles.inputWithToggle]}
          placeholderTextColor="#9CA3AF"
          {...textInputProps}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={onTogglePassword}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  inputWithToggle: {
    paddingRight: 50,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    padding: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },
});
