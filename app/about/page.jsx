// app/about/page.jsx
// About page — static content.

import Link from "next/link";

export const metadata = {
  title: "About",
  description:
    "Porus Visuals is a free asset library for editors, built by Zagitorius and his team.",
};

// ---------------------------------------------------------------------------
// ICONS
// ---------------------------------------------------------------------------

function LogoMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-dark shadow-accent">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white" aria-hidden="true">
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 13 9 5 9-5" />
        <path d="m3 17 9 5 9-5" />
      </svg>
    </span>
  );
}

function BackIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M19 12H6" />
      <path d="m12 5-7 7 7 7" />
    </svg>
  );
}

function SparkleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3v5" /><path d="M12 16v5" />
      <path d="M3 12h5" /><path d="M16 12h5" />
      <path d="m6.3 6.3 3 3" /><path d="m14.7 14.7 3 3" />
      <path d="m17.7 6.3-3 3" /><path d="m9.3 14.7-3 3" />
    </svg>
  );
}

function HeartIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 20.5S3.5 15 3.5 9.2A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.5 3.2C20.5 15 12 20.5 12 20.5Z" />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M17 5.5a3 3 0 0 1 0 6" />
      <path d="M18.5 20a6 6 0 0 0-2.5-4.9" />
    </svg>
  );
}

function LayersIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Navbar */}
      <header className="sticky top-0 z-30 -mx-4 border-b border-line/60 bg-background/80 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text-secondary outline-none transition hover:bg-surface hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-95"
          >
            <BackIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-tight text-text-primary sm:text-base">
              Porus<span className="text-accent-soft">Visuals</span>
            </span>
          </Link>

          <div className="w-9" />
        </div>
      </header>

      {/* Hero */}
      <section className="pt-10 sm:pt-16 lg:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            About us
          </span>

          <h1 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            A free library
            <br className="hidden sm:block" />{" "}
            <span className="bg-gradient-to-r from-accent-soft to-accent bg-clip-text text-transparent">
              built by editors
            </span>
            , for editors.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
            Porus Visuals is a small project with one simple goal — make it
            effortless to find the assets you actually need for an edit,
            without pop-ups, sign-ups, or paywalls.
          </p>
        </div>
      </section>

      {/* What it is */}
      <section className="mt-12 sm:mt-16">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
          <InfoCard
            Icon={LayersIcon}
            title="Curated, not scraped"
            body="Every asset is hand-picked. Nothing gets uploaded unless it's actually useful for real editing work."
          />
          <InfoCard
            Icon={SparkleIcon}
            title="Free, forever"
            body="No accounts. No credits. No watermarks. Download what you need, use it wherever you want — personal or commercial."
          />
          <InfoCard
            Icon={UsersIcon}
            title="Made by a small team"
            body="Porus Visuals is maintained by a tiny crew of editors, designers, and developers who use the same assets every day."
          />
        </div>
      </section>

      {/* The story */}
      <section className="mt-12 sm:mt-16">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8 lg:p-10">
          <h2 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            The story
          </h2>

          <div className="mt-4 space-y-4 text-sm leading-relaxed text-text-secondary sm:text-[15px]">
            <p>
              Porus Visuals started because we were tired. Tired of hunting for
              the same light leak across a dozen scattered sites. Tired of
              dodging pop-ups. Tired of downloading a "free" pack, only to find
              a watermark on every second file.
            </p>
            <p>
              So we built the thing we wanted to use — one place where the good
              stuff lives. Backgrounds, overlays, transitions, textures, SFX,
              and fonts. Organized. Tagged. Previewed. Searchable. All in one
              library that doesn't make you jump through hoops.
            </p>
            <p>
              Everything you see here has been tested on real projects. If it
              didn't survive a timeline, it didn't make the cut.
            </p>
          </div>
        </div>
      </section>

      {/* Credit — the important bit */}
      <section className="mt-12 sm:mt-16">
        <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/10 via-surface to-surface p-6 shadow-card sm:p-8 lg:p-10">
          {/* Subtle glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
          />

          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent-soft">
                <HeartIcon className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-soft">
                Credits
              </span>
            </div>

            <h2 className="mt-4 text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
              Built by Zagitorius and his team
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-[15px]">
              Porus Visuals was created by{" "}
              <span className="font-semibold text-text-primary">
                Zagitorius
              </span>{" "}
              and a small team of collaborators who put countless late nights
              into curating assets, building the site, and keeping everything
              running. Without them, none of this would exist.
            </p>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-[15px]">
              If you find this library useful, the best way to say thanks is
              to use it, share it, and credit the people who made it possible.
            </p>
          </div>
        </div>
      </section>

      {/* Back CTA */}
      <section className="mt-12 sm:mt-16">
        <div className="text-center">
          <p className="text-sm text-text-secondary">
            Ready to browse?
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white outline-none transition hover:bg-accent-dark focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.99]"
          >
            Explore the library
          </Link>
        </div>
      </section>

      <div className="h-14 sm:h-20" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------------------

function InfoCard({ Icon, title, body }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent-soft">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-text-primary sm:text-lg">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
        {body}
      </p>
    </div>
  );
}