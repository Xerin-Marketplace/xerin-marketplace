export default function StoreLoading() {
  return (
    <section className="bg-background pb-12 pt-[92px] sm:pt-6">
      <div className="mx-auto w-full max-w-[1280px] animate-pulse px-3 sm:px-6 lg:px-8 xl:px-4">
        <div className="h-40 rounded-xl bg-muted sm:h-52" />
        <div className="mt-5 flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/3 rounded-lg bg-muted" />
            <div className="h-4 w-1/4 rounded-lg bg-muted" />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </section>
  );
}
