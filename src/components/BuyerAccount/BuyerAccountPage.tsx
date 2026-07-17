"use client";
import { formatCurrency } from "@/lib/formatCurrency";
import { ordersApi } from "@/lib/api/endpoints/commerce";
import { usersApi } from "@/lib/api/endpoints/users";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import type { Address, User } from "@/types/api/user";
import type { Order } from "@/types/api/commerce";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CreditCard,
  Heart,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Load<T> = { state: "loading" | "ready" | "error"; data: T };
export default function BuyerDashboard() {
  const cart = useCartStore((s) => s.items),
    wishlist = useWishlistStore((s) => s.items);
  const [profile, setProfile] = useState<Load<User | null>>({
    state: "loading",
    data: null,
  });
  const [addresses, setAddresses] = useState<Load<Address[]>>({
    state: "loading",
    data: [],
  });
  const [orders, setOrders] = useState<Load<Order[]>>({
    state: "loading",
    data: [],
  });
  async function load() {
    setProfile((v) => ({ ...v, state: "loading" }));
    setAddresses((v) => ({ ...v, state: "loading" }));
    setOrders((v) => ({ ...v, state: "loading" }));
    await Promise.allSettled([
      usersApi
        .getMe()
        .then((data) => setProfile({ state: "ready", data }))
        .catch(() => setProfile({ state: "error", data: null })),
      usersApi
        .getAddresses()
        .then((data) => setAddresses({ state: "ready", data }))
        .catch(() => setAddresses({ state: "error", data: [] })),
      ordersApi
        .mine()
        .then((r) => setOrders({ state: "ready", data: r.results }))
        .catch(() => setOrders({ state: "error", data: [] })),
    ]);
  }
  useEffect(() => {
    void load();
  }, []);
  const first = profile.data?.first_name || "there";
  const cartCount = cart.reduce((n, i) => n + i.quantity, 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-[#2d3134] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-white/60">Buyer account</p>
          <h1 className="mt-1 text-2xl font-bold">Welcome back, {first}</h1>
          <p className="mt-2 text-sm text-white/70">
            Manage your orders, addresses, payments and saved products.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/shop-with-sidebar"
            className="rounded-xl bg-[#f7941d] px-4 py-2.5 text-sm font-semibold"
          >
            Shop Products
          </Link>
          <Link
            href="/account/orders"
            className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold"
          >
            View Orders
          </Link>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={CheckCircle2}
          label="Account Status"
          value={
            profile.state === "loading"
              ? "Loading..."
              : profile.state === "error"
                ? "Unable to load"
                : title(profile.data?.status || "Unknown")
          }
          href="/account/details"
          helper={
            profile.data?.is_verified
              ? "Email verified"
              : "Verification required"
          }
        />
        <Stat
          icon={ShoppingCart}
          label="Cart Items"
          value={String(cartCount)}
          href={cartCount ? "/cart" : "/shop-with-sidebar"}
          helper={
            cartCount
              ? formatCurrency(
                  cart.reduce((n, i) => n + i.discountedPrice * i.quantity, 0),
                )
              : "Browse products"
          }
        />
        <Stat
          icon={Heart}
          label="Wishlist"
          value={String(wishlist.length)}
          href="/wishlist"
          helper={wishlist.length ? "Saved products" : "No saved products"}
        />
        <Stat
          icon={Package}
          label="Orders"
          value={
            orders.state === "loading"
              ? "Loading..."
              : orders.state === "error"
                ? "Unable to load"
                : String(orders.data.length)
          }
          href="/account/orders"
          helper={
            orders.state === "ready" && !orders.data.length
              ? "No orders yet"
              : "View order history"
          }
        />
        <Stat
          icon={MapPin}
          label="Addresses"
          value={
            addresses.state === "loading"
              ? "Loading..."
              : addresses.state === "error"
                ? "Unable to load"
                : String(addresses.data.length)
          }
          href="/account/addresses"
          helper={
            addresses.state === "ready" && !addresses.data.length
              ? "Add delivery address"
              : "Manage addresses"
          }
        />
        <Stat
          icon={CreditCard}
          label="Payments"
          value="View"
          href="/account/payments"
          helper="Open payment history"
        />
        <Stat
          icon={Bell}
          label="Notifications"
          value="—"
          href="/account/notifications"
          helper="Notification API unavailable"
        />
      </div>
      {(profile.state === "error" ||
        addresses.state === "error" ||
        orders.state === "error") && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle size={18} />
            Some account information could not be loaded.
          </span>
          <button
            onClick={() => void load()}
            className="flex items-center gap-2 font-semibold"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Quick Actions">
          <div className="grid gap-3 sm:grid-cols-2">
            <Action
              href={cartCount ? "/cart" : "/shop-with-sidebar"}
              icon={ShoppingBag}
              label={cartCount ? "View Cart" : "Browse Products"}
            />
            <Action href="/account/orders" icon={Package} label="View Orders" />
            <Action
              href="/account/addresses"
              icon={MapPin}
              label={
                addresses.data.length
                  ? "Manage Addresses"
                  : "Add Delivery Address"
              }
            />
            <Action href="/wishlist" icon={Heart} label="Saved Products" />
          </div>
        </Card>
        <Card title="Account Summary">
          {profile.state === "loading" ? (
            <Loading />
          ) : profile.state === "error" ? (
            <ErrorText />
          ) : (
            <dl className="space-y-3 text-sm">
              <Row
                label="Full name"
                value={
                  `${profile.data?.first_name || ""} ${profile.data?.last_name || ""}`.trim() ||
                  "Not provided"
                }
              />
              <Row
                label="Email"
                value={profile.data?.email || "Not provided"}
              />
              <Row
                label="Phone"
                value={profile.data?.phone || "Not provided"}
              />
              <Row
                label="Email verification"
                value={profile.data?.is_verified ? "Verified" : "Not verified"}
              />
              <Row
                label="Phone verification"
                value={profile.data?.phone ? "Phone provided" : "Not verified"}
              />
              <Row
                label="Default address"
                value={
                  addresses.data.find((a) => a.is_default)?.street ||
                  "Not configured"
                }
              />
            </dl>
          )}
          <Link
            href="/account/details"
            className="mt-5 inline-block text-sm font-semibold text-[#f7941d]"
          >
            Edit Account Details
          </Link>
        </Card>
      </div>
    </div>
  );
}
function title(v: string) {
  return v
    .split("_")
    .map((x) => x[0]?.toUpperCase() + x.slice(1))
    .join(" ");
}
function Stat({
  icon: Icon,
  label,
  value,
  href,
  helper,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  href: string;
  helper: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#f7941d] dark:border-white/10 dark:bg-darkTheme-card"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-xl bg-orange-50 p-2 text-[#f7941d] dark:bg-orange-400/10">
          <Icon size={19} />
        </span>
        <b className="text-xl">{value}</b>
      </div>
      <p className="mt-4 text-sm font-semibold">{label}</p>
      <small className="text-[#64748b]">{helper}</small>
    </Link>
  );
}
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-darkTheme-card">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}
function Action({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Package;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-[#e2e8f0] p-3 text-sm font-semibold hover:border-[#f7941d] dark:border-white/10"
    >
      <Icon size={18} className="text-[#f7941d]" />
      {label}
    </Link>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#e2e8f0] pb-2 dark:border-white/10">
      <dt className="text-[#64748b]">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
function Loading() {
  return (
    <p className="flex items-center gap-2 text-sm text-[#64748b]">
      <Loader2 size={16} className="animate-spin" />
      Loading account...
    </p>
  );
}
function ErrorText() {
  return (
    <p className="text-sm text-red-600">
      We could not load your account information.
    </p>
  );
}
