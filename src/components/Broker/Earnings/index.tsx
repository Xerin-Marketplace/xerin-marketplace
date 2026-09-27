"use client";

import { useEffect, useMemo, useState } from "react";
import { brokersApi } from "@/lib/api/endpoints/brokers";
import type {
 BrokerCommission,
 BrokerCommissionStatus,
 BrokerCommissionSummary,
} from "@/types/api/broker";
import { formatCurrency } from "@/utils/currency";

const FILTERS: { label: string; value: "" | BrokerCommissionStatus }[] = [
 { label: "All", value: "" },
 { label: "Pending", value: "pending" },
 { label: "Available", value: "available" },
 { label: "Reversed", value: "reversed" },
];

function money(value: string | number, currency: string) {
 return formatCurrency(Number(value || 0), currency);
}

function statusClass(status: BrokerCommissionStatus) {
 if (status === "available") return "bg-green-light-6 text-green-dark";
 if (status === "pending") return "bg-yellow-light-4 text-yellow-dark-2";
 if (status === "reversed" || status === "cancelled") return "bg-red-light-6 text-red-dark";
 return "bg-primary/10 text-primary";
}

export default function BrokerEarnings() {
 const [summary, setSummary] = useState<BrokerCommissionSummary | null>(null);
 const [rows, setRows] = useState<BrokerCommission[]>([]);
 const [filter, setFilter] = useState<"" | BrokerCommissionStatus>("");
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(0);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 const currency = summary?.currency || "TZS";

 const load = async () => {
 setLoading(true);
 setError("");
 try {
 const [s, list] = await Promise.all([
 brokersApi.commissionSummary(),
 brokersApi.commissions({
 page,
 page_size: 20,
 ...(filter ? { status: filter } : {}),
 }),
 ]);
 setSummary(s);
 setRows(list.results);
 setTotalPages(list.total_pages);
 } catch (e) {
 setError(e instanceof Error ? e.message : "Unable to load Broker earnings");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void load();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [page, filter]);

 const cards = useMemo(
 () => [
 ["Pending commission", summary?.pending_amount || "0"],
 ["Available commission", summary?.available_amount || "0"],
 ["Reversed / refunded", summary?.reversed_amount || "0"],
 ["Lifetime attributed", summary?.lifetime_commission || "0"],
 ],
 [summary],
 );

 return (
 <div className="space-y-5">
 <div>
 <h1 className="text-xl font-bold text-foreground sm:text-2xl">
 Commission &amp; escrow
 </h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Commission becomes available after Xerin&apos;s escrow release milestone.
 </p>
 </div>

 {error && (
 <div className="rounded-xl border border-red-light-4 bg-red-light-6 p-4 text-sm font-semibold text-red-dark">
 {error}
 </div>
 )}

 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 {cards.map(([label, value]) => (
 <article key={label} className="rounded-xl border bg-card p-5">
 <p className="text-sm font-semibold text-muted-foreground">{label}</p>
 <p className="mt-2 text-2xl font-black text-foreground">
 {money(value, currency)}
 </p>
 </article>
 ))}
 </div>

 <section className="rounded-xl border bg-card">
 <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h2 className="font-black text-foreground">Commission history</h2>
 <p className="text-sm text-muted-foreground">
 {summary?.total_records ?? 0} attributed commission record(s)
 </p>
 </div>
 <div className="flex flex-wrap gap-2">
 {FILTERS.map((item) => (
 <button
 key={item.label}
 type="button"
 onClick={() => {
 setFilter(item.value);
 setPage(1);
 }}
 className={`rounded-xl px-3 py-2 text-sm font-bold ${
 filter === item.value
 ? "bg-primary text-primary-foreground"
 : "bg-muted text-accent-foreground"
 }`}
 >
 {item.label}
 </button>
 ))}
 </div>
 </div>

 {loading ? (
 <p className="p-6 text-sm text-muted-foreground">Loading commissions…</p>
 ) : rows.length === 0 ? (
 <div className="p-8 text-center">
 <p className="font-bold text-foreground">No commission records yet</p>
 <p className="mt-1 text-sm text-muted-foreground">
 Successful purchases through your B4 referral links will appear here.
 </p>
 </div>
 ) : (
 <>
 <div className="hidden overflow-x-auto md:block">
 <table className="w-full text-left text-sm">
 <thead className="bg-muted text-xs uppercase text-muted-foreground">
 <tr>
 <th className="px-4 py-3">Created</th>
 <th className="px-4 py-3">Order</th>
 <th className="px-4 py-3">Gross reward</th>
 <th className="px-4 py-3">Reversed</th>
 <th className="px-4 py-3">Net</th>
 <th className="px-4 py-3">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y">
 {rows.map((row) => (
 <tr key={row.id}>
 <td className="px-4 py-4 text-muted-foreground">
 {new Date(row.created_at).toLocaleString()}
 </td>
 <td className="px-4 py-4 font-mono text-xs">
 {row.order_id.slice(0, 8)}…
 </td>
 <td className="px-4 py-4 font-bold">
 {money(row.amount, row.currency)}
 </td>
 <td className="px-4 py-4">
 {money(row.reversed_amount, row.currency)}
 </td>
 <td className="px-4 py-4 font-black">
 {money(row.net_amount, row.currency)}
 </td>
 <td className="px-4 py-4">
 <span
 className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(row.status)}`}
 >
 {row.status.replaceAll("_", " ")}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="divide-y md:hidden">
 {rows.map((row) => (
 <article key={row.id} className="p-4">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="font-black">{money(row.net_amount, row.currency)}</p>
 <p className="mt-1 font-mono text-xs text-muted-foreground">
 Order {row.order_id.slice(0, 8)}…
 </p>
 </div>
 <span
 className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(row.status)}`}
 >
 {row.status.replaceAll("_", " ")}
 </span>
 </div>
 <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
 <span>Gross: {money(row.amount, row.currency)}</span>
 <span>Reversed: {money(row.reversed_amount, row.currency)}</span>
 </div>
 </article>
 ))}
 </div>
 </>
 )}

 {totalPages > 1 && (
 <div className="flex items-center justify-between border-t p-4">
 <button
 type="button"
 disabled={page <= 1}
 onClick={() => setPage((v) => Math.max(1, v - 1))}
 className="rounded-xl border px-3 py-2 text-sm font-bold disabled:opacity-40"
 >
 Previous
 </button>
 <span className="text-sm text-muted-foreground">
 Page {page} of {totalPages}
 </span>
 <button
 type="button"
 disabled={page >= totalPages}
 onClick={() => setPage((v) => v + 1)}
 className="rounded-xl border px-3 py-2 text-sm font-bold disabled:opacity-40"
 >
 Next
 </button>
 </div>
 )}
 </section>
 </div>
 );
}
