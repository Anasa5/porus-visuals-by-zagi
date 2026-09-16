// components/AssetThumbnail.jsx
"use client";

import { useState } from "react";

function ImageIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="9" cy="10" r="1.6" />
      <path d="M21 15.5 16 11l-6.5 6.5" />
    </svg>
  );
}
function PlayIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M10 9.2v5.6l4.5-2.8L10 9.2Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function SparkleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3v5" /><path d="M12 16v5" /><path d="M3 12h5" /><path d="M16 12h5" />
      <path d="m6.3 6.3 3 3" /><path d="m14.7 14.7 3 3" />
      <path d="m17.7 6.3-3 3" /><path d="m9.3 14.7-3 3" />
    </svg>
  );
}
function WaveIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden="true">
      <path d="M4 12h2" /><path d="M9 7v10" /><path d="M14 4v16" /><path d="M19 9v6" />
    </svg>
  );
}
function FontIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 19 10 5l5 14" /><path d="M6.5 14.5h7" />
      <path d="M17 12.5h3" /><path d="M18.5 11v8" />
    </svg>
  );
}

const TYPE_STYLES = {
  png:       { gradient: "from-sky-500/30 via-sky-500/5 to-transparent",         Icon: ImageIcon },
  video:     { gradient: "from-violet-500/30 via-violet-500/5 to-transparent",   Icon: PlayIcon },
  animation: { gradient: "from-fuchsia-500/30 via-fuchsia-500/5 to-transparent", Icon: SparkleIcon },
  audio:     { gradient: "from-emerald-500/30 via-emerald-500/5 to-transparent", Icon: WaveIcon },
  font:      { gradient: "from-amber-500/30 via-amber-500/5 to-transparent",     Icon: FontIcon },
};

// ---------------------------------------------------------------------------
// CLOUDINARY URL BUILDER
// Adds resizing + auto format + auto quality + DPR-aware sizing.
// Example output:
//   .../upload/w_600,c_fill,q_auto,f_auto,dpr_auto/v123/file.png
// ---------------------------------------------------------------------------
function optimizeCloudinaryUrl(url, width, crop) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;
  if (!url.includes("/upload/")) return url;

  const [before, after] = url.split("/upload/");
  if (!/^v\d+/.test(after)) return url;

  const transform =
    crop === "contain"
      ? `w_${width},q_auto,f_auto,dpr_auto`
      : `w_${width},c_fill,g_auto,q_auto,f_auto,dpr_auto`;

  return `${before}/upload/${transform}/${after}`;
}

export default function AssetThumbnail({
  src,
  alt = "",
  type = "png",
  iconClassName = "h-10 w-10 text-white/75 sm:h-12 sm:w-12",
  objectFit = "cover",
  width = 600,
  priority = false,
}) {
  const [failed, setFailed] = useState(false);
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.png;
  const { Icon } = style;

  const showImage = Boolean(src) && !failed;
  const optimizedSrc = showImage ? optimizeCloudinaryUrl(src, width, objectFit) : null;

  return (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`} />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {showImage ? (
        <img
          src={optimizedSrc}
          alt={alt}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full ${
            objectFit === "contain" ? "object-contain" : "object-cover"
          }`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={iconClassName}>
            <Icon className="h-full w-full" />
          </div>
        </div>
      )}
    </>
  );
}