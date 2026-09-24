"use client";


import { Spinner } from "@/components/ui/Spinner";
import {
 sellerInventoryApi,
 type SellerInventoryItem,
 type SellerInventorySummary,
} from "@/lib/api/endpoints/seller-inventory";
import { productsApi } from "@/lib/api/endpoints/products";
import type { Product } from "@/types/api/product";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { Alert02Icon, ChartColumnIcon, Package02Icon, CheckmarkCircle02Icon, PackageAddIcon, Location01Icon, RefreshCwIcon, Search01Icon, WarehouseIcon, CancelCircleIcon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const PAGE_SIZE = 20;

export default function SellerInventoryPage() {
 const [rows, setRows] = useState<SellerInventoryItem[]>([]);
 const [products, setProducts] = useState<Product[]>([]);
 const [summary, setSummary] = useState<SellerInventorySummary | null>(null);
 const [loading, setLoading] = useState(true);
 const [busy, setBusy] = useState("");
 const [error, setError] = useState("");
 const [page, setPage] = useState(1);
 const [total, setTotal] = useState(0);
 const [search, setSearch] = useState("");
 const [query, setQuery] = useState("");
 const [stockFilter, setStockFilter] =
 useState<"all" | "low" | "out">("all");
 const [configureProduct, setConfigureProduct] = useState<Product | null>(null);
 const [quantity, setQuantity] = useState("0");
 const [threshold, setThreshold] = useState("5");
 const [location, setLocation] = useState("");
 const [configuring, setConfiguring] = useState(false);

 const load = async () => {
 setLoading(true);
 setError("");
 try {
 const [inventory, productRows, summaryRow] = await Promise.all([
 sellerInventoryApi.list({
 page,
 page_size: PAGE_SIZE,
 search: query || undefined,
 low_stock: stockFilter === "low" ? true : undefined,
 out_of_stock: stockFilter === "out" ? true : undefined,
 }),
 productsApi.getMyProducts({ skip: 0, limit: 100 }),
 sellerInventoryApi.summary(),
 ]);
 setRows(inventory.results);
 setTotal(inventory.total);
 setProducts(productRows);
 setSummary(summaryRow);
 } catch (cause) {
 setError(
 cause instanceof Error
 ? cause.message
 : "Unable to load seller inventory.",
 );
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void load();
 }, [page, query, stockFilter]);

 const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

 const configure = async () => {
 if (!configureProduct) return;
 const opening = Number(quantity);
 const low = Number(threshold);

 if (!Number.isInteger(opening) || opening < 0) {
 toast.error("Opening stock must be 0 or more.");
 return;
 }
 if (!Number.isInteger(low) || low < 0) {
 toast.error("Low-stock threshold must be 0 or more.");
 return;
 }

 setConfiguring(true);
 try {
 await sellerInventoryApi.configure({
 product_id: String(configureProduct.id),
 variant_id: null,
 quantity: opening,
 low_stock_threshold: low,
 warehouse_location: location.trim() || null,
 });
 toast.success("Stock configured successfully.");
 setConfigureProduct(null);
 await load();
 } catch (cause) {
 toast.error(
 cause instanceof Error
 ? cause.message
 : "Unable to configure stock.",
 );
 } finally {
 setConfiguring(false);
 }
 };

 return (
 <>
 <div className="mx-auto max-w-[1380px] space-y-5">
 <section className="relative overflow-hidden rounded-xl bg-foreground p-5 text-background shadow-sm sm:p-7">
 
 
 <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
 <div className="flex items-start gap-4">
 <span className="grid h-13 w-13 shrink-0 place-items-center rounded-xl bg-primary shadow-sm">
 <HugeiconsIcon icon={WarehouseIcon} size={20} />
 </span>
 <div>
 <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-primary-300">
 Seller stock control
 </p>
 <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">Inventory Workspace</h1>
 <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
 Control real physical stock, monitor reservations and protect your catalogue from overselling.
 </p>
 </div>
 </div>
 <div className="rounded-xl border border-white/10 bg-card/10 px-4 py-3 backdrop-blur">
 <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Availability rule</p>
 <p className="mt-1 text-sm font-bold text-white">Physical − Reserved = Available</p>
 </div>
 </div>
 </section>

 <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
 <Stat label="Stock units" value={summary?.total_stock_units ?? 0} icon={Package02Icon} tone="slate" />
 <Stat label="Reserved" value={summary?.reserved_units ?? 0} icon={WarehouseIcon} tone="amber" />
 <Stat label="Available" value={summary?.available_units ?? 0} icon={CheckmarkCircle02Icon} tone="green" />
 <Stat label="Low stock" value={summary?.low_stock_variants ?? 0} icon={Alert02Icon} tone="orange" />
 <Stat label="Out of stock" value={summary?.out_of_stock_variants ?? 0} icon={CancelCircleIcon} tone="red" />
 </section>

 <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
 <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card">
 <div className="flex items-center gap-3">
 <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-primary/10">
 <HugeiconsIcon icon={ChartColumnIcon} size={18} />
 </span>
 <div>
 <p className="font-bold">Stock health</p>
 <p className="text-xs text-muted-foreground">A quick view of units available to customers versus reserved stock.</p>
 </div>
 </div>
 <div className="mt-5 overflow-hidden rounded-full bg-muted dark:bg-card/10">
 <div className="flex h-4">
 <div
 className="bg-success"
 style={{ width: `${summary?.total_stock_units ? ((summary.available_units ?? 0) / summary.total_stock_units) * 100 : 0}%` }}
 title="Available"
 />
 <div
 className="bg-warning"
 style={{ width: `${summary?.total_stock_units ? ((summary.reserved_units ?? 0) / summary.total_stock_units) * 100 : 0}%` }}
 title="Reserved"
 />
 </div>
 </div>
 <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
 <div className="rounded-xl bg-green-light-6 p-3 dark:bg-success/10">
 <p className="font-semibold text-green-dark dark:text-emerald-300">Available to sell</p>
 <p className="mt-1 text-xl font-extrabold text-emerald-800 dark:text-emerald-200">{(summary?.available_units ?? 0).toLocaleString()}</p>
 </div>
 <div className="rounded-xl bg-yellow-light-4 p-3 dark:bg-warning/10">
 <p className="font-semibold text-yellow-dark-2 dark:text-amber-300">Reserved by orders</p>
 <p className="mt-1 text-xl font-extrabold text-yellow-dark-2 dark:text-amber-200">{(summary?.reserved_units ?? 0).toLocaleString()}</p>
 </div>
 </div>
 </div>

 <div className="rounded-xl border border-primary/25 bg-card p-5 shadow-sm dark:border-primary-500/20">
 <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-primary">Inventory attention</p>
 <p className="mt-2 text-3xl font-extrabold tracking-[-.04em]">{((summary?.low_stock_variants ?? 0) + (summary?.out_of_stock_variants ?? 0)).toLocaleString()}</p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">Variants need restocking attention now.</p>
 <div className="mt-4 flex gap-2">
 <span className="rounded-full bg-yellow-light-2 px-2.5 py-1 text-[10px] font-bold text-yellow-dark-2">{summary?.low_stock_variants ?? 0} low</span>
 <span className="rounded-full bg-red-light-5 px-2.5 py-1 text-[10px] font-bold text-red-dark">{summary?.out_of_stock_variants ?? 0} out</span>
 </div>
 </div>
 </section>

 <section className="rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card">
 <div className="flex flex-col gap-4 border-b border-border bg-muted/60 p-5 dark:border-border dark:bg-card/[0.025] lg:flex-row lg:items-center lg:justify-between">
 <div className="flex min-w-0 flex-1 gap-2">
 <div className="relative min-w-0 flex-1 lg:max-w-xl">
 <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter") {
 setPage(1);
 setQuery(search.trim());
 }
 }}
 placeholder="Search product, SKU or variant..."
 className="h-11 w-full rounded-xl border border-border bg-muted pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)] dark:border-border"
 />
 </div>
 <button
 type="button"
 onClick={() => {
 setPage(1);
 setQuery(search.trim());
 }}
 className="rounded-xl bg-foreground px-4 text-sm font-semibold text-background"
 >
 Search
 </button>
 </div>

 <select
 value={stockFilter}
 onChange={(e) => {
 setPage(1);
 setStockFilter(e.target.value as "all" | "low" | "out");
 }}
 className="h-11 rounded-xl border border-border bg-card px-3 text-sm dark:border-border"
 >
 <option value="all">All stock</option>
 <option value="low">Low stock</option>
 <option value="out">Out of stock</option>
 </select>
 </div>

 {loading ? (
 <div className="p-14 text-center text-muted-foreground">
 <Spinner className="mx-auto" />
 <p className="mt-3">Loading inventory...</p>
 </div>
 ) : error ? (
 <div className="p-12 text-center text-destructive">{error}</div>
 ) : rows.length === 0 ? (
 <div className="p-12 text-center">
 <p className="font-semibold">No inventory records found.</p>
 <p className="mt-1 text-sm text-muted-foreground">
 Configure stock for one of your products below.
 </p>
 <div className="mt-4 flex flex-wrap justify-center gap-2">
 {products.slice(0, 10).map((product) => (
 <button
 key={String(product.id)}
 onClick={() => {
 setConfigureProduct(product);
 setQuantity("0");
 setThreshold("5");
 setLocation("");
 }}
 className="inline-flex items-center gap-2 rounded-xl border border-yellow-light bg-yellow-light-4 px-3 py-2 text-xs font-semibold text-amber-900"
 >
 <HugeiconsIcon icon={PackageAddIcon} size={14} />
 Configure {product.name}
 </button>
 ))}
 </div>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[980px] text-left text-sm">
 <thead className="bg-muted text-xs uppercase text-muted-foreground">
 <tr>
 {["Product", "Physical", "Reserved", "Available", "Threshold", "Location", "Updated"].map((h) => (
 <th key={h} className="px-4 py-3">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border)] dark:divide-white/10">
 {rows.map((row) => (
 <tr key={row.inventory_id} className="transition hover:bg-primary/10/25 dark:hover:bg-card/[0.02]">
 <td className="px-4 py-4">
 <div className="flex items-center gap-3">
 <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
 row.available_quantity <= 0
 ? "bg-red-light-6 text-destructive"
 : row.available_quantity <= (row.low_stock_threshold ?? 0)
 ? "bg-yellow-light-4 text-yellow-dark"
 : "bg-green-light-6 text-green-dark"
 }`}>
 <HugeiconsIcon icon={Package02Icon} size={16} />
 </span>
 <div>
 <p className="font-bold text-foreground">{row.product_name}</p>
 <p className="mt-0.5 text-xs text-muted-foreground">{row.product_sku}</p>
 <span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
 row.available_quantity <= 0
 ? "bg-red-light-6 text-red-dark"
 : row.available_quantity <= (row.low_stock_threshold ?? 0)
 ? "bg-yellow-light-4 text-yellow-dark-2"
 : "bg-green-light-6 text-green-dark"
 }`}>
 {row.available_quantity <= 0
 ? "Out of stock"
 : row.available_quantity <= (row.low_stock_threshold ?? 0)
 ? "Low stock"
 : "Healthy"}
 </span>
 </div>
 </div>
 </td>
 <td className="px-4 py-4 font-bold">{row.quantity}</td>
 <td className="px-4 py-4 font-semibold text-yellow-dark-2">{row.reserved_quantity}</td>
 <td className="px-4 py-4">
 <p className="font-extrabold text-green-dark">{row.available_quantity}</p>
 <div className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-muted">
 <div
 className={`h-full rounded-full ${row.available_quantity <= 0 ? "bg-destructive" : row.available_quantity <= (row.low_stock_threshold ?? 0) ? "bg-warning" : "bg-success"}`}
 style={{ width: `${Math.min(100, row.quantity ? (row.available_quantity / row.quantity) * 100 : 0)}%` }}
 />
 </div>
 </td>
 <td className="px-4 py-4 font-semibold">{row.low_stock_threshold}</td>
 <td className="px-4 py-4">
 <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
 <HugeiconsIcon icon={Location01Icon} size={14} className="text-primary" />
 {row.warehouse_location || "Not set"}
 </span>
 </td>
 <td className="px-4 py-4 text-xs text-muted-foreground">
 {row.updated_at ? new Date(row.updated_at).toLocaleString() : "—"}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {totalPages > 1 && (
 <div className="flex items-center justify-end gap-3 border-t p-4">
 <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">
 Previous
 </button>
 <span className="text-xs text-muted-foreground">
 Page {page} of {totalPages} · {total} records
 </span>
 <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">
 Next
 </button>
 </div>
 )}
 </section>
 </div>

 {configureProduct && (
 <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
 <div className="w-full max-w-xl overflow-hidden rounded-xl bg-card shadow-lg dark:bg-card">
 <div className="relative overflow-hidden bg-foreground p-6 text-background">
 
 <div className="relative flex items-start gap-3">
 <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary">
 <HugeiconsIcon icon={PackageAddIcon} size={18} />
 </span>
 <div>
 <p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary-300">Stock configuration</p>
 <h2 className="mt-1 text-xl font-extrabold">Configure Opening Stock</h2>
 <p className="mt-1 text-xs text-muted-foreground">
 {configureProduct.name} · {configureProduct.sku}
 </p>
 </div>
 </div>
 </div>
 <div className="p-6">

 <div className="mt-5 grid gap-4 sm:grid-cols-2">
 <label className="text-sm font-semibold">
 Physical quantity
 <input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border bg-muted px-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-ring/30 dark:border-border dark:focus:ring-ring/30" />
 </label>
 <label className="text-sm font-semibold">
 Low-stock threshold
 <input type="number" min="0" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border bg-muted px-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-ring/30 dark:border-border dark:focus:ring-ring/30" />
 </label>
 <label className="text-sm font-semibold sm:col-span-2">
 Warehouse / stock location
 <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Main Store - Rack A" className="mt-2 h-11 w-full rounded-xl border border-border bg-muted px-3 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-ring/30 dark:border-border dark:focus:ring-ring/30" />
 </label>
 </div>

 <div className="mt-5 rounded-xl border border-border bg-muted p-4 text-sm dark:border-border">
 <div className="flex justify-between"><span>Quantity</span><b>{Number(quantity) || 0}</b></div>
 <div className="mt-2 flex justify-between"><span>Reserved</span><b>0</b></div>
 <div className="mt-2 flex justify-between text-green-dark"><span>Available</span><b>{Number(quantity) || 0}</b></div>
 </div>

 <div className="mt-6 flex justify-end gap-3">
 <button disabled={configuring} onClick={() => setConfigureProduct(null)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground transition hover:bg-muted">
 Cancel
 </button>
 <button disabled={configuring} onClick={() => void configure()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary disabled:opacity-50">
 <HugeiconsIcon icon={PackageAddIcon} size={16} />
 {configuring ? "Saving..." : "Save Stock"}
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </>
 );
}

function Stat({
 label,
 value,
 icon: Icon,
 tone,
}: {
 label: string;
 value: number;
 icon: IconSvgElement;
 tone: "slate" | "amber" | "green" | "orange" | "red";
}) {
 const tones = {
 slate: "bg-muted text-accent-foreground border-border",
 amber: "bg-yellow-light-4 text-yellow-dark-2 border-yellow-light-2",
 green: "bg-green-light-6 text-green-dark border-green-light-4",
 orange: "bg-primary/10 text-primary border-primary/25",
 red: "bg-red-light-6 text-red-dark border-red-light-4",
 };

 return (
 <div className="group rounded-xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-border dark:bg-card">
 <div className="flex items-start justify-between gap-3">
 <span className={`grid h-10 w-10 place-items-center rounded-xl border ${tones[tone]}`}>
 <HugeiconsIcon icon={Icon} size={16} />
 </span>
 <span className="text-2xl font-extrabold tracking-[-.04em]">{value.toLocaleString()}</span>
 </div>
 <p className="mt-3 text-xs font-bold text-muted-foreground">{label}</p>
 <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted dark:bg-card/10">
 <div className={`h-full w-2/3 rounded-full ${tone === "green" ? "bg-success" : tone === "red" ? "bg-destructive" : tone === "amber" ? "bg-warning" : "bg-primary"}`} />
 </div>
 </div>
 );
}
