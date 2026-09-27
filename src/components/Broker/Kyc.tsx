"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
 Upload04Icon,
 CheckmarkCircle02Icon,
 File01Icon,
 IdIcon,
 Camera01Icon,
 UserIcon,
 ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { brokersApi } from "@/lib/api/endpoints/brokers";
import type { Broker, BrokerKycDocument, BrokerKycStatus } from "@/types/api/broker";

const REQUIRED_DOCS: { key: string; label: string; hint: string; icon: IconSvgElement }[] = [
 {
 key: "national_id",
 label: "National ID / NIDA document",
 hint: "Clear photo of your NIDA card (front or back)",
 icon: IdIcon,
 },
 {
 key: "profile_photo",
 label: "Passport-size profile photo",
 hint: "A clear portrait photo on a plain background",
 icon: UserIcon,
 },
 {
 key: "selfie",
 label: "Selfie verification",
 hint: "Hold your ID next to your face",
 icon: Camera01Icon,
 },
];

const statusStyle: Record<string, { label: string; cls: string }> = {
 pending_kyc: { label: "KYC not submitted", cls: "bg-amber-100 text-amber-700" },
 kyc_submitted: { label: "Submitted — awaiting review", cls: "bg-blue-100 text-blue-700" },
 under_review: { label: "Under review", cls: "bg-blue-100 text-blue-700" },
 approved: { label: "Verified", cls: "bg-green-100 text-green-700" },
 rejected: { label: "Rejected — action required", cls: "bg-red-100 text-red-700" },
 suspended: { label: "Suspended", cls: "bg-red-100 text-red-700" },
};

export default function BrokerKyc() {
 const [broker, setBroker] = useState<Broker | null>(null);
 const [status, setStatus] = useState<BrokerKycStatus | null>(null);
 const [docs, setDocs] = useState<BrokerKycDocument[]>([]);
 const [nida, setNida] = useState("");
 const [busy, setBusy] = useState(false);
 const [busyDoc, setBusyDoc] = useState<string | null>(null);

 const load = async () => {
 try {
 const [b, s, d] = await Promise.all([
 brokersApi.me(),
 brokersApi.kycStatus(),
 brokersApi.documents(),
 ]);
 setBroker(b);
 setStatus(s);
 setDocs(d);
 setNida(b.nida_number || "");
 } catch (e) {
 toast.error(e instanceof Error ? e.message : "Unable to load KYC details");
 }
 };

 useEffect(() => {
 void load();
 }, []);

 const saveNida = async () => {
 if (!nida.trim()) {
 toast.error("Enter your national ID number.");
 return;
 }
 setBusy(true);
 try {
 await brokersApi.updateMe({ nida_number: nida.trim() });
 toast.success("Identity number saved");
 await load();
 } catch (e) {
 toast.error(e instanceof Error ? e.message : "Unable to save");
 } finally {
 setBusy(false);
 }
 };

 const upload = async (type: string, file?: File) => {
 if (!file) return;
 setBusyDoc(type);
 try {
 await brokersApi.upload(type, file);
 toast.success("Document uploaded");
 await load();
 } catch (e) {
 toast.error(e instanceof Error ? e.message : "Upload failed");
 } finally {
 setBusyDoc(null);
 }
 };

 const submit = async () => {
 setBusy(true);
 try {
 await brokersApi.submitKyc();
 toast.success("KYC submitted for admin review");
 await load();
 } catch (e) {
 toast.error(e instanceof Error ? e.message : "Unable to submit KYC");
 } finally {
 setBusy(false);
 }
 };

 if (!broker || !status) {
 return (
 <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
 Loading KYC…
 </div>
 );
 }

 const locked = ["kyc_submitted", "under_review", "approved", "suspended"].includes(broker.status);
 const pill = statusStyle[broker.status] || statusStyle.pending_kyc;
 const docByType = (key: string) => docs.find((d) => d.document_type === key);

 return (
 <div className="space-y-5 pb-20">
 {/* Header + status */}
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h1 className="text-xl font-bold text-foreground sm:text-2xl">Identity verification</h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Verified Winga accounts unlock opportunities, products, earnings and payouts.
 </p>
 </div>
 <span className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${pill.cls}`}>
 {pill.label}
 </span>
 </div>

 {broker.status_reason && (
 <div className="rounded-lg border border-red-light-4 bg-red-light-6 p-3.5 text-sm font-medium text-red-dark">
 {broker.status_reason}
 </div>
 )}

 {broker.status === "approved" ? (
 <div className="flex items-start gap-3 rounded-xl border border-green-light-4 bg-green-light-6 p-4">
 <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} className="mt-0.5 shrink-0 text-green-dark" />
 <div>
 <p className="font-semibold text-green-dark">Your Winga account is verified.</p>
 <p className="mt-0.5 text-sm text-muted-foreground">
 Wallet, promotions, products and analytics are fully unlocked.
 </p>
 </div>
 </div>
 ) : (
 <>
 {/* Step 1 — NIDA */}
 <section className="rounded-xl border border-border bg-card p-5">
 <div className="flex items-center gap-2.5">
 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
 <HugeiconsIcon icon={IdIcon} size={16} />
 </span>
 <div>
 <h2 className="text-sm font-bold text-foreground">1. National ID / NIDA number</h2>
 <p className="text-xs text-muted-foreground">Exactly as printed on your ID.</p>
 </div>
 </div>
 <div className="mt-4 flex flex-col gap-3 sm:flex-row">
 <input
 disabled={locked}
 value={nida}
 onChange={(e) => setNida(e.target.value)}
 placeholder="e.g. 19XX0505-00000-00000-00"
 className="h-11 flex-1 rounded-lg border border-border bg-muted px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
 />
 <button
 onClick={() => void saveNida()}
 disabled={locked || busy}
 className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
 >
 Save
 </button>
 </div>
 </section>

 {/* Step 2 — documents */}
 <section className="rounded-xl border border-border bg-card p-5">
 <div className="flex items-center gap-2.5">
 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
 <HugeiconsIcon icon={File01Icon} size={16} />
 </span>
 <div>
 <h2 className="text-sm font-bold text-foreground">2. Required documents</h2>
 <p className="text-xs text-muted-foreground">
 JPEG, PNG, WEBP or PDF — {status.missing_documents.length} still missing.
 </p>
 </div>
 </div>

 <div className="mt-4 space-y-2.5">
 {REQUIRED_DOCS.map((req) => {
 const doc = docByType(req.key);
 const uploading = busyDoc === req.key;
 return (
 <div
 key={req.key}
 className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
 >
 <div className="flex min-w-0 items-center gap-3">
 <span
 className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
 doc && doc.status !== "rejected"
 ? "bg-green-100 text-green-700"
 : "bg-muted text-muted-foreground"
 }`}
 >
 <HugeiconsIcon
 icon={doc && doc.status !== "rejected" ? CheckmarkCircle02Icon : req.icon}
 size={18}
 />
 </span>
 <div className="min-w-0">
 <p className="text-sm font-semibold text-foreground">{req.label}</p>
 <p className="text-xs text-muted-foreground">
 {doc
 ? doc.status === "rejected"
 ? `Rejected${doc.rejection_reason ? `: ${doc.rejection_reason}` : ""} — upload again`
 : doc.original_filename || "Uploaded · pending review"
 : req.hint}
 </p>
 </div>
 </div>
 <label
 className={`inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
 locked
 ? "cursor-not-allowed bg-muted text-muted-foreground"
 : "bg-primary/10 text-primary hover:bg-primary/15"
 }`}
 >
 <HugeiconsIcon icon={Upload04Icon} size={14} />
 {uploading ? "Uploading…" : doc ? "Replace" : "Upload"}
 <input
 disabled={locked || uploading}
 type="file"
 accept="image/jpeg,image/png,image/webp,application/pdf"
 className="hidden"
 onChange={(e) => void upload(req.key, e.target.files?.[0])}
 />
 </label>
 </div>
 );
 })}
 </div>
 </section>

 {/* Step 3 — submit */}
 <section className="rounded-xl border border-border bg-card p-5">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h2 className="text-sm font-bold text-foreground">3. Submit for review</h2>
 <p className="mt-0.5 text-xs text-muted-foreground">
 {status.missing_documents.length
 ? `Missing: ${status.missing_documents.join(", ")}`
 : broker.status === "rejected"
 ? "Fix the rejected items above, then resubmit."
 : "All documents ready — submit for admin review."}
 </p>
 </div>
 <button
 onClick={() => void submit()}
 disabled={busy || !status.can_submit_for_review}
 className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
 >
 Submit KYC
 <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
 </button>
 </div>
 </section>
 </>
 )}
 </div>
 );
}
