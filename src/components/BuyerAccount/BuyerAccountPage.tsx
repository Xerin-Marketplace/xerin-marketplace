"use client";

import { cartApi, ordersApi } from "@/lib/api/endpoints/commerce";
import { notificationsApi, type NotificationSummary } from "@/lib/api/endpoints/notifications";
import { usersApi } from "@/lib/api/endpoints/users";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Cart, CustomerEscrowSummary, Order, PaginatedOrders } from "@/types/api/commerce";
import type { WishlistProductListResponse } from "@/types/api/discovery";
import type { Address, User } from "@/types/api/user";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Heart,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
      <section className="overflow-hidden rounded-3xl bg-[#202326] text-white shadow-sm">
        <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7941d]">My Xerin Market</p>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              {profile.state === "ready" && first ? `Welcome back, ${first}` : profile.state === "error" ? "Customer Dashboard" : "Loading your account..."}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              See what needs your attention, track active orders and manage everything you buy from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/shop-with-sidebar" className="rounded-xl bg-[#f7941d] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#ffab43]">
              Shop Products
            </Link>
            <Link href="/account/orders" className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10">
              Track Orders
            </Link>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-darkTheme-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#111827] dark:text-white">Needs your attention</p>
            <p className="mt-1 text-xs text-[#64748b]">Important actions are shown here so you do not have to search through the account menu.</p>
          </div>
          <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#b85d00] dark:bg-orange-400/10 dark:text-orange-300">
            {protection.loading || orders.state === "loading" || notifications.state === "loading" ? "Checking..." : `${attentionCount} action${attentionCount === 1 ? "" : "s"}`}
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <AttentionCard
            icon={CreditCard}
            label="Payment required"
            value={orders.state === "loading" ? "…" : String(orderCounts.unpaid)}
            helper={orderCounts.unpaid ? "Complete payment to keep your order moving." : "No unpaid orders."}
            href="/account/orders"
          />
          <AttentionCard
            icon={ShieldCheck}
            label="Delivery protection"
            value={protection.loading ? "…" : String(protection.actionable)}
            helper={protection.disputed ? `${protection.disputed} protection case${protection.disputed === 1 ? "" : "s"} under review.` : protection.actionable ? "Confirm satisfaction or report a problem." : "No protection action required."}
            href="/account/orders"
          />
          <AttentionCard
            icon={Bell}
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
            <h2 className="text-lg font-bold text-[#111827] dark:text-white">Your order journey</h2>
            <p className="mt-1 text-xs text-[#64748b]">A quick view of where your purchases are right now.</p>
          </div>
          <Link href="/account/orders" className="text-xs font-bold text-[#f7941d]">View all orders</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <JourneyCard icon={CreditCard} label="Awaiting payment" value={orderCounts.unpaid} />
          <JourneyCard icon={Clock3} label="Being prepared" value={orderCounts.preparing} />
          <JourneyCard icon={Truck} label="On the way" value={orderCounts.transit} />
          <JourneyCard icon={CheckCircle2} label="Delivered" value={orderCounts.delivered} />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Package} label="All Orders" value={orders.state === "loading" ? "…" : orders.state === "error" ? "—" : String(orders.data?.total ?? 0)} href="/account/orders" helper="View your order history" />
        <Stat icon={Heart} label="Wishlist" value={wishlist.state === "loading" ? "…" : wishlist.state === "error" ? "—" : String(wishlist.data?.total ?? 0)} href="/wishlist" helper={wishlist.state === "ready" && !wishlist.data?.total ? "Save products for later" : "View saved products"} />
        <Stat icon={ShoppingCart} label="Cart Items" value={cart.state === "loading" ? "…" : cart.state === "error" ? "—" : String(cartCount)} href={cartCount ? "/cart" : "/shop-with-sidebar"} helper={cart.state === "ready" && cartCount ? formatCurrency(Number(cart.data?.total ?? 0)) : "Continue shopping"} />
        <Stat icon={MapPin} label="Addresses" value={addresses.state === "loading" ? "…" : addresses.state === "error" ? "—" : String(addresses.data.length)} href="/account/addresses" helper={addresses.state === "ready" && !addresses.data.length ? "Add a delivery address" : "Manage delivery addresses"} />
      </div>

      {hasLoadError && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2"><AlertCircle size={18} />Some account information could not be loaded.</span>
          <button onClick={() => void load()} className="flex items-center gap-2 font-semibold"><RefreshCw size={16} />Retry</button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Card title="Recent orders" action={<Link href="/account/orders" className="text-xs font-bold text-[#f7941d]">View all</Link>}>
          {orders.state === "loading" ? <Loading /> : orders.state === "error" ? <ErrorText /> : !orders.data?.results.length ? (
            <EmptyOrders />
          ) : (
            <ul className="space-y-3">
              {orders.data.results.slice(0, 5).map((order) => (
                <li key={order.id} className="flex flex-col gap-3 rounded-xl border border-[#e2e8f0] p-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#111827] dark:text-white">Order #{order.order_number || order.id.slice(0, 8)}</p>
                    <p className="mt-1 text-xs text-[#64748b]">{new Date(order.created_at).toLocaleDateString()} · <span className="capitalize">{order.status.replaceAll("_", " ")}</span></p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="font-bold text-[#111827] dark:text-white">{formatCurrency(order.total, order.currency)}</p>
                    <Link href={`/account/orders/${order.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#f7941d]">Details <ChevronRight size={14} /></Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

       <div className="space-y-6">
          <Card title="Quick actions">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Action href={cartCount ? "/cart" : "/shop-with-sidebar"} icon={ShoppingBag} label={cartCount ? "Continue Checkout" : "Browse Products"} />
              <Action href="/wishlist" icon={Heart} label="View Wishlist" />
              <Action href="/account/addresses" icon={MapPin} label={addresses.data.length ? "Manage Addresses" : "Add Delivery Address"} />
              <Action href="/account/notifications" icon={Bell} label="View Notifications" />
            </div>
          </Card>

          <Card title="Account readiness">
            {profile.state === "loading" ? <Loading /> : profile.state === "error" ? <ErrorText /> : (
              <div className="space-y-3 text-sm">
                <ReadinessRow label="Email verified" ready={Boolean(profile.data?.is_verified)} />
                <ReadinessRow label="Delivery address added" ready={addresses.data.length > 0} />
                <ReadinessRow label="Default address selected" ready={Boolean(addresses.data.find((address) => address.is_default))} />
                <Link href="/account/details" className="mt-2 inline-flex items-center gap-1 font-bold text-[#f7941d]">Review account details <ChevronRight size={14} /></Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function AttentionCard({ icon: Icon, label, value, helper, href }: { icon: typeof Package; label: string; value: string; helper: string; href: string }) {
  return (
    <Link href={href} className="group rounded-xl border border-[#e2e8f0] bg-[#fbfcfd] p-4 transition hover:border-[#f7941d] hover:bg-orange-50/30 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-lg bg-orange-50 p-2 text-[#f7941d] dark:bg-orange-400/10"><Icon size={18} /></span>
        <b className="text-2xl text-[#111827] dark:text-white">{value}</b>
      </div>
      <p className="mt-3 text-sm font-bold text-[#111827] dark:text-white">{label}</p>
      <p className="mt-1 text-xs leading-5 text-[#64748b]">{helper}</p>
    </Link>
  );
}

function JourneyCard({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-darkTheme-card">
      <div className="flex items-center justify-between"><span className="rounded-xl bg-orange-50 p-2 text-[#f7941d] dark:bg-orange-400/10"><Icon size={18} /></span><b className="text-xl text-[#111827] dark:text-white">{value}</b></div>
      <p className="mt-3 text-sm font-semibold text-[#475569] dark:text-white/70">{label}</p>
    </div>
  );
}

function Stat({ icon: Icon, label, value, href, helper }: { icon: typeof Package; label: string; value: string; href: string; helper: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#f7941d] dark:border-white/10 dark:bg-darkTheme-card">
      <div className="flex items-center justify-between"><span className="rounded-xl bg-orange-50 p-2 text-[#f7941d] dark:bg-orange-400/10"><Icon size={19} /></span><b className="text-xl text-[#111827] dark:text-white">{value}</b></div>
      <p className="mt-4 text-sm font-semibold text-[#111827] dark:text-white">{label}</p>
      <small className="text-[#64748b]">{helper}</small>
    </Link>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-darkTheme-card">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-[#111827] dark:text-white">{title}</h2>{action}</div>
      {children}
    </section>
  );
}

function Action({ href, icon: Icon, label }: { href: string; icon: typeof Package; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 rounded-xl border border-[#e2e8f0] p-3 text-sm font-semibold text-[#111827] transition hover:border-[#f7941d] hover:bg-orange-50/30 dark:border-white/10 dark:text-white">
      <span className="flex items-center gap-3"><Icon size={18} className="text-[#f7941d]" />{label}</span><ChevronRight size={16} className="text-[#94a3b8]" />
    </Link>
  );
}

function ReadinessRow({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f8fafc] px-3 py-2.5 dark:bg-white/[0.04]">
      <span className="text-[#475569] dark:text-white/70">{label}</span>
      <span className={`text-xs font-bold ${ready ? "text-emerald-600" : "text-amber-600"}`}>{ready ? "Ready" : "Action needed"}</span>
    </div>
  );
}
 
function EmptyOrders() {
  return (
    <div className="rounded-xl border border-dashed border-[#cbd5e1] p-7 text-center dark:border-white/10">
      <ShoppingBag className="mx-auto text-[#f7941d]" size={26} />
      <p className="mt-3 font-bold text-[#111827] dark:text-white">No orders yet</p>
      <p className="mt-1 text-sm text-[#64748b]">Your recent purchases will appear here.</p>
      <Link href="/shop-with-sidebar" className="mt-4 inline-flex rounded-xl bg-[#f7941d] px-4 py-2 text-sm font-bold text-black">Start shopping</Link>
    </div>
  );
}

function Loading() {
  return <p className="flex items-center gap-2 text-sm text-[#64748b]"><Loader2 size={16} className="animate-spin" />Loading account...</p>;
}

function ErrorText() {
  return <p className="text-sm text-red-600">We could not load this account information.</p>;
}


