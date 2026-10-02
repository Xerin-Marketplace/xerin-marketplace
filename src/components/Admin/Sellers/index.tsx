"use client";


import { Spinner } from "@/components/ui/Spinner";
import BackendDocumentPreview from "@/components/Common/BackendDocumentPreview";
import { ApiError } from "@/lib/api/client";
import {
 adminService,
 type AdminSeller,
 type AdminSellerDocument,
} from "@/lib/api/endpoints/admin";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { AlertCircleIcon, Building03Icon, CheckmarkCircle02Icon, ArrowLeft01Icon, ArrowRight01Icon, Clock01Icon, ViewIcon, File01Icon, Globe02Icon, Mail01Icon, Location01Icon, Call02Icon, RefreshCwIcon, Search01Icon, ShieldCheckIcon, UserCheck01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const errorMessage = (error: unknown) =>
 error instanceof ApiError
 ? error.message
 : "Unable to complete this seller action.";

const documentLabel = (type: string) => {
 const labels: Record<string, string> = {
 tin: "TIN Certificate",
 business_registration: "Business Registration / Incorporation",
 business_license: "Business Licence",
 business_profile: "Business Profile",
 };

 return (
 labels[type] ||
 type.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
 );
};


const sellerStatusStyle = (status: string) => {
 switch (status) {
 case "approved":
 return "bg-green-light-6 text-green-dark border-green-light-4";
 case "rejected":
 return "bg-red-light-6 text-red-dark border-red-light-4";
 case "under_review":
 return "bg-primary-50 text-primary-700 border-primary-200";
 case "pending":
 return "bg-yellow-light-4 text-yellow-dark-2 border-yellow-light-2";
 case "suspended":
 return "bg-primary/10 text-primary border-primary/25";
 default:
 return "bg-muted text-accent-foreground border-border";
 }
};

const documentStatusStyle = (status: string) => {
 switch (status) {
 case "approved":
 return "bg-green-light-6 text-green-dark";
 case "rejected":
 return "bg-red-light-6 text-red-dark";
 case "under_review":
 return "bg-primary-50 text-primary-700";
 default:
 return "bg-yellow-light-4 text-yellow-dark-2";
 }
};

export default function AdminSellers({
 mode = "all",
}: {
 mode?: "all" | "applications";
}) {
 const [sellers, setSellers] = useState<AdminSeller[]>([]);
 const [loading, setLoading] = useState(true);
 const [query, setQuery] = useState("");
 const [status, setStatus] = useState(
 mode === "applications" ? "under_review" : "all",
 );
 const [selected, setSelected] = useState<AdminSeller | null>(null);
 const [documents, setDocuments] = useState<AdminSellerDocument[]>([]);
 const [documentsLoading, setDocumentsLoading] = useState(false);
 const [documentPreview, setDocumentPreview] = useState<{
 title: string;
 url: string;
 } | null>(null);
 const [rejectReason, setRejectReason] = useState("");
 const [showRejectModal, setShowRejectModal] = useState(false);
 const [rejectContext, setRejectContext] = useState<"application" | "license_renewal">("application");
 const [busy, setBusy] = useState<string | null>(null);
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(10);

 const load = async () => {
 setLoading(true);
 try {
 setSellers(await adminService.listAllSellers());
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void load();
 }, []);

 const filtered = useMemo(
 () =>
 sellers.filter((seller) => {
 const matchesStatus = status === "all" || seller.status === status;
 const haystack =
 `${seller.business_name} ${seller.contact_email ?? ""} ${seller.contact_phone ?? ""}`.toLowerCase();

 return matchesStatus && haystack.includes(query.toLowerCase());
 }),
 [query, sellers, status],
 );

 useEffect(() => {
 setPage(1);
 }, [query, status, mode]);

 const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
 const safePage = Math.min(page, totalPages);
 const pageStart = (safePage - 1) * pageSize;
 const visibleSellers = filtered.slice(pageStart, pageStart + pageSize);

 const openSeller = async (seller: AdminSeller) => {
 setSelected(seller);
 setRejectReason("");
 setRejectContext("application");
 setShowRejectModal(false);
 setDocuments([]);
 setDocumentsLoading(true);

 try {
 let currentSeller = seller;
 if (seller.status === "under_review") {
 currentSeller = await adminService.startSellerReview(seller.id);
 setSelected(currentSeller);
 setSellers((items) => items.map((item) => item.id === currentSeller.id ? currentSeller : item));
 }
 setDocuments(await adminService.getSellerDocuments(seller.id));
 } catch (error) {
 setDocuments([]);
 toast.error(errorMessage(error));
 } finally {
 setDocumentsLoading(false);
 }
 };

 const approve = async () => {
 if (!selected) return;
 setBusy("approve");

 try {
 const updated = await adminService.approveSeller(selected.id);
 setSellers((items) =>
 items.map((item) => (item.id === updated.id ? updated : item)),
 );
 setSelected(updated);
 toast.success("Seller approved successfully.");
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setBusy(null);
 }
 };

 const startLicenseRenewalReview = async () => {
 if (!selected) return;
 setBusy("renewal-review");
 try {
 const updated = await adminService.startSellerLicenseRenewalReview(selected.id);
 setSellers((items) => items.map((item) => (item.id === updated.id ? updated : item)));
 setSelected(updated);
 setDocuments(await adminService.getSellerDocuments(selected.id));
 toast.success("Business Licence renewal review started.");
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setBusy(null);
 }
 };

 const approveLicenseRenewal = async () => {
 if (!selected) return;
 setBusy("renewal-approve");
 try {
 const updated = await adminService.approveSellerLicenseRenewal(selected.id);
 setSellers((items) => items.map((item) => (item.id === updated.id ? updated : item)));
 setSelected(updated);
 setDocuments(await adminService.getSellerDocuments(selected.id));
 toast.success("Business Licence renewal approved. Seller selling access is active again.");
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setBusy(null);
 }
 };

 const reject = async () => {
 if (!selected || !rejectReason.trim()) {
 toast.error("Add a rejection reason first.");
 return;
 }

 setBusy("reject");

 try {
 const updated =
 rejectContext === "license_renewal"
 ? await adminService.rejectSellerLicenseRenewal(
 selected.id,
 rejectReason.trim(),
 )
 : await adminService.rejectSeller(
 selected.id,
 rejectReason.trim(),
 );
 setSellers((items) =>
 items.map((item) => (item.id === updated.id ? updated : item)),
 );
 setSelected(updated);
 setDocuments(await adminService.getSellerDocuments(selected.id));
 setShowRejectModal(false);
 setRejectReason("");
 toast.success(
 rejectContext === "license_renewal"
 ? "Business Licence renewal rejected. The seller remains on compliance hold and can submit a corrected renewal."
 : "Seller application rejected. The seller can now see the reason and correct the rejected documents.",
 );
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setBusy(null);
 }
 };

 const counts = {
 total: sellers.length,
 pending: sellers.filter((seller) => seller.status === "pending").length,
 review: sellers.filter((seller) => seller.status === "under_review").length,
 approved: sellers.filter((seller) => seller.status === "approved").length,
 rejected: sellers.filter((seller) => seller.status === "rejected").length,
 suspended: sellers.filter((seller) => seller.status === "suspended").length,
 };

 return (
 <div className="space-y-5">
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
 Seller operations
 </p>
 <h2 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-foreground">
 {mode === "applications" ? "Seller Applications" : "Seller Management"}
 </h2>
 <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
 {mode === "applications"
 ? "Review onboarding details, KYC documents and business information before activating selling access."
 : "Monitor every seller account, verification state and operational readiness from one workspace."}
 </p>
 </div>
 <div className="rounded-xl border border-border bg-muted px-4 py-3 text-right">
 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
 Sellers
 </p>
 <p className="mt-1 text-2xl font-bold text-foreground">{counts.total}</p>
 </div>
 </div>
 </section>

 <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-5">
 {[
 ["All sellers", counts.total, "All registered seller accounts"],
 ["Pending", counts.pending, "Waiting for review"],
 ["Under review", counts.review, "Currently being assessed"],
 ["Approved", counts.approved, "Selling access active"],
 ["Rejected", counts.rejected, "Correction required"],
 ].map(([label, value, hint]) => (
 <article
 key={label}
 className="rounded-xl border border-border bg-card p-5 shadow-sm"
 >
 <div className="flex items-center justify-between">
 <p className="text-sm font-semibold text-muted-foreground">{label}</p>
 <span className={`h-2.5 w-2.5 rounded-full ${
 label === "Approved"
 ? "bg-success"
 : label === "Rejected"
 ? "bg-destructive"
 : label === "Under review"
 ? "bg-primary-500"
 : label === "Pending"
 ? "bg-warning"
 : "bg-primary"
 }`} />
 </div>
 <p className="mt-3 text-3xl font-bold tracking-[-0.03em] text-foreground">
 {value}
 </p>
 <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
 </article>
 ))}
 </div>

 <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
 <div className="border-b border-border bg-card p-5 lg:p-6">
 <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
 <div>
 <div className="flex items-center gap-2">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <HugeiconsIcon icon={Building03Icon} size={18} />
 </span>
 <div>
 <h3 className="text-lg font-semibold text-foreground">
 {mode === "applications" ? "Seller applications" : "Seller directory"}
 </h3>
 <p className="mt-0.5 text-sm text-muted-foreground">
 {filtered.length} of {sellers.length} seller{filtered.length === 1 ? "" : "s"}
 </p>
 </div>
 </div>
 </div>

 <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
 <label className="relative min-w-0 flex-1 xl:w-[320px]">
 <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
 <input
 value={query}
 onChange={(event) => setQuery(event.target.value)}
 placeholder="Search seller, email or phone..."
 className="h-11 w-full rounded-xl border border-border bg-muted pl-10 pr-4 text-sm text-accent-foreground outline-none transition focus:border-primary/40 focus:bg-card focus:ring-4 focus:ring-ring/30"
 />
 </label>
 <select
 value={status}
 onChange={(event) => setStatus(event.target.value)}
 className="h-11 rounded-xl border border-border bg-card px-4 text-sm font-medium text-accent-foreground outline-none focus:border-primary/40"
 >
 <option value="all">All statuses</option>
 <option value="pending">Pending</option>
 <option value="under_review">Under review</option>
 <option value="suspended">Suspended / compliance hold</option>
 <option value="approved">Approved</option>
 <option value="rejected">Rejected</option>
 </select>
 <button
 type="button"
 onClick={() => void load()}
 className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-accent-foreground transition hover:border-primary/25 hover:bg-primary/10 hover:text-primary"
 >
 <HugeiconsIcon icon={RefreshCwIcon} size={16} />
 Refresh
 </button>
 </div>
 </div>
 </div>

 {loading ? (
 <div className="p-14 text-center text-sm text-muted-foreground">Loading sellers...</div>
 ) : filtered.length === 0 ? (
 <div className="p-14 text-center text-sm text-muted-foreground">No sellers match these filters.</div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[980px] table-auto text-left">
 <thead>
 <tr className="border-b border-border bg-muted/80 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
 <th className="px-6 py-3.5">Seller / Business</th>
 <th className="px-5 py-3.5">Contact</th>
 <th className="px-5 py-3.5">Location</th>
 <th className="px-5 py-3.5">Registered</th>
 <th className="px-5 py-3.5">Status</th>
 <th className="px-6 py-3.5 text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {visibleSellers.map((seller) => (
 <tr key={seller.id} className="group transition hover:bg-primary/10/35">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-100 bg-primary/10 text-sm font-bold uppercase text-primary">
 {seller.business_name?.trim().charAt(0) || "S"}
 </span>
 <div className="min-w-0">
 <p className="max-w-[260px] truncate text-sm font-semibold text-foreground">{seller.business_name}</p>
 <p className="mt-0.5 text-xs text-muted-foreground">Seller ID: {seller.id.slice(0, 8)}…</p>
 </div>
 </div>
 </td>
 <td className="px-5 py-4">
 <p className="max-w-[230px] truncate text-sm font-medium text-accent-foreground">{seller.contact_email ?? "No email"}</p>
 <p className="mt-1 text-xs text-muted-foreground">{seller.contact_phone ?? "No phone"}</p>
 </td>
 <td className="px-5 py-4 text-sm text-muted-foreground">
 <div className="flex items-center gap-1.5"><HugeiconsIcon icon={Location01Icon} size={14} className="shrink-0 text-muted-foreground" /><span>{[seller.business_city, seller.business_country].filter(Boolean).join(", ") || "—"}</span></div>
 </td>
 <td className="px-5 py-4">
 <p className="text-sm font-medium text-accent-foreground">{new Date(seller.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</p>
 </td>
 <td className="px-5 py-4">
 <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${sellerStatusStyle(seller.status)}`}>
 <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
 {seller.status.replaceAll("_", " ")}
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 <button
 type="button"
 onClick={() => void openSeller(seller)}
 className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-accent-foreground shadow-sm transition hover:border-primary/25 hover:bg-primary/10 hover:text-primary"
 >
 <HugeiconsIcon icon={ViewIcon} size={14} />
 {seller.status === "approved" ? "View seller" : seller.status === "rejected" ? "Review correction" : "Review application"}
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {!loading && filtered.length > 0 && (
 <div className="flex flex-col gap-3 border-t border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
 <p className="text-sm text-muted-foreground">
 Showing{" "}
 <b className="text-foreground">
 {pageStart + 1}-{Math.min(pageStart + pageSize, filtered.length)}
 </b>{" "}
 of <b className="text-foreground">{filtered.length}</b> sellers
 </p>

 <div className="flex flex-wrap items-center gap-2">
 <select
 value={pageSize}
 onChange={(event) => {
 setPageSize(Number(event.target.value));
 setPage(1);
 }}
 className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground"
 >
 {[10, 20, 50].map((size) => (
 <option key={size} value={size}>
 {size} / page
 </option>
 ))}
 </select>

 <button
 type="button"
 disabled={safePage <= 1}
 onClick={() => setPage((current) => Math.max(1, current - 1))}
 className="inline-flex h-10 items-center gap-1 rounded-xl border border-border px-3 text-sm font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40"
 >
 <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
 Previous
 </button>

 <span className="min-w-24 text-center text-xs font-semibold text-muted-foreground">
 Page {safePage} of {totalPages}
 </span>

 <button
 type="button"
 disabled={safePage >= totalPages}
 onClick={() =>
 setPage((current) => Math.min(totalPages, current + 1))
 }
 className="inline-flex h-10 items-center gap-1 rounded-xl border border-border px-3 text-sm font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40"
 >
 Next
 <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
 </button>
 </div>
 </div>
 )}
 </div>

 {selected && (
 <div
 className="fixed inset-0 z-[99999] flex justify-end bg-black/40"
 onMouseDown={() => {
 setSelected(null);
 setShowRejectModal(false);
 setRejectReason("");
 }}
 >
 <aside
 className="flex h-full w-full max-w-2xl flex-col bg-card shadow-lg"
 onMouseDown={(event) => event.stopPropagation()}
 >
 <div className="flex-1 overflow-y-auto p-6">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wider text-primary">
 Seller application
 </p>
 <h3 className="mt-1 text-2xl font-semibold text-foreground">
 {selected.business_name}
 </h3>
 <p className="mt-1 text-sm text-muted-foreground">
 {selected.contact_email ?? "No contact email"}
 </p>
 </div>

 <button
 onClick={() => setSelected(null)}
 className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={16} />
 </button>
 </div>

 <div className="mt-6 rounded-xl border border-border bg-muted p-5">
 <div className="mb-4 flex items-center gap-2">
 <HugeiconsIcon icon={Building03Icon} size={18} className="text-primary" />
 <h4 className="font-semibold text-foreground">
 Seller business details
 </h4>
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 <Detail icon={ShieldCheckIcon} label="Seller Status" value={selected.status.replaceAll("_", " ")} />
 <Detail icon={Clock01Icon} label="Years in Business" value={selected.years_in_business ?? "—"} />
 <Detail icon={Mail01Icon} label="Contact Email" value={selected.contact_email ?? "—"} />
 <Detail icon={Call02Icon} label="Contact Phone" value={selected.contact_phone ?? "—"} />
 <Detail
 icon={Location01Icon}
 label="Business Location"
 value={[
 selected.business_address,
 selected.business_city,
 selected.business_region,
 selected.business_country,
 ]
 .filter(Boolean)
 .join(", ") || "—"}
 />
 <Detail
 icon={Globe02Icon}
 label="Website"
 value={selected.website_url ?? "—"}
 />
 <Detail
 icon={UserCheck01Icon}
 label="Seller Agreement"
 value={selected.agreement_accepted ? "Accepted" : "Not accepted"}
 />
 <Detail
 icon={File01Icon}
 label="Documents Submitted"
 value={documentsLoading ? "Loading..." : `${documents.length} document(s)`}
 />
 </div>

 {selected.business_description && (
 <div className="mt-4 rounded-xl border border-white bg-card p-4">
 <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
 Business description
 </p>
 <p className="mt-2 text-sm leading-6 text-accent-foreground">
 {selected.business_description}
 </p>
 </div>
 )}

 {selected.product_description && (
 <div className="mt-3 rounded-xl border border-white bg-card p-4">
 <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
 Products / services
 </p>
 <p className="mt-2 text-sm leading-6 text-accent-foreground">
 {selected.product_description}
 </p>
 </div>
 )}
 </div>

 <div
 className={`mt-6 rounded-xl border p-4 text-sm ${
 selected.status === "suspended" && selected.suspension_reason === "business_license_expired"
 ? "border-yellow-light-2 bg-yellow-light-4 text-amber-900"
 : selected.status === "rejected"
 ? "border-red-light-4 bg-red-light-6 text-red-800"
 : selected.status === "approved"
 ? "border-green-light-4 bg-green-light-6 text-emerald-800"
 : "border-primary-100 bg-primary-50 text-primary-800"
 }`}
 >
 <p className="font-semibold">
 {selected.status === "suspended" && selected.suspension_reason === "business_license_expired"
 ? "Business Licence renewal required"
 : selected.status === "rejected"
 ? "Correction requested"
 : selected.status === "approved"
 ? "Seller verified"
 : "Admin review mode"}
 </p>
 <p className="mt-1 text-xs leading-5">
 {selected.status === "suspended" && selected.suspension_reason === "business_license_expired"
 ? "Selling is paused because the previous Business Licence expired. Review the current renewal document below; approval restores selling automatically, while rejection keeps the seller on compliance hold."
 : selected.status === "rejected"
 ? "The seller can edit the rejected document(s). Review the corrected submission when it is uploaded again."
 : selected.status === "approved"
 ? "This seller has completed verification. Documents remain available for audit and viewing."
 : "Seller documents are view-only during review. Admin does not edit seller files. Reject with a clear reason when a correction is required."}
 </p>
 </div>

 <div className="mt-6">
 <div className="flex items-center gap-2">
 <HugeiconsIcon icon={ShieldCheckIcon} size={18} className="text-primary" />
 <div>
 <h4 className="font-semibold text-foreground">
 Submitted KYC documents
 </h4>
 <p className="text-xs text-muted-foreground">
 Loaded from this seller&apos;s backend document records.
 </p>
 </div>
 </div>

 {documentsLoading ? (
 <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
 <Spinner />
 Loading seller documents...
 </div>
 ) : (
 <div className="mt-4 space-y-3">
 {documents.map((document) => (
 <div
 key={document.id}
 className="rounded-xl border border-border p-4"
 >
 <div className="flex items-center gap-3">
 <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
 <HugeiconsIcon icon={File01Icon} size={18} />
 </span>

 <div className="min-w-0 flex-1">
 <p className="font-medium text-foreground">
 {documentLabel(document.document_type)}
 </p>
 <div className="mt-1 flex flex-wrap items-center gap-2">
 <span
 className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${documentStatusStyle(
 document.status,
 )}`}
 >
 {document.status.replaceAll("_", " ")}
 </span>
 {document.is_current === false && (
 <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">Archived v{document.version || 1}</span>
 )}
 </div>
 {document.document_type === "business_license" && (
 <div className="mt-2 text-xs leading-5 text-muted-foreground">
 <p><span className="font-semibold text-accent-foreground">Licence no:</span> {document.document_number || "—"}</p>
 <p><span className="font-semibold text-accent-foreground">Expiry:</span> {document.expiry_date || "—"}</p>
 </div>
 )}
 </div>

 <button
 type="button"
 onClick={() =>
 setDocumentPreview({
 title: `${selected.business_name} · ${documentLabel(
 document.document_type,
 )}`,
 url: adminService.getSellerDocumentViewUrl(selected.id, document.id),
 })
 }
 className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15"
 >
 <HugeiconsIcon icon={ViewIcon} size={14} />
 Preview
 </button>
 </div>

 {document.rejection_reason && (
 <div className="mt-3 rounded-lg border border-red-light-4 bg-red-light-6 p-3">
 <p className="text-[10px] font-bold uppercase tracking-wider text-red-dark">
 Rejection reason
 </p>
 <p className="mt-1 text-xs leading-5 text-red-dark">
 {document.rejection_reason}
 </p>
 </div>
 )}
 </div>
 ))}

 {documents.length === 0 && (
 <p className="rounded-xl bg-primary/10 p-4 text-sm text-primary">
 No KYC documents uploaded by this seller.
 </p>
 )}
 </div>
 )}
 </div>

 </div>

 {selected.status === "suspended" && selected.suspension_reason === "business_license_expired" ? (
 <div className="shrink-0 border-t border-yellow-light-2 bg-yellow-light-4 px-6 py-4 shadow-sm">
 {(() => {
 const renewal = documents.find(
 (document) =>
 document.document_type === "business_license" &&
 document.is_current !== false,
 );
 const renewalStatus = renewal?.status || "missing";

 return (
 <>
 <p className="mb-3 text-xs leading-5 text-amber-900">
 This is a licence renewal review. Do not use the normal seller onboarding approval flow.
 </p>
 {renewalStatus === "pending" || renewalStatus === "rejected" ? (
 <button
 type="button"
 disabled={Boolean(busy) || documentsLoading || !renewal}
 onClick={() => void startLicenseRenewalReview()}
 className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
 >
 <HugeiconsIcon icon={ShieldCheckIcon} size={16} />
 {busy === "renewal-review" ? "Starting review..." : "Start Licence Renewal Review"}
 </button>
 ) : renewalStatus === "under_review" ? (
 <div className="grid grid-cols-2 gap-3">
 <button
 type="button"
 disabled={Boolean(busy) || documentsLoading}
 onClick={() => void approveLicenseRenewal()}
 className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-success px-4 text-sm font-semibold text-white disabled:opacity-50"
 >
 <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
 {busy === "renewal-approve" ? "Approving..." : "Approve Renewal"}
 </button>
 <button
 type="button"
 disabled={Boolean(busy) || documentsLoading}
 onClick={() => {
 setRejectContext("license_renewal");
 setRejectReason("");
 setShowRejectModal(true);
 }}
 className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-white disabled:opacity-50"
 >
 <HugeiconsIcon icon={AlertCircleIcon} size={16} />
 Reject Renewal
 </button>
 </div>
 ) : (
 <p className="rounded-xl border border-yellow-light-2 bg-card p-3 text-xs text-amber-900">
 Waiting for the seller to submit a Business Licence renewal.
 </p>
 )}
 </>
 );
 })()}
 </div>
 ) : selected.status !== "approved" ? (
 <div className="shrink-0 border-t border-border bg-card px-6 py-4 shadow-sm">
 <p className="mb-3 text-xs leading-5 text-muted-foreground">
 After reviewing the seller details and all submitted documents,
 approve the application or reject it and provide a correction reason.
 </p>

 <div className="grid grid-cols-2 gap-3">
 <button
 type="button"
 disabled={Boolean(busy) || documentsLoading || documents.length === 0}
 onClick={() => void approve()}
 className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-success px-4 text-sm font-semibold text-white transition hover:bg-green-dark disabled:cursor-not-allowed disabled:opacity-50"
 >
 <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
 {busy === "approve" ? "Approving..." : "Approve Seller"}
 </button>

 <button
 type="button"
 disabled={Boolean(busy) || documentsLoading || documents.length === 0}
 onClick={() => {
 setRejectContext("application");
 setRejectReason("");
 setShowRejectModal(true);
 }}
 className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-white transition hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-50"
 >
 <HugeiconsIcon icon={AlertCircleIcon} size={16} />
 Reject Seller
 </button>
 </div>
 </div>
 ) : null}
 </aside>
 </div>
 )}

 {showRejectModal && selected && (
 <div
 className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
 onMouseDown={() => {
 if (!busy) {
 setShowRejectModal(false);
 setRejectReason("");
 }
 }}
 >
 <div
 className="w-full max-w-lg overflow-hidden rounded-xl bg-card shadow-lg"
 onMouseDown={(event) => event.stopPropagation()}
 >
 <div className="flex items-start justify-between border-b border-border px-6 py-5">
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.14em] text-destructive">
 {rejectContext === "license_renewal"
 ? "Reject Business Licence Renewal"
 : "Reject Seller Application"}
 </p>
 <h3 className="mt-1 text-xl font-semibold text-foreground">
 {selected.business_name}
 </h3>
 <p className="mt-1 text-sm leading-6 text-muted-foreground">
 {rejectContext === "license_renewal"
 ? "Explain exactly what must be corrected in the renewed licence. The seller stays on compliance hold until a valid renewal is approved."
 : "Tell the seller exactly what must be corrected. This reason will be visible to the seller and will allow document editing again."}
 </p>
 </div>

 <button
 type="button"
 disabled={Boolean(busy)}
 onClick={() => {
 setShowRejectModal(false);
 setRejectReason("");
 }}
 className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-muted disabled:opacity-50"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={16} />
 </button>
 </div>

 <div className="px-6 py-5">
 <label
 htmlFor="seller-rejection-reason"
 className="text-sm font-semibold text-foreground"
 >
 Rejection reason <span className="text-destructive">*</span>
 </label>

 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 Be specific. For example, identify the document and what is wrong
 with it.
 </p>

 <textarea
 id="seller-rejection-reason"
 value={rejectReason}
 onChange={(event) => setRejectReason(event.target.value)}
 rows={5}
 autoFocus
 maxLength={1000}
 placeholder="Example: The Business Licence has expired. Please upload a valid current Business Licence."
 className="mt-3 w-full resize-none rounded-xl border border-border p-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
 />

 <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
 <span>
 Minimum 5 characters
 </span>
 <span>{rejectReason.length}/1000</span>
 </div>

 <div className="mt-5 flex gap-3">
 <button
 type="button"
 disabled={Boolean(busy)}
 onClick={() => {
 setShowRejectModal(false);
 setRejectReason("");
 }}
 className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
 >
 Cancel
 </button>

 <button
 type="button"
 disabled={Boolean(busy) || rejectReason.trim().length < 5}
 onClick={() => void reject()}
 className="flex-1 rounded-xl bg-destructive px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-50"
 >
 {busy === "reject"
 ? "Rejecting..."
 : "Confirm Rejection"}
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 <BackendDocumentPreview
 open={Boolean(documentPreview)}
 title={documentPreview?.title || "Seller document"}
 documentUrl={documentPreview?.url || ""}
 onClose={() => setDocumentPreview(null)}
 />
 </div>
 );
}


function Detail({
 icon: Icon,
 label,
 value,
}: {
 icon: IconSvgElement;
 label: string;
 value: string;
}) {
 return (
 <div className="flex items-start gap-3 rounded-xl bg-card p-3">
 <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
 <HugeiconsIcon icon={Icon} size={16} />
 </span>
 <div className="min-w-0">
 <p className="text-[11px] text-muted-foreground">{label}</p>
 <p className="mt-0.5 break-words text-sm font-medium capitalize text-foreground">
 {value}
 </p>
 </div>
 </div>
 );
}

