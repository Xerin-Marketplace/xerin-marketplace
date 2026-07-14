"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { sellersApi } from "@/lib/api/endpoints/sellers";
import { ApiError } from "@/lib/api/client";
import { authStorage } from "@/lib/auth/storage";
import type { SellerKycDocument, PayoutAccount, SellerKycStatus } from "@/types/api/seller";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const DOCUMENT_TYPES = ["tin", "business_profile", "business_registration"] as const;

type DocumentType = (typeof DOCUMENT_TYPES)[number];

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  tin: "TIN Certificate",
  business_profile: "Business Profile",
  business_registration: "Business Registration",
};

type StoredUser = {
  account_type?: string;
  roles?: string[];
  seller_status?: string | null;
  first_name?: string | null;
};

const SellerKyc = () => {
  const router = useRouter();
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

  const [uploadType, setUploadType] = useState<DocumentType>("tin");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
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

  async function loadData() {
    const accessToken = token;
    if (!accessToken) return;

    setLoading(true);
    try {
      const [statusData, docsData, accountsData] = await Promise.all([
        sellersApi.getKycStatus(accessToken),
        sellersApi.getKycDocuments(accessToken),
        sellersApi.getPayoutAccounts(accessToken),
      ]);

      setStatus(statusData);
      setDocuments(docsData);
      setPayoutAccounts(accountsData);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load KYC data.");
      }
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
        { document_type: uploadType, file: uploadFile },
        token
      );
      toast.success(`${DOCUMENT_LABELS[uploadType]} uploaded successfully.`);
      setUploadFile(null);
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

  function getDocumentStatus(type: DocumentType): "missing" | "pending" | "uploaded" {
    const doc = documents.find((d) => d.document_type === type);
    if (!doc) return "missing";
    return doc.status === "pending" ? "pending" : "uploaded";
  }

  if (!token || !isSeller) return null;

  return (
    <>
      <Breadcrumb title="Seller KYC" pages={["Seller", "KYC"]} />
      <section className="py-14 bg-gray-2 dark:bg-darkTheme-bg min-h-screen">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="mb-8 rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-dark dark:text-white mb-2">
                  KYC &amp; Payout Setup
                </h1>
                <p className="text-dark-4 dark:text-darkTheme-body-color">
                  Upload required documents and add payout accounts to complete seller onboarding.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-dark-4 dark:text-darkTheme-body-color">Seller status:</span>
                <span className="inline-flex items-center rounded-full bg-blue/10 text-blue px-3 py-1 text-sm font-medium capitalize">
                  {status?.seller_status ?? user?.seller_status ?? "pending"}
                </span>
              </div>
            </div>
          </div>

          {status?.can_submit_for_review && (
            <div className="mb-6 rounded-lg bg-success/10 border border-success/20 text-success px-4 py-3">
              All required documents are uploaded. Your account is under review.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-dark dark:text-white mb-6">Required Documents</h2>

              <div className="space-y-4 mb-8">
                {DOCUMENT_TYPES.map((type) => {
                  const docStatus = getDocumentStatus(type);
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
                        <p className="font-medium text-dark dark:text-white">{DOCUMENT_LABELS[type]}</p>
                        <p className="text-sm text-dark-4 dark:text-darkTheme-body-color capitalize">
                          {docStatus === "missing" ? "Not uploaded" : docStatus}
                        </p>
                      </div>
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
                  );
                })}
              </div>

              <h3 className="text-lg font-semibold text-dark dark:text-white mb-4">Upload Document</h3>
              <form onSubmit={handleUpload} className="space-y-5">
                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">Document type</label>
                  <select
                    value={uploadType}
                    onChange={(event) => setUploadType(event.target.value as DocumentType)}
                    disabled={isUploading}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {DOCUMENT_LABELS[type]}
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

                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="w-full rounded-lg bg-blue text-white py-3.5 px-6 font-medium hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {isUploading ? "Uploading..." : "Upload Document"}
                </button>
              </form>
            </div>

            <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6 sm:p-8">
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
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(account)}
                        className="text-sm text-red hover:text-red-dark"
                      >
                        Delete
                      </button>
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
    </>
  );
};

export default SellerKyc;
