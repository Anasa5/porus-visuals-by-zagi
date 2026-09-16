/** @type {import('tailwindcss').Config} */
module.exports = {
  // ---------------------------------------------------------------
  // CONTENT
  // Tailwind scans these files for class names.
  // If a folder is not listed here, its classes will NOT be generated.
  // ---------------------------------------------------------------
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      // -------------------------------------------------------------
      // COLOURS
      // Layered surfaces (dark -> slightly lighter) keep the UI from
      // looking like one flat black rectangle.
      //
      // Usage examples:
      //   bg-background        -> page canvas
      //   bg-surface           -> cards / panels
      //   bg-surface-light     -> hover state or nested panel
      //   text-text-primary    -> headings & body copy
      //   text-text-secondary  -> muted metadata
      //   border-line          -> hairline dividers
      //   bg-accent            -> primary buttons / highlights
      // -------------------------------------------------------------
      colors: {
        // Deepest layer: the page itself
        background: "#0D0D0F",

        // Raised panels and cards
        surface: {
          DEFAULT: "#1A1A1D", // standard card
          light: "#212126",   // hover / nested panel
          dark: "#141416",    // inset areas (inputs, previews)
        },

        // Brand violet
        accent: {
          DEFAULT: "#8B5CF6",
          soft: "#A78BFA",    // hover / lighter text on dark
          dark: "#7C3AED",    // pressed state
        },

        // Typography
        "text-primary": "#E5E5E7",
        "text-secondary": "#8A8A8E",

        // Borders and separators
        line: "#26262B",
        "line-strong": "#32323A",
      },

      // -------------------------------------------------------------
      // FONT
      // The CSS variable --font-inter is created in app/layout.jsx by
      // next/font/google. Tailwind just references it here, which means
      // the font is self-hosted and there is no layout shift.
      // -------------------------------------------------------------
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },

      // -------------------------------------------------------------
      // SHADOWS
      // Soft, low-opacity shadows read as "premium" on dark UI.
      // Heavy shadows look muddy on near-black backgrounds.
      // -------------------------------------------------------------
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.40), 0 10px 28px -14px rgba(0, 0, 0, 0.65)",
        "card-hover":
          "0 2px 4px rgba(0, 0, 0, 0.45), 0 18px 40px -18px rgba(0, 0, 0, 0.80)",
        accent: "0 10px 26px -12px rgba(139, 92, 246, 0.55)",
      },
    },
  },

  plugins: [],
};