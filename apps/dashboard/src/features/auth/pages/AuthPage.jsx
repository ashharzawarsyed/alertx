import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import { SignInForm, SignUpForm } from "../components/Index";
import { DynamicBackground } from "../../../shared/components";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const switchToSignUp = () => setIsSignUp(true);
  const switchToSignIn = () => setIsSignUp(false);

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
              {isSignUp ? "Join" : "Welcome Back to"} AlertX Admin
            </h1>
            <p className="max-w-md font-sans text-xl leading-relaxed font-medium tracking-wide text-gray-700">
              {isSignUp
                ? "Request admin access to help manage the AlertX emergency response system. Your application will be reviewed by our super admin team."
                : "Secure access to manage the emergency response system. Monitor hospitals, drivers, and ensure optimal patient care coordination."}
            </p>

            {isSignUp && (
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

          {/* Right side - Auth Forms */}
          <div className="mx-auto w-full max-w-md">
            <AnimatePresence mode="wait">
              {isSignUp ? (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <SignUpForm onSwitchToSignIn={switchToSignIn} />
                </motion.div>
              ) : (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.3 }}
                >
                  <SignInForm onSwitchToSignUp={switchToSignUp} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DynamicBackground>
  );
};

export default AuthPage;
