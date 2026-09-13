import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-body-bg px-4 py-16 text-dark dark:bg-darkTheme-bg dark:text-white">
      <section className="w-full max-w-md text-center">
        <h1 className="text-[5rem] font-extrabold leading-none tracking-tight text-orange-500 sm:text-[7rem]">
          404
        </h1>

        <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
          Page not found
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500 dark:text-darkTheme-body-color">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white transition hover:bg-orange-600 sm:w-auto"
          >
            Back to home
          </Link>

          <Link
            href="/shop-with-sidebar"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-dark transition hover:border-orange-400 hover:text-orange-500 dark:border-darkTheme-border-color dark:bg-darkTheme-bg dark:text-white sm:w-auto"
          >
            Browse products
          </Link>
        </div>
      </section>
    </main>
  );
}
