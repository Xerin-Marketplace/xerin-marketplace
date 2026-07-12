"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { adminService, type Order, type PaginatedOrders } from "@/services/admin.service";
import { ApiError } from "@/lib/api/client";
import OrderStatusModal from "./OrderStatusModal";
import OrderCancelModal from "./OrderCancelModal";
import OrderRefundModal from "./OrderRefundModal";
import OrderTrackingModal from "./OrderTrackingModal";

const ALL_STATUSES = [
  { value: "", label: "All order statuses" },
  { value: "pending", label: "Pending" },
  { value: "awaiting_payment", label: "Awaiting Payment" },
  { value: "payment_verification", label: "Payment Verification" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "ready_for_dispatch", label: "Ready for Dispatch" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

const STATUS_OPTIONS_BY_VIEW: Record<string, { value: string; label: string }[]> = {
  all: ALL_STATUSES,
  pending: [
    { value: "", label: "All pending statuses" },
    { value: "pending", label: "Pending" },
    { value: "awaiting_payment", label: "Awaiting Payment" },
    { value: "payment_verification", label: "Payment Verification" },
  ],
  processing: [
    { value: "", label: "All processing statuses" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "packed", label: "Packed" },
    { value: "ready_for_dispatch", label: "Ready for Dispatch" },
  ],
  completed: [
    { value: "", label: "All completed statuses" },
    { value: "delivered", label: "Delivered" },
    { value: "completed", label: "Completed" },
  ],
  cancelled: [
    { value: "", label: "All cancelled statuses" },
    { value: "cancelled", label: "Cancelled" },
    { value: "rejected", label: "Rejected" },
    { value: "refunded", label: "Refunded" },
    { value: "failed", label: "Failed" },
  ],
};

const PAYMENT_STATUSES = [
  { value: "", label: "All payment statuses" },
  { value: "pending", label: "Pending" },
  { value: "authorized", label: "Authorized" },
  { value: "paid", label: "Paid" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "partially_refunded", label: "Partially Refunded" },
];

const PAYMENT_METHODS = [
  { value: "", label: "All payment methods" },
  { value: "cash_on_delivery", label: "Cash on Delivery" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
];

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

type ModalState = {
  type: "status" | "cancel" | "refund" | "tracking" | null;
  order: Order | null;
};

type OrderListProps = {
  view?: string;
  status?: string;
  title: string;
  subtitle?: string;
};

const OrderList = ({ view = "all", status, title, subtitle }: OrderListProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(status ?? "");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [modal, setModal] = useState<ModalState>({ type: null, order: null });

  const fetchOrders = async (currentPage: number) => {
    setLoading(true);
    try {
      const params: Parameters<typeof adminService.listOrders>[0] = {
        page: currentPage,
        page_size: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
      if (paymentMethodFilter) params.payment_method = paymentMethodFilter;
      if (minAmount) params.min_amount = Number(minAmount);
      if (maxAmount) params.max_amount = Number(maxAmount);
      if (dateFrom) params.date_from = `${dateFrom}T00:00:00`;
      if (dateTo) params.date_to = `${dateTo}T23:59:59`;

      const response = await adminService.listOrders(params);
      setOrders(response.results);
      setTotal(response.total);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders(1);
    setPage(1);
  }, [status, statusFilter, paymentStatusFilter, paymentMethodFilter, pageSize, minAmount, maxAmount, dateFrom, dateTo]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchOrders(1);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const refresh = () => void fetchOrders(page);

  const customerName = (order: Order) => {
    if (!order.user) return "-";
    return [order.user.first_name, order.user.last_name].filter(Boolean).join(" ") || order.user.email;
  };

  const itemCount = (order: Order) => order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">{title}</h2>
            {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
          </div>
          <div className="text-sm text-gray-500">
            {total} order{total === 1 ? "" : "s"} found
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number..."
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700 w-full sm:w-[240px]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
          >
            {(STATUS_OPTIONS_BY_VIEW[view] ?? ALL_STATUSES).map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
          >
            {PAYMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
          >
            {PAYMENT_METHODS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="Min amount"
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700 w-[120px]"
          />
          <input
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            placeholder="Max amount"
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700 w-[120px]"
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
          />
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-base font-medium text-gray-700">No {title.toLowerCase()} found.</p>
            <p className="mt-1 text-sm text-gray-500">There are currently no orders matching your filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter(status ?? "");
                setPaymentStatusFilter("");
                setPaymentMethodFilter("");
                setMinAmount("");
                setMaxAmount("");
                setDateFrom("");
                setDateTo("");
                setPage(1);
                void fetchOrders(1);
              }}
              className="mt-4 rounded-lg bg-[#f8fafc] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Order Number</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Items</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Total</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Payment</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Delivery</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Created</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">
                      <Link href={`/admin/orders/${order.id}`} className="text-[#4b5563] hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{customerName(order)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{itemCount(order)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.currency} {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_BADGE[order.payment_status] ?? "bg-gray-100 text-gray-600"}`}>
                        {order.payment_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.delivery_method ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="rounded-lg bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          View
                        </Link>

                        {view === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setModal({ type: "status", order })}
                              className="rounded-lg bg-[#d9f4e1] px-2.5 py-1.5 text-xs font-medium text-[#165c30] hover:bg-[#b9e9c8]"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setModal({ type: "status", order })}
                              className="rounded-lg bg-[#dbeafe] px-2.5 py-1.5 text-xs font-medium text-[#1e40af] hover:bg-[#bfdbfe]"
                            >
                              Verify
                            </button>
                            <button
                              type="button"
                              onClick={() => setModal({ type: "cancel", order })}
                              className="rounded-lg bg-[#fde2e2] px-2.5 py-1.5 text-xs font-medium text-[#8f2727] hover:bg-[#fecaca]"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {view === "processing" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setModal({ type: "status", order })}
                              className="rounded-lg bg-[#dbeafe] px-2.5 py-1.5 text-xs font-medium text-[#1e40af] hover:bg-[#bfdbfe]"
                            >
                              Mark Packed
                            </button>
                            <button
                              type="button"
                              onClick={() => setModal({ type: "tracking", order })}
                              className="rounded-lg bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                            >
                              Tracking
                            </button>
                            <button
                              type="button"
                              onClick={() => setModal({ type: "status", order })}
                              className="rounded-lg bg-[#d9f4e1] px-2.5 py-1.5 text-xs font-medium text-[#165c30] hover:bg-[#b9e9c8]"
                            >
                              Dispatch
                            </button>
                          </>
                        )}

                        {view === "completed" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setModal({ type: "refund", order })}
                              className="rounded-lg bg-[#fef3c7] px-2.5 py-1.5 text-xs font-medium text-[#92400e] hover:bg-[#fde68a]"
                            >
                              Refund
                            </button>
                            <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-500">
                              Invoice
                            </span>
                          </>
                        )}

                        {view === "cancelled" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setModal({ type: "refund", order })}
                              className="rounded-lg bg-[#fef3c7] px-2.5 py-1.5 text-xs font-medium text-[#92400e] hover:bg-[#fde68a]"
                            >
                              Refund
                            </button>
                            <button
                              type="button"
                              onClick={() => setModal({ type: "status", order })}
                              className="rounded-lg bg-[#dbeafe] px-2.5 py-1.5 text-xs font-medium text-[#1e40af] hover:bg-[#bfdbfe]"
                            >
                              Restore
                            </button>
                          </>
                        )}

                        {view === "all" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setModal({ type: "status", order })}
                              className="rounded-lg bg-[#dbeafe] px-2.5 py-1.5 text-xs font-medium text-[#1e40af] hover:bg-[#bfdbfe]"
                            >
                              Status
                            </button>
                            <button
                              type="button"
                              onClick={() => setModal({ type: "tracking", order })}
                              className="rounded-lg bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                            >
                              Tracking
                            </button>
                            {order.status !== "cancelled" && order.status !== "refunded" && order.status !== "completed" && order.status !== "delivered" && (
                              <button
                                type="button"
                                onClick={() => setModal({ type: "cancel", order })}
                                className="rounded-lg bg-[#fde2e2] px-2.5 py-1.5 text-xs font-medium text-[#8f2727] hover:bg-[#fecaca]"
                              >
                                Cancel
                              </button>
                            )}
                            {(order.status === "completed" || order.status === "delivered" || order.payment_status === "paid") && (
                              <button
                                type="button"
                                onClick={() => setModal({ type: "refund", order })}
                                className="rounded-lg bg-[#fef3c7] px-2.5 py-1.5 text-xs font-medium text-[#92400e] hover:bg-[#fde68a]"
                              >
                                Refund
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-lg border border-gray-200 bg-[#f8fafc] px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const prev = Math.max(1, page - 1);
                setPage(prev);
                void fetchOrders(prev);
              }}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => {
                const next = Math.min(totalPages, page + 1);
                setPage(next);
                void fetchOrders(next);
              }}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {modal.type === "status" && modal.order && (
        <OrderStatusModal order={modal.order} onClose={() => setModal({ type: null, order: null })} onUpdated={refresh} />
      )}
      {modal.type === "cancel" && modal.order && (
        <OrderCancelModal order={modal.order} onClose={() => setModal({ type: null, order: null })} onUpdated={refresh} />
      )}
      {modal.type === "refund" && modal.order && (
        <OrderRefundModal order={modal.order} onClose={() => setModal({ type: null, order: null })} onUpdated={refresh} />
      )}
      {modal.type === "tracking" && modal.order && (
        <OrderTrackingModal order={modal.order} onClose={() => setModal({ type: null, order: null })} onUpdated={refresh} />
      )}
    </div>
  );
};

export default OrderList;
