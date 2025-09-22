// Design System - Typography
// Inspired by modern healthcare UI with clean, sophisticated fonts

export const typography = {
  // Font families (inspired by the sleek design aesthetic)
  fonts: {
    // Primary font - Inter (modern, clean, excellent for medical data)
    primary:
      '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

    // Display font - Plus Jakarta Sans (sophisticated, modern alternative to Poppins)
    display:
      '"Plus Jakarta Sans", "Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

    // Mono font - JetBrains Mono (for precise medical data, numbers)
    mono: '"JetBrains Mono", "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Source Code Pro", monospace',
  },

  // Font weights (expanded range for sophisticated typography)
  weights: {
    thin: 100,
    extraLight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
    extraBold: 800,
    black: 900,
  },

  // Font sizes (refined scale for modern UI)
  sizes: {
    xs: ["0.75rem", { lineHeight: "1rem" }], // 12px - small labels
    sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px - body text
    base: ["1rem", { lineHeight: "1.5rem" }], // 16px - default
    lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px - emphasized text
    xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px - small headings
    "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px - card titles
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px - section headers
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px - page titles
    "5xl": ["3rem", { lineHeight: "3.25rem" }], // 48px - hero text
    "6xl": ["3.75rem", { lineHeight: "4rem" }], // 60px - display
    "7xl": ["4.5rem", { lineHeight: "4.75rem" }], // 72px - large display
  },

  // Text styles for modern healthcare components
  styles: {
    // Headings (sophisticated hierarchy)
    h1: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: "2.5rem",
      letterSpacing: "-0.025em",
    },
    h2: {
      fontFamily: '"Poppins", sans-serif',
      fontSize: "1.875rem",
      fontWeight: 600,
      lineHeight: "2.25rem",
      letterSpacing: "-0.025em",
    },
    h3: {
      fontFamily: '"Poppins", sans-serif',
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: "2rem",
    },
    h4: {
      fontFamily: '"Inter", sans-serif',
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: "1.75rem",
    },
    h5: {
      fontFamily: '"Inter", sans-serif',
      fontSize: "1.125rem",
      fontWeight: 500,
      lineHeight: "1.75rem",
    },

    // Body text
    body: {
      fontFamily: '"Inter", sans-serif',
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: "1.5rem",
    },
    bodyLarge: {
      fontFamily: '"Inter", sans-serif',
      fontSize: "1.125rem",
      fontWeight: 400,
      lineHeight: "1.75rem",
    },
    bodySmall: {
      fontFamily: '"Inter", sans-serif',
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: "1.25rem",
    },

    // Special text
    caption: {
      fontFamily: '"Inter", sans-serif',
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: "1rem",
      color: "#64748b",
    },
    overline: {
      fontFamily: '"Inter", sans-serif',
      fontSize: "0.75rem",
      fontWeight: 600,
      lineHeight: "1rem",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },

    // Data/numbers
    data: {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: "1.5rem",
    },
    dataLarge: {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: "2rem",
    },

    // Interactive elements
    button: {
      fontFamily: '"Inter", sans-serif',
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: "1.25rem",
    },
    buttonLarge: {
      fontFamily: '"Inter", sans-serif',
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: "1.5rem",
    },
    label: {
      fontFamily: '"Inter", sans-serif',
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: "1.25rem",
    },
  },

  // Letter spacing
  tracking: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },

  // Line heights
  leading: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// Google Fonts URL for importing
export const googleFontsUrl =
  "https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Poppins:wght@100;200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap";

export default typography;
