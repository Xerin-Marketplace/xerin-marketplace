"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  adminService,
  type AdminSellerOrder,
  type AdminSellerPerformance,
  type AdminSellerProduct,
} from "@/lib/api/endpoints/admin";

type View = "products" | "orders" | "performance";
type RecordRow = AdminSellerProduct | AdminSellerOrder | AdminSellerPerformance;

const config = {
  products: {
    title: "Seller Products",
    description: "Review catalog ownership, listing status and products requiring moderation.",
    steps: ["Seller submits listing", "Catalog validation", "Admin moderation", "Publish or return"],
  },
  orders: {
    title: "Seller Orders",
    description: "Follow seller fulfillment from allocation through dispatch and delivery.",
    steps: ["Order allocated", "Seller confirms", "Pack and dispatch", "Delivery completed"],
  },
  performance: {
    title: "Seller Performance",
    description: "Compare seller health using catalog, fulfillment, revenue and quality signals.",
    steps: ["Collect activity", "Calculate KPIs", "Flag exceptions", "Coach or enforce"],
  },
} as const;

const isProduct = (row: RecordRow): row is AdminSellerProduct => "sku" in row;
const isOrder = (row: RecordRow): row is AdminSellerOrder => "order_number" in row;
const isPerformance = (row: RecordRow): row is AdminSellerPerformance => "fulfillment_rate" in row;

export default function SellerSubWorkspace({ view }: { view: View }) {
  const copy = config[view];
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<RecordRow | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = view === "products"
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

  useEffect(() => { void load(); }, [view]);

  const filtered = useMemo(() => rows.filter((row) => {
    const rowStatus = row.status;
    const matchesStatus = status === "all" || rowStatus === status;
    const searchable = isProduct(row)
      ? `${row.seller_name} ${row.name} ${row.sku}`
      : isOrder(row)
        ? `${row.seller_name} ${row.order_number} ${row.product_name}`
        : row.seller_name;
    return matchesStatus && searchable.toLowerCase().includes(query.toLowerCase());
  }), [query, rows, status]);

  const metrics = useMemo(() => {
    if (view === "products") {
      const products = rows as AdminSellerProduct[];
      return [["Product listings", products.length], ["Approved", products.filter((row) => row.status === "approved").length], ["Pending moderation", products.filter((row) => row.status === "pending_review").length], ["Inactive", products.filter((row) => !row.is_active).length]];
    }
    if (view === "orders") {
      const orders = rows as AdminSellerOrder[];
      return [["Order lines", orders.length], ["Processing", orders.filter((row) => row.status === "processing").length], ["Shipped", orders.filter((row) => row.status === "shipped").length], ["Delivered", orders.filter((row) => row.status === "delivered").length]];
    }
    const performance = rows as AdminSellerPerformance[];
    const revenue = performance.reduce((total, row) => total + row.revenue, 0);
    const fulfillment = performance.length ? performance.reduce((total, row) => total + row.fulfillment_rate, 0) / performance.length : 0;
    return [["Sellers measured", performance.length], ["Delivered orders", performance.reduce((total, row) => total + row.delivered_orders, 0)], ["Revenue", `TZS ${revenue.toLocaleString()}`], ["Avg. fulfillment", `${fulfillment.toFixed(1)}%`]];
  }, [rows, view]);

  const statusOptions = view === "products"
    ? ["approved", "pending_review", "rejected", "draft", "inactive"]
    : view === "orders"
      ? ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"]
      : ["approved", "under_review", "rejected", "suspended"];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-gradient-to-r from-[#111827] via-[#293548] to-[#f47524] p-6 text-white shadow-lg sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-orange-100">Seller operations</p>
        <h2 className="mt-2 text-3xl font-semibold">{copy.title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/75">{copy.description}</p>
      </section>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map(([label, value]) => <article key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-semibold text-[#111827]">{value}</p></article>)}
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-[#111827]">Business flow</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-4">{copy.steps.map((step, index) => <div key={step} className="rounded-xl bg-[#f8fafc] p-4"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f47524] text-xs font-bold text-white">{index + 1}</span><p className="mt-3 text-sm font-medium text-[#111827]">{step}</p></div>)}</div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div><h3 className="font-semibold text-[#111827]">{copy.title} queue</h3><p className="text-sm text-gray-500">{filtered.length} matching records</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search seller or reference..." className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm outline-none focus:border-[#f47524]" />
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"><option value="all">All statuses</option>{statusOptions.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select>
            <button type="button" onClick={() => void load()} className="rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-medium text-white">Refresh</button>
          </div>
        </div>

        {loading ? <div className="p-12 text-center text-gray-500">Loading {copy.title.toLowerCase()}...</div> : filtered.length === 0 ? <div className="p-12 text-center"><p className="font-medium text-[#111827]">No records found</p><p className="mt-1 text-sm text-gray-500">Try a different filter or wait for seller activity.</p></div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[840px] text-left"><thead className="bg-[#f8fafc] text-xs uppercase text-gray-500"><tr>{(view === "products" ? ["Seller", "Product", "SKU", "Price", "Status", "Action"] : view === "orders" ? ["Order", "Seller", "Product", "Quantity", "Amount", "Status", "Action"] : ["Seller", "Products", "Orders", "Delivered", "Revenue", "Fulfillment", "Action"]).map((header) => <th key={header} className="px-5 py-3">{header}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{filtered.map((row) => isProduct(row) ? <tr key={row.id} className="hover:bg-orange-50/40"><td className="px-5 py-4 font-medium">{row.seller_name}</td><td className="px-5 py-4 text-sm">{row.name}</td><td className="px-5 py-4 text-sm text-gray-500">{row.sku}</td><td className="px-5 py-4 text-sm">{row.price.toLocaleString()} {row.currency}</td><td className="px-5 py-4 text-sm capitalize">{row.status.replaceAll("_", " ")}</td><td className="px-5 py-4"><button onClick={() => setSelected(row)} className="rounded-lg border px-3 py-2 text-xs hover:border-[#f47524] hover:text-[#f47524]">View</button></td></tr> : isOrder(row) ? <tr key={row.id} className="hover:bg-orange-50/40"><td className="px-5 py-4 font-medium">#{row.order_number}</td><td className="px-5 py-4 text-sm">{row.seller_name}</td><td className="px-5 py-4 text-sm">{row.product_name}</td><td className="px-5 py-4 text-sm">{row.quantity}</td><td className="px-5 py-4 text-sm">{row.amount.toLocaleString()} {row.currency}</td><td className="px-5 py-4 text-sm capitalize">{row.status}</td><td className="px-5 py-4"><Link href={`/admin/orders/${row.order_id}`} className="rounded-lg border px-3 py-2 text-xs hover:border-[#f47524] hover:text-[#f47524]">Open order</Link></td></tr> : <tr key={row.seller_id} className="hover:bg-orange-50/40"><td className="px-5 py-4 font-medium">{row.seller_name}</td><td className="px-5 py-4 text-sm">{row.approved_products}/{row.products}</td><td className="px-5 py-4 text-sm">{row.orders}</td><td className="px-5 py-4 text-sm">{row.delivered_orders}</td><td className="px-5 py-4 text-sm">{row.revenue.toLocaleString()} {row.currency}</td><td className="px-5 py-4 text-sm">{row.fulfillment_rate}%</td><td className="px-5 py-4"><button onClick={() => setSelected(row)} className="rounded-lg border px-3 py-2 text-xs hover:border-[#f47524] hover:text-[#f47524]">Inspect</button></td></tr>)}</tbody></table></div>
        )}
      </section>

      {selected ? <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 p-4" onMouseDown={() => setSelected(null)}><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#f47524]">Record details</p><h3 className="mt-1 text-xl font-semibold text-[#111827]">{isProduct(selected) ? selected.name : isPerformance(selected) ? selected.seller_name : "Seller record"}</h3></div><button onClick={() => setSelected(null)} className="rounded-lg bg-gray-100 px-3 py-2 text-sm">Close</button></div><dl className="mt-5 grid grid-cols-2 gap-3">{Object.entries(selected).filter(([key]) => !["id", "seller_id"].includes(key)).slice(0, 10).map(([key, value]) => <div key={key} className="rounded-xl bg-[#f8fafc] p-3"><dt className="text-xs capitalize text-gray-500">{key.replaceAll("_", " ")}</dt><dd className="mt-1 break-words text-sm font-medium text-[#111827]">{typeof value === "boolean" ? value ? "Yes" : "No" : String(value ?? "—")}</dd></div>)}</dl></div></div> : null}
    </div>
  );
}
