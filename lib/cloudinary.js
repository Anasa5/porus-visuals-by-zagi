// lib/cloudinary.js
// Cloudinary server SDK setup.
//
// ⚠️  SERVER-ONLY. Never import this file into a component marked
//     "use client". CLOUDINARY_API_SECRET must never reach the browser.
//
// Nothing in this file is called yet — it just makes a configured client
// available for the upload API route when that gets implemented.

import { v2 as cloudinary } from "cloudinary";

// ---------------------------------------------------------------------------
// ENVIRONMENT
// ---------------------------------------------------------------------------
// All three values come from .env.local. None of them use the NEXT_PUBLIC_
// prefix, which means Next.js will never inline them into the client bundle.
// ---------------------------------------------------------------------------

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// ---------------------------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------------------------
// Only configure the SDK if all three values are present. This lets the app
// run while CLOUDINARY_API_SECRET is still blank in .env.local — uploads
// will simply refuse with a clear error instead of crashing the whole site.
// ---------------------------------------------------------------------------

const allValuesPresent = Boolean(cloudName && apiKey && apiSecret);

if (allValuesPresent) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true, // Always serve assets over HTTPS.
  });
}

// ---------------------------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------------------------

// The configured Cloudinary SDK. If the env vars are missing, this is the
// unconfigured SDK — any call will throw "Must supply api_key" etc.
export { cloudinary };

// A simple flag so API routes can return a clean error before ever calling
// the SDK. Example:
//
//   import { cloudinary, isCloudinaryConfigured } from "../../../lib/cloudinary";
//
//   if (!isCloudinaryConfigured) {
//     return NextResponse.json(
//       { error: "cloudinary_not_configured" },
//       { status: 500 }
//     );
//   }
//
//   const result = await cloudinary.uploader.upload(...);
export const isCloudinaryConfigured = allValuesPresent;