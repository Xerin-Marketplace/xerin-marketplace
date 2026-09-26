"use client";

import { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshCwIcon, PackageIcon } from "@hugeicons/core-free-icons";
import { fulfilmentApi, type WarehouseInventoryItem } from "@/lib/api/endpoints/fulfilment";
import { InventoryAdjustDialog } from "./Adjustments";

export default function AdminInventoryProductDetails({ productId }: { productId?: string }) {
  const [rows, setRows] = useState<WarehouseInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adjustTarget, setAdjustTarget] = useState<WarehouseInventoryItem | null>(null);

  const load = useCallback(async () => {
    if (!productId) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      setRows(await fulfilmentApi.listInventory({ product_id: productId, page_size: 200 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load product inventory.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <p className="p-10 text-center text-muted-foreground">Loading inventory...</p>;
  if (error) return <p className="p-10 text-center text-destructive">{error}</p>;

  const totals = rows.reduce(
    (acc, r) => ({
      quantity: acc.quantity + r.quantity,
      reserved: acc.reserved + r.reserved_quantity,
      available: acc.available + r.available_quantity,
    }),
    { quantity: 0, reserved: 0, available: 0 },
  );

  return (
    <div className="admin-catalog-page space-y-5">
      <section className="admin-catalog-header flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{rows[0]?.product_name ?? "Product inventory"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Stock across warehouses.</p>
        </div>
        <button onClick={() => void load()} className="rounded-xl border px-3 py-2" aria-label="Refresh">
          <HugeiconsIcon icon={RefreshCwIcon} size={16} />
        </button>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="admin-catalog-card p-5">
          <p className="text-xs uppercase text-muted-foreground">On hand</p>
          <p className="mt-1 text-lg font-bold">{totals.quantity}</p>
        </div>
        <div className="admin-catalog-card p-5">
          <p className="text-xs uppercase text-muted-foreground">Reserved</p>
          <p className="mt-1 text-lg font-bold">{totals.reserved}</p>
        </div>
        <div className="admin-catalog-card p-5">
          <p className="text-xs uppercase text-muted-foreground">Available</p>
          <p className="mt-1 text-lg font-bold">{totals.available}</p>
        </div>
      </div>

      <section className="admin-catalog-card overflow-hidden">
        {!rows.length ? (
          <div className="p-10 text-center">
            <HugeiconsIcon icon={PackageIcon} size={28} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No warehouse stock for this product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-5 py-3">Warehouse</th>
                  <th className="px-5 py-3">Bin</th>
                  <th className="px-5 py-3">On hand</th>
                  <th className="px-5 py-3">Reserved</th>
                  <th className="px-5 py-3">Available</th>
                  <th className="px-5 py-3">Threshold</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-4 font-semibold">{r.warehouse_name ?? "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.bin_label ?? "—"}</td>
                    <td className="px-5 py-4">{r.quantity}</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.reserved_quantity}</td>
                    <td className="px-5 py-4 font-semibold">{r.available_quantity}</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.low_stock_threshold}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => setAdjustTarget(r)} className="text-primary-600 font-medium">Adjust</button>
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
          onDone={() => { setAdjustTarget(null); void load(); }}
        />
      )}
    </div>
  );
}
