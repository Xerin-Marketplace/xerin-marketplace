"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, RefreshCw, Search, ShieldCheck, XCircle } from "lucide-react";
import {
  type AdminSellerPayoutAccount,
  listAdminSellerPayoutAccounts,
  verifyAdminSellerPayoutAccount,
} from "@/lib/api/endpoints/admin";

const pretty = (value?: string | null) => (value || "unknown").replaceAll("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
const mask = (value: string) => value.length <= 4 ? value : `${"•".repeat(Math.min(8, value.length - 4))}${value.slice(-4)}`;

export default function SellerPayoutAccounts() {
  const [rows, setRows] = useState<AdminSellerPayoutAccount[]>([]);
  const [status, setStatus] = useState("pending");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AdminSellerPayoutAccount | null>(null);
  const [action, setAction] = useState<"verified" | "rejected" | null>(null);
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => { setDebounced(query.trim()); setPage(1); }, 350);
    return () => window.clearTimeout(id);
  }, [query]);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const result = await listAdminSellerPayoutAccounts({
        page, page_size: pageSize,
        search: debounced || undefined,
        status: status === "all" ? undefined : status,
      });
      setRows(result.results); setTotal(result.total); setTotalPages(result.total_pages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load seller payout accounts");
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [page, pageSize, debounced, status]);

  const counts = useMemo(() => ({ pending: rows.filter(r => r.verification_status === "pending").length }), [rows]);

  const openAction = (row: AdminSellerPayoutAccount, next: "verified" | "rejected") => {
    setSelected(row); setAction(next); setReference("");
  };

  const submit = async () => {
    if (!selected || !action) return;
    if (action === "rejected" && reference.trim().length < 3) {
      setError("Enter a short rejection reason before rejecting the payout account."); return;
    }
    setSaving(true); setError("");
    try {
      await verifyAdminSellerPayoutAccount(selected.id, action, reference.trim() || undefined);
      setSelected(null); setAction(null); setReference(""); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to update payout account"); }
    finally { setSaving(false); }
  };

  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#f47524]">Seller settlement controls</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Seller Payout Accounts</h2>
          <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">Verify the bank or mobile-money destination before a seller can request a withdrawal to that account.</p>
        </div>
        <button onClick={() => void load()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"><RefreshCw size={15}/>Refresh</button>
      </div>
    </section>

    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-3 border-b border-slate-100 p-5 md:grid-cols-[1fr_220px]">
        <div className="relative"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search seller, email, provider or account..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-orange-300"/></div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm"><option value="all">All statuses</option><option value="pending">Pending verification</option><option value="verified">Verified</option><option value="rejected">Rejected</option></select>
      </div>

      {loading ? <div className="p-12 text-center text-sm text-slate-500"><RefreshCw className="mx-auto animate-spin" size={20}/><p className="mt-3">Loading payout accounts...</p></div>
      : !rows.length ? <div className="p-12 text-center"><ShieldCheck className="mx-auto text-slate-300" size={34}/><p className="mt-3 font-semibold text-slate-700">No payout accounts found.</p></div>
      : <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Seller","Provider / Type","Account holder","Destination","Currency","Default","Status","Created","Action"].map(h => <th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map(row => <tr key={row.id} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{row.seller_name}</p><p className="text-xs text-slate-500">{row.business_name}</p><p className="text-xs text-slate-400">{row.seller_email}</p></td><td className="px-5 py-4"><p className="font-semibold">{row.provider}</p><p className="text-xs text-slate-500">{pretty(row.account_type)}</p></td><td className="px-5 py-4">{row.account_name}</td><td className="px-5 py-4 font-mono text-xs">{mask(row.account_number)}</td><td className="px-5 py-4">{row.currency}</td><td className="px-5 py-4">{row.is_default ? <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">Default</span> : "—"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.verification_status === "verified" ? "bg-emerald-50 text-emerald-700" : row.verification_status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{pretty(row.verification_status)}</span>{row.provider_reference && <p className="mt-1 max-w-48 truncate text-xs text-slate-400" title={row.provider_reference}>{row.provider_reference}</p>}</td><td className="px-5 py-4 text-xs text-slate-500">{new Date(row.created_at).toLocaleString()}</td><td className="px-5 py-4">{row.verification_status === "pending" ? <div className="flex gap-2"><button onClick={() => openAction(row,"verified")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-black"><CheckCircle2 size={14}/>Verify</button><button onClick={() => openAction(row,"rejected")} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"><XCircle size={14}/>Reject</button></div> : <span className="text-xs text-slate-400">Reviewed</span>}</td></tr>)}</tbody></table></div>}

      {!loading && total > 0 && <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">Showing <b>{(page-1)*pageSize+1}-{Math.min(page*pageSize,total)}</b> of <b>{total}</b></p><div className="flex items-center gap-2"><select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="h-10 rounded-xl border px-3 text-sm">{[10,20,50,100].map(s => <option key={s} value={s}>{s} / page</option>)}</select><button disabled={page<=1} onClick={() => setPage(page-1)} className="inline-flex h-10 items-center gap-1 rounded-xl border px-3 text-sm font-semibold disabled:opacity-40"><ChevronLeft size={14}/>Previous</button><span className="min-w-24 text-center text-xs text-slate-500">Page {page} of {Math.max(totalPages,1)}</span><button disabled={page>=totalPages || !totalPages} onClick={() => setPage(page+1)} className="inline-flex h-10 items-center gap-1 rounded-xl border px-3 text-sm font-semibold disabled:opacity-40">Next<ChevronRight size={14}/></button></div></div>}
    </section>

    {selected && action && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4" onMouseDown={() => setSelected(null)}><div onMouseDown={e => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#f47524]">Payout account review</p><h3 className="mt-1 text-xl font-bold text-slate-900">{action === "verified" ? "Verify payout account" : "Reject payout account"}</h3><div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm"><p className="font-semibold">{selected.seller_name} · {selected.provider}</p><p className="mt-1 text-slate-500">{selected.account_name} · {mask(selected.account_number)}</p></div><label className="mt-5 block text-sm font-semibold text-slate-700">{action === "verified" ? "Provider reference (optional)" : "Rejection reason"}</label><textarea value={reference} onChange={e => setReference(e.target.value)} placeholder={action === "verified" ? "Verification/reference number if available" : "Explain why this account cannot be verified"} className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-orange-300"/><div className="mt-5 flex justify-end gap-2"><button onClick={() => setSelected(null)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">Cancel</button><button disabled={saving || (action === "rejected" && reference.trim().length < 3)} onClick={() => void submit()} className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-40 ${action === "verified" ? "bg-emerald-600" : "bg-red-600"}`}>{saving ? "Saving..." : action === "verified" ? "Verify account" : "Reject account"}</button></div></div></div>}
  </div>;
}
