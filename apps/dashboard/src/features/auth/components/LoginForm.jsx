import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Phone,
} from "lucide-react";
import {
  InputField,
  Button,
  AuthCard,
  DynamicBackground,
} from "../../../shared/components";
import { useAuth } from "../../../contexts/AuthContext";

// Validation schemas
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const registerSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .required("Name is required"),
  email: yup
    .string()
    .trim()
    .email("Please enter a valid email")
    .required("Email is required"),
  phone: yup
    .string()
    .trim()
    .matches(
      /^\+[1-9]\d{1,14}$/,
      "Please provide a valid phone number with country code (e.g., +1234567890)",
    )
    .required("Phone number is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const LoginForm = () => {
  // console.log("[LoginForm] Component rendered");
  const [isLogin, setIsLogin] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  // Remove formKey state as it causes form remounting during submission

  // React Hook Form setup with memoized schema
  const currentSchema = useMemo(
    () => (isLogin ? loginSchema : registerSchema),
    [isLogin],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm({
    resolver: yupResolver(currentSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit", // Changed from onBlur to onSubmit
    criteriaMode: "firstError",
    shouldFocusError: true,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { login, register: registerUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Clear form when switching modes (only when isLogin actually changes)
  const clearFormData = useCallback(() => {
    reset(
      {
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      },
      {
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      },
    );
    clearErrors();
    setMessage(null);
  }, [reset, clearErrors]);

  useEffect(() => {
    clearFormData();
  }, [isLogin, clearFormData]);

  const onSubmit = async (formData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      let result;
      if (isLogin) {
        result = await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        result = await registerUser(formData);
      }

      if (result.success) {
        if (isLogin) {
          // Check for redirect param
          const params = new URLSearchParams(location.search);
          const redirect = params.get("redirect");
          if (redirect) {
            navigate(redirect, { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        } else {
          setMessage({
            type: "success",
            text: result.message || "Registration submitted successfully!",
          });
          // Reset form completely including submission state for successful registration
          reset(
            {
              name: "",
              email: "",
              phone: "",
              password: "",
              confirmPassword: "",
            },
            {
              keepErrors: false,
              keepDirty: false,
              keepIsSubmitted: false,
              keepTouched: false,
              keepIsValid: false,
              keepSubmitCount: false,
            },
          );
        }
      } else {
        // Handle backend field validation errors
        if (result.fieldErrors) {
          // Set individual field errors
          Object.entries(result.fieldErrors).forEach(
            ([field, fieldErrorArray]) => {
              setError(field, {
                type: "server",
                message: fieldErrorArray[0], // Use first error for the field
              });
            },
          );
        } else {
          // Fallback to general error message
          setMessage({
            type: "error",
            text: result.error || "An error occurred",
          });
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage(null);
    reset(
      {
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      },
      {
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      },
    );
    clearErrors();
  };

  return (
    <DynamicBackground>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2">
          {/* Left side - Illustration/Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden flex-col items-center justify-center text-center lg:flex"
          >
            <div className="mb-8">
              <motion.div
                animate={{
                  y: [-10, 10, -10],
                  rotate: [-2, 2, -2],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative mx-auto mb-8 h-64 w-64"
              >
                {/* 3D-style illustration placeholder */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 opacity-20" />
                <div className="absolute inset-4 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-teal-600">
                  <Shield className="h-24 w-24 text-white" />
                </div>
                {/* Floating elements */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-4 w-4 rounded-full bg-blue-400"
                    animate={{
                      y: [-20, 20, -20],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${10 + i * 20}%`,
                    }}
                  />
                ))}
              </motion.div>
            </div>

            <h1 className="font-display mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-teal-700 bg-clip-text text-5xl leading-tight font-bold tracking-tight text-transparent">
              {isLogin ? "Welcome Back to" : "Join"} AlertX Admin
            </h1>
            <p className="max-w-md font-sans text-xl leading-relaxed font-medium tracking-wide text-gray-700">
              {isLogin
                ? "Secure access to manage the emergency response system. Monitor hospitals, drivers, and ensure optimal patient care coordination."
                : "Request admin access to help manage the AlertX emergency response system. Your application will be reviewed by our super admin team."}
            </p>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"
              >
                <p className="font-sans text-sm font-medium text-amber-800">
                  <strong className="font-bold">Note:</strong> Admin
                  registration requires approval. You&apos;ll receive an email
                  once your account is activated.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Right side - Auth Form */}
          <AuthCard
            title={isLogin ? "Admin Sign In" : "Request Admin Access"}
            subtitle={
              isLogin
                ? "Enter your credentials to continue"
                : "Apply for administrative privileges"
            }
            className="mx-auto w-full max-w-md"
          >
            <form
              key={isLogin ? "login" : "register"} // Only remount when switching modes
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Message display */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-3 rounded-xl p-4 ${
                    message.type === "success"
                      ? "border border-green-200 bg-green-50 text-green-800"
                      : "border border-red-200 bg-red-50 text-red-800"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <div className="flex-1">
                    <span className="font-sans text-sm font-medium">
                      {message.text}
                    </span>
                    {message.type === "success" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMessage(null);
                          // Reset form for another registration attempt
                          reset(
                            {
                              name: "",
                              email: "",
                              phone: "",
                              password: "",
                              confirmPassword: "",
                            },
                            {
                              keepErrors: false,
                              keepDirty: false,
                              keepIsSubmitted: false,
                              keepTouched: false,
                              keepIsValid: false,
                              keepSubmitCount: false,
                            },
                          );
                          clearErrors();
                        }}
                        className="ml-2 text-xs text-green-600 underline hover:text-green-700"
                      >
                        Submit Another Application
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InputField
                      label="Full Name"
                      type="text"
                      placeholder="Enter your full name"
                      icon={User}
                      error={errors.name?.message}
                      {...register("name")}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <InputField
                label="Email Address"
                type="email"
                placeholder="admin@alertx.com"
                icon={Mail}
                error={errors.email?.message}
                {...register("email")}
              />

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InputField
                      label="Phone Number"
                      type="tel"
                      placeholder="+1234567890"
                      icon={Phone}
                      error={errors.phone?.message}
                      {...register("phone")}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <InputField
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  icon={Lock}
                  error={errors.password?.message}
                  {...register("password")}
                />
                {!isLogin && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-xs text-blue-700">
                      <strong>Password Requirements:</strong>
                      At least 8 characters, one uppercase, one lowercase, and
                      one number
                    </p>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="confirmPassword"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InputField
                      label="Confirm Password"
                      type="password"
                      placeholder="Confirm your password"
                      icon={Lock}
                      error={errors.confirmPassword?.message}
                      {...register("confirmPassword")}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                {isLogin ? "Sign In to Dashboard" : "Submit Application"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="focus:ring-opacity-50 rounded-md px-2 py-1 font-sans font-semibold tracking-wide text-blue-600 transition-colors hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {isLogin
                    ? "Need admin access? Apply here"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </AuthCard>
        </div>
      </div>
    </DynamicBackground>
  );
};

export default LoginForm;
