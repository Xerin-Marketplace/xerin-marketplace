"use client";

import {
 type AdminLogisticsDocument,
 type AdminLogisticsOnboarding,
 listAdminLogisticsDocuments,
 listLogisticsOnboardingQueue,
 reviewAdminLogisticsDocument,
 reviewLogisticsOnboarding,
 startAdminLogisticsDocumentReview,
 viewAdminLogisticsDocument,
} from "@/lib/api/endpoints/admin";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { Alert02Icon, CheckIcon, CheckmarkCircle02Icon, ArrowLeft01Icon, ArrowRight01Icon, Clock01Icon, ViewIcon, FileCheckIcon, File01Icon, HistoryIcon, LockKeyIcon, RefreshCwIcon, Search01Icon, ShieldCheckIcon, Cancel01Icon, CancelCircleIcon } from "@hugeicons/core-free-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const states = [
 "submitted",
 "under_review",
 "changes_requested",
 "rejected",
 "ready_for_review",
 "in_progress",
 "invited",
 "approved",
] as const;

const REQUIRED_TYPES = [
 "tin_certificate",
 "registration_certificate",
 "business_license",
 "representative_id",
];

const labels: Record<string, string> = {
 tin_certificate: "TIN / Tax Certificate",
 registration_certificate: "Company Registration Certificate",
 business_license: "Business / Operating Licence",
 representative_id: "Authorized Representative / Director ID",
 proof_of_address: "Proof of Business Address",
 insurance_certificate: "Insurance Certificate",
 logistics_license: "Logistics / Transport Licence",
 other: "Other Supporting Document",
};

const pretty = (value: string) =>
 value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const message = (error: unknown) =>
 error instanceof Error ? error.message : "The request could not be completed.";

const statusClass: Record<string, string> = {
 pending_review: "border-yellow-light-2 bg-yellow-light-4 text-yellow-dark-2",
 under_review: "border-primary-200 bg-primary-50 text-primary-800",
 approved: "border-green-light-4 bg-green-light-6 text-green-dark",
 changes_requested: "border-primary/25 bg-primary/10 text-primary-800",
 rejected: "border-red-light-4 bg-red-light-6 text-red-dark",
};

export default function LogisticsCompanyApprovals() {
 const [rows, setRows] = useState<AdminLogisticsOnboarding[]>([]);
 const [state, setState] = useState("");
 const [search, setSearch] = useState("");
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(0);
 const [total, setTotal] = useState(0);
 const [loading, setLoading] = useState(true);
 const [selected, setSelected] = useState<AdminLogisticsOnboarding | null>(null);
 const [documents, setDocuments] = useState<AdminLogisticsDocument[]>([]);
 const [history, setHistory] = useState<AdminLogisticsDocument[]>([]);
 const [documentsLoading, setDocumentsLoading] = useState(false);
 const [showHistory, setShowHistory] = useState(false);
 const [note, setNote] = useState("");
 const [acting, setActing] = useState(false);
 const [documentAction, setDocumentAction] = useState<{
 document: AdminLogisticsDocument;
 decision: "changes_requested" | "rejected";
 } | null>(null);
 const [documentComment, setDocumentComment] = useState("");

 const load = useCallback(async () => {
 setLoading(true);
 try {
 const data = await listLogisticsOnboardingQueue({
 page,
 page_size: 12,
 search: search.trim() || undefined,
 state: state || undefined,
 });
 setRows(data.results);
 setTotal(data.total);
 setTotalPages(data.total_pages ?? 0);
 } catch (error) {
 toast.error(message(error));
 } finally {
 setLoading(false);
 }
 }, [page, search, state]);

 useEffect(() => {
 const timer = setTimeout(() => void load(), 250);
 return () => clearTimeout(timer);
 }, [load]);

 const loadDocuments = useCallback(async (companyId: string, includeHistory = false) => {
 setDocumentsLoading(true);
 try {
 const data = await listAdminLogisticsDocuments(companyId, includeHistory);
 if (includeHistory) {
 setHistory(data.results.filter((document) => !document.is_current));
 } else {
 setDocuments(data.results);
 }
 } catch (error) {
 toast.error(message(error));
 } finally {
 setDocumentsLoading(false);
 }
 }, []);

 const openReview = async (row: AdminLogisticsOnboarding) => {
 setSelected(row);
 setNote(row.review_note || "");
 setShowHistory(false);
 setHistory([]);
 await loadDocuments(row.company_id);
 };

 const requiredDocuments = useMemo(
 () => documents.filter((document) => REQUIRED_TYPES.includes(document.document_type)),
 [documents],
 );
 const requiredApproved =
 requiredDocuments.length === REQUIRED_TYPES.length &&
 requiredDocuments.every((document) => document.status === "approved");
 const allRequiredPresent = REQUIRED_TYPES.every((type) =>
 documents.some((document) => document.document_type === type),
 );
 const reviewStarted =
 selected?.state === "under_review" ||
 documents.some((document) =>
 ["under_review", "approved", "changes_requested", "rejected"].includes(document.status),
 );

 const startReview = async () => {
 if (!selected || acting) return;
 setActing(true);
 try {
 const updated = await startAdminLogisticsDocumentReview(selected.company_id);
 setSelected(updated);
 toast.success("Document review started. Company documents are now locked for editing.");
 await loadDocuments(selected.company_id);
 await load();
 } catch (error) {
 toast.error(message(error));
 } finally {
 setActing(false);
 }
 };

 const reviewDocument = async (
 document: AdminLogisticsDocument,
 decision: "approve" | "changes_requested" | "rejected",
 comment?: string,
 ) => {
 if (!selected || acting) return;
 setActing(true);
 try {
 await reviewAdminLogisticsDocument(selected.company_id, document.id, {
 decision,
 comment: comment?.trim() || undefined,
 });
 toast.success(
 decision === "approve"
 ? `${labels[document.document_type] || document.document_name} approved.`
 : decision === "changes_requested"
 ? "Changes requested from the logistics company."
 : "Document rejected.",
 );
 setDocumentAction(null);
 setDocumentComment("");
 await loadDocuments(selected.company_id);
 const refreshed = await listLogisticsOnboardingQueue({
 page: 1,
 page_size: 100,
 search: selected.company_name,
 });
 const current = refreshed.results.find((row) => row.company_id === selected.company_id);
 if (current) setSelected(current);
 await load();
 } catch (error) {
 toast.error(message(error));
 } finally {
 setActing(false);
 }
 };

 const viewDocument = async (document: AdminLogisticsDocument) => {
 if (!selected) return;
 try {
 const blob = await viewAdminLogisticsDocument(selected.company_id, document.id);
 const url = URL.createObjectURL(blob);
 const opened = window.open(url, "_blank", "noopener,noreferrer");
 if (!opened) {
 const anchor = window.document.createElement("a");
 anchor.href = url;
 anchor.download = document.original_filename || document.document_name;
 anchor.click();
 }
 window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
 } catch (error) {
 toast.error(message(error));
 }
 };

 const decideCompany = async (
 decision: "approve" | "changes_requested" | "rejected",
 ) => {
 if (!selected || acting) return;
 if (decision !== "approve" && !note.trim()) {
 toast.error("Write a clear review reason before returning or rejecting the application.");
 return;
 }
 if (decision === "approve" && !requiredApproved) {
 toast.error("Approve all four required company documents first.");
 return;
 }
 setActing(true);
 try {
 await reviewLogisticsOnboarding(selected.company_id, {
 decision,
 note: note.trim() || undefined,
 });
 toast.success(
 decision === "approve"
 ? `${selected.company_name} approved and activated.`
 : decision === "rejected"
 ? `${selected.company_name} rejected with a review reason.`
 : "Correction request sent to the logistics company.",
 );
 setSelected(null);
 setDocuments([]);
 setNote("");
 await load();
 } catch (error) {
 toast.error(message(error));
 } finally {
 setActing(false);
 }
 };

 return (
 <div className="space-y-5">
 <section className="grid gap-3 sm:grid-cols-3">
 <Metric icon={Clock01Icon} label="All logistics companies" value={total} />
 <Metric icon={CheckmarkCircle02Icon} label="Complete on this page" value={rows.filter((row) => row.ready_for_review).length} />
 <Metric icon={ShieldCheckIcon} label="Awaiting decision" value={rows.filter((row) => row.ready_for_review && row.state !== "approved").length} />
 </section>

 <section className="rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-muted">
 <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between dark:border-border">
 <div>
 <h2 className="text-lg font-bold text-foreground">Onboarding approval queue</h2>
 <p className="text-sm text-muted-foreground">
 Review onboarding and legal documents before activating a logistics company.
 </p>
 </div>
 <button onClick={() => void load()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold dark:border-border">
 <HugeiconsIcon icon={RefreshCwIcon} size={16} /> Refresh
 </button>
 </div>

 <div className="grid gap-3 p-4 sm:grid-cols-[1fr_220px]">
 <label className="relative">
 <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-3.5 text-muted-foreground" size={16} />
 <input
 value={search}
 onChange={(event) => { setSearch(event.target.value); setPage(1); }}
 placeholder="Search company, code, email or phone"
 className="min-h-11 w-full rounded-xl border border-border bg-transparent pl-10 pr-3 text-sm dark:border-border"
 />
 </label>
 <select
 value={state}
 onChange={(event) => { setState(event.target.value); setPage(1); }}
 className="min-h-11 rounded-xl border border-border bg-transparent px-3 text-sm dark:border-border"
 >
 <option value="">All onboarding states</option>
 {states.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}
 </select>
 </div>

 {loading ? (
 <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
 {Array.from({ length: 6 }).map((_, index) => (
 <div key={index} className="h-44 animate-pulse rounded-xl bg-muted dark:bg-muted" />
 ))}
 </div>
 ) : rows.length ? (
 <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
 {rows.map((row) => (
 <article key={row.company_id} className="rounded-xl border border-border p-4 dark:border-border">
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <h3 className="truncate font-bold text-foreground">{row.company_name}</h3>
 <p className="mt-1 text-xs text-muted-foreground">
 {row.submitted_at ? `Submitted ${new Date(row.submitted_at).toLocaleString()}` : "Not submitted"}
 </p>
 </div>
 <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
 row.state === "approved" ? "bg-green-light-5 text-green-dark" :
 row.state === "rejected" ? "bg-red-light-5 text-red-dark" :
 row.state === "under_review" ? "bg-primary-100 text-primary-700" :
 "bg-yellow-light-2 text-yellow-dark-2"
 }`}>
 {pretty(row.state)}
 </span>
 </div>

 <div className="mt-4 flex items-end justify-between">
 <div>
 <strong className="text-2xl text-foreground">{row.progress_percent}%</strong>
 <p className="text-xs text-muted-foreground">{row.required_completed}/{row.required_total} required</p>
 </div>
 <div className="flex gap-1">
 {row.steps.filter((step) => step.required).map((step) => (
 <span key={step.key} title={step.label} className={`grid h-6 w-6 place-items-center rounded-full ${step.completed ? "bg-green-light-5 text-green-dark" : "bg-red-light-5 text-red-dark"}`}>
 {step.completed ? <HugeiconsIcon icon={CheckIcon} size={14} /> : <HugeiconsIcon icon={Cancel01Icon} size={14} />}
 </span>
 ))}
 </div>
 </div>

 <button onClick={() => void openReview(row)} className="mt-4 min-h-11 w-full rounded-xl bg-foreground text-sm font-bold text-background dark:bg-primary">
 Review application & documents
 </button>
 </article>
 ))}
 </div>
 ) : (
 <div className="p-12 text-center">
 <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mx-auto text-success" size={32} />
 <p className="mt-3 font-bold">No companies in this queue</p>
 <p className="text-sm text-muted-foreground">Change the filter to review another onboarding state.</p>
 </div>
 )}

 <div className="flex items-center justify-between border-t border-border p-4 text-sm dark:border-border">
 <span className="text-muted-foreground">{total} result{total === 1 ? "" : "s"}</span>
 <div className="flex items-center gap-2">
 <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border p-2 disabled:opacity-40"><HugeiconsIcon icon={ArrowLeft01Icon} size={16} /></button>
 <span>Page {page} of {Math.max(totalPages, 1)}</span>
 <button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border p-2 disabled:opacity-40"><HugeiconsIcon icon={ArrowRight01Icon} size={16} /></button>
 </div>
 </div>
 </section>

 {selected && (
 <div className="fixed inset-0 z-[90] bg-carbon/70 p-2 sm:p-4">
 <div className="mx-auto flex max-h-[96dvh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-card shadow-lg dark:bg-muted">
 <div className="flex items-start justify-between border-b p-4 dark:border-border sm:p-5">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-primary">Logistics compliance review</p>
 <h3 className="mt-1 text-xl font-bold">{selected.company_name}</h3>
 <p className="text-sm text-muted-foreground">{selected.required_completed}/{selected.required_total} onboarding requirements complete</p>
 </div>
 <button onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-muted dark:hover:bg-muted"><HugeiconsIcon icon={Cancel01Icon} size={20} /></button>
 </div>

 <div className="overflow-y-auto p-4 sm:p-5">
 <div className="grid gap-5 lg:grid-cols-[0.85fr_1.4fr]">
 <div className="space-y-4">
 <section>
 <h4 className="font-bold">Onboarding checklist</h4>
 <div className="mt-3 space-y-2">
 {selected.steps.map((step) => (
 <div key={step.key} className={`rounded-xl border p-3 ${step.completed ? "border-green-light-4 bg-green-light-6 dark:bg-emerald-950/20" : "border-red-light-4 bg-red-light-6 dark:bg-red-950/20"}`}>
 <div className="flex items-center gap-2">
 {step.completed ? <HugeiconsIcon icon={CheckmarkCircle02Icon} className="text-green-dark" size={16} /> : <HugeiconsIcon icon={CancelCircleIcon} className="text-destructive" size={16} />}
 <b className="text-sm">{step.label}</b>
 {!step.required && <span className="text-[10px] uppercase text-muted-foreground">Optional</span>}
 </div>
 <p className="mt-1 text-xs text-muted-foreground dark:text-muted-foreground">{step.description}</p>
 </div>
 ))}
 </div>
 </section>

 <section className="rounded-xl border border-border p-4 dark:border-border">
 <h4 className="font-bold">Final company decision</h4>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 Company approval remains disabled until every required company document is approved.
 </p>
 <label className="mt-3 block text-sm font-semibold">
 Review note
 <textarea
 value={note}
 onChange={(event) => setNote(event.target.value)}
 placeholder="Required for corrections or rejection"
 className="mt-2 min-h-28 w-full rounded-xl border border-border bg-transparent p-3 font-normal dark:border-border"
 />
 </label>
 <div className="mt-3 grid gap-2 sm:grid-cols-2">
 <button
 disabled={acting || selected.state === "approved"}
 onClick={() => void decideCompany("changes_requested")}
 className="min-h-11 rounded-xl border border-primary/40 px-3 text-sm font-bold text-primary disabled:opacity-40"
 >
 Request corrections
 </button>
 <button
 disabled={acting || selected.state === "approved"}
 onClick={() => void decideCompany("rejected")}
 className="min-h-11 rounded-xl border border-red-light-3 px-3 text-sm font-bold text-red-dark disabled:opacity-40"
 >
 Reject company
 </button>
 </div>
 <button
 disabled={acting || selected.state === "approved" || !selected.ready_for_review || !requiredApproved}
 onClick={() => void decideCompany("approve")}
 className="mt-2 min-h-11 w-full rounded-xl bg-success px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
 >
 Approve & activate company
 </button>
 {!requiredApproved && (
 <p className="mt-2 flex items-start gap-2 rounded-xl bg-yellow-light-4 p-3 text-xs text-yellow-dark-2">
 <HugeiconsIcon icon={Alert02Icon} size={16} className="mt-0.5 shrink-0" />
 Approve all four required company documents before final company activation.
 </p>
 )}
 </section>
 </div>

 <div className="space-y-4">
 <section className="rounded-xl border border-border p-4 dark:border-border">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h4 className="flex items-center gap-2 font-bold"><HugeiconsIcon icon={ShieldCheckIcon} size={18} className="text-primary" /> Company documents</h4>
 <p className="mt-1 text-xs text-muted-foreground">
 {requiredDocuments.filter((document) => document.status === "approved").length}/{REQUIRED_TYPES.length} required documents approved
 </p>
 </div>
 {!reviewStarted && selected.state !== "approved" && (
 <button
 disabled={acting || !selected.ready_for_review || !allRequiredPresent}
 onClick={() => void startReview()}
 className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground disabled:opacity-40"
 >
 <HugeiconsIcon icon={LockKeyIcon} size={14} /> Start document review
 </button>
 )}
 </div>

 {!reviewStarted && (
 <p className="mt-3 rounded-xl bg-primary-50 p-3 text-xs leading-5 text-primary-800">
 Starting review locks the company&apos;s submitted documents. The logistics company can still view them, but cannot replace or delete them unless you request changes.
 </p>
 )}

 {documentsLoading ? (
 <div className="mt-4 space-y-3">
 {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-xl bg-muted dark:bg-muted" />)}
 </div>
 ) : documents.length ? (
 <div className="mt-4 space-y-3">
 {documents.map((document) => {
 const required = REQUIRED_TYPES.includes(document.document_type);
 return (
 <article key={document.id} className="rounded-xl border border-border p-3 dark:border-border">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
 <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-2">
 <HugeiconsIcon icon={File01Icon} size={16} className="text-muted-foreground" />
 <h5 className="font-bold">{labels[document.document_type] || document.document_name}</h5>
 <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass[document.status] || "border-border bg-muted"}`}>
 {pretty(document.status)}
 </span>
 {required && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">Required</span>}
 </div>
 <p className="mt-1 truncate text-xs text-muted-foreground">{document.original_filename} · version {document.version}</p>
 {document.review_comment && (
 <p className="mt-2 rounded-lg bg-muted p-2 text-xs leading-5 text-muted-foreground dark:bg-card/60 dark:text-muted-foreground">
 <b>Review comment:</b> {document.review_comment}
 </p>
 )}
 </div>
 <button onClick={() => void viewDocument(document)} className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-bold dark:border-border">
 <HugeiconsIcon icon={ViewIcon} size={14} /> Preview
 </button>
 </div>

 {selected.state !== "approved" && (
 <div className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-3 dark:border-border">
 <button
 disabled={acting || document.status === "approved"}
 onClick={() => void reviewDocument(document, "approve")}
 className="min-h-9 rounded-lg bg-success px-3 text-xs font-bold text-white disabled:opacity-40"
 >
 Approve
 </button>
 <button
 disabled={acting}
 onClick={() => { setDocumentAction({ document, decision: "changes_requested" }); setDocumentComment(document.review_comment || ""); }}
 className="min-h-9 rounded-lg border border-primary/40 px-3 text-xs font-bold text-primary disabled:opacity-40"
 >
 Request changes
 </button>
 <button
 disabled={acting}
 onClick={() => { setDocumentAction({ document, decision: "rejected" }); setDocumentComment(document.review_comment || ""); }}
 className="min-h-9 rounded-lg border border-red-light-3 px-3 text-xs font-bold text-red-dark disabled:opacity-40"
 >
 Reject
 </button>
 </div>
 )}
 </article>
 );
 })}
 </div>
 ) : (
 <div className="mt-4 rounded-xl border border-dashed border-border p-8 text-center">
 <HugeiconsIcon icon={File01Icon} className="mx-auto text-muted-foreground" size={28} />
 <p className="mt-2 font-semibold">No company documents uploaded</p>
 </div>
 )}

 <button
 onClick={async () => {
 if (!selected) return;
 const next = !showHistory;
 setShowHistory(next);
 if (next && history.length === 0) await loadDocuments(selected.company_id, true);
 }}
 className="mt-4 inline-flex min-h-9 items-center gap-2 text-xs font-bold text-primary"
 >
 <HugeiconsIcon icon={HistoryIcon} size={14} /> {showHistory ? "Hide document history" : "View previous versions"}
 </button>

 {showHistory && (
 <div className="mt-3 space-y-2">
 {history.length ? history.map((document) => (
 <div key={document.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted p-3 dark:bg-card/60">
 <div className="min-w-0">
 <p className="truncate text-xs font-bold">{labels[document.document_type] || document.document_name} · v{document.version}</p>
 <p className="truncate text-[11px] text-muted-foreground">{document.original_filename} · {pretty(document.status)}</p>
 </div>
 <button onClick={() => void viewDocument(document)} className="shrink-0 rounded-lg border px-2 py-1 text-xs font-semibold">
 View
 </button>
 </div>
 )) : <p className="text-xs text-muted-foreground">No previous document versions.</p>}
 </div>
 )}
 </section>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {documentAction && (
 <div className="fixed inset-0 z-[110] grid place-items-center bg-carbon/70 p-4">
 <div className="w-full max-w-lg rounded-xl bg-card p-5 shadow-lg dark:bg-muted">
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className="text-xs font-bold uppercase tracking-wider text-primary">Document review</p>
 <h3 className="mt-1 text-lg font-bold">
 {documentAction.decision === "rejected" ? "Reject" : "Request changes"} · {labels[documentAction.document.document_type] || documentAction.document.document_name}
 </h3>
 </div>
 <button onClick={() => setDocumentAction(null)} className="rounded-lg p-2"><HugeiconsIcon icon={Cancel01Icon} size={18} /></button>
 </div>
 <label className="mt-4 block text-sm font-semibold">
 Review reason
 <textarea
 value={documentComment}
 onChange={(event) => setDocumentComment(event.target.value)}
 placeholder="Explain exactly what the logistics company must correct."
 className="mt-2 min-h-32 w-full rounded-xl border border-border bg-transparent p-3 font-normal dark:border-border"
 />
 </label>
 <p className="mt-2 text-xs leading-5 text-muted-foreground">
 This comment will be visible to the logistics company. Editing will be unlocked so they can submit a corrected version.
 </p>
 <div className="mt-5 flex justify-end gap-2">
 <button onClick={() => setDocumentAction(null)} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold">Cancel</button>
 <button
 disabled={acting || !documentComment.trim()}
 onClick={() => void reviewDocument(documentAction.document, documentAction.decision, documentComment)}
 className={`min-h-11 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-40 ${documentAction.decision === "rejected" ? "bg-destructive" : "bg-primary-dark"}`}
 >
 {acting ? "Saving…" : documentAction.decision === "rejected" ? "Reject document" : "Send correction request"}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

function Metric({
 icon: Icon,
 label,
 value,
}: {
 icon: IconSvgElement;
 label: string;
 value: number;
}) {
 return (
 <article className="rounded-xl border border-border bg-card p-4 shadow-sm dark:border-border dark:bg-muted">
 <HugeiconsIcon icon={Icon} className="text-primary" size={18} />
 <strong className="mt-3 block text-2xl text-foreground">{value}</strong>
 <span className="text-xs text-muted-foreground">{label}</span>
 </article>
 );
}
