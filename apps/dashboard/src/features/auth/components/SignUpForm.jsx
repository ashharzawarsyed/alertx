import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion, AnimatePresence } from "framer-motion";
import * as yup from "yup";
import {
  User,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { InputField, Button, AuthCard } from "../../../shared/components";

// Validation schema for sign up
const signUpSchema = yup.object().shape({
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

const SignUpForm = ({ onSwitchToSignIn }) => {
  const [message, setMessage] = useState(null);
  const { register: registerUser } = useAuth();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    reset,
  } = useForm({
    resolver: yupResolver(signUpSchema),
    mode: "onSubmit", // Only validate on submit to avoid premature errors
  });

  const onSubmit = async (formData) => {
    setMessage(null);
    clearErrors();

    try {
      const result = await registerUser(formData);

      if (result.success) {
        // Successful registration
        setMessage({
          type: "success",
          text:
            result.message ||
            "Registration submitted successfully! Your account will be reviewed by a super admin.",
        });

        // Reset the form after successful submission
        reset({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        // Registration failed
        if (result.fieldErrors) {
          // Set individual field errors if provided by backend
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            setError(field, {
              type: "server",
              message: Array.isArray(message) ? message[0] : message,
            });
          });
        }

        if (result.error) {
          setMessage({
            type: "error",
            text: result.error,
          });
        }
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleSubmitAnother = () => {
    setMessage(null);
    clearErrors();
    reset({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <AuthCard
      title="Request Admin Access"
      subtitle="Apply for administrative privileges"
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
            <div className="flex-1">
              <span className="font-sans text-sm font-medium">
                {message.text}
              </span>
              {message.type === "success" && (
                <button
                  type="button"
                  onClick={handleSubmitAnother}
                  className="ml-2 text-xs text-green-600 underline hover:text-green-700"
                >
                  Submit Another Application
                </button>
              )}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
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
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-700">
              <strong>Password Requirements:</strong>
              At least 8 characters, one uppercase, one lowercase, and one
              number
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
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
        </AnimatePresence>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Submit Application
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="focus:ring-opacity-50 rounded-md px-2 py-1 font-sans font-semibold tracking-wide text-blue-600 transition-colors hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>
    </AuthCard>
  );
};

export default SignUpForm;
