import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";
import { AuthHeader } from "../../components/auth/AuthHeader";
import { AuthInput } from "../../components/auth/AuthInput";
import { AuthButton } from "../../components/auth/AuthButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

export default function EnhancedSignInScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSignIn = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.signIn(values);

      if (response.data?.user && response.data?.token) {
        // Save token to AsyncStorage for API calls
        await AsyncStorage.setItem("auth-token", response.data.token);

        // Update auth store (this will persist automatically via zustand)
        setUser(response.data.user);
        setToken(response.data.token);

        Alert.alert(
          "Welcome Back! 👋",
          `Signed in successfully as ${response.data.user.name}`,
          [{ text: "Continue", onPress: () => router.replace("/(tabs)") }]
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Sign in failed. Please check your credentials and try again.";
      Alert.alert("Sign In Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  const handleCreateAccount = () => {
    router.push("/auth/signup");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#EF4444" />

      {/* Header */}
      <AuthHeader />

      {/* Scrollable Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            {/* Form Container */}
            <SafeAreaView edges={["bottom"]} style={styles.formSafeArea}>
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.formCard}>
                {/* Welcome Text */}
                <View style={styles.welcomeSection}>
                  <Text style={styles.welcomeTitle}>Welcome Back</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Sign in to access emergency services
                  </Text>
                </View>

                {/* Form */}
                <Formik
                  initialValues={{ email: "", password: "" }}
                  validationSchema={validationSchema}
                  onSubmit={handleSignIn}
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

                      {/* Password Input */}
                      <AuthInput
                        label="Password"
                        icon="lock-closed-outline"
                        placeholder="Enter your password"
                        secureTextEntry={!showPassword}
                        value={values.password}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                        error={errors.password}
                        touched={touched.password}
                        showPasswordToggle
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                      />

                      {/* Forgot Password Link */}
                      <TouchableOpacity
                        style={styles.forgotContainer}
                        onPress={handleForgotPassword}
                      >
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                      </TouchableOpacity>

                      {/* Sign In Button */}
                      <AuthButton
                        title={isLoading ? "Signing In" : "Sign In"}
                        onPress={handleSubmit}
                        isLoading={isLoading}
                        icon="arrow-forward"
                      />

                      {/* Divider */}
                      <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.divider} />
                      </View>

                      {/* Sign Up Link */}
                      <TouchableOpacity
                        style={styles.signUpButton}
                        onPress={handleCreateAccount}
                      >
                        <Text style={styles.signUpButtonText}>
                          Don&apos;t have an account?{" "}
                          <Text style={styles.signUpButtonTextBold}>
                            Sign Up
                          </Text>
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Formik>
              </View>
            </Animated.View>
          </SafeAreaView>
        </View>
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
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Form
  formSafeArea: {
    marginTop: -40,
    paddingHorizontal: 24,
    paddingBottom: 20, // Moderate padding for safe area
  },
  formContainer: {
    width: "100%",
    marginBottom: 20, // Space above navigation bar
    zIndex: 100, // Ensure form overlaps header
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16, // Reduced from 20
    paddingBottom: 48, // Bigger bottom padding to keep footer high above nav bar
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },

  // Welcome Section
  welcomeSection: {
    marginBottom: 16, // Reduced from 24
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4, // Reduced from 6
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  // Form
  form: {
    width: "100%",
  },

  // Forgot password
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 12, // Reduced from 16
    padding: 4,
  },
  forgotText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "600",
  },

  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12, // Reduced from 16
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

  // Sign Up Button
  signUpButton: {
    paddingVertical: 8, // Reduced from 12
    marginTop: 4,
    marginBottom: 8, // Additional bottom gap so link sits higher
  },
  signUpButtonText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  signUpButtonTextBold: {
    color: "#EF4444",
    fontWeight: "700",
  },
});
