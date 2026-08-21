"use client";

import { type AdminLogisticsOnboarding, listLogisticsOnboardingQueue, reviewLogisticsOnboarding } from "@/lib/api/endpoints/admin";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, RefreshCw, Search, ShieldCheck, X, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const states = ["submitted", "changes_requested", "ready_for_review", "in_progress", "invited", "approved"] as const;
const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const message = (error: unknown) => error instanceof Error ? error.message : "The request could not be completed.";

export default function LogisticsCompanyApprovals() {
  const [rows, setRows] = useState<AdminLogisticsOnboarding[]>([]);
  const [state, setState] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminLogisticsOnboarding | null>(null);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listLogisticsOnboardingQueue({ page, page_size: 12, search: search.trim() || undefined, state: state || undefined });
      setRows(data.results); setTotal(data.total); setTotalPages(data.total_pages);
    } catch (error) { toast.error(message(error)); }
    finally { setLoading(false); }
  }, [page, search, state]);
  useEffect(() => { const timer = setTimeout(() => void load(), 250); return () => clearTimeout(timer); }, [load]);

  const decide = async (decision: "approve" | "changes_requested") => {
    if (!selected || acting) return;
    if (decision === "changes_requested" && !note.trim()) { toast.error("Write a clear correction note before returning the application."); return; }
    setActing(true);
    try {
      await reviewLogisticsOnboarding(selected.company_id, { decision, note: note.trim() || undefined });
      toast.success(decision === "approve" ? `${selected.company_name} approved and activated.` : "Correction request sent to the logistics company.");
      setSelected(null); setNote(""); await load();
    } catch (error) { toast.error(message(error)); }
    finally { setActing(false); }
  };

  return <div className="space-y-5">
    <section className="grid gap-3 sm:grid-cols-3"><Metric icon={Clock3} label="All logistics companies" value={total} /><Metric icon={CheckCircle2} label="Complete on this page" value={rows.filter(row=>row.ready_for_review).length} /><Metric icon={ShieldCheck} label="Awaiting decision" value={rows.filter(row=>row.ready_for_review&&row.state!=="approved").length} /></section>
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700"><div><h2 className="text-lg font-bold !text-black dark:!text-black">
  Onboarding approval queue
</h2><p className="text-sm text-slate-500">Every company is visible. Approval is enabled when all required items are complete.</p></div><button onClick={()=>void load()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold dark:border-slate-600"><RefreshCw size={17}/>Refresh</button></div>
      <div className="grid gap-3 p-4 sm:grid-cols-[1fr_220px]"><label className="relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={17}/><input value={search} onChange={event=>{setSearch(event.target.value);setPage(1);}} placeholder="Search company, code, email or phone" className="min-h-11 w-full rounded-xl border border-slate-300 bg-transparent pl-10 pr-3 text-sm dark:border-slate-600"/></label><select value={state} onChange={event=>{setState(event.target.value);setPage(1);}} className="min-h-11 rounded-xl border border-slate-300 bg-transparent px-3 text-sm dark:border-slate-600"><option value="">All onboarding states</option>{states.map(value=><option key={value} value={value}>{pretty(value)}</option>)}</select></div>
      {loading ? <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({length:6}).map((_,index)=><div key={index} className="h-44 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-700"/>)}</div> : rows.length ? <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{rows.map(row=><article key={row.company_id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-bold text-slate-900 dark:text-white">{row.company_name}</h3><p className="mt-1 text-xs text-slate-500">{row.submitted_at ? `Submitted ${new Date(row.submitted_at).toLocaleString()}` : "Not submitted"}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${row.state==="submitted"?"bg-blue/10 text-blue":row.state==="approved"?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-800"}`}>{pretty(row.state)}</span></div><div className="mt-4 flex items-end justify-between"><div><strong className="text-2xl text-slate-900 dark:text-white">{row.progress_percent}%</strong><p className="text-xs text-slate-500">{row.required_completed}/{row.required_total} required</p></div><div className="flex gap-1">{row.steps.filter(step=>step.required).map(step=><span key={step.key} title={step.label} className={`grid h-6 w-6 place-items-center rounded-full ${step.completed?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-700"}`}>{step.completed?<Check size={13}/>:<X size={13}/>}</span>)}</div></div><button onClick={()=>{setSelected(row);setNote(row.review_note||"");}} className="mt-4 min-h-11 w-full rounded-xl bg-slate-950 text-sm font-bold !text-black dark:bg-blue dark:!text-black">Review application</button></article>)}</div> : <div className="p-12 text-center"><CheckCircle2 className="mx-auto text-emerald-500" size={34}/><p className="mt-3 font-bold">No companies in this queue</p><p className="text-sm text-slate-500">Change the filter to review another onboarding state.</p></div>}
      <div className="flex items-center justify-between border-t border-slate-200 p-4 text-sm dark:border-slate-700"><span className="text-slate-500">{total} result{total===1?"":"s"}</span><div className="flex items-center gap-2"><button disabled={page<=1} onClick={()=>setPage(value=>value-1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={17}/></button><span>Page {page} of {Math.max(totalPages,1)}</span><button disabled={page>=totalPages} onClick={()=>setPage(value=>value+1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight size={17}/></button></div></div>
    </section>
    {selected && <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/65 p-3"><div className="max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-800"><div className="flex items-start justify-between border-b p-5 dark:border-slate-700"><div><p className="text-xs font-bold uppercase tracking-wider text-blue">Logistics onboarding review</p><h3 className="mt-1 text-xl font-bold">{selected.company_name}</h3><p className="text-sm text-slate-500">{selected.required_completed}/{selected.required_total} required items completed</p></div><button onClick={()=>setSelected(null)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={20}/></button></div><div className="space-y-4 p-5"><div className="grid gap-3 sm:grid-cols-2">{selected.steps.map(step=><div key={step.key} className={`rounded-xl border p-3 ${step.completed?"border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20":"border-red-200 bg-red-50 dark:bg-red-950/20"}`}><div className="flex items-center gap-2">{step.completed?<CheckCircle2 className="text-emerald-600" size={17}/>:<XCircle className="text-red-600" size={17}/>}<b className="text-sm">{step.label}</b>{!step.required&&<span className="text-[10px] uppercase text-slate-500">Optional</span>}</div><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{step.description}</p></div>)}</div><label className="block text-sm font-semibold">Review note<textarea value={note} onChange={event=>setNote(event.target.value)} placeholder="Required when requesting corrections" className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-transparent p-3 font-normal dark:border-slate-600"/></label><div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button disabled={acting||selected.state==="approved"} onClick={()=>void decide("changes_requested")} className="min-h-11 rounded-xl border border-red-300 px-4 text-sm font-bold text-red-700 disabled:opacity-40">Request corrections</button>
    <button
  disabled={acting || selected.state !== "submitted" || !selected.ready_for_review}
  onClick={() => void decide("approve")}
  className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-bold !text-black dark:!text-black disabled:opacity-40"
>
  Approve & activate
</button></div>{selected.state!=="submitted"&&selected.state!=="approved"&&<p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Approval is enabled only after the company submits all required information.</p>}</div></div></div>}
  </div>;
}

function Metric({icon:Icon,label,value}:{icon:typeof Clock3;label:string;value:number}){return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"><Icon className="text-blue" size={19}/><strong className="mt-3 block text-2xl text-slate-900 dark:text-white">{value}</strong><span className="text-xs text-slate-500">{label}</span></article>;}
