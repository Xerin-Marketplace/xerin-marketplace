"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartColumnIcon, CheckmarkCircle02Icon, ArrowLeft01Icon, ArrowRight01Icon, DollarCircleIcon, ViewIcon, PackageIcon, RefreshCwIcon, Search01Icon, ShoppingBag01Icon, Store01Icon, TruckIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import {
 adminService,
 type AdminSellerOrder,
 type AdminSellerPerformance,
 type AdminSellerProduct,
} from "@/lib/api/endpoints/admin";

type View = "products" | "orders" | "performance";
type RecordRow =
 | AdminSellerProduct
 | AdminSellerOrder
 | AdminSellerPerformance;

const config = {
 products: {
 eyebrow: "Seller catalog",
 title: "Seller Products",
 description:
 "Inspect product ownership and listing status across sellers. Product approval remains handled through the dedicated Catalog review workflow.",
 steps: [
 "Seller creates listing",
 "Listing submitted",
 "Catalog review",
 "Published or returned",
 ],
 },
 orders: {
 eyebrow: "Seller fulfillment",
 title: "Seller Orders",
 description:
 "Follow seller order lines from allocation through packing, shipment and final delivery.",
 steps: [
 "Order allocated",
 "Seller confirms",
 "Pack & dispatch",
 "Delivery completed",
 ],
 },
 performance: {
 eyebrow: "Seller intelligence",
 title: "Seller Performance",
 description:
 "Compare seller activity, fulfillment quality, revenue and marketplace readiness using operational signals.",
 steps: [
 "Collect activity",
 "Calculate KPIs",
 "Identify exceptions",
 "Support or enforce",
 ],
 },
} as const;

const isProduct = (row: RecordRow): row is AdminSellerProduct => "sku" in row;
const isOrder = (row: RecordRow): row is AdminSellerOrder =>
 "order_number" in row;
const isPerformance = (
 row: RecordRow,
): row is AdminSellerPerformance => "fulfillment_rate" in row;

const pretty = (value: string) =>
 value
 .replaceAll("_", " ")
 .replace(/\b\w/g, (letter) => letter.toUpperCase());

const statusStyle = (status: string) => {
 const value = status.toLowerCase();
 if (["approved", "delivered", "completed"].includes(value)) {
 return "border-green-light-4 bg-green-light-6 text-green-dark";
 }
 if (["rejected", "cancelled", "refunded", "suspended"].includes(value)) {
 return "border-red-light-4 bg-red-light-6 text-red-dark";
 }
 if (["processing", "shipped", "under_review"].includes(value)) {
 return "border-primary-200 bg-primary-50 text-primary-700";
 }
 return "border-yellow-light-2 bg-yellow-light-4 text-yellow-dark-2";
};

export default function SellerSubWorkspace({ view }: { view: View }) {
 const copy = config[view];
 const [rows, setRows] = useState<RecordRow[]>([]);
 const [loading, setLoading] = useState(true);
 const [query, setQuery] = useState("");
 const [status, setStatus] = useState("all");
 const [selected, setSelected] = useState<RecordRow | null>(null);
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(10);

 const load = async () => {
 setLoading(true);

 try {
 const data =
 view === "products"
 ? await adminService.listSellerProducts()
 : view === "orders"
 ? await adminService.listSellerOrders()
 : await adminService.listSellerPerformance();

 setRows(data);
 } catch {
 toast.error(`Unable to load ${copy.title.toLowerCase()}.`);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 setQuery("");
 setStatus("all");
 setPage(1);
 void load();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [view]);

 const filtered = useMemo(
 () =>
 rows.filter((row) => {
 const rowStatus = row.status;
 const matchesStatus = status === "all" || rowStatus === status;

 const searchable = isProduct(row)
 ? `${row.seller_name} ${row.name} ${row.sku}`
 : isOrder(row)
 ? `${row.seller_name} ${row.order_number} ${row.product_name}`
 : `${row.seller_name} ${row.status}`;

 return (
 matchesStatus &&
 searchable.toLowerCase().includes(query.trim().toLowerCase())
 );
 }),
 [query, rows, status],
 );

 useEffect(() => {
 setPage(1);
 }, [query, status]);

 const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
 const safePage = Math.min(page, totalPages);
 const start = (safePage - 1) * pageSize;
 const visible = filtered.slice(start, start + pageSize);

 const metrics = useMemo(() => {
 if (view === "products") {
 const products = rows as AdminSellerProduct[];
 return [
 {
 label: "Product listings",
 value: products.length.toLocaleString(),
 detail: "Seller-owned listings",
 icon: PackageIcon,
 },
 {
 label: "Approved",
 value: products
 .filter((row) => row.status === "approved")
 .length.toLocaleString(),
 detail: "Marketplace ready",
 icon: CheckmarkCircle02Icon,
 },
 {
 label: "Pending moderation",
 value: products
 .filter((row) => row.status === "pending_review")
 .length.toLocaleString(),
 detail: "Waiting for catalog review",
 icon: ViewIcon,
 },
 {
 label: "Inactive",
 value: products
 .filter((row) => !row.is_active)
 .length.toLocaleString(),
 detail: "Not currently visible",
 icon: Store01Icon,
 },
 ];
 }

 if (view === "orders") {
 const orders = rows as AdminSellerOrder[];
 return [
 {
 label: "Order lines",
 value: orders.length.toLocaleString(),
 detail: "Seller fulfillment records",
 icon: ShoppingBag01Icon,
 },
 {
 label: "Processing",
 value: orders
 .filter((row) => row.status === "processing")
 .length.toLocaleString(),
 detail: "Being prepared",
 icon: RefreshCwIcon,
 },
 {
 label: "Shipped",
 value: orders
 .filter((row) => row.status === "shipped")
 .length.toLocaleString(),
 detail: "With logistics",
 icon: TruckIcon,
 },
 {
 label: "Delivered",
 value: orders
 .filter((row) => row.status === "delivered")
 .length.toLocaleString(),
 detail: "Fulfillment complete",
 icon: CheckmarkCircle02Icon,
 },
 ];
 }

 const performance = rows as AdminSellerPerformance[];
 const revenue = performance.reduce((total, row) => total + row.revenue, 0);
 const fulfillment = performance.length
 ? performance.reduce(
 (total, row) => total + row.fulfillment_rate,
 0,
 ) / performance.length
 : 0;

 return [
 {
 label: "Sellers measured",
 value: performance.length.toLocaleString(),
 detail: "Included in KPI view",
 icon: Store01Icon,
 },
 {
 label: "Delivered orders",
 value: performance
 .reduce((total, row) => total + row.delivered_orders, 0)
 .toLocaleString(),
 detail: "Successful fulfillment",
 icon: CheckmarkCircle02Icon,
 },
 {
 label: "Revenue",
 value: `TZS ${revenue.toLocaleString()}`,
 detail: "Seller revenue captured",
 icon: DollarCircleIcon,
 },
 {
 label: "Avg. fulfillment",
 value: `${fulfillment.toFixed(1)}%`,
 detail: "Across measured sellers",
 icon: ChartColumnIcon,
 },
 ];
 }, [rows, view]);

 const statusOptions =
 view === "products"
 ? ["approved", "pending_review", "rejected", "draft", "inactive"]
 : view === "orders"
 ? [
 "pending",
 "paid",
 "processing",
 "shipped",
 "delivered",
 "cancelled",
 "refunded",
 ]
 : ["approved", "under_review", "rejected", "suspended"];

 return (
 <div className="space-y-5">
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
 {copy.eyebrow}
 </p>
 <h2 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-foreground">
 {copy.title}
 </h2>
 <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
 {copy.description}
 </p>
 </div>

 <button
 type="button"
 onClick={() => void load()}
 className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground transition hover:border-primary/25 hover:bg-primary/10 hover:text-primary"
 >
 <HugeiconsIcon icon={RefreshCwIcon} size={16} />
 Refresh data
 </button>
 </div>
 </section>

 <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
 {metrics.map(({ label, value, detail, icon: Icon }) => (
 <article
 key={label}
 className="rounded-xl border border-border bg-card p-5 shadow-sm"
 >
 <div className="flex items-center justify-between">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <HugeiconsIcon icon={Icon} size={16} />
 </span>
 </div>
 <p className="mt-4 text-2xl font-bold tracking-[-0.02em] text-foreground">
 {value}
 </p>
 <p className="mt-1 text-sm font-semibold text-muted-foreground">{label}</p>
 <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
 </article>
 ))}
 </section>

 <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="font-bold text-foreground">Operational flow</h3>
 <p className="mt-1 text-xs text-muted-foreground">
 How this seller activity moves through the marketplace.
 </p>
 </div>
 </div>

 <div className="mt-4 grid gap-3 md:grid-cols-4">
 {copy.steps.map((step, index) => (
 <div
 key={step}
 className="relative rounded-xl border border-border bg-muted p-4"
 >
 <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-xs font-bold text-primary shadow-sm ring-1 ring-primary/20">
 {index + 1}
 </span>
 <p className="mt-3 text-sm font-semibold text-accent-foreground">{step}</p>
 </div>
 ))}
 </div>
 </section>

 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
 <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-end lg:justify-between">
 <div>
 <h3 className="font-bold text-foreground">{copy.title} records</h3>
 <p className="mt-1 text-sm text-muted-foreground">
 {filtered.length} matching record
 {filtered.length === 1 ? "" : "s"}
 </p>
 </div>

 <div className="flex flex-col gap-2 sm:flex-row">
 <label className="relative min-w-0 sm:w-[310px]">
 <HugeiconsIcon icon={Search01Icon}
 size={16}
 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
 />
 <input
 value={query}
 onChange={(event) => setQuery(event.target.value)}
 placeholder="Search seller or reference..."
 className="h-11 w-full rounded-xl border border-border bg-muted pl-10 pr-4 text-sm outline-none transition focus:border-primary/40 focus:bg-card focus:ring-4 focus:ring-ring/30"
 />
 </label>

 <select
 value={status}
 onChange={(event) => setStatus(event.target.value)}
 className="h-11 rounded-xl border border-border bg-card px-4 text-sm font-medium text-muted-foreground outline-none"
 >
 <option value="all">All statuses</option>
 {statusOptions.map((option) => (
 <option key={option} value={option}>
 {pretty(option)}
 </option>
 ))}
 </select>
 </div>
 </div>

 {loading ? (
 <div className="p-14 text-center text-sm text-muted-foreground">
 Loading {copy.title.toLowerCase()}...
 </div>
 ) : !visible.length ? (
 <div className="p-14 text-center">
 <HugeiconsIcon icon={Store01Icon} className="mx-auto text-muted-foreground" size={32} />
 <p className="mt-3 font-semibold text-foreground">
 No matching records
 </p>
 <p className="mt-1 text-sm text-muted-foreground">
 Adjust the search or status filter.
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[940px] text-left text-sm">
 <thead className="bg-muted/80 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
 <tr>
 {(view === "products"
 ? ["Seller", "Product", "SKU", "Price", "Status", "Action"]
 : view === "orders"
 ? [
 "Order",
 "Seller",
 "Product",
 "Quantity",
 "Amount",
 "Status",
 "Action",
 ]
 : [
 "Seller",
 "Products",
 "Orders",
 "Delivered",
 "Revenue",
 "Fulfillment",
 "Action",
 ]
 ).map((header) => (
 <th key={header} className="px-5 py-3.5">
 {header}
 </th>
 ))}
 </tr>
 </thead>

 <tbody className="divide-y divide-border">
 {visible.map((row) =>
 isProduct(row) ? (
 <tr
 key={row.id}
 className="transition hover:bg-primary/10/30"
 >
 <td className="px-5 py-4">
 <div className="flex items-center gap-3">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
 {row.seller_name?.charAt(0)?.toUpperCase() || "S"}
 </span>
 <span className="font-semibold text-foreground">
 {row.seller_name}
 </span>
 </div>
 </td>
 <td className="px-5 py-4 font-medium text-accent-foreground">
 {row.name}
 </td>
 <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
 {row.sku}
 </td>
 <td className="px-5 py-4 font-semibold text-foreground">
 {row.price.toLocaleString()} {row.currency}
 </td>
 <td className="px-5 py-4">
 <Status status={row.status} />
 </td>
 <td className="px-5 py-4">
 <button
 onClick={() => setSelected(row)}
 className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-primary/25 hover:text-primary"
 >
 <HugeiconsIcon icon={ViewIcon} size={14} />
 Inspect
 </button>
 </td>
 </tr>
 ) : isOrder(row) ? (
 <tr
 key={row.id}
 className="transition hover:bg-primary/10/30"
 >
 <td className="px-5 py-4 font-bold text-foreground">
 #{row.order_number}
 </td>
 <td className="px-5 py-4 font-medium text-accent-foreground">
 {row.seller_name}
 </td>
 <td className="px-5 py-4 text-muted-foreground">
 {row.product_name}
 </td>
 <td className="px-5 py-4 text-muted-foreground">
 {row.quantity}
 </td>
 <td className="px-5 py-4 font-semibold text-foreground">
 {row.amount.toLocaleString()} {row.currency}
 </td>
 <td className="px-5 py-4">
 <Status status={row.status} />
 </td>
 <td className="px-5 py-4">
 <Link
 href={`/admin/orders/${row.order_id}`}
 className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background"
 >
 <HugeiconsIcon icon={ViewIcon} size={14} />
 Open order
 </Link>
 </td>
 </tr>
 ) : (
 <tr
 key={row.seller_id}
 className="transition hover:bg-primary/10/30"
 >
 <td className="px-5 py-4">
 <div className="flex items-center gap-3">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
 {row.seller_name?.charAt(0)?.toUpperCase() || "S"}
 </span>
 <div>
 <p className="font-semibold text-foreground">
 {row.seller_name}
 </p>
 <Status status={row.status} />
 </div>
 </div>
 </td>
 <td className="px-5 py-4 text-muted-foreground">
 {row.approved_products}/{row.products} approved
 </td>
 <td className="px-5 py-4 text-muted-foreground">{row.orders}</td>
 <td className="px-5 py-4 text-muted-foreground">
 {row.delivered_orders}
 </td>
 <td className="px-5 py-4 font-semibold text-foreground">
 {row.revenue.toLocaleString()} {row.currency}
 </td>
 <td className="px-5 py-4">
 <div className="min-w-[110px]">
 <div className="flex items-center justify-between text-xs">
 <span className="font-semibold text-accent-foreground">
 {row.fulfillment_rate.toFixed(1)}%
 </span>
 </div>
 <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
 <div
 className="h-full rounded-full bg-primary"
 style={{
 width: `${Math.max(
 0,
 Math.min(100, row.fulfillment_rate),
 )}%`,
 }}
 />
 </div>
 </div>
 </td>
 <td className="px-5 py-4">
 <button
 onClick={() => setSelected(row)}
 className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-primary/25 hover:text-primary"
 >
 <HugeiconsIcon icon={ViewIcon} size={14} />
 Inspect
 </button>
 </td>
 </tr>
 ),
 )}
 </tbody>
 </table>
 </div>
 )}

 {!loading && filtered.length > 0 && (
 <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
 <p className="text-sm text-muted-foreground">
 Showing{" "}
 <b className="text-foreground">
 {start + 1}-{Math.min(start + pageSize, filtered.length)}
 </b>{" "}
 of <b className="text-foreground">{filtered.length}</b>
 </p>

 <div className="flex flex-wrap items-center gap-2">
 <select
 value={pageSize}
 onChange={(event) => {
 setPageSize(Number(event.target.value));
 setPage(1);
 }}
 className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground"
 >
 {[10, 20, 50].map((size) => (
 <option key={size} value={size}>
 {size} / page
 </option>
 ))}
 </select>

 <button
 disabled={safePage <= 1}
 onClick={() => setPage((current) => Math.max(1, current - 1))}
 className="inline-flex h-10 items-center gap-1 rounded-xl border border-border px-3 text-sm font-semibold text-muted-foreground disabled:opacity-40"
 >
 <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
 Previous
 </button>

 <span className="min-w-24 text-center text-xs font-semibold text-muted-foreground">
 Page {safePage} of {totalPages}
 </span>

 <button
 disabled={safePage >= totalPages}
 onClick={() =>
 setPage((current) => Math.min(totalPages, current + 1))
 }
 className="inline-flex h-10 items-center gap-1 rounded-xl border border-border px-3 text-sm font-semibold text-muted-foreground disabled:opacity-40"
 >
 Next
 <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
 </button>
 </div>
 </div>
 )}
 </section>

 {selected && (
 <div
 className="fixed inset-0 z-[99999] flex justify-end bg-black/45 backdrop-blur-[1px]"
 onMouseDown={() => setSelected(null)}
 >
 <aside
 className="flex h-full w-full max-w-xl flex-col bg-muted shadow-lg"
 onMouseDown={(event) => event.stopPropagation()}
 >
 <div className="flex items-start justify-between border-b bg-card px-6 py-5">
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
 Seller record
 </p>
 <h3 className="mt-1 text-xl font-bold text-foreground">
 {isProduct(selected)
 ? selected.name
 : isPerformance(selected)
 ? selected.seller_name
 : selected.seller_name}
 </h3>
 </div>
 <button
 onClick={() => setSelected(null)}
 className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={16} />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto p-6">
 <dl className="grid gap-3 sm:grid-cols-2">
 {Object.entries(selected)
 .filter(([key]) => !["id", "seller_id"].includes(key))
 .slice(0, 14)
 .map(([key, value]) => (
 <div
 key={key}
 className="rounded-xl border border-border bg-card p-4"
 >
 <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
 {pretty(key)}
 </dt>
 <dd className="mt-1 break-words text-sm font-semibold text-foreground">
 {typeof value === "boolean"
 ? value
 ? "Yes"
 : "No"
 : String(value ?? "—")}
 </dd>
 </div>
 ))}
 </dl>

 {isOrder(selected) && (
 <Link
 href={`/admin/orders/${selected.order_id}`}
 className="mt-5 block rounded-xl bg-foreground px-4 py-3 text-center text-sm font-semibold text-background"
 >
 Open Full Order
 </Link>
 )}
 </div>
 </aside>
 </div>
 )}
 </div>
 );
}

function Status({ status }: { status: string }) {
 return (
 <span
 className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle(
 status,
 )}`}
 >
 {pretty(status)}
 </span>
 );
}
