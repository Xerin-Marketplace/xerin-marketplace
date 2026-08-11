"use client";

import { sellersApi } from "@/lib/api/endpoints/sellers";
import BackendDocumentPreview from "@/components/Common/BackendDocumentPreview";
import { ApiError } from "@/lib/api/client";
import { authStorage } from "@/lib/auth/storage";
import type { SellerDocumentType, SellerKycDocument, PayoutAccount, SellerKycStatus } from "@/types/api/seller";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Eye, FileText, ImageIcon, X } from "lucide-react";
import Link from "next/link";
const documentLabel = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

type StoredUser = {
  account_type?: string;
  roles?: string[];
  seller_status?: string | null;
  first_name?: string | null;
};

const SellerKyc = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "payouts" ? "payouts" : "verification";
  const user = authStorage.getUser<StoredUser>();
  const token = authStorage.getAccessToken();

  const isSeller = useMemo(() => {
    if (!user) return false;
    const roles = user.roles ?? [];
    return user.account_type === "seller" || roles.includes("seller");
  }, [user]);

  const [status, setStatus] = useState<SellerKycStatus | null>(null);
  const [documents, setDocuments] = useState<SellerKycDocument[]>([]);
  const [payoutAccounts, setPayoutAccounts] = useState<PayoutAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [uploadType, setUploadType] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");
  const [preview, setPreview] = useState<{
    title: string;
    url: string;
    mimeType?: string | null;
  } | null>(null);
  const [submittedPreview, setSubmittedPreview] = useState<{
    title: string;
    url: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [accountType, setAccountType] = useState<"bank" | "mobile_money">("bank");
  const [provider, setProvider] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [currency, setCurrency] = useState("TZS");
  const [isDefault, setIsDefault] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PayoutAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/signin?redirect=/seller/kyc");
      return;
    }

    if (!isSeller) {
      router.replace("/my-account");
      return;
    }

    void loadData();
  }, [isSeller, router, token]);

  useEffect(() => {
    if (!uploadFile) {
      setLocalPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(uploadFile);
    setLocalPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [uploadFile]);

  async function loadData() {
    const accessToken = token;
    if (!accessToken) return;

    setLoading(true);
    setError("");
    try {
      const [statusData, docsData, accountsData] = await Promise.all([
        sellersApi.getKycStatus(accessToken),
        sellersApi.getKycDocuments(accessToken),
        sellersApi.getPayoutAccounts(accessToken),
      ]);

      setStatus(statusData);
      setUploadType((current) => current || statusData.required_documents[0] || "");
      setDocuments(docsData);
      setPayoutAccounts(accountsData);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to load KYC data.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !uploadFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    try {
      await sellersApi.uploadKycDocument(
        { document_type: uploadType as SellerDocumentType, file: uploadFile },
        token
      );
      toast.success(`${documentLabel(uploadType)} uploaded successfully.`);
      setUploadFile(null);
      setLocalPreviewUrl("");
      await loadData();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to upload document.");
      }
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAddAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    if (!provider.trim() || !accountName.trim() || !accountNumber.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsAddingAccount(true);
    try {
      await sellersApi.createPayoutAccount(
        {
          account_type: accountType,
          provider: provider.trim(),
          account_name: accountName.trim(),
          account_number: accountNumber.trim(),
          currency: currency.trim(),
          is_default: isDefault,
        },
        token
      );
      toast.success("Payout account added successfully.");
      setProvider("");
      setAccountName("");
      setAccountNumber("");
      setCurrency("TZS");
      setIsDefault(false);
      await loadData();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add payout account.");
      }
    } finally {
      setIsAddingAccount(false);
    }
  }

  async function handleDeleteAccount() {
    if (!token || !deleteTarget) return;

    setIsDeleting(true);
    try {
      await sellersApi.deletePayoutAccount(deleteTarget.id, token);
      toast.success("Payout account deleted.");
      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete payout account.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  function getDocumentStatus(type: string): "missing" | "pending" | "under_review" | "approved" | "rejected" | "uploaded" {
    const doc = documents.find((d) => d.document_type === type);
    if (!doc) return "missing";
    return (doc.status as "pending" | "under_review" | "approved" | "rejected") || "uploaded";
  }

  if (!token || !isSeller) return null;
  if (loading) return <div className="p-12 text-center text-dark-4 dark:text-darkTheme-body-color">Loading verification data...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700"><p>{error}</p><button type="button" onClick={() => void loadData()} className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white">Retry</button></div>;

  return (
    <>
      <section>
        <div className="mx-auto max-w-[1280px]">

          <div className="mb-6 flex w-fit flex-wrap gap-1 rounded-xl border border-gray-3 bg-white p-1 dark:border-darkTheme-border-color dark:bg-darkTheme-card">
            <button
              type="button"
              onClick={() => router.push("/seller/kyc")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === "verification" ? "bg-[#f7941d] text-white" : "text-dark-4 hover:bg-gray-1 dark:text-darkTheme-body-color dark:hover:bg-darkTheme-secondary-bg"}`}
            >
              KYC Verification
            </button>
            <button
              type="button"
              onClick={() => router.push("/seller/documents")}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-dark-4 transition hover:bg-gray-1 dark:text-darkTheme-body-color dark:hover:bg-darkTheme-secondary-bg"
            >
              Business Documents
            </button>
            {status?.seller_status === "approved" && (
            <button
              type="button"
              onClick={() => router.push("/seller/kyc?tab=payouts")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === "payouts" ? "bg-[#f7941d] text-white" : "text-dark-4 hover:bg-gray-1 dark:text-darkTheme-body-color dark:hover:bg-darkTheme-secondary-bg"}`}
            >
              Payout Account
            </button>
            )}
          </div>

          {status?.can_submit_for_review && (
            <div className="mb-6 rounded-lg bg-success/10 border border-success/20 text-success px-4 py-3">
              All required documents are uploaded. Your account is under review.
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            <div className={`${activeTab === "verification" ? "block" : "hidden"} rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6 sm:p-8`}>
              <h2 className="text-xl font-semibold text-dark dark:text-white mb-6">Required Documents</h2>

              <div className="space-y-4 mb-8">
                {(status?.required_documents ?? []).map((type) => {
                  const docStatus = getDocumentStatus(type);
                  const document = documents.find((item) => item.document_type === type);
                  return (
                    <div
                      key={type}
                      className={`flex items-center justify-between rounded-lg border p-4 ${
                        docStatus === "missing"
                          ? "border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg"
                          : docStatus === "pending"
                          ? "border-warning/30 bg-warning/5"
                          : "border-success/30 bg-success/5"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-dark dark:text-white">{documentLabel(type)}</p>
                        <p className="text-sm text-dark-4 dark:text-darkTheme-body-color capitalize">
                          {docStatus === "missing" ? "Not uploaded" : docStatus}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {(document?.document_url || document?.file_url) && (
                          <button
                            type="button"
                            onClick={() =>
                              setSubmittedPreview({
                                title: documentLabel(type),
                                url: document.document_url || document.file_url || "",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#f7941d]/30 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-[#f7941d] dark:bg-orange-500/10"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        )}

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            docStatus === "missing"
                              ? "bg-gray-2 text-dark-2"
                              : docStatus === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-success/10 text-success"
                          }`}
                        >
                          {docStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3 className="text-lg font-semibold text-dark dark:text-white mb-4">Upload Document</h3>
              <div className="mb-5 rounded-xl border border-orange/20 bg-orange/5 p-4">
                <p className="text-sm font-semibold text-dark dark:text-white">
                  Need to submit TIN, Business Licence and Business Profile together?
                </p>
                <p className="mt-1 text-xs leading-5 text-dark-4 dark:text-darkTheme-body-color">
                  Use the Business Documents workspace to select, preview and submit all required verification files in one action.
                </p>
                <Link
                  href="/seller/documents"
                  className="mt-3 inline-flex rounded-lg bg-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-dark"
                >
                  Upload all business documents
                </Link>
              </div>

              <form onSubmit={handleUpload} className="space-y-5">
                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">Document type</label>
                  <select
                    value={uploadType}
                    onChange={(event) => setUploadType(event.target.value)}
                    disabled={isUploading}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  >
                    {(status?.required_documents ?? []).map((type) => (
                      <option key={type} value={type}>
                        {documentLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">File (PDF, JPG, PNG)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                    disabled={isUploading}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue file:text-white file:text-sm"
                  />
                </div>

                {uploadFile && localPreviewUrl && (
                  <div className="rounded-xl border border-gray-3 bg-white p-4 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#f7941d] dark:bg-orange-500/10">
                        {uploadFile.type.startsWith("image/") ? (
                          <ImageIcon size={18} />
                        ) : (
                          <FileText size={18} />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-dark dark:text-white">
                          {uploadFile.name}
                        </p>
                        <p className="mt-0.5 text-xs text-dark-4 dark:text-darkTheme-body-color">
                          {(uploadFile.size / 1024 / 1024).toFixed(2)} MB ·{" "}
                          {uploadFile.type || "Unknown file type"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPreview({
                          title: `${documentLabel(uploadType)} — before upload`,
                          url: localPreviewUrl,
                          mimeType: uploadFile.type,
                        })
                      }
                      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#f7941d]/30 bg-orange-50 px-3 py-2 text-xs font-semibold text-[#f7941d] transition hover:bg-orange-100 dark:bg-orange-500/10"
                    >
                      <Eye size={14} />
                      Preview before upload
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="w-full rounded-lg bg-blue text-white py-3.5 px-6 font-medium hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {isUploading ? "Uploading..." : "Upload Document"}
                </button>
              </form>
            </div>

            <div className={`${activeTab === "payouts" ? "block" : "hidden"} rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6 sm:p-8`}>
              <h2 className="text-xl font-semibold text-dark dark:text-white mb-6">Payout Accounts</h2>

              {payoutAccounts.length === 0 ? (
                <p className="text-dark-4 dark:text-darkTheme-body-color mb-6">No payout accounts added yet.</p>
              ) : (
                <div className="space-y-4 mb-8">
                  {payoutAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-start justify-between rounded-lg border border-gray-3 dark:border-darkTheme-border-color p-4"
                    >
                      <div>
                        <p className="font-medium text-dark dark:text-white">
                          {account.account_name} — {account.provider}
                        </p>
                        <p className="text-sm text-dark-4 dark:text-darkTheme-body-color">
                          {account.account_number}
                        </p>
                        <p className="text-sm text-dark-4 dark:text-darkTheme-body-color capitalize">
                          {account.account_type} • {account.currency}
                          {account.is_default ? " • Default" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toast("Payout account updates are not available yet.")}
                          className="text-sm text-blue hover:text-blue-dark"
                        >
                          Edit
                        </button>
                        {!account.is_default && (
                          <button
                            type="button"
                            onClick={() => toast("Setting a default payout account is not available yet.")}
                            className="text-sm text-warning hover:text-warning-dark"
                          >
                            Set default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(account)}
                          className="text-sm text-red hover:text-red-dark"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="text-lg font-semibold text-dark dark:text-white mb-4">Add Payout Account</h3>
              <form onSubmit={handleAddAccount} className="space-y-5">
                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">Account type</label>
                  <select
                    value={accountType}
                    onChange={(event) => setAccountType(event.target.value as "bank" | "mobile_money")}
                    disabled={isAddingAccount}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  >
                    <option value="bank">Bank</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">
                    {accountType === "bank" ? "Bank name" : "Mobile money provider"} <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(event) => setProvider(event.target.value)}
                    placeholder={accountType === "bank" ? "e.g. CRDB Bank" : "e.g. M-Pesa"}
                    disabled={isAddingAccount}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">
                    Account name <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(event) => setAccountName(event.target.value)}
                    placeholder="Account holder name"
                    disabled={isAddingAccount}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">
                    Account number <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value)}
                    placeholder={accountType === "bank" ? "Bank account number" : "Mobile money number"}
                    disabled={isAddingAccount}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">Currency</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    disabled={isAddingAccount}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(event) => setIsDefault(event.target.checked)}
                    disabled={isAddingAccount}
                    className="w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue"
                  />
                  <span className="dark:text-darkTheme-body-color">Set as default account</span>
                </label>

                <button
                  type="submit"
                  disabled={isAddingAccount}
                  className="w-full rounded-lg bg-blue text-white py-3.5 px-6 font-medium hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {isAddingAccount ? "Adding..." : "Add Payout Account"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-w-md w-full rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">Delete payout account?</h3>
            <p className="text-dark-4 dark:text-darkTheme-body-color mb-6">
              This action cannot be undone. Account: {deleteTarget.account_name} — {deleteTarget.provider}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color text-dark dark:text-white py-2.5 px-5 hover:bg-gray-1 dark:hover:bg-darkTheme-secondary-bg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="rounded-lg bg-red text-white py-2.5 px-5 hover:bg-red-dark disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      <BackendDocumentPreview
        open={Boolean(submittedPreview)}
        title={submittedPreview?.title || "Submitted document"}
        documentUrl={submittedPreview?.url || ""}
        onClose={() => setSubmittedPreview(null)}
      />

      <DocumentPreviewModal
        open={Boolean(preview)}
        title={preview?.title || "Document"}
        url={preview?.url || ""}
        mimeType={preview?.mimeType}
        onClose={() => setPreview(null)}
      />
    </>
  );
};

export default SellerKyc;


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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e7ebf0] text-[#64748b] transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
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
              <p className="mt-3 font-semibold">Preview is not available for this file type.</p>
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
