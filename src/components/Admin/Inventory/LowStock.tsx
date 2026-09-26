"use client";

import { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshCwIcon, Alert02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import { fulfilmentApi, type WarehouseInventoryItem } from "@/lib/api/endpoints/fulfilment";
import { InventoryAdjustDialog } from "./Adjustments";

export default function AdminLowStock() {
  const [rows, setRows] = useState<WarehouseInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [adjustTarget, setAdjustTarget] = useState<WarehouseInventoryItem | null>(null);

  const load = useCallback(async (term?: string) => {
    setLoading(true);
    setError("");
    try {
      setRows(await fulfilmentApi.listInventory({ low_stock: true, search: term || undefined, page_size: 200 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load low-stock records.");
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
          <h2 className="text-2xl font-bold">Low Stock Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">Warehouse items at or below their low-stock threshold.</p>
        </div>
        <button onClick={() => void load(search.trim())} className="rounded-xl border px-3 py-2" aria-label="Refresh">
          <HugeiconsIcon icon={RefreshCwIcon} size={16} />
        </button>
      </section>

      <section className="admin-catalog-card overflow-hidden">
        <div className="admin-catalog-toolbar">
          <div className="relative flex-1">
            <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="h-10 w-full rounded-xl border pl-9 pr-3" />
          </div>
        </div>
        {loading ? (
          <p className="p-10 text-center text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="p-10 text-center text-destructive">{error}</p>
        ) : !rows.length ? (
          <div className="p-10 text-center">
            <HugeiconsIcon icon={Alert02Icon} size={28} className="mx-auto mb-2 text-green-600" />
            <p className="text-muted-foreground">No low-stock items.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Warehouse</th>
                  <th className="px-5 py-3">Bin</th>
                  <th className="px-5 py-3">Available</th>
                  <th className="px-5 py-3">Threshold</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-4 font-semibold">{r.product_name ?? r.product_id}</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.warehouse_name ?? "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.bin_label ?? "—"}</td>
                    <td className={`px-5 py-4 font-semibold ${r.available_quantity === 0 ? "text-destructive" : "text-amber-600"}`}>
                      {r.available_quantity}
                    </td>
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
          onDone={() => { setAdjustTarget(null); void load(search.trim()); }}
        />
      )}
    </div>
  );
}
