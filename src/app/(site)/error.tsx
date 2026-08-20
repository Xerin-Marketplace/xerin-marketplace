"use client";

import { createIncidentId } from "@/lib/reliability/runtime-events";
import { House, RefreshCw, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const incident = useRef(error.digest || createIncidentId());
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error("Xerin route error", error);
  }, [error]);

  return <main className="flex min-h-[70dvh] items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950"><section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:p-10"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40"><ShieldAlert size={30} /></span><p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-red-600">Temporary problem</p><h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">This page could not be loaded</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">Your account and data remain safe. Try loading the page again, or return home if the problem continues.</p><p className="mt-4 text-xs text-slate-400">Support reference: {incident.current}</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><button type="button" onClick={reset} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"><RefreshCw size={17} />Try again</button><Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"><House size={17} />Go home</Link></div></section></main>;
}
