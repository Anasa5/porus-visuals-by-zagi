// components/UploadForm.jsx
"use client";

import { useRef, useState } from "react";

// ---------------------------------------------------------------------------
// ICONS
// ---------------------------------------------------------------------------

function UploadCloudIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 16l-4-4-4 4" />
      <path d="M12 12v9" />
      <path d="M20.4 16.6A5 5 0 0 0 18 7h-1.3A7 7 0 1 0 5 15" />
    </svg>
  );
}
function FileIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
function ImageIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M21 15.5 16 11l-6.5 6.5" />
    </svg>
  );
}
function CheckIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}
function CloseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}
function SpinnerIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SHARED STYLES
// ---------------------------------------------------------------------------
const labelClass =
  "block text-xs font-medium text-text-secondary sm:text-[13px]";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-line bg-surface-dark px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/70 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/25";

const CATEGORY_OPTIONS = [
  { value: "pngs", label: "PNGs" },
  { value: "backgrounds", label: "Backgrounds" },
  { value: "animations", label: "Animations" },
  { value: "sfx", label: "SFX" },
  { value: "fonts", label: "Fonts" },
  { value: "overlays", label: "Overlays" },
];

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [uploadedAsset, setUploadedAsset] = useState(null);

  const inputRef = useRef(null);
  const thumbInputRef = useRef(null);

  function handleFileChange(event) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setStatus("idle");
    setMessage("");
    setUploadedAsset(null);
    if (selected && !name) {
      setName(selected.name.replace(/\.[^/.]+$/, ""));
    }
  }

  function handleThumbChange(event) {
    const selected = event.target.files?.[0] ?? null;
    setThumbnail(selected);
  }

  function handleRemoveFile() {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemoveThumb() {
    setThumbnail(null);
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  }

  function resetForm() {
    setFile(null);
    setThumbnail(null);
    setName("");
    setCategory("");
    setDescription("");
    setTags("");
    if (inputRef.current) inputRef.current.value = "";
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setStatus("error");
      setMessage("Please choose a file first.");
      return;
    }
    if (!name.trim()) {
      setStatus("error");
      setMessage("Asset name is required.");
      return;
    }
    if (!category) {
      setStatus("error");
      setMessage("Please choose a category.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name.trim());
    formData.append("category", category);
    formData.append("description", description.trim());
    formData.append("tags", tags.trim());
    if (thumbnail) formData.append("thumbnail", thumbnail);

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.message || `Upload failed (HTTP ${res.status}).`);
        return;
      }

      setStatus("success");
      setMessage(`Uploaded "${data.asset?.title ?? name}".`);
      setUploadedAsset(data.asset);
      resetForm();
    } catch (err) {
      setStatus("error");
      setMessage(err?.message || "Network error — could not reach the server.");
    }
  }

  const isLoading = status === "loading";

  const fileSizeLabel = file
    ? file.size >= 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(file.size / 1024))} KB`
    : "";

  const thumbSizeLabel = thumbnail
    ? thumbnail.size >= 1024 * 1024
      ? `${(thumbnail.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(thumbnail.size / 1024))} KB`
    : "";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-6"
    >
      <div className="mb-4 sm:mb-5">
        <h2 className="text-base font-semibold tracking-tight text-text-primary sm:text-lg">
          Upload an asset
        </h2>
        <p className="mt-1 text-xs text-text-secondary sm:text-[13px]">
          Add a new resource to the treasury.
        </p>
      </div>

      {/* ---------- Main file ---------- */}
      <div>
        <label htmlFor="asset-file" className={labelClass}>
          File
        </label>

        {file ? (
          <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 p-3 sm:p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent-soft">
              <FileIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {file.name}
              </p>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                {fileSizeLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={isLoading}
              aria-label="Remove file"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary outline-none transition hover:bg-surface-light hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-95 disabled:opacity-50"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="asset-file"
            className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-dark px-4 py-8 text-center outline-none transition hover:border-accent/50 hover:bg-surface-light focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/25 sm:py-10"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent-soft">
              <UploadCloudIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                Tap to choose a file
              </p>
              <p className="mt-0.5 text-[11px] text-text-secondary sm:text-xs">
                PNG, MP4, MOV, WAV, TTF
              </p>
            </div>
          </label>
        )}

        <input
          ref={inputRef}
          id="asset-file"
          name="asset-file"
          type="file"
          onChange={handleFileChange}
          disabled={isLoading}
          className="sr-only"
        />
      </div>

      {/* ---------- Thumbnail (optional) ---------- */}
      <div className="mt-4">
        <label htmlFor="asset-thumbnail" className={labelClass}>
          Thumbnail (optional)
        </label>

        {thumbnail ? (
          <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-line bg-surface-dark p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent-soft">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {thumbnail.name}
              </p>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                {thumbSizeLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveThumb}
              disabled={isLoading}
              aria-label="Remove thumbnail"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary outline-none transition hover:bg-surface-light hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-95 disabled:opacity-50"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="asset-thumbnail"
            className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface-dark px-3 py-3 text-left outline-none transition hover:border-accent/50 hover:bg-surface-light focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/25"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent-soft">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-text-primary">
                Add a thumbnail
              </p>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                For fonts, audio, and other non-image files. If skipped, images
                use their own preview.
              </p>
            </div>
          </label>
        )}

        <input
          ref={thumbInputRef}
          id="asset-thumbnail"
          name="asset-thumbnail"
          type="file"
          accept="image/*"
          onChange={handleThumbChange}
          disabled={isLoading}
          className="sr-only"
        />
      </div>

      {/* ---------- Name ---------- */}
      <div className="mt-4">
        <label htmlFor="asset-name" className={labelClass}>
          Asset name
        </label>
        <input
          id="asset-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          placeholder="e.g. Cinematic Light Leak"
          className={fieldClass}
        />
      </div>

      {/* ---------- Category ---------- */}
      <div className="mt-4">
        <label htmlFor="asset-category" className={labelClass}>
          Category
        </label>
        <select
          id="asset-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isLoading}
          className={`${fieldClass} appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238A8A8E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")",
          }}
        >
          <option value="" disabled>Select a category…</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* ---------- Description ---------- */}
      <div className="mt-4">
        <label htmlFor="asset-description" className={labelClass}>
          Description
        </label>
        <textarea
          id="asset-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          placeholder="Short description shown on the asset page."
          className={`${fieldClass} resize-none`}
        />
      </div>

      {/* ---------- Tags ---------- */}
      <div className="mt-4">
        <label htmlFor="asset-tags" className={labelClass}>
          Tags
        </label>
        <input
          id="asset-tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={isLoading}
          placeholder="cinematic, light, overlay"
          className={fieldClass}
        />
        <p className="mt-1.5 text-[11px] text-text-secondary">
          Separate tags with commas.
        </p>
      </div>

      {/* ---------- Submit ---------- */}
      <div className="mt-5 sm:mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white outline-none transition hover:bg-accent-dark focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <UploadCloudIcon className="h-4 w-4" />
              Upload asset
            </>
          )}
        </button>

        {status === "success" && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">{message}</p>
              {uploadedAsset && (
                <a
                  href={`/asset/${uploadedAsset.id}`}
                  className="mt-1 inline-block underline underline-offset-2 hover:text-emerald-200"
                >
                  View asset →
                </a>
              )}
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {message}
          </div>
        )}
      </div>
    </form>
  );
}