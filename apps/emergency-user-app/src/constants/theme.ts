export const theme = {
  colors: {
    // Primary Emergency Red Theme
    primary: "#E53E3E",
    primaryLight: "#FEB2B2",
    primaryDark: "#C53030",

    // Secondary Blue for Healthcare
    secondary: "#3182CE",
    secondaryLight: "#90CDF4",
    secondaryDark: "#2C5282",

    // Emergency Colors
    critical: "#E53E3E",
    urgent: "#F56500",
    warning: "#ECC94B",
    success: "#38A169",

    // Neutral Colors
    background: "#FFFFFF",
    backgroundSecondary: "#F7FAFC",
    backgroundTertiary: "#EDF2F7",

    surface: "#FFFFFF",
    surfaceSecondary: "#F7FAFC",

    text: "#1A202C",
    textSecondary: "#4A5568",
    textTertiary: "#718096",
    textLight: "#A0AEC0",

    border: "#E2E8F0",
    borderLight: "#EDF2F7",

    // Status Colors
    error: "#E53E3E",
    errorLight: "#FEB2B2",
    info: "#3182CE",
    infoLight: "#90CDF4",

    // Transparent overlays
    overlay: "rgba(26, 32, 44, 0.6)",
    overlayLight: "rgba(26, 32, 44, 0.3)",

    // White & Black
    white: "#FFFFFF",
    black: "#000000",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 50,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    heading: 36,
  },

  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
  },

  animations: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
} as const;

export type Theme = typeof theme;
