import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as yup from "yup";
import { Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { InputField, Button, AuthCard } from "../../../shared/components";

// Validation schema for sign in
const signInSchema = yup.object().shape({
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

const SignInForm = ({ onSwitchToSignUp }) => {
  const [message, setMessage] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    resolver: yupResolver(signInSchema),
    mode: "onSubmit", // Only validate on submit to avoid premature errors
  });

  const onSubmit = async (formData) => {
    setMessage(null);
    clearErrors();

    try {
      const result = await login(formData);

      if (result.success) {
        // Successful login, navigate to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // Login failed
        if (result.fieldErrors) {
          // Set individual field errors if provided by backend
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            setError(field, {
              type: "server",
              message: Array.isArray(message) ? message[0] : message,
            });
          });
        } else {
          // Generic error message
          setMessage({
            type: "error",
            text:
              result.error || "Login failed. Please check your credentials.",
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

  return (
    <AuthCard
      title="Admin Sign In"
      subtitle="Enter your credentials to continue"
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
            </div>
          </motion.div>
        )}

        <InputField
          label="Email Address"
          type="email"
          placeholder="admin@alertx.com"
          icon={Mail}
          error={errors.email?.message}
          {...register("email")}
        />

        <InputField
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={Lock}
          error={errors.password?.message}
          {...register("password")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Sign In to Dashboard
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="focus:ring-opacity-50 rounded-md px-2 py-1 font-sans font-semibold tracking-wide text-blue-600 transition-colors hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Need admin access? Apply here
          </button>
        </div>
      </form>
    </AuthCard>
  );
};

export default SignInForm;
