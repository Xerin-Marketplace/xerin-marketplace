"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { adminService, type Order } from "@/services/admin.service";
import { ApiError } from "@/lib/api/client";

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

const OrderTracking = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const filteredOrders = orders.filter((order) => {
    const term = search.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(term) ||
      (order.tracking_number ?? "").toLowerCase().includes(term) ||
      (order.user?.email ?? "").toLowerCase().includes(term) ||
      `${order.user?.first_name ?? ""} ${order.user?.last_name ?? ""}`.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [shipped, outForDelivery, delivered] = await Promise.all([
          adminService.listOrders({ status: "shipped", page_size: 100 }),
          adminService.listOrders({ status: "out_for_delivery", page_size: 100 }),
          adminService.listOrders({ status: "delivered", page_size: 100 }),
        ]);
        const all = [...shipped.results, ...outForDelivery.results, ...delivered.results];
        const unique = Array.from(new Map(all.map((o) => [o.id, o])).values());
        setOrders(unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return;
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-2 text-xl font-semibold text-[#111827]">Order Tracking</h3>
      <p className="mb-4 text-sm text-gray-500">Orders currently in transit or recently delivered</p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search order number or tracking number"
        className="mb-4 rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700 w-full sm:w-[320px]"
      />

      {loading ? (
        <div className="py-8 text-center text-gray-600">Loading tracking...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          {orders.length === 0 ? "No orders in transit or delivered." : "No matching orders found."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Order Number</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Customer</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Courier</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Tracking</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Est. Delivery</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    <Link href={`/admin/orders/${order.id}`} className="text-[#4b5563] hover:underline">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.user
                      ? [order.user.first_name, order.user.last_name].filter(Boolean).join(" ") || order.user.email
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.courier_name ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.tracking_number ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(order.estimated_delivery_date)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(order.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
