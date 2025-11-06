import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../../services/authService";
import { AuthHeader } from "../../components/auth/AuthHeader";
import { AuthInput } from "../../components/auth/AuthInput";
import { AuthButton } from "../../components/auth/AuthButton";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async (values: { email: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.requestPasswordReset(values.email);

      if (response.success) {
        setEmailSent(true);
        Alert.alert(
          "Email Sent! 📧",
          "Password reset instructions have been sent to your email address. Please check your inbox.",
          [
            {
              text: "OK",
              onPress: () => {
                // Optionally navigate back or to a success screen
              },
            },
          ]
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send password reset email. Please try again.";
      Alert.alert("Request Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#EF4444" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <AuthHeader
            title="Forgot Password"
            subtitle="We'll help you reset it"
            showIcon={false}
          />

          {/* Form Container */}
          <SafeAreaView edges={["bottom"]} style={styles.formSafeArea}>
            <View style={styles.formContainer}>
              <View style={styles.formCard}>
                {/* Back Button */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBackToSignIn}
                >
                  <Ionicons name="arrow-back" size={24} color="#6B7280" />
                </TouchableOpacity>

                {/* Instruction Text */}
                {!emailSent ? (
                  <View style={styles.instructionSection}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="key-outline" size={32} color="#EF4444" />
                    </View>
                    <Text style={styles.instructionTitle}>
                      Reset Your Password
                    </Text>
                    <Text style={styles.instructionText}>
                      Enter your email address and we&apos;ll send you
                      instructions to reset your password.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.successSection}>
                    <View style={styles.successIconCircle}>
                      <Ionicons
                        name="checkmark-circle"
                        size={64}
                        color="#10B981"
                      />
                    </View>
                    <Text style={styles.successTitle}>Email Sent!</Text>
                    <Text style={styles.successText}>
                      Check your email for password reset instructions.
                    </Text>
                  </View>
                )}

                {/* Form */}
                {!emailSent && (
                  <Formik
                    initialValues={{ email: "" }}
                    validationSchema={validationSchema}
                    onSubmit={handleForgotPassword}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                    }) => (
                      <View style={styles.form}>
                        {/* Email Input */}
                        <AuthInput
                          label="Email Address"
                          icon="mail-outline"
                          placeholder="your.email@example.com"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={values.email}
                          onChangeText={handleChange("email")}
                          onBlur={handleBlur("email")}
                          error={errors.email}
                          touched={touched.email}
                        />

                        {/* Submit Button */}
                        <AuthButton
                          title={isLoading ? "Sending" : "Send Reset Link"}
                          onPress={handleSubmit}
                          isLoading={isLoading}
                          icon="paper-plane-outline"
                        />

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                          <View style={styles.divider} />
                          <Text style={styles.dividerText}>or</Text>
                          <View style={styles.divider} />
                        </View>

                        {/* Back to Sign In */}
                        <TouchableOpacity
                          style={styles.signInButton}
                          onPress={handleBackToSignIn}
                        >
                          <Text style={styles.signInButtonText}>
                            Remember your password?{" "}
                            <Text style={styles.signInButtonTextBold}>
                              Sign In
                            </Text>
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </Formik>
                )}

                {/* Success Actions */}
                {emailSent && (
                  <View style={styles.successActions}>
                    <AuthButton
                      title="Back to Sign In"
                      onPress={handleBackToSignIn}
                      icon="arrow-back"
                    />
                  </View>
                )}
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Form
  formSafeArea: {
    marginTop: -40,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  formContainer: {
    width: "100%",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },

  // Back Button
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  // Instruction Section
  instructionSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 16,
  },

  // Success Section
  successSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  successIconCircle: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  successText: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 16,
  },

  // Form
  form: {
    width: "100%",
  },

  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  // Sign In Button
  signInButton: {
    paddingVertical: 12,
  },
  signInButtonText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  signInButtonTextBold: {
    color: "#EF4444",
    fontWeight: "700",
  },

  // Success Actions
  successActions: {
    marginTop: 32,
  },
});
