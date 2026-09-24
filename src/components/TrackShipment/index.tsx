"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { PackageSearchIcon, Search01Icon, TruckIcon } from "@hugeicons/core-free-icons";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Spinner } from "@/components/ui/Spinner";
import { ordersApi } from "@/lib/api/endpoints/commerce";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAuthStore } from "@/store/useAuthStore";
import type { Order } from "@/types/api/commerce";

const statusLabel = (status?: string | null) =>
 (status || "pending").replaceAll("_", " ");

const OrderRow = ({ order }: { order: Order }) => (
 <Link
 href={`/account/orders/${order.id}`}
 className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary dark:border-border"
 >
 <div className="min-w-0">
 <p className="truncate text-sm font-bold text-foreground">
 {order.order_number || `Order ${order.id}`}
 </p>
 <p className="mt-0.5 text-xs text-muted-foreground">
 {order.created_at
 ? new Date(order.created_at).toLocaleDateString()
 : ""}{" "}
 · {formatCurrency(Number(order.total || 0), order.currency)}
 </p>
 </div>
 <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
 <HugeiconsIcon icon={TruckIcon} size={12} />
 {statusLabel(order.status)}
 </span>
 </Link>
);

const TrackShipment = () => {
 const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
 const hasHydrated = useAuthStore((state) => state.hasHydrated);
 const [input, setInput] = useState("");
 const [term, setTerm] = useState("");

 const orders = useQuery({
 queryKey: ["track-shipment", term],
 queryFn: ({ signal }) =>
 ordersApi.mine(
 term
 ? { search: term, page: 1, page_size: 10 }
 : { page: 1, page_size: 5 },
 signal,
 ),
 enabled: isAuthenticated,
 });

 const submit = (event: FormEvent) => {
 event.preventDefault();
 setTerm(input.trim());
 };

 return (
 <>
 <Breadcrumb title="Track Shipment" pages={["track"]} />
 <section className="bg-muted py-12 sm:py-16">
 <div className="mx-auto max-w-[760px] px-4 sm:px-8">
 <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-border sm:p-8">
 <div className="flex items-start gap-3">
 <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <HugeiconsIcon icon={PackageSearchIcon} size={20} />
 </span>
 <div>
 <h1 className="text-xl font-bold text-foreground sm:text-2xl">
 Track your shipment
 </h1>
 <p className="mt-1 text-sm leading-6 text-muted-foreground">
 Find your order and open its live delivery tracking.
 </p>
 </div>
 </div>

 {!hasHydrated ? (
 <div className="py-10 text-center">
 <Spinner className="mx-auto" />
 </div>
 ) : !isAuthenticated ? (
 <div className="mt-6 rounded-xl border border-yellow-light-2 bg-yellow-light-4 p-5 text-sm leading-6 text-yellow-dark-2">
 <p>
 Sign in to track your shipment. Your orders and delivery
 tracking are linked to your Xerin account.
 </p>
 <Link
 href="/signin?redirect=/track"
 className="mt-4 inline-block rounded-xl bg-orange px-5 py-2.5 font-semibold text-white hover:bg-primary/90-dark"
 >
 Sign in to track
 </Link>
 </div>
 ) : (
 <>
 <form onSubmit={submit} className="mt-6 flex gap-2">
 <input
 value={input}
 onChange={(event) => setInput(event.target.value)}
 placeholder="Enter order number or product name..."
 className="h-12 min-w-0 flex-1 rounded-xl border border-border px-4 text-sm outline-none focus:border-primary dark:border-border dark:bg-muted"
 />
 <button
 type="submit"
 className="inline-flex h-12 items-center gap-2 rounded-xl bg-orange px-5 text-sm font-semibold text-white hover:bg-primary/90-dark"
 >
 <HugeiconsIcon icon={Search01Icon} size={16} /> Find
 </button>
 </form>

 <div className="mt-6 space-y-3">
 {orders.isLoading ? (
 <div className="py-8 text-center">
 <Spinner className="mx-auto" />
 <p className="mt-2 text-sm text-muted-foreground">
 Finding your orders...
 </p>
 </div>
 ) : orders.error ? (
 <div className="rounded-xl border border-red-light-4 bg-red-light-6 p-4 text-sm text-red-dark">
 Your orders could not be loaded.{" "}
 <button
 type="button"
 onClick={() => void orders.refetch()}
 className="font-semibold underline"
 >
 Retry
 </button>
 </div>
 ) : orders.data?.results.length ? (
 <>
 <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
 {term
 ? `Orders matching "${term}"`
 : "Your recent orders"}
 </p>
 {orders.data.results.map((order) => (
 <OrderRow key={order.id} order={order} />
 ))}
 </>
 ) : (
 <div className="rounded-xl border border-border bg-muted p-6 text-center text-sm text-muted-foreground dark:border-border dark:bg-muted">
 {term
 ? `No orders matched "${term}". Check the order number and try again.`
 : "You have no orders yet."}
 </div>
 )}
 </div>

 <p className="mt-5 text-center text-xs text-muted-foreground">
 You can also review every order from{" "}
 <Link
 href="/account/orders"
 className="font-semibold text-primary"
 >
 My Orders
 </Link>
 .
 </p>
 </>
 )}
 </div>
 </div>
 </section>
 </>
 );
};

export default TrackShipment;
