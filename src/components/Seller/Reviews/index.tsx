"use client";


import { Spinner } from "@/components/ui/Spinner";
import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkBadge01Icon, ArrowLeft01Icon, ArrowRight01Icon, Flag02Icon, MessageSquareReplyIcon, RefreshCwIcon, Search01Icon, StarIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import { sellerFeedbackApi } from "@/lib/api/endpoints/seller-feedback";
import type {
 SellerReview,
 SellerReviewReportReason,
} from "@/types/api/seller-feedback";

const err = (e: unknown) => {
 const x = e as { response?: { data?: { detail?: string } }; message?: string };
 return x.response?.data?.detail || x.message || "Request failed.";
};
const pretty = (s: string) =>
 s.replaceAll("_", " ").replace(/\b\w/g, (x) => x.toUpperCase());

export default function SellerReviews() {
 const [rows, setRows] = useState<SellerReview[]>([]);
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(20);
 const [total, setTotal] = useState(0);
 const [average, setAverage] = useState(0);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [rating, setRating] = useState("all");
 const [replyTarget, setReplyTarget] = useState<SellerReview | null>(null);
 const [reply, setReply] = useState("");
 const [reportTarget, setReportTarget] = useState<SellerReview | null>(null);
 const [reportReason, setReportReason] =
 useState<SellerReviewReportReason>("spam");
 const [reportDetails, setReportDetails] = useState("");
 const [busy, setBusy] = useState(false);

 const load = async () => {
 setLoading(true);
 try {
 const data = await sellerFeedbackApi.reviews({
 page,
 page_size: pageSize,
 });
 setRows(data.results);
 setTotal(data.total);
 setAverage(Number(data.average_rating || 0));
 } catch (e) {
 toast.error(err(e));
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void load();
 }, [page, pageSize]);

 // Backend seller reviews currently exposes pagination, not search/rating filters.
 const visible = useMemo(() => {
 const q = search.trim().toLowerCase();
 return rows.filter((row) => {
 if (rating !== "all" && row.rating !== Number(rating)) return false;
 if (!q) return true;
 return [row.title || "", row.comment || "", row.seller_reply || "", row.id]
 .join(" ")
 .toLowerCase()
 .includes(q);
 });
 }, [rows, search, rating]);

 const totalPages = total ? Math.ceil(total / pageSize) : 0;
 const replied = rows.filter((row) => Boolean(row.seller_reply)).length;

 const submitReply = async () => {
 if (!replyTarget || !reply.trim()) return;
 setBusy(true);
 try {
 await sellerFeedbackApi.replyToReview(replyTarget.id, reply.trim());
 toast.success("Seller response published.");
 setReplyTarget(null);
 setReply("");
 await load();
 } catch (e) {
 toast.error(err(e));
 } finally {
 setBusy(false);
 }
 };

 const submitReport = async () => {
 if (!reportTarget) return;
 setBusy(true);
 try {
 await sellerFeedbackApi.reportReview(reportTarget.id, {
 reason: reportReason,
 details: reportDetails.trim() || null,
 });
 toast.success("Review reported for moderation.");
 setReportTarget(null);
 setReportDetails("");
 await load();
 } catch (e) {
 toast.error(err(e));
 } finally {
 setBusy(false);
 }
 };

 return (
 <div className="space-y-5">
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
 <div>
 <h1 className="mt-1 text-2xl font-bold text-foreground">
 Customer Reviews
 </h1>
 <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground /60">
 Read product reviews, respond publicly and report inappropriate
 feedback for moderation.
 </p>
 </div>
 <button onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold dark:border-border">
 <HugeiconsIcon icon={RefreshCwIcon} size={16}/> Refresh
 </button>
 </div>
 <div className="mt-5 grid gap-3 sm:grid-cols-3">
 <Metric label="Total Reviews" value={String(total)} />
 <Metric label="Average Rating" value={`${average.toFixed(2)} / 5`} star />
 <Metric label="Replies on page" value={`${replied} / ${rows.length}`} />
 </div>
 </section>

 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card">
 <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between dark:border-border">
 <div>
 <h2 className="font-bold">Review Inbox</h2>
 <p className="mt-1 text-xs text-muted-foreground">
 Pagination is server-side. Search and rating filters apply to the current page.
 </p>
 </div>
 <div className="flex flex-col gap-2 sm:flex-row">
 <label className="relative">
 <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"/>
 <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Filter current page..." className="h-11 min-w-[250px] rounded-xl border border-border pl-10 pr-3 text-sm outline-none dark:border-border"/>
 </label>
 <select value={rating} onChange={(e)=>setRating(e.target.value)} className="h-11 rounded-xl border border-border bg-card px-3 text-sm dark:border-border">
 <option value="all">All ratings</option>
 {[5,4,3,2,1].map((x)=><option key={x} value={x}>{x} stars</option>)}
 </select>
 </div>
 </div>

 {loading ? (
 <div className="p-14 text-center text-sm text-muted-foreground"><Spinner className="mx-auto" /><p className="mt-2">Loading reviews...</p></div>
 ) : (
 <div className="divide-y divide-border dark:divide-white/10">
 {visible.map((row)=>(
 <article key={row.id} className="p-5">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <Stars value={row.rating}/>
 {row.verified_purchase && <span className="inline-flex items-center gap-1 rounded-full bg-green-light-6 px-2 py-1 text-[10px] font-bold uppercase text-green-dark"><HugeiconsIcon icon={CheckmarkBadge01Icon} size={12}/> Verified purchase</span>}
 <span className="rounded-full border border-border px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">{pretty(row.status)}</span>
 </div>
 <h3 className="mt-3 font-bold text-foreground">{row.title || "Customer review"}</h3>
 <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground /65">{row.comment || "No written comment."}</p>
 <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
 <span>{new Date(row.created_at).toLocaleString()}</span>
 <span>{row.helpful_count} helpful vote{row.helpful_count === 1 ? "" : "s"}</span>
 </div>
 {row.seller_reply && (
 <div className="mt-4 rounded-xl border border-primary-100 bg-primary/10/70 p-4">
 <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Your public response</p>
 <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-accent-foreground">{row.seller_reply}</p>
 {row.seller_replied_at && <p className="mt-2 text-[11px] text-muted-foreground">{new Date(row.seller_replied_at).toLocaleString()}</p>}
 </div>
 )}
 </div>
 <div className="flex shrink-0 flex-wrap gap-2">
 <button onClick={()=>{setReplyTarget(row);setReply(row.seller_reply || "");}} className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"><HugeiconsIcon icon={MessageSquareReplyIcon} size={14}/>{row.seller_reply ? "Edit response" : "Respond"}</button>
 <button onClick={()=>setReportTarget(row)} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground dark:border-border /60"><HugeiconsIcon icon={Flag02Icon} size={14}/>Report</button>
 </div>
 </div>
 </article>
 ))}
 {!visible.length && <div className="p-14 text-center"><HugeiconsIcon icon={StarIcon} size={28} className="mx-auto text-muted-foreground"/><p className="mt-3 font-semibold text-muted-foreground /70">No reviews found</p></div>}
 </div>
 )}

 <Pagination page={page} pageSize={pageSize} total={total} totalPages={totalPages} onPageChange={setPage} onPageSizeChange={(x)=>{setPageSize(x);setPage(1);}}/>
 </section>

 {replyTarget && <Modal title={replyTarget.seller_reply ? "Edit Seller Response" : "Respond to Review"} onClose={()=>!busy&&setReplyTarget(null)}>
 <p className="rounded-xl bg-muted p-3 text-sm leading-6 text-muted-foreground">{replyTarget.comment || replyTarget.title || "Customer review"}</p>
 <textarea value={reply} onChange={(e)=>setReply(e.target.value)} maxLength={3000} className="mt-4 min-h-32 w-full rounded-xl border border-border p-3 text-sm outline-none focus:border-primary/40 dark:border-border" placeholder="Write a polite public response..."/>
 <button disabled={busy || !reply.trim()} onClick={()=>void submitReply()} className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Publishing..." : "Publish Response"}</button>
 </Modal>}

 {reportTarget && <Modal title="Report Review" onClose={()=>!busy&&setReportTarget(null)}>
 <label className="text-xs font-semibold text-muted-foreground /60">Reason</label>
 <select value={reportReason} onChange={(e)=>setReportReason(e.target.value as SellerReviewReportReason)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm dark:border-border">
 <option value="spam">Spam</option><option value="abusive">Abusive</option><option value="fake">Fake</option><option value="irrelevant">Irrelevant</option><option value="personal_information">Personal information</option><option value="other">Other</option>
 </select>
 <textarea value={reportDetails} onChange={(e)=>setReportDetails(e.target.value)} maxLength={2000} className="mt-3 min-h-28 w-full rounded-xl border border-border p-3 text-sm outline-none dark:border-border" placeholder="Explain why this review should be moderated..."/>
 <button disabled={busy} onClick={()=>void submitReport()} className="mt-4 w-full rounded-xl bg-destructive py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Reporting..." : "Submit Report"}</button>
 </Modal>}
 </div>
 );
}

function Stars({value}:{value:number}) { return <div className="flex gap-0.5">{[1,2,3,4,5].map(x=><HugeiconsIcon icon={StarIcon} key={x} size={16} className={x<=value ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}/>)}</div>; }
function Metric({label,value,star=false}:{label:string;value:string;star?:boolean}) { return <div className="rounded-xl border border-border bg-muted p-4 dark:border-border dark:bg-card/[.03]"><div className="flex items-center gap-2">{star&&<HugeiconsIcon icon={StarIcon} size={16} className="fill-amber-400 text-amber-400"/>}<p className="text-xl font-bold">{value}</p></div><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>; }
function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}) { return <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/55 p-4"><div className="w-full max-w-xl rounded-xl bg-card p-5 shadow-lg dark:bg-card"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2><button onClick={onClose} className="rounded-lg border p-2 dark:border-border"><HugeiconsIcon icon={Cancel01Icon} size={16}/></button></div>{children}</div></div>; }
