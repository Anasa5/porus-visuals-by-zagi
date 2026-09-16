// app/layout.jsx
// Root layout — wraps every page in the app.

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Page metadata — shown in the browser tab and search results.
export const metadata = {
  title: {
    default: "Porus Visuals — Free Assets for Creators",
    template: "%s · Porus Visuals",
  },
  description:
    "A free library of PNGs, backgrounds, animations, overlays, SFX, and fonts for video and content editors.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-text-primary antialiased">
        {/* Decorative background layer */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-40 left-1/2 h-80 w-[min(720px,120vw)] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>

        {/* Column wrapper so the footer sticks to the bottom on short pages */}
        <div className="flex min-h-screen flex-col">
          {/* Every page in the app renders here */}
          <div className="flex-1">{children}</div>

          {/* Global footer */}
          <footer className="mt-4 border-t border-line/60">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
                {/* Left: brand */}
                <p className="text-xs text-text-secondary sm:text-[13px]">
                  <span className="font-semibold text-text-primary">
                    Porus Visuals
                  </span>{" "}
                  — free assets for creators.
                </p>

                {/* Right: credit */}
                <p className="text-[11px] text-text-secondary sm:text-xs">
                  This web was created by{" "}
                  <span className="font-medium text-accent-soft">
                    Zagitorius
                  </span>{" "}
                  and his team.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}