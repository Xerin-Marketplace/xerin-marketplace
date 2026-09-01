"use client";

import { ordersApi } from "@/lib/api/endpoints/commerce";
import { formatCurrency } from "@/lib/formatCurrency";
import type { SellerOrderMessage } from "@/types/api/seller-order";
import type {
  CustomerEscrowSummary,
  CustomerOrderDetail,
  SettlementProtectionClaimReason,
  Shipment,
} from "@/types/api/commerce";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  CircleDollarSign,
  Clock3,
  Download,
  MapPin,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Truck,
  MessageSquareText,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const pretty = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const paymentTone = (status?: string | null) => {
  if (status === "completed") return "bg-emerald-50 text-emerald-700";
  if (status === "failed" || status === "cancelled")
    return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
};

const shipmentTone = (status: string) => {
  if (status === "delivered") return "bg-emerald-50 text-emerald-700";
  if (["dispatched", "in_transit", "out_for_delivery"].includes(status))
    return "bg-blue-50 text-blue-700";
  if (["failed", "cancelled"].includes(status))
    return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
};

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

  const downloadInvoice = async () => {
    setDownloadingInvoice(true);
    try {
      const blob = await ordersApi.invoice(orderId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Xerin-Invoice-${orderId.slice(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Unable to download the invoice. Please try again.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const downloadPaymentReceipt = async () => {
    setDownloadingPaymentReceipt(true);
    setError("");
    try {
      const blob = await ordersApi.receipt(orderId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Xerin-Receipt-${orderId.slice(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Payment receipt is available only after a verified successful payment.");
    } finally {
      setDownloadingPaymentReceipt(false);
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
      <p className="rounded-2xl border bg-white p-10 text-center text-[#64748b] dark:bg-darkTheme-card">
        Loading order and delivery tracking...
      </p>
    );

  if (error)
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
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
          <p className="mt-1 text-sm text-[#64748b]">
            Created {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold dark:border-white/10 dark:bg-darkTheme-card"
        >
          <RefreshCw size={14} />
          Refresh Tracking
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Order Status"
          value={pretty(order.status)}
          icon={PackageCheck}
        />
        <Metric
          label="Payment"
          value={pretty(order.payment_status || "not_started")}
          icon={CircleDollarSign}
        />
        <Metric
          label="Delivery Type"
          value={pretty(order.delivery_mode || "not_set")}
          icon={Truck}
        />
        <Metric
          label="Order Total"
          value={formatCurrency(order.total, order.currency)}
          icon={BadgeCheck}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card title="Order Items">
            <div className="divide-y divide-[#e2e8f0] dark:divide-white/10">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link
                      href={`/products/${item.product_id}`}
                      className="font-semibold hover:text-[#f7941d]"
                    >
                      {item.product_name}
                    </Link>
                    <p className="mt-1 text-xs text-[#64748b]">
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
                      <p className="text-xs text-emerald-700">
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
                    className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-darkTheme-card"
                  >
                    <div className="border-b border-[#e2e8f0] bg-gradient-to-r from-[#fff8f1] via-white to-white p-4 dark:border-white/10 dark:from-orange-500/10 dark:via-darkTheme-card dark:to-darkTheme-card sm:p-5">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f7941d] text-white shadow-sm">
                            <PackageCheck size={23} />
                          </span>

                          <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
                              Seller shipment {index + 1}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                                {pretty(sellerOrder.status)}
                              </h3>
                              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#d96f00] dark:bg-orange-500/10 dark:text-orange-300">
                                Fulfilment
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-[#64748b]">
                              Seller is preparing this shipment for the logistics handover.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:min-w-[330px]">
                          <div className="rounded-xl border border-[#f1e4d6] bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.035]">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">
                              Items
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                              {sellerOrder.item_count}
                            </p>
                          </div>

                          <div className="rounded-xl border border-[#f1e4d6] bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.035]">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">
                              Seller portion
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                              {formatCurrency(
                                sellerOrder.seller_subtotal,
                                order.currency,
                              )}
                            </p>
                          </div>

                          <div className="col-span-2 rounded-xl border border-[#f1e4d6] bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.035] sm:col-span-1">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">
                              Next step
                            </p>
                            <p className="mt-1 text-sm font-bold text-[#d96f00] dark:text-orange-300">
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
              <div className="rounded-xl border border-dashed border-[#cbd5e1] p-5 text-sm text-[#64748b] dark:border-white/10">
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
              <div className="rounded-xl border border-dashed border-[#cbd5e1] p-5 text-sm text-[#64748b]">
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
                    className="rounded-xl border border-[#e2e8f0] p-4 dark:border-white/10"
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
                      <p className="mt-3 text-xs capitalize text-[#64748b]">
                        {pretty(payment.provider)}
                      </p>
                    )}
                    {payment.provider_transaction_id && (
                      <p className="mt-1 break-all text-xs text-[#64748b]">
                        Ref: {payment.provider_transaction_id}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-[#64748b]">
                      {payment.paid_at
                        ? `Paid ${new Date(payment.paid_at).toLocaleString()}`
                        : `Created ${new Date(payment.created_at).toLocaleString()}`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#cbd5e1] p-4 text-sm text-[#64748b] dark:border-white/10">
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
                      ? BadgeCheck
                      : status === "ready_for_dispatch"
                        ? PackageCheck
                        : [
                            "pending",
                            "pickup_pending",
                            "picked_up",
                            "dispatched",
                            "in_transit",
                            "out_for_delivery",
                          ].includes(status)
                          ? Truck
                          : Clock3;

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
                          className="absolute left-[21px] top-11 h-[calc(100%-24px)] w-[2px] rounded-full bg-gradient-to-b from-[#f7941d] to-[#fed7aa] dark:to-orange-500/20"
                        />
                      )}

                      <div className="relative z-[1] shrink-0">
                        <span
                          className={`grid h-11 w-11 place-items-center rounded-full border-2 shadow-sm ${
                            active
                              ? "border-[#f7941d] bg-[#fff7ed] text-[#f7941d] dark:bg-orange-500/10"
                              : "border-[#fdba74] bg-white text-[#f7941d] dark:bg-darkTheme-card"
                          }`}
                        >
                          <Icon size={19} strokeWidth={2} />
                        </span>

                        {active && (
                          <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-white bg-emerald-500 shadow-sm dark:border-darkTheme-card">
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {pretty(event.status)}
                          </p>

                          {active && (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                              Latest
                            </span>
                          )}
                        </div>

                        <p className="mt-1.5 text-[11px] font-medium text-[#94a3b8]">
                          {new Date(event.created_at).toLocaleString()}
                        </p>

                        <p className="mt-2 max-w-[30rem] text-xs leading-5 text-[#64748b] dark:text-[#cbd5e1]">
                          {description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#cbd5e1] p-5 text-center dark:border-white/10">
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border-2 border-[#fdba74] bg-[#fff7ed] text-[#f7941d] dark:bg-orange-500/10">
                  <Truck size={20} />
                </span>
                <p className="mt-3 text-sm font-semibold">
                  Tracking will start soon
                </p>
                <p className="mt-1 text-xs leading-5 text-[#64748b]">
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
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <p className="font-semibold capitalize">
                    {pretty(escrow.status)}
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8fafc] p-3 text-sm dark:bg-white/5">
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
                  <p className="text-xs leading-5 text-[#64748b]">
                    Seller funds remain protected. The release clock starts only after recipient-verified delivery. Once delivery is verified, you may accept early or Xerin will auto-release after the Admin-configured protection period if no eligible claim is holding the affected item.
                  </p>
                )}

                {escrow.delivery_verified_at && (
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs leading-5 text-orange-900">
                    <b>Delivery verified:</b> {new Date(escrow.delivery_verified_at).toLocaleString()}
                    {escrow.release_after && <><br /><b>Automatic seller release:</b> {new Date(escrow.release_after).toLocaleString()}</>}
                    {escrow.seller_release_grace_hours && <><br />Protection window: {Math.round(escrow.seller_release_grace_hours / 24 * 10) / 10} days</>}
                  </div>
                )}

                {escrow.items?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Product protection</p>
                    {escrow.items.map((protectedItem) => {
                      const item = order.items.find((row) => row.id === protectedItem.order_item_id);
                      return (
                        <div key={protectedItem.order_item_id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{item?.product_name || "Order item"}</p>
                              <p className="mt-1 text-xs text-slate-500">{pretty(protectedItem.status)} · Seller entitlement {formatCurrency(protectedItem.seller_amount, escrow.currency)}</p>
                            </div>
                            {protectedItem.release_after && <p className="text-[10px] text-slate-500">Auto {new Date(protectedItem.release_after).toLocaleDateString()}</p>}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {protectedItem.can_customer_accept && (
                              <button type="button" disabled={acceptingItemId === protectedItem.order_item_id} onClick={() => void acceptItem(protectedItem.order_item_id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
                                {acceptingItemId === protectedItem.order_item_id ? "Releasing..." : "Everything is OK — Accept item"}
                              </button>
                            )}
                            {protectedItem.can_report_problem && (
                              <button type="button" onClick={() => setClaimDialog({ scope: "item", itemId: protectedItem.order_item_id })} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">
                                Report product problem
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {escrow.can_report_problem && (
                      <button type="button" onClick={() => setClaimDialog({ scope: "order" })} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-700 dark:border-white/10 dark:text-white">
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
                    className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {approvingReceipt
                      ? "Releasing Escrow..."
                      : "Everything is OK — Accept Complete Order"}
                  </button>
                )}

                {escrow.status === "released" && (
                  <p className="text-xs font-semibold text-emerald-700">
                    You approved the order or the escrow release conditions were
                    satisfied. Seller funds are now available for payout.
                  </p>
                )}

                {escrow.status === "disputed" && (
                  <p className="text-xs font-semibold text-red-700">
                    Escrow is frozen while this order is under dispute.
                  </p>
                )}

                {escrowMessage && (
                  <p className="text-xs leading-5 text-[#64748b]">
                    {escrowMessage}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#64748b]">
                No online-payment escrow applies to this order.
              </p>
            )}
          </Card>

          <Card title="Delivery Address">
            {address ? (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#f7941d]" />
                <div className="text-sm leading-6 text-[#64748b]">
                  {address.recipient_name && (
                    <p className="font-semibold text-dark dark:text-white">
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
              <p className="text-sm text-[#64748b]">
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
            <div className="mt-3 border-t border-[#e2e8f0] pt-3 dark:border-white/10">
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
          className="inline-block font-semibold text-[#f7941d]"
        >
          ← Back to orders
        </Link>
        {order.payment_status === "completed" && (
          <button
            type="button"
            onClick={() => void downloadPaymentReceipt()}
            disabled={downloadingPaymentReceipt}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#f7941d] px-4 text-sm font-bold text-white shadow-sm disabled:opacity-60"
          >
            <Download size={16} />
            {downloadingPaymentReceipt ? "Preparing receipt..." : "Download Receipt"}
          </button>
        )}
        <button
          type="button"
          onClick={() => void downloadInvoice()}
          disabled={downloadingInvoice}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm font-bold text-slate-800 shadow-sm disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <Download size={16} />
          {downloadingInvoice ? "Preparing invoice..." : "Download Invoice"}
        </button>
      </div>

      {claimDialog && (
        <div className="fixed inset-0 z-[155] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
          <div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-darkTheme-card sm:rounded-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">Report {claimDialog.scope === "item" ? "a product" : "an order/delivery"} problem</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">Choose the closest reason. Xerin freezes seller escrow only when the reason can reasonably be seller-related or remains genuinely undetermined.</p>
              </div>
              <button onClick={() => setClaimDialog(null)} className="text-sm font-bold text-slate-500">Close</button>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-semibold">What is wrong?
                <select value={claimReason} onChange={(e) => setClaimReason(e.target.value as SettlementProtectionClaimReason)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-white/10 dark:bg-white/5">
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
                <select value={claimWhen} onChange={(e) => setClaimWhen(e.target.value as typeof claimWhen)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-white/10 dark:bg-white/5">
                  <option value="before_acceptance">Before accepting delivery</option>
                  <option value="on_opening">Immediately after opening</option>
                  <option value="after_initial_use">After initial use</option>
                  <option value="later_after_delivery">Later after delivery</option>
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-white/10"><input type="checkbox" checked={packageDamaged} onChange={(e) => setPackageDamaged(e.target.checked)} /> External package was damaged</label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-white/10"><input type="checkbox" checked={productUsed} onChange={(e) => setProductUsed(e.target.checked)} /> Product has been used</label>
              </div>
              <label className="block text-sm font-semibold">Explain what happened
                <textarea value={claimNotes} onChange={(e) => setClaimNotes(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm dark:border-white/10 dark:bg-white/5" placeholder="Be specific about the product condition and what you observed." />
              </label>
              <button type="button" disabled={claimNotes.trim().length < 5 || submittingClaim} onClick={() => void submitProtectionClaim()} className="w-full rounded-xl bg-[#f7941d] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{submittingClaim ? "Submitting..." : "Submit protection claim"}</button>
            </div>
          </div>
        </div>
      )}

      {receiptDialogOpen && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="approve-receipt-title" className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-darkTheme-card sm:rounded-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/10"><AlertTriangle size={20} /></span>
              <div><h2 id="approve-receipt-title" className="font-bold text-slate-900 dark:text-white">Approve complete receipt?</h2><p className="mt-1 text-sm leading-6 text-slate-500">Confirm only after receiving the complete order in acceptable condition. Approval releases the protected seller funds from Xerin escrow and cannot be reversed from this page.</p></div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={approvingReceipt} onClick={() => setReceiptDialogOpen(false)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold dark:border-white/10">Not yet</button><button type="button" disabled={approvingReceipt} onClick={() => void approveReceipt()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white disabled:opacity-60">{approvingReceipt && <RefreshCw className="animate-spin" size={15} />}Approve & release funds</button></div>
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
    <div className="rounded-xl border border-[#e2e8f0] p-4 dark:border-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#94a3b8]">
            Shipment {index + 1}
          </p>
          <p className="mt-1 font-bold">
            {shipment.carrier_name || "Marketplace logistics"}
          </p>
          {shipment.tracking_number && (
            <p className="mt-1 break-all text-sm text-[#64748b]">
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

      <div className="mt-4 grid gap-3 text-xs text-[#64748b] sm:grid-cols-3">
        <div>
          <p className="font-semibold text-dark dark:text-white">Items</p>
          <p className="mt-1">
            {shipment.items.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
        </div>
        <div>
          <p className="font-semibold text-dark dark:text-white">Dispatch</p>
          <p className="mt-1">
            {shipment.dispatched_at
              ? new Date(shipment.dispatched_at).toLocaleString()
              : "Pending"}
          </p>
        </div>
        <div>
          <p className="font-semibold text-dark dark:text-white">ETA</p>
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
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-[#f7941d] dark:bg-orange-500/10">
              <MessageSquareText size={18} />
            </span>
            <div>
              <p className="font-bold">Order conversation</p>
              <p className="text-xs text-[#64748b]">
                Message the seller and logistics team about this shipment.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#f7941d] bg-white px-4 text-sm font-bold text-[#d96f00] transition hover:bg-[#f7941d] hover:text-white dark:bg-transparent"
        >
          <MessageSquareText size={17} />
          {open ? "Close conversation" : "Open conversation"}
        </button>
      </div>

      {/* {!open && (
        <div className="mt-4 rounded-xl border border-dashed border-[#cbd5e1] bg-white/70 px-4 py-6 text-center dark:border-white/10 dark:bg-white/[0.025]">
          <p className="text-sm font-semibold text-slate-800 dark:text-white">
            Keep all order communication in one place
          </p>
          <p className="mt-1 text-xs leading-5 text-[#64748b]">
            Ask about packaging, pickup, dispatch, or delivery without leaving the order page.
          </p>
        </div>
      )} */}

      {open && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm dark:border-white/10 dark:bg-darkTheme-card">
          <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-white px-4 py-3 dark:border-white/10 dark:bg-darkTheme-card">
            {/* <div>
              <p className="text-sm font-bold">Live order conversation</p>
              <p className="mt-0.5 text-[11px] text-[#64748b]">
                Updates automatically refresh every 15 seconds.
              </p>
            </div> */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>

          <div className="min-h-[320px] max-h-[430px] space-y-4 overflow-y-auto bg-[#f8fafc] p-4 sm:p-5 dark:bg-white/[0.035]">
            {loading && !messages.length ? (
              <p className="text-sm text-[#64748b]">Loading conversation…</p>
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
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f7941d] text-xs font-bold text-white">
                          {(message.sender_role_label || "P").slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm ${
                          isCustomer
                            ? "rounded-br-md bg-[#fff3e8] text-slate-900 ring-1 ring-orange-100 dark:bg-orange-500/10 dark:text-white dark:ring-orange-500/20"
                            : "rounded-bl-md bg-white text-slate-900 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:text-white dark:ring-white/5"
                        }`}
                      >
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#64748b]">
                          {isCustomer ? "You" : message.sender_role_label || "Participant"}
                        </p>
                        <p className="whitespace-pre-wrap leading-5">
                          {message.message}
                        </p>
                        {message.created_at && (
                          <p className="mt-2 text-[10px] text-[#94a3b8]">
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
                  <MessageSquareText
                    size={30}
                    className="mx-auto mb-3 text-[#f7941d]"
                  />
                  <p className="text-sm font-semibold">No messages yet</p>
                  <p className="mt-1 text-xs text-[#64748b]">
                    Start a conversation about this shipment.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 p-2 text-xs text-red-600">
                {error}
              </p>
            )}
          </div>

          <div className="border-t border-[#e2e8f0] bg-white p-3 dark:border-white/10 dark:bg-darkTheme-card sm:p-4">
            <div className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white p-1.5 focus-within:border-[#f7941d] dark:border-white/10 dark:bg-white/5">
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
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#f7941d] px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                <Send size={17} />
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
    <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-darkTheme-card">
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
  icon: typeof Truck;
}) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 dark:border-white/10 dark:bg-darkTheme-card">
      <Icon size={17} className="text-[#f7941d]" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
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
      <span className={strong ? "font-bold" : "text-[#64748b]"}>{label}</span>
      <span
        className={
          strong
            ? "text-lg font-bold"
            : saving
              ? "font-semibold text-emerald-700"
              : "font-semibold"
        }
      >
        {value}
      </span>
    </div>
  );
}
