"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { adminService, type Order } from "@/lib/api/endpoints/admin";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};

const OrderRefundModal = ({
  order,
  onClose,
  onUpdated,
}: {
  order: Order;
  onClose: () => void;
  onUpdated: () => void;
}) => {
  const [amount, setAmount] = useState(String(order.total_amount));
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const refundAmount = Number(amount);
    if (!amount || refundAmount <= 0 || refundAmount > order.total_amount) {
      toast.error("Enter a valid refund amount not exceeding the order total.");
      return;
    }
    setBusy(true);
    try {
      await adminService.refundOrder(order.id, { amount: refundAmount, notes: notes || undefined });
      toast.success("Refund processed.");
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
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Process Refund</h3>
        <p className="mb-4 text-sm text-gray-500">
          Order: <span className="font-medium text-[#111827]">{order.order_number}</span>
          <br />
          Total: <span className="font-medium text-[#111827]">{order.currency} {order.total_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Refund Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Refund Notes (optional)</label>
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
              className="flex-1 rounded-xl bg-[#92400e] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#78350f] disabled:opacity-60"
            >
              {busy ? "Processing..." : "Process Refund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderRefundModal;
