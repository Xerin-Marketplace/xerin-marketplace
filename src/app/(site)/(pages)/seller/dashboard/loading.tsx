export default function SellerDashboardLoading() {
  return (
    <div className="w-full animate-pulse space-y-5 p-4 sm:p-6">
      {/* Readiness hero skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-carbon p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-5 w-48 rounded-lg bg-white/10" />
            <div className="h-3.5 w-64 rounded-lg bg-white/10" />
          </div>
        </div>
        <div className="h-11 w-32 rounded-lg bg-white/10" />
      </div>

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-muted" />
              <div className="h-12 w-12 rounded-full bg-muted" />
            </div>
            <div className="mt-4 h-3 w-20 rounded bg-muted" />
            <div className="mt-2 h-7 w-24 rounded bg-muted" />
            <div className="mt-4 h-1.5 w-full rounded-full bg-muted" />
          </div>
        ))}
      </div>

      {/* Content sections skeleton */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="h-5 w-40 rounded-lg bg-muted" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-xl border border-border bg-card" />
          <div className="h-48 rounded-xl border border-border bg-card" />
        </div>
      </div>
    </div>
  );
}
