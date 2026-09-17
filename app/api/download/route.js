// app/api/download/route.js
// GET /api/download?id=<asset-id>
// Increments the download counter and redirects to the file.

import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "../../../lib/supabase";

export async function GET(request) {
  if (!supabaseAdmin) {
    return jsonError(500, "supabase_not_configured", "Server isn't fully configured.");
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return jsonError(400, "missing_id", "Provide an asset id via ?id=");
  }

  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return jsonError(400, "invalid_id", "Asset id must be a number.");
  }

  // Fetch the asset (need file_url + title + current count).
  const { data: asset, error } = await supabaseAdmin
    .from("assets")
    .select("id, title, file_url, download_count")
    .eq("id", numericId)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    return jsonError(500, "db_error", error.message);
  }
  if (!asset) {
    return jsonError(404, "not_found", "Asset doesn't exist or isn't published.");
  }

  // Increment the counter. Best-effort — if this fails, we still serve the file.
  try {
    await supabaseAdmin
      .from("assets")
      .update({ download_count: (asset.download_count ?? 0) + 1 })
      .eq("id", numericId);

    // Invalidate cached pages so Trending + admin stats pick up the new count.
    revalidateTag("assets");
  } catch (err) {
    console.error("Failed to increment download count:", err?.message);
  }

  // Build the final URL, adding fl_attachment for Cloudinary files.
  const finalUrl = buildDownloadUrl(asset.file_url, asset.title);

  // Redirect the browser to the file. Cloudinary will send
  // Content-Disposition: attachment (because of fl_attachment) so the browser
  // downloads it instead of opening it in a tab.
  return NextResponse.redirect(finalUrl, 302);
}

// ---------------------------------------------------------------------------
// METHOD GUARDS
// ---------------------------------------------------------------------------
export async function POST() { return methodNotAllowed(); }
export async function PUT() { return methodNotAllowed(); }
export async function DELETE() { return methodNotAllowed(); }
export async function PATCH() { return methodNotAllowed(); }

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405, headers: { Allow: "GET", "Cache-Control": "no-store" } }
  );
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function jsonError(status, error, message) {
  return NextResponse.json(
    { ok: false, error, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

// Add a Cloudinary transform that forces an attachment download.
// Skips raw resources — Cloudinary 404s on transformed raw URLs, and fonts
// / some audio uploads are stored as raw.
function buildDownloadUrl(url, title) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/raw/upload/")) return url;

  const safeName = slugifyFilename(title);
  const transform = `fl_attachment:${safeName}`;

  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const base = url.slice(0, idx + marker.length);
  const rest = url.slice(idx + marker.length);

  // Already transformed — don't double up.
  if (rest.startsWith("fl_attachment")) return url;

  return `${base}${transform}/${rest}`;
}

// Cloudinary's fl_attachment only accepts a restricted filename.
function slugifyFilename(title) {
  return (
    String(title || "download")
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .toLowerCase() || "download"
  );
}