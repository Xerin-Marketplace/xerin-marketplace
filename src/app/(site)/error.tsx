"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
 useEffect(() => {
 if (process.env.NODE_ENV !== "production") console.error("Xerin route error", error);
 }, [error]);

 return (
 <main className="flex min-h-dvh items-center justify-center bg-body-bg px-4 py-16 text-foreground">
 <section className="w-full max-w-md text-center">
 <h1 className="text-[5rem] font-extrabold leading-none tracking-tight text-destructive sm:text-[7rem]">
 500
 </h1>

 <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
 Something went wrong
 </h2>

 <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
 This page could not be loaded. Your account and data remain safe.
 </p>

 {error.digest && (
 <p className="mt-4 text-xs text-muted-foreground">Support reference: {error.digest}</p>
 )}

 <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
 <button
 type="button"
 onClick={reset}
 className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90-dark sm:w-auto"
 >
 Try again
 </button>

 <Link
 href="/"
 className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground transition hover:border-primary-400 hover:text-primary sm:w-auto"
 >
 Go home
 </Link>
 </div>
 </section>
 </main>
 );
}
