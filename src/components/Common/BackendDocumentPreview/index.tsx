"use client";


import { Spinner } from "@/components/ui/Spinner";
import { fetchBackendDocumentBlob } from "@/lib/documents/backend-document";
import { HugeiconsIcon } from "@hugeicons/react";
import { LinkSquare01Icon, File01Icon, Loading03Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";

type Props = {
 open: boolean;
 title: string;
 documentUrl: string;
 onClose: () => void;
};

export default function BackendDocumentPreview({
 open,
 title,
 documentUrl,
 onClose,
}: Props) {
 const [blobUrl, setBlobUrl] = useState("");
 const [contentType, setContentType] = useState("application/pdf");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 useEffect(() => {
 if (!open || !documentUrl) return;

 let active = true;
 let createdBlobUrl = "";

 setLoading(true);
 setError("");
 setBlobUrl("");

 void fetchBackendDocumentBlob(documentUrl)
 .then((result) => {
 if (!active) {
 URL.revokeObjectURL(result.blobUrl);
 return;
 }

 createdBlobUrl = result.blobUrl;
 setBlobUrl(result.blobUrl);
 setContentType(result.contentType);
 })
 .catch(() => {
 if (active) {
 setError(
 "Unable to load this submitted document from the backend. Please try again.",
 );
 }
 })
 .finally(() => {
 if (active) setLoading(false);
 });

 return () => {
 active = false;
 if (createdBlobUrl) URL.revokeObjectURL(createdBlobUrl);
 };
 }, [documentUrl, open]);

 if (!open) return null;

 const isPdf =
 contentType.includes("pdf") ||
 documentUrl.toLowerCase().includes(".pdf");

 return (
 <div
 className="fixed inset-0 z-[100001] flex items-center bg-black/35 p-3 backdrop-blur-[2px] lg:right-[42rem] lg:justify-center lg:bg-black/20 lg:p-5"
 onMouseDown={onClose}
 >
 <div
 className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg dark:bg-[var(--card)]"
 onMouseDown={(event) => event.stopPropagation()}
 >
 <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 dark:border-border">
 <div className="min-w-0">
 <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
 Submitted Document
 </p>
 <h3 className="truncate text-base font-semibold text-[var(--foreground)]">
 {title}
 </h3>
 </div>

 <button
 type="button"
 onClick={onClose}
 className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-muted dark:border-border dark:hover:bg-card/5"
 aria-label="Close document preview"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={18} />
 </button>
 </div>

 <div className="min-h-[420px] flex-1 bg-muted p-3 dark:bg-black/20 sm:p-4">
 {loading ? (
 <div className="flex h-[68vh] flex-col items-center justify-center text-[var(--muted-foreground)]">
 <Spinner className="text-[var(--primary)]" size={28} />
 <p className="mt-3 text-sm">
 Loading submitted document from backend...
 </p>
 </div>
 ) : error ? (
 <div className="flex h-[68vh] flex-col items-center justify-center rounded-xl bg-card p-8 text-center dark:bg-muted">
 <HugeiconsIcon icon={File01Icon} size={36} className="text-[var(--muted-foreground)]" />
 <p className="mt-3 font-semibold text-[var(--foreground)]">
 Document preview unavailable
 </p>
 <p className="mt-1 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
 {error}
 </p>
 </div>
 ) : blobUrl && isPdf ? (
 <iframe
 src={blobUrl}
 title={title}
 className="h-[70vh] w-full rounded-lg bg-card"
 />
 ) : blobUrl ? (
 <div className="flex h-[70vh] items-center justify-center">
 <img
 src={blobUrl}
 alt={title}
 className="max-h-full max-w-full rounded-lg object-contain"
 />
 </div>
 ) : null}
 </div>

 <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3 dark:border-border">
 <p className="text-xs text-[var(--muted-foreground)]">
 Loaded from the backend using your authenticated session.
 </p>

 {blobUrl && (
 <a
 href={blobUrl}
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]"
 >
 <HugeiconsIcon icon={LinkSquare01Icon} size={14} />
 Open preview
 </a>
 )}
 </div>
 </div>
 </div>
 );
}
