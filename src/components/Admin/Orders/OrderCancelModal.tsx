"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { adminService, type Order } from "@/lib/api/endpoints/admin";
import { ApiError } from "@/lib/api/client";

const CANCELLATION_REASONS = [
  "Customer requested cancellation",
  "Payment failed",
  "Product out of stock",
  "Duplicate order",
  "Fraud suspicion",
  "Delivery unavailable",
  "Admin cancellation",
];

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};

const OrderCancelModal = ({
  order,
  onClose,
  onUpdated,
}: {
  order: Order;
  onClose: () => void;
  onUpdated: () => void;
}) => {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Cancellation reason is required.");
      return;
    }
    setBusy(true);
    try {
      await adminService.cancelOrder(order.id, { reason: reason.trim() });
      toast.success("Order cancelled.");
      onUpdated();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Cancel Order</h3>
        <p className="mb-4 text-sm text-gray-500">
          Order: <span className="font-medium text-[#111827]">{order.order_number}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Cancellation Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mb-2 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
            >
              <option value="">Select a reason</option>
              {CANCELLATION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Or enter a custom reason"
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-[#8f2727] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#7a2020] disabled:opacity-60"
            >
              {busy ? "Cancelling..." : "Cancel Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderCancelModal;
