// hero.ts
import { heroui } from "@heroui/react";

export default heroui({
  // Set "indigo" as the default theme so its palette is used when no theme is specified.
  defaultTheme: "indigo",
  themes: {
    // Indigo palette – this remains the default brand theme.  A dark variant
    // is defined below.
    indigo: {
      colors: {
        // INDIGO (Primary)
        primary: {
          50:  "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE", // suave
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5", // marca
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81", // profundo
          DEFAULT: "#4F46E5",
          foreground: "#FFFFFF",
        },

        // FUCHSIA (Secondary)
        secondary: {
          50:  "#FDF4FF",
          100: "#FAE8FF",
          200: "#F5D0FE",
          300: "#F0ABFC",
          400: "#E879F9",
          500: "#D946EF",
          600: "#C026D3",
          700: "#A21CAF",
          800: "#86198F",
          900: "#701A75",
          DEFAULT: "#D946EF",
          foreground: "#FFFFFF",
        },
        foreground: {
          DEFAULT: "#1E293B",
        },
        background: { DEFAULT: "#FFFFFF", foreground: "#1F2937" },
      },
    },

    "indigo-dark": {
      colors: {
        // Mantengo la misma escala para coherencia, pero con DEFAULT algo más “luminoso” en oscuro
        primary: {
          50:  "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1", // DEFAULT en dark: un poco más claro que 600
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          DEFAULT: "#6366F1",
          foreground: "#FFFFFF",
        },

        secondary: {
          50:  "#FDF4FF",
          100: "#FAE8FF",
          200: "#F5D0FE",
          300: "#F0ABFC",
          400: "#E879F9",
          500: "#D946EF", // vibrante en dark
          600: "#C026D3",
          700: "#A21CAF",
          800: "#86198F",
          900: "#701A75",
          DEFAULT: "#D946EF",
          foreground: "#FFFFFF",
        },
        foreground: {
          DEFAULT: "#F5F5F5",
        },
        background: { DEFAULT: "#111827", foreground: "#E5E7EB" },
      },
    },
    // Emerald palette – tuned for readability in both light and dark modes.
    emerald: {
      colors: {
        // A light green palette for the primary colour with readable text on
        // light surfaces.  The dark variant overrides the background below.
        primary: {
          50:  "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          DEFAULT: "#059669",
          foreground: "#FFFFFF",
        },
        // Warm orange tones for the secondary colour.
        secondary: {
          50:  "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
          DEFAULT: "#EA580C",
          foreground: "#FFFFFF",
        },
        foreground: {
          DEFAULT: "#1E293B",
        },
        // Light background and dark foreground for increased contrast.
        background: { DEFAULT: "#ECFDF5", foreground: "#064E3B" },
      },
    },
    // Emerald dark variant – dark surfaces with light text.
    "emerald-dark": {
      colors: {
        primary: {
          50:  "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
        },
        secondary: {
          50:  "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
          DEFAULT: "#EA580C",
          foreground: "#FFFFFF",
        },
        foreground: {
          DEFAULT: "#F5F5F5",
        },
        // Dark green background with a light foreground for legibility.
        background: { DEFAULT: "#064E3B", foreground: "#D1FAE5" },
      },
    },

    // Amber palette – a warm golden palette.  The light variant uses a very
    // light background, and the dark variant flips the contrast for the text.
    amber: {
      colors: {
        primary: {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FBD38D",
          400: "#F6AD55",
          500: "#F59E0B",
          600: "#D97706",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
          DEFAULT: "#F59E0B",
          foreground: "#FFFFFF",
        },
        secondary: {
          50:  "#E0F2FE",
          100: "#BAE6FD",
          200: "#7DD3FC",
          300: "#38BDF8",
          400: "#0EA5E9",
          500: "#0284C7",
          600: "#0369A1",
          700: "#075985",
          800: "#0C4A6E",
          900: "#0A3A58",
          DEFAULT: "#06B6D4",
          foreground: "#FFFFFF",
        },
        foreground: {
          DEFAULT: "#1E293B",
        },
        // Pale background with dark text for light mode.
        background: { DEFAULT: "#FFFBEB", foreground: "#78350F" },
      },
    },
    // Amber dark variant – dark surfaces with light text.
    "amber-dark": {
      colors: {
        primary: {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FBD38D",
          400: "#F6AD55",
          500: "#F59E0B",
          600: "#D97706",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
          DEFAULT: "#F6AD55",
          foreground: "#FFFFFF",
        },
        secondary: {
          50:  "#E0F2FE",
          100: "#BAE6FD",
          200: "#7DD3FC",
          300: "#38BDF8",
          400: "#0EA5E9",
          500: "#0284C7",
          600: "#0369A1",
          700: "#075985",
          800: "#0C4A6E",
          900: "#0A3A58",
          DEFAULT: "#0284C7",
          foreground: "#FFFFFF",
        },
        foreground: {
          DEFAULT: "#F5F5F5",
        },
        // Deep amber/brown background with pale text for dark mode.
        background: { DEFAULT: "#7C2D12", foreground: "#FDE68A" },
      },
    },

    // Rose palette – a new fourth theme inspired by Tailwind's rose and sky colours.
    rose: {
      colors: {
        primary: {
          50:  "#FFF1F2",
          100: "#FFE4E6",
          200: "#FECDD3",
          300: "#FDA4AF",
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
          700: "#BE123C",
          800: "#9F1239",
          900: "#881337",
          DEFAULT: "#F43F5E",
          foreground: "#FFFFFF",
        },
        secondary: {
          50:  "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
          DEFAULT: "#0EA5E9",
          foreground: "#FFFFFF",
        },
        foreground: {
          DEFAULT: "#1E293B",
        },
        background: { DEFAULT: "#FFF1F2", foreground: "#881337" },
      },
    },
    // Rose dark variant – dark surfaces with light rose accents.
    "rose-dark": {
      colors: {
        primary: {
          50:  "#FFF1F2",
          100: "#FFE4E6",
          200: "#FECDD3",
          300: "#FDA4AF",
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
          700: "#BE123C",
          800: "#9F1239",
          900: "#881337",
          DEFAULT: "#E11D48",
          foreground: "#F1F5F9",
        },
        secondary: {
          50:  "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
          DEFAULT: "#0284C7",
          foreground: "#F1F5F9",
        },
        foreground: {
          DEFAULT: "#F5F5F5",
        },
        background: { DEFAULT: "#881337", foreground: "#FFE4E6" },
      },
    },
  },
});
