"use client";


import { Spinner } from "@/components/ui/Spinner";
import { cartApi, ordersApi } from "@/lib/api/endpoints/commerce";
import { notificationsApi, type NotificationSummary } from "@/lib/api/endpoints/notifications";
import { usersApi } from "@/lib/api/endpoints/users";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Cart, CustomerEscrowSummary, Order, PaginatedOrders } from "@/types/api/commerce";
import type { WishlistProductListResponse } from "@/types/api/discovery";
import type { Address, User } from "@/types/api/user";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { AlertCircleIcon, BellIcon, CheckmarkCircle02Icon, ArrowRight01Icon, Clock01Icon, CreditCardIcon, FavouriteIcon, Loading03Icon, Location01Icon, PackageIcon, RefreshCwIcon, ShieldCheckIcon, ShoppingBag01Icon, ShoppingCart01Icon, TruckIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import OnboardingTour, { useTour } from "@/components/Common/Info/OnboardingTour";

const BUYER_TOUR_STEPS = [
 { title: "Welcome to your dashboard", body: "This is your home base · recent orders, saved items and anything that needs your attention appear here." },
 { title: "Shop products", body: "Browse the marketplace, compare sellers and add items to your cart. Checkout is protected by Xerin buyer protection." },
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
 
 const hasLoadError = [profile.state, addresses.state, orders.state, cart.state, wishlist.state, notifications.state].includes("error");
 const attentionCount = orderCounts.unpaid + protection.actionable + (notifications.data?.unread ?? 0);

 return (
 <div className="space-y-6">
 <section className="overflow-hidden rounded-xl bg-carbon text-white">
 <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">My Xerin Market</p>
 <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
 {profile.state === "ready" && first ? `Welcome back, ${first}` : profile.state === "error" ? "Customer Dashboard" : "Loading your account..."}
 </h1>
 <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
 See what needs your attention, track active orders and manage everything you buy from one place.
 </p>
 </div>
 <div className="flex flex-wrap gap-2">
 <Link href="/shop-with-sidebar" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary-dark">
 Shop Products
 </Link>
 <Link href="/account/orders" className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-card/10">
 Track Orders
 </Link>
 </div>
 </div>
 </section>
 <section className="rounded-xl border border-border bg-card p-5 dark:border-border">
 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <p className="text-sm font-bold text-foreground">Needs your attention</p>
 <p className="mt-1 text-xs text-muted-foreground">Important actions are shown here so you do not have to search through the account menu.</p>
 </div>
 <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary dark:bg-primary-400/10 dark:text-primary-300">
 {protection.loading || orders.state === "loading" || notifications.state === "loading" ? "Checking..." : `${attentionCount} action${attentionCount === 1 ? "" : "s"}`}
 </span>
 </div>
 <div className="mt-4 grid gap-3 md:grid-cols-3">
 <AttentionCard
 icon={CreditCardIcon}
 label="Payment required"
 value={orders.state === "loading" ? "…" : String(orderCounts.unpaid)}
 helper={orderCounts.unpaid ? "Complete payment to keep your order moving." : "No unpaid orders."}
 href="/account/orders"
 />
 <AttentionCard
 icon={ShieldCheckIcon}
 label="Delivery protection"
 value={protection.loading ? "…" : String(protection.actionable)}
 helper={protection.disputed ? `${protection.disputed} protection case${protection.disputed === 1 ? "" : "s"} under review.` : protection.actionable ? "Confirm satisfaction or report a problem." : "No protection action required."}
 href="/account/orders"
 />
 <AttentionCard
 icon={BellIcon}
 label="Unread notifications"
 value={notifications.state === "loading" ? "…" : notifications.state === "error" ? "—" : String(notifications.data?.unread ?? 0)}
 helper="Order and delivery updates appear here."
 href="/account/notifications"
 />
 </div>
 </section>

 <section>
 <div className="mb-3 flex items-end justify-between">
 <div>
 <h2 className="text-lg font-bold text-foreground">Your order journey</h2>
 <p className="mt-1 text-xs text-muted-foreground">A quick view of where your purchases are right now.</p>
 </div>
 <Link href="/account/orders" className="text-xs font-bold text-primary">View all orders</Link>
 </div>
 <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
 <JourneyCard icon={CreditCardIcon} label="Awaiting payment" value={orderCounts.unpaid} />
 <JourneyCard icon={Clock01Icon} label="Being prepared" value={orderCounts.preparing} />
 <JourneyCard icon={TruckIcon} label="On the way" value={orderCounts.transit} />
 <JourneyCard icon={CheckmarkCircle02Icon} label="Delivered" value={orderCounts.delivered} />
 </div>
 </section>

 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <Stat icon={PackageIcon} label="All Orders" value={orders.state === "loading" ? "…" : orders.state === "error" ? "—" : String(orders.data?.total ?? 0)} href="/account/orders" helper="View your order history" />
 <Stat icon={FavouriteIcon} label="Wishlist" value={wishlist.state === "loading" ? "…" : wishlist.state === "error" ? "—" : String(wishlist.data?.total ?? 0)} href="/wishlist" helper={wishlist.state === "ready" && !wishlist.data?.total ? "Save products for later" : "View saved products"} />
 <Stat icon={ShoppingCart01Icon} label="Cart Items" value={cart.state === "loading" ? "…" : cart.state === "error" ? "—" : String(cartCount)} href={cartCount ? "/cart" : "/shop-with-sidebar"} helper={cart.state === "ready" && cartCount ? formatCurrency(Number(cart.data?.total ?? 0)) : "Continue shopping"} />
 <Stat icon={Location01Icon} label="Addresses" value={addresses.state === "loading" ? "…" : addresses.state === "error" ? "—" : String(addresses.data.length)} href="/account/addresses" helper={addresses.state === "ready" && !addresses.data.length ? "Add a delivery address" : "Manage delivery addresses"} />
 </div>

 {hasLoadError && (
 <div className="flex flex-col gap-3 rounded-xl border border-red-light-4 bg-red-light-6 p-4 text-sm text-red-dark sm:flex-row sm:items-center sm:justify-between">
 <span className="flex items-center gap-2"><HugeiconsIcon icon={AlertCircleIcon} size={18} />Some account information could not be loaded.</span>
 <button onClick={() => void load()} className="flex items-center gap-2 font-semibold"><HugeiconsIcon icon={RefreshCwIcon} size={16} />Retry</button>
 </div>
 )}

 <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
 <Card title="Recent orders" action={<Link href="/account/orders" className="text-xs font-bold text-primary">View all</Link>}>
 {orders.state === "loading" ? <Loading /> : orders.state === "error" ? <ErrorText /> : !orders.data?.results.length ? (
 <EmptyOrders />
 ) : (
 <ul className="space-y-3">
 {orders.data.results.slice(0, 5).map((order) => (
 <li key={order.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between dark:border-border">
 <div className="min-w-0">
 <p className="font-semibold text-foreground">Order #{order.order_number || order.id.slice(0, 8)}</p>
 <p className="mt-1 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()} · <span className="capitalize">{order.status.replaceAll("_"," ")}</span></p>
 </div>
 <div className="flex items-center justify-between gap-4 sm:justify-end">
 <p className="font-bold text-foreground">{formatCurrency(order.total, order.currency)}</p>
 <Link href={`/account/orders/${order.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-primary">Details <HugeiconsIcon icon={ArrowRight01Icon} size={14} /></Link>
 </div>
 </li>
 ))}
 </ul>
 )}
 </Card>

 <div className="space-y-6">
 <Card title="Quick actions">
 <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
 <Action href={cartCount ? "/cart" : "/shop-with-sidebar"} icon={ShoppingBag01Icon} label={cartCount ? "Continue Checkout" : "Browse Products"} />
 <Action href="/wishlist" icon={FavouriteIcon} label="View Wishlist" />
 <Action href="/account/addresses" icon={Location01Icon} label={addresses.data.length ? "Manage Addresses" : "Add Delivery Address"} />
 <Action href="/account/notifications" icon={BellIcon} label="View Notifications" />
 </div>
 </Card>

 <Card title="Account readiness">
 {profile.state === "loading" ? <Loading /> : profile.state === "error" ? <ErrorText /> : (
 <div className="space-y-3 text-sm">
 <ReadinessRow label="Email verified" ready={Boolean(profile.data?.is_verified)} />
 <ReadinessRow label="Delivery address added" ready={addresses.data.length > 0} />
 <ReadinessRow label="Default address selected" ready={Boolean(addresses.data.find((address) => address.is_default))} />
 <Link href="/account/details" className="mt-2 inline-flex items-center gap-1 font-bold text-primary">Review account details <HugeiconsIcon icon={ArrowRight01Icon} size={14} /></Link>
 </div>
 )}
 </Card>
 </div>
 </div>
 <OnboardingTour steps={BUYER_TOUR_STEPS} active={tour.active} onFinish={tour.finish} />
 </div>
 );
}

function AttentionCard({ icon: Icon, label, value, helper, href }: { icon: IconSvgElement; label: string; value: string; helper: string; href: string }) {
 return (
 <Link href={href} className="group rounded-xl border border-border bg-muted p-4 transition hover:border-[var(--primary)] dark:border-border dark:bg-card/[0.03]">
 <div className="flex items-start justify-between gap-3">
 <span className="rounded-lg bg-primary/10 p-2 text-primary dark:bg-primary-400/10"><HugeiconsIcon icon={Icon} size={18} /></span>
 <b className="text-2xl text-foreground">{value}</b>
 </div>
 <p className="mt-3 text-sm font-bold text-foreground">{label}</p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
 </Link>
 );
}

function JourneyCard({ icon: Icon, label, value }: { icon: IconSvgElement; label: string; value: number }) {
 return (
 <div className="rounded-xl border border-border bg-card p-4 dark:border-border">
 <div className="flex items-center justify-between"><span className="rounded-xl bg-primary/10 p-2 text-primary dark:bg-primary-400/10"><HugeiconsIcon icon={Icon} size={18} /></span><b className="text-xl text-foreground">{value}</b></div>
 <p className="mt-3 text-sm font-semibold text-muted-foreground /70">{label}</p>
 </div>
 );
}

function Stat({ icon: Icon, label, value, href, helper }: { icon: IconSvgElement; label: string; value: string; href: string; helper: string }) {
 return (
 <Link href={href} className="rounded-xl border border-border bg-card p-5 transition hover:border-[var(--primary)] dark:border-border">
 <div className="flex items-center justify-between"><span className="rounded-xl bg-primary/10 p-2 text-primary dark:bg-primary-400/10"><HugeiconsIcon icon={Icon} size={18} /></span><b className="text-xl text-foreground">{value}</b></div>
 <p className="mt-4 text-sm font-semibold text-foreground">{label}</p>
 <small className="text-muted-foreground">{helper}</small>
 </Link>
 );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
 return (
 <section className="rounded-xl border border-border bg-card p-5 dark:border-border">
 <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-foreground">{title}</h2>{action}</div>
 {children}
 </section>
 );
}

function Action({ href, icon: Icon, label }: { href: string; icon: IconSvgElement; label: string }) {
 return (
 <Link href={href} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm font-semibold text-foreground transition hover:border-[var(--primary)] dark:border-border">
 <span className="flex items-center gap-3"><HugeiconsIcon icon={Icon} size={18} className="text-primary" />{label}</span><HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-muted-foreground" />
 </Link>
 );
}

function ReadinessRow({ label, ready }: { label: string; ready: boolean }) {
 return (
 <div className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2.5 dark:bg-card/[0.04]">
 <span className="text-muted-foreground /70">{label}</span>
 <span className={`text-xs font-bold ${ready ? "text-green-dark" : "text-yellow-dark"}`}>{ready ? "Ready" : "Action needed"}</span>
 </div>
 );
}
 
function EmptyOrders() {
 return (
 <div className="rounded-xl border border-dashed border-[var(--muted-foreground)] p-7 text-center dark:border-border">
 <HugeiconsIcon icon={ShoppingBag01Icon} className="mx-auto text-primary" size={24} />
 <p className="mt-3 font-bold text-foreground">No orders yet</p>
 <p className="mt-1 text-sm text-muted-foreground">Your recent purchases will appear here.</p>
 <Link href="/shop-with-sidebar" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Start shopping</Link>
 </div>
 );
}

function Loading() {
 return <p className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner size={16} />Loading account...</p>;
}

function ErrorText() {
 return <p className="text-sm text-destructive">We could not load this account information.</p>;
}


