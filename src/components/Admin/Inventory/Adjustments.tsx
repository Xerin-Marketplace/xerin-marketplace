"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshCwIcon, Search01Icon, PreferenceHorizontalIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import { fulfilmentApi, type WarehouseInventoryItem } from "@/lib/api/endpoints/fulfilment";

export default function AdminInventoryAdjustments() {
  const [rows, setRows] = useState<WarehouseInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [adjustTarget, setAdjustTarget] = useState<WarehouseInventoryItem | null>(null);

  const load = useCallback(async (term?: string) => {
    setLoading(true);
    setError("");
    try {
      setRows(await fulfilmentApi.listInventory({ search: term || undefined, page_size: 200 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load inventory records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const t = window.setTimeout(() => void load(search.trim()), 350);
    return () => window.clearTimeout(t);
  }, [search, load]);

  return (
    <div className="admin-catalog-page space-y-5">
      <section className="admin-catalog-header flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Stock Adjustments</h2>
          <p className="mt-1 text-sm text-muted-foreground">Increase or decrease warehouse stock with an audited reason.</p>
        </div>
        <button onClick={() => void load(search.trim())} className="rounded-xl border px-3 py-2" aria-label="Refresh">
          <HugeiconsIcon icon={RefreshCwIcon} size={16} />
        </button>
      </section>

      <section className="admin-catalog-card overflow-hidden">
        <div className="admin-catalog-toolbar">
          <div className="relative flex-1">
            <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products or warehouses..." className="h-10 w-full rounded-xl border pl-9 pr-3" />
          </div>
        </div>
        {loading ? (
          <p className="p-10 text-center text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="p-10 text-center text-destructive">{error}</p>
        ) : !rows.length ? (
          <p className="p-10 text-center text-muted-foreground">No inventory records.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Warehouse</th>
                  <th className="px-5 py-3">On hand</th>
                  <th className="px-5 py-3">Reserved</th>
                  <th className="px-5 py-3">Available</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-4 font-semibold">{r.product_name ?? r.product_id}</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.warehouse_name ?? "—"}</td>
                    <td className="px-5 py-4">{r.quantity}</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.reserved_quantity}</td>
                    <td className="px-5 py-4 font-semibold">{r.available_quantity}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => setAdjustTarget(r)} className="text-primary-600 font-medium">
                        <HugeiconsIcon icon={PreferenceHorizontalIcon} className="mr-1 inline" size={13} />Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {adjustTarget && (
        <InventoryAdjustDialog
          item={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onDone={() => { setAdjustTarget(null); void load(search.trim()); }}
        />
      )}
    </div>
  );
}

export function InventoryAdjustDialog({ item, onClose, onDone }: { item: WarehouseInventoryItem; onClose: () => void; onDone: () => void }) {
  const [type, setType] = useState<"increase" | "decrease">("increase");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (quantity < 1 || !reason.trim()) return;
    setBusy(true);
    try {
      await fulfilmentApi.adjustInventory(item.id, {
        adjustment_type: type,
        quantity,
        reason: reason.trim(),
        notes: notes.trim() || null,
      });
      toast.success("Stock adjusted.");
      onDone();
    } catch (x) {
      toast.error(x instanceof Error ? x.message : "Adjustment failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-card p-6">
        <div className="flex justify-between">
          <h3 className="font-bold">Adjust stock — {item.product_name ?? "item"}</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">On hand {item.quantity} · Reserved {item.reserved_quantity}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["increase", "decrease"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-xl border-2 py-2.5 text-sm font-semibold capitalize ${type === t ? "border-[#f47524] bg-orange-50" : "border-gray-200"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quantity</span>
          <input type="number" min={1} className="field" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} />
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason *</span>
          <input className="field" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Stock count correction" />
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</span>
          <input className="field" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <button disabled={busy || quantity < 1 || !reason.trim()} className="mt-5 w-full rounded-xl bg-foreground py-3 font-semibold text-background">
          Apply adjustment
        </button>
      </form>
      <style jsx global>{`.field{margin-top:.5rem;min-height:46px;width:100%;border-radius:.75rem;border:2px solid #d8e0e9;background:#fff;padding:.7rem .9rem;outline:none}.field:focus{border-color:#f47524}`}</style>
    </div>
  );
}
