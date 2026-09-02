"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeDollarSign,
  Boxes,
  CircleDollarSign,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import axiosInstance from "@/lib/api/client";
import { adminService } from "@/lib/api/endpoints/admin";
import { ordersApi } from "@/lib/api/endpoints/commerce";
import { brokersApi } from "@/lib/api/endpoints/brokers";
import { formatCurrency } from "@/lib/formatCurrency";

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
  const width = 820;
  const height = 260;
  const padX = 22;
  const padTop = 24;
  const padBottom = 38;
  const max = Math.max(...data.map((point) => Number(point.amount)), 1);
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const points = data.map((point, index) => {
    const x = data.length <= 1 ? width / 2 : padX + (index * innerW) / (data.length - 1);
    const y = padTop + innerH - (Number(point.amount) / max) * innerH;
    return { ...point, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = points.length
    ? `${points[0].x},${padTop + innerH} ${line} ${points[points.length - 1].x},${padTop + innerH}`
    : "";
  const labelStep = Math.max(1, Math.ceil(data.length / 7));

  if (!data.length) {
    return <div className="flex h-[260px] items-center justify-center text-sm text-[#98a2b3]">No sales activity in this period.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[650px] w-full" role="img" aria-label="Marketplace sales trend">
        <defs>
          <linearGradient id="xerinSalesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f47524" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#f47524" stopOpacity="0.015" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padTop + innerH * ratio;
          return <line key={ratio} x1={padX} x2={width - padX} y1={y} y2={y} stroke="#edf0f4" strokeWidth="1" />;
        })}
        <polygon points={area} fill="url(#xerinSalesFill)" />
        <polyline points={line} fill="none" stroke="#f47524" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <g key={point.period}>
            <circle cx={point.x} cy={point.y} r="4" fill="#fff" stroke="#111827" strokeWidth="2" />
            {(index % labelStep === 0 || index === points.length - 1) && (
              <text x={point.x} y={height - 12} textAnchor="middle" fontSize="11" fill="#667085">
                {shortDate(point.period)}
              </text>
            )}
            <title>{`${fullDate(point.period)} — ${money(point.amount, currency)} · ${point.order_count} orders`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}

function OrderStatusDonut({ counts }: { counts: OrderCounts }) {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  let cursor = 0;
  const stops: string[] = [];
  orderStatusItems.forEach((item) => {
    const percent = total ? (counts[item.key] / total) * 100 : 0;
    if (!percent) return;
    stops.push(`${item.tone} ${cursor}% ${cursor + percent}%`);
    cursor += percent;
  });
  const background = stops.length ? `conic-gradient(${stops.join(",")})` : "#f2f4f7";

  return (
    <div className="grid gap-5 md:grid-cols-[150px_1fr] md:items-center">
      <div className="relative mx-auto h-36 w-36 rounded-full" style={{ background }}>
        <div className="absolute inset-[24px] flex flex-col items-center justify-center rounded-full bg-white dark:bg-[#1f2937]">
          <strong className="text-2xl font-black text-[#111827] dark:text-white">{total.toLocaleString()}</strong>
          <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#98a2b3]">Orders</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {orderStatusItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4 text-xs">
            <span className="inline-flex min-w-0 items-center gap-2 text-[#667085] dark:text-gray-300">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.tone }} />
              <span className="truncate">{item.label}</span>
            </span>
            <strong className="text-[#101828] dark:text-white">{counts[item.key].toLocaleString()}</strong>
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
      const message = caught instanceof Error ? caught.message : "Unable to load marketplace analytics.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { void load(); }, [load]);

  const currency = overview?.money.currency || "TZS";
  const metrics = useMemo(() => [
    { label: "Gross sales", value: money(overview?.money.gross_sales, currency), hint: `${days}-day marketplace GMV`, icon: CircleDollarSign },
    { label: "Orders", value: (overview?.counts.orders ?? 0).toLocaleString(), hint: `${overview?.counts.paid_orders ?? 0} paid`, icon: ShoppingBag },
    { label: "Active sellers", value: (overview?.counts.active_sellers ?? 0).toLocaleString(), hint: `${pendingSellers} awaiting review`, icon: Store },
    { label: "Brokers", value: brokers == null ? "—" : brokers.toLocaleString(), hint: "Registered Broker accounts", icon: Users },
    { label: "Registered users", value: users == null ? "—" : users.toLocaleString(), hint: "Marketplace accounts", icon: Users },
    { label: "Active products", value: (overview?.counts.products ?? 0).toLocaleString(), hint: `${pendingProducts} awaiting moderation`, icon: Boxes },
  ], [overview, currency, days, pendingSellers, pendingProducts, brokers, users]);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_2px_12px_rgba(17,24,39,.04)] dark:border-white/10 dark:bg-[#1f2937]">
        <div className="flex flex-col gap-4 border-b border-[#eef0f3] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-white/10">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.18em] text-[#f47524]">Xerin marketplace intelligence</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-.025em] text-[#111827] dark:text-white">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-[#667085] dark:text-gray-300">Live commerce, partner, order and finance performance from your backend.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[7, 30, 90].map((value) => (
              <button key={value} type="button" onClick={() => setDays(value)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${days === value ? "bg-[#111827] text-white" : "border border-[#e5e7eb] bg-white text-[#475467] hover:border-[#f47524] hover:text-[#f47524] dark:border-white/10 dark:bg-white/5 dark:text-white"}`}>
                {value} days
              </button>
            ))}
            <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg bg-[#f47524] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#dc6418]">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {error ? <div className="mx-5 mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">{error}</div> : null}

        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 sm:p-6">
          {metrics.map((metric, index) => (
            <article key={metric.label} className="group rounded-xl border border-[#e8ebef] bg-[#fcfcfd] p-4 transition hover:-translate-y-0.5 hover:border-[#f47524]/50 hover:shadow-md dark:border-white/10 dark:bg-white/[.03]">
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${index === 0 ? "bg-[#111827] text-[#f47524]" : "bg-[#fff2e8] text-[#f47524]"}`}><metric.icon size={18} /></div>
                <ArrowUpRight size={15} className="text-[#c6cbd2] transition group-hover:text-[#f47524]" />
              </div>
              <p className="mt-4 text-xs font-semibold text-[#667085] dark:text-gray-300">{metric.label}</p>
              <strong className="mt-1 block break-words text-[21px] font-black leading-tight text-[#111827] dark:text-white">{loading && !overview ? "—" : metric.value}</strong>
              <p className="mt-1.5 text-[11px] text-[#98a2b3]">{metric.hint}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,.75fr)]">
        <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_2px_12px_rgba(17,24,39,.04)] dark:border-white/10 dark:bg-[#1f2937] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.16em] text-[#f47524]">Sales overview</p>
              <h3 className="mt-1 text-lg font-black text-[#111827] dark:text-white">Marketplace sales trend</h3>
              <p className="text-xs text-[#98a2b3]">Gross seller-item value recorded by the commission ledger.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#98a2b3]">Average order value</p>
              <strong className="text-base font-black text-[#111827] dark:text-white">{money(overview?.average_order_value, currency)}</strong>
            </div>
          </div>
          <div className="mt-4"><SalesChart data={series} currency={currency} /></div>
        </section>

        <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_2px_12px_rgba(17,24,39,.04)] dark:border-white/10 dark:bg-[#1f2937] sm:p-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.16em] text-[#f47524]">Order status</p>
            <h3 className="mt-1 text-lg font-black text-[#111827] dark:text-white">Current order pipeline</h3>
            <p className="text-xs text-[#98a2b3]">Live totals by marketplace order status.</p>
          </div>
          <div className="mt-5"><OrderStatusDonut counts={orderCounts} /></div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,.65fr)]">
        <section className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_2px_12px_rgba(17,24,39,.04)] dark:border-white/10 dark:bg-[#1f2937]">
          <div className="flex items-center justify-between border-b border-[#eef0f3] px-5 py-4 dark:border-white/10">
            <div>
              <h3 className="font-black text-[#111827] dark:text-white">Recent orders</h3>
              <p className="text-xs text-[#98a2b3]">Latest customer orders across Xerin.</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-bold text-[#f47524] hover:text-[#111827] dark:hover:text-white">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-[#fafafa] text-[10px] font-black uppercase tracking-[.1em] text-[#98a2b3] dark:bg-white/[.03]">
                <tr><th className="px-5 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr>
              </thead>
              <tbody className="divide-y divide-[#f0f1f3] dark:divide-white/10">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-[#fff8f3] dark:hover:bg-white/[.03]">
                    <td className="px-5 py-4"><Link href={`/admin/orders/${order.id}`} className="font-black text-[#111827] hover:text-[#f47524] dark:text-white">#{String(order.id).slice(0, 8).toUpperCase()}</Link><div className="mt-0.5 text-[10px] text-[#98a2b3]">{order.items?.length || 0} item(s)</div></td>
                    <td className="px-4 py-4"><div className="font-semibold text-[#344054] dark:text-gray-200">{[order.user?.first_name, order.user?.last_name].filter(Boolean).join(" ") || "Customer"}</div><div className="mt-0.5 max-w-[180px] truncate text-[10px] text-[#98a2b3]">{order.user?.email || "—"}</div></td>
                    <td className="px-4 py-4 font-black text-[#111827] dark:text-white">{money(order.total, order.currency)}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${String(order.payment_status).toLowerCase() === "completed" ? "bg-[#fff2e8] text-[#c75813]" : "bg-[#f2f4f7] text-[#667085]"}`}>{String(order.payment_status || "pending").replaceAll("_", " ")}</span></td>
                    <td className="px-4 py-4"><span className="rounded-full bg-[#111827] px-2 py-1 text-[10px] font-bold capitalize text-white">{String(order.status).replaceAll("_", " ")}</span></td>
                    <td className="px-4 py-4 whitespace-nowrap text-[#667085] dark:text-gray-300">{shortDate(order.created_at)}</td>
                  </tr>
                ))}
                {!recentOrders.length && <tr><td colSpan={6} className="px-5 py-10 text-center text-[#98a2b3]">No orders returned yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_2px_12px_rgba(17,24,39,.04)] dark:border-white/10 dark:bg-[#1f2937]">
          <div className="flex items-center justify-between">
            <div><h3 className="font-black text-[#111827] dark:text-white">Top sellers</h3><p className="text-xs text-[#98a2b3]">Ranked by gross sales.</p></div>
            <Store size={20} className="text-[#f47524]" />
          </div>
          <div className="mt-4 space-y-3">
            {sellers.map((seller, index) => (
              <div key={seller.id} className="flex items-center gap-3 rounded-xl border border-[#edf0f4] px-3 py-3 dark:border-white/10">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${index === 0 ? "bg-[#f47524] text-white" : "bg-[#111827] text-white"}`}>{index + 1}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#111827] dark:text-white">{seller.name || "Seller"}</p><p className="text-[10px] text-[#98a2b3]">{seller.order_count} orders · {seller.units} units</p></div>
                <strong className="text-right text-xs font-black text-[#111827] dark:text-white">{money(seller.gross_sales, currency)}</strong>
              </div>
            ))}
            {!sellers.length && <div className="py-8 text-center text-sm text-[#98a2b3]">No seller ranking data yet.</div>}
          </div>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Xerin commission", value: money(overview?.money.commission_revenue, currency), note: "Marketplace revenue", icon: BadgeDollarSign },
          { label: "Seller net earnings", value: money(overview?.money.seller_net_earnings, currency), note: "Seller entitlement in period", icon: PackageCheck },
          { label: "Pending seller payouts", value: money(overview?.pending_payout_amount, currency), note: "Awaiting / processing", icon: CircleDollarSign },
          { label: "Completed refunds", value: money(overview?.money.refunds_completed, currency), note: `${Number(overview?.refund_rate_percent || 0).toFixed(2)}% refund rate`, icon: RefreshCw },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-[#e5e7eb] bg-[#111827] p-5 text-white shadow-[0_2px_12px_rgba(17,24,39,.08)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f47524] text-white"><item.icon size={19} /></div>
            <p className="mt-4 text-xs font-semibold text-white/60">{item.label}</p>
            <strong className="mt-1 block text-xl font-black">{item.value}</strong>
            <p className="mt-1 text-[11px] text-white/45">{item.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
