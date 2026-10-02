"use client";


import { Spinner } from "@/components/ui/Spinner";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { Calendar01Icon, ArrowLeft01Icon, ArrowRight01Icon, DollarCircleIcon, ViewIcon, PackageCheckIcon, RefreshCwIcon, Search01Icon, ShoppingBag01Icon, TruckIcon, UserIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { ordersApi } from "@/lib/api/endpoints/commerce";
import type { Order } from "@/types/api/commerce";
import { formatCurrency } from "@/lib/formatCurrency";

const STATUS_OPTIONS = [
 "all",
 "pending",
 "awaiting_payment",
 "paid",
 "processing",
 "shipped",
 "delivered",
 "cancelled",
 "refunded",
];

const PAYMENT_OPTIONS = [
 "all",
 "pending",
 "authorized",
 "paid",
 "failed",
 "refunded",
];

const pretty = (value?: string | null) =>
 (value || "unknown")
 .replaceAll("_", " ")
 .replace(/\b\w/g, (letter) => letter.toUpperCase());

const orderRef = (order: Order) =>
 order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`;

const customerName = (order: Order) => {
 const full = [
 order.user?.first_name,
 order.user?.last_name,
 ]
 .filter(Boolean)
 .join(" ")
 .trim();

 return full || order.user?.email || order.user_id.slice(0, 8).toUpperCase();
};

const statusClass = (status: string) => {
 const value = status.toLowerCase();
 if (["delivered", "completed", "paid"].includes(value)) {
 return "bg-green-light-6 text-green-dark border-green-light-4";
 }
 if (["cancelled", "rejected", "failed", "refunded"].includes(value)) {
 return "bg-red-light-6 text-red-dark border-red-light-4";
 }
 if (["processing", "packed", "shipped", "out_for_delivery"].includes(value)) {
 return "bg-primary-50 text-primary-700 border-primary-200";
 }
 return "bg-yellow-light-4 text-yellow-dark-2 border-yellow-light-2";
};

export default function OrderList({
 status,
 title = "All Orders",
 subtitle = "View every order generated on Xerin Mart and manage its fulfilment lifecycle.",
}: {
 view?: string;
 status?: string;
 title?: string;
 subtitle?: string;
}) {
 const [rows, setRows] = useState<Order[]>([]);
 const [total, setTotal] = useState(0);
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(20);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [query, setQuery] = useState("");
 const [debouncedQuery, setDebouncedQuery] = useState("");
 const [statusFilter, setStatusFilter] = useState(status || "all");
 const [paymentFilter, setPaymentFilter] = useState("all");
 const [dateFrom, setDateFrom] = useState("");
 const [dateTo, setDateTo] = useState("");
 const [selected, setSelected] = useState<Order | null>(null);
 const [busy, setBusy] = useState(false);

 useEffect(() => {
 setStatusFilter(status || "all");
 setPage(1);
 }, [status]);

 useEffect(() => {
 const timer = window.setTimeout(() => {
 setDebouncedQuery(query.trim());
 setPage(1);
 }, 350);

 return () => window.clearTimeout(timer);
 }, [query]);

 const load = async () => {
 setLoading(true);
 setError("");

 try {
 const data = await ordersApi.adminList({
 page,
 page_size: pageSize,
 status: statusFilter === "all" ? undefined : statusFilter,
 search: debouncedQuery || undefined,
 payment_status:
 paymentFilter === "all" ? undefined : paymentFilter,
 date_from: dateFrom || undefined,
 date_to: dateTo || undefined,
 });

 setRows(data.results);
 setTotal(data.total);
 } catch (cause) {
 setRows([]);
 setTotal(0);
 setError(
 cause instanceof Error ? cause.message : "Unable to load orders.",
 );
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void load();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [
 page,
 pageSize,
 statusFilter,
 paymentFilter,
 debouncedQuery,
 dateFrom,
 dateTo,
 ]);

 const visibleRows = useMemo(() => {
 // This fallback keeps search useful even if the current backend build
 // does not yet consume the optional search query parameter.
 if (!debouncedQuery) return rows;

 const q = debouncedQuery.toLowerCase();

 return rows.filter((order) =>
 [
 order.id,
 order.order_number,
 order.user_id,
 order.user?.first_name,
 order.user?.last_name,
 order.user?.email,
 order.user?.phone,
 order.status,
 order.payment_status,
 order.tracking_number,
 ...order.items.map((item) => item.product_name),
 ]
 .filter(Boolean)
 .join(" ")
 .toLowerCase()
 .includes(q),
 );
 }, [debouncedQuery, rows]);

 const pageStats = useMemo(() => {
 const revenue = rows.reduce(
 (sum, order) => sum + Number(order.total || 0),
 0,
 );

 return {
 orders: rows.length,
 processing: rows.filter((order) =>
 ["processing", "shipped"].includes(order.status),
 ).length,
 delivered: rows.filter((order) =>
 ["delivered", "completed"].includes(order.status),
 ).length,
 revenue,
 };
 }, [rows]);

 const updateStatus = async (order: Order, nextStatus: string) => {
 if (!nextStatus || nextStatus === order.status) return;

 setBusy(true);
 try {
 await ordersApi.updateStatus(order.id, {
 status: nextStatus,
 notes: `Status changed by admin to ${nextStatus}`,
 });
 toast.success("Order status updated.");
 setSelected(null);
 await load();
 } catch (cause) {
 toast.error(
 cause instanceof Error ? cause.message : "Status update failed.",
 );
 } finally {
 setBusy(false);
 }
 };

 const totalPages = Math.max(1, Math.ceil(total / pageSize));
 const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
 const to = Math.min(page * pageSize, total);

 return (
 <div className="space-y-5">
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
 Order management
 </p>
 <h2 className="mt-1 text-2xl font-bold text-foreground">{title}</h2>
 <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
 {subtitle}
 </p>
 </div>

 <button
 type="button"
 onClick={() => void load()}
 className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground"
 >
 <HugeiconsIcon icon={RefreshCwIcon} size={16} />
 Refresh
 </button>
 </div>
 </section>

 <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <Metric
 icon={ShoppingBag01Icon}
 label="Orders on this page"
 value={String(pageStats.orders)}
 detail={`${total} total system orders`}
 />
 <Metric
 icon={TruckIcon}
 label="In fulfilment"
 value={String(pageStats.processing)}
 detail="Processing or shipped"
 />
 <Metric
 icon={PackageCheckIcon}
 label="Delivered"
 value={String(pageStats.delivered)}
 detail="Completed on this page"
 />
 <Metric
 icon={DollarCircleIcon}
 label="Page order value"
 value={formatCurrency(
 pageStats.revenue,
 rows[0]?.currency || "TZS",
 )}
 detail="Value of loaded orders"
 />
 </section>

 <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.7fr)_repeat(4,minmax(140px,1fr))]">
 <div className="relative">
 <HugeiconsIcon icon={Search01Icon}
 size={16}
 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
 />
 <input
 value={query}
 onChange={(event) => setQuery(event.target.value)}
 placeholder="Search order, customer, product or tracking..."
 className="h-11 w-full rounded-xl border-2 border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)]"
 />
 </div>

 <select
 value={statusFilter}
 onChange={(event) => {
 setStatusFilter(event.target.value);
 setPage(1);
 }}
 className="h-11 rounded-xl border-2 border-border bg-card px-3 text-sm outline-none"
 >
 {STATUS_OPTIONS.map((option) => (
 <option key={option} value={option}>
 {option === "all" ? "All statuses" : pretty(option)}
 </option>
 ))}
 </select>

 <select
 value={paymentFilter}
 onChange={(event) => {
 setPaymentFilter(event.target.value);
 setPage(1);
 }}
 className="h-11 rounded-xl border-2 border-border bg-card px-3 text-sm outline-none"
 >
 {PAYMENT_OPTIONS.map((option) => (
 <option key={option} value={option}>
 {option === "all" ? "All payments" : pretty(option)}
 </option>
 ))}
 </select>

 <input
 type="date"
 value={dateFrom}
 onChange={(event) => {
 setDateFrom(event.target.value);
 setPage(1);
 }}
 className="h-11 rounded-xl border-2 border-border bg-card px-3 text-sm outline-none"
 title="Date from"
 />

 <input
 type="date"
 value={dateTo}
 onChange={(event) => {
 setDateTo(event.target.value);
 setPage(1);
 }}
 className="h-11 rounded-xl border-2 border-border bg-card px-3 text-sm outline-none"
 title="Date to"
 />
 </div>
 </section>

 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
 {loading ? (
 <div className="p-12 text-center text-muted-foreground">
 <Spinner className="mx-auto" />
 <p className="mt-3 text-sm">Loading system orders...</p>
 </div>
 ) : error ? (
 <div className="p-12 text-center">
 <p className="font-semibold text-destructive">{error}</p>
 <button
 onClick={() => void load()}
 className="mt-3 text-sm font-semibold text-primary"
 >
 Retry
 </button>
 </div>
 ) : !visibleRows.length ? (
 <div className="p-12 text-center">
 <HugeiconsIcon icon={ShoppingBag01Icon} className="mx-auto text-muted-foreground" size={32} />
 <p className="mt-3 font-semibold text-foreground">
 No matching orders found
 </p>
 <p className="mt-1 text-sm text-muted-foreground">
 Adjust the filters or wait for new customer orders.
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[1100px] text-left text-sm">
 <thead className="bg-muted text-xs uppercase text-muted-foreground">
 <tr>
 {[
 "Order",
 "Customer",
 "Items",
 "Total",
 "Payment",
 "Status",
 "Created",
 "Actions",
 ].map((heading) => (
 <th key={heading} className="px-5 py-3">
 {heading}
 </th>
 ))}
 </tr>
 </thead>

 <tbody className="divide-y divide-[var(--border)]">
 {visibleRows.map((order) => (
 <tr key={order.id} className="hover:bg-primary/10/20">
 <td className="px-5 py-4">
 <p className="font-bold text-foreground">
 {orderRef(order)}
 </p>
 <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
 {order.id}
 </p>
 </td>

 <td className="px-5 py-4">
 <div className="flex items-center gap-2.5">
 <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
 <HugeiconsIcon icon={UserIcon} size={14} />
 </span>
 <div>
 <p className="font-semibold text-foreground">
 {customerName(order)}
 </p>
 {order.user?.email && (
 <p className="text-xs text-muted-foreground">
 {order.user.email}
 </p>
 )}
 </div>
 </div>
 </td>

 <td className="px-5 py-4">
 <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-accent-foreground">
 {order.items.length} item
 {order.items.length === 1 ? "" : "s"}
 </span>
 </td>

 <td className="px-5 py-4 font-bold text-foreground">
 {formatCurrency(order.total, order.currency)}
 </td>

 <td className="px-5 py-4">
 <span className="text-xs font-semibold capitalize text-muted-foreground">
 {pretty(order.payment_status || "unknown")}
 </span>
 </td>

 <td className="px-5 py-4">
 <span
 className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
 order.status,
 )}`}
 >
 {pretty(order.status)}
 </span>
 </td>

 <td className="px-5 py-4 text-xs text-muted-foreground">
 <div className="flex items-center gap-1.5">
 <HugeiconsIcon icon={Calendar01Icon} size={14} />
 {order.created_at
 ? new Date(order.created_at).toLocaleString()
 : "—"}
 </div>
 </td>

 <td className="px-5 py-4">
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setSelected(order)}
 className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground"
 >
 <HugeiconsIcon icon={ViewIcon} size={14} />
 Quick View
 </button>
 <Link
 href={`/admin/orders/${order.id}`}
 className="rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background"
 >
 Details
 </Link>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {!loading && !error && (
 <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
 <p className="text-sm text-muted-foreground">
 Showing{" "}
 <b className="text-foreground">
 {from}-{to}
 </b>{" "}
 of <b className="text-foreground">{total}</b> orders
 </p>

 <div className="flex flex-wrap items-center gap-2">
 <select
 value={pageSize}
 onChange={(event) => {
 setPageSize(Number(event.target.value));
 setPage(1);
 }}
 className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
 >
 {[10, 20, 50, 100].map((size) => (
 <option key={size} value={size}>
 {size} / page
 </option>
 ))}
 </select>

 <button
 type="button"
 disabled={page <= 1 || loading}
 onClick={() => setPage((value) => value - 1)}
 className="inline-flex h-10 items-center gap-1 rounded-xl border px-3 text-sm font-semibold disabled:opacity-40"
 >
 <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
 Previous
 </button>

 <span className="min-w-24 text-center text-xs font-semibold text-muted-foreground">
 Page {page} of {totalPages}
 </span>

 <button
 type="button"
 disabled={page >= totalPages || loading}
 onClick={() => setPage((value) => value + 1)}
 className="inline-flex h-10 items-center gap-1 rounded-xl border px-3 text-sm font-semibold disabled:opacity-40"
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
 className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-[2px]"
 onMouseDown={() => !busy && setSelected(null)}
 >
 <aside
 className="flex h-full w-full max-w-2xl flex-col bg-muted shadow-lg"
 onMouseDown={(event) => event.stopPropagation()}
 >
 <div className="flex items-start justify-between border-b bg-card px-6 py-5">
 <div>
 <p className="text-xs font-bold uppercase tracking-[.14em] text-primary">
 Order quick view
 </p>
 <h3 className="mt-1 text-xl font-bold text-foreground">
 {orderRef(selected)}
 </h3>
 </div>
 <button
 type="button"
 onClick={() => setSelected(null)}
 className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={16} />
 </button>
 </div>

 <div className="flex-1 space-y-5 overflow-y-auto p-6">
 <section className="grid gap-3 sm:grid-cols-2">
 <Info label="Customer" value={customerName(selected)} />
 <Info
 label="Payment status"
 value={pretty(selected.payment_status)}
 />
 <Info
 label="Order total"
 value={formatCurrency(selected.total, selected.currency)}
 />
 <Info label="Delivery method" value={selected.delivery_method || "—"} />
 <Info label="Courier" value={selected.courier_name || "—"} />
 <Info
 label="Tracking number"
 value={selected.tracking_number || "—"}
 />
 </section>

 <section className="overflow-hidden rounded-xl border bg-card">
 <div className="border-b px-5 py-4">
 <h4 className="font-bold text-foreground">Order items</h4>
 </div>
 <div className="divide-y">
 {selected.items.map((item) => (
 <div
 key={item.id}
 className="flex items-center justify-between gap-4 px-5 py-4"
 >
 <div>
 <p className="font-semibold text-foreground">
 {item.product_name}
 </p>
 <p className="text-xs text-muted-foreground">
 Qty {item.quantity}
 {item.variant_name ? ` · ${item.variant_name}` : ""}
 </p>
 </div>
 <p className="font-semibold">
 {formatCurrency(item.total_price, selected.currency)}
 </p>
 </div>
 ))}
 </div>
 </section>

 {selected.notes && (
 <section className="rounded-xl border bg-card p-5">
 <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
 Customer notes
 </p>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">
 {selected.notes}
 </p>
 </section>
 )}

 <section className="rounded-xl border bg-card p-5">
 <label className="block text-sm font-semibold text-foreground">
 Update order status
 </label>
 <p className="mt-1 text-xs text-muted-foreground">
 Use the status that reflects the current fulfilment stage.
 </p>
 <select
 defaultValue={selected.status}
 disabled={busy}
 onChange={(event) =>
 void updateStatus(selected, event.target.value)
 }
 className="mt-3 h-11 w-full rounded-xl border-2 border-border bg-card px-3 text-sm outline-none focus:border-[var(--primary)]"
 >
 {STATUS_OPTIONS.filter((item) => item !== "all").map(
 (item) => (
 <option key={item} value={item}>
 {pretty(item)}
 </option>
 ),
 )}
 </select>
 </section>
 </div>

 <div className="border-t bg-card p-5">
 <Link
 href={`/admin/orders/${selected.id}`}
 className="block w-full rounded-xl bg-foreground px-4 py-3 text-center text-sm font-semibold text-background"
 >
 Open Complete Order Details
 </Link>
 </div>
 </aside>
 </div>
 )}
 </div>
 );
}

function Metric({
 icon: Icon,
 label,
 value,
 detail,
}: {
 icon: IconSvgElement;
 label: string;
 value: string;
 detail: string;
}) {
 return (
 <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <HugeiconsIcon icon={Icon} size={16} />
 </span>
 <p className="mt-4 text-2xl font-bold text-foreground">{value}</p>
 <p className="mt-1 text-sm font-semibold text-muted-foreground">{label}</p>
 <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
 </article>
 );
}

function Info({ label, value }: { label: string; value: string }) {
 return (
 <div className="rounded-xl border bg-card p-4">
 <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
 {label}
 </p>
 <p className="mt-1 break-words text-sm font-semibold text-foreground">
 {value}
 </p>
 </div>
 );
}
