"use client";

import { ordersApi } from "@/lib/api/endpoints/commerce";
import { reviewsApi, type CustomerReview } from "@/lib/api/endpoints/reviews";
import type { OrderItem } from "@/types/api/commerce";
import { CheckCircle2, Loader2, MessageSquare, RefreshCw, Star, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type ReviewableItem = OrderItem & { orderId: string; orderNumber: string };

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [reviewable, setReviewable] = useState<ReviewableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReviewableItem | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [mine, orders] = await Promise.all([
        reviewsApi.mine({ page: 1, page_size: 100 }),
        ordersApi.mine({ page: 1, page_size: 100 }),
      ]);
      setReviews(mine.results);
      const delivered = orders.results.filter((o) =>
        ["delivered", "completed"].includes(String(o.status).toLowerCase()) || Boolean(o.delivered_at),
      );
      setReviewable(
        delivered.flatMap((o) =>
          (o.items || []).map((item) => ({
            ...item,
            orderId: o.id,
            orderNumber: o.order_number || o.id.slice(0, 8).toUpperCase(),
          })),
        ),
      );
    } catch {
      toast.error("Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  // The backend enforces one review per purchased order item. We cannot map an existing
  // ReviewResponse back to order_item_id, so submitted reviews remain in their own history
  // and a duplicate submit is safely rejected by the backend.
  const pending = useMemo(() => reviewable, [reviewable]);

  if (loading) return <div className="grid min-h-48 place-items-center"><Loader2 className="animate-spin text-[#f7941d]" /></div>;

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div><h2 className="font-bold text-[#0f172a] dark:text-white">Awaiting review</h2><p className="text-sm text-[#64748b]">Delivered purchases that are eligible for product feedback.</p></div>
          <button onClick={() => void load()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e2e8f0] px-3 text-sm font-semibold dark:border-white/10"><RefreshCw size={15}/>Refresh</button>
        </div>
        {pending.length ? <div className="grid gap-3 sm:grid-cols-2">
          {pending.map((item) => <article key={item.id} className="rounded-2xl border border-[#e2e8f0] bg-white p-4 dark:border-white/10 dark:bg-darkTheme-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Order {item.orderNumber}</p>
            <h3 className="mt-1 font-bold text-[#0f172a] dark:text-white">{item.product_name}</h3>
            {item.variant_name && <p className="mt-1 text-xs text-[#64748b]">{item.variant_name}</p>}
            <button onClick={() => setSelected(item)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f7941d] px-4 text-sm font-bold text-white"><Star size={17}/>Write a review</button>
          </article>)}
        </div> : <Empty text="No delivered products are waiting for a review." />}
      </section>

      <section>
        <div className="mb-3"><h2 className="font-bold text-[#0f172a] dark:text-white">My submitted reviews</h2><p className="text-sm text-[#64748b]">Your feedback and its moderation status.</p></div>
        {reviews.length ? <div className="space-y-3">{reviews.map((r) => <ReviewCard key={r.id} review={r} reload={load} />)}</div> : <Empty text="You have not submitted a product review yet." />}
      </section>

      {selected && <ReviewDialog item={selected} close={() => setSelected(null)} done={() => { setSelected(null); void load(); }} busy={busy} setBusy={setBusy} />}
    </div>
  );
}

function ReviewDialog({ item, close, done, busy, setBusy }: { item: ReviewableItem; close:()=>void; done:()=>void; busy:boolean; setBusy:(v:boolean)=>void }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  async function submit() {
    setBusy(true);
    try {
      await reviewsApi.createProduct(item.product_id, { order_item_id: item.id, rating, title: title.trim() || undefined, comment: comment.trim() || undefined });
      toast.success("Review submitted for moderation.");
      done();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Unable to submit review.");
    } finally { setBusy(false); }
  }
  return <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
    <div className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl dark:bg-darkTheme-card">
      <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#f7941d]">Verified purchase</p><h2 className="mt-1 text-lg font-bold dark:text-white">{item.product_name}</h2></div><button onClick={close} className="grid min-h-10 min-w-10 place-items-center rounded-xl bg-[#f1f5f9] dark:bg-white/5"><X size={18}/></button></div>
      <div className="mt-5 flex gap-2">{[1,2,3,4,5].map(n => <button key={n} onClick={()=>setRating(n)} aria-label={`${n} stars`}><Star size={30} className={n <= rating ? "fill-[#f7941d] text-[#f7941d]" : "text-[#cbd5e1]"}/></button>)}</div>
      <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={150} placeholder="Review title (optional)" className="mt-5 min-h-11 w-full rounded-xl border border-[#e2e8f0] bg-transparent px-3 outline-none focus:border-[#f7941d] dark:border-white/10"/>
      <textarea value={comment} onChange={e=>setComment(e.target.value)} maxLength={5000} rows={5} placeholder="Tell other customers about this product..." className="mt-3 w-full rounded-xl border border-[#e2e8f0] bg-transparent p-3 outline-none focus:border-[#f7941d] dark:border-white/10"/>
      <button disabled={busy} onClick={()=>void submit()} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f7941d] font-bold text-white disabled:opacity-60">{busy && <Loader2 size={17} className="animate-spin"/>}Submit review</button>
    </div>
  </div>
}

function ReviewCard({ review, reload }: { review: CustomerReview; reload:()=>Promise<void> }) {
  async function remove() {
    if (!confirm("Delete this review?")) return;
    try { await reviewsApi.remove(review.id); toast.success("Review deleted."); await reload(); }
    catch { toast.error("Unable to delete review."); }
  }
  return <article className="rounded-2xl border border-[#e2e8f0] bg-white p-4 dark:border-white/10 dark:bg-darkTheme-card">
    <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex gap-1">{[1,2,3,4,5].map(n=><Star key={n} size={17} className={n<=review.rating ? "fill-[#f7941d] text-[#f7941d]" : "text-[#cbd5e1]"}/>)}</div><span className="rounded-full bg-[#f8fafc] px-2.5 py-1 text-xs font-bold capitalize text-[#64748b] dark:bg-white/5">{review.status.replaceAll("_"," ")}</span></div>
    {review.title && <h3 className="mt-3 font-bold dark:text-white">{review.title}</h3>}
    {review.comment && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#475569] dark:text-gray-300">{review.comment}</p>}
    {review.seller_reply && <div className="mt-3 rounded-xl bg-[#f8fafc] p-3 text-sm dark:bg-white/5"><p className="flex items-center gap-2 font-bold"><MessageSquare size={15}/>Seller response</p><p className="mt-1 text-[#64748b]">{review.seller_reply}</p></div>}
    <div className="mt-4 flex items-center justify-between text-xs text-[#64748b]"><span className="inline-flex items-center gap-1">{review.verified_purchase && <><CheckCircle2 size={14} className="text-emerald-600"/>Verified purchase</>}</span><button onClick={()=>void remove()} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 font-semibold text-red-600"><Trash2 size={14}/>Delete</button></div>
  </article>
}

function Empty({ text }: { text:string }) {
  return <div className="rounded-2xl border border-dashed border-[#cbd5e1] px-4 py-10 text-center text-sm text-[#64748b] dark:border-white/10">{text}</div>;
}
