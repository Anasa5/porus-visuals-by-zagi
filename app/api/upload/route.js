// app/api/upload/route.js
// POST /api/upload
// Uploads the main file (and optional thumbnail) to Cloudinary,
// then inserts a row into Supabase.
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { cloudinary, isCloudinaryConfigured } from "../../../lib/cloudinary";
import { supabaseAdmin } from "../../../lib/supabase";

export async function POST(request) {
  if (!isCloudinaryConfigured) {
    return jsonError(500, "cloudinary_not_configured", "CLOUDINARY_API_SECRET is missing from .env.local.");
  }
  if (!supabaseAdmin) {
    return jsonError(500, "supabase_not_configured", "SUPABASE_SERVICE_ROLE_KEY is missing from .env.local.");
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(400, "invalid_form_data", "Could not read form data.");
  }

  const file = formData.get("file");
  const name = formData.get("name");
  const category = formData.get("category");
  const description = formData.get("description");
  const tagsRaw = formData.get("tags");
  const thumbnailFile = formData.get("thumbnail"); // optional

  if (!file || typeof file === "string") {
    return jsonError(400, "missing_file", "No file was uploaded.");
  }
  if (!name || typeof name !== "string" || name.trim() === "") {
    return jsonError(400, "missing_name", "Asset name is required.");
  }
  if (!category || typeof category !== "string") {
    return jsonError(400, "missing_category", "Category is required.");
  }

  // Upload the main file to Cloudinary
  const buffer = Buffer.from(await file.arrayBuffer());
  const { resourceType, assetType } = classifyFile(file.type || "", file.name);

  let uploadResult;
  try {
    uploadResult = await uploadBufferToCloudinary(buffer, {
      folder: "editor-treasury",
      resourceType,
      publicId: `${slugify(name)}-${Date.now()}`,
    });
  } catch (err) {
    return jsonError(502, "cloudinary_upload_failed", err?.message || "Cloudinary upload failed.");
  }

  // Preview priority: custom thumbnail > the image itself (only for images) > null.
  // Video/audio/font without a custom thumbnail stay null — AssetThumbnail shows a type icon.
  let previewUrl = null;

  if (thumbnailFile && typeof thumbnailFile !== "string") {
    try {
      const thumbBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const thumbResult = await uploadBufferToCloudinary(thumbBuffer, {
        folder: "editor-treasury/thumbnails",
        resourceType: "image",
        publicId: `${slugify(name)}-thumb-${Date.now()}`,
      });
      previewUrl = thumbResult.secure_url;
    } catch (err) {
      // Don't fail the whole upload if the thumbnail fails — just skip it.
      console.error("Thumbnail upload failed:", err?.message);
    }
  } else if (assetType === "png") {
    previewUrl = uploadResult.secure_url;
  }

  const { data, error } = await supabaseAdmin
    .from("assets")
    .insert({
      title: name.trim(),
      description: description?.trim() || null,
      asset_type: assetType,
      category: category.trim().toLowerCase(),
      tags: parseTags(tagsRaw),
      file_url: uploadResult.secure_url,
      preview_url: previewUrl,
      file_size: file.size,
      file_format: getFileExtension(file.name).toUpperCase(),
      download_count: 0,
      is_published: true,
      uploaded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return jsonError(500, "db_insert_failed", error.message);
  }

  // Invalidate cached pages so the new asset appears immediately.
  revalidateTag("assets");
  revalidatePath("/");
  revalidatePath("/admin");

  return NextResponse.json(
    { ok: true, asset: data },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  );
}

// ---------------------------------------------------------------------------
// METHOD GUARDS
// ---------------------------------------------------------------------------
export async function GET() { return methodNotAllowed(); }
export async function PUT() { return methodNotAllowed(); }
export async function DELETE() { return methodNotAllowed(); }
export async function PATCH() { return methodNotAllowed(); }

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed" },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } }
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

// Single pass over the mime/filename instead of two separate functions
// that each re-derived the same category.
function classifyFile(mime, filename) {
  if (mime.startsWith("video/")) return { resourceType: "video", assetType: "video" };
  if (mime.startsWith("audio/")) return { resourceType: "video", assetType: "audio" }; // Cloudinary treats audio as "video"
  if (mime.startsWith("image/")) return { resourceType: "image", assetType: "png" };
  if (/\.(ttf|otf|woff2?)$/i.test(filename)) return { resourceType: "raw", assetType: "font" };
  // Fallback for anything unrecognized — keeps prior behavior (treated as "png"/raw).
  return { resourceType: "raw", assetType: "png" };
}

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function getFileExtension(filename) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop() : "";
}

function parseTags(raw) {
  if (!raw || typeof raw !== "string") return [];
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}

function uploadBufferToCloudinary(buffer, { folder, resourceType, publicId }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, public_id: publicId, overwrite: false },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}