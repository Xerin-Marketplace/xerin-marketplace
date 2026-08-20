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

  if (loading) return <div className="mx-auto max-w-5xl space-y-4"><div className="h-56 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" /><div className="grid gap-4 sm:grid-cols-2"><div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" /><div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" /></div></div>;
  if (error || !status) return <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"><p className="font-semibold">Setup progress is unavailable</p><p className="mt-1 text-sm">{error}</p><button onClick={() => void load()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white"><RefreshCw size={17} />Try again</button></div>;

  const done = status.ready_for_review;
  return <div className="mx-auto max-w-5xl space-y-5">
    <section className="overflow-hidden rounded-3xl bg-slate-950 p-5 text-white shadow-xl sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300"><Sparkles size={15} />Welcome to Xerin Logistics</p><h2 className="mt-3 text-2xl font-bold sm:text-4xl">{done ? "Your setup is ready" : `Let’s set up ${status.company_name}`}</h2><p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">{done ? "All required business details are complete. You can continue to the workspace while Xerin reviews your company." : "Complete these business details so your company can receive delivery jobs and settlements. Your progress is saved automatically."}</p></div>
        <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 sm:min-w-56"><div className="flex items-end justify-between"><span className="text-sm text-slate-300">Required setup</span><strong className="text-2xl">{status.progress_percent}%</strong></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-blue transition-all" style={{ width: `${status.progress_percent}%` }} /></div><p className="mt-2 text-xs text-slate-400">{status.required_completed} of {status.required_total} required steps complete</p></div>
      </div>
    </section>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-xl font-bold text-slate-900 dark:text-white">Company onboarding checklist</h3><p className="mt-1 text-sm text-slate-500">Webhook configuration is optional and never blocks onboarding.</p></div><button onClick={() => void load()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800"><RefreshCw size={17} />Refresh progress</button></div>

    <section className="grid gap-4 sm:grid-cols-2">
      {status.steps.map((step) => <Link key={step.key} href={step.href} className={`group rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 dark:bg-slate-800 ${step.completed ? "border-emerald-200 dark:border-emerald-900" : "border-slate-200 dark:border-slate-700"}`}><div className="flex items-start gap-3"><span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${step.completed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950" : "bg-slate-100 text-slate-500 dark:bg-slate-700"}`}>{step.completed ? <Check size={19} /> : <Circle size={19} />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="font-bold text-slate-900 dark:text-white">{step.label}</h4><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${step.required ? "bg-blue/10 text-blue" : "bg-slate-100 text-slate-500 dark:bg-slate-700"}`}>{step.required ? "Required" : "Optional"}</span></div><p className="mt-1 text-sm leading-6 text-slate-500">{step.description}</p><span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue">{step.completed ? "Review details" : "Complete step"}<ArrowRight size={15} className="transition group-hover:translate-x-1" /></span></div></div></Link>)}
    </section>

    <section className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${done ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"}`}><div><p className="font-bold text-slate-900 dark:text-white">{done ? "Required setup complete" : `Next: ${status.next_step?.label || "Complete your company setup"}`}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{done ? "Your company can now proceed to review and normal operations." : status.next_step?.description}</p></div><Link href={done ? "/logistics/dashboard" : status.next_step?.href || "/logistics/settings"} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue px-5 text-sm font-bold text-white"><LayoutDashboard size={17} />{done ? "Open dashboard" : "Continue setup"}</Link></section>
  </div>;
}
