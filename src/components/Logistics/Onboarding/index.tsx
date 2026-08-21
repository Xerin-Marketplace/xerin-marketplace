"use client";

import { logisticsAdminApi } from "@/lib/api/endpoints/logistics-admin";
import type { LogisticsOnboardingStatus } from "@/types/api/logistics-admin";
import { ArrowRight, Check, Circle, LayoutDashboard, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const errorMessage = (error: unknown) => error instanceof Error ? error.message : "We could not load your setup progress.";

export default function LogisticsOnboarding() {
  const [status, setStatus] = useState<LogisticsOnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setStatus(await logisticsAdminApi.onboarding()); }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="mx-auto max-w-5xl space-y-4"><div className="h-56 animate-pulse rounded-3xl bg-gray-200 dark:bg-darkTheme-secondary-bg" /><div className="grid gap-4 sm:grid-cols-2"><div className="h-40 animate-pulse rounded-2xl bg-gray-200 dark:bg-darkTheme-secondary-bg" /><div className="h-40 animate-pulse rounded-2xl bg-gray-200 dark:bg-darkTheme-secondary-bg" /></div></div>;
  if (error || !status) return <div className="mx-auto max-w-3xl rounded-2xl border border-red-light-4 bg-red-light-6 p-5 text-red-dark"><p className="font-semibold">Setup progress is unavailable</p><p className="mt-1 text-sm">{error}</p><button onClick={() => void load()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-red px-4 text-sm font-semibold text-white"><RefreshCw size={17} />Try again</button></div>;

  const done = status.ready_for_review;
  return <div className="mx-auto max-w-5xl space-y-5">
    <section className="overflow-hidden rounded-3xl bg-transparent p-5 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary"><Sparkles size={15} />Welcome to Xerin Logistics</p><h2 className="mt-3 text-2xl font-bold text-dark dark:text-white sm:text-4xl">{done ? "Your setup is ready" : `Let’s set up ${status.company_name}`}</h2><p className="mt-3 text-sm leading-6 text-dark-2 dark:text-darkTheme-body-color sm:text-base">{done ? "All required business details are complete. You can continue to the workspace while Xerin reviews your company." : "Complete these business details so your company can receive delivery jobs and settlements. Your progress is saved automatically."}</p></div>
        <div className="shrink-0 rounded-2xl border border-border-color bg-white p-4 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg sm:min-w-56"><div className="flex items-end justify-between"><span className="text-sm text-dark-2 dark:text-darkTheme-body-color">Required setup</span><strong className="text-2xl text-dark dark:text-white">{status.progress_percent}%</strong></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-darkTheme-tertiary-bg"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${status.progress_percent}%` }} /></div><p className="mt-2 text-xs text-dark-4 dark:text-darkTheme-body-color">{status.required_completed} of {status.required_total} required steps complete</p></div>
      </div>
    </section>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-xl font-bold text-dark dark:text-white">Company onboarding checklist</h3><p className="mt-1 text-sm text-dark-4">Webhook configuration is optional and never blocks onboarding.</p></div><button onClick={() => void load()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-color bg-white px-4 text-sm font-semibold dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-white"><RefreshCw size={17} />Refresh progress</button></div>

    <section className="grid gap-4 sm:grid-cols-2">
      {status.steps.map((step) => <Link key={step.key} href={step.href} className={`group rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 dark:bg-darkTheme-secondary-bg ${step.completed ? "border-green-light-3 dark:border-green-dark" : "border-border-color dark:border-darkTheme-border-color"}`}><div className="flex items-start gap-3"><span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${step.completed ? "bg-green-light-6 text-green-dark dark:bg-darkTheme-tertiary-bg" : "bg-gray-100 text-dark-4 dark:bg-darkTheme-tertiary-bg"}`}>{step.completed ? <Check size={19} /> : <Circle size={19} />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="font-bold text-dark dark:text-white">{step.label}</h4><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${step.required ? "bg-primary/10 text-primary" : "bg-gray-100 text-dark-4 dark:bg-darkTheme-tertiary-bg"}`}>{step.required ? "Required" : "Optional"}</span></div><p className="mt-1 text-sm leading-6 text-dark-4">{step.description}</p><span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">{step.completed ? "Review details" : "Complete step"}<ArrowRight size={15} className="transition group-hover:translate-x-1" /></span></div></div></Link>)}
    </section>

    <section className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${done ? "border-green-light-3 bg-green-light-6 dark:border-green-dark dark:bg-darkTheme-secondary-bg" : "border-yellow-light-2 bg-yellow-light-4 dark:border-yellow-dark dark:bg-darkTheme-secondary-bg"}`}><div><p className="font-bold text-dark dark:text-white">{done ? "Required setup complete" : `Next: ${status.next_step?.label || "Complete your company setup"}`}</p><p className="mt-1 text-sm text-dark-2 dark:text-darkTheme-body-color">{done ? "Your company can now proceed to review and normal operations." : status.next_step?.description}</p></div><Link href={done ? "/logistics/dashboard" : status.next_step?.href || "/logistics/settings"} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white"><LayoutDashboard size={17} />{done ? "Open dashboard" : "Continue setup"}</Link></section>
  </div>;
}