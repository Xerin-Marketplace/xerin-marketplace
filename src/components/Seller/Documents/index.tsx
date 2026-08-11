"use client";

import BackendDocumentPreview from "@/components/Common/BackendDocumentPreview";
import { ApiError } from "@/lib/api/client";
import { sellersApi } from "@/lib/api/endpoints/sellers";
import { authStorage } from "@/lib/auth/storage";
import type {
  SellerDocumentType,
  SellerKycDocument,
  SellerKycStatus,
} from "@/types/api/seller";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileCheck2,
  FileText,
  ImageIcon,
  RefreshCw,
  Send,
  UploadCloud,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

type StoredUser = {
  account_type?: string;
  roles?: string[];
};

type SelectedDocument = {
  file: File;
  previewUrl: string;
};

const labels: Record<string, string> = {
  tin: "TIN Certificate",
  business_registration: "Business Licence / Registration",
  business_profile: "Business Profile",
};

const descriptions: Record<string, string> = {
  tin: "Upload a valid Taxpayer Identification Number certificate.",
  business_registration:
    "Upload your business licence or official business registration certificate.",
  business_profile:
    "Upload the required business profile or supporting company document.",
};

const pretty = (value: string) =>
  labels[value] ||
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function SellerBusinessDocuments() {
  const user = authStorage.getUser<StoredUser>();
  const token = authStorage.getAccessToken();

  const isSeller = useMemo(
    () =>
      Boolean(
        user &&
          (user.account_type === "seller" ||
            (user.roles ?? []).includes("seller")),
      ),
    [user],
  );

  const [status, setStatus] = useState<SellerKycStatus | null>(null);
  const [documents, setDocuments] = useState<SellerKycDocument[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<
    Partial<Record<SellerDocumentType, SelectedDocument>>
  >({});
  const previewUrlsRef = useRef<Set<string>>(new Set());
  const [preview, setPreview] = useState<{
    title: string;
    url: string;
    mimeType?: string | null;
  } | null>(null);
  const [submittedPreview, setSubmittedPreview] = useState<{
    title: string;
    url: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingAll, setSubmittingAll] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !isSeller) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSeller, token]);

  useEffect(() => {
    // Keep local preview URLs alive while several documents are selected.
    // Revoke them only when this page unmounts.
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    };
  }, []);

  async function load() {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [kycStatus, docs] = await Promise.all([
        sellersApi.getKycStatus(token),
        sellersApi.getKycDocuments(token),
      ]);

      setStatus(kycStatus);
      setDocuments(docs);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Unable to load your business documents.",
      );
    } finally {
      setLoading(false);
    }
  }

  function chooseFile(type: SellerDocumentType, file: File | null) {
    setSelectedFiles((current) => {
      const existing = current[type];

      if (existing?.previewUrl) {
        URL.revokeObjectURL(existing.previewUrl);
        previewUrlsRef.current.delete(existing.previewUrl);
      }

      if (!file) {
        const next = { ...current };
        delete next[type];
        return next;
      }

      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);

      return {
        ...current,
        [type]: {
          file,
          previewUrl,
        },
      };
    });
  }

  function removeSelected(type: SellerDocumentType) {
    chooseFile(type, null);
  }

  async function submitAllDocuments() {
    if (!token) return;

    const entries = Object.entries(selectedFiles).filter(
      (entry): entry is [SellerDocumentType, SelectedDocument] =>
        Boolean(entry[1]?.file),
    );

    if (!entries.length) {
      toast.error("Choose at least one document before submitting.");
      return;
    }

    setSubmittingAll(true);

    try {
      const results = await Promise.allSettled(
        entries.map(([documentType, selected]) =>
          sellersApi.uploadKycDocument(
            {
              document_type: documentType,
              file: selected.file,
            },
            token,
          ),
        ),
      );

      const failed: SellerDocumentType[] = [];
      const succeeded: SellerDocumentType[] = [];

      results.forEach((result, index) => {
        const type = entries[index][0];

        if (result.status === "fulfilled") {
          succeeded.push(type);
        } else {
          failed.push(type);
        }
      });

      if (succeeded.length) {
        setSelectedFiles((current) => {
          const next = { ...current };

          succeeded.forEach((type) => {
            if (next[type]?.previewUrl) {
              URL.revokeObjectURL(next[type]!.previewUrl);
              previewUrlsRef.current.delete(next[type]!.previewUrl);
            }
            delete next[type];
          });

          return next;
        });
      }

      await load();

      if (!failed.length) {
        toast.success(
          `${succeeded.length} document${
            succeeded.length === 1 ? "" : "s"
          } submitted successfully.`,
        );
      } else if (succeeded.length) {
        toast.error(
          `${succeeded.length} uploaded, but ${failed.length} failed. Please retry the failed document(s).`,
        );
      } else {
        toast.error("Document upload failed. Please try again.");
      }
    } finally {
      setSubmittingAll(false);
    }
  }

  if (!token || !isSeller) return null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#e7ebf0] bg-white p-12 text-center dark:border-white/10 dark:bg-[#1f2937]">
        <RefreshCw
          className="mx-auto animate-spin text-[#f7941d]"
          size={24}
        />
        <p className="mt-3 text-sm text-[#64748b]">
          Loading business documents...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-7 text-center text-red-700">
        <AlertCircle className="mx-auto" />
        <p className="mt-2 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const required = (status?.required_documents ?? []) as SellerDocumentType[];
  const missing = status?.missing_documents ?? [];
  const uploadedCount = Math.max(0, required.length - missing.length);
  const progress = required.length
    ? Math.round((uploadedCount / required.length) * 100)
    : 0;

  const selectedCount = Object.values(selectedFiles).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#e7ebf0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1f2937] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f7941d]">
              Seller Activation
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.025em]">
              Business Documents
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b]">
              Select all required documents first, preview every file, then use
              one action to submit them together for seller verification.
            </p>
          </div>

          <div className="min-w-[230px] rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748b]">Documents complete</span>
              <b>{progress}%</b>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-[#f7941d]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-[#94a3b8]">
              {uploadedCount} of {required.length} already uploaded
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e7ebf0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#f7941d] dark:bg-orange-500/10">
                <UploadCloud size={19} />
              </span>
              <div>
                <h3 className="font-bold">Prepare verification documents</h3>
                <p className="text-xs text-[#64748b]">
                  PDF, JPG and PNG files are supported.
                </p>
              </div>
            </div>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-[#64748b] dark:bg-white/5">
            {selectedCount} selected
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {required.map((type) => {
            const uploadedDocument = documents.find(
              (item) => item.document_type === type,
            );
            const selected = selectedFiles[type];
            const uploadedUrl =
              uploadedDocument?.document_url || uploadedDocument?.file_url || "";
            const rejected = uploadedDocument?.status === "rejected";

            return (
              <article
                key={type}
                className={`rounded-2xl border p-4 transition ${
                  selected
                    ? "border-[#f7941d]/50 bg-orange-50/30 dark:bg-orange-500/5"
                    : "border-[#e7ebf0] dark:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#64748b] dark:bg-white/5">
                    <FileText size={18} />
                  </span>

                  {uploadedDocument && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                        rejected
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {uploadedDocument.status || "uploaded"}
                    </span>
                  )}
                </div>

                <h4 className="mt-4 font-semibold">{pretty(type)}</h4>
                <p className="mt-1 min-h-10 text-xs leading-5 text-[#64748b]">
                  {descriptions[type]}
                </p>

                {uploadedDocument?.rejection_reason && (
                  <p className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs leading-5 text-red-700">
                    {uploadedDocument.rejection_reason}
                  </p>
                )}

                {uploadedUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setSubmittedPreview({
                        title: `${pretty(type)} — submitted document`,
                        url: uploadedUrl,
                      })
                    }
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#f7941d]"
                  >
                    <Eye size={14} />
                    View submitted document
                  </button>
                )}

                <label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dfe4ea] bg-slate-50 px-3 py-4 text-center transition hover:border-[#f7941d] dark:border-white/10 dark:bg-white/[0.02]">
                  {selected ? (
                    <>
                      {selected.file.type.startsWith("image/") ? (
                        <ImageIcon size={22} className="text-[#f7941d]" />
                      ) : (
                        <FileCheck2 size={22} className="text-[#f7941d]" />
                      )}
                      <span className="mt-2 max-w-full truncate text-xs font-semibold">
                        {selected.file.name}
                      </span>
                      <span className="mt-1 text-[11px] text-[#94a3b8]">
                        {(selected.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={22} className="text-[#94a3b8]" />
                      <span className="mt-2 text-xs font-semibold">
                        Choose {pretty(type)}
                      </span>
                      <span className="mt-1 text-[11px] text-[#94a3b8]">
                        Click to select file
                      </span>
                    </>
                  )}

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={submittingAll}
                    onChange={(event) =>
                      chooseFile(type, event.target.files?.[0] ?? null)
                    }
                  />
                </label>

                {selected && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPreview({
                          title: `${pretty(type)} — before submission`,
                          url: selected.previewUrl,
                          mimeType: selected.file.type,
                        })
                      }
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#f7941d]/30 bg-orange-50 px-3 py-2 text-xs font-semibold text-[#f7941d] dark:bg-orange-500/10"
                    >
                      <Eye size={14} />
                      Preview
                    </button>

                    <button
                      type="button"
                      onClick={() => removeSelected(type)}
                      disabled={submittingAll}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e7ebf0] text-[#64748b] hover:bg-slate-50 dark:border-white/10"
                      aria-label={`Remove ${pretty(type)}`}
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#e7ebf0] bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Ready to send {selectedCount} document
              {selectedCount === 1 ? "" : "s"}?
            </p>
            <p className="mt-1 text-xs text-[#64748b]">
              Preview every selected file first. When you submit, all selected
              documents are uploaded together from this screen.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void submitAllDocuments()}
            disabled={!selectedCount || submittingAll}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f7941d] px-5 text-sm font-semibold text-white transition hover:bg-[#e78315] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submittingAll ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit All Documents
              </>
            )}
          </button>
        </div>

        <Link
          href="/seller/kyc"
          className="mt-5 inline-flex text-sm font-semibold text-[#f7941d]"
        >
          View KYC verification status →
        </Link>
      </section>

      <section className="rounded-2xl border border-[#e7ebf0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937] sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
            <FileCheck2 size={19} />
          </span>
          <div>
            <h3 className="font-bold">Submitted documents</h3>
            <p className="text-xs text-[#64748b]">
              Admin verification will review these files under your seller
              account.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {required.map((type) => {
            const document = documents.find(
              (item) => item.document_type === type,
            );
            const url = document?.document_url || document?.file_url || "";

            return (
              <div
                key={type}
                className="rounded-xl border border-[#edf0f4] p-4 dark:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      document
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-[#94a3b8]"
                    }`}
                  >
                    {document ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <FileText size={17} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {pretty(type)}
                    </p>
                    <p className="text-xs capitalize text-[#64748b]">
                      {document?.status?.replaceAll("_", " ") || "Not submitted"}
                    </p>
                  </div>
                </div>

                {url && (
                  <button
                    type="button"
                    onClick={() =>
                      setSubmittedPreview({
                        title: pretty(type),
                        url,
                      })
                    }
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#e7ebf0] px-3 py-1.5 text-xs font-semibold text-[#f7941d] dark:border-white/10"
                  >
                    <Eye size={14} />
                    View document
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <DocumentPreviewModal
        open={Boolean(preview)}
        title={preview?.title || "Document"}
        url={preview?.url || ""}
        mimeType={preview?.mimeType}
        onClose={() => setPreview(null)}
      />

      <BackendDocumentPreview
        open={Boolean(submittedPreview)}
        title={submittedPreview?.title || "Submitted document"}
        documentUrl={submittedPreview?.url || ""}
        onClose={() => setSubmittedPreview(null)}
      />
    </div>
  );
}

function DocumentPreviewModal({
  open,
  title,
  url,
  mimeType,
  onClose,
}: {
  open: boolean;
  title: string;
  url: string;
  mimeType?: string | null;
  onClose: () => void;
}) {
  if (!open || !url) return null;

  const isImage =
    mimeType?.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(url);
  const isPdf =
    mimeType === "application/pdf" || /\.pdf(\?.*)?$/i.test(url);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1f2937]">
        <div className="flex items-center justify-between border-b border-[#e7ebf0] px-5 py-4 dark:border-white/10">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f7941d]">
              Document Preview
            </p>
            <h3 className="truncate text-base font-semibold text-[#111827] dark:text-white">
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e7ebf0] text-[#64748b] hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
            aria-label="Close document preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-[420px] flex-1 overflow-auto bg-slate-100 p-4 dark:bg-black/20">
          {isImage ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <img
                src={url}
                alt={title}
                className="max-h-[72vh] max-w-full rounded-lg object-contain shadow-sm"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={url}
              title={title}
              className="h-[72vh] w-full rounded-lg bg-white"
            />
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd5e1] bg-white p-8 text-center dark:border-white/10 dark:bg-white/5">
              <FileText size={36} className="text-[#94a3b8]" />
              <p className="mt-3 font-semibold">
                Preview is not available for this file type.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 rounded-lg bg-[#f7941d] px-4 py-2 text-sm font-semibold text-white"
              >
                Open document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
