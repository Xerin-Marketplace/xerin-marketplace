"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { adminService, type Order } from "@/services/admin.service";
import { ApiError } from "@/lib/api/client";
import OrderStatusModal from "./OrderStatusModal";
import OrderCancelModal from "./OrderCancelModal";
import OrderRefundModal from "./OrderRefundModal";
import OrderTrackingModal from "./OrderTrackingModal";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-[#fef3c7] text-[#92400e]",
  awaiting_payment: "bg-[#fef3c7] text-[#92400e]",
  payment_verification: "bg-[#fef3c7] text-[#92400e]",
  confirmed: "bg-[#d9f4e1] text-[#165c30]",
  processing: "bg-[#dbeafe] text-[#1e40af]",
  packed: "bg-[#dbeafe] text-[#1e40af]",
  ready_for_dispatch: "bg-[#dbeafe] text-[#1e40af]",
  shipped: "bg-[#dbeafe] text-[#1e40af]",
  out_for_delivery: "bg-[#dbeafe] text-[#1e40af]",
  delivered: "bg-[#d9f4e1] text-[#165c30]",
  completed: "bg-[#d9f4e1] text-[#165c30]",
  cancelled: "bg-[#fde2e2] text-[#8f2727]",
  rejected: "bg-[#fde2e2] text-[#8f2727]",
  refunded: "bg-[#fde2e2] text-[#8f2727]",
  failed: "bg-[#fde2e2] text-[#8f2727]",
};

const PAYMENT_BADGE: Record<string, string> = {
  pending: "bg-[#fef3c7] text-[#92400e]",
  authorized: "bg-[#dbeafe] text-[#1e40af]",
  paid: "bg-[#d9f4e1] text-[#165c30]",
  partially_paid: "bg-[#dbeafe] text-[#1e40af]",
  failed: "bg-[#fde2e2] text-[#8f2727]",
  refunded: "bg-[#fde2e2] text-[#8f2727]",
  partially_refunded: "bg-[#fde2e2] text-[#8f2727]",
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (value: number) => {
  return Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const OrderDetails = ({ orderId }: { orderId: string }) => {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<"status" | "cancel" | "refund" | "tracking" | null>(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await adminService.getOrder(orderId);
      setOrder(response);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrder();
  }, [orderId]);

  const customerName = order?.user
    ? [order.user.first_name, order.user.last_name].filter(Boolean).join(" ") || order.user.email
    : "-";

  const addressText = order?.address
    ? [order.address.street, order.address.city, order.address.region, order.address.country, order.address.postal_code]
        .filter(Boolean)
        .join(", ")
    : "-";

  if (loading) return <div className="py-8 text-center text-gray-600">Loading order...</div>;
  if (!order) return <div className="py-8 text-center text-gray-500">Order not found.</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm text-[#4b5563] hover:underline">
            ← Back to orders
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-[#111827]">Order {order.order_number}</h2>
          <p className="text-sm text-gray-500">Created {formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveModal("status")}
            className="rounded-xl bg-[#4b5563] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937]"
          >
            Update Status
          </button>
          <button
            type="button"
            onClick={() => setActiveModal("tracking")}
            className="rounded-xl bg-[#f8fafc] px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200"
          >
            Tracking
          </button>
          {order.status !== "cancelled" && order.status !== "refunded" && order.status !== "completed" && order.status !== "delivered" && (
            <button
              type="button"
              onClick={() => setActiveModal("cancel")}
              className="rounded-xl bg-[#fde2e2] px-4 py-2.5 text-sm font-medium text-[#8f2727] hover:bg-[#fecaca]"
            >
              Cancel Order
            </button>
          )}
          {(order.status === "completed" || order.status === "delivered" || order.payment_status === "paid") && (
            <button
              type="button"
              onClick={() => setActiveModal("refund")}
              className="rounded-xl bg-[#fef3c7] px-4 py-2.5 text-sm font-medium text-[#92400e] hover:bg-[#fde68a]"
            >
              Refund
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-[#111827]">Order Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                {order.status.replace("_", " ")}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_BADGE[order.payment_status] ?? "bg-gray-100 text-gray-600"}`}>
                {order.payment_status.replace("_", " ")}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivery Method</p>
              <p className="text-sm font-medium text-[#111827]">{order.delivery_method ?? "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Courier</p>
              <p className="text-sm font-medium text-[#111827]">{order.courier_name ?? "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tracking Number</p>
              <p className="text-sm font-medium text-[#111827]">{order.tracking_number ?? "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Delivery</p>
              <p className="text-sm font-medium text-[#111827]">{formatDate(order.estimated_delivery_date)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[#111827]">Order Totals</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-[#111827]">{order.currency} {formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Discount</span>
              <span className="font-medium text-[#111827]">{order.currency} {formatPrice(order.discount_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium text-[#111827]">{order.currency} {formatPrice(order.shipping_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tax</span>
              <span className="font-medium text-[#111827]">{order.currency} {formatPrice(order.tax_amount)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2">
              <span className="font-medium text-[#111827]">Total</span>
              <span className="font-semibold text-[#111827]">{order.currency} {formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[#111827]">Customer Information</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium text-gray-500">Name:</span> {customerName}
            </p>
            <p>
              <span className="font-medium text-gray-500">Email:</span> {order.user?.email ?? "-"}
            </p>
            <p>
              <span className="font-medium text-gray-500">Phone:</span> {order.user?.phone ?? "-"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[#111827]">Delivery Address</h3>
          <p className="text-sm text-[#111827]">{addressText}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Order Items</h3>
        {order.items?.length === 0 ? (
          <p className="text-sm text-gray-500">No items.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Product</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">SKU</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Qty</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Unit Price</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-[#111827]">
                      {item.product_name}
                      {item.variant_name ? <span className="text-gray-500"> — {item.variant_name}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.currency} {formatPrice(item.unit_price)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.currency} {formatPrice(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Payment Information</h3>
        {order.payments?.length === 0 ? (
          <p className="text-sm text-gray-500">No payment records.</p>
        ) : (
          <div className="space-y-3">
            {order.payments?.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                <div>
                  <p className="text-sm font-medium text-[#111827]">{payment.method.replace("_", " ")}</p>
                  <p className="text-xs text-gray-500">Ref: {payment.transaction_reference ?? "-"}</p>
                  <p className="text-xs text-gray-500">{formatDate(payment.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#111827]">{payment.currency} {formatPrice(payment.amount)}</p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_BADGE[payment.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {payment.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Status Timeline</h3>
        {order.status_history?.length === 0 ? (
          <p className="text-sm text-gray-500">No status history.</p>
        ) : (
          <div className="relative border-l-2 border-gray-200 pl-4 space-y-4">
            {order.status_history?.map((entry, index) => (
              <div key={entry.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-[#4b5563]" />
                <p className="text-sm font-medium text-[#111827]">{entry.status.replace("_", " ")}</p>
                {entry.previous_status ? (
                  <p className="text-xs text-gray-500">From: {entry.previous_status.replace("_", " ")}</p>
                ) : null}
                {entry.notes ? <p className="text-xs text-gray-500">{entry.notes}</p> : null}
                <p className="text-xs text-gray-400">{formatDate(entry.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Administrative Notes</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium text-gray-500">Customer Notes:</span> {order.customer_notes ?? "-"}
          </p>
          <p>
            <span className="font-medium text-gray-500">Admin Notes:</span> {order.admin_notes ?? "-"}
          </p>
          <p>
            <span className="font-medium text-gray-500">Cancellation Reason:</span> {order.cancellation_reason ?? "-"}
          </p>
          <p>
            <span className="font-medium text-gray-500">Refund Notes:</span> {order.refund_notes ?? "-"}
          </p>
        </div>
      </div>

      {activeModal === "status" && (
        <OrderStatusModal order={order} onClose={() => setActiveModal(null)} onUpdated={fetchOrder} />
      )}
      {activeModal === "cancel" && (
        <OrderCancelModal order={order} onClose={() => setActiveModal(null)} onUpdated={fetchOrder} />
      )}
      {activeModal === "refund" && (
        <OrderRefundModal order={order} onClose={() => setActiveModal(null)} onUpdated={fetchOrder} />
      )}
      {activeModal === "tracking" && (
        <OrderTrackingModal order={order} onClose={() => setActiveModal(null)} onUpdated={fetchOrder} />
      )}
    </div>
  );
};

export default OrderDetails;
