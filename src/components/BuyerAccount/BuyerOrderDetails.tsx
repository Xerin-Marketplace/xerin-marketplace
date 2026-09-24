"use client";


import { Spinner } from "@/components/ui/Spinner";
import { ordersApi } from "@/lib/api/endpoints/commerce";
import { formatCurrency } from "@/lib/formatCurrency";
import type { SellerOrderMessage } from "@/types/api/seller-order";
import type {
 CustomerEscrowSummary,
 CustomerOrderDetail,
 SettlementProtectionClaimReason,
 Shipment,
} from "@/types/api/commerce";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { Alert02Icon, CheckmarkBadge01Icon, Calendar03Icon, DollarCircleIcon, Clock01Icon, Download01Icon, Location01Icon, PackageCheckIcon, RefreshCwIcon, ShieldCheckIcon, TruckIcon, Chatting01Icon, SentIcon, ViewIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const pretty = (value: string) =>
 value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const paymentTone = (status?: string | null) => {
 if (status === "completed") return "bg-green-light-6 text-green-dark";
 if (status === "failed" || status === "cancelled")
 return "bg-red-light-6 text-red-dark";
 return "bg-yellow-light-4 text-yellow-dark-2";
};

const shipmentTone = (status: string) => {
 if (status === "delivered") return "bg-green-light-6 text-green-dark";
 if (["dispatched", "in_transit", "out_for_delivery"].includes(status))
 return "bg-primary-50 text-primary-700";
 if (["failed", "cancelled"].includes(status))
 return "bg-red-light-6 text-red-dark";
 return "bg-yellow-light-4 text-yellow-dark-2";
};

const JOURNEY_STAGES: { key: string; label: string; icon: typeof PackageCheckIcon; statuses: string[] }[] = [
 { key: "placed", label: "Placed", icon: CheckmarkBadge01Icon, statuses: ["pending", "created", "placed"] },
 { key: "confirmed", label: "Confirmed", icon: DollarCircleIcon, statuses: ["confirmed", "paid", "processing", "payment_confirmed"] },
 { key: "ready", label: "Ready", icon: PackageCheckIcon, statuses: ["ready_for_dispatch", "packed", "pickup_pending"] },
 { key: "transit", label: "On the way", icon: TruckIcon, statuses: ["picked_up", "dispatched", "in_transit", "out_for_delivery", "shipped"] },
 { key: "delivered", label: "Delivered", icon: Location01Icon, statuses: ["delivered", "completed"] },
];

const journeyIndex = (order: CustomerOrderDetail): number => {
 const statuses = [order.status, ...order.shipments.map((s) => s.status)]
 .filter(Boolean)
 .map((s) => s.toLowerCase());
 let best = 0;
 JOURNEY_STAGES.forEach((stage, index) => {
 if (statuses.some((s) => stage.statuses.includes(s))) best = Math.max(best, index);
 });
 return best;
};

function OrderJourney({ order }: { order: CustomerOrderDetail }) {
 const failed = ["cancelled", "failed"].includes(order.status.toLowerCase());
 const current = journeyIndex(order);
 const progress = (current / (JOURNEY_STAGES.length - 1)) * 100;

 if (failed) {
 return (
 <section className="rounded-xl border border-red-light-4 bg-red-light-6 p-5 sm:p-6">
 <div className="flex items-center gap-3">
 <span className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
 <HugeiconsIcon icon={Alert02Icon} size={22} />
 </span>
 <div>
 <p className="text-lg font-bold text-foreground">Order {pretty(order.status)}</p>
 <p className="text-sm text-muted-foreground">
 This order is no longer progressing. Contact support if you need help.
 </p>
 </div>
 </div>
 </section>
 );
 }

 return (
 <section className="rounded-xl border border-border bg-card p-5 sm:p-7">
 <div className="flex items-center justify-between gap-3">
 <h2 className="text-base font-bold text-foreground sm:text-lg">Order Journey</h2>
 <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
 {pretty(order.status)}
 </span>
 </div>

 {/* Big progress bar */}
 <div className="relative mt-6 sm:mt-8">
 <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted" />
 <div
 className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary transition-all duration-700"
 style={{ width: `${progress}%` }}
 />
 <div className="relative flex justify-between">
 {JOURNEY_STAGES.map((stage, index) => {
 const done = index <= current;
 const active = index === current;
 return (
 <div key={stage.key} className="flex flex-col items-center gap-2">
 <span
 className={`grid shrink-0 place-items-center rounded-full border-2 transition-all duration-300 ${
 active
 ? "h-14 w-14 border-primary bg-primary text-primary-foreground shadow-lg"
 : done
 ? "h-11 w-11 border-primary bg-primary/10 text-primary"
 : "h-11 w-11 border-border bg-card text-muted-foreground"
 }`}
 >
 <HugeiconsIcon icon={stage.icon} size={active ? 24 : 18} />
 </span>
 <span
 className={`text-[11px] font-semibold sm:text-xs ${
 active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"
 }`}
 >
 {stage.label}
 </span>
 </div>
 );
 })}
 </div>
 </div>

 <p className="mt-5 text-center text-sm text-muted-foreground">
 {current === JOURNEY_STAGES.length - 1
 ? "Your order has been delivered. We hope you love it."
 : current >= 3
 ? "Your order is on its way to you."
 : current >= 1
 ? "Your order is being prepared for shipment."
 : "Your order was received and is being confirmed."}
 </p>
 </section>
 );
}

export default function BuyerOrderDetails({ orderId }: { orderId: string }) {
 const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [escrow, setEscrow] = useState<CustomerEscrowSummary | null>(null);
 const [approvingReceipt, setApprovingReceipt] = useState(false);
 const [escrowMessage, setEscrowMessage] = useState("");
 const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
 const [claimDialog, setClaimDialog] = useState<{ scope: "item" | "order"; itemId?: string } | null>(null);
 const [claimReason, setClaimReason] = useState<SettlementProtectionClaimReason>("damaged_on_arrival");
 const [claimNotes, setClaimNotes] = useState("");
 const [claimWhen, setClaimWhen] = useState<"before_acceptance" | "on_opening" | "after_initial_use" | "later_after_delivery">("on_opening");
 const [packageDamaged, setPackageDamaged] = useState(false);
 const [productUsed, setProductUsed] = useState(false);
 const [submittingClaim, setSubmittingClaim] = useState(false);
 const [acceptingItemId, setAcceptingItemId] = useState<string | null>(null);
 const [downloadingInvoice, setDownloadingInvoice] = useState(false);
 const [downloadingPaymentReceipt, setDownloadingPaymentReceipt] = useState(false);

 const load = async () => {
 setLoading(true);
 setError("");
 try {
 const [orderData, escrowData] = await Promise.all([
 ordersApi.customerDetail(orderId),
 ordersApi.escrowStatus(orderId),
 ]);
 setOrder(orderData);
 setEscrow(escrowData);
 } catch (cause) {
 const err = cause as {
 response?: { data?: { detail?: string } };
 message?: string;
 };
 setError(
 err.response?.data?.detail ||
 err.message ||
 "Unable to load this order.",
 );
 } finally {
 setLoading(false);
 }
 };

 const [pdfPreview, setPdfPreview] = useState<{ title: string; url: string } | null>(null);

 const closePdfPreview = () => {
 if (pdfPreview) URL.revokeObjectURL(pdfPreview.url);
 setPdfPreview(null);
 };

 const openDocument = async (kind: "invoice" | "receipt") => {
 const setBusy = kind === "invoice" ? setDownloadingInvoice : setDownloadingPaymentReceipt;
 setBusy(true);
 setError("");
 try {
 const blob = kind === "invoice" ? await ordersApi.invoice(orderId) : await ordersApi.receipt(orderId);
 const url = URL.createObjectURL(blob);
 const label = kind === "invoice" ? "Invoice" : "Payment Receipt";
 if (pdfPreview) URL.revokeObjectURL(pdfPreview.url);
 setPdfPreview({
 title: `Xerin ${label} · Order #${orderId.slice(0, 8).toUpperCase()}`,
 url,
 });
 } catch {
 setError(
 kind === "invoice"
 ? "Unable to load the invoice. Please try again."
 : "Payment receipt is available only after a verified successful payment.",
 );
 } finally {
 setBusy(false);
 }
 };

 const approveReceipt = async () => {
 if (!escrow?.can_customer_approve || approvingReceipt) return;
 setApprovingReceipt(true);
 setEscrowMessage("");
 try {
 const updated = await ordersApi.approveReceipt(
 orderId,
 "Customer confirmed complete and satisfactory receipt",
 );
 setEscrow(updated);
 setEscrowMessage(
 "Receipt approved. Seller funds have been released from Xerin escrow.",
 );
 setReceiptDialogOpen(false);
 await load();
 } catch (cause) {
 const err = cause as {
 response?: { data?: { detail?: string } };
 message?: string;
 };
 setEscrowMessage(
 err.response?.data?.detail ||
 err.message ||
 "Unable to approve receipt.",
 );
 } finally {
 setApprovingReceipt(false);
 }
 };

 const acceptItem = async (itemId: string) => {
 if (acceptingItemId) return;
 setAcceptingItemId(itemId);
 setEscrowMessage("");
 try {
 const updated = await ordersApi.acceptEscrowItem(orderId, itemId, "Customer accepted this delivered product");
 setEscrow(updated);
 setEscrowMessage("Product accepted. Its eligible seller funds were released from Xerin escrow.");
 } catch (cause) {
 const err = cause as { response?: { data?: { detail?: string } }; message?: string };
 setEscrowMessage(err.response?.data?.detail || err.message || "Unable to accept this product.");
 } finally {
 setAcceptingItemId(null);
 }
 };

 const submitProtectionClaim = async () => {
 if (!claimDialog || claimNotes.trim().length < 5 || submittingClaim) return;
 setSubmittingClaim(true);
 setEscrowMessage("");
 try {
 const claim = await ordersApi.createProtectionClaim(orderId, {
 scope: claimDialog.scope,
 order_item_id: claimDialog.scope === "item" ? claimDialog.itemId : undefined,
 reason: claimReason,
 notes: claimNotes.trim(),
 when_noticed: claimWhen,
 package_damaged: packageDamaged,
 product_used: productUsed,
 });
 setEscrowMessage(
 claim.hold_applied
 ? "Problem reported. Xerin protected only the affected seller escrow while the claim is reviewed."
 : "Problem recorded. This reason does not automatically freeze seller escrow; Xerin will route it to the appropriate support/responsibility flow.",
 );
 setClaimDialog(null);
 setClaimNotes("");
 await load();
 } catch (cause) {
 const err = cause as { response?: { data?: { detail?: string | { message?: string } } }; message?: string };
 const detail = err.response?.data?.detail;
 setEscrowMessage((typeof detail === "string" ? detail : detail?.message) || err.message || "Unable to submit the protection claim.");
 } finally {
 setSubmittingClaim(false);
 }
 };

 useEffect(() => {
 void load();
 }, [orderId]);

 const trackingEvents = useMemo(
 () =>
 (order?.shipments ?? [])
 .flatMap((shipment) =>
 shipment.tracking_events.map((event) => ({
 ...event,
 shipment,
 })),
 )
 .sort(
 (a, b) =>
 new Date(b.created_at).getTime() -
 new Date(a.created_at).getTime(),
 ),
 [order],
 );

 if (loading)
 return (
 <p className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
 Loading order and delivery tracking...
 </p>
 );

 if (error)
 return (
 <div className="rounded-xl border border-red-light-4 bg-red-light-6 p-8 text-center text-red-dark">
 <p>{error}</p>
 <button
 onClick={() => void load()}
 className="mt-3 font-semibold underline"
 >
 Retry
 </button>
 </div>
 );

 if (!order) return null;

 const address = order.shipping_address;

 return (
 <div className="space-y-5">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <div>
 <h1 className="mt-1 text-2xl font-bold">
 Order {order.id.slice(0, 8).toUpperCase()}
 </h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Created {new Date(order.created_at).toLocaleString()}
 </p>
 </div>
 <button
 onClick={() => void load()}
 className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold dark:border-border"
 >
 <HugeiconsIcon icon={RefreshCwIcon} size={14} />
 Refresh Tracking
 </button>
 </div>

 <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <Metric
 label="Order Status"
 value={pretty(order.status)}
 icon={PackageCheckIcon}
 />
 <Metric
 label="Payment"
 value={pretty(order.payment_status || "not_started")}
 icon={DollarCircleIcon}
 />
 <Metric
 label="Delivery Type"
 value={pretty(order.delivery_mode || "not_set")}
 icon={TruckIcon}
 />
 <Metric
 label="Order Total"
 value={formatCurrency(order.total, order.currency)}
 icon={CheckmarkBadge01Icon}
 />
 </section>

 <OrderJourney order={order} />

 <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
 <div className="space-y-5">
 <Card title="Order Items">
 <div className="divide-y divide-[var(--border)] dark:divide-white/10">
 {order.items.map((item) => (
 <div
 key={item.id}
 className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
 >
 <div>
 <Link
 href={`/products/${item.product_id}`}
 className="font-semibold hover:text-primary"
 >
 {item.product_name}
 </Link>
 <p className="mt-1 text-xs text-muted-foreground">
 Qty {item.quantity}
 {item.variant_name ? ` · ${item.variant_name}` : ""}
 </p>
 </div>
 <div className="text-right">
 <p className="font-semibold">
 {formatCurrency(
 item.customer_total ?? item.total_price,
 order.currency,
 )}
 </p>
 {Number(item.promotion_discount_amount || 0) > 0 && (
 <p className="text-xs text-green-dark">
 Seller promotion -{" "}
 {formatCurrency(
 item.promotion_discount_amount || 0,
 order.currency,
 )}
 </p>
 )}
 </div>
 </div>
 ))}
 </div>
 </Card>

 <Card title="Seller Fulfilment">
 {order.seller_orders.length ? (
 <div className="space-y-4">
 {order.seller_orders.map((sellerOrder, index) => (
 <div
 key={sellerOrder.id}
 className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border"
 >
 <div className="border-b border-border bg-muted/60 p-4 sm:p-5">
 <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
 <div className="flex min-w-0 items-start gap-3">
 <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
 <HugeiconsIcon icon={PackageCheckIcon} size={20} />
 </span>

 <div className="min-w-0">
 <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
 Seller shipment {index + 1}
 </p>
 <div className="mt-1.5 flex flex-wrap items-center gap-2">
 <h3 className="text-xl font-extrabold text-foreground">
 {pretty(sellerOrder.status)}
 </h3>
 <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary dark:bg-primary/10 dark:text-primary-300">
 Fulfilment
 </span>
 </div>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 Seller is preparing this shipment for the logistics handover.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:min-w-[330px]">
 <div className="rounded-xl border border-primary/25 bg-card px-3 py-2.5 dark:border-border dark:bg-card/[0.035]">
 <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
 Items
 </p>
 <p className="mt-1 text-sm font-bold text-foreground">
 {sellerOrder.item_count}
 </p>
 </div>

 <div className="rounded-xl border border-primary/25 bg-card px-3 py-2.5 dark:border-border dark:bg-card/[0.035]">
 <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
 Seller portion
 </p>
 <p className="mt-1 text-sm font-bold text-foreground">
 {formatCurrency(
 sellerOrder.seller_subtotal,
 order.currency,
 )}
 </p>
 </div>

 <div className="col-span-2 rounded-xl border border-primary/25 bg-card px-3 py-2.5 dark:border-border dark:bg-card/[0.035] sm:col-span-1">
 <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
 Next step
 </p>
 <p className="mt-1 text-sm font-bold text-primary dark:text-primary-300">
 Logistics pickup
 </p>
 </div>
 </div>
 </div>
 </div>

 <div className="p-4 sm:p-5">
 <CustomerSellerChat
 orderId={order.id}
 sellerOrderId={sellerOrder.id}
 />
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="rounded-xl border border-dashed border-[var(--muted-foreground)] p-5 text-sm text-muted-foreground dark:border-border">
 Seller fulfilment records will appear after the order enters processing.
 </div>
 )}
 </Card>

 <Card title="Shipment Tracking">
 {order.shipments.length ? (
 <div className="space-y-4">
 {order.shipments.map((shipment, index) => (
 <ShipmentCard
 key={shipment.id}
 shipment={shipment}
 index={index}
 />
 ))}
 </div>
 ) : (
 <div className="rounded-xl border border-dashed border-[var(--muted-foreground)] p-5 text-sm text-muted-foreground">
 Shipment has not been created yet. This normally appears after
 payment confirmation or COD acceptance.
 </div>
 )}
 </Card>


 </div>

 <aside className="space-y-5">
 <Card title="Payment Status">
 {order.payments.length ? (
 <div className="space-y-3">
 {order.payments.map((payment) => (
 <div
 key={payment.id}
 className="rounded-xl border border-border p-4 dark:border-border"
 >
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="font-semibold capitalize">
 {pretty(payment.method)}
 </p>
 <p className="mt-2 text-xl font-bold">
 {formatCurrency(payment.amount, payment.currency)}
 </p>
 </div>
 <span
 className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${paymentTone(
 payment.status,
 )}`}
 >
 {pretty(payment.status)}
 </span>
 </div>

 {payment.provider && (
 <p className="mt-3 text-xs capitalize text-muted-foreground">
 {pretty(payment.provider)}
 </p>
 )}
 {payment.provider_transaction_id && (
 <p className="mt-1 break-all text-xs text-muted-foreground">
 Ref: {payment.provider_transaction_id}
 </p>
 )}
 <p className="mt-1 text-xs text-muted-foreground">
 {payment.paid_at
 ? `Paid ${new Date(payment.paid_at).toLocaleString()}`
 : `Created ${new Date(payment.created_at).toLocaleString()}`}
 </p>
 </div>
 ))}
 </div>
 ) : (
 <div className="rounded-xl border border-dashed border-[var(--muted-foreground)] p-4 text-sm text-muted-foreground dark:border-border">
 Payment information will appear here after checkout.
 </div>
 )}
 </Card>

 <Card title="Tracking Timeline">
 {trackingEvents.length ? (
 <div className="relative">
 {trackingEvents.map((event, index) => {
 const status = event.status.toLowerCase();
 const active = index === 0;

 const Icon =
 status === "delivered"
 ? CheckmarkBadge01Icon
 : status === "ready_for_dispatch"
 ? PackageCheckIcon
 : [
 "pending",
 "pickup_pending",
 "picked_up",
 "dispatched",
 "in_transit",
 "out_for_delivery",
 ].includes(status)
 ? TruckIcon
 : Clock01Icon;

 const fallbackDescription: Record<string, string> = {
 pending:
 "Store-origin shipment created after payment confirmation.",
 ready_for_dispatch:
 "Seller fulfillment validated and order marked ready for dispatch.",
 pickup_pending:
 "Logistics pickup is pending and the shipment is waiting for collection from the seller.",
 picked_up:
 "The logistics provider collected the shipment from the seller.",
 dispatched:
 "The shipment was dispatched from the seller location.",
 in_transit:
 "The shipment is in transit to the customer delivery destination.",
 out_for_delivery:
 "The shipment is out for delivery and is approaching the customer.",
 delivered:
 "The shipment was delivered to the customer.",
 };

 const description =
 event.notes?.trim() ||
 fallbackDescription[status] ||
 "Shipment status was updated by the logistics workflow.";

 return (
 <div
 key={event.id}
 className="relative flex gap-4 pb-7 last:pb-0"
 >
 {index < trackingEvents.length - 1 && (
 <span
 aria-hidden="true"
 className="absolute left-[21px] top-11 h-[calc(100%-24px)] w-[2px] rounded-full bg-gradient-to-b from-primary to-primary/20"
 />
 )}

 <div className="relative z-[1] shrink-0">
 <span
 className={`grid h-11 w-11 place-items-center rounded-full border-2 shadow-sm ${
 active
 ? "border-[var(--primary)] bg-primary/10 text-primary dark:bg-primary/10"
 : "border-primary/25 bg-card text-primary "
 }`}
 >
 <HugeiconsIcon icon={Icon} size={18} />
 </span>

 {active && (
 <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-white bg-success shadow-sm">
 <span className="h-1.5 w-1.5 rounded-full bg-card" />
 </span>
 )}
 </div>

 <div className="min-w-0 flex-1 pt-0.5">
 <div className="flex flex-wrap items-center gap-2">
 <p className="text-sm font-extrabold text-foreground">
 {pretty(event.status)}
 </p>

 {active && (
 <span className="rounded-full bg-green-light-6 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-green-dark dark:bg-success/10 dark:text-emerald-300">
 Latest
 </span>
 )}
 </div>

 <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
 {new Date(event.created_at).toLocaleString()}
 </p>

 <p className="mt-2 max-w-[30rem] text-xs leading-5 text-muted-foreground dark:text-muted-foreground">
 {description}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 <div className="rounded-xl border border-dashed border-[var(--muted-foreground)] p-5 text-center dark:border-border">
 <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border-2 border-primary/25 bg-primary/10 text-primary dark:bg-primary/10">
 <HugeiconsIcon icon={TruckIcon} size={20} />
 </span>
 <p className="mt-3 text-sm font-semibold">
 Tracking will start soon
 </p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 Updates appear here as the seller and logistics provider move
 your shipment.
 </p>
 </div>
 )}
 </Card>

 <Card title="Xerin Escrow">
 {escrow && escrow.status !== "not_applicable" ? (
 <div className="space-y-3">
 <div className="flex items-center gap-2">
 <HugeiconsIcon icon={ShieldCheckIcon} size={18} className="text-green-dark" />
 <p className="font-semibold capitalize">
 {pretty(escrow.status)}
 </p>
 </div>

 <div className="rounded-xl bg-muted p-3 text-sm">
 <Summary
 label="Seller entitlement"
 value={formatCurrency(
 escrow.seller_amount,
 escrow.currency,
 )}
 />
 <Summary
 label="Marketplace commission"
 value={formatCurrency(
 escrow.commission_amount,
 escrow.currency,
 )}
 />
 <Summary
 label="Still protected"
 value={formatCurrency(
 escrow.remaining_amount,
 escrow.currency,
 )}
 strong
 />
 </div>

 {escrow.status === "held" && !escrow.can_customer_approve && (
 <p className="text-xs leading-5 text-muted-foreground">
 Seller funds remain protected. The release clock starts only after recipient-verified delivery. Once delivery is verified, you may accept early or Xerin will auto-release after the Admin-configured protection period if no eligible claim is holding the affected item.
 </p>
 )}

 {escrow.delivery_verified_at && (
 <div className="rounded-xl border border-primary/25 bg-primary/10 p-3 text-xs leading-5 text-primary-900">
 <b>Delivery verified:</b> {new Date(escrow.delivery_verified_at).toLocaleString()}
 {escrow.release_after && <><br /><b>Automatic seller release:</b> {new Date(escrow.release_after).toLocaleString()}</>}
 {escrow.seller_release_grace_hours && <><br />Protection window: {Math.round(escrow.seller_release_grace_hours / 24 * 10) / 10} days</>}
 </div>
 )}

 {escrow.items?.length > 0 && (
 <div className="space-y-2">
 <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Product protection</p>
 {escrow.items.map((protectedItem) => {
 const item = order.items.find((row) => row.id === protectedItem.order_item_id);
 return (
 <div key={protectedItem.order_item_id} className="rounded-xl border border-border p-3 dark:border-border">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="text-sm font-bold text-foreground">{item?.product_name || "Order item"}</p>
 <p className="mt-1 text-xs text-muted-foreground">{pretty(protectedItem.status)} · Seller entitlement {formatCurrency(protectedItem.seller_amount, escrow.currency)}</p>
 </div>
 {protectedItem.release_after && <p className="text-[10px] text-muted-foreground">Auto {new Date(protectedItem.release_after).toLocaleDateString()}</p>}
 </div>
 <div className="mt-3 flex flex-wrap gap-2">
 {protectedItem.can_customer_accept && (
 <button type="button" disabled={acceptingItemId === protectedItem.order_item_id} onClick={() => void acceptItem(protectedItem.order_item_id)} className="rounded-lg bg-success px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
 {acceptingItemId === protectedItem.order_item_id ? "Releasing..." : "Everything is OK · Accept item"}
 </button>
 )}
 {protectedItem.can_report_problem && (
 <button type="button" onClick={() => setClaimDialog({ scope: "item", itemId: protectedItem.order_item_id })} className="rounded-lg border border-red-light-4 px-3 py-2 text-xs font-bold text-red-dark">
 Report product problem
 </button>
 )}
 </div>
 </div>
 );
 })}
 {escrow.can_report_problem && (
 <button type="button" onClick={() => setClaimDialog({ scope: "order" })} className="w-full rounded-xl border border-border px-3 py-2.5 text-xs font-bold text-accent-foreground dark:border-border">
 Report an overall delivery/order problem
 </button>
 )}
 </div>
 )}

 {escrow.can_customer_approve && (
 <button
 type="button"
 onClick={() => setReceiptDialogOpen(true)}
 disabled={approvingReceipt}
 className="w-full rounded-xl bg-success px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
 >
 {approvingReceipt
 ? "Releasing Escrow..."
 : "Everything is OK · Accept Complete Order"}
 </button>
 )}

 {escrow.status === "released" && (
 <p className="text-xs font-semibold text-green-dark">
 You approved the order or the escrow release conditions were
 satisfied. Seller funds are now available for payout.
 </p>
 )}

 {escrow.status === "disputed" && (
 <p className="text-xs font-semibold text-red-dark">
 Escrow is frozen while this order is under dispute.
 </p>
 )}

 {escrowMessage && (
 <p className="text-xs leading-5 text-muted-foreground">
 {escrowMessage}
 </p>
 )}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">
 No online-payment escrow applies to this order.
 </p>
 )}
 </Card>

 <Card title="Delivery Address">
 {address ? (
 <div className="flex items-start gap-3">
 <HugeiconsIcon icon={Location01Icon} size={18} className="mt-0.5 shrink-0 text-primary" />
 <div className="text-sm leading-6 text-muted-foreground">
 {address.recipient_name && (
 <p className="font-semibold text-foreground">
 {address.recipient_name}
 </p>
 )}
 <p>{address.street}</p>
 <p>
 {[address.ward, address.district, address.city]
 .filter(Boolean)
 .join(", ")}
 </p>
 <p>
 {[address.region, address.country]
 .filter(Boolean)
 .join(", ")}
 </p>
 {address.recipient_phone && (
 <p>{address.recipient_phone}</p>
 )}
 </div>
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">
 Delivery address snapshot is unavailable.
 </p>
 )}
 </Card>

 <Card title="Order Summary">
 <Summary
 label="Subtotal"
 value={formatCurrency(order.subtotal, order.currency)}
 />
 {Number(order.promotion_discount_amount || 0) > 0 && (
 <Summary
 label="Seller promotion"
 value={`-${formatCurrency(
 order.promotion_discount_amount || 0,
 order.currency,
 )}`}
 saving
 />
 )}
 {Number(order.coupon_discount_amount || 0) > 0 && (
 <Summary
 label="Platform coupon"
 value={`-${formatCurrency(
 order.coupon_discount_amount || 0,
 order.currency,
 )}`}
 saving
 />
 )}
 <Summary
 label="Shipping"
 value={formatCurrency(order.shipping_amount, order.currency)}
 />
 <Summary
 label="Tax"
 value={formatCurrency(order.tax_amount, order.currency)}
 />
 <div className="mt-3 border-t border-border pt-3 dark:border-border">
 <Summary
 label="Total"
 value={formatCurrency(order.total, order.currency)}
 strong
 />
 </div>
 </Card>
 </aside>
 </section>

 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <Link
 href="/account/orders"
 className="inline-block font-semibold text-primary"
 >
 ← Back to orders
 </Link>
 {order.payment_status === "completed" && (
 <button
 type="button"
 onClick={() => void openDocument("receipt")}
 disabled={downloadingPaymentReceipt}
 className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm disabled:opacity-60"
 >
 <HugeiconsIcon icon={ViewIcon} size={16} />
 {downloadingPaymentReceipt ? "Preparing receipt..." : "View Receipt"}
 </button>
 )}
 <button
 type="button"
 onClick={() => void openDocument("invoice")}
 disabled={downloadingInvoice}
 className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-bold text-foreground shadow-sm disabled:opacity-60 dark:border-border"
 >
 <HugeiconsIcon icon={ViewIcon} size={16} />
 {downloadingInvoice ? "Preparing invoice..." : "View Invoice"}
 </button>
 </div>

 {pdfPreview && (
 <div className="fixed inset-0 z-[160] flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-4">
 <div role="dialog" aria-modal="true" aria-label={pdfPreview.title} className="flex h-[94dvh] w-full max-w-4xl flex-col overflow-hidden bg-card shadow-2xl sm:h-[90vh] sm:rounded-xl">
 <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
 <div className="flex min-w-0 items-center gap-3">
 <Image
 src="/images/logo/xerin-logo-mark.png"
 alt="Xerin Marketplace"
 width={26}
 height={26}
 className="h-7 w-7 shrink-0 object-contain"
 />
 <div className="min-w-0">
 <p className="truncate text-sm font-bold text-foreground">{pdfPreview.title}</p>
 <p className="text-[11px] text-muted-foreground">Official document · View only</p>
 </div>
 </div>
 <button
 type="button"
 onClick={closePdfPreview}
 aria-label="Close document preview"
 className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={17} />
 </button>
 </div>
 <iframe
 src={`${pdfPreview.url}#toolbar=0&navpanes=0&view=FitH`}
 title={pdfPreview.title}
 className="min-h-0 w-full flex-1 bg-muted"
 />
 </div>
 </div>
 )}

 {claimDialog && (
 <div className="fixed inset-0 z-[155] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
 <div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 shadow-lg sm:rounded-xl sm:p-6">
 <div className="flex items-start justify-between gap-4">
 <div>
 <h2 className="font-bold text-foreground">Report {claimDialog.scope === "item" ? "a product" : "an order/delivery"} problem</h2>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">Choose the closest reason. Xerin freezes seller escrow only when the reason can reasonably be seller-related or remains genuinely undetermined.</p>
 </div>
 <button onClick={() => setClaimDialog(null)} className="text-sm font-bold text-muted-foreground">Close</button>
 </div>
 <div className="mt-5 space-y-4">
 <label className="block text-sm font-semibold">What is wrong?
 <select value={claimReason} onChange={(e) => setClaimReason(e.target.value as SettlementProtectionClaimReason)} className="mt-2 w-full rounded-xl border border-border bg-card px-3 py-3 text-sm dark:border-border">
 <option value="wrong_product">Wrong product received</option>
 <option value="not_as_described">Product not as described</option>
 <option value="missing_item">Item missing</option>
 <option value="defective_on_arrival">Defective on arrival</option>
 <option value="damaged_on_arrival">Damaged on arrival</option>
 <option value="package_damaged">Package damaged during delivery</option>
 <option value="package_tampered">Package tampered during delivery</option>
 <option value="wrong_delivery_recipient">Delivered to wrong person/location</option>
 <option value="entire_delivery_missing">Entire delivery missing</option>
 <option value="late_delivery">Late delivery</option>
 <option value="customer_accidental_damage">I accidentally damaged it after delivery</option>
 <option value="change_of_mind">Changed my mind</option>
 <option value="other">Other</option>
 </select>
 </label>
 <label className="block text-sm font-semibold">When did you first notice it?
 <select value={claimWhen} onChange={(e) => setClaimWhen(e.target.value as typeof claimWhen)} className="mt-2 w-full rounded-xl border border-border bg-card px-3 py-3 text-sm dark:border-border">
 <option value="before_acceptance">Before accepting delivery</option>
 <option value="on_opening">Immediately after opening</option>
 <option value="after_initial_use">After initial use</option>
 <option value="later_after_delivery">Later after delivery</option>
 </select>
 </label>
 <div className="grid gap-3 sm:grid-cols-2">
 <label className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm dark:border-border"><input type="checkbox" checked={packageDamaged} onChange={(e) => setPackageDamaged(e.target.checked)} /> External package was damaged</label>
 <label className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm dark:border-border"><input type="checkbox" checked={productUsed} onChange={(e) => setProductUsed(e.target.checked)} /> Product has been used</label>
 </div>
 <label className="block text-sm font-semibold">Explain what happened
 <textarea value={claimNotes} onChange={(e) => setClaimNotes(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-border bg-card px-3 py-3 text-sm dark:border-border" placeholder="Be specific about the product condition and what you observed." />
 </label>
 <button type="button" disabled={claimNotes.trim().length < 5 || submittingClaim} onClick={() => void submitProtectionClaim()} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">{submittingClaim ? "Submitting..." : "Submit protection claim"}</button>
 </div>
 </div>
 </div>
 )}

 {receiptDialogOpen && (
 <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
 <div role="dialog" aria-modal="true" aria-labelledby="approve-receipt-title" className="w-full max-w-md rounded-t-2xl bg-card p-5 shadow-lg sm:rounded-xl sm:p-6">
 <div className="flex items-start gap-3">
 <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-yellow-light-4 text-yellow-dark-2 dark:bg-warning/10"><HugeiconsIcon icon={Alert02Icon} size={20} /></span>
 <div><h2 id="approve-receipt-title" className="font-bold text-foreground">Approve complete receipt?</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Confirm only after receiving the complete order in acceptable condition. Approval releases the protected seller funds from Xerin escrow and cannot be reversed from this page.</p></div>
 </div>
 <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={approvingReceipt} onClick={() => setReceiptDialogOpen(false)} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold dark:border-border">Not yet</button><button type="button" disabled={approvingReceipt} onClick={() => void approveReceipt()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-success px-4 text-sm font-bold text-white disabled:opacity-60">{approvingReceipt && <Spinner />}Approve & release funds</button></div>
 </div>
 </div>
 )}
 </div>
 );
}

function ShipmentCard({
 shipment,
 index,
}: {
 shipment: Shipment;
 index: number;
}) {
 return (
 <div className="rounded-xl border border-border p-4 dark:border-border">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
 Shipment {index + 1}
 </p>
 <p className="mt-1 font-bold">
 {shipment.carrier_name || "Marketplace logistics"}
 </p>
 {shipment.tracking_number && (
 <p className="mt-1 break-all text-sm text-muted-foreground">
 Tracking: <b>{shipment.tracking_number}</b>
 </p>
 )}
 </div>
 <span
 className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${shipmentTone(
 shipment.status,
 )}`}
 >
 {pretty(shipment.status)}
 </span>
 </div>

 <div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
 <div>
 <p className="font-semibold text-foreground">Items</p>
 <p className="mt-1">
 {shipment.items.reduce((sum, item) => sum + item.quantity, 0)}
 </p>
 </div>
 <div>
 <p className="font-semibold text-foreground">Dispatch</p>
 <p className="mt-1">
 {shipment.dispatched_at
 ? new Date(shipment.dispatched_at).toLocaleString()
 : "Pending"}
 </p>
 </div>
 <div>
 <p className="font-semibold text-foreground">ETA</p>
 <p className="mt-1">
 {shipment.estimated_delivery_to
 ? new Date(shipment.estimated_delivery_to).toLocaleDateString()
 : "Pending"}
 </p>
 </div>
 </div>
 </div>
 );
}


function CustomerSellerChat({ orderId, sellerOrderId }: { orderId: string; sellerOrderId: string }) {
 const [open, setOpen] = useState(false);
 const [messages, setMessages] = useState<SellerOrderMessage[]>([]);
 const [text, setText] = useState("");
 const [loading, setLoading] = useState(false);
 const [sending, setSending] = useState(false);
 const [error, setError] = useState("");

 const load = async () => {
 setLoading(true);
 setError("");
 try {
 setMessages(await ordersApi.sellerMessages(orderId, sellerOrderId));
 } catch (e) {
 const x = e as { response?: { data?: { detail?: string } }; message?: string };
 setError(x.response?.data?.detail || x.message || "Unable to load messages.");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 if (!open) return;
 void load();
 const timer = window.setInterval(() => void load(), 15000);
 return () => window.clearInterval(timer);
 }, [open, orderId, sellerOrderId]);

 const send = async () => {
 if (!text.trim()) return;
 setSending(true);
 try {
 const row = await ordersApi.sendSellerMessage(orderId, sellerOrderId, {
 message: text.trim(),
 is_internal: false,
 });
 setMessages((current) => [...current, row]);
 setText("");
 } catch (e) {
 const x = e as { response?: { data?: { detail?: string } }; message?: string };
 setError(x.response?.data?.detail || x.message || "Unable to send message.");
 } finally {
 setSending(false);
 }
 };

 return (
 <div className="min-w-0">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <div className="flex items-center gap-2">
 <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-primary/10">
 <HugeiconsIcon icon={Chatting01Icon} size={18} />
 </span>
 <div>
 <p className="font-bold">Order conversation</p>
 <p className="text-xs text-muted-foreground">
 Message the seller and logistics team about this shipment.
 </p>
 </div>
 </div>
 </div>

 <button
 onClick={() => setOpen((value) => !value)}
 className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--primary)] bg-card px-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-foreground dark:bg-transparent"
 >
 <HugeiconsIcon icon={Chatting01Icon} size={16} />
 {open ? "Close conversation" : "Open conversation"}
 </button>
 </div>

 {/* {!open && (
 <div className="mt-4 rounded-xl border border-dashed border-[var(--muted-foreground)] bg-card/70 px-4 py-6 text-center dark:border-border dark:bg-card/[0.025]">
 <p className="text-sm font-semibold text-foreground">
 Keep all order communication in one place
 </p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 Ask about packaging, pickup, dispatch, or delivery without leaving the order page.
 </p>
 </div>
 )} */}

 {open && (
 <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border">
 <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 dark:border-border">
 {/* <div>
 <p className="text-sm font-bold">Live order conversation</p>
 <p className="mt-0.5 text-[11px] text-muted-foreground">
 Updates automatically refresh every 15 seconds.
 </p>
 </div> */}
 <span className="inline-flex items-center gap-1.5 rounded-full bg-green-light-6 px-2.5 py-1 text-[10px] font-bold uppercase text-green-dark dark:bg-success/10 dark:text-emerald-300">
 <span className="h-1.5 w-1.5 rounded-full bg-success" />
 Active
 </span>
 </div>

 <div className="min-h-[320px] max-h-[430px] space-y-4 overflow-y-auto bg-muted p-4 sm:p-5 dark:bg-card/[0.035]">
 {loading && !messages.length ? (
 <p className="text-sm text-muted-foreground">Loading conversation…</p>
 ) : messages.length ? (
 messages.map((message) => {
 const isCustomer =
 (message.sender_role_label || "").toLowerCase() === "customer";
 return (
 <div
 key={message.id}
 className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
 >
 <div className="flex max-w-[88%] items-end gap-2 sm:max-w-[76%]">
 {!isCustomer && (
 <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
 {(message.sender_role_label || "P").slice(0, 1).toUpperCase()}
 </span>
 )}
 <div
 className={`rounded-xl px-4 py-3 text-sm ${
 isCustomer
 ? "rounded-br-md bg-primary text-foreground ring-1 ring-primary/20 dark:bg-primary/10 dark:ring-primary/20"
 : "rounded-bl-md bg-card text-foreground shadow-sm ring-1 ring-border dark:bg-muted dark:ring-white/5"
 }`}
 >
 <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
 {isCustomer ? "You" : message.sender_role_label || "Participant"}
 </p>
 <p className="whitespace-pre-wrap leading-5">
 {message.message}
 </p>
 {message.created_at && (
 <p className="mt-2 text-[10px] text-muted-foreground">
 {new Date(message.created_at).toLocaleString()}
 </p>
 )}
 </div>
 </div>
 </div>
 );
 })
 ) : (
 <div className="grid min-h-[260px] place-items-center text-center">
 <div>
 <HugeiconsIcon icon={Chatting01Icon}
 size={28}
 className="mx-auto mb-3 text-primary"
 />
 <p className="text-sm font-semibold">No messages yet</p>
 <p className="mt-1 text-xs text-muted-foreground">
 Start a conversation about this shipment.
 </p>
 </div>
 </div>
 )}

 {error && (
 <p className="rounded-lg bg-red-light-6 p-2 text-xs text-destructive">
 {error}
 </p>
 )}
 </div>

 <div className="border-t border-border bg-card p-3 dark:border-border sm:p-4">
 <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 focus-within:border-[var(--primary)] dark:border-border">
 <input
 value={text}
 onChange={(e) => setText(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter" && !e.shiftKey) {
 e.preventDefault();
 void send();
 }
 }}
 placeholder="Write a message about your order…"
 className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
 />
 <button
 onClick={() => void send()}
 disabled={sending || !text.trim()}
 className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
 >
 <HugeiconsIcon icon={SentIcon} size={16} />
 <span className="hidden sm:inline">{sending ? "Sending..." : "Send"}</span>
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
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
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border">
 <h2 className="mb-4 font-bold">{title}</h2>
 {children}
 </section>
 );
}

function Metric({
 label,
 value,
 icon: Icon,
}: {
 label: string;
 value: string;
 icon: IconSvgElement;
}) {
 return (
 <div className="rounded-xl border border-border bg-card p-4 dark:border-border">
 <HugeiconsIcon icon={Icon} size={16} className="text-primary" />
 <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
 {label}
 </p>
 <p className="mt-1 font-bold capitalize">{value}</p>
 </div>
 );
}

function Summary({
 label,
 value,
 saving = false,
 strong = false,
}: {
 label: string;
 value: string;
 saving?: boolean;
 strong?: boolean;
}) {
 return (
 <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
 <span className={strong ? "font-bold" : "text-muted-foreground"}>{label}</span>
 <span
 className={
 strong
 ? "text-lg font-bold"
 : saving
 ? "font-semibold text-green-dark"
 : "font-semibold"
 }
 >
 {value}
 </span>
 </div>
 );
}
