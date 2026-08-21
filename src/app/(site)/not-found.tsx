import { ArrowRight, Home, PackageSearch, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-body-bg px-4 py-16 text-dark dark:bg-darkTheme-bg dark:text-white sm:px-6 lg:px-8">
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-orange-400/30 blur-[100px]" />
        <div className="absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-yellow-400/25 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-primary/20 blur-[90px]" />
      </div>

      {/* Floating decorative icons */}
      <ShoppingBag
        className="pointer-events-none absolute left-[8%] top-[18%] hidden animate-bounce text-orange-400/40 [animation-duration:3.5s] sm:block"
        size={40}
        strokeWidth={1.5}
      />
      <PackageSearch
        className="pointer-events-none absolute bottom-[16%] right-[10%] hidden animate-bounce text-yellow-400/40 [animation-duration:4s] [animation-delay:.5s] sm:block"
        size={48}
        strokeWidth={1.5}
      />

      <div className="relative mx-auto flex min-h-[70dvh] w-full max-w-4xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-3xl border border-gray-200/70 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg/80">
          <div className="relative px-6 py-14 text-center sm:px-12 sm:py-20">
            {/* Glow behind the number */}
            <div className="pointer-events-none absolute left-1/2 top-4 h-56 w-56 -translate-x-1/2 rounded-full bg-gradient-to-br from-orange-400/30 to-yellow-300/30 blur-3xl" />

            {/* Big gradient 404 */}
            <h1 className="relative select-none bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-[6rem] font-extrabold leading-none tracking-tight text-transparent sm:text-[9rem]">
              404
            </h1>

            <div className="relative mx-auto -mt-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 text-black shadow-lg shadow-orange-500/30 ring-8 ring-orange-500/10 sm:-mt-5">
              <PackageSearch size={30} strokeWidth={1.8} />
            </div>

            <h2 className="relative mt-6 text-2xl font-bold tracking-tight text-dark dark:text-white sm:text-4xl">
              This page wandered off the shelf
            </h2>

            <p className="relative mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-600 dark:text-darkTheme-body-color sm:text-base">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. The
              address may be incorrect, the page may have moved, or the item
              may no longer be listed.
            </p>

            <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-400 px-6 text-sm font-semibold text-black shadow-lg shadow-orange-500/25 transition hover:shadow-xl hover:shadow-orange-500/35 sm:w-auto"
              >
                <Home size={18} />
                Back to marketplace
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/shop-with-sidebar"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-dark transition hover:border-orange-400 hover:text-orange-500 dark:border-darkTheme-border-color dark:bg-darkTheme-bg dark:text-white dark:hover:border-orange-400 dark:hover:text-orange-400 sm:w-auto"
              >
                <ShoppingBag size={18} />
                Browse products
              </Link>
            </div>

            <div className="relative mx-auto mt-9 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-darkTheme-body-color">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
              <span>Error 404 · Page not found</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

