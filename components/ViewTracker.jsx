// components/ViewTracker.jsx
"use client";
// Records an asset view in localStorage so the homepage can show a
// "Recently viewed" section. Renders nothing.

import { useEffect } from "react";

const STORAGE_KEY = "porus:recently-viewed";
const MAX_ITEMS = 12;

export default function ViewTracker({ asset }) {
  useEffect(() => {
    if (!asset?.id) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const safeList = Array.isArray(list) ? list : [];

      // Remove any previous entry for this asset, then prepend the fresh one.
      const without = safeList.filter((item) => item?.id !== asset.id);

      const entry = {
        id: String(asset.id),
        title: asset.title ?? "Untitled",
        type: asset.asset_type ?? "png",
        previewUrl: asset.preview_url ?? null,
        category: asset.category ?? "",
        meta: asset.file_format ?? null,
      };

      const updated = [entry, ...without].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage can throw in private mode or if the quota is full.
      // It's non-critical, so we silently ignore failures.
    }
  }, [
    asset?.id,
    asset?.title,
    asset?.asset_type,
    asset?.preview_url,
    asset?.category,
    asset?.file_format,
  ]);

  return null;
}