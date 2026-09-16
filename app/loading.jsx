// app/loading.jsx
// Global loading state — appears during route transitions.

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
      {/* Thin progress bar */}
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-accent/20">
        <div className="h-full w-1/3 animate-pulse bg-accent" />
      </div>

      {/* Skeleton grid */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-line bg-surface"
          >
            <div className="aspect-[4/3] w-full animate-pulse bg-surface-dark" />
            <div className="space-y-2 p-3 sm:p-3.5">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-surface-dark" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-surface-dark" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}