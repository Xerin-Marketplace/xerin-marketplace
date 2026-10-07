"use client";


import { Spinner } from "@/components/ui/Spinner";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, CheckIcon, Cancel01Icon, CancelCircleIcon, ClipboardListIcon, PackageCheckIcon, MoneyBag02Icon, PackageOpenIcon, TruckDeliveryIcon, CheckmarkBadge02Icon } from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import { ordersApi } from "@/lib/api/endpoints/commerce";
import type { Order } from "@/types/api/commerce";
import { formatCurrency } from "@/lib/formatCurrency";

const statuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const statusClass = (value: string) => ["delivered", "paid"].includes(value) ? "bg-green-light-6 text-green-dark" : ["cancelled", "refunded"].includes(value) ? "bg-red-light-6 text-red-dark" : "bg-yellow-light-4 text-yellow-dark-2";

const FLOW = [
 { id: "pending", label: "Placed", icon: ClipboardListIcon },
 { id: "paid", label: "Paid", icon: MoneyBag02Icon },
 { id: "processing", label: "Processing", icon: PackageOpenIcon },
 { id: "shipped", label: "Shipped", icon: TruckDeliveryIcon },
 { id: "delivered", label: "Delivered", icon: CheckmarkBadge02Icon },
] as const;

export default function OrderDetails({ orderId }: { orderId: string }) {
 const [order, setOrder] = useState<Order | null>(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState("");
 const [statusOpen, setStatusOpen] = useState(false);
 const [nextStatus, setNextStatus] = useState("");

 const load = async () => {
 setLoading(true); setError("");
 try { const result = await ordersApi.get(orderId); setOrder(result); setNextStatus(result.status); }
 catch (cause) { setOrder(null); setError(cause instanceof Error ? cause.message : "Unable to load order."); }
 finally { setLoading(false); }
 };

 useEffect(() => { void load(); }, [orderId]);

 const update = async () => {
 if (!order || !nextStatus || nextStatus === order.status) return;
 setSaving(true);
 try { await ordersApi.updateStatus(order.id, { status: nextStatus }); toast.success("Order status updated."); setStatusOpen(false); await load(); }
 catch (cause) { toast.error(cause instanceof Error ? cause.message : "Status update failed."); }
 finally { setSaving(false); }
 };

 if (loading) return <div className="rounded-2xl bg-card p-12 text-center text-muted-foreground"><Spinner className="mx-auto" /><p className="mt-3 text-sm">Loading order details…</p></div>;
 if (error || !order) return <div className="rounded-2xl bg-card p-10 text-center"><p className="text-sm text-destructive">{error ||"Order not found."}</p><button onClick={() => void load()} className="mt-4 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background">Retry</button></div>;

 const terminal = ["cancelled", "refunded"].includes(order.status);
 const flowIndex = Math.max(0, FLOW.findIndex((step) => step.id === order.status));

 return <div className="space-y-6">
 <section className="rounded-2xl bg-card p-5 sm:p-6">
 <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><HugeiconsIcon icon={ArrowLeft01Icon} size={16}/>Back to orders</Link>
 <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div className="min-w-0">
 <p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">Order</p>
 <h2 className="mt-1 break-all text-xl font-bold tracking-[-.02em] sm:text-2xl">{order.order_number || order.id}</h2>
 <p className="mt-1 text-sm text-muted-foreground">{order.created_at ? new Date(order.created_at).toLocaleString() :"Date unavailable"}</p>
 </div>
 <div className="flex shrink-0 items-center gap-3">
 <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusClass(order.status)}`}>{pretty(order.status)}</span>
 <button onClick={() => { setNextStatus(order.status); setStatusOpen(true); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background dark:bg-primary"><HugeiconsIcon icon={PackageCheckIcon} size={16}/>Update status</button>
 </div>
 </div>
 </section>

 {/* Order progress stepper */}
 <section className="rounded-2xl bg-card p-5 sm:p-7">
 {terminal ? (
 <div className="flex items-center gap-3 rounded-xl bg-red-light-6 p-4 text-sm font-semibold text-red-dark">
 <HugeiconsIcon icon={CancelCircleIcon} size={20} />
 This order was {pretty(order.status).toLowerCase()} — it is no longer in the fulfilment flow.
 </div>
 ) : (
 <ol className="flex w-full items-center">
 {FLOW.map((step, index) => {
 const reached = index <= flowIndex;
 const active = index === flowIndex;
 const last = index === FLOW.length - 1;
 return (
 <li key={step.id} className={`flex items-center ${last ? "" : "flex-1"}`}>
 <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
 <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition sm:h-9 sm:w-9 ${reached ? "bg-primary text-white" : "bg-muted text-muted-foreground"} ${active ? "ring-4 ring-primary/15" : ""}`}>
 {reached && !active ? <HugeiconsIcon icon={CheckIcon} size={14} /> : <HugeiconsIcon icon={step.icon} size={15} />}
 </span>
 <span className={`text-[10px] font-bold sm:text-xs ${reached ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
 </div>
 {!last && <span aria-hidden="true" className={`mx-2 h-0.5 flex-1 rounded-full sm:mx-4 ${index < flowIndex ? "bg-primary" : "bg-border"}`} />}
 </li>
 );
 })}
 </ol>
 )}
 </section>

 {/* Items + totals */}
 <section className="rounded-2xl bg-card p-5 sm:p-6">
 <div className="flex items-center justify-between gap-3">
 <h3 className="font-bold">Order items</h3>
 <span className="text-xs font-semibold text-muted-foreground">{order.items.length} line item{order.items.length === 1 ?"" : "s"}</span>
 </div>
 <div className="mt-4 divide-y divide-border/60">
 {order.items.map((item) => (
 <div key={item.id} className="flex items-center gap-3 py-3">
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-semibold">{item.product_name}</p>
 <p className="mt-0.5 text-xs text-muted-foreground">{item.quantity} × {formatCurrency(item.unit_price, order.currency)}</p>
 </div>
 <p className="shrink-0 text-sm font-bold">{formatCurrency(item.total_price, order.currency)}</p>
 </div>
 ))}
 </div>
 <div className="mt-2 space-y-1.5 border-t border-border/60 pt-4 text-sm">
 <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(order.subtotal, order.currency)}</span></div>
 {Number(order.discount_amount) > 0 && <div className="flex justify-between text-green"><span>Discount</span><span>-{formatCurrency(order.discount_amount, order.currency)}</span></div>}
 <div className="flex justify-between pt-1 text-base font-bold"><span>Total</span><span>{formatCurrency(order.total, order.currency)}</span></div>
 </div>
 </section>

 {statusOpen && <div className="fixed inset-0 z-[120] grid place-items-center bg-carbon/55 p-4 backdrop-blur-sm" onMouseDown={() => !saving && setStatusOpen(false)}><div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-lg sm:p-6" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Controlled status change</p><h3 className="mt-1 text-xl font-bold">Update order status</h3><p className="mt-1 text-sm text-muted-foreground">Current status: {pretty(order.status)}</p></div><button disabled={saving} onClick={() => setStatusOpen(false)} className="rounded-xl bg-muted p-2 text-muted-foreground"><HugeiconsIcon icon={Cancel01Icon} size={18}/></button></div><label className="mt-5 block text-sm font-semibold">New status<select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl bg-muted px-3 outline-none focus:ring-2 focus:ring-primary/25">{statuses.map((status) => <option key={status} value={status}>{pretty(status)}</option>)}</select></label><p className="mt-3 rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground">This action uses the live admin order-status endpoint and may trigger downstream fulfilment behavior.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={saving} onClick={() => setStatusOpen(false)} className="min-h-11 rounded-xl bg-muted font-semibold">Cancel</button><button disabled={saving || nextStatus === order.status} onClick={() => void update()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white disabled:opacity-40">{saving ? <Spinner size={16} /> : <HugeiconsIcon icon={CheckIcon} size={16}/>}Confirm update</button></div></div></div>}
 </div>;
}
