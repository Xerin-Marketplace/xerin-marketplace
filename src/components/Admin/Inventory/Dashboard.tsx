"use client";

import { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PackageIcon, RefreshCwIcon, Store01Icon, TruckReturnIcon, CheckListIcon } from "@hugeicons/core-free-icons";
import { fulfilmentApi, type AdminFulfilmentDashboard } from "@/lib/api/endpoints/fulfilment";

export default function AdminInventoryDashboard() {
  const [data, setData] = useState<AdminFulfilmentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fulfilmentApi.getDashboard());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load fulfilment overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <p className="p-10 text-center text-muted-foreground">Loading inventory overview...</p>;
  if (error) return <p className="p-10 text-center text-destructive">{error}</p>;
  if (!data) return null;

  const groups = [
    { title: "Warehouses", icon: Store01Icon, stats: [
      { label: "Total", value: data.warehouses.total },
      { label: "Active", value: data.warehouses.active },
      { label: "Maintenance", value: data.warehouses.maintenance },
    ]},
    { title: "Stock Levels", icon: PackageIcon, stats: [
      { label: "SKUs tracked", value: data.inventory.total_skus },
      { label: "Units on hand", value: data.inventory.total_units },
      { label: "Low stock", value: data.inventory.low_stock_items },
      { label: "Out of stock", value: data.inventory.out_of_stock_items },
    ]},
    { title: "Inbound Shipments", icon: TruckReturnIcon, stats: [
      { label: "Pending", value: data.inbound.pending },
      { label: "In transit", value: data.inbound.in_transit },
      { label: "Received", value: data.inbound.received },
      { label: "Completed", value: data.inbound.completed },
    ]},
    { title: "Pick Lists", icon: CheckListIcon, stats: [
      { label: "Pending", value: data.pick_lists.pending },
      { label: "In progress", value: data.pick_lists.in_progress },
      { label: "Picked", value: data.pick_lists.picked },
      { label: "Packed", value: data.pick_lists.packed },
    ]},
  ];

  return (
    <div className="admin-catalog-page space-y-5">
      <section className="admin-catalog-header flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Stock Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">Cross-seller warehouse inventory totals from fulfilment.</p>
        </div>
        <button onClick={() => void load()} className="rounded-xl border px-3 py-2" aria-label="Refresh">
          <HugeiconsIcon icon={RefreshCwIcon} size={16} />
        </button>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {groups.map((g) => (
          <section key={g.title} className="admin-catalog-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <HugeiconsIcon icon={g.icon} size={18} className="text-primary-600" />
              <h3 className="font-bold">{g.title}</h3>
            </div>
            <dl className="space-y-2">
              {g.stats.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <dt className="text-muted-foreground">{s.label}</dt>
                  <dd className="font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
