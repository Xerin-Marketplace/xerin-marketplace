"use client";

import { ordersApi } from "@/lib/api/endpoints/commerce";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Order } from "@/types/api/commerce";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BuyerOrderDetails({ orderId }: { orderId: string }) {
  const [order,setOrder]=useState<Order|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const load=async()=>{setLoading(true);setError("");try{setOrder(await ordersApi.get(orderId))}catch(cause){setError(cause instanceof Error?cause.message:"Unable to load this order.")}finally{setLoading(false)}};
  useEffect(()=>{void load()},[orderId]);
  if(loading)return <p className="rounded-2xl border bg-white p-10 text-center text-[#64748b] dark:bg-darkTheme-card">Loading order details...</p>;
  if(error)return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700"><p>{error}</p><button onClick={()=>void load()} className="mt-3 font-semibold underline">Retry</button></div>;
  if(!order)return null;
  return <div className="space-y-5"><div><p className="text-sm font-semibold text-[#f7941d]">Buyer Account / Orders</p><h1 className="text-2xl font-bold">Order {order.id.slice(0,8).toUpperCase()}</h1><p className="mt-1 text-sm text-[#64748b]">Created {new Date(order.created_at).toLocaleString()}</p></div><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Status",order.status.replaceAll("_"," ")],["Subtotal",formatCurrency(order.subtotal,order.currency)],["Discount",formatCurrency(order.discount_amount,order.currency)],["Total",formatCurrency(order.total,order.currency)]].map(([label,value])=><div key={label} className="rounded-2xl border bg-white p-4 dark:border-white/10 dark:bg-darkTheme-card"><p className="text-xs uppercase text-[#64748b]">{label}</p><p className="mt-2 font-semibold capitalize">{value}</p></div>)}</section><section className="overflow-hidden rounded-2xl border bg-white dark:border-white/10 dark:bg-darkTheme-card"><div className="border-b p-5 dark:border-white/10"><h2 className="font-bold">Order Items</h2></div><div className="divide-y dark:divide-white/10">{order.items.map(item=><div key={item.id} className="flex justify-between gap-4 p-5 text-sm"><div><p className="font-semibold">{item.product_name}</p><p className="text-[#64748b]">Quantity {item.quantity}{item.variant_name?` · ${item.variant_name}`:""}</p></div><p className="font-semibold">{formatCurrency(item.total_price,order.currency)}</p></div>)}</div></section><section className="rounded-2xl border border-dashed bg-white p-5 text-sm text-[#64748b] dark:border-white/15 dark:bg-darkTheme-card">Payment status, shipment tracking, cancellation and refund-request details are not included in the current buyer order-detail contract.</section><Link href="/account/orders" className="inline-block font-semibold text-[#f7941d]">← Back to orders</Link></div>;
}
