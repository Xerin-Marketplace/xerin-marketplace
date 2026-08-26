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
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  History,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
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
  pending_review: "border-amber-200 bg-amber-50 text-amber-800",
  under_review: "border-blue-200 bg-blue-50 text-blue-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  changes_requested: "border-orange-200 bg-orange-50 text-orange-800",
  rejected: "border-red-200 bg-red-50 text-red-700",
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
        <Metric icon={Clock3} label="All logistics companies" value={total} />
        <Metric icon={CheckCircle2} label="Complete on this page" value={rows.filter((row) => row.ready_for_review).length} />
        <Metric icon={ShieldCheck} label="Awaiting decision" value={rows.filter((row) => row.ready_for_review && row.state !== "approved").length} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Onboarding approval queue</h2>
            <p className="text-sm text-slate-500">
              Review onboarding and legal documents before activating a logistics company.
            </p>
          </div>
          <button onClick={() => void load()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold dark:border-slate-600">
            <RefreshCw size={17} /> Refresh
          </button>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-[1fr_220px]">
          <label className="relative">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Search company, code, email or phone"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-transparent pl-10 pr-3 text-sm dark:border-slate-600"
            />
          </label>
          <select
            value={state}
            onChange={(event) => { setState(event.target.value); setPage(1); }}
            className="min-h-11 rounded-xl border border-slate-300 bg-transparent px-3 text-sm dark:border-slate-600"
          >
            <option value="">All onboarding states</option>
            {states.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-700" />
            ))}
          </div>
        ) : rows.length ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <article key={row.company_id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900 dark:text-white">{row.company_name}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {row.submitted_at ? `Submitted ${new Date(row.submitted_at).toLocaleString()}` : "Not submitted"}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                    row.state === "approved" ? "bg-emerald-100 text-emerald-700" :
                    row.state === "rejected" ? "bg-red-100 text-red-700" :
                    row.state === "under_review" ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-800"
                  }`}>
                    {pretty(row.state)}
                  </span>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <strong className="text-2xl text-slate-900 dark:text-white">{row.progress_percent}%</strong>
                    <p className="text-xs text-slate-500">{row.required_completed}/{row.required_total} required</p>
                  </div>
                  <div className="flex gap-1">
                    {row.steps.filter((step) => step.required).map((step) => (
                      <span key={step.key} title={step.label} className={`grid h-6 w-6 place-items-center rounded-full ${step.completed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {step.completed ? <Check size={13} /> : <X size={13} />}
                      </span>
                    ))}
                  </div>
                </div>

                <button onClick={() => void openReview(row)} className="mt-4 min-h-11 w-full rounded-xl bg-slate-950 text-sm font-bold text-white dark:bg-blue">
                  Review application & documents
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <CheckCircle2 className="mx-auto text-emerald-500" size={34} />
            <p className="mt-3 font-bold">No companies in this queue</p>
            <p className="text-sm text-slate-500">Change the filter to review another onboarding state.</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 p-4 text-sm dark:border-slate-700">
          <span className="text-slate-500">{total} result{total === 1 ? "" : "s"}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={17} /></button>
            <span>Page {page} of {Math.max(totalPages, 1)}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight size={17} /></button>
          </div>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-[90] bg-slate-950/70 p-2 sm:p-4">
          <div className="mx-auto flex max-h-[96dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
            <div className="flex items-start justify-between border-b p-4 dark:border-slate-700 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue">Logistics compliance review</p>
                <h3 className="mt-1 text-xl font-bold">{selected.company_name}</h3>
                <p className="text-sm text-slate-500">{selected.required_completed}/{selected.required_total} onboarding requirements complete</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={20} /></button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-5">
              <div className="grid gap-5 lg:grid-cols-[0.85fr_1.4fr]">
                <div className="space-y-4">
                  <section>
                    <h4 className="font-bold">Onboarding checklist</h4>
                    <div className="mt-3 space-y-2">
                      {selected.steps.map((step) => (
                        <div key={step.key} className={`rounded-xl border p-3 ${step.completed ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}>
                          <div className="flex items-center gap-2">
                            {step.completed ? <CheckCircle2 className="text-emerald-600" size={17} /> : <XCircle className="text-red-600" size={17} />}
                            <b className="text-sm">{step.label}</b>
                            {!step.required && <span className="text-[10px] uppercase text-slate-500">Optional</span>}
                          </div>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <h4 className="font-bold">Final company decision</h4>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Company approval remains disabled until every required company document is approved.
                    </p>
                    <label className="mt-3 block text-sm font-semibold">
                      Review note
                      <textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Required for corrections or rejection"
                        className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-transparent p-3 font-normal dark:border-slate-600"
                      />
                    </label>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <button
                        disabled={acting || selected.state === "approved"}
                        onClick={() => void decideCompany("changes_requested")}
                        className="min-h-11 rounded-xl border border-orange-300 px-3 text-sm font-bold text-orange-700 disabled:opacity-40"
                      >
                        Request corrections
                      </button>
                      <button
                        disabled={acting || selected.state === "approved"}
                        onClick={() => void decideCompany("rejected")}
                        className="min-h-11 rounded-xl border border-red-300 px-3 text-sm font-bold text-red-700 disabled:opacity-40"
                      >
                        Reject company
                      </button>
                    </div>
                    <button
                      disabled={acting || selected.state === "approved" || !selected.ready_for_review || !requiredApproved}
                      onClick={() => void decideCompany("approve")}
                      className="mt-2 min-h-11 w-full rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Approve & activate company
                    </button>
                    {!requiredApproved && (
                      <p className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                        Approve all four required company documents before final company activation.
                      </p>
                    )}
                  </section>
                </div>

                <div className="space-y-4">
                  <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="flex items-center gap-2 font-bold"><ShieldCheck size={18} className="text-blue" /> Company documents</h4>
                        <p className="mt-1 text-xs text-slate-500">
                          {requiredDocuments.filter((document) => document.status === "approved").length}/{REQUIRED_TYPES.length} required documents approved
                        </p>
                      </div>
                      {!reviewStarted && selected.state !== "approved" && (
                        <button
                          disabled={acting || !selected.ready_for_review || !allRequiredPresent}
                          onClick={() => void startReview()}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue px-4 text-xs font-bold text-white disabled:opacity-40"
                        >
                          <LockKeyhole size={14} /> Start document review
                        </button>
                      )}
                    </div>

                    {!reviewStarted && (
                      <p className="mt-3 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-800">
                        Starting review locks the company's submitted documents. The logistics company can still view them, but cannot replace or delete them unless you request changes.
                      </p>
                    )}

                    {documentsLoading ? (
                      <div className="mt-4 space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700" />)}
                      </div>
                    ) : documents.length ? (
                      <div className="mt-4 space-y-3">
                        {documents.map((document) => {
                          const required = REQUIRED_TYPES.includes(document.document_type);
                          return (
                            <article key={document.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <FileText size={16} className="text-slate-400" />
                                    <h5 className="font-bold">{labels[document.document_type] || document.document_name}</h5>
                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass[document.status] || "border-slate-200 bg-slate-50"}`}>
                                      {pretty(document.status)}
                                    </span>
                                    {required && <span className="rounded-full bg-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase text-blue">Required</span>}
                                  </div>
                                  <p className="mt-1 truncate text-xs text-slate-500">{document.original_filename} · version {document.version}</p>
                                  {document.review_comment && (
                                    <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs leading-5 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
                                      <b>Review comment:</b> {document.review_comment}
                                    </p>
                                  )}
                                </div>
                                <button onClick={() => void viewDocument(document)} className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-xs font-bold dark:border-slate-600">
                                  <Eye size={14} /> Preview
                                </button>
                              </div>

                              {selected.state !== "approved" && (
                                <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 sm:grid-cols-3 dark:border-slate-700">
                                  <button
                                    disabled={acting || document.status === "approved"}
                                    onClick={() => void reviewDocument(document, "approve")}
                                    className="min-h-9 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white disabled:opacity-40"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    disabled={acting}
                                    onClick={() => { setDocumentAction({ document, decision: "changes_requested" }); setDocumentComment(document.review_comment || ""); }}
                                    className="min-h-9 rounded-lg border border-orange-300 px-3 text-xs font-bold text-orange-700 disabled:opacity-40"
                                  >
                                    Request changes
                                  </button>
                                  <button
                                    disabled={acting}
                                    onClick={() => { setDocumentAction({ document, decision: "rejected" }); setDocumentComment(document.review_comment || ""); }}
                                    className="min-h-9 rounded-lg border border-red-300 px-3 text-xs font-bold text-red-700 disabled:opacity-40"
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
                      <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                        <FileText className="mx-auto text-slate-400" size={28} />
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
                      className="mt-4 inline-flex min-h-9 items-center gap-2 text-xs font-bold text-blue"
                    >
                      <History size={14} /> {showHistory ? "Hide document history" : "View previous versions"}
                    </button>

                    {showHistory && (
                      <div className="mt-3 space-y-2">
                        {history.length ? history.map((document) => (
                          <div key={document.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/40">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold">{labels[document.document_type] || document.document_name} · v{document.version}</p>
                              <p className="truncate text-[11px] text-slate-500">{document.original_filename} · {pretty(document.status)}</p>
                            </div>
                            <button onClick={() => void viewDocument(document)} className="shrink-0 rounded-lg border px-2 py-1 text-xs font-semibold">
                              View
                            </button>
                          </div>
                        )) : <p className="text-xs text-slate-500">No previous document versions.</p>}
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
        <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/70 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue">Document review</p>
                <h3 className="mt-1 text-lg font-bold">
                  {documentAction.decision === "rejected" ? "Reject" : "Request changes"} — {labels[documentAction.document.document_type] || documentAction.document.document_name}
                </h3>
              </div>
              <button onClick={() => setDocumentAction(null)} className="rounded-lg p-2"><X size={18} /></button>
            </div>
            <label className="mt-4 block text-sm font-semibold">
              Review reason
              <textarea
                value={documentComment}
                onChange={(event) => setDocumentComment(event.target.value)}
                placeholder="Explain exactly what the logistics company must correct."
                className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 bg-transparent p-3 font-normal dark:border-slate-600"
              />
            </label>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              This comment will be visible to the logistics company. Editing will be unlocked so they can submit a corrected version.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDocumentAction(null)} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold">Cancel</button>
              <button
                disabled={acting || !documentComment.trim()}
                onClick={() => void reviewDocument(documentAction.document, documentAction.decision, documentComment)}
                className={`min-h-11 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-40 ${documentAction.decision === "rejected" ? "bg-red-600" : "bg-orange-600"}`}
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
  icon: typeof Clock3;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <Icon className="text-blue" size={19} />
      <strong className="mt-3 block text-2xl text-slate-900 dark:text-white">{value}</strong>
      <span className="text-xs text-slate-500">{label}</span>
    </article>
  );
}
