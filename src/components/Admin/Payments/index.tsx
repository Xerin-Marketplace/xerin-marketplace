"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPayment, AdminPaymentMethod, listAdminFailedPayments, listAdminPaymentMethods, listAdminPayments, listAdminRefunds, refundAdminPayment } from "@/lib/api/endpoints/admin";

export type PaymentView = "transactions" | "methods" | "refunds" | "failed";
const labels = { transactions: "Transactions", methods: "Payment Methods", refunds: "Refunds", failed: "Failed Payments" };
const money = (amount: number, currency = "TZS") => new Intl.NumberFormat("en-TZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AdminPayments({ view }: { view: PaymentView }) {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [methods, setMethods] = useState<AdminPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<AdminPayment | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      if (view === "methods") { setMethods(await listAdminPaymentMethods()); setPayments([]); }
      else setPayments(await (view === "refunds" ? listAdminRefunds() : view === "failed" ? listAdminFailedPayments() : listAdminPayments()));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Failed to load payment data"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [view]);

  const filtered = useMemo(() => payments.filter((payment) => {
    const matchesQuery = `${payment.customer_name} ${payment.customer_email} ${payment.reference ?? ""} ${payment.order_number}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "all" || payment.status === status);
  }), [payments, query, status]);
  const totals = useMemo(() => ({ volume: payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0), completed: payments.filter((p) => p.status === "completed").length, pending: payments.filter((p) => ["pending", "processing"].includes(p.status)).length, exceptions: payments.filter((p) => ["failed", "cancelled", "refunded"].includes(p.status)).length }), [payments]);

  const submitRefund = async () => {
    if (!selected || refundReason.trim().length < 5) return;
    setRefunding(true); setError("");
    try { await refundAdminPayment(selected.id, refundReason.trim()); setSelected(null); setRefundReason(""); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Refund failed"); }
    finally { setRefunding(false); }
  };

  return <div className="space-y-5">
    <section className="rounded-3xl bg-gradient-to-br from-[#111827] via-[#263244] to-[#f47524] p-6 text-white shadow-lg sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[.2em] text-white/60">Revenue operations</p>
      <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-3xl font-semibold">{labels[view]}</h2><p className="mt-2 max-w-2xl text-sm text-white/75">Reconcile collections, trace provider responses and handle payment exceptions with a clear audit trail.</p></div><button onClick={() => void load()} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900">Refresh live data</button></div>
    </section>

    {view !== "methods" && <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
      ["Successful volume", money(totals.volume)], ["Completed", String(totals.completed)], ["Pending / processing", String(totals.pending)], ["Exceptions", String(totals.exceptions)]
    ].map(([label, value]) => <article key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p></article>)}</section>}

    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {view === "methods" ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {loading ? <p className="text-gray-500">Loading payment methods...</p> : methods.length === 0 ? <Empty text="No payment method activity recorded yet." /> : methods.map((method) => <article key={`${method.method}-${method.provider}`} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-lg font-semibold text-gray-900">{pretty(method.method)}</p><p className="text-sm text-gray-500">{method.provider}</p></div><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">{method.transactions} txns</span></div><p className="mt-5 text-2xl font-semibold">{money(method.volume, method.currency)}</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-green-50 p-3"><p className="text-gray-500">Successful</p><p className="font-semibold text-green-700">{method.completed}</p></div><div className="rounded-xl bg-red-50 p-3"><p className="text-gray-500">Failed</p><p className="font-semibold text-red-700">{method.failed}</p></div></div></article>)}
    </section> : <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-5 md:flex-row"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customer, order or reference" className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400"/><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm"><option value="all">All statuses</option>{["pending","processing","completed","failed","cancelled","refunded"].map((item) => <option key={item} value={item}>{pretty(item)}</option>)}</select></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr>{["Reference / order","Customer","Method","Amount","Status","Created",""].map((h) => <th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{!loading && filtered.map((payment) => <tr key={payment.id} className="hover:bg-gray-50"><td className="px-5 py-4"><p className="font-medium text-gray-900">{payment.reference || `PAY-${payment.id.slice(0,8).toUpperCase()}`}</p><p className="text-xs text-gray-500">Order {payment.order_number}</p></td><td className="px-5 py-4"><p>{payment.customer_name}</p><p className="text-xs text-gray-500">{payment.customer_email}</p></td><td className="px-5 py-4">{pretty(payment.method)}<p className="text-xs text-gray-500">{payment.provider || "Direct"}</p></td><td className="px-5 py-4 font-semibold">{money(payment.amount, payment.currency)}</td><td className="px-5 py-4"><Status value={payment.status}/>{payment.failure_reason && <p className="mt-1 max-w-[180px] truncate text-xs text-red-600">{payment.failure_reason}</p>}</td><td className="px-5 py-4 text-gray-500">{new Date(payment.created_at).toLocaleString()}</td><td className="px-5 py-4"><button onClick={() => setSelected(payment)} className="font-semibold text-orange-600 hover:text-orange-800">Review</button></td></tr>)}</tbody></table></div>
      {loading ? <p className="p-8 text-center text-gray-500">Loading transactions...</p> : filtered.length === 0 ? <Empty text={query || status !== "all" ? "No payments match these filters." : "No payment records are available yet."}/> : null}
    </section>}

    {selected && <div className="fixed inset-0 z-[80] flex items-end justify-end bg-black/40" onClick={() => setSelected(null)}><aside onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl"><div className="flex justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-orange-600">Payment review</p><h3 className="mt-1 text-xl font-semibold">{selected.reference || selected.id}</h3></div><button onClick={() => setSelected(null)} className="text-2xl text-gray-400">×</button></div><dl className="mt-6 grid grid-cols-2 gap-4 text-sm">{[["Customer", selected.customer_name],["Order", selected.order_number],["Method", pretty(selected.method)],["Provider", selected.provider || "Direct"],["Amount", money(selected.amount, selected.currency)],["Transactions", String(selected.transaction_count)]].map(([k,v]) => <div key={k} className="rounded-xl bg-gray-50 p-3"><dt className="text-gray-500">{k}</dt><dd className="mt-1 font-semibold text-gray-900">{v}</dd></div>)}</dl>{selected.failure_reason && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-xs font-semibold uppercase text-red-600">Failure reason</p><p className="mt-1 text-sm text-red-800">{selected.failure_reason}</p></div>}{selected.refund_reason && <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4"><p className="text-xs font-semibold uppercase text-blue-600">Refund reason</p><p className="mt-1 text-sm">{selected.refund_reason}</p></div>}{selected.status === "completed" && <div className="mt-6 border-t pt-5"><h4 className="font-semibold">Issue full refund</h4><p className="mt-1 text-sm text-gray-500">This marks the payment and its order as refunded and records the administrator action.</p><textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Reason for refund (required)" className="mt-3 min-h-24 w-full rounded-xl border border-gray-200 p-3 text-sm"/><button disabled={refunding || refundReason.trim().length < 5} onClick={() => void submitRefund()} className="mt-3 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">{refunding ? "Processing refund..." : `Refund ${money(selected.amount, selected.currency)}`}</button></div>}</aside></div>}
  </div>;
}

function Status({ value }: { value: string }) { const tone = value === "completed" ? "bg-green-50 text-green-700" : value === "failed" || value === "cancelled" ? "bg-red-50 text-red-700" : value === "refunded" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"; return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{pretty(value)}</span>; }
function Empty({ text }: { text: string }) { return <div className="col-span-full p-10 text-center"><div className="text-3xl">💳</div><p className="mt-2 font-medium text-gray-700">{text}</p><p className="mt-1 text-sm text-gray-500">Records will appear here as customers make payments.</p></div>; }
