export default function ProductLoading() {
  return (
    <section className="bg-background pb-8 pt-[92px] sm:pb-12 sm:pt-6 lg:pb-16 lg:pt-10">
      <div className="mx-auto w-full max-w-[1280px] animate-pulse px-3 sm:px-6 lg:px-8 xl:px-4">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.90fr)_minmax(0,1.10fr)] lg:gap-9">
          <div className="aspect-[1.03/1] min-h-[310px] rounded-xl bg-muted sm:min-h-[430px] lg:min-h-[510px]" />
          <div className="space-y-4">
            <div className="h-6 w-2/3 rounded-lg bg-muted" />
            <div className="h-4 w-1/3 rounded-lg bg-muted" />
            <div className="h-8 w-1/4 rounded-lg bg-muted" />
            <div className="h-24 rounded-xl bg-muted" />
            <div className="flex gap-3">
              <div className="h-11 w-36 rounded-lg bg-muted" />
              <div className="h-11 w-36 rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
