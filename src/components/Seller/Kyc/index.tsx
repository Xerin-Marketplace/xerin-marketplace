"use client";

import { sellersApi } from "@/lib/api/endpoints/sellers";
import BackendDocumentPreview from "@/components/Common/BackendDocumentPreview";
import { ApiError } from "@/lib/api/client";
import { authStorage } from "@/lib/auth/storage";
import type { SellerDocumentType, SellerKycDocument, PayoutAccount, SellerKycStatus } from "@/types/api/seller";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkBadge01Icon, Money03Icon, AlertCircleIcon, Clock01Icon, CreditCardIcon, ViewIcon, File01Icon, Image01Icon, LockKeyIcon, Edit02Icon, ShieldCheckIcon, SmartPhone01Icon, Delete02Icon, Wallet03Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import InfoPopover from "@/components/Common/Info/InfoPopover";
const documentLabel = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const payoutStatusMeta = (status?: string | null) => {
 const value = (status || "pending").toLowerCase();

 if (value === "verified") {
 return {
 label: "Verified",
 className: "border-green-light-4 bg-green-light-6 text-green-dark",
 icon: CheckmarkBadge01Icon,
 };
 }

 if (value === "rejected") {
 return {
 label: "Rejected",
 className: "border-red-light-4 bg-red-light-6 text-red-dark",
 icon: AlertCircleIcon,
 };
 }

 return {
 label: "Pending verification",
 className: "border-yellow-light-2 bg-yellow-light-4 text-yellow-dark-2",
 icon: Clock01Icon,
 };
};

const maskAccountNumber = (value: string) => {
 const clean = value.trim();
 if (clean.length <= 4) return clean;
 return `${"•".repeat(Math.min(clean.length - 4, 8))}${clean.slice(-4)}`;
};


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
 const [editingPayoutAccount, setEditingPayoutAccount] = useState<PayoutAccount | null>(null);
 const [deleteTarget, setDeleteTarget] = useState<PayoutAccount | null>(null);
 const [isDeleting, setIsDeleting] = useState(false);

 useEffect(() => {
 if (!token) {
 router.replace("/signin?redirect=/seller/kyc");
 return;
 }

 if (!isSeller) {
 router.replace("/account");
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

 function startEditPayoutAccount(account: PayoutAccount) {
 setEditingPayoutAccount(account);
 setAccountType(account.account_type === "mobile_money" ? "mobile_money" : "bank");
 setProvider(account.provider || "");
 setAccountName(account.account_name || "");
 setAccountNumber(account.account_number || "");
 setCurrency(account.currency || "TZS");
 setIsDefault(Boolean(account.is_default));
 }

 function cancelEditPayoutAccount() {
 setEditingPayoutAccount(null);
 setAccountType("bank"); setProvider(""); setAccountName(""); setAccountNumber(""); setCurrency("TZS"); setIsDefault(false);
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
 const payoutPayload = {
 account_type: accountType, provider: provider.trim(), account_name: accountName.trim(),
 account_number: accountNumber.trim(), currency: currency.trim(), is_default: isDefault,
 };
 if (editingPayoutAccount) {
 await sellersApi.updatePayoutAccount(editingPayoutAccount.id, payoutPayload, token);
 } else {
 await sellersApi.createPayoutAccount(payoutPayload, token);
 }
 toast.success(
 editingPayoutAccount ? "Payout account updated." : "Payout account added.",
 );
 setProvider("");
 setAccountName("");
 setAccountNumber("");
 setCurrency("TZS");
 setIsDefault(false);
 setEditingPayoutAccount(null);
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
 if (loading) return <div className="p-12 text-center text-muted-foreground">Loading verification data...</div>;
 if (error) return <div className="rounded-xl border border-red-light-4 bg-red-light-6 p-6 text-center text-red-dark"><p>{error}</p><button type="button" onClick={() => void loadData()} className="mt-3 rounded-lg bg-red-dark px-4 py-2 text-sm font-semibold text-white">Retry</button></div>;

 const allSubmitted =
 (status?.required_documents?.length ?? 0) > 0 &&
 (status?.required_documents ?? []).every((type) =>
 documents.some((document) => document.document_type === type)
 );
 const verifiedPayoutAccounts = payoutAccounts.filter(
 (account) =>
 account.is_active !== false &&
 (account.verification_status || "pending") === "verified",
 );
 const pendingPayoutAccounts = payoutAccounts.filter(
 (account) =>
 account.is_active !== false &&
 (account.verification_status || "pending") === "pending",
 );
 const rejectedPayoutAccounts = payoutAccounts.filter(
 (account) => (account.verification_status || "pending") === "rejected",
 );
 const defaultPayoutAccount = payoutAccounts.find(
 (account) => account.is_default && account.is_active !== false,
 );

 const reviewLocked =
 status?.seller_status === "approved" ||
 documents.some((document) => document.status === "under_review");
 const canEditDocument = (document: SellerKycDocument | undefined) =>
 Boolean(document && !reviewLocked && status?.seller_status !== "approved" && ["pending", "rejected"].includes(document.status || "pending"));

 return (
 <>
 <section>
 <div className="mx-auto max-w-[1280px]">

 <div className="mb-6 flex w-fit flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
 <button
 type="button"
 onClick={() => router.push("/seller/kyc")}
 className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === "verification" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted "}`}
 >
 KYC Verification
 </button>
 <button
 type="button"
 onClick={() => router.push("/seller/documents")}
 className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted"
 >
 Business Documents
 </button>
 {status?.seller_status === "approved" && (
 <button
 type="button"
 onClick={() => router.push("/seller/kyc?tab=payouts")}
 className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === "payouts" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted "}`}
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
 <div className={`${activeTab === "verification" ? "block" : "hidden"} rounded-xl bg-card shadow-1 p-6 sm:p-8`}>
 <div className="mb-6 flex items-center justify-between gap-3">
 <h2 className="text-xl font-semibold text-foreground">Required Documents</h2>
 <InfoPopover title="Why we need this" trigger="link" triggerLabel="Why do we ask for this?" align="end">
 <p>Xerin Mart regulations require us to verify every seller&apos;s business identity before they can sell or receive payouts.</p>
 <p>Your documents are reviewed once and stored securely · they are never shown to buyers.</p>
 </InfoPopover>
 </div>

 <div className="space-y-4 mb-8">
 {(status?.required_documents ?? []).map((type) => {
 const docStatus = getDocumentStatus(type);
 const document = documents.find((item) => item.document_type === type);
 return (
 <div
 key={type}
 className={`flex items-center justify-between rounded-lg border p-4 ${
 docStatus === "missing"
 ? "border-border bg-muted "
 : docStatus === "pending"
 ? "border-warning/30 bg-warning/5"
 : "border-success/30 bg-success/5"
 }`}
 >
 <div>
 <p className="font-medium text-foreground">{documentLabel(type)}</p>
 <p className="text-sm text-muted-foreground capitalize">
 {docStatus === "missing" ? "Not uploaded" : docStatus}
 </p>
 {document?.rejection_reason && (
 <p className="mt-2 max-w-xl rounded-lg border border-red-light-4 bg-red-light-6 px-3 py-2 text-xs leading-5 text-red-dark">
 <strong>Admin reason:</strong> {document.rejection_reason}
 </p>
 )}
 </div>
 <div className="flex flex-wrap items-center justify-end gap-2">
 {document && (
 <button
 type="button"
 onClick={() => setSubmittedPreview({ title: documentLabel(type), url: sellersApi.getKycDocumentViewUrl(document.id) })}
 className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--primary)]/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary dark:bg-primary/10"
 >
 <HugeiconsIcon icon={ViewIcon} size={14} /> View
 </button>
 )}
 {canEditDocument(document) && (
 <Link href={`/seller/documents?edit=${encodeURIComponent(type)}`} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background">
 <HugeiconsIcon icon={Edit02Icon} size={14} /> Edit
 </Link>
 )}
 {document && reviewLocked && (
 <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
 <HugeiconsIcon icon={LockKeyIcon} size={14} /> View only
 </span>
 )}

 <span
 className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
 docStatus === "missing"
 ? "bg-muted text-foreground"
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

 <div className={`relative ${allSubmitted ? "opacity-40 pointer-events-none select-none" : ""}`}>
 <h3 className="text-lg font-semibold text-foreground mb-4">Upload Document</h3>
 <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
 <p className="text-sm font-semibold text-foreground">
 Need to submit TIN, Business Licence and Business Profile together?
 </p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 Use the Business Documents workspace to select, preview and submit all required verification files in one action.
 </p>
 <Link
 href="/seller/documents"
 className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
 >
 Upload all business documents
 </Link>
 </div>

 <form onSubmit={handleUpload} className="space-y-5">
 <div>
 <label className="block mb-2.5">Document type</label>
 <select
 value={uploadType}
 onChange={(event) => setUploadType(event.target.value)}
 disabled={isUploading}
 className="rounded-lg border border-border bg-muted w-full py-3 px-5 outline-none focus:ring-2 focus:ring-ring/30"
 >
 {(status?.required_documents ?? []).map((type) => (
 <option key={type} value={type}>
 {documentLabel(type)}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block mb-2.5">File (PDF, JPG, PNG)</label>
 <input
 type="file"
 accept=".pdf,.jpg,.jpeg,.png"
 onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
 disabled={isUploading}
 className="rounded-lg border border-border bg-muted w-full py-3 px-5 outline-none focus:ring-2 focus:ring-ring/30 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-sm"
 />
 </div>

 {uploadFile && localPreviewUrl && (
 <div className="rounded-xl border border-border bg-card p-4">
 <div className="flex items-start gap-3">
 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/10">
 {uploadFile.type.startsWith("image/") ? (
 <HugeiconsIcon icon={Image01Icon} size={18} />
 ) : (
 <HugeiconsIcon icon={File01Icon} size={18} />
 )}
 </span>

 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-semibold text-foreground">
 {uploadFile.name}
 </p>
 <p className="mt-0.5 text-xs text-muted-foreground">
 {(uploadFile.size / 1024 / 1024).toFixed(2)} MB ·{" "}
 {uploadFile.type || "Unknown file type"}
 </p>
 </div>
 </div>

 <button
 type="button"
 onClick={() =>
 setPreview({
 title: `${documentLabel(uploadType)} · before upload`,
 url: localPreviewUrl,
 mimeType: uploadFile.type,
 })
 }
 className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[var(--primary)]/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15 dark:bg-primary/10"
 >
 <HugeiconsIcon icon={ViewIcon} size={14} />
 Preview before upload
 </button>
 </div>
 )}

 <button
 type="submit"
 disabled={isUploading || !uploadFile}
 className="w-full rounded-lg bg-primary text-primary-foreground py-3.5 px-6 font-medium hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition"
 >
 {isUploading ? "Uploading..." : "Upload Document"}
 </button>
 </form>
 </div>
 {allSubmitted && (
 <div className="mt-4 rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
 Initial upload is complete. Use <strong>View</strong> and <strong>Edit</strong> above. Edit is hidden while Admin is reviewing and returns after rejection.
 </div>
 )}
 </div>

 <div
 className={`${activeTab === "payouts" ? "block" : "hidden"} space-y-5`}
 >
 <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border sm:p-6">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
 <div className="max-w-2xl">
 <div className="flex items-center gap-3">
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary-400/10">
 <HugeiconsIcon icon={Wallet03Icon} size={20} />
 </span>
 <div>
 <h2 className="text-xl font-bold text-foreground">
 Seller Payout Accounts
 </h2>
 <p className="mt-1 text-sm leading-6 text-muted-foreground">
 Add the bank or mobile-money account where Xerin can settle
 released earnings. New payout accounts require
 verification before they can be used for payout requests.
 </p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-2 sm:min-w-[340px]">
 <PayoutSummary
 label="Verified"
 value={verifiedPayoutAccounts.length}
 tone="green"
 />
 <PayoutSummary
 label="Pending"
 value={pendingPayoutAccounts.length}
 tone="amber"
 />
 <PayoutSummary
 label="Rejected"
 value={rejectedPayoutAccounts.length}
 tone="red"
 />
 </div>
 </div>

 <div className="mt-5 rounded-xl border border-primary-100 bg-primary-50/70 p-4 text-sm leading-6 text-primary-800 dark:border-primary-400/20 dark:bg-primary-400/10 /70">
 <div className="flex items-start gap-3">
 <HugeiconsIcon icon={ShieldCheckIcon} size={18} className="mt-0.5 shrink-0" />
 <p>
 A payout request will only be accepted when the selected
 payout account is <strong>active and verified</strong>.
 Verification is performed by an authorized Xerin staff user.
 </p>
 </div>
 </div>
 </div>

 <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
 <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border sm:p-6">
 <div className="mb-5 flex items-center justify-between gap-3">
 <div>
 <h3 className="font-bold text-foreground">
 Registered accounts
 </h3>
 <p className="mt-1 text-xs text-muted-foreground">
 {payoutAccounts.length
 ? `${payoutAccounts.length} payout account${payoutAccounts.length === 1 ? "" : "s"}`
 : "No payout account configured"}
 </p>
 </div>

 {defaultPayoutAccount && (
 <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
 Default: {defaultPayoutAccount.provider}
 </span>
 )}
 </div>

 {payoutAccounts.length === 0 ? (
 <div className="rounded-xl border border-dashed border-border bg-muted px-5 py-10 text-center dark:border-border dark:bg-card/[0.03]">
 <HugeiconsIcon icon={Wallet03Icon}
 size={28}
 className="mx-auto text-muted-foreground"
 />
 <p className="mt-3 font-semibold text-foreground">
 No payout account yet
 </p>
 <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
 Add a bank or mobile-money account using the form. The
 account will start in Pending Verification status.
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 {payoutAccounts.map((account) => {
 const statusMeta = payoutStatusMeta(
 account.verification_status,
 );
 const StatusIcon = statusMeta.icon;
 const isInactive = account.is_active === false;

 return (
 <article
 key={account.id}
 className={`rounded-xl border p-4 transition ${
 isInactive
 ? "border-border bg-muted opacity-70 dark:border-border dark:bg-card/[0.03]"
 : "border-border bg-card hover:border-primary/25 dark:border-border dark:bg-card/[0.025]"
 }`}
 >
 <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <div className="flex min-w-0 gap-3">
 <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground dark:bg-card/10">
 {account.account_type === "mobile_money" ? (
 <HugeiconsIcon icon={SmartPhone01Icon} size={20} />
 ) : (
 <HugeiconsIcon icon={Money03Icon} size={20} />
 )}
 </span>

 <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-2">
 <p className="font-bold text-foreground">
 {account.provider}
 </p>

 {account.is_default && (
 <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
 Default
 </span>
 )}

 {isInactive && (
 <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
 Inactive
 </span>
 )}
 </div>

 <p className="mt-1 text-sm font-medium text-foreground /80">
 {account.account_name}
 </p>
 <p className="mt-0.5 font-mono text-sm text-muted-foreground /55">
 {maskAccountNumber(account.account_number)}
 </p>

 <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
 <span className="rounded-full border border-border bg-muted px-2.5 py-1 font-semibold text-muted-foreground dark:border-border /60">
 {account.account_type === "mobile_money"
 ? "Mobile Money"
 : "Bank Account"}
 </span>
 <span className="rounded-full border border-border bg-muted px-2.5 py-1 font-semibold text-muted-foreground dark:border-border /60">
 {account.currency}
 </span>
 </div>
 </div>
 </div>

 <div className="flex flex-col items-start gap-2 sm:items-end">
 <span
 className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusMeta.className}`}
 >
 <HugeiconsIcon icon={StatusIcon} size={14} />
 {statusMeta.label}
 </span>

 {account.verified_at && (
 <span className="text-[11px] text-muted-foreground">
 Verified{" "}
 {new Date(
 account.verified_at,
 ).toLocaleDateString()}
 </span>
 )}

 {account.provider_reference && (
 <span className="max-w-[220px] truncate text-[11px] text-muted-foreground">
 Ref: {account.provider_reference}
 </span>
 )}

 <button type="button" onClick={() => startEditPayoutAccount(account)} className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/15">
 <HugeiconsIcon icon={Edit02Icon} size={14} /> Edit
 </button>
 <button
 type="button"
 onClick={() => setDeleteTarget(account)}
 className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-red-light-4 px-3 py-1.5 text-xs font-semibold text-destructive transition hover:bg-red-light-6"
 >
 <HugeiconsIcon icon={Delete02Icon} size={14} />
 {account.is_active === false
 ? "Remove"
 : "Delete / Deactivate"}
 </button>
 </div>
 </div>

 {(account.verification_status || "pending") ===
 "rejected" && (
 <div className="mt-4 rounded-xl border border-red-light-4 bg-red-light-6 p-3 text-xs leading-5 text-red-dark">
 This payout account was rejected. Add a corrected
 payout account before requesting a payout.
 </div>
 )}

 {(account.verification_status || "pending") ===
 "pending" && (
 <div className="mt-4 rounded-xl border border-yellow-light-2 bg-yellow-light-4 p-3 text-xs leading-5 text-yellow-dark-2">
 This account is waiting for verification. It cannot
 receive a payout yet.
 </div>
 )}
 </article>
 );
 })}
 </div>
 )}
 </div>

 <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border sm:p-6">
 <div className="mb-5 flex items-center gap-3">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary-400/10">
 <HugeiconsIcon icon={CreditCardIcon} size={18} />
 </span>
 <div>
 <h3 className="font-bold text-foreground">
 {editingPayoutAccount ? "Edit payout account" : "Add payout account"}
 </h3>
 <p className="mt-0.5 text-xs text-muted-foreground">
 Settlement destination for released seller earnings.
 </p>
 </div>
 </div>

 <form onSubmit={handleAddAccount} className="space-y-4">
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-muted-foreground /70">
 Account type
 </label>
 <div className="grid grid-cols-2 gap-2">
 <button
 type="button"
 disabled={isAddingAccount}
 onClick={() => {
 setAccountType("bank");
 setProvider("");
 }}
 className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
 accountType === "bank"
 ? "border-primary/40 bg-primary/10 text-primary"
 : "border-border bg-card text-muted-foreground dark:border-border "
 }`}
 >
 <HugeiconsIcon icon={Money03Icon} size={16} className="mx-auto mb-1.5" />
 Bank
 </button>
 <button
 type="button"
 disabled={isAddingAccount}
 onClick={() => {
 setAccountType("mobile_money");
 setProvider("");
 }}
 className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
 accountType === "mobile_money"
 ? "border-primary/40 bg-primary/10 text-primary"
 : "border-border bg-card text-muted-foreground dark:border-border "
 }`}
 >
 <HugeiconsIcon icon={SmartPhone01Icon} size={16} className="mx-auto mb-1.5" />
 Mobile Money
 </button>
 </div>
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-muted-foreground /70">
 {accountType === "bank"
 ? "Bank name"
 : "Mobile-money provider"}{" "}
 <span className="text-red">*</span>
 </label>

 {accountType === "mobile_money" ? (
 <select
 value={provider}
 onChange={(event) => setProvider(event.target.value)}
 disabled={isAddingAccount}
 className="h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm outline-none focus:border-[var(--primary)] dark:border-border"
 >
 <option value="">Select provider</option>
 <option value="M-Pesa">M-Pesa</option>
 <option value="Airtel Money">Airtel Money</option>
 <option value="Mixx by Yas">Mixx by Yas</option>
 <option value="HaloPesa">HaloPesa</option>
 </select>
 ) : (
 <input
 type="text"
 value={provider}
 onChange={(event) => setProvider(event.target.value)}
 placeholder="e.g. CRDB Bank"
 disabled={isAddingAccount}
 className="h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm outline-none focus:border-[var(--primary)] dark:border-border"
 />
 )}
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-muted-foreground /70">
 Account holder name <span className="text-red">*</span>
 </label>
 <input
 type="text"
 value={accountName}
 onChange={(event) =>
 setAccountName(event.target.value)
 }
 placeholder="Name registered on the payout account"
 disabled={isAddingAccount}
 className="h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm outline-none focus:border-[var(--primary)] dark:border-border"
 />
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-muted-foreground /70">
 {accountType === "bank"
 ? "Bank account number"
 : "Mobile-money number"}{" "}
 <span className="text-red">*</span>
 </label>
 <input
 type="text"
 value={accountNumber}
 onChange={(event) =>
 setAccountNumber(event.target.value)
 }
 placeholder={
 accountType === "bank"
 ? "Enter bank account number"
 : "+255..."
 }
 disabled={isAddingAccount}
 className="h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm outline-none focus:border-[var(--primary)] dark:border-border"
 />
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-muted-foreground /70">
 Currency
 </label>
 <select
 value={currency}
 onChange={(event) => setCurrency(event.target.value)}
 disabled={isAddingAccount}
 className="h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm outline-none focus:border-[var(--primary)] dark:border-border"
 >
 <option value="TZS">TZS · Tanzanian Shilling</option>
 <option value="USD">USD · US Dollar</option>
 </select>
 </div>

 <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 dark:border-border">
 <input
 type="checkbox"
 checked={isDefault}
 onChange={(event) =>
 setIsDefault(event.target.checked)
 }
 disabled={isAddingAccount}
 className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
 />
 <span>
 <span className="block text-sm font-semibold text-foreground">
 Make this my default payout account
 </span>
 <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
 The backend will remove default status from your other
 payout accounts when this account is created as default.
 </span>
 </span>
 </label>

 <button
 type="submit"
 disabled={
 isAddingAccount ||
 !provider.trim() ||
 !accountName.trim() ||
 !accountNumber.trim()
 }
 className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
 >
 {isAddingAccount
 ? editingPayoutAccount ? "Saving changes..." : "Adding payout account..."
 : editingPayoutAccount ? "Save Payout Account" : "Add Payout Account"}
 </button>

 {editingPayoutAccount && (
 <button type="button" onClick={cancelEditPayoutAccount} disabled={isAddingAccount} className="w-full rounded-xl border border-border px-5 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50">Cancel editing</button>
 )}
 <p className="text-xs leading-5 text-muted-foreground /55">
 Payout verification follows the Admin policy. In Automatic mode, new or materially edited accounts are verified automatically; in Manual mode they wait for Admin review.
 </p>
 </form>
 </div>
 </section>
 </div>
 </div>
 </div>
 </section>

 {deleteTarget && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
 <div className="max-w-md w-full rounded-xl bg-card shadow-1 p-6">
 <h3 className="text-lg font-semibold text-foreground mb-2">
 Remove payout account?
 </h3>
 <p className="text-muted-foreground mb-6">
 Account: {deleteTarget.account_name} · {deleteTarget.provider}. If
 this account already has payout history, the backend will safely
 deactivate it instead of deleting the historical relationship.
 </p>
 <div className="flex gap-3 justify-end">
 <button
 type="button"
 onClick={() => setDeleteTarget(null)}
 disabled={isDeleting}
 className="rounded-lg border border-border text-foreground py-2.5 px-5 hover:bg-muted"
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

function PayoutSummary({
 label,
 value,
 tone,
}: {
 label: string;
 value: number;
 tone: "green" | "amber" | "red";
}) {
 const toneClass =
 tone === "green"
 ? "border-green-light-4 bg-green-light-6 text-green-dark"
 : tone === "red"
 ? "border-red-light-4 bg-red-light-6 text-red-dark"
 : "border-yellow-light-2 bg-yellow-light-4 text-yellow-dark-2";

 return (
 <div className={`rounded-xl border p-3 text-center ${toneClass}`}>
 <p className="text-xl font-bold">{value}</p>
 <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide">
 {label}
 </p>
 </div>
 );
}


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
 <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-card shadow-lg dark:bg-card">
 <div className="flex items-center justify-between border-b border-border px-5 py-4 dark:border-border">
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
 Document Preview
 </p>
 {isPdf && (
 <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
 View only
 </span>
 )}
 </div>
 <h3 className="truncate text-base font-semibold text-foreground">
 {title}
 </h3>
 </div>

 <button
 type="button"
 onClick={onClose}
 className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted dark:border-border dark:hover:bg-card/5"
 aria-label="Close document preview"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={18} />
 </button>
 </div>

 <div className="min-h-[420px] flex-1 overflow-auto bg-muted p-4 dark:bg-black/20">
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
 src={`${url}#toolbar=0&navpanes=0&view=FitH`}
 title={title}
 className="h-[72vh] w-full rounded-lg bg-card"
 />
 ) : (
 <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--muted-foreground)] bg-card p-8 text-center dark:border-border">
 <HugeiconsIcon icon={File01Icon} size={32} className="text-muted-foreground" />
 <p className="mt-3 font-semibold">Preview is not available for this file type.</p>
 <a
 href={url}
 target="_blank"
 rel="noreferrer"
 className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
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
