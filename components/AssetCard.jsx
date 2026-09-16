// components/AssetCard.jsx
import Link from "next/link";
import AssetThumbnail from "./AssetThumbnail";

const TYPE_BADGES = {
  png:       { label: "PNG",   badge: "bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-400/25" },
  video:     { label: "VIDEO", badge: "bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-400/25" },
  animation: { label: "ANIM",  badge: "bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-inset ring-fuchsia-400/25" },
  audio:     { label: "SFX",   badge: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/25" },
  font:      { label: "FONT",  badge: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/25" },
};

function DownloadIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 4v11" /><path d="m7 10.5 5 5 5-5" /><path d="M5 20h14" />
    </svg>
  );
}

export default function AssetCard({ asset, priority = false }) {
  const style = TYPE_BADGES[asset.type] ?? TYPE_BADGES.png;
  const tags = Array.isArray(asset.tags) ? asset.tags.slice(0, 2) : [];

  return (
    <Link
      href={`/asset/${asset.id}`}
      prefetch={false}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card outline-none transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-light hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-dark ring-1 ring-inset ring-white/5">
        <AssetThumbnail
          src={asset.previewUrl}
          alt={asset.name}
          type={asset.type}
          width={600}
          objectFit="cover"
          priority={priority}
        />
        <span className={`absolute left-2 top-2 z-10 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wider backdrop-blur-sm ${style.badge}`}>
          {style.label}
        </span>
        {asset.meta ? (
          <span className="absolute right-2 top-2 z-10 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-text-primary backdrop-blur-sm">
            {asset.meta}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-3.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-text-primary sm:text-[15px]">
          {asset.name}
        </h3>
        <p className="line-clamp-1 text-[11px] text-text-secondary sm:text-xs">
          {asset.category}
        </p>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full border border-line bg-surface-dark px-2 py-0.5 text-[10px] text-text-secondary">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-auto pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-2.5 py-1.5 text-[11px] font-semibold text-accent-soft ring-1 ring-inset ring-accent/25 transition group-hover:bg-accent/20 group-hover:text-white sm:text-xs">
            <DownloadIcon className="h-3.5 w-3.5" />
            Download
          </span>
        </div>
      </div>
    </Link>
  );
}