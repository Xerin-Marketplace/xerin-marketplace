"use client";


import { Spinner } from "@/components/ui/Spinner";
import BackendDocumentPreview from "@/components/Common/BackendDocumentPreview";
import { ApiError } from "@/lib/api/client";
import { sellersApi } from "@/lib/api/endpoints/sellers";
import { authStorage } from "@/lib/auth/storage";
import type {
 SellerDocumentType,
 SellerKycDocument,
 SellerKycStatus,
} from "@/types/api/seller";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, CheckmarkCircle02Icon, Clock01Icon, ViewIcon, FileCheckIcon, File01Icon, LockKeyIcon, Edit02Icon, RefreshCwIcon, SentIcon, CloudUploadIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
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
 business_registration: "Business Registration / Incorporation",
 business_license: "Business Licence",
 business_profile: "Business Profile",
 national_id: "National ID (NIDA)",
};

const descriptions: Record<string, string> = {
 tin: "Valid Taxpayer Identification Number certificate.",
 business_registration: "Official business registration or incorporation certificate.",
 business_license: "Current operating/business licence. Licence number and expiry date are required.",
 business_profile: "Required company or business profile document.",
 national_id: "Clear copy of the owner's National ID / NIDA card.",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const pretty = (value: string) =>
 labels[value] ||
 value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const validatePdf = (file: File) => {
 const isPdf =
 file.type === "application/pdf" ||
 file.name.toLowerCase().endsWith(".pdf");

 if (!isPdf) return "Only PDF documents are allowed.";
 if (file.size > MAX_FILE_SIZE) return "PDF file size must not exceed 10 MB.";
 return null;
};

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
 const [businessLicenseNumber, setBusinessLicenseNumber] = useState("");
 const [businessLicenseExpiryDate, setBusinessLicenseExpiryDate] = useState("");
 const [renewalFile, setRenewalFile] = useState<SelectedDocument | null>(null);
 const [renewalLicenseNumber, setRenewalLicenseNumber] = useState("");
 const [renewalExpiryDate, setRenewalExpiryDate] = useState("");
 const [submittingRenewal, setSubmittingRenewal] = useState(false);
 const previewUrlsRef = useRef<Set<string>>(new Set());
 const [localPreview, setLocalPreview] = useState<{ title: string; url: string } | null>(null);
 const [backendPreview, setBackendPreview] = useState<{ title: string; url: string } | null>(null);
 const [editing, setEditing] = useState<SellerKycDocument | null>(null);
 const [editFile, setEditFile] = useState<SelectedDocument | null>(null);
 const [editLicenseNumber, setEditLicenseNumber] = useState("");
 const [editLicenseExpiryDate, setEditLicenseExpiryDate] = useState("");
 const [loading, setLoading] = useState(true);
 const [submittingAll, setSubmittingAll] = useState(false);
 const [savingEdit, setSavingEdit] = useState(false);
 const [error, setError] = useState("");

 useEffect(() => {
 if (!token || !isSeller) return;

 void load(false);

 const timer = window.setInterval(() => {
 void load(true);
 }, 10000);

 return () => window.clearInterval(timer);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [isSeller, token]);

 useEffect(() => {
 return () => {
 previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
 previewUrlsRef.current.clear();
 };
 }, []);

 async function load(silent: boolean) {
 if (!token) return;

 if (!silent) setLoading(true);
 setError("");

 try {
 const [kycStatus, docs] = await Promise.all([
 sellersApi.getKycStatus(token),
 sellersApi.getKycDocuments(token),
 ]);

 setStatus(kycStatus);
 setDocuments(docs);
 } catch (cause) {
 if (!silent) {
 setError(
 cause instanceof ApiError
 ? cause.message
 : "Unable to load your business documents.",
 );
 }
 } finally {
 if (!silent) setLoading(false);
 }
 }

 function selectInitialFile(type: SellerDocumentType, file: File | null) {
 if (file) {
 const validationError = validatePdf(file);
 if (validationError) {
 toast.error(`${pretty(type)}: ${validationError}`);
 return;
 }
 }

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
 [type]: { file, previewUrl },
 };
 });
 }

 function beginEdit(document: SellerKycDocument) {
 if (editFile?.previewUrl) {
 URL.revokeObjectURL(editFile.previewUrl);
 previewUrlsRef.current.delete(editFile.previewUrl);
 }
 setEditFile(null);
 setEditLicenseNumber(document.document_number || "");
 setEditLicenseExpiryDate(document.expiry_date || "");
 setEditing(document);
 }

 function chooseEditFile(file: File | null) {
 if (editFile?.previewUrl) {
 URL.revokeObjectURL(editFile.previewUrl);
 previewUrlsRef.current.delete(editFile.previewUrl);
 }

 if (!file) {
 setEditFile(null);
 return;
 }

 const validationError = validatePdf(file);
 if (validationError) {
 toast.error(validationError);
 return;
 }

 const previewUrl = URL.createObjectURL(file);
 previewUrlsRef.current.add(previewUrl);
 setEditFile({ file, previewUrl });
 }

 function closeEdit() {
 if (editFile?.previewUrl) {
 URL.revokeObjectURL(editFile.previewUrl);
 previewUrlsRef.current.delete(editFile.previewUrl);
 }
 setEditFile(null);
 setEditLicenseNumber("");
 setEditLicenseExpiryDate("");
 setEditing(null);
 }

 function chooseRenewalFile(file: File | null) {
 if (renewalFile?.previewUrl) {
 URL.revokeObjectURL(renewalFile.previewUrl);
 previewUrlsRef.current.delete(renewalFile.previewUrl);
 }

 if (!file) {
 setRenewalFile(null);
 return;
 }

 const validationError = validatePdf(file);
 if (validationError) {
 toast.error(validationError);
 return;
 }

 const previewUrl = URL.createObjectURL(file);
 previewUrlsRef.current.add(previewUrl);
 setRenewalFile({ file, previewUrl });
 }

 async function submitLicenseRenewal() {
 if (!token || !renewalFile) return;
 if (!renewalLicenseNumber.trim()) {
 toast.error("Enter the renewed Business Licence number.");
 return;
 }
 if (!renewalExpiryDate) {
 toast.error("Select the renewed Business Licence expiry date.");
 return;
 }

 const today = new Date().toISOString().slice(0, 10);
 if (renewalExpiryDate < today) {
 toast.error("The renewed Business Licence is already expired.");
 return;
 }

 setSubmittingRenewal(true);
 try {
 await sellersApi.renewBusinessLicense(
 {
 file: renewalFile.file,
 business_license_number: renewalLicenseNumber.trim(),
 business_license_expiry_date: renewalExpiryDate,
 },
 token,
 );
 URL.revokeObjectURL(renewalFile.previewUrl);
 previewUrlsRef.current.delete(renewalFile.previewUrl);
 setRenewalFile(null);
 setRenewalLicenseNumber("");
 setRenewalExpiryDate("");
 toast.success("Business Licence renewal submitted for review.");
 await load(false);
 } catch (cause) {
 toast.error(
 cause instanceof ApiError
 ? cause.message
 : "Unable to submit Business Licence renewal.",
 );
 } finally {
 setSubmittingRenewal(false);
 }
 }

 async function submitInitialDocuments() {
 if (!token) return;

 const required = (status?.required_documents ?? []) as SellerDocumentType[];
 const missingSelection = required.filter((type) => !selectedFiles[type]);

 if (required.length < 4 || missingSelection.length) {
 toast.error(`Select all ${required.length} required PDF documents before submitting.`);
 return;
 }

 if (!businessLicenseNumber.trim()) {
 toast.error("Enter the Business Licence number.");
 return;
 }
 if (!businessLicenseExpiryDate) {
 toast.error("Select the Business Licence expiry date.");
 return;
 }
 const today = new Date().toISOString().slice(0, 10);
 if (businessLicenseExpiryDate < today) {
 toast.error("The Business Licence is already expired.");
 return;
 }

 setSubmittingAll(true);

 try {
 await sellersApi.uploadBulkKycDocuments(
 {
 tin: selectedFiles.tin!.file,
 business_profile: selectedFiles.business_profile!.file,
 business_registration: selectedFiles.business_registration!.file,
 business_license: selectedFiles.business_license!.file,
 national_id: selectedFiles.national_id?.file,
 business_license_number: businessLicenseNumber.trim(),
 business_license_expiry_date: businessLicenseExpiryDate,
 },
 token,
 );

 Object.values(selectedFiles).forEach((selected) => {
 if (selected?.previewUrl) {
 URL.revokeObjectURL(selected.previewUrl);
 previewUrlsRef.current.delete(selected.previewUrl);
 }
 });

 setSelectedFiles({});
 setBusinessLicenseNumber("");
 setBusinessLicenseExpiryDate("");
 toast.success("All business documents submitted successfully.");
 await load(false);
 } catch (cause) {
 toast.error(
 cause instanceof ApiError
 ? cause.message
 : "Unable to submit business documents.",
 );
 } finally {
 setSubmittingAll(false);
 }
 }

 async function saveEdit() {
 if (!token || !editing) return;

 const isBusinessLicense = editing.document_type === "business_license";
 if (!editFile && !isBusinessLicense) {
 toast.error("Choose the corrected PDF document first.");
 return;
 }
 if (isBusinessLicense) {
 if (!editLicenseNumber.trim() || !editLicenseExpiryDate) {
 toast.error("Business Licence number and expiry date are required.");
 return;
 }
 const today = new Date().toISOString().slice(0, 10);
 if (editLicenseExpiryDate < today) {
 toast.error("The Business Licence is already expired.");
 return;
 }
 }

 setSavingEdit(true);

 try {
 await sellersApi.updateKycDocument(
 editing.id,
 {
 document_type: editing.document_type as SellerDocumentType,
 ...(editFile ? { file: editFile.file } : {}),
 ...(editing.document_type === "business_license"
 ? {
 document_number: editLicenseNumber.trim(),
 expiry_date: editLicenseExpiryDate,
 }
 : {}),
 },
 token,
 );

 toast.success(`${pretty(editing.document_type)} updated successfully.`);
 closeEdit();
 await load(false);
 } catch (cause) {
 toast.error(
 cause instanceof ApiError
 ? cause.message
 : "Unable to update this document.",
 );
 } finally {
 setSavingEdit(false);
 }
 }

 if (!token || !isSeller) return null;

 if (loading) {
 return (
 <div className="rounded-xl border border-border bg-card p-12 text-center">
 <Spinner className="mx-auto text-primary" />
 <p className="mt-3 text-sm text-muted-foreground">Loading business documents...</p>
 </div>
 );
 }

 if (error) {
 return (
 <div className="rounded-xl border border-red-light-4 bg-red-light-6 p-7 text-center text-red-dark">
 <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto" />
 <p className="mt-2 text-sm">{error}</p>
 <button type="button" onClick={() => void load(false)} className="mt-4 rounded-xl bg-red-dark px-4 py-2 text-sm font-semibold text-white">
 Retry
 </button>
 </div>
 );
 }

 const required = (status?.required_documents ?? []) as SellerDocumentType[];
 const missing = status?.missing_documents ?? [];
 const currentDocuments = documents.filter((document) => document.is_current !== false);
 const allSubmitted =
 required.length > 0 &&
 required.every((type) =>
 currentDocuments.some((document) => document.document_type === type),
 );

 const reviewLocked =
 status?.seller_status === "approved" ||
 currentDocuments.some((document) => document.status === "under_review");

 const rejectedDocuments = currentDocuments.filter(
 (document) => document.status === "rejected",
 );

 const licenseHold =
 status?.seller_status === "suspended" &&
 status?.suspension_reason === "business_license_expired";
 const currentLicense = currentDocuments.find(
 (document) => document.document_type === "business_license",
 );
 const renewalUnderReview =
 licenseHold && currentLicense?.status === "under_review";
 const renewalRejected =
 licenseHold && currentLicense?.status === "rejected";


 const canEdit = (document: SellerKycDocument) =>
 !licenseHold &&
 !reviewLocked &&
 status?.seller_status !== "approved" &&
 ["pending", "rejected"].includes(document.status || "pending");

 const progress = required.length
 ? Math.round(((required.length - missing.length) / required.length) * 100)
 : 0;

 const selectedCount = Object.values(selectedFiles).filter(Boolean).length;

 return (
 <div className="space-y-6">
 <section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">
 <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Seller Verification</p>
 <h2 className="mt-1 text-2xl font-bold tracking-[-0.025em]">Business Documents</h2>
 <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
 Submit the required documents once. After submission you can view them and, until Admin starts review, replace a document if you notice a mistake.
 </p>
 </div>

 <div className="min-w-[230px] rounded-xl bg-muted p-4">
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">Documents complete</span>
 <b>{progress}%</b>
 </div>
 <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
 <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
 </div>
 <p className="mt-2 text-xs capitalize text-muted-foreground">Seller status: {status?.seller_status?.replaceAll("_", " ") || "pending"}</p>
 </div>
 </div>
 </section>

 {licenseHold && (
 <section className="rounded-xl border border-red-light-4 bg-red-light-6 p-5 shadow-sm sm:p-6">
 <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
 <div className="max-w-2xl">
 <div className="flex items-center gap-2 text-red-dark">
 <HugeiconsIcon icon={AlertCircleIcon} size={20} />
 <p className="text-xs font-bold uppercase tracking-[0.14em]">Selling compliance hold</p>
 </div>
 <h3 className="mt-2 text-xl font-bold text-foreground">Renew your Business Licence</h3>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">
 Your previous Business Licence has expired. Your Xerin account and existing-order access remain available, but new selling stays paused until Admin approves a renewed licence.
 </p>
 {currentLicense && (
 <div className="mt-4 flex flex-wrap gap-2 text-xs">
 <span className="rounded-full bg-card px-3 py-1.5 font-semibold text-accent-foreground shadow-sm">
 Current version: v{currentLicense.version || 1}
 </span>
 <span className="rounded-full bg-card px-3 py-1.5 font-semibold text-accent-foreground shadow-sm">
 Status: {(currentLicense.status || "pending").replaceAll("_", " ")}
 </span>
 {currentLicense.expiry_date && (
 <span className="rounded-full bg-card px-3 py-1.5 font-semibold text-red-dark shadow-sm">
 Expiry: {currentLicense.expiry_date}
 </span>
 )}
 </div>
 )}
 </div>

 {renewalUnderReview && (
 <div className="min-w-[250px] rounded-xl border border-primary-200 bg-primary-50 p-4 text-primary-800">
 <div className="flex items-center gap-2 font-semibold"><HugeiconsIcon icon={Clock01Icon} size={16} /> Renewal under review</div>
 <p className="mt-1 text-xs leading-5">Admin is reviewing your new licence. Selling will reactivate automatically after approval.</p>
 </div>
 )}
 </div>

 {!renewalUnderReview && (
 <div className="mt-5 rounded-xl border border-border bg-card p-4 sm:p-5">
 {renewalRejected && (
 <div className="mb-4 rounded-xl border border-red-light-4 bg-red-light-6 p-3 text-sm text-red-dark">
 <p className="font-semibold">Renewal correction required</p>
 <p className="mt-1 text-xs leading-5">{currentLicense?.rejection_reason || "Admin rejected the previous renewal. Upload a corrected licence."}</p>
 </div>
 )}
 <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr]">
 <label className="text-xs font-semibold text-muted-foreground">
 New licence number
 <input
 value={renewalLicenseNumber}
 onChange={(event) => setRenewalLicenseNumber(event.target.value)}
 disabled={submittingRenewal}
 placeholder="e.g. BL-2027-0012"
 className="mt-1 h-11 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-[var(--primary)]"
 />
 </label>
 <label className="text-xs font-semibold text-muted-foreground">
 New expiry date
 <input
 type="date"
 min={new Date().toISOString().slice(0, 10)}
 value={renewalExpiryDate}
 onChange={(event) => setRenewalExpiryDate(event.target.value)}
 disabled={submittingRenewal}
 className="mt-1 h-11 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-[var(--primary)]"
 />
 </label>
 <label className="flex min-h-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted px-4 text-center hover:border-[var(--primary)]">
 <div>
 <HugeiconsIcon icon={CloudUploadIcon} size={20} className="mx-auto text-muted-foreground" />
 <p className="mt-1 max-w-[260px] truncate text-xs font-semibold text-accent-foreground">{renewalFile?.file.name || "Choose renewed Business Licence PDF"}</p>
 <p className="mt-1 text-[11px] text-muted-foreground">PDF only · max 10 MB</p>
 </div>
 <input
 type="file"
 accept="application/pdf,.pdf"
 className="hidden"
 disabled={submittingRenewal}
 onChange={(event) => {
 chooseRenewalFile(event.target.files?.[0] ?? null);
 event.currentTarget.value = "";
 }}
 />
 </label>
 </div>

 <div className="mt-4 flex flex-wrap gap-3">
 {renewalFile && (
 <button
 type="button"
 onClick={() => setLocalPreview({ title: "Renewed Business Licence · before submission", url: renewalFile.previewUrl })}
 className="inline-flex h-11 items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 text-sm font-semibold text-primary"
 >
 <HugeiconsIcon icon={ViewIcon} size={16} /> Preview licence
 </button>
 )}
 <button
 type="button"
 onClick={() => void submitLicenseRenewal()}
 disabled={submittingRenewal || !renewalFile || !renewalLicenseNumber.trim() || !renewalExpiryDate}
 className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
 >
 {submittingRenewal ? <><Spinner />Submitting renewal...</> : <><HugeiconsIcon icon={SentIcon} size={16} />Submit renewal for approval</>}
 </button>
 </div>
 </div>
 )}
 </section>
 )}

 {reviewLocked && status?.seller_status !== "approved" && (
 <section className="flex items-start gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4 text-primary-800">
 <HugeiconsIcon icon={LockKeyIcon} className="mt-0.5 shrink-0" size={18} />
 <div>
 <p className="text-sm font-semibold">Administrator review in progress</p>
 <p className="mt-1 text-xs leading-5">Your documents are view-only while Admin reviews the application. Editing becomes available again only if corrections are requested.</p>
 </div>
 </section>
 )}

 {rejectedDocuments.length > 0 && (
 <section className="rounded-xl border border-red-light-4 bg-red-light-6 p-5 text-red-800">
 <div className="flex items-start gap-3">
 <HugeiconsIcon icon={AlertCircleIcon} className="mt-0.5 shrink-0" size={20} />
 <div className="min-w-0">
 <p className="font-semibold">Corrections are required</p>
 <p className="mt-1 text-sm">Review the administrator reason and use Edit on the document that must be corrected.</p>
 <div className="mt-3 space-y-2">
 {rejectedDocuments.map((document) => (
 <div key={document.id} className="rounded-lg border border-red-light-4 bg-card/70 p-3">
 <p className="text-xs font-semibold">{pretty(document.document_type)}</p>
 <p className="mt-1 text-xs leading-5">{document.rejection_reason || "Correction requested by administrator."}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>
 )}

 <section className={`relative rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6 ${allSubmitted ? "opacity-45" : ""}`}>
 {allSubmitted && (
 <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card/35 backdrop-blur-[1px]">
 <div className="max-w-md rounded-xl border border-border bg-card p-4 text-center shadow-sm">
 <HugeiconsIcon icon={FileCheckIcon} className="mx-auto text-green-dark" size={24} />
 <p className="mt-2 text-sm font-semibold">Initial document submission is complete</p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">New upload is disabled. Use View or Edit in Submitted documents below.</p>
 </div>
 </div>
 )}

 <div className="mb-5 flex items-start justify-between gap-4">
 <div className="flex items-center gap-3">
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><HugeiconsIcon icon={CloudUploadIcon} size={18} /></span>
 <div>
 <h3 className="font-bold">Initial document submission</h3>
 <p className="text-xs text-muted-foreground">PDF only · maximum 10 MB per document.</p>
 </div>
 </div>
 <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">{selectedCount} selected</span>
 </div>

 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 {required.map((type) => {
 const selected = selectedFiles[type];
 return (
 <article key={type} className={`rounded-xl border p-4 ${selected ? "border-[var(--primary)]/50 bg-primary/10/30" : "border-border"}`}>
 <HugeiconsIcon icon={File01Icon} size={20} className="text-muted-foreground" />
 <h4 className="mt-3 font-semibold">{pretty(type)}</h4>
 <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">{descriptions[type]}</p>
 {type === "business_license" && (
 <div className="mt-3 grid gap-2">
 <input
 type="text"
 value={businessLicenseNumber}
 disabled={allSubmitted || submittingAll}
 onChange={(event) => setBusinessLicenseNumber(event.target.value)}
 placeholder="Licence number"
 className="h-10 rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-[var(--primary)]"
 />
 <label className="text-[11px] font-semibold text-muted-foreground">
 Expiry date
 <input
 type="date"
 value={businessLicenseExpiryDate}
 min={new Date().toISOString().slice(0, 10)}
 disabled={allSubmitted || submittingAll}
 onChange={(event) => setBusinessLicenseExpiryDate(event.target.value)}
 className="mt-1 h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-[var(--primary)]"
 />
 </label>
 </div>
 )}
 <label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted px-3 py-4 text-center hover:border-[var(--primary)]">
 {selected ? (
 <><HugeiconsIcon icon={FileCheckIcon} size={20} className="text-primary" /><span className="mt-2 max-w-full truncate text-xs font-semibold">{selected.file.name}</span><span className="mt-1 text-[11px] text-muted-foreground">{(selected.file.size / 1024 / 1024).toFixed(2)} MB</span></>
 ) : (
 <><HugeiconsIcon icon={CloudUploadIcon} size={20} className="text-muted-foreground" /><span className="mt-2 text-xs font-semibold">Choose {pretty(type)}</span><span className="mt-1 text-[11px] text-muted-foreground">PDF only · max 10 MB</span></>
 )}
 <input type="file" accept="application/pdf,.pdf" className="hidden" disabled={allSubmitted || submittingAll} onChange={(event) => { selectInitialFile(type, event.target.files?.[0] ?? null); event.currentTarget.value = ""; }} />
 </label>
 {selected && (
 <div className="mt-3 flex gap-2">
 <button type="button" onClick={() => setLocalPreview({ title: `${pretty(type)} · before submission`, url: selected.previewUrl })} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"><HugeiconsIcon icon={ViewIcon} size={14} />Preview</button>
 <button type="button" onClick={() => selectInitialFile(type, null)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border"><HugeiconsIcon icon={Cancel01Icon} size={16} /></button>
 </div>
 )}
 </article>
 );
 })}
 </div>

 <button type="button" onClick={() => void submitInitialDocuments()} disabled={allSubmitted || selectedCount !== required.length || submittingAll} className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
 {submittingAll ? <><Spinner />Submitting...</> : <><HugeiconsIcon icon={SentIcon} size={16} />Submit All Documents</>}
 </button>
 </section>

 <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
 <div className="mb-5 flex items-center gap-3">
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-light-6 text-green-dark"><HugeiconsIcon icon={FileCheckIcon} size={18} /></span>
 <div><h3 className="font-bold">Submitted documents</h3><p className="text-xs text-muted-foreground">View is always available. Edit is available before Admin review or after rejection.</p></div>
 </div>

 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 {required.map((type) => {
 const document = currentDocuments.find((item) => item.document_type === type);
 if (!document) return <div key={type} className="rounded-xl border border-dashed border-border p-4"><p className="text-sm font-semibold">{pretty(type)}</p><p className="mt-1 text-xs text-muted-foreground">Not submitted</p></div>;
 const editable = canEdit(document);
 return (
 <article key={document.id} className="rounded-xl border border-border p-4">
 <div className="flex items-start justify-between gap-3">
 <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${document.status === "rejected" ? "bg-red-light-6 text-destructive" : document.status === "under_review" ? "bg-primary-50 text-primary-600" : document.status === "approved" ? "bg-green-light-6 text-green-dark" : "bg-yellow-light-4 text-yellow-dark"}`}>
 {document.status === "under_review" ? <HugeiconsIcon icon={Clock01Icon} size={16} /> : document.status === "rejected" ? <HugeiconsIcon icon={AlertCircleIcon} size={16} /> : <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />}
 </span>
 <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase">{(document.status || "pending").replaceAll("_", " ")}</span>
 </div>
 <h4 className="mt-3 font-semibold">{pretty(type)}</h4>
 {type === "business_license" && (
 <div className="mt-3 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
 <p><span className="font-semibold text-foreground">Licence:</span> {document.document_number || "—"}</p>
 <p className="mt-1"><span className="font-semibold text-foreground">Expires:</span> {document.expiry_date || "—"}</p>
 <p className="mt-1"><span className="font-semibold text-foreground">Version:</span> {document.version || 1}</p>
 </div>
 )}
 {document.rejection_reason && <div className="mt-3 rounded-lg border border-red-light-4 bg-red-light-6 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-red-dark">Rejection reason</p><p className="mt-1 text-xs leading-5 text-red-dark">{document.rejection_reason}</p></div>}
 <div className="mt-4 flex flex-wrap gap-2">
 <button type="button" onClick={() => setBackendPreview({ title: pretty(type), url: sellersApi.getKycDocumentViewUrl(document.id) })} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary"><HugeiconsIcon icon={ViewIcon} size={14} />View</button>
 {editable && <button type="button" onClick={() => beginEdit(document)} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background"><HugeiconsIcon icon={Edit02Icon} size={14} />Edit</button>}
 {!editable && reviewLocked && <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground"><HugeiconsIcon icon={LockKeyIcon} size={14} />View only</span>}
 </div>
 </article>
 );
 })}
 </div>

 {documents.some((document) => document.document_type === "business_license" && document.is_current === false) && (
 <div className="mt-5 rounded-xl border border-border bg-muted p-4">
 <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Business Licence history</p>
 <div className="mt-3 space-y-2">
 {documents
 .filter((document) => document.document_type === "business_license" && document.is_current === false)
 .sort((a, b) => (b.version || 0) - (a.version || 0))
 .map((document) => (
 <div key={document.id} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
 <div className="text-xs text-muted-foreground">
 <span className="font-semibold">Version {document.version || 1}</span> · {document.document_number || "No number"} · expired/valid until {document.expiry_date || "—"}
 </div>
 <button type="button" onClick={() => setBackendPreview({ title: `Business Licence v${document.version || 1}`, url: sellersApi.getKycDocumentViewUrl(document.id) })} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary"><HugeiconsIcon icon={ViewIcon} size={14} />View archived licence</button>
 </div>
 ))}
 </div>
 </div>
 )}

 <Link href="/seller/kyc" className="mt-5 inline-flex text-sm font-semibold text-primary">View KYC verification status →</Link>
 </section>

 {editing && (
 <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
 <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-lg">
 <div className="flex items-start justify-between gap-4">
 <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Edit document</p><h3 className="mt-1 text-lg font-semibold">{pretty(editing.document_type)}</h3></div>
 <button type="button" onClick={closeEdit} disabled={savingEdit} className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"><HugeiconsIcon icon={Cancel01Icon} size={16} /></button>
 </div>
 {editing.rejection_reason && <div className="mt-4 rounded-xl border border-red-light-4 bg-red-light-6 p-4"><p className="text-xs font-bold uppercase text-red-dark">Admin reason</p><p className="mt-1 text-sm leading-6 text-red-dark">{editing.rejection_reason}</p></div>}
 {editing.document_type === "business_license" && (
 <div className="mt-5 grid gap-3 sm:grid-cols-2">
 <label className="text-xs font-semibold text-muted-foreground">Licence number
 <input value={editLicenseNumber} onChange={(event) => setEditLicenseNumber(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-[var(--primary)]" />
 </label>
 <label className="text-xs font-semibold text-muted-foreground">Expiry date
 <input type="date" min={new Date().toISOString().slice(0, 10)} value={editLicenseExpiryDate} onChange={(event) => setEditLicenseExpiryDate(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-[var(--primary)]" />
 </label>
 </div>
 )}
 <label className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted p-5 text-center hover:border-[var(--primary)]">
 <HugeiconsIcon icon={CloudUploadIcon} size={24} className="text-muted-foreground" /><span className="mt-2 text-sm font-semibold">{editFile?.file.name || "Choose corrected PDF"}</span><span className="mt-1 text-xs text-muted-foreground">PDF only · maximum 10 MB</span>
 <input type="file" accept="application/pdf,.pdf" className="hidden" disabled={savingEdit} onChange={(event) => { chooseEditFile(event.target.files?.[0] ?? null); event.currentTarget.value = ""; }} />
 </label>
 {editFile && <button type="button" onClick={() => setLocalPreview({ title: `${pretty(editing.document_type)} · corrected file`, url: editFile.previewUrl })} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"><HugeiconsIcon icon={ViewIcon} size={16} />Preview corrected PDF</button>}
 <div className="mt-6 flex gap-3"><button type="button" onClick={closeEdit} disabled={savingEdit} className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold">Cancel</button><button type="button" onClick={() => void saveEdit()} disabled={savingEdit || (!editFile && editing.document_type !== "business_license")} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">{savingEdit ? "Saving..." : "Save corrected document"}</button></div>
 </div>
 </div>
 )}

 <LocalPdfPreview open={Boolean(localPreview)} title={localPreview?.title || "PDF preview"} url={localPreview?.url || ""} onClose={() => setLocalPreview(null)} />
 <BackendDocumentPreview open={Boolean(backendPreview)} title={backendPreview?.title || "Submitted document"} documentUrl={backendPreview?.url || ""} onClose={() => setBackendPreview(null)} />
 </div>
 );
}

function LocalPdfPreview({ open, title, url, onClose }: { open: boolean; title: string; url: string; onClose: () => void }) {
 if (!open || !url) return null;
 return (
 <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4">
 <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-card shadow-lg">
 <div className="flex items-center justify-between border-b border-border px-5 py-4"><h3 className="font-semibold">{title}</h3><button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"><HugeiconsIcon icon={Cancel01Icon} size={18} /></button></div>
 <div className="bg-muted p-4"><iframe src={url} title={title} className="h-[72vh] w-full rounded-lg bg-card" /></div>
 </div>
 </div>
 );
}
