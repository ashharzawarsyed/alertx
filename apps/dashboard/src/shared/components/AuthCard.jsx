import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

const AuthCard = ({ children, title, subtitle, className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={clsx(
        "relative overflow-hidden rounded-3xl border border-white/30 bg-white/10 shadow-2xl backdrop-blur-2xl",
        className,
      )}
      {...props}
    >
      {/* Enhanced gradient overlay for better blending */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-blue-500/5" />

      {/* Additional glassmorphism layer */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/20" />

      {/* Subtle animated border */}
      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(59,130,246,0.1) 50%, rgba(20,184,166,0.1) 100%)",
          padding: "1px",
        }}
        animate={{
          background: [
            "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(59,130,246,0.1) 50%, rgba(20,184,166,0.1) 100%)",
            "linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(59,130,246,0.1) 100%)",
            "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(20,184,166,0.1) 50%, rgba(255,255,255,0.2) 100%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <div className="h-full w-full rounded-3xl bg-white/5 backdrop-blur-xl" />
      </motion.div>

      {/* Card content */}
      <div className="relative z-10 p-8">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h2 className="font-display mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-4xl leading-tight font-bold tracking-tight text-transparent">
              {title}
            </h2>
            {subtitle && (
              <p className="mx-auto max-w-sm font-sans text-lg leading-relaxed font-medium tracking-wide text-gray-700">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthCard;
