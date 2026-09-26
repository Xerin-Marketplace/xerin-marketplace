"use client";

import { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshCwIcon, Search01Icon, CheckmarkCircle02Icon, CancelCircleIcon, ViewOffIcon, StarIcon } from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import { adminService, type ProductReview, type ProductReviewStatus } from "@/lib/api/endpoints/admin";
import { ConfirmActionDialog } from "@/components/Admin/shared/ActionDialog";

const STATUS_TABS: Array<{ value: ProductReviewStatus | ""; label: string }> = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "reported", label: "Reported" },
  { value: "hidden", label: "Hidden" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  reported: "bg-red-100 text-red-800",
  hidden: "bg-gray-200 text-gray-700",
  rejected: "bg-destructive/10 text-destructive",
};

export default function AdminReviews() {
  const [rows, setRows] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<ProductReviewStatus | "">("");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<{ review: ProductReview; to: ProductReviewStatus } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await adminService.listProductReviews(status ? { status } : {}));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  const moderate = async () => {
    if (!action) return;
    setBusy(true);
    try {
      await adminService.moderateProductReview(action.review.id, { status: action.to });
      toast.success(`Review ${action.to === "approved" ? "approved" : action.to === "rejected" ? "rejected" : "updated"}.`);
      setAction(null);
      await load();
    } catch (x) {
      toast.error(x instanceof Error ? x.message : "Moderation failed.");
    } finally {
      setBusy(false);
    }
  };

  const term = search.trim().toLowerCase();
  const visible = term
    ? rows.filter((r) => (r.comment ?? "").toLowerCase().includes(term) || (r.title ?? "").toLowerCase().includes(term))
    : rows;

  return (
    <div className="admin-catalog-page space-y-5">
      <section className="admin-catalog-header">
        <h2 className="text-2xl font-bold">Review Moderation</h2>
        <p className="mt-1 text-sm text-muted-foreground">Approve, hide or reject customer product reviews.</p>
      </section>

      <section className="admin-catalog-card overflow-hidden">
        <div className="admin-catalog-toolbar flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setStatus(t.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${status === t.value ? "bg-foreground text-background" : "border text-muted-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..." className="h-9 w-52 rounded-xl border pl-8 pr-3 text-sm" />
            </div>
            <button onClick={() => void load()} className="rounded-xl border p-2" aria-label="Refresh">
              <HugeiconsIcon icon={RefreshCwIcon} size={15} />
            </button>
          </div>
        </div>

        {loading ? (
          <p className="p-10 text-center text-muted-foreground">Loading reviews...</p>
        ) : error ? (
          <p className="p-10 text-center text-destructive">{error}</p>
        ) : !visible.length ? (
          <div className="p-10 text-center">
            <HugeiconsIcon icon={StarIcon} size={28} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No reviews{status ? ` with status "${status}"` : ""}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Review</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.user_id?.slice(0, 8) ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.product_id?.slice(0, 8) ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <HugeiconsIcon icon={StarIcon} size={13} className="text-amber-500" />{row.rating}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      {row.title && <p className="truncate font-medium">{row.title}</p>}
                      <p className="truncate text-muted-foreground">{row.comment || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[row.status] ?? "bg-muted"}`}>{row.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {row.status !== "approved" && (
                          <button onClick={() => setAction({ review: row, to: "approved" })} className="text-green-700" title="Approve">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
                          </button>
                        )}
                        {row.status !== "hidden" && (
                          <button onClick={() => setAction({ review: row, to: "hidden" })} className="text-gray-600" title="Hide">
                            <HugeiconsIcon icon={ViewOffIcon} size={16} />
                          </button>
                        )}
                        {row.status !== "rejected" && (
                          <button onClick={() => setAction({ review: row, to: "rejected" })} className="text-destructive" title="Reject">
                            <HugeiconsIcon icon={CancelCircleIcon} size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmActionDialog
        open={Boolean(action)}
        title={`${action?.to === "approved" ? "Approve" : action?.to === "hidden" ? "Hide" : "Reject"} review?`}
        description={<>This review will be marked as <strong>{action?.to}</strong>.</>}
        confirmLabel="Confirm"
        busy={busy}
        onCancel={() => setAction(null)}
        onConfirm={() => void moderate()}
      />
    </div>
  );
}
