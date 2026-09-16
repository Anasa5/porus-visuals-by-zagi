// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't advertise the framework in response headers.
  poweredByHeader: false,

  // gzip responses (on by default, but explicit).
  compress: true,

  // React strict mode catches bugs during development only.
  reactStrictMode: true,

  // Strip console.log in production builds (keeps errors/warnings).
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Allow Cloudinary images if you ever switch to next/image.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // Only bundle the icons we actually import from these libs — currently
  // nothing uses this, but it's ready for later.
  experimental: {
    optimizePackageImports: [],
  },
};

module.exports = nextConfig;