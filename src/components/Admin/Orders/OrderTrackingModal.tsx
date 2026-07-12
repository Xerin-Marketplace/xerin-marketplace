"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { adminService, type Order } from "@/services/admin.service";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};

const OrderTrackingModal = ({
  order,
  onClose,
  onUpdated,
}: {
  order: Order;
  onClose: () => void;
  onUpdated: () => void;
}) => {
  const [courierName, setCourierName] = useState(order.courier_name ?? "");
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number ?? "");
  const [estimatedDate, setEstimatedDate] = useState(
    order.estimated_delivery_date ? order.estimated_delivery_date.slice(0, 16) : ""
  );
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: Parameters<typeof adminService.updateOrderTracking>[1] = {
        courier_name: courierName || undefined,
        tracking_number: trackingNumber || undefined,
        estimated_delivery_date: estimatedDate ? new Date(estimatedDate).toISOString() : undefined,
      };
      await adminService.updateOrderTracking(order.id, payload);
      toast.success("Tracking information updated.");
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
        <h3 className="mb-4 text-lg font-semibold text-[#111827]">Update Tracking Information</h3>
        <p className="mb-4 text-sm text-gray-500">
          Order: <span className="font-medium text-[#111827]">{order.order_number}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Courier / Driver</label>
            <input
              type="text"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Estimated Delivery Date</label>
            <input
              type="datetime-local"
              value={estimatedDate}
              onChange={(e) => setEstimatedDate(e.target.value)}
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
              {busy ? "Updating..." : "Update Tracking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderTrackingModal;
