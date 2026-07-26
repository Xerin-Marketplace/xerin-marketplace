"use client";

import { useState, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertCircle, AlertTriangle, Box, PackageCheck, PackageX, RefreshCw, Search, Warehouse } from "lucide-react";
import { useMyInventory, useMyLowStock, useUpdateInventoryItem } from "@/hooks/useInventory";
import { authStorage } from "@/lib/auth/storage";
import type { InventoryItem } from "@/lib/api/endpoints/inventory";

const STOCK_STATUSES = [
  { value: "", label: "All statuses" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "reserved", label: "Reserved" },
];

const ROWS = [10, 25, 50];

export default function SellerInventory() {
  const router = useRouter();
  const user = authStorage.getUser<{ account_type?: string; roles?: string[]; seller_status?: string | null }>();
  const token = authStorage.getAccessToken();
  const isSeller = Boolean(user && (user.account_type === "seller" || (user.roles ?? []).includes("seller")));

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const { data: inventory = [], isLoading, error, refetch } = useMyInventory({
    search: search || undefined,
    stock_status: statusFilter || undefined,
    warehouse_id: warehouseFilter || undefined,
  });
  const { data: lowStock = [], isLoading: lowStockLoading } = useMyLowStock();
  const updateItem = useUpdateInventoryItem();

  if (!token || !isSeller) {
    router.replace("/signin?redirect=/seller/inventory");
    return null;
  }

  const warehouses = useMemo(() => {
    const map = new Map<string, string>();
    inventory.forEach((item) => {
      if (item.warehouse?.id) map.set(item.warehouse.id, item.warehouse.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [inventory]);

  const total = inventory.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginated = useMemo(() => inventory.slice((page - 1) * pageSize, page * pageSize), [inventory, page, pageSize]);

  const stats = useMemo(() => {
    const outOfStock = inventory.filter((i) => i.available === 0 || i.on_hand === 0).length;
    const low = inventory.filter((i) => i.available > 0 && i.available <= i.low_stock_threshold).length;
    const inStock = inventory.filter((i) => i.available > i.low_stock_threshold).length;
    const reserved = inventory.reduce((sum, i) => sum + (i.reserved || 0), 0);
    return { outOfStock, low, inStock, reserved };
  }, [inventory]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editItem) return;
    const form = new FormData(event.currentTarget);
    const payload = {
      on_hand: Number(form.get("on_hand")),
      reserved: Number(form.get("reserved")),
      incoming: Number(form.get("incoming")),
      damaged: Number(form.get("damaged")),
      low_stock_threshold: Number(form.get("low_stock_threshold")),
      reorder_quantity: form.get("reorder_quantity") ? Number(form.get("reorder_quantity")) : null,
    };
    try {
      await updateItem.mutateAsync({ id: editItem.id, payload });
      toast.success("Inventory updated.");
      setEditItem(null);
    } catch {
      toast.error("Failed to update inventory.");
    }
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Inventory</h2>
          <p className="mt-1 text-sm text-[#64748b]">Track stock levels, warehouses and low-stock alerts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => void refetch()} className="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold dark:border-white/10">
            <RefreshCw size={17} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={PackageCheck} label="In Stock" value={stats.inStock} tone="green" />
        <SummaryCard icon={AlertTriangle} label="Low Stock" value={stats.low} tone="amber" />
        <SummaryCard icon={PackageX} label="Out of Stock" value={stats.outOfStock} tone="red" />
        <SummaryCard icon={Box} label="Reserved Units" value={stats.reserved} tone="blue" />
      </div>

      {!lowStockLoading && lowStock.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <div>
              <p className="font-semibold">Low stock alert</p>
              <p className="text-sm">{lowStock.length} product(s) are at or below the low-stock threshold.</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 dark:border-white/10 dark:bg-white/5">
            <Search size={17} className="text-[#64748b]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search product or SKU"
              className="w-44 bg-transparent text-sm outline-none"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
          >
            {STOCK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {warehouses.length > 0 && (
            <select
              value={warehouseFilter}
              onChange={(e) => { setWarehouseFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
            >
              <option value="">All warehouses</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          )}
          <button
            onClick={() => { setSearch(""); setStatusFilter(""); setWarehouseFilter(""); setPage(1); }}
            className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm font-semibold dark:border-white/10 dark:bg-white/5"
          >
            Clear
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-[#64748b]">Loading inventory...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">Unable to load inventory. <button onClick={() => void refetch()} className="underline">Retry</button></div>
        ) : paginated.length === 0 ? (
          <div className="py-12 text-center text-[#64748b]">
            <Box className="mx-auto" size={34} />
            <p className="mt-3 font-semibold">No inventory records found</p>
            <p className="text-sm">Inventory will appear once products are stocked.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-[#64748b] dark:bg-white/5">
                <tr>
                  {["Product", "SKU", "Warehouse", "On Hand", "Reserved", "Available", "Incoming", "Damaged", "Threshold", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] dark:divide-white/10">
                {paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-4 py-3 font-medium">{item.product?.name ?? "Unknown"}</td>
                    <td className="px-4 py-3 text-[#64748b]">{item.product?.sku ?? "-"}</td>
                    <td className="px-4 py-3 text-[#64748b]"><span className="inline-flex items-center gap-1"><Warehouse size={14} /> {item.warehouse?.name ?? "-"}</span></td>
                    <td className="px-4 py-3">{item.on_hand}</td>
                    <td className="px-4 py-3">{item.reserved}</td>
                    <td className="px-4 py-3 font-semibold">{item.available}</td>
                    <td className="px-4 py-3">{item.incoming}</td>
                    <td className="px-4 py-3">{item.damaged}</td>
                    <td className="px-4 py-3">{item.low_stock_threshold}</td>
                    <td className="px-4 py-3"><StockStatusBadge item={item} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditItem(item)} className="rounded-lg bg-[#f8fafc] px-2.5 py-1.5 text-xs font-semibold dark:bg-white/10">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2 py-1 text-sm dark:border-white/10 dark:bg-white/5"
            >
              {ROWS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-sm disabled:opacity-50 dark:border-white/10 dark:bg-[#1f2937]">Previous</button>
            <span className="text-sm text-[#64748b]">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-sm disabled:opacity-50 dark:border-white/10 dark:bg-[#1f2937]">Next</button>
          </div>
        </div>
      </div>

      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-[#1f2937]">
            <h3 className="mb-1 text-lg font-semibold">Update Inventory</h3>
            <p className="mb-4 text-sm text-[#64748b]">{editItem.product?.name}</p>
            <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
              <Field name="on_hand" label="On Hand" defaultValue={editItem.on_hand} />
              <Field name="reserved" label="Reserved" defaultValue={editItem.reserved} />
              <Field name="incoming" label="Incoming" defaultValue={editItem.incoming} />
              <Field name="damaged" label="Damaged" defaultValue={editItem.damaged} />
              <Field name="low_stock_threshold" label="Low Stock Threshold" defaultValue={editItem.low_stock_threshold} />
              <Field name="reorder_quantity" label="Reorder Quantity" defaultValue={editItem.reorder_quantity ?? ""} />
              <div className="col-span-2 mt-2 flex gap-2">
                <button type="button" onClick={() => setEditItem(null)} className="flex-1 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold dark:border-white/10 dark:bg-[#2d3134]">Cancel</button>
                <button type="submit" disabled={updateItem.isPending} className="flex-1 rounded-xl bg-[#f7941d] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{updateItem.isPending ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }: { icon: typeof Box; label: string; value: number; tone: "green" | "amber" | "red" | "blue" }) {
  const toneClasses = {
    green: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  };
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses[tone]}`}><Icon size={19} /></span>
      <p className="mt-3 text-sm text-[#64748b]">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StockStatusBadge({ item }: { item: InventoryItem }) {
  if (item.available === 0 || item.on_hand === 0) return <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">Out of Stock</span>;
  if (item.available <= item.low_stock_threshold) return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">Low Stock</span>;
  if (item.reserved > 0) return <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">Reserved</span>;
  return <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">In Stock</span>;
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: number | string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        name={name}
        type="number"
        min="0"
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 font-normal outline-none focus:border-[#f7941d] dark:border-white/10 dark:bg-white/5"
      />
    </label>
  );
}
