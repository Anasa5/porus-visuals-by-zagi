// app/api/delete/route.js
// POST /api/delete
// Deletes an asset from Supabase and (best-effort) from Cloudinary.
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { cloudinary, isCloudinaryConfigured } from "../../../lib/cloudinary";
import { supabaseAdmin } from "../../../lib/supabase";

export async function POST(request) {
  if (!supabaseAdmin) {
    return jsonError(500, "supabase_not_configured", "SUPABASE_SERVICE_ROLE_KEY is missing from .env.local.");
  }

  // Read the id from the JSON body.
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_body", "Expected JSON body.");
  }

  const id = body?.id;
  if (!id) {
    return jsonError(400, "missing_id", "Provide the asset id.");
  }

  // Fetch the row so we know the Cloudinary URL.
  const { data: asset, error: fetchError } = await supabaseAdmin
    .from("assets")
    .select("id, file_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return jsonError(500, "db_fetch_failed", fetchError.message);
  }
  if (!asset) {
    return jsonError(404, "not_found", "Asset doesn't exist.");
  }

  // Try to delete the file from Cloudinary (best-effort).
  if (isCloudinaryConfigured && asset.file_url) {
    const parsed = parseCloudinaryUrl(asset.file_url);
    if (parsed) {
      try {
        await cloudinary.uploader.destroy(parsed.publicId, {
          resource_type: parsed.resourceType,
        });
      } catch (err) {
        // Don't fail the whole request if Cloudinary deletion fails.
        console.error("Cloudinary delete failed:", err?.message);
      }
    }
  }

  // Delete the row from Supabase.
  const { error: deleteError } = await supabaseAdmin
    .from("assets")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return jsonError(500, "db_delete_failed", deleteError.message);
  }

  // Tell Next.js the cached pages are now stale.
    revalidateTag("assets");
  revalidatePath("/");
  revalidatePath("/admin");
  return NextResponse.json(
    { ok: true, deletedId: id },
    { status: 200, headers: { "Cache-Control": "no-store" } }
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

// Parse a Cloudinary URL into the pieces we need for the destroy call.
// Example URL:
//   https://res.cloudinary.com/cloud/image/upload/v123/editor-treasury/foo-456.png
// Returns:
//   { resourceType: "image", publicId: "editor-treasury/foo-456" }
function parseCloudinaryUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    // parts[0] = cloud name, parts[1] = resource type, then "upload"
    const resourceType = parts[1];
    const uploadIdx = parts.indexOf("upload");
    if (uploadIdx === -1) return null;

    let rest = parts.slice(uploadIdx + 1);
    // Skip the version segment if present (looks like "v1234567890").
    if (rest[0] && /^v\d+$/.test(rest[0])) rest = rest.slice(1);

    const fullPath = rest.join("/");
    const publicId = fullPath.replace(/\.[^/.]+$/, ""); // strip extension

    if (!resourceType || !publicId) return null;
    return { resourceType, publicId };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// METHOD GUARDS
// ---------------------------------------------------------------------------
export async function GET() {
  return methodNotAllowed();
}
export async function PUT() {
  return methodNotAllowed();
}
export async function DELETE() {
  return methodNotAllowed();
}

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } }
  );
}