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
  const [viewing, setViewing] = useState<any | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const showUnavailable = (action: string) => {
    toast(`${action} is not available yet.`, { icon: "ℹ️" });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">Order Disputes</h2>
            <p className="text-sm text-gray-500 mt-1">Review disputes. Resolution workflow is coming soon.</p>
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
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
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
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setViewing(dispute)}
                          className="rounded-lg bg-[#dbeafe] px-2.5 py-1.5 text-xs font-medium text-[#1e40af] hover:bg-[#bfdbfe]"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          disabled={busyId === dispute.id}
                          onClick={() => showUnavailable("Resolve dispute")}
                          className="rounded-lg bg-[#d1fae5] px-2.5 py-1.5 text-xs font-medium text-[#065f46] hover:bg-[#a7f3d0] disabled:opacity-60"
                        >
                          Resolve
                        </button>
                        <button
                          type="button"
                          disabled={busyId === dispute.id}
                          onClick={() => showUnavailable("Close dispute")}
                          className="rounded-lg bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                        >
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#111827]">Dispute #{viewing.id}</h3>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order</span>
                <span className="font-medium text-[#111827]">{viewing.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGES[viewing.status] ?? STATUS_BADGES.closed}`}>
                  {viewing.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-[#111827]">{new Date(viewing.created_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Reason</span>
                <p className="mt-1 rounded-xl bg-[#f8fafc] p-3 text-[#111827]">{viewing.reason}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => showUnavailable("Resolve dispute")}
                className="rounded-xl bg-[#4b5563] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937]"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
