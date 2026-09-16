// app/asset/[id]/page.jsx
// Asset detail page — Server Component.

import Link from "next/link";
import AssetThumbnail from "../../../components/AssetThumbnail";
import { supabaseAdmin } from "../../../lib/supabase";

export const revalidate = 300;

function LogoMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-dark shadow-accent">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white" aria-hidden="true">
        <path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /><path d="m3 17 9 5 9-5" />
      </svg>
    </span>
  );
}
function BackIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M19 12H6" /><path d="m12 5-7 7 7 7" />
    </svg>
  );
}
function DownloadIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 4v11" /><path d="m7 10.5 5 5 5-5" /><path d="M5 20h14" />
    </svg>
  );
}

const TYPE_BADGES = {
  png:       { label: "PNG",   badge: "bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-400/25" },
  video:     { label: "VIDEO", badge: "bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-400/25" },
  animation: { label: "ANIM",  badge: "bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-inset ring-fuchsia-400/25" },
  audio:     { label: "SFX",   badge: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/25" },
  font:      { label: "FONT",  badge: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/25" },
};

const DETAIL_COLUMNS =
  "id, title, description, category, asset_type, tags, file_url, preview_url, file_size, file_format, download_count, uploaded_at, created_at";

async function getAsset(id) {
  if (!supabaseAdmin) return null;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;

  const { data, error } = await supabaseAdmin
    .from("assets")
    .select(DETAIL_COLUMNS)
    .eq("id", numericId)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to load asset:", error.message);
    return null;
  }
  return data;
}

function formatBytes(bytes) {
  if (!bytes || typeof bytes !== "number") return "—";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

export default async function AssetDetailPage({ params }) {
  const asset = await getAsset(params.id);
  if (!asset) return <NotFoundState />;

  const type = asset.asset_type ?? "png";
  const style = TYPE_BADGES[type] ?? TYPE_BADGES.png;
  const tags = Array.isArray(asset.tags) ? asset.tags : [];
  const category = capitalize(asset.category ?? "");
  const size = formatBytes(asset.file_size);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-30 -mx-4 border-b border-line/60 bg-background/80 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16">
          <Link href="/" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text-secondary outline-none transition hover:bg-surface hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-95">
            <BackIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <Link href="/" className="hidden items-center gap-2 text-sm font-semibold tracking-tight text-text-primary outline-none transition hover:text-accent-soft focus-visible:ring-2 focus-visible:ring-accent/60 sm:flex">
            Porus<span className="text-accent-soft">Visuals</span>
          </Link>
          <div className="w-9" />
        </div>
      </header>

      <div className="pt-4 sm:pt-6 lg:pt-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-surface-dark shadow-card ring-1 ring-inset ring-white/5 sm:aspect-video">
              <AssetThumbnail
                src={asset.preview_url}
                alt={asset.title}
                type={type}
                iconClassName="h-16 w-16 text-white/80 sm:h-20 sm:w-20"
                objectFit="contain"
                width={1200}
                priority
              />
              <span className={`absolute left-3 top-3 z-10 rounded-md px-2 py-1 text-[11px] font-semibold tracking-wider backdrop-blur-sm ${style.badge}`}>
                {style.label}
              </span>
              {asset.file_format && (
                <span className="absolute right-3 top-3 z-10 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium text-text-primary backdrop-blur-sm">
                  {asset.file_format}
                </span>
              )}
            </div>

            <div className="mt-5">
              <p className="text-xs text-text-secondary sm:text-[13px]">
                <Link href="/" className="transition hover:text-text-primary">Library</Link>
                <span className="mx-1.5 text-line-strong">/</span>
                <span className="text-text-secondary">{category}</span>
              </p>
              <h1 className="mt-1.5 text-xl font-bold leading-tight tracking-tight text-text-primary sm:text-2xl lg:text-3xl">
                {asset.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary sm:text-[13px]">
                <span>{category}</span>
                <span className="h-1 w-1 rounded-full bg-line-strong" />
                <span>{size}</span>
                <span className="h-1 w-1 rounded-full bg-line-strong" />
                <span>{asset.download_count ?? 0} downloads</span>
              </div>
              {asset.description && (
                <p className="mt-4 text-sm leading-relaxed text-text-secondary sm:text-[15px]">
                  {asset.description}
                </p>
              )}
              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] text-text-secondary">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              <div className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
                <a
                  href={asset.file_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 text-sm font-semibold text-white outline-none transition hover:bg-accent-dark focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.99]"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download · {size}
                </a>
                <p className="mt-3 text-center text-[11px] text-text-secondary">
                  Free for personal and commercial use.
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
                <h2 className="text-sm font-semibold text-text-primary">Details</h2>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                  <MetaItem label="Type" value={style.label} />
                  <MetaItem label="Category" value={category} />
                  <MetaItem label="Format" value={asset.file_format ?? "—"} />
                  <MetaItem label="Size" value={size} />
                  <MetaItem label="Downloads" value={String(asset.download_count ?? 0)} />
                  <MetaItem label="Uploaded" value={formatDate(asset.uploaded_at ?? asset.created_at)} />
                </dl>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="h-14 sm:h-20" />
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wider text-text-secondary">{label}</dt>
      <dd className="mt-0.5 truncate text-[13px] font-medium text-text-primary">{value}</dd>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-30 -mx-4 border-b border-line/60 bg-background/80 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16">
          <Link href="/" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text-secondary outline-none transition hover:bg-surface hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-95">
            <BackIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <Link href="/" className="hidden items-center gap-2 text-sm font-semibold tracking-tight text-text-primary outline-none transition hover:text-accent-soft focus-visible:ring-2 focus-visible:ring-accent/60 sm:flex">
            Porus<span className="text-accent-soft">Visuals</span>
          </Link>
          <div className="w-9" />
        </div>
      </header>
      <section className="pt-10 sm:pt-16 lg:pt-20">
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-line-strong bg-surface-dark px-6 py-12 text-center sm:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent-soft">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
              <path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /><path d="m3 17 9 5 9-5" />
            </svg>
          </div>
          <h1 className="mt-4 text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
            Asset not found
          </h1>
          <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-relaxed text-text-secondary">
            This asset doesn't exist or hasn't been published.
          </p>
          <Link href="/" className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-accent-dark focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.99]">
            Back to library
          </Link>
        </div>
      </section>
      <div className="h-14 sm:h-20" />
    </div>
  );
}