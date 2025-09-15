import React, { useState } from "react";
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
} from "lucide-react";
import {
  InputField,
  Button,
  AuthCard,
  DynamicBackground,
} from "../../../shared/components";
import { useAuth } from "../../../contexts/AuthContext";

// Validation schemas
const loginSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .required("Name is required"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number and special character",
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { login, register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(isLogin ? loginSchema : registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage(null);

    try {
      let result;
      if (isLogin) {
        result = await login(data);
      } else {
        result = await registerUser(data);
      }

      if (result.success) {
        if (isLogin) {
          // Redirect to dashboard on successful login
          window.location.href = "/dashboard";
        } else {
          setMessage({
            type: "success",
            text: result.message || "Registration submitted successfully!",
          });
        }
      } else {
        setMessage({
          type: "error",
          text: result.error || "An error occurred",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  <span className="font-sans text-sm font-medium">
                    {message.text}
                  </span>
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
                      {...register("name")}
                      error={errors.name?.message}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <InputField
                label="Email Address"
                type="email"
                placeholder="admin@alertx.com"
                icon={Mail}
                {...register("email")}
                error={errors.email?.message}
              />

              <InputField
                label="Password"
                type="password"
                placeholder="Enter your password"
                icon={Lock}
                {...register("password")}
                error={errors.password?.message}
              />

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
                      {...register("confirmPassword")}
                      error={errors.confirmPassword?.message}
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
                  className="font-sans font-semibold tracking-wide text-blue-600 transition-colors hover:text-blue-700"
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
