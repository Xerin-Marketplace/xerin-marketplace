"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminService, type ProductReview } from "@/lib/api/endpoints/admin";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
};

const STATUS_BADGES: Record<string, string> = {
  pending: "bg-[#fef3c7] text-[#92400e]",
  approved: "bg-[#d1fae5] text-[#065f46]",
  rejected: "bg-[#fde2e2] text-[#8f2727]",
  hidden: "bg-[#f3f4f6] text-[#4b5563]",
  flagged: "bg-[#fecaca] text-[#8f2727]",
};

const AdminCustomerReviews = () => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await adminService.listProductReviews({ status: status || undefined });
      setReviews(data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [status]);

  const total = reviews.length;
  const pending = reviews.filter((r) => r.status === "pending").length;
  const approved = reviews.filter((r) => r.status === "approved").length;
  const reported = reviews.filter((r) => r.status === "flagged").length;
  const average = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total Reviews" value={total} />
        <SummaryCard label="Pending" value={pending} />
        <SummaryCard label="Approved" value={approved} />
        <SummaryCard label="Reported" value={reported} />
        <SummaryCard label="Average Rating" value={average} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2 text-sm text-gray-700"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Reported</option>
          </select>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No reviews found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Product</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Rating</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Comment</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">-</td>
                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{r.rating}/5</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{r.comment ?? "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGES[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-1">
                        <button type="button" className="rounded-lg bg-[#d1fae5] px-2.5 py-1.5 text-xs font-medium text-[#065f46] hover:bg-[#a7f3d0]">Approve</button>
                        <button type="button" className="rounded-lg bg-[#f8fafc] px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100">Hide</button>
                      </div>
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
};

const SummaryCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
    <p className="mt-2 text-xl font-semibold text-[#111827]">{value}</p>
  </div>
);

export default AdminCustomerReviews;
