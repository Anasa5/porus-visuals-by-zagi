// app/page.jsx
// Homepage — Server Component. URL-driven search, sort, and pagination.

import Link from "next/link";
import { unstable_cache } from "next/cache";
import AssetCard from "../components/AssetCard";
import SortDropdown from "../components/SortDropdown";
import { supabaseAdmin } from "../lib/supabase";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

// ---------------------------------------------------------------------------
// ICONS
// ---------------------------------------------------------------------------
function Icon({ className, strokeWidth = 1.8, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const LogoMark = () => (
  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-dark shadow-accent">
    <Icon className="h-4 w-4 text-white">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </Icon>
  </span>
);

const SearchIcon = ({ className }) => (
  <Icon className={className} strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </Icon>
);

const LayersIcon = ({ className }) => (
  <Icon className={className}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
    <path d="m3 17 9 5 9-5" />
  </Icon>
);

const IconAll = ({ className }) => (
  <Icon className={className}>
    <circle cx="6" cy="6" r="2" />
    <circle cx="12" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="18" cy="12" r="2" />
  </Icon>
);

const IconImage = ({ className }) => (
  <Icon className={className}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="M21 15.5 16 11l-6.5 6.5" />
  </Icon>
);

const IconGrid = ({ className }) => (
  <Icon className={className}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </Icon>
);

const IconSparkle = ({ className }) => (
  <Icon className={className}>
    <path d="M12 3v4" />
    <path d="M12 17v4" />
    <path d="M3 12h4" />
    <path d="M17 12h4" />
    <path d="m5.6 5.6 2.8 2.8" />
    <path d="m15.6 15.6 2.8 2.8" />
    <path d="m18.4 5.6-2.8 2.8" />
    <path d="m8.4 15.6-2.8 2.8" />
  </Icon>
);

const IconWave = ({ className }) => (
  <Icon className={className} strokeWidth={2}>
    <path d="M4 12h2" />
    <path d="M9 7v10" />
    <path d="M14 4v16" />
    <path d="M19 9v6" />
  </Icon>
);

const IconFont = ({ className }) => (
  <Icon className={className}>
    <path d="M5 19 10 5l5 14" />
    <path d="M6.5 14.5h7" />
    <path d="M17 12.5h3" />
    <path d="M18.5 11v8" />
  </Icon>
);

const IconFlame = ({ className }) => (
  <Icon className={className}>
    <path d="M12 3s5 4.5 5 9a5 5 0 0 1-10 0c0-1.7.8-3.2 1.8-4.3" />
    <path d="M12 20a2.5 2.5 0 0 0 2.5-2.5c0-1.5-2.5-4-2.5-4s-2.5 2.5-2.5 4A2.5 2.5 0 0 0 12 20Z" />
  </Icon>
);

// ---------------------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { label: "All",         value: null,          Icon: IconAll },
  { label: "PNGs",        value: "pngs",        Icon: IconImage },
  { label: "Backgrounds", value: "backgrounds", Icon: IconGrid },
  { label: "Animations",  value: "animations",  Icon: IconSparkle },
  { label: "SFX",         value: "sfx",         Icon: IconWave },
  { label: "Fonts",       value: "fonts",       Icon: IconFont },
  { label: "Trending",    value: "trending",    Icon: IconFlame },
];

const SORT_LABELS = {
  newest: "Newest",
  oldest: "Oldest",
  downloads: "Most downloaded",
  az: "A–Z",
};

// ---------------------------------------------------------------------------
// URL HELPERS
// ---------------------------------------------------------------------------

// URLs can carry a param multiple times (?q=a&q=b) — take the first.
function firstParam(value) {
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : "";
}

// Build a homepage URL from a state object. Omits defaults so links stay clean.
function buildUrl({ category, q, sort, show }) {
  const sp = new URLSearchParams();
  if (category) sp.set("category", category);
  if (q) sp.set("q", q);
  if (sort && sort !== "newest") sp.set("sort", sort);
  if (show && show > PAGE_SIZE) sp.set("show", String(show));
  const qs = sp.toString();
  return qs ? `/?${qs}` : "/";
}

// Strip characters that would break PostgREST's .or() filter syntax.
function sanitizeSearchTerm(q) {
  return q.replace(/[,()]/g, " ").trim();
}

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------
const CARDS_COLUMNS =
  "id, title, category, asset_type, file_format, tags, preview_url, uploaded_at, download_count";

const getCachedAssets = unstable_cache(
  async (category, search, sort, show) => {
    if (!supabaseAdmin) return [];

    let query = supabaseAdmin
      .from("assets")
      .select(CARDS_COLUMNS)
      .eq("is_published", true);

    // Category filter (skip "all" and "trending" — trending is a sort, not a filter)
    if (category && category !== "all" && category !== "trending") {
      query = query.eq("category", category);
    }

    // Search across title and description
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Sort
    if (category === "trending" || sort === "downloads") {
      query = query.order("download_count", { ascending: false });
    } else if (sort === "oldest") {
      query = query.order("uploaded_at", { ascending: true });
    } else if (sort === "az") {
      query = query.order("title", { ascending: true });
    } else {
      // newest (default)
      query = query.order("uploaded_at", { ascending: false });
    }

    // Fetch one extra to know whether a "Load more" button is needed.
    const { data, error } = await query.limit(show + 1);

    if (error) {
      console.error("Failed to load assets:", error.message);
      return { rows: [], hasMore: false };
    }

    const rows = data ?? [];
    const hasMore = rows.length > show;

    return {
      rows: hasMore ? rows.slice(0, show) : rows,
      hasMore,
    };
  },
  ["home-assets"],
  { revalidate: 300, tags: ["assets"] }
);

function toCardShape(row) {
  return {
    id: String(row.id),
    name: row.title ?? "Untitled",
    category: capitalize(row.category ?? ""),
    type: row.asset_type ?? "png",
    meta: row.file_format ?? null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    previewUrl: row.preview_url ?? null,
  };
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function labelForCategory(value) {
  const found = CATEGORIES.find((c) => c.value === value);
  return found ? found.label : "All";
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------
export default async function HomePage({ searchParams }) {
  // Read URL state
  const rawCategory = firstParam(searchParams?.category);
  const rawQ = firstParam(searchParams?.q);
  const rawSort = firstParam(searchParams?.sort);
  const rawShow = firstParam(searchParams?.show);

  const category =
    rawCategory && rawCategory.length > 0 ? rawCategory.toLowerCase() : null;
  const q = rawQ && rawQ.trim().length > 0 ? rawQ.trim() : null;
  const sort =
    rawSort && ["newest", "oldest", "downloads", "az"].includes(rawSort)
      ? rawSort
      : "newest";
  const show = Math.max(
    PAGE_SIZE,
    Math.min(parseInt(rawShow, 10) || PAGE_SIZE, 240)
  );

  // Fetch
  const safeSearch = q ? sanitizeSearchTerm(q) : "";
  const { rows, hasMore } = await getCachedAssets(
    category ?? "all",
    safeSearch,
    sort,
    show
  );
  const assets = rows.map(toCardShape);

  const activeLabel = labelForCategory(category);
  const state = { category, q, sort, show };

  // Section title logic
  let sectionTitle;
  let sectionSubtitle;

  if (q) {
    sectionTitle = `Results for "${q}"`;
    sectionSubtitle =
      assets.length === 0
        ? "No matches"
        : `${assets.length} result${assets.length === 1 ? "" : "s"}`;
  } else if (category === "trending") {
    sectionTitle = "Trending";
    sectionSubtitle = "Most downloaded";
  } else if (category) {
    sectionTitle = activeLabel;
    sectionSubtitle = `Everything in ${activeLabel}`;
  } else {
    sectionTitle = "Latest Resources";
    sectionSubtitle = "Fresh drops from the treasury";
  }

  const hasActiveFilter = Boolean(category || q || sort !== "newest");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
      {/* Navbar */}
      <header className="sticky top-0 z-30 -mx-4 border-b border-line/60 bg-background/80 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-tight text-text-primary sm:text-base">
              Porus<span className="text-accent-soft">Visuals</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/#latest"
              className="rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-surface hover:text-text-primary"
            >
              Browse
            </Link>
            <Link
              href="/#categories"
              className="rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-surface hover:text-text-primary"
            >
              Categories
            </Link>
            <Link
              href="/?category=trending"
              className="rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-surface hover:text-text-primary"
            >
              Trending
            </Link>
            <Link
              href="/about"
              className="rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-surface hover:text-text-primary"
            >
              About
            </Link>
          </nav>

          <Link
            href="/#search"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-text-secondary outline-none transition hover:border-line-strong hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-95"
          >
            <SearchIcon className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mt-6 sm:mt-8">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/60 p-5 shadow-card sm:p-8 lg:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
          />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              100% free to download
            </span>

            <h1 className="mt-4 text-[28px] font-bold leading-[1.1] tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
              Every asset your{" "}
              <span className="bg-gradient-to-r from-accent-soft to-accent bg-clip-text text-transparent">
                next edit
              </span>{" "}
              needs.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary sm:mt-4 sm:text-base">
              A curated library of PNGs, backgrounds, animations, overlays, SFX,
              and fonts — built for video and content editors.
            </p>

            {/* Search form — GET submit, preserves other URL params via hidden inputs */}
            <form
              id="search"
              action="/"
              method="GET"
              className="mt-6 flex items-center gap-2 rounded-xl border border-line bg-background/60 p-1.5 pl-3.5 transition focus-within:border-accent/50 sm:mt-7 sm:max-w-lg"
            >
              {category && <input type="hidden" name="category" value={category} />}
              {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}

              <SearchIcon className="h-4 w-4 shrink-0 text-text-secondary" />
              <input
                type="text"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search light leaks, SFX, fonts…"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white outline-none transition hover:bg-accent-dark focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-95 sm:px-4 sm:text-sm"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="mt-4 scroll-mt-20 sm:mt-5">
        <div className="rounded-2xl border border-line bg-surface/60 p-4 shadow-card sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-text-primary sm:text-base">
              Browse by category
            </h2>
            <span className="hidden text-[11px] text-text-secondary sm:inline">
              Scroll for more →
            </span>
          </div>

          <div className="-mx-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-2 px-1">
              {CATEGORIES.map(({ label, value, Icon: CategoryIcon }) => {
                const isActive = (category ?? null) === value;
                // Changing category resets pagination, keeps search + sort.
                const href = buildUrl({
                  category: value,
                  q,
                  sort,
                  show: PAGE_SIZE,
                });

                return (
                  <Link
                    key={label}
                    href={href}
                    scroll={false}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-accent/60 sm:text-[13px] ${
                      isActive
                        ? "border-accent/40 bg-accent/15 text-accent-soft"
                        : "border-line bg-background/60 text-text-secondary hover:border-line-strong hover:text-text-primary"
                    }`}
                  >
                    <CategoryIcon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ASSETS */}
      <section id="latest" className="mt-4 scroll-mt-20 sm:mt-5">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface/60 shadow-card">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-6 sm:py-5">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold tracking-tight text-text-primary sm:text-lg">
                {sectionTitle}
              </h2>
              <p className="mt-0.5 truncate text-xs text-text-secondary sm:text-[13px]">
                {sectionSubtitle}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <SortDropdown
                value={sort}
                currentCategory={category}
                currentQ={q}
              />
              {hasActiveFilter && (
                <Link
                  href="/"
                  scroll={false}
                  className="rounded-lg border border-line bg-background/60 px-2.5 py-1.5 text-xs font-medium text-text-secondary outline-none transition hover:border-line-strong hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  Reset
                </Link>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {assets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line-strong bg-background/40 px-6 py-10 text-center sm:py-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent-soft">
                  <LayersIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold tracking-tight text-text-primary sm:text-base">
                  {q
                    ? `No matches for "${q}"`
                    : category
                    ? `Nothing in ${activeLabel} yet`
                    : "Nothing here yet"}
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-text-secondary sm:text-sm">
                  {q
                    ? "Try a different word, or clear the search to see everything."
                    : category
                    ? `No ${activeLabel.toLowerCase()} have been uploaded yet. Check back soon.`
                    : "No assets have been uploaded yet. Check back soon."}
                </p>
                {hasActiveFilter && (
                  <Link
                    href="/"
                    scroll={false}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-text-secondary outline-none transition hover:border-line-strong hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.99] sm:text-sm"
                  >
                    Clear filters
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {assets.map((asset, i) => (
                    <AssetCard key={asset.id} asset={asset} priority={i < 4} />
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="mt-6 flex justify-center sm:mt-8">
                    <Link
                      href={buildUrl({ ...state, show: show + PAGE_SIZE })}
                      scroll={false}
                      className="inline-flex items-center gap-2 rounded-xl border border-line bg-background/60 px-5 py-2.5 text-sm font-semibold text-text-primary outline-none transition hover:border-accent/50 hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.99]"
                    >
                      Load more
                      <span className="text-text-secondary">
                        ({PAGE_SIZE} more)
                      </span>
                    </Link>
                  </div>
                )}

                {/* End-of-list note */}
                {!hasMore && assets.length >= PAGE_SIZE && (
                  <p className="mt-6 text-center text-xs text-text-secondary sm:mt-8">
                    You've reached the end.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}