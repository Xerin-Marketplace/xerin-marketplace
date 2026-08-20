"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, PackageCheck, X } from "lucide-react";
import toast from "react-hot-toast";
import { ordersApi } from "@/lib/api/endpoints/commerce";
import type { Order } from "@/types/api/commerce";
import { formatCurrency } from "@/lib/formatCurrency";
import UnavailableFeature from "@/components/Admin/Common/UnavailableFeature";

const statuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const statusClass = (value: string) => ["delivered", "paid"].includes(value) ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ["cancelled", "refunded"].includes(value) ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-800";

export default function OrderDetails({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { const result = await ordersApi.get(orderId); setOrder(result); setNextStatus(result.status); }
    catch (cause) { setOrder(null); setError(cause instanceof Error ? cause.message : "Unable to load order."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [orderId]);

  const update = async () => {
    if (!order || !nextStatus || nextStatus === order.status) return;
    setSaving(true);
    try { await ordersApi.updateStatus(order.id, { status: nextStatus }); toast.success("Order status updated."); setStatusOpen(false); await load(); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "Status update failed."); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="rounded-2xl border bg-white p-12 text-center text-slate-500"><Loader2 className="mx-auto animate-spin"/><p className="mt-3 text-sm">Loading order details…</p></div>;
  if (error || !order) return <div className="rounded-2xl border border-red-200 bg-white p-10 text-center"><p className="text-sm text-red-600">{error || "Order not found."}</p><button onClick={() => void load()} className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Retry</button></div>;

  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#1f2937]">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-[#f47524]"><ArrowLeft size={16}/>Back to orders</Link>
      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Order reference</p><h2 className="mt-1 break-all text-xl font-bold tracking-[-.02em] sm:text-2xl">{order.id}</h2><p className="mt-1 text-sm text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleString() : "Date unavailable"}</p></div>
        <button onClick={() => { setNextStatus(order.status); setStatusOpen(true); }} className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white sm:w-auto dark:bg-[#f47524]"><PackageCheck size={17}/>Update status</button>
      </div>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Status"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(order.status)}`}>{pretty(order.status)}</span></Summary>
        <Summary label="Subtotal">{formatCurrency(order.subtotal, order.currency)}</Summary>
        <Summary label="Discount">{formatCurrency(order.discount_amount, order.currency)}</Summary>
        <Summary label="Total">{formatCurrency(order.total, order.currency)}</Summary>
      </dl>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
      <div className="border-b border-slate-200 p-5 dark:border-white/10"><h3 className="font-bold">Order items</h3><p className="mt-1 text-xs text-slate-500">{order.items.length} line item{order.items.length === 1 ? "" : "s"}</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50"><tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Quantity</th><th className="px-5 py-3">Unit price</th><th className="px-5 py-3">Total</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id}><td className="px-5 py-4 font-semibold">{item.product_name}</td><td className="px-5 py-4">{item.quantity}</td><td className="px-5 py-4">{formatCurrency(item.unit_price, order.currency)}</td><td className="px-5 py-4 font-semibold">{formatCurrency(item.total_price, order.currency)}</td></tr>)}</tbody></table></div>
    </section>

    <UnavailableFeature title="Tracking, cancellation and order-level refunds are not available yet" description="The backend currently exposes order details and a shared status mutation only. Tracking details, cancellation workflow and order-level refund endpoints are not simulated." />

    {statusOpen && <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={() => !saving && setStatusOpen(false)}><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#1f2937] sm:p-6" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#f47524]">Controlled status change</p><h3 className="mt-1 text-xl font-bold">Update order status</h3><p className="mt-1 text-sm text-slate-500">Current status: {pretty(order.status)}</p></div><button disabled={saving} onClick={() => setStatusOpen(false)} className="rounded-xl border p-2 text-slate-500"><X size={18}/></button></div><label className="mt-5 block text-sm font-semibold">New status<select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none focus:border-[#f47524] dark:border-white/15 dark:bg-white/5">{statuses.map((status) => <option key={status} value={status}>{pretty(status)}</option>)}</select></label><p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500 dark:bg-white/5">This action uses the live admin order-status endpoint and may trigger downstream fulfilment behavior.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={saving} onClick={() => setStatusOpen(false)} className="min-h-11 rounded-xl border font-semibold">Cancel</button><button disabled={saving || nextStatus === order.status} onClick={() => void update()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 font-semibold text-white disabled:opacity-40 dark:bg-[#f47524]">{saving ? <Loader2 className="animate-spin" size={17}/> : <Check size={17}/>}Confirm update</button></div></div></div>}
  </div>;
}

function Summary({ label, children }: { label: string; children: React.ReactNode }) { return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[.03]"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-2 font-bold">{children}</dd></div>; }
