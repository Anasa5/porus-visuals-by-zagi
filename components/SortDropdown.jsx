// components/SortDropdown.jsx
"use client";
// Client component — a native <select> that navigates on change.

import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "newest",    label: "Newest" },
  { value: "oldest",    label: "Oldest" },
  { value: "downloads", label: "Most downloaded" },
  { value: "az",        label: "A–Z" },
];

export default function SortDropdown({ value, currentCategory, currentQ }) {
  const router = useRouter();

  function handleChange(event) {
    const next = event.target.value;

    // Build the new URL, preserving category and search.
    const sp = new URLSearchParams();
    if (currentCategory) sp.set("category", currentCategory);
    if (currentQ) sp.set("q", currentQ);
    if (next !== "newest") sp.set("sort", next);
    // Any change resets pagination.

    const qs = sp.toString();
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={handleChange}
        aria-label="Sort assets"
        className="appearance-none rounded-lg border border-line bg-background/60 py-1.5 pl-3 pr-8 text-xs font-medium text-text-primary outline-none transition hover:border-line-strong focus:border-accent/50 focus:ring-2 focus:ring-accent/25 sm:text-[13px]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238A8A8E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.5rem center",
          backgroundSize: "14px",
        }}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}