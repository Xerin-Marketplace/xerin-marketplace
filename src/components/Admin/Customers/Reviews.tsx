"use client";


import { Spinner } from "@/components/ui/Spinner";
import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { CheckmarkCircle02Icon, ArrowLeft01Icon, ArrowRight01Icon, ViewIcon, Flag02Icon, Chatting01Icon, RefreshCwIcon, Search01Icon, StarIcon, UserIcon, Cancel01Icon, CancelCircleIcon } from "@hugeicons/core-free-icons";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import {
 customersService,
 type CustomerReview,
} from "@/lib/api/endpoints/customers";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
 if (error instanceof ApiError) return error.message;
 if (error instanceof Error) return error.message;
 return "We couldn't load this information. Please refresh the page or try again later.";
};

const STATUS_BADGES: Record<string, string> = {
 pending: "border-yellow-light-2 bg-yellow-light-4 text-yellow-dark-2",
 approved: "border-green-light-4 bg-green-light-6 text-green-dark",
 rejected: "border-red-light-4 bg-red-light-6 text-red-dark",
 hidden: "border-border bg-muted text-muted-foreground",
 reported: "border-red-light-4 bg-red-light-6 text-red-dark",
};

const pretty = (value: string) =>
 value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AdminCustomerReviews() {
 const [reviews, setReviews] = useState<CustomerReview[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [query, setQuery] = useState("");
 const [debouncedQuery, setDebouncedQuery] = useState("");
 const [status, setStatus] = useState("");
 const [rating, setRating] = useState("");
 const [reportedOnly, setReportedOnly] = useState(false);
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(20);
 const [total, setTotal] = useState(0);
 const [totalPages, setTotalPages] = useState(0);
 const [selected, setSelected] = useState<CustomerReview | null>(null);
 const [detailLoading, setDetailLoading] = useState(false);
 const [moderationBusy, setModerationBusy] = useState<string | null>(null);
 const [adminReply, setAdminReply] = useState("");

 useEffect(() => {
 const timer = window.setTimeout(() => {
 setDebouncedQuery(query.trim());
 setPage(1);
 }, 350);
 return () => window.clearTimeout(timer);
 }, [query]);

 const fetchData = async () => {
 setLoading(true);
 setError("");

 try {
 const data = await customersService.listCustomerReviews({
 page,
 page_size: pageSize,
 search: debouncedQuery || undefined,
 status: status || undefined,
 rating: rating ? Number(rating) : undefined,
 reported: reportedOnly ? true : undefined,
 });

 setReviews(data.results);
 setTotal(data.total);
 setTotalPages(data.total_pages);
 } catch (cause) {
 if (cause instanceof ApiError && cause.status === 401) return;
 const message = getErrorMessage(cause);
 setError(message);
 toast.error(message);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void fetchData();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [page, pageSize, debouncedQuery, status, rating, reportedOnly]);

 const openReview = async (review: CustomerReview) => {
 setSelected(review);
 setAdminReply(review.admin_reply || "");
 setDetailLoading(true);

 try {
 const detail = await customersService.getCustomerReview(review.id);
 setSelected(detail);
 setAdminReply(detail.admin_reply || "");
 } catch {
 // Keep the drawer open with the summary row if the detail request fails.
 } finally {
 setDetailLoading(false);
 }
 };

 const moderateReview = async (
 review: CustomerReview,
 nextStatus: "approved" | "rejected" | "hidden",
 reply?: string | null,
 ) => {
 const actionKey = `${nextStatus}:${review.id}`;
 setModerationBusy(actionKey);

 try {
 const updated = await customersService.moderateCustomerReview(review.id, {
 status: nextStatus,
 admin_reply: reply ?? undefined,
 });

 setReviews((current) =>
 current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
 );
 setSelected((current) =>
 current?.id === updated.id ? { ...current, ...updated } : current,
 );
 setAdminReply(updated.admin_reply || "");
 toast.success(
 nextStatus === "approved"
 ? "Review approved and published."
 : nextStatus === "rejected"
 ? "Review rejected."
 : "Review hidden from the store.",
 );
 await fetchData();
 } catch (cause) {
 toast.error(getErrorMessage(cause));
 } finally {
 setModerationBusy(null);
 }
 };

 const saveAdminReply = async () => {
 if (!selected) return;
 setModerationBusy(`reply:${selected.id}`);

 try {
 const updated = await customersService.moderateCustomerReview(selected.id, {
 admin_reply: adminReply.trim() || null,
 });
 setSelected(updated);
 setReviews((current) =>
 current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
 );
 toast.success("Admin reply saved.");
 } catch (cause) {
 toast.error(getErrorMessage(cause));
 } finally {
 setModerationBusy(null);
 }
 };

 const stats = useMemo(
 () => ({
 loaded: reviews.length,
 pending: reviews.filter((review) => review.status === "pending").length,
 flagged: reviews.filter(
 (review) => review.status === "reported" || review.reported,
 ).length,
 average: reviews.length
 ? (
 reviews.reduce((sum, review) => sum + review.rating, 0) /
 reviews.length
 ).toFixed(1)
 : "0.0",
 }),
 [reviews],
 );

 const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
 const to = Math.min(page * pageSize, total);

 return (
 <div className="space-y-5">
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <p className="text-xs font-bold uppercase tracking-[.14em] text-primary">
 Customer voice
 </p>
 <h2 className="mt-1 text-2xl font-bold text-foreground">
 Customer Reviews
 </h2>
 <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
 Review customer feedback across products, identify
 reported content and inspect the customer, seller and product context
 before moderation.
 </p>
 </section>

 <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <Metric label="Total matching reviews" value={total} icon={Chatting01Icon} />
 <Metric label="Pending on page" value={stats.pending} icon={RefreshCwIcon} />
 <Metric label="Reported on page" value={stats.flagged} icon={Flag02Icon} />
 <Metric label="Average rating" value={`${stats.average}/5`} icon={StarIcon} />
 </section>

 <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.7fr)_repeat(3,minmax(145px,1fr))]">
 <div className="relative">
 <HugeiconsIcon icon={Search01Icon}
 size={16}
 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
 />
 <input
 value={query}
 onChange={(event) => setQuery(event.target.value)}
 placeholder="Search customer, product, seller or review..."
 className="h-11 w-full rounded-xl border-2 border-border pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)]"
 />
 </div>

 <select
 value={status}
 onChange={(event) => {
 setStatus(event.target.value);
 setPage(1);
 }}
 className="h-11 rounded-xl border-2 border-border bg-card px-3 text-sm"
 >
 <option value="">All statuses</option>
 {["pending", "approved", "hidden", "reported", "rejected"].map(
 (value) => (
 <option key={value} value={value}>
 {pretty(value)}
 </option>
 ),
 )}
 </select>

 <select
 value={rating}
 onChange={(event) => {
 setRating(event.target.value);
 setPage(1);
 }}
 className="h-11 rounded-xl border-2 border-border bg-card px-3 text-sm"
 >
 <option value="">All ratings</option>
 {[5, 4, 3, 2, 1].map((value) => (
 <option key={value} value={value}>
 {value} star{value === 1 ? "" : "s"}
 </option>
 ))}
 </select>

 <label className="flex h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-3 text-sm font-medium text-muted-foreground">
 <input
 type="checkbox"
 checked={reportedOnly}
 onChange={(event) => {
 setReportedOnly(event.target.checked);
 setPage(1);
 }}
 />
 Reported only
 </label>
 </div>
 </section>

 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
 {loading ? (
 <div className="p-12 text-center text-muted-foreground">
 <Spinner className="mx-auto" />
 <p className="mt-3 text-sm">Loading customer reviews...</p>
 </div>
 ) : error ? (
 <div className="p-12 text-center">
 <p className="text-sm font-semibold text-destructive">{error}</p>
 <button
 type="button"
 onClick={() => void fetchData()}
 className="mt-3 text-sm font-semibold text-primary"
 >
 Retry
 </button>
 </div>
 ) : !reviews.length ? (
 <div className="p-12 text-center text-muted-foreground">
 No matching reviews found.
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[1050px] text-left text-sm">
 <thead className="bg-muted text-xs uppercase text-muted-foreground">
 <tr>
 {[
 "Customer",
 "Product / Seller",
 "Rating",
 "Review",
 "Status",
 "Date",
 "Action",
 ].map((heading) => (
 <th key={heading} className="px-5 py-3">
 {heading}
 </th>
 ))}
 </tr>
 </thead>

 <tbody className="divide-y divide-[var(--border)]">
 {reviews.map((review) => (
 <tr key={review.id} className="hover:bg-primary/10/20">
 <td className="px-5 py-4">
 <div className="flex items-center gap-2.5">
 <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
 <HugeiconsIcon icon={UserIcon} size={14} />
 </span>
 <div>
 <p className="font-semibold text-foreground">
 {review.customer_name || "Customer"}
 </p>
 <p className="text-xs text-muted-foreground">
 {review.customer_email ||
 review.user_id.slice(0, 10)}
 </p>
 </div>
 </div>
 </td>

 <td className="px-5 py-4">
 <p className="font-semibold text-foreground">
 {review.product_name ||
 review.product?.name ||
 `Product ${review.product_id.slice(0, 8)}`}
 </p>
 <p className="mt-0.5 text-xs text-muted-foreground">
 Seller: {review.seller_name || "Not provided"}
 </p>
 </td>

 <td className="px-5 py-4">
 <div className="flex items-center gap-1 font-semibold">
 <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-500" />
 {review.rating}/5
 </div>
 </td>

 <td className="max-w-sm px-5 py-4 text-muted-foreground">
 <p className="line-clamp-2">
 {review.comment || "No written comment."}
 </p>
 </td>

 <td className="px-5 py-4">
 <span
 className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
 STATUS_BADGES[review.status] ||
 "border-border bg-muted text-muted-foreground"
 }`}
 >
 {pretty(review.status)}
 </span>
 </td>

 <td className="px-5 py-4 text-xs text-muted-foreground">
 {new Date(review.created_at).toLocaleString()}
 </td>

 <td className="px-5 py-4">
 <div className="flex flex-wrap items-center gap-2">
 {review.status === "pending" && (
 <>
 <button
 type="button"
 onClick={() => void moderateReview(review, "approved")}
 disabled={moderationBusy !== null}
 className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-dark disabled:opacity-50"
 >
 <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
 Approve
 </button>
 <button
 type="button"
 onClick={() => void moderateReview(review, "rejected")}
 disabled={moderationBusy !== null}
 className="inline-flex items-center gap-1.5 rounded-lg border border-red-light-4 bg-red-light-6 px-3 py-2 text-xs font-semibold text-red-dark transition hover:bg-red-light-5 disabled:opacity-50"
 >
 <HugeiconsIcon icon={CancelCircleIcon} size={14} />
 Reject
 </button>
 </>
 )}
 <button
 type="button"
 onClick={() => void openReview(review)}
 className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background"
 >
 <HugeiconsIcon icon={ViewIcon} size={14} />
 Review
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {!loading && !error && (
 <Pagination
 page={page}
 pageSize={pageSize}
 total={total}
 totalPages={totalPages}
 onPageChange={setPage}
 onPageSizeChange={(size) => {
 setPageSize(size);
 setPage(1);
 }}
 />
 )}
 </section>

 {selected && (
 <div
 className="fixed inset-0 z-[110] flex justify-end bg-black/50 backdrop-blur-[2px]"
 onMouseDown={() => setSelected(null)}
 >
 <aside
 className="h-full w-full max-w-2xl overflow-y-auto bg-muted shadow-lg"
 onMouseDown={(event) => event.stopPropagation()}
 >
 <div className="sticky top-0 z-10 flex items-start justify-between border-b bg-card px-6 py-5">
 <div>
 <p className="text-xs font-bold uppercase tracking-[.14em] text-primary">
 Review inspection
 </p>
 <h3 className="mt-1 text-xl font-bold text-foreground">
 Customer Review
 </h3>
 </div>
 <button
 onClick={() => setSelected(null)}
 className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={16} />
 </button>
 </div>

 <div className="space-y-5 p-6">
 {detailLoading && (
 <p className="text-sm text-muted-foreground">
 Loading full review context...
 </p>
 )}

 <section className="grid gap-3 sm:grid-cols-2">
 <Info label="Customer" value={selected.customer_name || selected.user_id} />
 <Info
 label="Product"
 value={
 selected.product_name ||
 selected.product?.name ||
 selected.product_id
 }
 />
 <Info label="Seller" value={selected.seller_name || "—"} />
 <Info label="Rating" value={`${selected.rating}/5`} />
 <Info label="Status" value={pretty(selected.status)} />
 <Info
 label="Reports"
 value={String(selected.report_count ?? (selected.reported ? 1 : 0))}
 />
 </section>

 <section className="rounded-xl border bg-card p-5">
 <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
 Customer comment
 </p>
 <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
 {selected.comment || "No written comment was submitted."}
 </p>
 </section>

 {selected.seller_reply && (
 <section className="rounded-xl border border-primary-100 bg-primary-50/50 p-5">
 <p className="text-xs font-bold uppercase tracking-wider text-primary-500">
 Seller response
 </p>
 <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
 {selected.seller_reply}
 </p>
 </section>
 )}

 <section className="rounded-xl border bg-card p-5">
 <div className="flex items-center justify-between gap-3">
 <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
 Admin reply
 </p>
 <span className="text-[11px] text-muted-foreground">Optional internal moderation note</span>
 </div>
 <textarea
 value={adminReply}
 onChange={(event) => setAdminReply(event.target.value)}
 rows={4}
 maxLength={3000}
 placeholder="Add an administrative response or moderation note..."
 className="mt-3 w-full rounded-xl border-2 border-border px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-[var(--primary)]"
 />
 <div className="mt-3 flex justify-end">
 <button
 type="button"
 onClick={() => void saveAdminReply()}
 disabled={moderationBusy !== null}
 className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-[var(--primary)] hover:text-primary disabled:opacity-50"
 >
 Save admin reply
 </button>
 </div>
 </section>

 <section className="rounded-xl border border-border bg-card p-5">
 <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
 Moderation decision
 </p>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">
 Approved reviews become public and immediately contribute to the product rating. Rejected or hidden reviews are removed from public rating calculations.
 </p>

 <div className="mt-4 grid gap-2 sm:grid-cols-3">
 <button
 type="button"
 onClick={() => void moderateReview(selected, "approved", adminReply.trim() || null)}
 disabled={moderationBusy !== null || selected.status === "approved"}
 className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-success px-4 text-sm font-bold text-white transition hover:bg-green-dark disabled:opacity-40"
 >
 <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
 Approve
 </button>
 <button
 type="button"
 onClick={() => void moderateReview(selected, "rejected", adminReply.trim() || null)}
 disabled={moderationBusy !== null || selected.status === "rejected"}
 className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-light-4 bg-red-light-6 px-4 text-sm font-bold text-red-dark transition hover:bg-red-light-5 disabled:opacity-40"
 >
 <HugeiconsIcon icon={CancelCircleIcon} size={16} />
 Reject
 </button>
 <button
 type="button"
 onClick={() => void moderateReview(selected, "hidden", adminReply.trim() || null)}
 disabled={moderationBusy !== null || selected.status === "hidden"}
 className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 text-sm font-bold text-accent-foreground transition hover:bg-muted disabled:opacity-40"
 >
 <HugeiconsIcon icon={ViewIcon} size={16} />
 Hide
 </button>
 </div>
 </section>
 </div>
 </aside>
 </div>
 )}
 </div>
 );
}

function Metric({
 label,
 value,
 icon: Icon,
}: {
 label: string;
 value: string | number;
 icon: IconSvgElement;
}) {
 return (
 <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <HugeiconsIcon icon={Icon} size={16} />
 </span>
 <p className="mt-4 text-2xl font-bold text-foreground">{value}</p>
 <p className="mt-1 text-xs text-muted-foreground">{label}</p>
 </article>
 );
}

function Info({ label, value }: { label: string; value: string }) {
 return (
 <div className="rounded-xl border bg-card p-4">
 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
 {label}
 </p>
 <p className="mt-1 break-words text-sm font-semibold text-foreground">
 {value}
 </p>
 </div>
 );
}
