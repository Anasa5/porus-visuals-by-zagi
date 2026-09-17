// components/UploadForm.jsx
"use client";

import { useRef, useState } from "react";

// ---------------------------------------------------------------------------
// FILE FILTERING
// Only these extensions are accepted. Anything else is skipped with a count.
// Prevents accidental selection of system files, .git contents, node_modules,
// documents, etc. when selecting a whole folder.
// ---------------------------------------------------------------------------
const SUPPORTED_EXTENSIONS = new Set([
  // Images
  "png", "jpg", "jpeg", "webp", "gif", "svg", "avif", "bmp", "tiff", "tif",
  // Video
  "mp4", "mov", "webm", "avi", "mkv", "m4v",
  // Audio
  "mp3", "wav", "ogg", "m4a", "aac", "flac",
  // Fonts
  "ttf", "otf", "woff", "woff2",
]);

// System files that some OSes inject into folders — always skip these.
const BLOCKED_FILENAMES = new Set([
  ".ds_store", "thumbs.db", "desktop.ini", "icon\r",
]);

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
function FolderIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
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
function AlertIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
function RefreshIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-2.6-6.3" />
      <path d="M21 4v5h-5" />
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
// HELPERS
// ---------------------------------------------------------------------------

// Check whether a File looks like a supported asset.
function isSupportedAsset(file) {
  const name = file.name || "";
  if (name.startsWith(".")) return false;
  if (BLOCKED_FILENAMES.has(name.toLowerCase())) return false;

  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  return SUPPORTED_EXTENSIONS.has(ext);
}

// Turn a File into a queue item, using its filename (without extension)
// as the initial asset title.
function toQueueItem(file) {
  return {
    file,
    status: "pending",
    message: "",
    name: file.name.replace(/\.[^/.]+$/, ""),
  };
}

// "photo.PNG" -> "PNG"
function fileExtension(filename) {
  if (!filename || !filename.includes(".")) return "";
  return filename.split(".").pop().toUpperCase();
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

export default function UploadForm() {
  // Each item: { file, name, status, message }
  // status: "pending" | "uploading" | "success" | "error"
  const [queue, setQueue] = useState([]);

  // Count of files that were skipped because they didn't match the whitelist.
  const [skippedCount, setSkippedCount] = useState(0);

  // Shared form fields applied to every file in the batch.
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState(null); // { total, success, errors }

  // Two hidden inputs: one for files, one for folders.
  const filesInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // ---- Selection handling --------------------------------------------------

  function handleSelection(event) {
    const incoming = Array.from(event.target.files ?? []);
    if (incoming.length === 0) return;

    const accepted = [];
    let skipped = 0;

    for (const file of incoming) {
      if (isSupportedAsset(file)) {
        accepted.push(toQueueItem(file));
      } else {
        skipped++;
      }
    }

    // Append to the queue (so selecting another folder doesn't erase progress).
    setQueue((prev) => [...prev, ...accepted]);
    setSkippedCount((prev) => prev + skipped);
    setSummary(null);

    // Reset the input so selecting the same files again re-triggers onChange.
    event.target.value = "";
  }

  function handleClearQueue() {
    setQueue([]);
    setSkippedCount(0);
    setSummary(null);
    if (filesInputRef.current) filesInputRef.current.value = "";
    if (folderInputRef.current) folderInputRef.current.value = "";
  }

  function removeItem(index) {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }

  function renameItem(index, newName) {
    setQueue((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name: newName } : item))
    );
  }

  // ---- Retry failed -------------------------------------------------------

  function handleRetryFailed() {
    setQueue((prev) =>
      prev.map((item) =>
        item.status === "error"
          ? { ...item, status: "pending", message: "" }
          : item
      )
    );
    setSummary(null);
  }

  // ---- Submit --------------------------------------------------------------

  async function handleSubmit(event) {
    event.preventDefault();

    if (queue.length === 0) {
      alert("Please choose at least one file.");
      return;
    }
    if (!category) {
      alert("Please choose a category.");
      return;
    }

    setIsUploading(true);
    setSummary(null);

    // Work on a local copy so we can update it as we go.
    const working = [...queue];

    for (let i = 0; i < working.length; i++) {
      // Skip anything that already succeeded in a previous pass.
      if (working[i].status === "success") continue;

      working[i] = { ...working[i], status: "uploading", message: "" };
      setQueue([...working]);

      const item = working[i];

      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("name", item.name);
      formData.append("category", category);
      formData.append("description", description.trim());
      formData.append("tags", tags.trim());

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          working[i] = {
            ...working[i],
            status: "error",
            message: data.message || `Failed (HTTP ${res.status}).`,
          };
        } else {
          working[i] = {
            ...working[i],
            status: "success",
            message: "Uploaded.",
          };
        }
      } catch (err) {
        working[i] = {
          ...working[i],
          status: "error",
          message: err?.message || "Network error.",
        };
      }

      setQueue([...working]);
    }

    setIsUploading(false);

    const successes = working.filter((i) => i.status === "success").length;
    const errors = working.filter((i) => i.status === "error").length;

    setSummary({ total: working.length, success: successes, errors });

    // If everything succeeded, clear the queue after a short delay.
    if (errors === 0) {
      setTimeout(() => {
        setQueue([]);
        setSkippedCount(0);
        setSummary(null);
        if (filesInputRef.current) filesInputRef.current.value = "";
        if (folderInputRef.current) folderInputRef.current.value = "";
      }, 2000);
    }
  }

  // ---- Derived state -------------------------------------------------------

  const pendingCount = queue.filter((i) => i.status === "pending").length;
  const hasFailed = queue.some((i) => i.status === "error");
  const allDone = queue.length > 0 && queue.every((i) => i.status === "success");

  // ---- UI ------------------------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-6"
    >
      {/* Heading */}
      <div className="mb-4 sm:mb-5">
        <h2 className="text-base font-semibold tracking-tight text-text-primary sm:text-lg">
          Mass upload
        </h2>
        <p className="mt-1 text-xs text-text-secondary sm:text-[13px]">
          Select individual files or an entire folder. Only supported asset
          types are queued — images, video, audio, and fonts.
        </p>
      </div>

      {/* Selection area */}
      <div>
        <label className={labelClass}>Files or folder</label>

        {queue.length > 0 ? (
          <div className="mt-1.5 space-y-2">
            {/* Summary bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2">
              <span className="text-xs font-medium text-text-primary sm:text-[13px]">
                {queue.length} file{queue.length === 1 ? "" : "s"} ready
                {skippedCount > 0 && (
                  <span className="ml-1.5 text-[11px] font-normal text-text-secondary">
                    ({skippedCount} skipped)
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1">
                {/* Add more files */}
                <button
                  type="button"
                  onClick={() => filesInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-lg px-2 py-1 text-[11px] font-medium text-text-secondary transition hover:bg-surface-light hover:text-text-primary disabled:opacity-50"
                >
                  + Files
                </button>
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-lg px-2 py-1 text-[11px] font-medium text-text-secondary transition hover:bg-surface-light hover:text-text-primary disabled:opacity-50"
                >
                  + Folder
                </button>
                <button
                  type="button"
                  onClick={handleClearQueue}
                  disabled={isUploading}
                  className="rounded-lg px-2 py-1 text-[11px] font-medium text-text-secondary transition hover:bg-surface-light hover:text-text-primary disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Per-file list */}
            <ul className="max-h-64 space-y-1.5 overflow-y-auto rounded-lg border border-line bg-surface-dark p-2">
              {queue.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5"
                >
                  {/* Status icon */}
                  <span className="shrink-0">
                    {item.status === "pending" && (
                      <FileIcon className="h-4 w-4 text-text-secondary" />
                    )}
                    {item.status === "uploading" && (
                      <SpinnerIcon className="h-4 w-4 animate-spin text-accent-soft" />
                    )}
                    {item.status === "success" && (
                      <CheckIcon className="h-4 w-4 text-emerald-400" />
                    )}
                    {item.status === "error" && (
                      <AlertIcon className="h-4 w-4 text-red-400" />
                    )}
                  </span>

                  {/* Name + info */}
                  <div className="min-w-0 flex-1">
                    {item.status === "pending" && !isUploading ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => renameItem(i, e.target.value)}
                        className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[12px] font-medium text-text-primary outline-none transition hover:border-line focus:border-accent/60 focus:bg-surface-dark sm:text-[13px]"
                      />
                    ) : (
                      <p className="truncate px-1 text-[12px] font-medium text-text-primary sm:text-[13px]">
                        {item.name}
                      </p>
                    )}
                    <p className="truncate px-1 text-[10px] text-text-secondary">
                      {fileExtension(item.file.name)}
                      {item.message ? ` · ${item.message}` : ""}
                    </p>
                  </div>

                  {/* Remove */}
                  {!isUploading && item.status !== "success" && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      aria-label="Remove"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-secondary transition hover:bg-surface-light hover:text-text-primary"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {/* Retry failed */}
            {hasFailed && !isUploading && (
              <button
                type="button"
                onClick={handleRetryFailed}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] font-medium text-amber-300 transition hover:bg-amber-500/15 sm:text-[13px]"
              >
                <RefreshIcon className="h-3.5 w-3.5" />
                Retry failed uploads
              </button>
            )}
          </div>
        ) : (
          // ------------------ Empty state: pick files or folder ---------------
          <div className="mt-1.5 rounded-xl border border-dashed border-line-strong bg-surface-dark p-4 sm:p-5">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent-soft">
                <UploadCloudIcon className="h-5 w-5" />
              </div>
              <p className="mt-2.5 text-sm font-medium text-text-primary">
                Add assets to the queue
              </p>
              <p className="mt-0.5 max-w-sm text-[11px] text-text-secondary sm:text-xs">
                Pick individual files, or select a folder to add everything
                inside it (including subfolders).
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => filesInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2 text-[13px] font-medium text-text-primary outline-none transition hover:border-accent/50 hover:bg-surface-light focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.98]"
              >
                <FileIcon className="h-4 w-4" />
                Select files
              </button>
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white outline-none transition hover:bg-accent-dark focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.98]"
              >
                <FolderIcon className="h-4 w-4" />
                Select folder
              </button>
            </div>

            {skippedCount > 0 && (
              <p className="mt-3 text-center text-[11px] text-amber-300">
                {skippedCount} unsupported file
                {skippedCount === 1 ? "" : "s"} skipped.
              </p>
            )}
          </div>
        )}

        {/* Hidden inputs */}
        <input
          ref={filesInputRef}
          id="asset-files"
          type="file"
          multiple
          onChange={handleSelection}
          disabled={isUploading}
          className="sr-only"
        />

        {/* webkitdirectory turns this input into a folder picker.
            Browsers then return every file inside the selected folder
            (and its subfolders) — never the folder itself. */}
        <input
          ref={folderInputRef}
          id="asset-folder"
          type="file"
          multiple
          webkitdirectory=""
          directory=""
          onChange={handleSelection}
          disabled={isUploading}
          className="sr-only"
        />
      </div>

      {/* Shared fields */}
      <div className="mt-5">
        <label htmlFor="batch-category" className={labelClass}>
          Category (applied to all)
        </label>
        <select
          id="batch-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isUploading}
          className={`${fieldClass} appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238A8A8E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")",
          }}
        >
          <option value="" disabled>
            Select a category…
          </option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="batch-description" className={labelClass}>
          Description (optional, applied to all)
        </label>
        <textarea
          id="batch-description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUploading}
          placeholder="Short description for the whole batch."
          className={`${fieldClass} resize-none`}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="batch-tags" className={labelClass}>
          Tags (optional, applied to all)
        </label>
        <input
          id="batch-tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={isUploading}
          placeholder="overlay, cinematic, loop"
          className={fieldClass}
        />
      </div>

      {/* Submit */}
      <div className="mt-5 sm:mt-6">
        <button
          type="submit"
          disabled={isUploading || queue.length === 0 || allDone}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white outline-none transition hover:bg-accent-dark focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isUploading ? (
            <>
              <SpinnerIcon className="h-4 w-4 animate-spin" />
              Uploading {queue.length} file{queue.length === 1 ? "" : "s"}…
            </>
          ) : (
            <>
              <UploadCloudIcon className="h-4 w-4" />
              Upload {pendingCount > 0 ? `${pendingCount} file${pendingCount === 1 ? "" : "s"}` : "all"}
            </>
          )}
        </button>

        {summary && (
          <div
            className={`mt-3 rounded-lg border p-3 text-xs ${
              summary.errors === 0
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
            }`}
          >
            {summary.success} of {summary.total} uploaded successfully
            {summary.errors > 0 ? ` — ${summary.errors} failed` : "."}
          </div>
        )}
      </div>
    </form>
  );
}