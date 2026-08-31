"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  ImageIcon,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  Clock3,
} from "lucide-react";
import toast from "react-hot-toast";

import { sellerOrdersApi } from "@/lib/api/endpoints/seller-orders";
import { getMyProductImages } from "@/lib/api/endpoints/products";
import type {
  SellerOrder,
  SellerOrderStatus,
  SellerOrderSummary,
} from "@/types/api/seller-order";

const statuses = [
  "",
  "new",
  "accepted",
  "processing",
  "ready_to_ship",
  "shipped",
  "delivered",
  "cancellation_requested",
  "cancelled",
] as const;

const pretty = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const money = (value: number | string, currency = "TZS") =>
  new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function SellerOrders() {
  const [rows, setRows] = useState<SellerOrder[]>([]);
  const [summary, setSummary] = useState<SellerOrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [productImages, setProductImages] = useState<Record<string, string>>({});

  const loadProductImages = async (orders: SellerOrder[]) => {
    const ids = Array.from(
      new Set(orders.flatMap((order) => order.items.map((item) => item.product_id))),
    );

    if (!ids.length) return;

    const entries = await Promise.all(
      ids.map(async (productId) => {
        try {
          const images = await getMyProductImages(productId);
          const primary = images.find((image) => image.is_primary) || images[0];
          return [productId, primary?.thumbnail_url || primary?.image_url || ""] as const;
        } catch {
          return [productId, ""] as const;
        }
      }),
    );

    setProductImages((current) => ({ ...current, ...Object.fromEntries(entries) }));
  };

  const load = async () => {
    setLoading(true);
    try {
      const [orders, orderSummary] = await Promise.all([
        sellerOrdersApi.list({
          page,
          page_size: size,
          search: search.trim() || undefined,
          status: (status || undefined) as SellerOrderStatus | undefined,
        }),
        sellerOrdersApi.summary(),
      ]);

      setRows(orders.results);
      setTotal(orders.total);
      setSummary(orderSummary);
      void loadProductImages(orders.results);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Unable to load seller orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [page, size, search, status]);

  const pages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#e7ebf0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#f7941d]">
                <ClipboardList size={21} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#f7941d]">Seller Center</p>
                <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Orders & Fulfilment</h1>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              Review exactly what the customer paid for, accept the order, prepare the correct products and move the package into logistics pickup.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh orders
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card icon={ClipboardList} label="Total orders" value={summary?.total_orders || 0} />
          <Card icon={Clock3} label="New orders" value={summary?.new_orders || 0} />
          <Card icon={PackageCheck} label="Ready to ship" value={summary?.ready_to_ship_orders || 0} />
          <Card icon={Truck} label="Gross sales" value={money(summary?.gross_sales || 0)} />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e7ebf0] bg-white shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between dark:border-white/10">
          <div>
            <h2 className="font-bold text-slate-950 dark:text-white">Customer Orders</h2>
            <p className="mt-1 text-xs text-slate-400">Paid products are shown with their product image so you can verify the item before packaging.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <Search size={15} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search order..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-orange-300 sm:w-64 dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-300 dark:border-white/10 dark:bg-white/5"
            >
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {value ? pretty(value) : "All statuses"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-14 text-center text-slate-500">
            <RefreshCw className="mx-auto animate-spin" />
            <p className="mt-2">Loading orders...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-sm">
              <thead className="bg-slate-50 text-left text-[10px] uppercase tracking-wider text-slate-400 dark:bg-white/5">
                <tr>
                  {[
                    "Order",
                    "Product paid for",
                    "Customer",
                    "Seller total",
                    "Payment",
                    "Delivery",
                    "Fulfilment",
                    "Action",
                  ].map((label) => (
                    <th key={label} className="px-5 py-3">{label}</th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {rows.map((order) => {
                  const firstItem = order.items[0];
                  const extraItems = Math.max(0, order.items.length - 1);
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.025]">
                      <td className="px-5 py-4 align-middle">
                        <b className="text-slate-950 dark:text-white">#{order.order_id.slice(0, 8).toUpperCase()}</b>
                        <p className="mt-1 text-xs text-slate-400">{new Date(order.created_at).toLocaleString()}</p>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        {firstItem ? (
                          <div className="flex min-w-[280px] items-center gap-3">
                            <ProductThumb
                              src={productImages[firstItem.product_id]}
                              alt={firstItem.product_name}
                            />
                            <div className="min-w-0">
                              <p className="max-w-[230px] truncate font-bold text-slate-900 dark:text-white">{firstItem.product_name}</p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {firstItem.variant_name || "Standard"} · Qty {firstItem.quantity}
                              </p>
                              {extraItems > 0 && (
                                <p className="mt-1 text-[11px] font-semibold text-orange-600">+{extraItems} more product{extraItems === 1 ? "" : "s"}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">No item details</span>
                        )}
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <b className="text-slate-900 dark:text-white">{order.customer_name}</b>
                        <p className="mt-1 text-xs text-slate-400">{order.customer_phone || "No phone"}</p>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <p className="font-bold text-slate-950 dark:text-white">{money(order.seller_subtotal, order.currency)}</p>
                        <p className="mt-1 text-xs text-slate-400">{order.item_count} unit{order.item_count === 1 ? "" : "s"}</p>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <PaymentBadge status={order.order_status} />
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <p className="font-medium text-slate-700 dark:text-white/75">{order.shipping_method_name || "Delivery"}</p>
                        <p className="mt-1 text-xs text-slate-400">{order.shipping_carrier || "Carrier pending"}</p>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <Badge status={order.seller_status} />
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <Link
                          href={`/seller/orders/${order.id}`}
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#f7941d] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e98512]"
                        >
                          <Eye size={14} />
                          Review & prepare
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {!rows.length && (
                  <tr>
                    <td colSpan={8} className="p-14 text-center text-slate-400">
                      <ShoppingBag size={30} className="mx-auto mb-3 text-slate-300" />
                      No seller orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <span className="text-sm text-slate-500">{total} orders · Page {page} of {pages}</span>
          <div className="flex gap-2">
            <select
              value={size}
              onChange={(event) => {
                setSize(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-white/5"
            >
              {[10, 20, 50, 100].map((value) => <option key={value}>{value}</option>)}
            </select>
            <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 dark:border-white/10">
              <ChevronLeft />
            </button>
            <button disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="rounded-xl border border-slate-200 p-2 disabled:opacity-40 dark:border-white/10">
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductThumb({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
      {src && !failed ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <ImageIcon size={22} className="text-slate-300" />
      )}
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const paid = ["paid", "processing", "shipped", "delivered"].includes(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${paid ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
      {paid ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
      {paid ? "Payment confirmed" : pretty(status)}
    </span>
  );
}

function Card({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[.03]">
      <div className="flex justify-between">
        <div>
          <p className="text-xl font-bold text-slate-950 dark:text-white">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
        <Icon className="text-[#f7941d]" size={19} />
      </div>
    </div>
  );
}

export function Badge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase text-orange-700">
      {pretty(status)}
    </span>
  );
}
