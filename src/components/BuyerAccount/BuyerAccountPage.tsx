"use client";


import { Spinner } from "@/components/ui/Spinner";
import { cartApi, ordersApi } from "@/lib/api/endpoints/commerce";
import { notificationsApi, type NotificationSummary } from "@/lib/api/endpoints/notifications";
import { usersApi } from "@/lib/api/endpoints/users";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Cart, CustomerEscrowSummary, Order, PaginatedOrders } from "@/types/api/commerce";
import type { WishlistProductListResponse } from "@/types/api/discovery";
import type { Address, User } from "@/types/api/user";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { AlertCircleIcon, BellIcon, CheckmarkCircle02Icon, ArrowRight01Icon, Clock01Icon, CreditCardIcon, FavouriteIcon, Location01Icon, PackageIcon, RefreshCwIcon, ShieldCheckIcon, ShoppingBag01Icon, ShoppingCart01Icon, TruckIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
 Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import OnboardingTour, { useTour } from "@/components/Common/Info/OnboardingTour";

const BUYER_TOUR_STEPS = [
 { title: "Welcome to your dashboard", body: "This is your home base · recent orders, saved items and anything that needs your attention appear here." },
 { title: "Shop products", body: "Browse the store, compare sellers and add items to your cart. Checkout is protected by Xerin buyer protection." },
 { title: "Track your orders", body: "Open Orders to follow each order from confirmation to delivery · tap a status badge to see what it means." },
 { title: "Manage your account", body: "Addresses, payment methods and security settings live under the Account menu. Set a default address to check out faster." },
];

type Load<T> = { state: "loading" | "ready" | "error"; data: T };

type ProtectionState = {
 loading: boolean;
 actionable: number;
 disputed: number;
};

const inTransitStatuses = new Set(["shipped", "in_transit", "out_for_delivery"]);
const preparingStatuses = new Set(["paid", "confirmed", "processing"]);
const terminalStatuses = new Set(["delivered", "cancelled", "refunded"]);

const STATUS_COLORS: Record<string, string> = {
 delivered: "#16a34a",
 shipped: "#f47524",
 in_transit: "#f47524",
 out_for_delivery: "#f47524",
 paid: "#0ea5e9",
 confirmed: "#0ea5e9",
 processing: "#0ea5e9",
 pending: "#eab308",
 cancelled: "#dc2626",
 refunded: "#9333ea",
};

export default function BuyerDashboard() {
 const [cart, setCart] = useState<Load<Cart | null>>({ state: "loading", data: null });
 const [profile, setProfile] = useState<Load<User | null>>({ state: "loading", data: null });
 const [addresses, setAddresses] = useState<Load<Address[]>>({ state: "loading", data: [] });
 const [orders, setOrders] = useState<Load<PaginatedOrders | null>>({ state: "loading", data: null });
 const [wishlist, setWishlist] = useState<Load<WishlistProductListResponse | null>>({ state: "loading", data: null });
 const [notifications, setNotifications] = useState<Load<NotificationSummary | null>>({ state: "loading", data: null });
 const [protection, setProtection] = useState<ProtectionState>({ loading: true, actionable: 0, disputed: 0 });
 const tour = useTour("buyer_dashboard");

 async function load() {
 setProfile((v) => ({ ...v, state: "loading" }));
 setAddresses((v) => ({ ...v, state: "loading" }));
 setOrders((v) => ({ ...v, state: "loading" }));
 setCart((v) => ({ ...v, state: "loading" }));
 setWishlist((v) => ({ ...v, state: "loading" }));
 setNotifications((v) => ({ ...v, state: "loading" }));
 setProtection((v) => ({ ...v, loading: true }));

 const results = await Promise.allSettled([
 usersApi.getMe(),
 usersApi.getAddresses(),
 ordersApi.mine({ page: 1, page_size: 100 }),
 cartApi.get(),
 usersApi.getWishlist({ page: 1, page_size: 1 }),
 notificationsApi.summary(),
 ]);

 const [profileResult, addressResult, orderResult, cartResult, wishlistResult, notificationResult] = results;

 if (profileResult.status === "fulfilled") setProfile({ state: "ready", data: profileResult.value });
 else setProfile({ state: "error", data: null });

 if (addressResult.status === "fulfilled") setAddresses({ state: "ready", data: addressResult.value });
 else setAddresses({ state: "error", data: [] });

 if (orderResult.status === "fulfilled") {
 setOrders({ state: "ready", data: orderResult.value });
 await loadProtection(orderResult.value.results);
 } else {
 setOrders({ state: "error", data: null });
 setProtection({ loading: false, actionable: 0, disputed: 0 });
 }

 if (cartResult.status === "fulfilled") setCart({ state: "ready", data: cartResult.value });
 else setCart({ state: "error", data: null });

 if (wishlistResult.status === "fulfilled") setWishlist({ state: "ready", data: wishlistResult.value });
 else setWishlist({ state: "error", data: null });

 if (notificationResult.status === "fulfilled") setNotifications({ state: "ready", data: notificationResult.value });
 else setNotifications({ state: "error", data: null });
 }

 async function loadProtection(items: Order[]) {
 const candidates = items
 .filter((order) => order.status === "delivered" || Boolean(order.delivered_at))
 .slice(0, 10);

 if (!candidates.length) {
 setProtection({ loading: false, actionable: 0, disputed: 0 });
 return;
 }

 const settled = await Promise.allSettled(
 candidates.map((order) => ordersApi.escrowStatus(order.id)),
 );
 const summaries = settled
 .filter((item): item is PromiseFulfilledResult<CustomerEscrowSummary> => item.status === "fulfilled")
 .map((item) => item.value);

 setProtection({
 loading: false,
 actionable: summaries.filter(
 (summary) => summary.can_customer_approve || summary.can_report_problem,
 ).length,
 disputed: summaries.filter((summary) => summary.status === "disputed").length,
 });
 }

 useEffect(() => {
 void load();
 }, []);

 const first = profile.data?.first_name;
 const cartCount = cart.data?.items.reduce((count, item) => count + item.quantity, 0) ?? 0;
 const allOrders = orders.data?.results ?? [];

 const orderCounts = useMemo(() => {
 const unpaid = allOrders.filter((order) => {
 const payment = String(order.payment_status || "").toLowerCase();
 return !terminalStatuses.has(order.status) && ["", "pending", "unpaid", "failed"].includes(payment);
 }).length;
 const preparing = allOrders.filter((order) => preparingStatuses.has(order.status)).length;
 const transit = allOrders.filter((order) => inTransitStatuses.has(order.status)).length;
 const delivered = allOrders.filter((order) => order.status === "delivered").length;
 return { unpaid, preparing, transit, delivered };
 }, [allOrders]);

 const spendChart = useMemo(() => {
 const months: { key: string; label: string; total: number; orders: number }[] = [];
 const now = new Date();
 for (let offset = 5; offset >= 0; offset--) {
 const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
 months.push({ key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleString("en", { month: "short" }), total: 0, orders: 0 });
 }
 for (const order of allOrders) {
 if (!order.created_at) continue;
 const date = new Date(order.created_at);
 const bucket = months.find((m) => m.key === `${date.getFullYear()}-${date.getMonth()}`);
 if (bucket) {
 bucket.total += Number(order.total || 0);
 bucket.orders += 1;
 }
 }
 return months;
 }, [allOrders]);

 const statusChart = useMemo(() => {
 const counts = new Map<string, number>();
 for (const order of allOrders) {
 const key = order.status || "pending";
 counts.set(key, (counts.get(key) || 0) + 1);
 }
 return Array.from(counts.entries()).map(([name, value]) => ({ name: name.replaceAll("_", " "), value, color: STATUS_COLORS[name] || "#94a3b8" }));
 }, [allOrders]);

 const totalSpent = useMemo(
 () => allOrders.filter((order) => !["cancelled", "refunded"].includes(order.status)).reduce((sum, order) => sum + Number(order.total || 0), 0),
 [allOrders],
 );

 const hasLoadError = [profile.state, addresses.state, orders.state, cart.state, wishlist.state, notifications.state].includes("error");
 const attentionCount = orderCounts.unpaid + protection.actionable + (notifications.data?.unread ?? 0);

 return (
 <div className="space-y-10">
 {/* Header */}
 <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">My Xerin Mart</p>
 <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
 {profile.state === "ready" && first ? `Welcome back, ${first}` : profile.state === "error" ? "Your dashboard" : "Loading your account…"}
 </h1>
 <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
 Track orders, payments and anything that needs your attention.
 </p>
 </div>
 <div className="flex gap-2">
 <Link href="/shop-with-sidebar" className="inline-flex h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-white">
 Shop Products
 </Link>
 <Link href="/account/orders" className="inline-flex h-11 items-center rounded-xl bg-muted px-4 text-sm font-semibold text-foreground">
 Track Orders
 </Link>
 </div>
 </section>

 {hasLoadError && (
 <div className="flex flex-col gap-3 rounded-xl bg-red-light-6 p-4 text-sm text-red-dark sm:flex-row sm:items-center sm:justify-between">
 <span className="flex items-center gap-2"><HugeiconsIcon icon={AlertCircleIcon} size={18} />Some account information could not be loaded.</span>
 <button onClick={() => void load()} className="flex items-center gap-2 font-semibold"><HugeiconsIcon icon={RefreshCwIcon} size={16} />Retry</button>
 </div>
 )}

 {/* Needs attention */}
 <section>
 <div className="flex items-center justify-between">
 <h2 className="text-sm font-bold text-foreground">Needs your attention</h2>
 <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
 {protection.loading || orders.state === "loading" || notifications.state === "loading" ? "Checking…" : `${attentionCount} action${attentionCount === 1 ? "" : "s"}`}
 </span>
 </div>
 <div className="mt-4 grid gap-3 sm:grid-cols-3">
 <AttentionRow icon={CreditCardIcon} label="Payment required" value={orders.state === "loading" ? "…" : String(orderCounts.unpaid)} helper={orderCounts.unpaid ? "Complete payment to keep your order moving." : "No unpaid orders."} href="/account/orders" />
 <AttentionRow icon={ShieldCheckIcon} label="Delivery protection" value={protection.loading ? "…" : String(protection.actionable)} helper={protection.disputed ? `${protection.disputed} case${protection.disputed === 1 ? "" : "s"} under review.` : protection.actionable ? "Confirm delivery or report a problem." : "Nothing needed."} href="/account/orders" />
 <AttentionRow icon={BellIcon} label="Unread notifications" value={notifications.state === "loading" ? "…" : notifications.state === "error" ? "—" : String(notifications.data?.unread ?? 0)} helper="Order and delivery updates." href="/account/notifications" />
 </div>
 </section>

 {/* Charts */}
 <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
 <div>
 <div className="flex items-end justify-between">
 <div>
 <h2 className="text-sm font-bold text-foreground">Your spending</h2>
 <p className="mt-0.5 text-xs text-muted-foreground">Last 6 months</p>
 </div>
 <p className="text-xl font-bold text-foreground">{formatCurrency(totalSpent)}</p>
 </div>
 <div className="mt-4 h-52">
 {orders.state === "loading" ? <div className="grid h-full place-items-center text-sm text-muted-foreground"><Spinner size={18} /></div> : (
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={spendChart} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
 <defs>
 <linearGradient id="buyerSpendFill" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#f47524" stopOpacity={0.22} />
 <stop offset="100%" stopColor="#f47524" stopOpacity={0} />
 </linearGradient>
 </defs>
 <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} dy={6} />
 <YAxis hide domain={[0, "auto"]} />
 <Tooltip
 cursor={{ stroke: "#f47524", strokeDasharray: "4 4" }}
 formatter={(value) => [formatCurrency(Number(value)), "Spent"]}
 contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.08)", fontSize: 12 }}
 />
 <Area type="monotone" dataKey="total" stroke="#f47524" strokeWidth={2.5} fill="url(#buyerSpendFill)" />
 </AreaChart>
 </ResponsiveContainer>
 )}
 </div>
 </div>

 <div>
 <h2 className="text-sm font-bold text-foreground">Orders by status</h2>
 <p className="mt-0.5 text-xs text-muted-foreground">{allOrders.length} order{allOrders.length === 1 ? "" : "s"} total</p>
 <div className="mt-4 flex items-center gap-5">
 <div className="h-40 w-40 shrink-0">
 {orders.state === "ready" && statusChart.length ? (
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={statusChart} dataKey="value" innerRadius={44} outerRadius={62} paddingAngle={3} strokeWidth={0}>
 {statusChart.map((row) => <Cell key={row.name} fill={row.color} />)}
 </Pie>
 <Tooltip formatter={(value, name) => [value, name]} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.08)", fontSize: 12 }} />
 </PieChart>
 </ResponsiveContainer>
 ) : (
 <div className="grid h-full place-items-center text-xs text-muted-foreground">{orders.state === "loading" ? <Spinner size={16} /> : "No orders"}</div>
 )}
 </div>
 <ul className="min-w-0 flex-1 space-y-1.5">
 {statusChart.map((row) => (
 <li key={row.name} className="flex items-center gap-2 text-xs">
 <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: row.color }} />
 <span className="flex-1 truncate capitalize text-muted-foreground">{row.name}</span>
 <span className="font-bold text-foreground">{row.value}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 </section>

 {/* Order journey */}
 <section>
 <div className="flex items-end justify-between">
 <h2 className="text-sm font-bold text-foreground">Your order journey</h2>
 <Link href="/account/orders" className="text-xs font-bold text-primary">View all orders</Link>
 </div>
 <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
 <JourneyStat icon={CreditCardIcon} label="Awaiting payment" value={orderCounts.unpaid} />
 <JourneyStat icon={Clock01Icon} label="Being prepared" value={orderCounts.preparing} />
 <JourneyStat icon={TruckIcon} label="On the way" value={orderCounts.transit} />
 <JourneyStat icon={CheckmarkCircle02Icon} label="Delivered" value={orderCounts.delivered} />
 </div>
 </section>

 {/* Recent orders + side column */}
 <div className="grid gap-10 xl:grid-cols-[1.15fr_.85fr]">
 <section>
 <div className="flex items-center justify-between">
 <h2 className="text-sm font-bold text-foreground">Recent orders</h2>
 <Link href="/account/orders" className="text-xs font-bold text-primary">View all</Link>
 </div>
 {orders.state === "loading" ? <Loading /> : orders.state === "error" ? <ErrorText /> : !orders.data?.results.length ? (
 <EmptyOrders />
 ) : (
 <ul className="mt-2 divide-y divide-border/60">
 {orders.data.results.slice(0, 5).map((order) => (
 <li key={order.id} className="flex items-center justify-between gap-3 py-3.5">
 <div className="min-w-0">
 <p className="truncate text-sm font-semibold text-foreground">#{order.order_number || order.id.slice(0, 8).toUpperCase()}</p>
 <p className="mt-0.5 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()} · <span className="capitalize">{order.status.replaceAll("_"," ")}</span></p>
 </div>
 <div className="flex shrink-0 items-center gap-4">
 <p className="text-sm font-bold text-foreground">{formatCurrency(order.total, order.currency)}</p>
 <Link href={`/account/orders/${order.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-primary">Details <HugeiconsIcon icon={ArrowRight01Icon} size={14} /></Link>
 </div>
 </li>
 ))}
 </ul>
 )}
 </section>

 <div className="space-y-10">
 <section>
 <h2 className="text-sm font-bold text-foreground">Quick actions</h2>
 <div className="mt-4 space-y-1">
 <Action href={cartCount ? "/cart" : "/shop-with-sidebar"} icon={ShoppingBag01Icon} label={cartCount ? "Continue checkout" : "Browse products"} />
 <Action href="/wishlist" icon={FavouriteIcon} label="View wishlist" />
 <Action href="/account/addresses" icon={Location01Icon} label={addresses.data.length ? "Manage addresses" : "Add delivery address"} />
 <Action href="/account/notifications" icon={BellIcon} label="View notifications" />
 </div>
 </section>

 <section>
 <h2 className="text-sm font-bold text-foreground">Account readiness</h2>
 {profile.state === "loading" ? <Loading /> : profile.state === "error" ? <ErrorText /> : (
 <div className="mt-4 space-y-2 text-sm">
 <ReadinessRow label="Email verified" ready={Boolean(profile.data?.is_verified)} />
 <ReadinessRow label="Delivery address added" ready={addresses.data.length > 0} />
 <ReadinessRow label="Default address selected" ready={Boolean(addresses.data.find((address) => address.is_default))} />
 <Link href="/account/details" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">Review account details <HugeiconsIcon icon={ArrowRight01Icon} size={14} /></Link>
 </div>
 )}
 </section>

 <section>
 <h2 className="text-sm font-bold text-foreground">At a glance</h2>
 <div className="mt-4 space-y-2">
 <GlanceRow icon={PackageIcon} label="All orders" value={orders.state === "loading" ? "…" : String(orders.data?.total ?? 0)} />
 <GlanceRow icon={FavouriteIcon} label="Wishlist" value={wishlist.state === "loading" ? "…" : String(wishlist.data?.total ?? 0)} />
 <GlanceRow icon={ShoppingCart01Icon} label="Cart items" value={cart.state === "loading" ? "…" : String(cartCount)} />
 <GlanceRow icon={Location01Icon} label="Addresses" value={addresses.state === "loading" ? "…" : String(addresses.data.length)} />
 </div>
 </section>
 </div>
 </div>
 <OnboardingTour steps={BUYER_TOUR_STEPS} active={tour.active} onFinish={tour.finish} />
 </div>
 );
}

function AttentionRow({ icon: Icon, label, value, helper, href }: { icon: IconSvgElement; label: string; value: string; helper: string; href: string }) {
 return (
 <Link href={href} className="group flex items-center gap-4 rounded-xl bg-muted p-4">
 <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><HugeiconsIcon icon={Icon} size={18} /></span>
 <span className="min-w-0 flex-1">
 <span className="block text-sm font-bold text-foreground">{label}</span>
 <span className="mt-0.5 block truncate text-xs text-muted-foreground">{helper}</span>
 </span>
 <b className="text-xl text-foreground">{value}</b>
 </Link>
 );
}

function JourneyStat({ icon: Icon, label, value }: { icon: IconSvgElement; label: string; value: number }) {
 return (
 <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3.5">
 <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><HugeiconsIcon icon={Icon} size={17} /></span>
 <span className="min-w-0">
 <b className="block text-lg leading-tight text-foreground">{value}</b>
 <span className="block truncate text-xs text-muted-foreground">{label}</span>
 </span>
 </div>
 );
}

function Action({ href, icon: Icon, label }: { href: string; icon: IconSvgElement; label: string }) {
 return (
 <Link href={href} className="flex items-center justify-between gap-3 rounded-xl px-2 py-3 text-sm font-semibold text-foreground transition hover:bg-muted">
 <span className="flex items-center gap-3"><HugeiconsIcon icon={Icon} size={18} className="text-primary" />{label}</span><HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-muted-foreground" />
 </Link>
 );
}

function ReadinessRow({ label, ready }: { label: string; ready: boolean }) {
 return (
 <div className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3.5 py-2.5">
 <span className="text-muted-foreground">{label}</span>
 <span className={`text-xs font-bold ${ready ? "text-green-dark" : "text-yellow-dark"}`}>{ready ? "Ready" : "Action needed"}</span>
 </div>
 );
}

function GlanceRow({ icon: Icon, label, value }: { icon: IconSvgElement; label: string; value: string }) {
 return (
 <div className="flex items-center gap-3 py-1.5 text-sm">
 <HugeiconsIcon icon={Icon} size={16} className="text-primary" />
 <span className="flex-1 text-muted-foreground">{label}</span>
 <b className="text-foreground">{value}</b>
 </div>
 );
}

function EmptyOrders() {
 return (
 <div className="mt-4 rounded-xl bg-muted p-7 text-center">
 <HugeiconsIcon icon={ShoppingBag01Icon} className="mx-auto text-primary" size={24} />
 <p className="mt-3 font-bold text-foreground">No orders yet</p>
 <p className="mt-1 text-sm text-muted-foreground">Your recent purchases will appear here.</p>
 <Link href="/shop-with-sidebar" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Start shopping</Link>
 </div>
 );
}

function Loading() {
 return <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Spinner size={16} />Loading…</p>;
}

function ErrorText() {
 return <p className="mt-4 text-sm text-destructive">We could not load this account information.</p>;
}
