// Design System - Colors
// Inspired by modern healthcare UI with beautiful blue gradients

export const colors = {
  // Primary gradients (inspired by the heart health overview design)
  gradients: {
    primary: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)", // Deep indigo to cyan
    background:
      "linear-gradient(135deg, #3b82f6 0%, #1e40af 35%, #0ea5e9 100%)", // Multi-stop blue gradient
    card: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
    cardDark:
      "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)",
    sidebar:
      "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)",
    accent: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)", // Purple to cyan
    feature: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)", // Pink to purple to cyan
  },

  // Base colors (updated to match the modern aesthetic)
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6", // Main blue
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },

  // Cyan/Teal accent (more prominent in the new design)
  cyan: {
    50: "#ecfeff",
    100: "#cffafe",
    200: "#a5f3fc",
    300: "#67e8f9",
    400: "#22d3ee",
    500: "#06b6d4", // Main cyan
    600: "#0891b2",
    700: "#0e7490",
    800: "#155e75",
    900: "#164e63",
  },

  // Purple accent (from the design)
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7c3aed",
    800: "#6b21a8",
    900: "#581c87",
  },

  // Neutrals (glassmorphism with better opacity support)
  gray: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },

  // Status colors (updated to match the modern palette)
  status: {
    success: "#06b6d4", // Using cyan instead of green
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    critical: "#dc2626",
    healthy: "#10b981", // For health indicators
  },

  // Medical priority colors
  medical: {
    critical: "#dc2626",
    high: "#ea580c",
    medium: "#d97706",
    low: "#65a30d",
    normal: "#10b981",
  },

  // Glass effect colors
  glass: {
    light: "rgba(255, 255, 255, 0.1)",
    medium: "rgba(255, 255, 255, 0.2)",
    dark: "rgba(15, 23, 42, 0.8)",
    backdrop: "rgba(255, 255, 255, 0.05)",
  },

  // Sidebar specific
  sidebar: {
    background: "rgba(15, 23, 42, 0.95)",
    border: "rgba(255, 255, 255, 0.1)",
    text: {
      primary: "#f8fafc",
      secondary: "#cbd5e1",
      muted: "#64748b",
    },
    hover: "rgba(255, 255, 255, 0.1)",
    active: "rgba(59, 130, 246, 0.2)",
  },

  // Card variants
  cards: {
    glass: "rgba(255, 255, 255, 0.9)",
    frosted: "rgba(255, 255, 255, 0.8)",
    dark: "rgba(15, 23, 42, 0.9)",
  },
};

export default colors;
