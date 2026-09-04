"use client";

import { useEffect, useMemo, useState } from "react";
import { reviewsApi, type CustomerReview, type CustomerReviewList } from "@/lib/api/endpoints/reviews";

const PAGE_SIZE = 5;

function Stars({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const rounded = Math.round(value);
  const className = size === "lg" ? "text-xl sm:text-2xl" : size === "sm" ? "text-sm" : "text-base";
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rounded ? "text-[#f59e0b]" : "text-gray-3 dark:text-white/15"} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function ReviewCard({ review }: { review: CustomerReview }) {
  return (
    <article className="rounded-2xl border border-gray-3 bg-white p-5 transition hover:border-orange/30 hover:shadow-sm dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Stars value={review.rating} />
            {review.verified_purchase && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Verified purchase
              </span>
            )}
          </div>
          <h3 className="mt-2 text-base font-extrabold text-dark dark:text-white sm:text-lg">
            {review.title?.trim() || "Customer review"}
          </h3>
        </div>
        <time className="text-xs font-medium text-dark-4" dateTime={review.created_at}>{formatDate(review.created_at)}</time>
      </div>

      {review.comment?.trim() && (
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-dark-4 dark:text-darkTheme-secondary-muted sm:text-[15px]">
          {review.comment}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-3 pt-4 text-xs text-dark-4 dark:border-darkTheme-border-color">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 10v10H4V10h3Zm0 9h10.2a2 2 0 0 0 1.9-1.4l1.7-5.5A2 2 0 0 0 18.9 9H14l.8-3.1A2.4 2.4 0 0 0 12.5 3L7 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
          Helpful {review.helpful_count > 0 ? `(${review.helpful_count})` : ""}
        </span>
        <span>Published after Xerin review moderation</span>
      </div>

      {review.seller_reply?.trim() && (
        <div className="mt-4 rounded-2xl border border-orange/15 bg-orange/[0.05] p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange/10 text-orange">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9h16l-1-5H5L4 9Zm1 0v11h14V9M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
            </span>
            <div>
              <p className="text-xs font-extrabold text-dark dark:text-white">Seller response</p>
              {review.seller_replied_at && <p className="text-[10px] text-dark-4">{formatDate(review.seller_replied_at)}</p>}
            </div>
          </div>
          <p className="mt-2.5 whitespace-pre-line text-sm leading-6 text-dark-4 dark:text-darkTheme-secondary-muted">{review.seller_reply}</p>
        </div>
      )}
    </article>
  );
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CustomerReviewList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!productId) return;
    let active = true;
    setLoading(true);
    setError(false);

    void reviewsApi.product(productId, { page, page_size: PAGE_SIZE })
      .then((response) => {
        if (active) setData(response);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [productId, page]);

  const average = Number(data?.average_rating || 0);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const breakdown = data?.rating_breakdown ?? {};

  const rows = useMemo(() => [5, 4, 3, 2, 1].map((star) => {
    const count = Number(breakdown[String(star)] ?? 0);
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { star, count, percentage };
  }), [breakdown, total]);

  if (!loading && !error && total === 0) {
    return (
      <section className="bg-[#f7f9fc] pb-10 dark:bg-darkTheme-bg sm:pb-14">
        <div className="mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8 xl:px-4">
          <div className="rounded-3xl border border-gray-3 bg-white p-6 text-center dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:p-8">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange/10 text-xl text-orange">★</span>
            <h2 className="mt-3 text-xl font-extrabold text-dark dark:text-white">Customer Reviews</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-dark-4">No approved reviews yet. Reviews from verified purchases will appear here after moderation.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="customer-reviews" className="scroll-mt-24 bg-[#f7f9fc] pb-10 dark:bg-darkTheme-bg sm:pb-14">
      <div className="mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8 xl:px-4">
        <div className="overflow-hidden rounded-3xl border border-gray-3 bg-white shadow-[0_12px_38px_rgba(15,23,42,0.05)] dark:border-darkTheme-border-color dark:bg-darkTheme-card">
          <div className="border-b border-gray-3 bg-gradient-to-r from-[#fff8f3] via-white to-white p-5 dark:border-darkTheme-border-color dark:from-orange/[0.05] dark:via-darkTheme-card dark:to-darkTheme-card sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange text-white shadow-sm">★</span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange">Verified marketplace feedback</span>
                  <h2 className="mt-1 text-xl font-extrabold text-dark dark:text-white sm:text-2xl">Customer Reviews</h2>
                  <p className="mt-1.5 text-sm leading-6 text-dark-4">Reviews shown here are approved Xerin reviews from customers who received the product.</p>
                </div>
              </div>
              {total > 0 && <span className="rounded-full border border-orange/20 bg-white px-3 py-1.5 text-xs font-bold text-orange shadow-sm dark:bg-darkTheme-card">{total} verified review{total === 1 ? "" : "s"}</span>}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="h-64 animate-pulse rounded-2xl bg-gray-2 dark:bg-white/5" />
              <div className="space-y-4">{[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-2 dark:bg-white/5" />)}</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-dark-4">Reviews could not be loaded right now.</div>
          ) : data && (
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-2xl border border-gray-3 bg-[#fbfcfd] p-5 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-dark dark:text-white">{average.toFixed(1)}</span>
                    <span className="pb-1 text-sm font-semibold text-dark-4">/ 5</span>
                  </div>
                  <div className="mt-1"><Stars value={average} size="lg" /></div>
                  <p className="mt-1.5 text-xs text-dark-4">Based on {total} approved review{total === 1 ? "" : "s"}</p>

                  <div className="mt-5 space-y-2.5">
                    {rows.map(({ star, count, percentage }) => (
                      <div key={star} className="grid grid-cols-[32px_1fr_42px] items-center gap-2 text-xs">
                        <span className="font-bold text-dark dark:text-white">{star}★</span>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-3 dark:bg-white/10">
                          <div className="h-full rounded-full bg-[#f59e0b]" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-right text-dark-4">{percentage}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl bg-green/[0.07] p-3 text-xs leading-5 text-dark-4">
                    <strong className="text-green">Verified purchase</strong> means Xerin confirmed the reviewer bought this product and its seller order reached delivered status.
                  </div>
                </div>
              </aside>

              <div className="min-w-0">
                <div className="space-y-4">
                  {data.results.map((review) => <ReviewCard key={review.id} review={review} />)}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-3 pt-5 dark:border-darkTheme-border-color">
                    <p className="text-xs text-dark-4">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                      <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((v) => Math.max(1, v - 1))} className="min-h-10 rounded-xl border border-gray-3 px-4 text-xs font-bold text-dark transition hover:border-orange hover:text-orange disabled:cursor-not-allowed disabled:opacity-40 dark:border-darkTheme-border-color dark:text-white">Previous</button>
                      <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((v) => Math.min(totalPages, v + 1))} className="min-h-10 rounded-xl bg-orange px-4 text-xs font-bold text-white transition hover:bg-[#e95f23] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
