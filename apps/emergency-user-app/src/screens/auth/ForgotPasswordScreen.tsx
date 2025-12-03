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

const emailValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

const otpValidationSchema = Yup.object().shape({
  code: Yup.string()
    .required("Reset code is required")
    .length(6, "Code must be 6 digits"),
});

const passwordValidationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

type Step = "email" | "otp" | "password" | "success";

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [userEmail, setUserEmail] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendCode = async (values: { email: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.requestPasswordReset(values.email);

      if (response.success) {
        setUserEmail(values.email);
        setCurrentStep("otp");
        Alert.alert(
          "Code Sent! 📧",
          "A 6-digit reset code has been sent to your email address. Please check your inbox.",
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send reset code. Please try again.";
      Alert.alert("Request Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (values: { code: string }) => {
    // Just move to password step, we'll verify the code when resetting password
    setCurrentStep("password");
  };

  const handleResetPassword = async (values: { newPassword: string; confirmPassword: string }) => {
    setIsLoading(true);
    try {
      console.log('🔄 Attempting password reset with:', {
        email: userEmail,
        code: currentOtpCode.trim(),
        codeLength: currentOtpCode.trim().length
      });

      const response = await authService.resetPassword(
        userEmail.trim(),
        currentOtpCode.trim(),
        values.newPassword
      );

      if (response.success) {
        setCurrentStep("success");
        Alert.alert(
          "Success! ✅",
          "Your password has been reset successfully. You can now sign in with your new password.",
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again.";
      Alert.alert("Reset Failed", errorMessage);
      console.error('❌ Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.back();
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(userEmail);
      Alert.alert("Code Resent", "A new reset code has been sent to your email.");
    } catch (error) {
      Alert.alert("Error", "Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const [currentOtpCode, setCurrentOtpCode] = useState("");

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

                {/* Step Indicator */}
                {currentStep !== "success" && (
                  <View style={styles.stepIndicator}>
                    <View style={[styles.step, currentStep === "email" && styles.stepActive]}>
                      <Text style={[styles.stepText, currentStep === "email" && styles.stepTextActive]}>1</Text>
                    </View>
                    <View style={[styles.stepLine, (currentStep === "otp" || currentStep === "password") && styles.stepLineActive]} />
                    <View style={[styles.step, currentStep === "otp" && styles.stepActive]}>
                      <Text style={[styles.stepText, currentStep === "otp" && styles.stepTextActive]}>2</Text>
                    </View>
                    <View style={[styles.stepLine, currentStep === "password" && styles.stepLineActive]} />
                    <View style={[styles.step, currentStep === "password" && styles.stepActive]}>
                      <Text style={[styles.stepText, currentStep === "password" && styles.stepTextActive]}>3</Text>
                    </View>
                  </View>
                )}

                {/* Instruction Text */}
                {currentStep === "email" && (
                  <View style={styles.instructionSection}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="mail-outline" size={32} color="#EF4444" />
                    </View>
                    <Text style={styles.instructionTitle}>
                      Reset Your Password
                    </Text>
                    <Text style={styles.instructionText}>
                      Enter your email address and we&apos;ll send you a 6-digit reset code.
                    </Text>
                  </View>
                )}

                {currentStep === "otp" && (
                  <View style={styles.instructionSection}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="keypad-outline" size={32} color="#EF4444" />
                    </View>
                    <Text style={styles.instructionTitle}>
                      Enter Reset Code
                    </Text>
                    <Text style={styles.instructionText}>
                      We&apos;ve sent a 6-digit code to {userEmail}
                    </Text>
                  </View>
                )}

                {currentStep === "password" && (
                  <View style={styles.instructionSection}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="lock-closed-outline" size={32} color="#EF4444" />
                    </View>
                    <Text style={styles.instructionTitle}>
                      Create New Password
                    </Text>
                    <Text style={styles.instructionText}>
                      Enter your new password below
                    </Text>
                  </View>
                )}

                {currentStep === "success" && (
                  <View style={styles.successSection}>
                    <View style={styles.successIconCircle}>
                      <Ionicons
                        name="checkmark-circle"
                        size={64}
                        color="#10B981"
                      />
                    </View>
                    <Text style={styles.successTitle}>Password Reset!</Text>
                    <Text style={styles.successText}>
                      Your password has been reset successfully. You can now sign in with your new password.
                    </Text>
                  </View>
                )}

                {/* Step 1: Email Form */}
                {currentStep === "email" && (
                  <Formik
                    initialValues={{ email: "" }}
                    validationSchema={emailValidationSchema}
                    onSubmit={handleSendCode}
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

                        <AuthButton
                          title={isLoading ? "Sending..." : "Send Reset Code"}
                          onPress={handleSubmit}
                          isLoading={isLoading}
                          icon="paper-plane-outline"
                        />

                        <View style={styles.dividerContainer}>
                          <View style={styles.divider} />
                          <Text style={styles.dividerText}>or</Text>
                          <View style={styles.divider} />
                        </View>

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

                {/* Step 2: OTP Form */}
                {currentStep === "otp" && (
                  <Formik
                    initialValues={{ code: "" }}
                    validationSchema={otpValidationSchema}
                    onSubmit={(values) => {
                      setCurrentOtpCode(values.code.trim());
                      handleVerifyCode(values);
                    }}
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
                        <AuthInput
                          label="Reset Code"
                          icon="keypad-outline"
                          placeholder="Enter 6-digit code"
                          keyboardType="number-pad"
                          autoCapitalize="none"
                          maxLength={6}
                          value={values.code}
                          onChangeText={handleChange("code")}
                          onBlur={handleBlur("code")}
                          error={errors.code}
                          touched={touched.code}
                        />

                        <AuthButton
                          title="Verify Code"
                          onPress={handleSubmit}
                          isLoading={isLoading}
                          icon="checkmark-circle-outline"
                        />

                        <TouchableOpacity
                          style={styles.resendButton}
                          onPress={handleResendCode}
                          disabled={isLoading}
                        >
                          <Text style={styles.resendButtonText}>
                            Didn&apos;t receive the code?{" "}
                            <Text style={styles.resendButtonTextBold}>
                              Resend
                            </Text>
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                          <View style={styles.divider} />
                          <Text style={styles.dividerText}>or</Text>
                          <View style={styles.divider} />
                        </View>

                        <TouchableOpacity
                          style={styles.signInButton}
                          onPress={() => setCurrentStep("email")}
                        >
                          <Text style={styles.signInButtonText}>
                            <Ionicons name="arrow-back" size={16} />{" "}
                            Back to Email
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </Formik>
                )}

                {/* Step 3: New Password Form */}
                {currentStep === "password" && (
                  <Formik
                    initialValues={{ newPassword: "", confirmPassword: "" }}
                    validationSchema={passwordValidationSchema}
                    onSubmit={handleResetPassword}
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
                        <AuthInput
                          label="New Password"
                          icon="lock-closed-outline"
                          placeholder="Enter new password"
                          secureTextEntry={!showNewPassword}
                          autoCapitalize="none"
                          value={values.newPassword}
                          onChangeText={handleChange("newPassword")}
                          onBlur={handleBlur("newPassword")}
                          error={errors.newPassword}
                          touched={touched.newPassword}
                          showPasswordToggle
                          showPassword={showNewPassword}
                          onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                        />

                        <AuthInput
                          label="Confirm Password"
                          icon="lock-closed-outline"
                          placeholder="Confirm new password"
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                          value={values.confirmPassword}
                          onChangeText={handleChange("confirmPassword")}
                          onBlur={handleBlur("confirmPassword")}
                          error={errors.confirmPassword}
                          touched={touched.confirmPassword}
                          showPasswordToggle
                          showPassword={showConfirmPassword}
                          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                        />

                        <AuthButton
                          title={isLoading ? "Resetting..." : "Reset Password"}
                          onPress={handleSubmit}
                          isLoading={isLoading}
                          icon="checkmark-done-outline"
                        />

                        <View style={styles.dividerContainer}>
                          <View style={styles.divider} />
                          <Text style={styles.dividerText}>or</Text>
                          <View style={styles.divider} />
                        </View>

                        <TouchableOpacity
                          style={styles.signInButton}
                          onPress={() => setCurrentStep("otp")}
                        >
                          <Text style={styles.signInButtonText}>
                            <Ionicons name="arrow-back" size={16} />{" "}
                            Back to Code
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </Formik>
                )}

                {/* Success Actions */}
                {currentStep === "success" && (
                  <View style={styles.successActions}>
                    <AuthButton
                      title="Sign In Now"
                      onPress={handleBackToSignIn}
                      icon="log-in-outline"
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

  // Step Indicator
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  stepActive: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  stepText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  stepTextActive: {
    color: "#FFFFFF",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: "#EF4444",
  },

  // Resend Button
  resendButton: {
    paddingVertical: 12,
    marginTop: 16,
  },
  resendButtonText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  resendButtonTextBold: {
    color: "#EF4444",
    fontWeight: "700",
  },
});
