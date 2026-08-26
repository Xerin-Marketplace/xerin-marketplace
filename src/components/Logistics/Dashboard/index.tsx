"use client";

import { logisticsApi } from "@/lib/api/endpoints/logistics";
import type { LogisticsCompanyAccount, LogisticsDashboard } from "@/types/api/logistics";
import { Activity, MapPinned, PackageCheck, RefreshCw, Truck, Users, Webhook } from "lucide-react";
import { useEffect, useState } from "react";

export default function LogisticsDashboardPage() {
  const [account, setAccount] = useState<LogisticsCompanyAccount | null>(null);
  const [dashboard, setDashboard] = useState<LogisticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [nextAccount, nextDashboard] = await Promise.all([logisticsApi.getAccount(), logisticsApi.getDashboard()]);
      setAccount(nextAccount); setDashboard(nextDashboard);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load the logistics dashboard.");
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  if (loading) return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading dashboard">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div>;
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-6"><p className="font-medium text-red-800">Dashboard unavailable</p><p className="mt-1 break-words text-sm text-red-700">{error}</p><button onClick={() => void load()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"><RefreshCw size={17} />Try again</button></div>;
  if (!dashboard || !account) return null;

  const cards = [
    { label: "Total shipments", value: dashboard.shipments_total, icon: Truck },
    { label: "Pickup jobs", value: dashboard.pickup_jobs_total, icon: PackageCheck },
    { label: "Active zones", value: dashboard.active_zones, icon: MapPinned },
    { label: "Team members", value: dashboard.members, icon: Users },
  ];

  return <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
    <section className="overflow-hidden rounded-2xl border border-[#242424] bg-[#111111] p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#ff8a00]">Operations overview</p>
          <h2 className="mt-1 break-words text-xl font-bold text-white sm:text-2xl">{account.company.name}</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-[#ff8a00] px-3 py-1.5 text-[#111111] capitalize">
            {account.member_role.replaceAll("_", " ")}
          </span>
          <span className="rounded-full border border-[#3b3b3b] bg-[#222222] px-3 py-1.5 text-white">
            {account.company.status ?? "Active company"}
          </span>
        </div>
      </div>
    </section>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"><div className="flex items-center justify-between gap-3"><div><p className="text-sm text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</p></div><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff3e0] text-[#d96f00] dark:bg-[#2a2118] dark:text-[#ff9b24]"><Icon size={21} /></span></div></article>)}</section>
    <section className="grid gap-4 xl:grid-cols-2">
      <StatusPanel title="Shipments by status" icon={Truck} values={dashboard.shipments_by_status} />
      <StatusPanel title="Pickup jobs by status" icon={PackageCheck} values={dashboard.pickup_jobs_by_status} />
    </section>
    <section className="grid gap-3 sm:grid-cols-3"><Signal label="Active services" value={dashboard.active_services} icon={Activity} /><Signal label="Webhook events (24h)" value={dashboard.webhook_events_24h} icon={Webhook} /><Signal label="Webhook failures (24h)" value={dashboard.webhook_failures_24h} icon={Webhook} warning={dashboard.webhook_failures_24h > 0} /></section>
  </div>;
}

function StatusPanel({ title, icon: Icon, values }: { title: string; icon: typeof Truck; values: Record<string, number> }) {
  const entries = Object.entries(values);
  return <article className="rounded-2xl border border-[#e5e5e5] bg-white p-4 sm:p-5 dark:border-[#333333] dark:bg-[#1b1b1b]"><h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><Icon size={18} />{title}</h3><div className="mt-4 space-y-2">{entries.length ? entries.map(([status, count]) => <div key={status} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-900"><span className="min-w-0 break-words capitalize text-slate-600 dark:text-slate-300">{status.replaceAll("_", " ")}</span><strong className="shrink-0 text-slate-900 dark:text-white">{count}</strong></div>) : <p className="py-4 text-sm text-slate-500">No activity yet.</p>}</div></article>;
}

function Signal({ label, value, icon: Icon, warning = false }: { label: string; value: number; icon: typeof Activity; warning?: boolean }) {
  return <article className="flex items-center gap-3 rounded-2xl border border-[#e5e5e5] bg-white p-4 dark:border-[#333333] dark:bg-[#1b1b1b]"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${warning ? "bg-red-100 text-red-700" : "bg-[#fff3e0] text-[#d96f00] dark:bg-[#2a2118] dark:text-[#ff9b24]"}`}><Icon size={19} /></span><div className="min-w-0"><p className="break-words text-xs text-slate-500">{label}</p><p className="text-lg font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</p></div></article>;
}
