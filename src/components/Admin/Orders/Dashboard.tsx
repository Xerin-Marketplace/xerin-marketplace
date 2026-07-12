"use client";

import { useEffect, useState } from "react";
import OrderList from "./OrderList";
import OrderTracking from "./OrderTracking";
import { adminService } from "@/services/admin.service";
import { ApiError } from "@/lib/api/client";

const VIEW_CONFIG: Record<string, { title: string; subtitle?: string; status?: string }> = {
  all: { title: "All Orders" },
  pending: {
    title: "Pending Orders",
    subtitle: "Orders awaiting payment confirmation, admin verification, or seller acceptance",
    status: "pending",
  },
  processing: {
    title: "Processing Orders",
    subtitle: "Orders that are confirmed and being prepared for dispatch",
    status: "processing",
  },
  completed: {
    title: "Completed Orders",
    subtitle: "Orders that have been delivered and finalized",
    status: "completed",
  },
  cancelled: {
    title: "Cancelled Orders",
    subtitle: "Orders that have been cancelled by customer, admin, seller, or system",
    status: "cancelled",
  },
  tracking: { title: "Order Tracking" },
};

type CountCard = {
  key: string;
  label: string;
  status: string;
  color: string;
};

const COUNT_CARDS: CountCard[] = [
  { key: "all", label: "Total Orders", status: "", color: "bg-gray-100 text-gray-700" },
  { key: "pending", label: "Pending", status: "pending", color: "bg-[#fef3c7] text-[#92400e]" },
  { key: "processing", label: "Processing", status: "processing", color: "bg-[#dbeafe] text-[#1e40af]" },
  { key: "completed", label: "Completed", status: "completed", color: "bg-[#d9f4e1] text-[#165c30]" },
  { key: "cancelled", label: "Cancelled", status: "cancelled", color: "bg-[#fde2e2] text-[#8f2727]" },
];

const AdminOrdersDashboard = ({ initialTab = "all" }: { initialTab?: string }) => {
  const view = VIEW_CONFIG[initialTab] ?? VIEW_CONFIG.all;
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setCountsLoading(true);
      try {
        const results = await Promise.all(
          COUNT_CARDS.map((card) =>
            adminService.listOrders({ status: card.status || undefined, page_size: 1 })
          )
        );
        const next: Record<string, number> = {};
        COUNT_CARDS.forEach((card, index) => {
          next[card.key] = results[index].total;
        });
        setCounts(next);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return;
        // ignore other count errors
      } finally {
        setCountsLoading(false);
      }
    };
    void fetchCounts();
  }, []);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-[#111827]">Order Management</h2>
        <p className="text-sm text-gray-500">Manage customer orders, track deliveries, and process refunds</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {COUNT_CARDS.map((card) => (
          <div key={card.key} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{card.label}</p>
            <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-2xl font-semibold ${card.color}`}>
              {countsLoading ? "-" : counts[card.key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {initialTab === "tracking" ? (
        <OrderTracking />
      ) : (
        <OrderList view={initialTab} status={view.status} title={view.title} subtitle={view.subtitle} />
      )}
    </div>
  );
};

export default AdminOrdersDashboard;
