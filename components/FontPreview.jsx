// components/FontPreview.jsx
// Renders a font preview: injects an @font-face rule pointing at the
// Cloudinary URL, then shows sample text at multiple sizes.
//
// Works because Cloudinary serves the raw font file with permissive CORS
// headers, and CSS @font-face can load cross-origin fonts without any
// server-side setup.

// Cloudinary's file_format value → CSS format() keyword
const FORMAT_MAP = {
  TTF: "truetype",
  OTF: "opentype",
  WOFF: "woff",
  WOFF2: "woff2",
};

// Build the @font-face rule for a given asset.
export function buildFontFaceCss(asset) {
  if (!asset?.id || !asset?.file_url) return "";
  const familyName = fontFamilyName(asset.id);
  const fmt = FORMAT_MAP[(asset.file_format ?? "").toUpperCase()] ?? "truetype";

  return `@font-face {
  font-family: "${familyName}";
  src: url("${asset.file_url}") format("${fmt}");
  font-display: swap;
  font-weight: normal;
  font-style: normal;
}`;
}

// Unique family name per asset so multiple fonts never collide.
export function fontFamilyName(assetId) {
  return `PreviewFont-${assetId}`;
}

// ---------------------------------------------------------------------------
// SAMPLE CONTENT
// ---------------------------------------------------------------------------

const BIG_SAMPLE_1 = "The quick brown fox";
const BIG_SAMPLE_2 = "jumps over the lazy dog";

const SIZE_SAMPLES = [
  { label: "12px", className: "text-xs sm:text-[13px]" },
  { label: "16px", className: "text-base" },
  { label: "24px", className: "text-2xl" },
  { label: "36px", className: "text-3xl sm:text-4xl" },
  { label: "48px", className: "text-4xl sm:text-5xl" },
];

const ALPHABET_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ALPHABET_LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const PUNCTUATION = "!?&@#$%*()-_=+[]{}/\\<>,.;:'\"";

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
export default function FontPreview({ asset }) {
  if (asset?.asset_type !== "font") return null;

  const family = fontFamilyName(asset.id);
  const style = { fontFamily: `"${family}", sans-serif` };

  return (
    <div className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
      {/* Big sample */}
      <div className="rounded-2xl border border-line bg-surface/60 p-5 shadow-card sm:p-6 lg:p-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-text-primary sm:text-base">
            Type a preview
          </h2>
          <span className="rounded-md border border-line bg-background/60 px-2 py-0.5 text-[10px] font-medium tracking-wider text-text-secondary">
            {asset.file_format ?? "TTF"}
          </span>
        </div>

        <p
          className="break-words text-2xl font-normal leading-tight text-text-primary sm:text-4xl lg:text-5xl"
          style={style}
        >
          {BIG_SAMPLE_1}
        </p>
        <p
          className="mt-2 break-words text-xl leading-tight text-text-secondary sm:text-3xl lg:text-4xl"
          style={style}
        >
          {BIG_SAMPLE_2}
        </p>
      </div>

      {/* Size ladder */}
      <div className="rounded-2xl border border-line bg-surface/60 p-5 shadow-card sm:p-6">
        <h3 className="mb-4 text-sm font-semibold tracking-tight text-text-primary">
          Sizes
        </h3>
        <div className="space-y-3">
          {SIZE_SAMPLES.map(({ label, className }) => (
            <div key={label} className="flex items-baseline gap-3">
              <span className="w-10 shrink-0 text-[10px] tabular-nums text-text-secondary sm:w-12 sm:text-[11px]">
                {label}
              </span>
              <p
                className={`truncate text-text-primary ${className}`}
                style={style}
              >
                Aa Bb Cc — 123
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Character set */}
      <div className="rounded-2xl border border-line bg-surface/60 p-5 shadow-card sm:p-6">
        <h3 className="mb-4 text-sm font-semibold tracking-tight text-text-primary">
          Character set
        </h3>

        <div className="space-y-3">
          <p
            className="break-words text-base leading-relaxed tracking-wide text-text-primary sm:text-lg"
            style={style}
          >
            {ALPHABET_UPPER}
          </p>
          <p
            className="break-words text-base leading-relaxed tracking-wide text-text-primary sm:text-lg"
            style={style}
          >
            {ALPHABET_LOWER}
          </p>
          <p
            className="break-words text-base leading-relaxed tracking-wide text-text-primary sm:text-lg"
            style={style}
          >
            {NUMBERS}
          </p>
          <p
            className="break-words text-base leading-relaxed tracking-wide text-text-secondary sm:text-lg"
            style={style}
          >
            {PUNCTUATION}
          </p>
        </div>
      </div>
    </div>
  );
}