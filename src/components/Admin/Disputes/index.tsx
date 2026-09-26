"use client";

import { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshCwIcon, Alert02Icon } from "@hugeicons/core-free-icons";
import { adminService, type AdminPaymentDispute, type PaymentAdminPage } from "@/lib/api/endpoints/admin";
import Pagination from "@/components/ui/Pagination";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  resolved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  escalated: "bg-red-100 text-red-800",
};

const formatMoney = (amount: number, currency = "TZS") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

export default function AdminDisputes() {
  const [page, setPage] = useState<PaymentAdminPage<AdminPaymentDispute> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPage(await adminService.listAdminPaymentDisputes({ page: pageNum, page_size: pageSize }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load disputes.");
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize]);

  useEffect(() => { void load(); }, [load]);

  const rows = page?.results ?? [];

  return (
    <div className="admin-catalog-page space-y-5">
      <section className="admin-catalog-header flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payment Disputes</h2>
          <p className="mt-1 text-sm text-muted-foreground">Disputes raised against marketplace payments.</p>
        </div>
        <button onClick={() => void load()} className="rounded-xl border px-3 py-2" aria-label="Refresh">
          <HugeiconsIcon icon={RefreshCwIcon} size={16} />
        </button>
      </section>

      <section className="admin-catalog-card overflow-hidden">
        {loading ? (
          <p className="p-10 text-center text-muted-foreground">Loading disputes...</p>
        ) : error ? (
          <p className="p-10 text-center text-destructive">{error}</p>
        ) : !rows.length ? (
          <div className="p-10 text-center">
            <HugeiconsIcon icon={Alert02Icon} size={28} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No payment disputes recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Seller</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Provider</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td className="px-5 py-4 font-semibold">{d.order_number ?? d.order_id?.slice(0, 8) ?? "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{d.customer_name ?? "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{d.seller_name ?? "—"}</td>
                    <td className="px-5 py-4 font-semibold">{formatMoney(d.amount, d.currency)}</td>
                    <td className="max-w-xs truncate px-5 py-4 text-muted-foreground">{d.reason}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[d.status] ?? "bg-muted"}`}>{d.status}</span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{d.provider ?? "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && page && page.total > 0 && (
          <Pagination
            page={pageNum}
            pageSize={pageSize}
            total={page.total}
            totalPages={page.total_pages ?? Math.max(1, Math.ceil(page.total / pageSize))}
            onPageChange={setPageNum}
            onPageSizeChange={(s) => { setPageSize(s); setPageNum(1); }}
          />
        )}
      </section>
    </div>
  );
}
