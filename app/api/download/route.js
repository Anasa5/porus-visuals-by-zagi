// app/api/download/route.js
// GET /api/download?id=<asset-id>
// Placeholder endpoint for the future asset download flow.
// Real implementation (Supabase lookup + Cloudinary redirect) comes later.

import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// GET
// Validates the query string, then returns 501 Not Implemented.
// The validation logic stays in the real version — only the final response
// block will change.
// ---------------------------------------------------------------------------
export async function GET(request) {
  // Read ?id=<asset-id> from the URL.
  // `request.url` is the full URL, so `new URL()` lets us use .searchParams.
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // ── Missing or empty id ───────────────────────────────────────────────
  // This is a real error the caller made — 400 is the correct status.
  if (!id || id.trim() === "") {
    return NextResponse.json(
      {
        ok: false,
        error: "missing_id",
        message: "Provide an asset id via the ?id= query parameter.",
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  // ── Placeholder response ──────────────────────────────────────────────
  // When the real implementation lands, this block becomes:
  //
  //   const { data: asset } = await supabase
  //     .from("assets")
  //     .select("*")
  //     .eq("id", id)
  //     .single();
  //
  //   if (!asset) return notFound();
  //
  //   // Increment download counter, then redirect to Cloudinary:
  //   await supabase.rpc("increment_downloads", { asset_id: id });
  //   return NextResponse.redirect(asset.file_url);
  //
  return NextResponse.json(
    {
      ok: false,
      error: "not_implemented",
      message:
        "Download endpoint is not wired up yet. Supabase lookup and Cloudinary delivery coming soon.",
      receivedId: id,
    },
    {
      status: 501,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

// ---------------------------------------------------------------------------
// METHOD GUARD
// Downloads are read-only, so only GET is allowed. Everything else gets 405.
// ---------------------------------------------------------------------------
export async function POST() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

// ---------------------------------------------------------------------------
// HELPER
// ---------------------------------------------------------------------------
function methodNotAllowed() {
  return NextResponse.json(
    {
      ok: false,
      error: "method_not_allowed",
      message: "Use GET to download an asset.",
    },
    {
      status: 405,
      headers: {
        Allow: "GET",
        "Cache-Control": "no-store",
      },
    }
  );
}