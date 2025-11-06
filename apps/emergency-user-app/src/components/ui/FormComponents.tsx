import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  isCompleted?: boolean;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  error,
  isCompleted = false,
  required = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        {isCompleted && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
        )}
      </View>
      {children}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
}) => {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(currentStep / totalSteps) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.stepText}>
        Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
      </Text>
    </View>
  );
};

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "primary" && styles.buttonPrimary,
        variant === "secondary" && styles.buttonSecondary,
        variant === "outline" && styles.buttonOutline,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {icon && !loading && (
        <Ionicons
          name={icon}
          size={20}
          color={variant === "primary" ? "#FFFFFF" : "#000000"}
          style={styles.buttonIcon}
        />
      )}
      <Text
        style={[
          styles.buttonText,
          variant === "primary" && styles.buttonTextPrimary,
          variant === "secondary" && styles.buttonTextSecondary,
          variant === "outline" && styles.buttonTextOutline,
          disabled && styles.buttonTextDisabled,
        ]}
      >
        {loading ? "Loading..." : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Form Field Styles
  container: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    letterSpacing: 0.2,
  },
  required: {
    color: "#EF4444",
    fontSize: 16,
  },
  checkmark: {
    marginLeft: 8,
  },
  error: {
    fontSize: 14,
    color: "#EF4444",
    marginTop: 6,
    fontWeight: "500",
  },

  // Step Indicator Styles
  stepContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  stepText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },

  // Button Styles
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimary: {
    backgroundColor: "#1F2937",
  },
  buttonSecondary: {
    backgroundColor: "#F3F4F6",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  buttonTextPrimary: {
    color: "#FFFFFF",
  },
  buttonTextSecondary: {
    color: "#1F2937",
  },
  buttonTextOutline: {
    color: "#1F2937",
  },
  buttonTextDisabled: {
    opacity: 0.6,
  },
});
