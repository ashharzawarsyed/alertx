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
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { authService, SignUpData } from "../../services/authService";
import { AuthHeader } from "../../components/auth/AuthHeader";
import { AuthInput } from "../../components/auth/AuthInput";
import { AuthButton } from "../../components/auth/AuthButton";
import { OTPInput } from "../../components/ui/OTPInput";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Validation schemas
const emailSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

const basicInfoSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  phone: Yup.string()
    .matches(
      /^\+[1-9]\d{1,14}$/,
      "Enter valid phone with country code (e.g., +1234567890)"
    )
    .required("Phone number is required"),
  dateOfBirth: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Use format YYYY-MM-DD")
    .required("Date of birth is required"),
  gender: Yup.string().required("Please select your gender"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Must contain uppercase, lowercase, and number"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const addressSchema = Yup.object().shape({
  street: Yup.string().required("Street address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State/Province is required"),
  zipCode: Yup.string().required("ZIP/Postal code is required"),
  country: Yup.string().required("Country is required"),
});

const emergencyContactSchema = Yup.object().shape({
  primaryName: Yup.string().required("Primary contact name is required"),
  primaryRelationship: Yup.string().required("Relationship is required"),
  primaryPhone: Yup.string()
    .matches(/^\+[1-9]\d{1,14}$/, "Enter valid phone with country code")
    .required("Primary contact phone is required"),
  primaryEmail: Yup.string().email("Invalid email address"),
});

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const RELATIONSHIPS = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Friend",
  "Relative",
  "Other",
];
const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Unknown",
];

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <View style={styles.stepIndicatorContainer}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index + 1 === currentStep && styles.stepDotActive,
            index + 1 < currentStep && styles.stepDotCompleted,
          ]}
        >
          {index + 1 < currentStep ? (
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.stepDotText,
                index + 1 === currentStep && styles.stepDotTextActive,
              ]}
            >
              {index + 1}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

export default function SignUpScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [formData, setFormData] = useState<
    Partial<SignUpData & { otp: string }>
  >({
    emergencyContacts: [],
    medicalProfile: {},
  });
  const [otpValue, setOtpValue] = useState("");
  const [otpInputKey, setOtpInputKey] = useState(0);
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep, fadeAnim, slideAnim]);

  const totalSteps = 5;

  const handleEmailSubmit = async (values: { email: string }) => {
    setIsLoading(true);

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Connection Timeout",
        "The request is taking too long. Please check:\n\n1. Backend server is running on port 5001\n2. Your network connection\n3. Firewall settings",
        [{ text: "OK" }]
      );
    }, 30000); // 30 second timeout

    try {
      console.log("📧 Requesting OTP for:", values.email);
      await authService.requestOTP(values.email);
      clearTimeout(timeoutId);

      setFormData((prev) => ({
        ...prev,
        email: values.email,
        otp: undefined,
      }));
      setOtpValue("");
      setOtpInputKey((prev) => prev + 1);
      setCurrentStep(2);
      Alert.alert(
        "OTP Sent! 📧",
        `We've sent a verification code to ${values.email}. Please check your inbox.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("❌ OTP request failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send OTP. Please try again.";
      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = (otp: string) => {
    console.log("📝 OTP entered:", otp);
    setFormData((prev) => ({ ...prev, otp }));
  };

  const handleVerifyOTP = async () => {
    console.log("🔍 Verifying OTP:", otpValue);
    console.log("📊 Form data before verification:", formData);

    if (!formData.email) {
      Alert.alert(
        "Missing Email",
        "Please request a new verification code by entering your email again."
      );
      return;
    }

    if (!otpValue || otpValue.length !== 6) {
      Alert.alert(
        "Invalid Code",
        "Please enter the complete 6-digit verification code."
      );
      return;
    }

    setIsLoading(true);

    try {
      await authService.validateOTP(formData.email, otpValue);
      setFormData((prev) => ({ ...prev, otp: otpValue }));
      console.log("✅ OTP validated by backend, proceeding to step 3");
      setCurrentStep(3);
      setOtpValue("");
      setOtpInputKey((prev) => prev + 1);
      Alert.alert("Verified! ✅", "Your email has been verified successfully.");
    } catch (error) {
      console.error("❌ OTP verification failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to verify the code. Please try again.";
      Alert.alert("Verification Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!formData.email) {
      Alert.alert(
        "Missing Email",
        "Please go back and enter your email to request a new code."
      );
      return;
    }

    setIsLoading(true);

    try {
      await authService.resendOTP(formData.email);
      setFormData((prev) => ({ ...prev, otp: undefined }));
      setOtpValue("");
      setOtpInputKey((prev) => prev + 1);
      Alert.alert(
        "Code Resent",
        `We have sent a new verification code to ${formData.email}.`
      );
    } catch (error) {
      console.error("❌ Failed to resend OTP:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to resend the verification code. Please try again.";
      Alert.alert("Resend Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasicInfoSubmit = (values: any) => {
    const { confirmPassword, ...rest } = values;
    setFormData((prev) => ({ ...prev, ...rest }));
    setCurrentStep(4);
  };

  const handleAddressSubmit = (values: any) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        street: values.street,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        country: values.country,
      },
    }));
    setCurrentStep(5);
  };

  const handleEmergencyContactSubmit = async (values: any) => {
    const emergencyContacts = [
      {
        name: values.primaryName,
        relationship: values.primaryRelationship,
        phone: values.primaryPhone,
        email: values.primaryEmail || undefined,
        isPrimary: true,
      },
    ];

    if (values.secondaryName && values.secondaryPhone) {
      emergencyContacts.push({
        name: values.secondaryName,
        relationship: values.secondaryRelationship || "Other",
        phone: values.secondaryPhone,
        email: values.secondaryEmail || undefined,
        isPrimary: false,
      });
    }

    const finalData: SignUpData & { otp: string } = {
      ...formData,
      otp: formData.otp || otpValue,
      name: `${(formData.firstName || "").trim()} ${(formData.lastName || "").trim()}`.trim(),
      role: "patient",
      emergencyContacts,
      medicalProfile: {
        ...(formData.medicalProfile || {}),
        bloodType: values.bloodType || undefined,
      },
    } as SignUpData & { otp: string };

    console.log("🚀 Submitting final registration data:");
    console.log("  ✓ Email:", finalData.email);
    console.log("  ✓ Name:", finalData.name);
    console.log("  ✓ Phone:", finalData.phone);
    console.log("  ✓ Role:", finalData.role);
    console.log("  ✓ OTP:", finalData.otp);
    console.log("  ✓ Address:", finalData.address ? "Present" : "Missing");
    console.log("  ✓ Emergency Contacts:", emergencyContacts.length);

    setIsLoading(true);
    try {
      const response = await authService.verifyOTPAndRegister(finalData);

      if (response.data?.user && response.data?.token) {
        // Save token to AsyncStorage for API calls
        await AsyncStorage.setItem("auth-token", response.data.token);

        // Update auth store (this will persist automatically via zustand)
        setUser(response.data.user);
        setToken(response.data.token);

        Alert.alert(
          "Welcome to AlertX! 🎉",
          "Your account has been created successfully. You now have access to emergency services.",
          [{ text: "Get Started", onPress: () => router.replace("/(tabs)") }]
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again.";
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignIn = () => {
    router.back();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Formik
            initialValues={{ email: formData.email || "" }}
            validationSchema={emailSchema}
            onSubmit={handleEmailSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconCircle}>
                    <Ionicons name="mail-outline" size={32} color="#EF4444" />
                  </View>
                  <Text style={styles.stepTitle}>Email Verification</Text>
                  <Text style={styles.stepDescription}>
                    Enter your email address to get started. We&apos;ll send you
                    a verification code.
                  </Text>
                </View>

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
                  title={isLoading ? "Sending Code" : "Send Verification Code"}
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  icon="paper-plane-outline"
                />
              </View>
            )}
          </Formik>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#6B7280" />
            </TouchableOpacity>

            <View style={styles.stepHeader}>
              <View style={styles.stepIconCircle}>
                <Ionicons name="key-outline" size={32} color="#EF4444" />
              </View>
              <Text style={styles.stepTitle}>Enter Verification Code</Text>
              <Text style={styles.stepDescription}>
                We&apos;ve sent a 6-digit code to{"\n"}
                <Text style={styles.emailHighlight}>{formData.email}</Text>
              </Text>
            </View>

            <View style={styles.otpContainer}>
              <OTPInput
                key={otpInputKey}
                length={6}
                onComplete={handleOTPVerification}
                onChange={(value) => {
                  setOtpValue(value);
                  if (value.length < 6) {
                    setFormData((prev) => ({ ...prev, otp: undefined }));
                  }
                }}
                disabled={isLoading}
              />
            </View>

            <AuthButton
              title="Verify Code"
              onPress={handleVerifyOTP}
              isLoading={isLoading}
              disabled={otpValue.length !== 6}
              icon="checkmark-circle-outline"
            />

            <TouchableOpacity
              style={[
                styles.resendButton,
                isLoading && styles.resendButtonDisabled,
              ]}
              onPress={handleResendOTP}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.resendText,
                  isLoading && styles.resendTextDisabled,
                ]}
              >
                Didn&apos;t receive the code? Resend
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <Formik
            initialValues={{
              firstName: formData.firstName || "",
              lastName: formData.lastName || "",
              phone: formData.phone || "",
              dateOfBirth: formData.dateOfBirth || "",
              gender: formData.gender || "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={basicInfoSchema}
            onSubmit={handleBasicInfoSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
            }) => (
              <ScrollView
                style={styles.stepContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollPadding}
              >
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Ionicons name="arrow-back" size={24} color="#6B7280" />
                </TouchableOpacity>

                <View style={styles.stepHeader}>
                  <View style={styles.stepIconCircle}>
                    <Ionicons name="person-outline" size={32} color="#EF4444" />
                  </View>
                  <Text style={styles.stepTitle}>Basic Information</Text>
                  <Text style={styles.stepDescription}>
                    Tell us about yourself so we can provide better care
                  </Text>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formHalf}>
                    <AuthInput
                      label="First Name"
                      icon="person-outline"
                      placeholder="John"
                      value={values.firstName}
                      onChangeText={handleChange("firstName")}
                      onBlur={handleBlur("firstName")}
                      error={errors.firstName}
                      touched={touched.firstName}
                    />
                  </View>
                  <View style={styles.formHalf}>
                    <AuthInput
                      label="Last Name"
                      icon="person-outline"
                      placeholder="Doe"
                      value={values.lastName}
                      onChangeText={handleChange("lastName")}
                      onBlur={handleBlur("lastName")}
                      error={errors.lastName}
                      touched={touched.lastName}
                    />
                  </View>
                </View>

                <AuthInput
                  label="Phone Number"
                  icon="call-outline"
                  placeholder="+1234567890"
                  keyboardType="phone-pad"
                  value={values.phone}
                  onChangeText={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                  error={errors.phone}
                  touched={touched.phone}
                />

                <AuthInput
                  label="Date of Birth"
                  icon="calendar-outline"
                  placeholder="YYYY-MM-DD (e.g., 1990-01-15)"
                  value={values.dateOfBirth}
                  onChangeText={handleChange("dateOfBirth")}
                  onBlur={handleBlur("dateOfBirth")}
                  error={errors.dateOfBirth}
                  touched={touched.dateOfBirth}
                />

                <View style={styles.inputContainer}>
                  <View style={styles.labelRow}>
                    <Ionicons
                      name="male-female-outline"
                      size={18}
                      color="#6B7280"
                    />
                    <Text style={styles.label}>Gender</Text>
                  </View>
                  <View style={styles.optionContainer}>
                    {GENDERS.map((gender) => (
                      <TouchableOpacity
                        key={gender}
                        style={[
                          styles.optionButton,
                          values.gender === gender &&
                            styles.optionButtonSelected,
                        ]}
                        onPress={() => setFieldValue("gender", gender)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            values.gender === gender &&
                              styles.optionTextSelected,
                          ]}
                        >
                          {gender}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {touched.gender && errors.gender && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#EF4444" />
                      <Text style={styles.errorText}>{errors.gender}</Text>
                    </View>
                  )}
                </View>

                <AuthInput
                  label="Password"
                  icon="lock-closed-outline"
                  placeholder="Create a strong password"
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

                <AuthInput
                  label="Confirm Password"
                  icon="lock-closed-outline"
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  value={values.confirmPassword}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                  showPasswordToggle
                  showPassword={showConfirmPassword}
                  onTogglePassword={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                />

                <AuthButton
                  title="Continue"
                  onPress={handleSubmit}
                  icon="arrow-forward"
                />
              </ScrollView>
            )}
          </Formik>
        );

      case 4:
        return (
          <Formik
            initialValues={{
              street: formData.address?.street || "",
              city: formData.address?.city || "",
              state: formData.address?.state || "",
              zipCode: formData.address?.zipCode || "",
              country: formData.address?.country || "United States",
            }}
            validationSchema={addressSchema}
            onSubmit={handleAddressSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <ScrollView
                style={styles.stepContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollPadding}
              >
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Ionicons name="arrow-back" size={24} color="#6B7280" />
                </TouchableOpacity>

                <View style={styles.stepHeader}>
                  <View style={styles.stepIconCircle}>
                    <Ionicons
                      name="location-outline"
                      size={32}
                      color="#EF4444"
                    />
                  </View>
                  <Text style={styles.stepTitle}>Address Information</Text>
                  <Text style={styles.stepDescription}>
                    Your address helps us send emergency services to the right
                    location
                  </Text>
                </View>

                <AuthInput
                  label="Street Address"
                  icon="home-outline"
                  placeholder="123 Main Street"
                  value={values.street}
                  onChangeText={handleChange("street")}
                  onBlur={handleBlur("street")}
                  error={errors.street}
                  touched={touched.street}
                />

                <View style={styles.formRow}>
                  <View style={styles.formHalf}>
                    <AuthInput
                      label="City"
                      icon="business-outline"
                      placeholder="New York"
                      value={values.city}
                      onChangeText={handleChange("city")}
                      onBlur={handleBlur("city")}
                      error={errors.city}
                      touched={touched.city}
                    />
                  </View>
                  <View style={styles.formHalf}>
                    <AuthInput
                      label="State"
                      icon="map-outline"
                      placeholder="NY"
                      value={values.state}
                      onChangeText={handleChange("state")}
                      onBlur={handleBlur("state")}
                      error={errors.state}
                      touched={touched.state}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formHalf}>
                    <AuthInput
                      label="ZIP Code"
                      icon="mail-outline"
                      placeholder="10001"
                      keyboardType="numeric"
                      value={values.zipCode}
                      onChangeText={handleChange("zipCode")}
                      onBlur={handleBlur("zipCode")}
                      error={errors.zipCode}
                      touched={touched.zipCode}
                    />
                  </View>
                  <View style={styles.formHalf}>
                    <AuthInput
                      label="Country"
                      icon="globe-outline"
                      placeholder="United States"
                      value={values.country}
                      onChangeText={handleChange("country")}
                      onBlur={handleBlur("country")}
                      error={errors.country}
                      touched={touched.country}
                    />
                  </View>
                </View>

                <AuthButton
                  title="Continue"
                  onPress={handleSubmit}
                  icon="arrow-forward"
                />
              </ScrollView>
            )}
          </Formik>
        );

      case 5:
        return (
          <Formik
            initialValues={{
              bloodType: formData.medicalProfile?.bloodType || "",
              primaryName: "",
              primaryRelationship: "",
              primaryPhone: "",
              primaryEmail: "",
              secondaryName: "",
              secondaryRelationship: "",
              secondaryPhone: "",
              secondaryEmail: "",
            }}
            validationSchema={emergencyContactSchema}
            onSubmit={handleEmergencyContactSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
            }) => (
              <ScrollView
                style={styles.stepContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollPadding}
              >
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Ionicons name="arrow-back" size={24} color="#6B7280" />
                </TouchableOpacity>

                <View style={styles.stepHeader}>
                  <View style={styles.stepIconCircle}>
                    <Ionicons name="people-outline" size={32} color="#EF4444" />
                  </View>
                  <Text style={styles.stepTitle}>Emergency Contacts</Text>
                  <Text style={styles.stepDescription}>
                    Add trusted contacts who will be notified during emergencies
                  </Text>
                </View>

                {/* Blood Type (Optional) */}
                <View style={styles.inputContainer}>
                  <View style={styles.labelRow}>
                    <Ionicons name="water-outline" size={18} color="#6B7280" />
                    <Text style={styles.label}>Blood Type (Optional)</Text>
                  </View>
                  <View style={styles.optionContainer}>
                    {BLOOD_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.bloodTypeButton,
                          values.bloodType === type &&
                            styles.optionButtonSelected,
                        ]}
                        onPress={() => setFieldValue("bloodType", type)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            values.bloodType === type &&
                              styles.optionTextSelected,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Primary Contact */}
                <Text style={styles.sectionTitle}>
                  Primary Emergency Contact
                </Text>

                <AuthInput
                  label="Contact Name"
                  icon="person-outline"
                  placeholder="Jane Doe"
                  value={values.primaryName}
                  onChangeText={handleChange("primaryName")}
                  onBlur={handleBlur("primaryName")}
                  error={errors.primaryName}
                  touched={touched.primaryName}
                />

                <View style={styles.inputContainer}>
                  <View style={styles.labelRow}>
                    <Ionicons name="heart-outline" size={18} color="#6B7280" />
                    <Text style={styles.label}>Relationship</Text>
                  </View>
                  <View style={styles.optionContainer}>
                    {RELATIONSHIPS.map((rel) => (
                      <TouchableOpacity
                        key={rel}
                        style={[
                          styles.optionButton,
                          values.primaryRelationship === rel &&
                            styles.optionButtonSelected,
                        ]}
                        onPress={() =>
                          setFieldValue("primaryRelationship", rel)
                        }
                      >
                        <Text
                          style={[
                            styles.optionText,
                            values.primaryRelationship === rel &&
                              styles.optionTextSelected,
                          ]}
                        >
                          {rel}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {touched.primaryRelationship &&
                    errors.primaryRelationship && (
                      <View style={styles.errorContainer}>
                        <Ionicons
                          name="alert-circle"
                          size={14}
                          color="#EF4444"
                        />
                        <Text style={styles.errorText}>
                          {errors.primaryRelationship}
                        </Text>
                      </View>
                    )}
                </View>

                <AuthInput
                  label="Phone Number"
                  icon="call-outline"
                  placeholder="+1234567890"
                  keyboardType="phone-pad"
                  value={values.primaryPhone}
                  onChangeText={handleChange("primaryPhone")}
                  onBlur={handleBlur("primaryPhone")}
                  error={errors.primaryPhone}
                  touched={touched.primaryPhone}
                />

                <AuthInput
                  label="Email (Optional)"
                  icon="mail-outline"
                  placeholder="contact@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={values.primaryEmail}
                  onChangeText={handleChange("primaryEmail")}
                  onBlur={handleBlur("primaryEmail")}
                  error={errors.primaryEmail}
                  touched={touched.primaryEmail}
                />

                {/* Secondary Contact (Optional) */}
                <Text style={styles.sectionTitle}>
                  Secondary Contact (Optional)
                </Text>

                <AuthInput
                  label="Contact Name"
                  icon="person-outline"
                  placeholder="John Smith"
                  value={values.secondaryName}
                  onChangeText={handleChange("secondaryName")}
                  onBlur={handleBlur("secondaryName")}
                />

                <AuthInput
                  label="Phone Number"
                  icon="call-outline"
                  placeholder="+1234567890"
                  keyboardType="phone-pad"
                  value={values.secondaryPhone}
                  onChangeText={handleChange("secondaryPhone")}
                  onBlur={handleBlur("secondaryPhone")}
                />

                <AuthButton
                  title={
                    isLoading ? "Creating Account" : "Complete Registration"
                  }
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  icon="checkmark-circle-outline"
                />
              </ScrollView>
            )}
          </Formik>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#EF4444" />

      {/* Header */}
      <AuthHeader
        title="Create Account"
        subtitle="Join our emergency response network"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
          {/* Step Indicator */}
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
                <StepIndicator
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                />

                {/* Step Content */}
                {renderStepContent()}

                {/* Footer */}
                {currentStep === 1 && (
                  <View style={styles.footer}>
                    <TouchableOpacity
                      style={styles.signInButton}
                      onPress={handleSignIn}
                    >
                      <Text style={styles.signInButtonText}>
                        Already have an account?{" "}
                        <Text style={styles.signInButtonTextBold}>Sign In</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  scrollViewContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formSafeArea: {
    marginTop: -40,
    paddingHorizontal: 24,
    paddingBottom: 20, // Moderate padding for safe area
  },
  formContainer: {
    width: "100%",
    marginBottom: 20, // Space above navigation bar
    zIndex: 10, // Ensure form overlaps header
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16, // Reduced from 20
    paddingBottom: 24, // Keep bottom padding for footer
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },

  // Step Indicator
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16, // Reduced from 20
    gap: 6,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: "#EF4444",
  },
  stepDotCompleted: {
    backgroundColor: "#10B981",
  },
  stepDotText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  stepDotTextActive: {
    color: "#FFFFFF",
  },

  // Step Content
  stepContent: {
    width: "100%",
  },
  scrollPadding: {
    paddingBottom: 24,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: 16, // Reduced from 24
  },
  stepIconCircle: {
    width: 60, // Reduced from 70
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8, // Reduced from 12
  },
  stepTitle: {
    fontSize: 20, // Reduced from 22
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4, // Reduced from 6
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 13, // Reduced from 14
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18, // Reduced from 20
    paddingHorizontal: 16,
  },
  emailHighlight: {
    fontWeight: "700",
    color: "#EF4444",
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

  // Form Elements
  inputContainer: {
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
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 0,
  },
  formHalf: {
    flex: 1,
  },

  // Options
  optionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  optionButtonSelected: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  bloodTypeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    minWidth: 50,
    alignItems: "center",
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

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 24,
    marginBottom: 16,
  },

  // Resend Button
  resendButton: {
    alignItems: "center",
    marginTop: 16,
    padding: 8,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "600",
  },
  resendTextDisabled: {
    color: "#9CA3AF",
  },
  otpContainer: {
    width: "100%",
    marginVertical: 16,
  },

  // Footer
  footer: {
    marginTop: 16,
    marginBottom: 0, // Remove any bottom margin
  },
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
});
