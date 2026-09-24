import Link from "next/link";

export default function NotFound() {
 return (
 <main className="flex min-h-dvh items-center justify-center bg-body-bg px-4 py-16 text-foreground">
 <section className="w-full max-w-md text-center">
 <h1 className="text-[5rem] font-extrabold leading-none tracking-tight text-primary sm:text-[7rem]">
 404
 </h1>

 <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
 Page not found
 </h2>

 <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
 The page you&apos;re looking for doesn&apos;t exist or has been moved.
 </p>

 <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
 <Link
 href="/"
 className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90-dark sm:w-auto"
 >
 Back to home
 </Link>

 <Link
 href="/shop-with-sidebar"
 className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground transition hover:border-primary-400 hover:text-primary sm:w-auto"
 >
 Browse products
 </Link>
 </div>
 </section>
 </main>
 );
}
