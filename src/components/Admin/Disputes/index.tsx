"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { adminService } from "@/lib/api/endpoints/admin";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

const STATUS_BADGES: Record<string, string> = {
  open: "bg-[#fef3c7] text-[#92400e]",
  under_review: "bg-[#e0f2fe] text-[#075985]",
  resolved: "bg-[#d1fae5] text-[#065f46]",
  closed: "bg-[#f3f4f6] text-[#4b5563]",
};

export default function AdminDisputes() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "";

  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const data = await adminService.listDisputes({
        status: statusFilter || undefined,
      });
      setDisputes(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDisputes();
  }, [statusFilter]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">Order Disputes</h2>
            <p className="text-sm text-gray-500 mt-1">Review and resolve buyer-seller disputes.</p>
          </div>
          <div className="flex gap-2">
            <a
              href="/admin/disputes"
              className={`rounded-lg px-3 py-2 text-sm font-medium ${!statusFilter ? "bg-[#4b5563] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              All
            </a>
            <a
              href="/admin/disputes?status=open"
              className={`rounded-lg px-3 py-2 text-sm font-medium ${statusFilter === "open" ? "bg-[#4b5563] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Open
            </a>
            <a
              href="/admin/disputes?status=resolved"
              className={`rounded-lg px-3 py-2 text-sm font-medium ${statusFilter === "resolved" ? "bg-[#4b5563] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Resolved
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
        {loading ? (
          <p className="text-gray-500">Loading disputes...</p>
        ) : disputes.length === 0 ? (
          <p className="text-gray-500">No disputes found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Dispute ID</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Order</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Reason</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {disputes.map((dispute) => (
                  <tr key={dispute.id}>
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">#{dispute.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{dispute.order_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{dispute.reason}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_BADGES[dispute.status] ?? STATUS_BADGES.closed
                        }`}
                      >
                        {dispute.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(dispute.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
