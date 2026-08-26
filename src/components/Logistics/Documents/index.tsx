"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  History,
  LockKeyhole,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { logisticsDocumentsApi } from "@/lib/api/endpoints/logistics-documents";
import type {
  LogisticsCompanyDocument,
  LogisticsDocumentRequirements,
  LogisticsDocumentStatus,
  LogisticsDocumentType,
} from "@/types/api/logistics-documents";

const LABELS: Record<LogisticsDocumentType, string> = {
  tin_certificate: "TIN / Tax Certificate",
  registration_certificate: "Company Registration Certificate",
  business_license: "Business / Operating Licence",
  representative_id: "Authorized Representative / Director ID",
  proof_of_address: "Proof of Business Address",
  insurance_certificate: "Insurance Certificate",
  logistics_license: "Logistics / Transport Licence",
  other: "Other Supporting Document",
};

const DESCRIPTIONS: Record<LogisticsDocumentType, string> = {
  tin_certificate: "Official tax-registration certificate for the company.",
  registration_certificate: "Certificate of incorporation or equivalent company-registration evidence.",
  business_license: "Current licence authorizing the company to conduct business.",
  representative_id: "Government-issued ID for the authorized representative or director.",
  proof_of_address: "Recent document confirming the company's operating address.",
  insurance_certificate: "Current insurance evidence relevant to logistics operations.",
  logistics_license: "Transport, courier or logistics licence where applicable.",
  other: "Any additional supporting compliance document requested by Xerin.",
};

const statusStyle: Record<LogisticsDocumentStatus, string> = {
  pending_review: "bg-amber-50 text-amber-700 border-amber-200",
  under_review: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  changes_requested: "bg-orange-50 text-orange-700 border-orange-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const prettyStatus = (value: string) => value.replaceAll("_", " ");
const fileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const errorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "The document request could not be completed.";
};

function validateFile(file: File | null) {
  if (!file) return null;
  const extension = `.${file.name.split(".").pop()?.toLowerCase() || ""}`;
  if (![".pdf", ".png", ".jpg", ".jpeg"].includes(extension)) {
    return "Only PDF, PNG, JPG and JPEG documents are allowed.";
  }
  if (file.size > 15 * 1024 * 1024) {
    return "The document must not exceed 15 MB.";
  }
  if (file.size === 0) return "The selected document is empty.";
  return null;
}

export default function LogisticsDocuments() {
  const [requirements, setRequirements] =
    useState<LogisticsDocumentRequirements | null>(null);
  const [documents, setDocuments] = useState<LogisticsCompanyDocument[]>([]);
  const [history, setHistory] = useState<LogisticsCompanyDocument[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const [uploadingType, setUploadingType] =
    useState<LogisticsDocumentType | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [editing, setEditing] = useState<LogisticsCompanyDocument | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editName, setEditName] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [req, docs] = await Promise.all([
        logisticsDocumentsApi.requirements(),
        logisticsDocumentsApi.list(false),
      ]);
      setRequirements(req);
      setDocuments(docs.results);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const currentByType = useMemo(
    () =>
      new Map<LogisticsDocumentType, LogisticsCompanyDocument>(
        documents.map((document) => [document.document_type, document]),
      ),
    [documents],
  );

  const allTypes = useMemo(() => {
    const required = requirements?.required_types ?? [];
    const optional = requirements?.optional_types ?? [];
    return [...required, ...optional.filter((type) => !required.includes(type))];
  }, [requirements]);

  const requiredCount = requirements?.required_types.length ?? 0;
  const uploadedRequired = requirements?.uploaded_required_types.length ?? 0;
  const progress = requiredCount
    ? Math.round((uploadedRequired / requiredCount) * 100)
    : 0;

  const chooseUpload = (type: LogisticsDocumentType) => {
    if (requirements?.editing_locked) {
      toast.error("Documents are view-only while administrator review is in progress.");
      return;
    }
    setUploadingType(type);
    setUploadName(LABELS[type]);
    setUploadFile(null);
  };

  const closeUpload = () => {
    if (busyKey) return;
    setUploadingType(null);
    setUploadFile(null);
    setUploadName("");
  };

  const submitUpload = async () => {
    if (!uploadingType || !uploadFile) {
      toast.error("Choose a document file first.");
      return;
    }
    const validationError = validateFile(uploadFile);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setBusyKey(`upload:${uploadingType}`);
    try {
      await logisticsDocumentsApi.create({
        document_type: uploadingType,
        document_name: uploadName,
        file: uploadFile,
      });
      toast.success(`${LABELS[uploadingType]} uploaded successfully.`);
      closeUpload();
      await load(true);
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setBusyKey("");
    }
  };

  const beginEdit = (document: LogisticsCompanyDocument) => {
    if (!document.can_edit) return;
    setEditing(document);
    setEditName(document.document_name);
    setEditFile(null);
  };

  const closeEdit = () => {
    if (busyKey) return;
    setEditing(null);
    setEditName("");
    setEditFile(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (editFile) {
      const validationError = validateFile(editFile);
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }
    if (!editName.trim() && !editFile) {
      toast.error("Change the document name or choose a replacement file.");
      return;
    }
    setBusyKey(`edit:${editing.id}`);
    try {
      await logisticsDocumentsApi.update(editing.id, {
        document_name: editName,
        file: editFile || undefined,
      });
      toast.success(
        editFile
          ? "Corrected document uploaded as a new version."
          : "Document details updated.",
      );
      closeEdit();
      await load(true);
      if (showHistory) await loadHistory();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setBusyKey("");
    }
  };

  const remove = async (document: LogisticsCompanyDocument) => {
    if (!document.can_delete) return;
    if (
      !window.confirm(
        `Delete ${LABELS[document.document_type]}? You can upload it again while editing is allowed.`,
      )
    )
      return;
    setBusyKey(`delete:${document.id}`);
    try {
      await logisticsDocumentsApi.remove(document.id);
      toast.success("Document removed.");
      await load(true);
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setBusyKey("");
    }
  };

  const view = async (document: LogisticsCompanyDocument) => {
    setBusyKey(`view:${document.id}`);
    try {
      const blob = await logisticsDocumentsApi.viewBlob(document.id);
      const url = URL.createObjectURL(blob);
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) {
        const anchor = window.document.createElement("a");
        anchor.href = url;
        anchor.download = document.original_filename || document.document_name;
        anchor.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setBusyKey("");
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const result = await logisticsDocumentsApi.list(true);
      setHistory(result.results.filter((document) => !document.is_current));
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleHistory = async () => {
    const next = !showHistory;
    setShowHistory(next);
    if (next && history.length === 0) await loadHistory();
  };

  if (loading) {
    return (
      <section id="documents" className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw size={18} className="animate-spin" />
          Loading company documents…
        </div>
      </section>
    );
  }

  return (
    <section id="documents" className="scroll-mt-24 space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue">
              <ShieldCheck size={15} />
              Company verification
            </p>
            <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Company documents
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Upload the legal and compliance evidence required for Xerin logistics onboarding.
              You may correct documents before administrator review starts, or after changes are requested.
            </p>
          </div>

          <div className="min-w-60 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/40">
            <div className="flex items-end justify-between">
              <span className="text-xs font-semibold text-slate-500">Required uploaded</span>
              <strong className="text-xl">{uploadedRequired}/{requiredCount}</strong>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full bg-blue transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {requirements?.all_required_approved
                ? "All required documents are approved."
                : requirements?.all_required_uploaded
                  ? "All required files are uploaded and awaiting approval."
                  : "Complete all required documents to continue onboarding."}
            </p>
          </div>
        </div>
      </div>

      {requirements?.editing_locked && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
          <LockKeyhole size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Administrator review in progress</p>
            <p className="mt-1 text-xs leading-5">
              Documents are view-only while the application is under review or after approval.
              Editing will become available again if Xerin requests changes.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button type="button" onClick={() => void load()} className="mt-2 font-semibold underline">
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {allTypes.map((type) => {
          const document = currentByType.get(type);
          const required = requirements?.required_types.includes(type) ?? false;
          return (
            <article
              key={type}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                  {document?.status === "approved" ? <FileCheck2 size={19} /> : <FileText size={19} />}
                </span>
                <div className="flex flex-wrap justify-end gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${required ? "bg-blue/10 text-blue" : "bg-slate-100 text-slate-500 dark:bg-slate-700"}`}>
                    {required ? "Required" : "Optional"}
                  </span>
                  {document && (
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyle[document.status]}`}>
                      {prettyStatus(document.status)}
                    </span>
                  )}
                </div>
              </div>

              <h4 className="mt-4 font-bold text-slate-900 dark:text-white">{LABELS[type]}</h4>
              <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{DESCRIPTIONS[type]}</p>

              {!document ? (
                <div className="mt-4">
                  <p className="text-xs text-slate-400">Not uploaded</p>
                  <button
                    type="button"
                    disabled={Boolean(requirements?.editing_locked)}
                    onClick={() => chooseUpload(type)}
                    className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UploadCloud size={15} />
                    Upload document
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-900/40">
                    <p className="truncate font-semibold text-slate-700 dark:text-slate-200">
                      {document.original_filename}
                    </p>
                    <p className="mt-1 text-slate-500">
                      Version {document.version} · {fileSize(document.file_size)}
                    </p>
                  </div>

                  {document.review_comment && (
                    <div className={`mt-3 rounded-xl border p-3 text-xs ${
                      document.status === "changes_requested" || document.status === "rejected"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}>
                      <p className="font-bold uppercase tracking-wide">Administrator comment</p>
                      <p className="mt-1 leading-5">{document.review_comment}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void view(document)}
                      disabled={busyKey === `view:${document.id}`}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-white"
                    >
                      <Eye size={14} />
                      {busyKey === `view:${document.id}` ? "Opening…" : "View"}
                    </button>

                    {document.can_edit && (
                      <button
                        type="button"
                        onClick={() => beginEdit(document)}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900"
                      >
                        <Pencil size={14} />
                        Edit / replace
                      </button>
                    )}

                    {document.can_delete && (
                      <button
                        type="button"
                        onClick={() => void remove(document)}
                        disabled={busyKey === `delete:${document.id}`}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 px-3 text-xs font-bold text-red-700 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}

                    {!document.can_edit && (
                      <span className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-xs font-semibold text-slate-500 dark:bg-slate-700">
                        <LockKeyhole size={13} />
                        View only
                      </span>
                    )}
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => void toggleHistory()}
          className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-blue"
        >
          <History size={16} />
          {showHistory ? "Hide document history" : "View previous document versions"}
        </button>

        {showHistory && (
          <div className="mt-4 space-y-2">
            {historyLoading ? (
              <p className="text-sm text-slate-500">Loading history…</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-500">No previous versions yet.</p>
            ) : (
              history.map((document) => (
                <div key={document.id} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900/40">
                  <div className="min-w-0">
                    <p className="font-semibold">{LABELS[document.document_type]} · version {document.version}</p>
                    <p className="truncate text-xs text-slate-500">
                      {document.original_filename} · {prettyStatus(document.status)}
                    </p>
                    {document.review_comment && (
                      <p className="mt-1 text-xs text-slate-500">Admin: {document.review_comment}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void view(document)}
                    className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold dark:border-slate-600"
                  >
                    <Eye size={13} />
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {uploadingType && (
        <Modal title={`Upload ${LABELS[uploadingType]}`} onClose={closeUpload}>
          <p className="text-sm leading-6 text-slate-500">{DESCRIPTIONS[uploadingType]}</p>
          <label className="mt-4 block text-sm font-semibold">
            Document name
            <input
              value={uploadName}
              onChange={(event) => setUploadName(event.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </label>
          <FilePicker file={uploadFile} setFile={setUploadFile} />
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={closeUpload} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submitUpload()}
              disabled={!uploadFile || Boolean(busyKey)}
              className="min-h-11 rounded-xl bg-blue px-4 text-sm font-bold text-white disabled:opacity-50"
            >
              {busyKey ? "Uploading…" : "Upload"}
            </button>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal title={`Edit ${LABELS[editing.document_type]}`} onClose={closeEdit}>
          {editing.review_comment && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
              <p className="font-bold">Administrator comment</p>
              <p className="mt-1 leading-6">{editing.review_comment}</p>
            </div>
          )}
          <label className="mt-4 block text-sm font-semibold">
            Document name
            <input
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-900"
            />
          </label>
          <FilePicker file={editFile} setFile={setEditFile} optional />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Choosing a replacement file creates a new document version and sends it back to pending review.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={closeEdit} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void saveEdit()}
              disabled={Boolean(busyKey)}
              className="min-h-11 rounded-xl bg-blue px-4 text-sm font-bold text-white disabled:opacity-50"
            >
              {busyKey ? "Saving…" : "Save changes"}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

function FilePicker({
  file,
  setFile,
  optional = false,
}: {
  file: File | null;
  setFile: (file: File | null) => void;
  optional?: boolean;
}) {
  return (
    <label className="mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center hover:border-blue dark:border-slate-600 dark:bg-slate-900/40">
      <UploadCloud size={23} className="text-slate-400" />
      <span className="mt-2 max-w-full truncate text-sm font-semibold">
        {file?.name || (optional ? "Choose replacement file (optional)" : "Choose document file")}
      </span>
      <span className="mt-1 text-xs text-slate-500">
        PDF, PNG, JPG or JPEG · maximum 15 MB
      </span>
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
        className="hidden"
        onChange={(event) => {
          const selected = event.target.files?.[0] || null;
          const validationError = validateFile(selected);
          if (validationError) {
            toast.error(validationError);
            event.currentTarget.value = "";
            return;
          }
          setFile(selected);
          event.currentTarget.value = "";
        }}
      />
      {file && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            setFile(null);
          }}
          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-slate-500 shadow-sm dark:bg-slate-800"
        >
          <X size={12} />
          Clear
        </button>
      )}
    </label>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-800 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-700">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
