"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { adminService, type Order } from "@/lib/api/endpoints/admin";
import { ApiError } from "@/lib/api/client";

const STATUSES = [
  "pending",
  "awaiting_payment",
  "payment_verification",
  "confirmed",
  "processing",
  "packed",
  "ready_for_dispatch",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "rejected",
  "refunded",
  "failed",
];

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};

const OrderStatusModal = ({
  order,
  onClose,
  onUpdated,
}: {
  order: Order;
  onClose: () => void;
  onUpdated: () => void;
}) => {
  const [status, setStatus] = useState<string>(order.status);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminService.updateOrderStatus(order.id, { status, notes: notes || undefined });
      toast.success("Order status updated.");
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
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Update Order Status</h3>
        <p className="mb-4 text-sm text-gray-500">
          Order: <span className="font-medium text-[#111827]">{order.order_number}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="flex-1 rounded-xl bg-[#4b5563] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-60"
            >
              {busy ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderStatusModal;
