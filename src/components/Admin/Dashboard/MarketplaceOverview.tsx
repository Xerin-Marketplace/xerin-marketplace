"use client";


import { Spinner } from "@/components/ui/Spinner";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, DollarCircleIcon, Package02Icon, PackageCheckIcon, RefreshCwIcon, ShoppingBag01Icon, Store01Icon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import axiosInstance from "@/lib/api/client";
import { adminService } from "@/lib/api/endpoints/admin";
import { ordersApi } from "@/lib/api/endpoints/commerce";
import { brokersApi } from "@/lib/api/endpoints/brokers";
import { formatCurrency } from "@/lib/formatCurrency";
import {
 Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer,
 Tooltip as RechartsTooltip, XAxis, YAxis,
} from "recharts";

const formatCompactNumber = (v: number) =>
 Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);

type Overview = {
 start_at: string;
 end_at: string;
 money: {
 currency: string;
 gross_sales: number;
 commission_revenue: number;
 seller_net_earnings: number;
 refunds_completed: number;
 payouts_completed: number;
 };
 counts: {
 orders: number;
 paid_orders: number;
 refunded_orders: number;
 active_sellers: number;
 products: number;
 units_sold: number;
 };
 average_order_value: number;
 refund_rate_percent: number;
 pending_wallet_balance: number;
 available_wallet_balance: number;
 pending_payout_amount: number;
};

type SeriesPoint = { period: string; amount: number; order_count: number; units: number };
type Ranking = {
 id: string;
 name: string;
 gross_sales: number;
 net_earnings: number;
 commission: number;
 refunds: number;
 order_count: number;
 units: number;
};

type OrderCounts = Record<"pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled", number>;

const EMPTY_COUNTS: OrderCounts = { pending: 0, paid: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
const orderStatusItems: Array<{ key: keyof OrderCounts; label: string; tone: string }> = [
 { key: "delivered", label: "Delivered", tone: "#f47524" },
 { key: "shipped", label: "In transit", tone: "#111827" },
 { key: "processing", label: "Processing", tone: "#fb923c" },
 { key: "paid", label: "Paid / confirmed", tone: "#6b7280" },
 { key: "pending", label: "Pending", tone: "#fed7aa" },
 { key: "cancelled", label: "Cancelled", tone: "#d1d5db" },
];

const toDateInput = (date: Date) => date.toISOString();
const money = (value: number | string | null | undefined, currency = "TZS") =>
 formatCurrency(Number(value || 0), currency);
const shortDate = (value: string) =>
 new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
const fullDate = (value: string) =>
 new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

function SalesChart({ data, currency }: { data: SeriesPoint[]; currency: string }) {
 if (!data.length) {
 return <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">No sales activity in this period.</div>;
 }

 return (
 <div className="h-[260px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
 <defs>
 <linearGradient id="xerinSalesFill" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#f47524" stopOpacity={0.24} />
 <stop offset="100%" stopColor="#f47524" stopOpacity={0.02} />
 </linearGradient>
 </defs>
 <CartesianGrid vertical={false} stroke="#edf0f4" />
 <XAxis
 dataKey="period"
 tickFormatter={shortDate}
 tick={{ fontSize: 11, fill: "#667085" }}
 axisLine={false}
 tickLine={false}
 minTickGap={24}
 />
 <YAxis
 width={52}
 tick={{ fontSize: 11, fill: "#667085" }}
 axisLine={false}
 tickLine={false}
 tickFormatter={(v: number) => formatCompactNumber(v)}
 />
 <RechartsTooltip
 formatter={(value: number | string) => [money(Number(value), currency), "Sales"]}
 labelFormatter={(label: string) => fullDate(label)}
 contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
 />
 <Area
 type="monotone"
 dataKey="amount"
 stroke="#f47524"
 strokeWidth={3}
 fill="url(#xerinSalesFill)"
 dot={false}
 activeDot={{ r: 5, strokeWidth: 2, stroke: "#111827", fill: "#fff" }}
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 );
}

function OrderStatusDonut({ counts }: { counts: OrderCounts }) {
 const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
 const slices = orderStatusItems
 .filter((item) => counts[item.key] > 0)
 .map((item) => ({ name: item.label, value: counts[item.key], fill: item.tone }));

 return (
 <div className="grid gap-5 md:grid-cols-[150px_1fr] md:items-center">
 <div className="relative mx-auto h-36 w-36">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={slices}
 dataKey="value"
 innerRadius="62%"
 outerRadius="100%"
 paddingAngle={slices.length > 1 ? 3 : 0}
 strokeWidth={0}
 startAngle={90}
 endAngle={-270}
 />
 <RechartsTooltip
 formatter={(value: number | string, name: string) => [Number(value).toLocaleString(), name]}
 contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
 />
 </PieChart>
 </ResponsiveContainer>
 <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
 <strong className="text-2xl font-black text-foreground">{total.toLocaleString()}</strong>
 <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Orders</span>
 </div>
 </div>
 <div className="space-y-2.5">
 {orderStatusItems.map((item) => (
 <div key={item.key} className="flex items-center justify-between gap-4 text-xs">
 <span className="inline-flex min-w-0 items-center gap-2 text-muted-foreground dark:text-gray-300">
 <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.tone }} />
 <span className="truncate">{item.label}</span>
 </span>
 <strong className="text-foreground">{counts[item.key].toLocaleString()}</strong>
 </div>
 ))}
 </div>
 </div>
 );
}

export default function MarketplaceOverview() {
 const [days, setDays] = useState(30);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [overview, setOverview] = useState<Overview | null>(null);
 const [series, setSeries] = useState<SeriesPoint[]>([]);
 const [sellers, setSellers] = useState<Ranking[]>([]);
 const [users, setUsers] = useState<number | null>(null);
 const [brokers, setBrokers] = useState<number | null>(null);
 const [pendingSellers, setPendingSellers] = useState(0);
 const [pendingProducts, setPendingProducts] = useState(0);
 const [recentOrders, setRecentOrders] = useState<any[]>([]);
 const [orderCounts, setOrderCounts] = useState<OrderCounts>(EMPTY_COUNTS);

 const load = useCallback(async () => {
 setLoading(true);
 setError("");
 const end = new Date();
 const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
 const analyticsParams = { start_at: toDateInput(start), end_at: toDateInput(end) };

 try {
 const [overviewResult, seriesResult, sellerResult, usersResult, brokerResult, sellerQueue, productQueue, recent] = await Promise.allSettled([
 axiosInstance.get<Overview>("/analytics/admin/overview", { params: analyticsParams }),
 axiosInstance.get<SeriesPoint[]>("/analytics/admin/sales", { params: analyticsParams }),
 axiosInstance.get<Ranking[]>("/analytics/admin/sellers", { params: { ...analyticsParams, limit: 5 } }),
 adminService.listUsers({ page: 1, page_size: 1 }),
 brokersApi.adminList({ page: 1, page_size: 1 }),
 adminService.listPendingSellers(),
 adminService.listPendingProducts(),
 ordersApi.adminList({ page: 1, page_size: 5 }),
 ]);
 const statuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"] as const;
 const statusResults = await Promise.allSettled(
 statuses.map((status) => ordersApi.adminList({ page: 1, page_size: 1, status })),
 );

 if (overviewResult.status === "fulfilled") setOverview(overviewResult.value.data);
 else throw overviewResult.reason;
 if (seriesResult.status === "fulfilled") setSeries(seriesResult.value.data || []);
 if (sellerResult.status === "fulfilled") setSellers(sellerResult.value.data || []);
 if (usersResult.status === "fulfilled") setUsers(usersResult.value.total);
 if (brokerResult.status === "fulfilled") setBrokers(brokerResult.value.total);
 if (sellerQueue.status === "fulfilled") setPendingSellers(sellerQueue.value.length);
 if (productQueue.status === "fulfilled") setPendingProducts(productQueue.value.length);
 if (recent.status === "fulfilled") setRecentOrders(recent.value.results || []);

 const nextCounts = { ...EMPTY_COUNTS };
 statusResults.forEach((result, index) => {
 if (result.status === "fulfilled") nextCounts[statuses[index]] = Number(result.value.total || 0);
 });
 setOrderCounts(nextCounts);
 } catch (caught) {
 const message = caught instanceof Error ? caught.message : "Unable to load analytics.";
 setError(message);
 } finally {
 setLoading(false);
 }
 }, [days]);

 useEffect(() => { void load(); }, [load]);

 const currency = overview?.money.currency || "TZS";
 const metrics = useMemo(() => [
 { label: "Gross sales", value: money(overview?.money.gross_sales, currency), hint: `${days}-day GMV`, icon: DollarCircleIcon },
 { label: "Orders", value: (overview?.counts.orders ?? 0).toLocaleString(), hint: `${overview?.counts.paid_orders ?? 0} paid`, icon: ShoppingBag01Icon },
 { label: "Active sellers", value: (overview?.counts.active_sellers ?? 0).toLocaleString(), hint: `${pendingSellers} awaiting review`, icon: Store01Icon },
 { label: "Brokers", value: brokers == null ? "—" : brokers.toLocaleString(), hint: "Registered Broker accounts", icon: UserMultiple02Icon },
 { label: "Registered users", value: users == null ? "—" : users.toLocaleString(), hint: "Registered accounts", icon: UserMultiple02Icon },
 { label: "Active products", value: (overview?.counts.products ?? 0).toLocaleString(), hint: `${pendingProducts} awaiting moderation`, icon: Package02Icon },
 ], [overview, currency, days, pendingSellers, pendingProducts, brokers, users]);

 return (
 <div className="space-y-5">
 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card">
 <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-border">
 <div>
 <p className="text-[11px] font-black uppercase tracking-[.18em] text-primary">Xerin Mart intelligence</p>
 <h2 className="mt-1 text-2xl font-black tracking-[-.025em] text-foreground">Admin Dashboard</h2>
 <p className="mt-1 text-sm text-muted-foreground dark:text-gray-300">Live commerce, partner, order and finance performance from your backend.</p>
 </div>
 <div className="flex flex-wrap items-center gap-2">
 {[7, 30, 90].map((value) => (
 <button key={value} type="button" onClick={() => setDays(value)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${days === value ? "bg-foreground text-background" : "border border-border bg-card text-muted-foreground hover:border-[var(--primary)] hover:text-primary dark:border-border "}`}>
 {value} days
 </button>
 ))}
 <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90">
 {loading ? <Spinner /> : <HugeiconsIcon icon={RefreshCwIcon} size={14} />} Refresh
 </button>
 </div>
 </div>

 {error ? <div className="mx-5 mt-5 rounded-xl border border-border bg-red-light-6 px-4 py-3 text-sm text-red-dark sm:mx-6">{error}</div> : null}

 <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 sm:p-6">
 {metrics.map((metric, index) => (
 <article key={metric.label} className="group rounded-xl border border-border bg-muted p-4 transition hover:-translate-y-0.5 hover:border-[var(--primary)]/50 hover:shadow-md dark:border-border dark:bg-card/[.03]">
 <div className="flex items-start justify-between gap-3">
 <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${index === 0 ? "bg-[var(--foreground)] text-primary" : "bg-primary/10 text-primary"}`}><HugeiconsIcon icon={metric.icon} size={18} /></div>
 <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} className="text-muted-foreground transition group-hover:text-primary" />
 </div>
 <p className="mt-4 text-xs font-semibold text-muted-foreground dark:text-gray-300">{metric.label}</p>
 <strong className="mt-1 block break-words text-[21px] font-black leading-tight text-foreground">{loading && !overview ? "—" : metric.value}</strong>
 <p className="mt-1.5 text-[11px] text-muted-foreground">{metric.hint}</p>
 </article>
 ))}
 </div>
 </section>

 <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,.75fr)]">
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <p className="text-[11px] font-black uppercase tracking-[.16em] text-primary">Sales overview</p>
 <h3 className="mt-1 text-lg font-black text-foreground">Sales trend</h3>
 <p className="text-xs text-muted-foreground">Gross seller-item value recorded by the commission ledger.</p>
 </div>
 <div className="text-right">
 <p className="text-xs text-muted-foreground">Average order value</p>
 <strong className="text-base font-black text-foreground">{money(overview?.average_order_value, currency)}</strong>
 </div>
 </div>
 <div className="mt-4"><SalesChart data={series} currency={currency} /></div>
 </section>

 <section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
 <div>
 <p className="text-[11px] font-black uppercase tracking-[.16em] text-primary">Order status</p>
 <h3 className="mt-1 text-lg font-black text-foreground">Current order pipeline</h3>
 <p className="text-xs text-muted-foreground">Live totals by order status.</p>
 </div>
 <div className="mt-5"><OrderStatusDonut counts={orderCounts} /></div>
 </section>
 </div>

 <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,.65fr)]">
 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card">
 <div className="flex items-center justify-between border-b border-border px-5 py-4 dark:border-border">
 <div>
 <h3 className="font-black text-foreground">Recent orders</h3>
 <p className="text-xs text-muted-foreground">Latest customer orders across Xerin.</p>
 </div>
 <Link href="/admin/orders" className="text-xs font-bold text-primary hover:text-foreground dark:hover:text-white">View all</Link>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full min-w-[720px] text-left text-xs">
 <thead className="bg-muted text-[10px] font-black uppercase tracking-[.1em] text-muted-foreground dark:bg-card/[.03]">
 <tr><th className="px-5 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr>
 </thead>
 <tbody className="divide-y divide-[#f0f1f3] dark:divide-white/10">
 {recentOrders.map((order) => (
 <tr key={order.id} className="transition hover:bg-primary/10 dark:hover:bg-card/[.03]">
 <td className="px-5 py-4"><Link href={`/admin/orders/${order.id}`} className="font-black text-foreground hover:text-primary">#{String(order.id).slice(0, 8).toUpperCase()}</Link><div className="mt-0.5 text-[10px] text-muted-foreground">{order.items?.length || 0} item(s)</div></td>
 <td className="px-4 py-4"><div className="font-semibold text-foreground dark:text-gray-200">{[order.user?.first_name, order.user?.last_name].filter(Boolean).join(" ") || "Customer"}</div><div className="mt-0.5 max-w-[180px] truncate text-[10px] text-muted-foreground">{order.user?.email || "—"}</div></td>
 <td className="px-4 py-4 font-black text-foreground">{money(order.total, order.currency)}</td>
 <td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${String(order.payment_status).toLowerCase() === "completed" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{String(order.payment_status || "pending").replaceAll("_", " ")}</span></td>
 <td className="px-4 py-4"><span className="rounded-full bg-foreground px-2 py-1 text-[10px] font-bold capitalize text-background">{String(order.status).replaceAll("_", " ")}</span></td>
 <td className="px-4 py-4 whitespace-nowrap text-muted-foreground dark:text-gray-300">{shortDate(order.created_at)}</td>
 </tr>
 ))}
 {!recentOrders.length && <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No orders returned yet.</td></tr>}
 </tbody>
 </table>
 </div>
 </section>

 <section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card">
 <div className="flex items-center justify-between">
 <div><h3 className="font-black text-foreground">Top sellers</h3><p className="text-xs text-muted-foreground">Ranked by gross sales.</p></div>
 <HugeiconsIcon icon={Store01Icon} size={20} className="text-primary" />
 </div>
 <div className="mt-4 space-y-3">
 {sellers.map((seller, index) => (
 <div key={seller.id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-3 dark:border-border">
 <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${index === 0 ? "bg-primary text-primary-foreground" : "bg-foreground text-background"}`}>{index + 1}</span>
 <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-foreground">{seller.name || "Seller"}</p><p className="text-[10px] text-muted-foreground">{seller.order_count} orders · {seller.units} units</p></div>
 <strong className="text-right text-xs font-black text-foreground">{money(seller.gross_sales, currency)}</strong>
 </div>
 ))}
 {!sellers.length && <div className="py-8 text-center text-sm text-muted-foreground">No seller ranking data yet.</div>}
 </div>
 </section>
 </div>

 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 {[
 { label: "Xerin commission", value: money(overview?.money.commission_revenue, currency), note: "Platform revenue", icon: DollarCircleIcon },
 { label: "Seller net earnings", value: money(overview?.money.seller_net_earnings, currency), note: "Seller entitlement in period", icon: PackageCheckIcon },
 { label: "Pending seller payouts", value: money(overview?.pending_payout_amount, currency), note: "Awaiting / processing", icon: DollarCircleIcon },
 { label: "Completed refunds", value: money(overview?.money.refunds_completed, currency), note: `${Number(overview?.refund_rate_percent || 0).toFixed(2)}% refund rate`, icon: RefreshCwIcon },
 ].map((item) => (
 <article key={item.label} className="rounded-xl border border-border bg-foreground p-5 text-background shadow-sm">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><HugeiconsIcon icon={item.icon} size={18} /></div>
 <p className="mt-4 text-xs font-semibold text-white/60">{item.label}</p>
 <strong className="mt-1 block text-xl font-black">{item.value}</strong>
 <p className="mt-1 text-[11px] text-white/45">{item.note}</p>
 </article>
 ))}
 </div>
 </div>
 );
}
