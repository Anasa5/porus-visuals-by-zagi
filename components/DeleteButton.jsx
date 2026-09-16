// components/DeleteButton.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function TrashIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
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

export default function DeleteButton({ assetId, assetTitle }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete(e) {
    // Stop the click from triggering the surrounding <Link>.
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      `Delete "${assetTitle}"? This can't be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: assetId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        alert(data.message || `Delete failed (HTTP ${res.status}).`);
        setIsDeleting(false);
        return;
      }

      // Reload the server component so the list + stats update.
      router.refresh();
    } catch (err) {
      alert(err?.message || "Network error — could not reach the server.");
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label={`Delete ${assetTitle}`}
      title="Delete"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary outline-none transition hover:bg-red-500/10 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDeleting ? (
        <SpinnerIcon className="h-4 w-4 animate-spin" />
      ) : (
        <TrashIcon className="h-4 w-4" />
      )}
    </button>
  );
}