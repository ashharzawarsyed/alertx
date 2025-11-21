import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import authService from '../src/services/authService';

interface PasswordCheck {
  label: string;
  regex: RegExp;
  met: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  licenseNumber: string;
  ambulanceNumber: string;
  otp: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    ambulanceNumber: '',
    otp: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Password validation checks
  const [passwordChecks, setPasswordChecks] = useState<PasswordCheck[]>([
    { label: 'At least 8 characters', regex: /.{8,}/, met: false },
    { label: 'One uppercase letter (A-Z)', regex: /[A-Z]/, met: false },
    { label: 'One lowercase letter (a-z)', regex: /[a-z]/, met: false },
    { label: 'One number (0-9)', regex: /[0-9]/, met: false },
    { label: 'One special character (!@#$%^&*)', regex: /[!@#$%^&*(),.?":{}|<>]/, met: false },
  ]);

  // Real-time password validation
  useEffect(() => {
    if (formData.password) {
      const updatedChecks = passwordChecks.map((check) => ({
        ...check,
        met: check.regex.test(formData.password),
      }));
      setPasswordChecks(updatedChecks);
    }
  }, [formData.password]);

  // Real-time field validation
  useEffect(() => {
    if (touched.name && formData.name) {
      validateName(formData.name);
    }
  }, [formData.name, touched.name]);

  useEffect(() => {
    if (touched.email && formData.email) {
      validateEmail(formData.email);
    }
  }, [formData.email, touched.email]);

  useEffect(() => {
    if (touched.phone && formData.phone) {
      validatePhone(formData.phone);
    }
  }, [formData.phone, touched.phone]);

  useEffect(() => {
    if (touched.licenseNumber && formData.licenseNumber) {
      validateLicense(formData.licenseNumber);
    }
  }, [formData.licenseNumber, touched.licenseNumber]);

  useEffect(() => {
    if (touched.ambulanceNumber && formData.ambulanceNumber) {
      validateAmbulance(formData.ambulanceNumber);
    }
  }, [formData.ambulanceNumber, touched.ambulanceNumber]);

  useEffect(() => {
    if (touched.confirmPassword && formData.confirmPassword) {
      validateConfirmPassword(formData.confirmPassword);
    }
  }, [formData.confirmPassword, formData.password, touched.confirmPassword]);

  // Validation functions
  const validateName = (name: string): boolean => {
    const newErrors = { ...errors };
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      setErrors(newErrors);
      return false;
    }
    
    if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters\nExample: John Doe';
      setErrors(newErrors);
      return false;
    }
    
    if (name.trim().length > 50) {
      newErrors.name = 'Name must not exceed 50 characters';
      setErrors(newErrors);
      return false;
    }
    
    // Allow letters, numbers, spaces, and common name characters
    if (!/^[a-zA-Z0-9\s\-'.]+$/.test(name)) {
      newErrors.name = 'Name can only contain letters, numbers, spaces, hyphens, apostrophes\nExample: John O\'Brien Jr.';
      setErrors(newErrors);
      return false;
    }
    
    // Check for at least one letter
    if (!/[a-zA-Z]/.test(name)) {
      newErrors.name = 'Name must contain at least one letter';
      setErrors(newErrors);
      return false;
    }
    
    // Check not all numbers
    if (/^\d+$/.test(name.trim())) {
      newErrors.name = 'Name cannot be only numbers';
      setErrors(newErrors);
      return false;
    }
    
    delete newErrors.name;
    setErrors(newErrors);
    return true;
  };

  const validateEmail = (email: string): boolean => {
    const newErrors = { ...errors };
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      setErrors(newErrors);
      return false;
    }
    
    // RFC 5322 compliant email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email format\nExample: driver@example.com';
      setErrors(newErrors);
      return false;
    }
    
    delete newErrors.email;
    setErrors(newErrors);
    return true;
  };

  const normalizePhoneNumber = (phone: string): string => {
    // Remove spaces, dashes, and parentheses
    let normalized = phone.replace(/[\s\-()]/g, '');
    
    // If starts with 0 (Pakistani local format), convert to international
    if (normalized.startsWith('0')) {
      normalized = '+92' + normalized.substring(1);
    }
    
    return normalized;
  };

  const validatePhone = (phone: string): boolean => {
    const newErrors = { ...errors };
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      setErrors(newErrors);
      return false;
    }
    
    // Remove spaces, dashes, and parentheses for validation
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    // Check for non-numeric characters (except + at start)
    if (!/^\+?\d+$/.test(cleanPhone)) {
      newErrors.phone = 'Phone number must contain only digits';
      setErrors(newErrors);
      return false;
    }
    
    // Check if starts with 0 (local format) or +92 (international)
    const localFormatRegex = /^0\d{10}$/; // 0XXXXXXXXXX (11 digits)
    const intlFormatRegex = /^\+92\d{10}$/; // +92XXXXXXXXXX (14 chars including +92)
    
    const isLocalFormat = localFormatRegex.test(cleanPhone);
    const isIntlFormat = intlFormatRegex.test(cleanPhone);
    
    if (!isLocalFormat && !isIntlFormat) {
      newErrors.phone = 'Invalid phone format\nLocal: 03001234567 (11 digits)\nIntl: +923001234567 (14 chars)';
      setErrors(newErrors);
      return false;
    }
    
    delete newErrors.phone;
    setErrors(newErrors);
    return true;
  };

  const validateLicense = (license: string): boolean => {
    const newErrors = { ...errors };
    
    if (!license.trim()) {
      newErrors.licenseNumber = 'License number is required';
      setErrors(newErrors);
      return false;
    }
    
    // Remove spaces for validation
    const cleanLicense = license.replace(/\s/g, '');
    
    // Check minimum length
    if (cleanLicense.length < 5) {
      newErrors.licenseNumber = 'License number must be at least 5 characters\nExample: DL-12345 or ABC-123456';
      setErrors(newErrors);
      return false;
    }
    
    // Check maximum length
    if (cleanLicense.length > 20) {
      newErrors.licenseNumber = 'License number too long (max 20 characters)';
      setErrors(newErrors);
      return false;
    }
    
    // Allow letters, numbers, hyphens
    if (!/^[A-Za-z0-9\-]+$/.test(cleanLicense)) {
      newErrors.licenseNumber = 'License can only contain letters, numbers, and hyphens\nExample: DL-12345';
      setErrors(newErrors);
      return false;
    }
    
    delete newErrors.licenseNumber;
    setErrors(newErrors);
    return true;
  };

  const validateAmbulance = (ambulance: string): boolean => {
    const newErrors = { ...errors };
    
    if (!ambulance.trim()) {
      newErrors.ambulanceNumber = 'Ambulance number is required';
      setErrors(newErrors);
      return false;
    }
    
    // Remove spaces for validation
    const cleanAmbulance = ambulance.replace(/\s/g, '');
    
    // Check minimum length
    if (cleanAmbulance.length < 3) {
      newErrors.ambulanceNumber = 'Ambulance number must be at least 3 characters\nExample: AMB-001 or RES-1234';
      setErrors(newErrors);
      return false;
    }
    
    // Check maximum length
    if (cleanAmbulance.length > 15) {
      newErrors.ambulanceNumber = 'Ambulance number too long (max 15 characters)';
      setErrors(newErrors);
      return false;
    }
    
    // Allow letters, numbers, hyphens (common formats: AMB-001, RES-1234, AMB 123)
    if (!/^[A-Za-z0-9\-]+$/.test(cleanAmbulance)) {
      newErrors.ambulanceNumber = 'Ambulance number can only contain letters, numbers, and hyphens\nExample: AMB-001';
      setErrors(newErrors);
      return false;
    }
    
    // Check for at least one number
    if (!/\d/.test(cleanAmbulance)) {
      newErrors.ambulanceNumber = 'Ambulance number must contain at least one digit\nExample: AMB-001';
      setErrors(newErrors);
      return false;
    }
    
    delete newErrors.ambulanceNumber;
    setErrors(newErrors);
    return true;
  };

  const validateConfirmPassword = (confirmPass: string): boolean => {
    const newErrors = { ...errors };
    
    if (!confirmPass) {
      newErrors.confirmPassword = 'Please confirm your password';
      setErrors(newErrors);
      return false;
    }
    
    if (confirmPass !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
      setErrors(newErrors);
      return false;
    }
    
    delete newErrors.confirmPassword;
    setErrors(newErrors);
    return true;
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSendOTP = async () => {
    // Validate name and email before sending OTP
    const isNameValid = validateName(formData.name);
    const isEmailValid = validateEmail(formData.email);
    
    if (!isNameValid || !isEmailValid) {
      showValidation('Please fix name and email errors before requesting OTP');
      return;
    }
    
    setIsSendingOTP(true);
    
    try {
      const response = await authService.requestRegistrationOTP({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      });
      
      if (response.success) {
        setOtpSent(true);
        Alert.alert(
          'OTP Sent! ✅',
          'Please check your email for the verification code.',
          [{ text: 'OK' }]
        );
      } else {
        showValidation(response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('❌ Send OTP error:', error);
      showValidation(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to send OTP. Please try again.'
      );
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      showValidation('Please enter the 6-digit OTP code');
      return;
    }
    
    setIsVerifyingOTP(true);
    
    try {
      const response = await authService.validateRegistrationOTP({
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp,
      });
      
      if (response.success) {
        setOtpVerified(true);
        Alert.alert(
          'Email Verified! ✅',
          'You can now complete your registration.',
          [{ text: 'Continue' }]
        );
      } else {
        showValidation(response.message || 'Invalid or expired OTP');
      }
    } catch (error: any) {
      console.error('❌ Verify OTP error:', error);
      showValidation(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to verify OTP. Please try again.'
      );
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const validateAllFields = (): boolean => {
    const isNameValid = validateName(formData.name);
    const isEmailValid = validateEmail(formData.email);
    const isPhoneValid = validatePhone(formData.phone);
    const isLicenseValid = validateLicense(formData.licenseNumber);
    const isAmbulanceValid = validateAmbulance(formData.ambulanceNumber);
    const isPasswordValid = passwordChecks.every((check) => check.met);
    const isConfirmPasswordValid = validateConfirmPassword(formData.confirmPassword);
    
    if (!otpVerified) {
      showValidation('Please verify your email with OTP first');
      return false;
    }
    
    if (!isPasswordValid) {
      showValidation('Please meet all password requirements');
      return false;
    }
    
    return (
      isNameValid &&
      isEmailValid &&
      isPhoneValid &&
      isLicenseValid &&
      isAmbulanceValid &&
      isPasswordValid &&
      isConfirmPasswordValid
    );
  };

  const handleRegister = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      licenseNumber: true,
      ambulanceNumber: true,
      password: true,
      confirmPassword: true,
    });
    
    if (!validateAllFields()) {
      showValidation('Please fix all errors before submitting');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const normalizedPhone = normalizePhoneNumber(formData.phone);
      
      const response = await authService.verifyOTPAndRegister({
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp,
        name: formData.name.trim(),
        phone: normalizedPhone,
        password: formData.password,
        role: 'driver',
        driverInfo: {
          licenseNumber: formData.licenseNumber.trim().toUpperCase().replace(/\s/g, ''),
          ambulanceNumber: formData.ambulanceNumber.trim().toUpperCase().replace(/\s/g, ''),
          status: 'offline',
        },
      });
      
      if (response.success) {
        Alert.alert(
          'Registration Successful! 🎉',
          'Your driver account has been created. Please login to continue.',
          [
            {
              text: 'Login Now',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      } else {
        showValidation(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      showValidation(
        error?.response?.data?.message ||
        error?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showValidation = (message: string) => {
    setValidationMessage(message);
    setShowValidationModal(true);
  };

  const allPasswordChecksMet = passwordChecks.every((check) => check.met);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoEmoji}>🚑</Text>
          <Text style={styles.title}>Driver Registration</Text>
          <Text style={styles.subtitle}>Join our emergency response team</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.step, styles.stepActive]}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepLabel}>Personal Info</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.step, otpVerified && styles.stepActive]}>
              <Text style={[styles.stepNumber, otpVerified && styles.stepNumberActive]}>2</Text>
              <Text style={styles.stepLabel}>Verify Email</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.step, otpVerified && styles.stepActive]}>
              <Text style={[styles.stepNumber, otpVerified && styles.stepNumberActive]}>3</Text>
              <Text style={styles.stepLabel}>Complete</Text>
            </View>
          </View>

          {/* Personal Information */}
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[
                styles.input,
                touched.name && errors.name && styles.inputError,
                touched.name && !errors.name && formData.name && styles.inputSuccess,
              ]}
              placeholder="John Doe"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              onBlur={() => handleBlur('name')}
              autoCapitalize="words"
              maxLength={50}
              editable={!otpVerified}
            />
            {touched.name && errors.name && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errors.name}</Text>
              </View>
            )}
            {touched.name && !errors.name && formData.name && (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.successText}>Valid name</Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={[
                styles.input,
                touched.email && errors.email && styles.inputError,
                touched.email && !errors.email && formData.email && styles.inputSuccess,
              ]}
              placeholder="driver@example.com"
              placeholderTextColor="#9CA3AF"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              onBlur={() => handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!otpVerified}
            />
            {touched.email && errors.email && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errors.email}</Text>
              </View>
            )}
            {touched.email && !errors.email && formData.email && (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.successText}>Valid email</Text>
              </View>
            )}
          </View>

          {/* OTP Section */}
          {!otpVerified && (
            <View style={styles.otpSection}>
              {!otpSent ? (
                <TouchableOpacity
                  style={[
                    styles.otpButton,
                    (!formData.name || !formData.email || errors.name || errors.email) &&
                      styles.otpButtonDisabled,
                  ]}
                  onPress={handleSendOTP}
                  disabled={
                    isSendingOTP ||
                    !formData.name ||
                    !formData.email ||
                    !!errors.name ||
                    !!errors.email
                  }
                >
                  {isSendingOTP ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="mail" size={20} color="#FFF" />
                      <Text style={styles.otpButtonText}>Send Verification Code</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Enter 6-Digit OTP *</Text>
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      placeholder="000000"
                      placeholderTextColor="#9CA3AF"
                      value={formData.otp}
                      onChangeText={(text) => setFormData({ ...formData, otp: text.replace(/[^0-9]/g, '') })}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                  <View style={styles.otpActions}>
                    <TouchableOpacity
                      style={styles.otpVerifyButton}
                      onPress={handleVerifyOTP}
                      disabled={isVerifyingOTP || formData.otp.length !== 6}
                    >
                      {isVerifyingOTP ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={styles.otpVerifyText}>Verify Code</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={handleSendOTP}
                      disabled={isSendingOTP}
                    >
                      <Text style={styles.resendText}>Resend Code</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}

          {otpVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.verifiedText}>Email Verified ✓</Text>
            </View>
          )}

          {/* Rest of form - only editable after OTP verification */}
          {otpVerified && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <Text style={styles.helperText}>Local: 03001234567 or Intl: +923001234567</Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.phone && errors.phone && styles.inputError,
                    touched.phone && !errors.phone && formData.phone && styles.inputSuccess,
                  ]}
                  placeholder="03001234567 or +923001234567"
                  placeholderTextColor="#9CA3AF"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  onBlur={() => handleBlur('phone')}
                  keyboardType="phone-pad"
                  maxLength={formData.phone.startsWith('+92') ? 14 : 11}
                />
                {touched.phone && errors.phone && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  </View>
                )}
                {touched.phone && !errors.phone && formData.phone && (
                  <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.successText}>Valid phone number</Text>
                  </View>
                )}
              </View>

              {/* Driver Information */}
              <Text style={styles.sectionTitle}>Driver Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Driver License Number *</Text>
                <Text style={styles.helperText}>Example: DL-12345 or ABC-123456</Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.licenseNumber && errors.licenseNumber && styles.inputError,
                    touched.licenseNumber &&
                      !errors.licenseNumber &&
                      formData.licenseNumber &&
                      styles.inputSuccess,
                  ]}
                  placeholder="DL-12345"
                  placeholderTextColor="#9CA3AF"
                  value={formData.licenseNumber}
                  onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
                  onBlur={() => handleBlur('licenseNumber')}
                  autoCapitalize="characters"
                  maxLength={20}
                />
                {touched.licenseNumber && errors.licenseNumber && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.licenseNumber}</Text>
                  </View>
                )}
                {touched.licenseNumber && !errors.licenseNumber && formData.licenseNumber && (
                  <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.successText}>Valid license number</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ambulance Number *</Text>
                <Text style={styles.helperText}>Example: AMB-001 or RES-1234</Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.ambulanceNumber && errors.ambulanceNumber && styles.inputError,
                    touched.ambulanceNumber &&
                      !errors.ambulanceNumber &&
                      formData.ambulanceNumber &&
                      styles.inputSuccess,
                  ]}
                  placeholder="AMB-001"
                  placeholderTextColor="#9CA3AF"
                  value={formData.ambulanceNumber}
                  onChangeText={(text) => setFormData({ ...formData, ambulanceNumber: text })}
                  onBlur={() => handleBlur('ambulanceNumber')}
                  autoCapitalize="characters"
                  maxLength={15}
                />
                {touched.ambulanceNumber && errors.ambulanceNumber && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.ambulanceNumber}</Text>
                  </View>
                )}
                {touched.ambulanceNumber && !errors.ambulanceNumber && formData.ambulanceNumber && (
                  <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.successText}>Valid ambulance number</Text>
                  </View>
                )}
              </View>

              {/* Security */}
              <Text style={styles.sectionTitle}>Security</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Enter password"
                    placeholderTextColor="#9CA3AF"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={24}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>

                {/* Password Requirements Checklist */}
                <View style={styles.passwordChecks}>
                  {passwordChecks.map((check, index) => (
                    <View key={index} style={styles.checkItem}>
                      <Ionicons
                        name={check.met ? 'checkmark-circle' : 'ellipse-outline'}
                        size={18}
                        color={check.met ? '#10B981' : '#9CA3AF'}
                      />
                      <Text
                        style={[
                          styles.checkLabel,
                          check.met && styles.checkLabelMet,
                        ]}
                      >
                        {check.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      touched.confirmPassword && errors.confirmPassword && styles.inputError,
                      touched.confirmPassword &&
                        !errors.confirmPassword &&
                        formData.confirmPassword &&
                        styles.inputSuccess,
                    ]}
                    placeholder="Confirm password"
                    placeholderTextColor="#9CA3AF"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    onBlur={() => handleBlur('confirmPassword')}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={24}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {touched.confirmPassword && errors.confirmPassword && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  </View>
                )}
                {touched.confirmPassword &&
                  !errors.confirmPassword &&
                  formData.confirmPassword && (
                    <View style={styles.successContainer}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.successText}>Passwords match</Text>
                    </View>
                  )}
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  (isLoading || !allPasswordChecksMet) && styles.registerButtonDisabled,
                ]}
                onPress={handleRegister}
                disabled={isLoading || !allPasswordChecksMet}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Validation Modal */}
      <Modal
        visible={showValidationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowValidationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={48} color="#DC2626" />
              <Text style={styles.modalTitle}>Validation Error</Text>
            </View>
            <Text style={styles.modalMessage}>{validationMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowValidationModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepNumberActive: {
    backgroundColor: '#10B981',
    color: '#FFF',
  },
  stepActive: {
    opacity: 1,
  },
  stepLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFF',
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  inputSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 13,
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  successText: {
    color: '#10B981',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  passwordChecks: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  checkLabelMet: {
    color: '#10B981',
    fontWeight: '500',
  },
  otpSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  otpButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  otpButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  otpButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  otpActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  otpVerifyButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  otpVerifyText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  resendText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    marginVertical: 16,
    gap: 8,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '700',
  },
  registerButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
    elevation: 10,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
