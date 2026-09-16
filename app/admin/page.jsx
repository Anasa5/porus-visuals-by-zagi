// app/admin/page.jsx
// Admin dashboard — Server Component with real Supabase data.

import Link from "next/link";
import UploadForm from "../../components/UploadForm";
import DeleteButton from "../../components/DeleteButton";
import AssetThumbnail from "../../components/AssetThumbnail";
import { supabaseAdmin } from "../../lib/supabase";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// ICONS
// ---------------------------------------------------------------------------
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
function LayersIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" />
    </svg>
  );
}
function DownloadIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 4v11" /><path d="m7 10.5 5 5 5-5" /><path d="M5 20h14" />
    </svg>
  );
}
function GridIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}
function ClockIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function formatBytes(bytes) {
  if (!bytes || typeof bytes !== "number") return "—";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
function relativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------
async function getStats() {
  if (!supabaseAdmin) return { total: 0, downloads: 0, categories: 0, newThisWeek: 0 };

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [totalRes, catRes, newRes, dlRes] = await Promise.all([
    supabaseAdmin.from("assets").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("assets").select("category"),
    supabaseAdmin.from("assets").select("*", { count: "exact", head: true }).gte("uploaded_at", weekAgo),
    supabaseAdmin.from("assets").select("download_count"),
  ]);

  return {
    total: totalRes.count ?? 0,
    newThisWeek: newRes.count ?? 0,
    categories: new Set((catRes.data ?? []).map((r) => r.category).filter(Boolean)).size,
    downloads: (dlRes.data ?? []).reduce((s, r) => s + (r.download_count ?? 0), 0),
  };
}

async function getRecentUploads() {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from("assets")
    .select("*")
    .order("uploaded_at", { ascending: false })
    .limit(10);
  if (error) {
    console.error("Failed to load uploads:", error.message);
    return [];
  }
  return data ?? [];
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------
export default async function AdminPage() {
  const [stats, uploads] = await Promise.all([getStats(), getRecentUploads()]);

  const statCards = [
    { label: "Total Assets", value: String(stats.total), helper: "Assets in the library", Icon: LayersIcon },
    { label: "Downloads", value: String(stats.downloads), helper: "Across all assets", Icon: DownloadIcon },
    { label: "Categories", value: String(stats.categories), helper: "In use so far", Icon: GridIcon },
    { label: "New This Week", value: String(stats.newThisWeek), helper: "Uploaded in last 7 days", Icon: ClockIcon },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Navbar */}
      <header className="sticky top-0 z-30 -mx-4 border-b border-line/60 bg-background/80 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16">
          <Link href="/" className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-tight text-text-primary sm:text-base">
              Porus<span className="text-accent-soft">Visuals</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-accent-soft sm:inline-block">
              ADMIN
            </span>
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-text-secondary outline-none transition hover:border-line-strong hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-95 sm:text-[13px]"
            >
              <BackIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to site</span>
              <span className="sm:hidden">Exit</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="pt-6 sm:pt-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary sm:hidden">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Admin
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary sm:mt-0 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-text-secondary sm:text-[15px]">
          Upload new assets and manage the treasury.
        </p>
      </section>

      {/* Stats */}
      <section className="mt-6 sm:mt-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {statCards.map(({ label, value, helper, Icon }) => (
            <div key={label} className="rounded-2xl border border-line bg-surface p-3.5 shadow-card sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary sm:text-xs">
                  {label}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent-soft">
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="mt-2.5 text-xl font-bold tracking-tight text-text-primary sm:text-2xl">{value}</p>
              <p className="mt-1 text-[11px] text-text-secondary sm:text-xs">{helper}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main grid */}
      <section className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-3">
          <UploadForm />
        </div>

        <aside className="lg:col-span-2">
          <div className="rounded-2xl border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-line p-4 sm:p-5">
              <div>
                <h2 className="text-sm font-semibold text-text-primary sm:text-base">Recent uploads</h2>
                <p className="mt-0.5 text-[11px] text-text-secondary sm:text-xs">
                  Latest {uploads.length === 0 ? "additions" : `${uploads.length} addition${uploads.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>

            {uploads.length === 0 ? (
              <div className="px-5 py-8 text-center sm:px-6 sm:py-10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent-soft">
                  <LayersIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-text-primary">No uploads yet</h3>
                <p className="mx-auto mt-1.5 max-w-[24ch] text-xs leading-relaxed text-text-secondary">
                  Newly uploaded assets will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {uploads.map((asset) => (
                  <li key={asset.id}>
                    <div className="flex items-center gap-2 p-3 sm:p-4">
                      <Link
                        href={`/asset/${asset.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 outline-none transition hover:bg-surface-light focus-visible:ring-2 focus-visible:ring-accent/60"
                      >
                        {/* Real thumbnail */}
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-dark ring-1 ring-inset ring-white/5">
                          <AssetThumbnail
                            src={asset.preview_url}
                            alt={asset.title}
                            type={asset.asset_type ?? "png"}
                            iconClassName="h-5 w-5 text-white/80"
                            width={80}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-text-primary sm:text-sm">
                            {asset.title}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-text-secondary">
                            {capitalize(asset.category ?? "")} · {formatBytes(asset.file_size)} · {relativeTime(asset.uploaded_at ?? asset.created_at)}
                          </p>
                        </div>
                      </Link>

                      <DeleteButton assetId={asset.id} assetTitle={asset.title} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>

      <div className="h-14 sm:h-20" />
    </div>
  );
}