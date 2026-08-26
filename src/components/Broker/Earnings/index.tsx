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
  if (status === "available") return "bg-emerald-50 text-emerald-700";
  if (status === "pending") return "bg-amber-50 text-amber-700";
  if (status === "reversed" || status === "cancelled") return "bg-red-50 text-red-700";
  return "bg-orange-50 text-orange-700";
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
      <section className="rounded-3xl bg-slate-950 p-6 text-black sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-300">
          Broker Finance · B5
        </p>
        <h1 className="mt-2 text-3xl font-black">Commission & Escrow</h1>
        <p className="mt-2 max-w-2xl text-sm text-black/65">
          Commission is created only after a successful attributed payment. It stays
          pending while funds are held and becomes available only after Xerin&apos;s
          trusted escrow release milestone. Wallet withdrawal starts in B6.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded-2xl border bg-white p-5">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-slate-950">
              {money(value, currency)}
            </p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border bg-white">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-black text-slate-950">Commission history</h2>
            <p className="text-sm text-slate-500">
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
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading commissions…</p>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-bold text-slate-900">No commission records yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Successful purchases through your B4 referral links will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
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
                      <td className="px-4 py-4 text-slate-600">
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
                      <p className="mt-1 font-mono text-xs text-slate-500">
                        Order {row.order_id.slice(0, 8)}…
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(row.status)}`}
                    >
                      {row.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
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
            <span className="text-sm text-slate-500">
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
