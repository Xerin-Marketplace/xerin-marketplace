"use client";

import { adminService, type ProductReview } from "@/lib/api/endpoints/admin";
import { ApiError } from "@/lib/api/client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const REVIEW_STATUSES = ["pending", "approved", "rejected", "hidden", "flagged"];

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [replyingReview, setReplyingReview] = useState<ProductReview | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await adminService.listProductReviews(
        statusFilter ? { status: statusFilter } : {}
      );
      setReviews(response);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReviews();
  }, [statusFilter]);

  const handleStatusChange = async (review: ProductReview, status: string) => {
    setBusyAction(`status-${review.id}`);
    try {
      await adminService.updateProductReview(review.id, { status });
      toast.success("Review status updated.");
      await fetchReviews();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleReply = async () => {
    if (!replyingReview) return;
    setBusyAction(`reply-${replyingReview.id}`);
    try {
      await adminService.updateProductReview(replyingReview.id, { admin_reply: replyText.trim() });
      toast.success("Reply saved.");
      setReplyingReview(null);
      setReplyText("");
      await fetchReviews();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleDelete = async (review: ProductReview) => {
    if (!window.confirm("Delete this review?")) return;
    setBusyAction(`delete-${review.id}`);
    try {
      await adminService.deleteProductReview(review.id);
      toast.success("Review deleted.");
      await fetchReviews();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <span className="text-yellow-500">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      approved: "bg-[#d9f4e1] text-[#165c30]",
      rejected: "bg-[#fde2e2] text-[#8f2727]",
      hidden: "bg-gray-100 text-gray-500",
      flagged: "bg-[#fef3c7] text-[#92400e]",
      pending: "bg-[#e0e7ff] text-[#3730a3]",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${classes[status] ?? classes.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-semibold text-[#111827]">Product Reviews</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
          >
            <option value="">All statuses</option>
            {REVIEW_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No reviews found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Product</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Rating</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Review</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{review.user_id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{review.product_id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm">{renderStars(review.rating)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{review.comment}</td>
                    <td className="px-4 py-3">{renderStatusBadge(review.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={review.status}
                          onChange={(e) => handleStatusChange(review, e.target.value)}
                          disabled={busyAction === `status-${review.id}`}
                          className="rounded-lg border border-gray-200 bg-[#f8fafc] px-2 py-1.5 text-xs text-gray-700"
                        >
                          {REVIEW_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReview(review);
                            setReplyText(review.admin_reply ?? "");
                          }}
                          className="rounded-lg bg-[#e0e7ff] px-2.5 py-1.5 text-xs text-[#3730a3] hover:bg-[#c7d2fe]"
                        >
                          Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(review)}
                          disabled={busyAction === `delete-${review.id}`}
                          className="rounded-lg bg-[#fde2e2] px-2.5 py-1.5 text-xs text-[#8f2727] hover:opacity-90 disabled:opacity-60"
                        >
                          Delete
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

      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-[#111827]">Reply to Review</h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
              placeholder="Write an admin reply..."
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setReplyingReview(null);
                  setReplyText("");
                }}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReply}
                disabled={busyAction === `reply-${replyingReview.id}`}
                className="rounded-xl bg-[#4b5563] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-60"
              >
                {busyAction === `reply-${replyingReview.id}` ? "Saving..." : "Save Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
