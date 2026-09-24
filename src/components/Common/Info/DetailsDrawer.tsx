"use client";

import React, { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

type DetailsDrawerProps = {
 open: boolean;
 onClose: () => void;
 title: string;
 description?: string;
 children: React.ReactNode;
};

/**
 * Right-side drawer (bottom sheet on mobile) for moderately detailed
 * explanations · order breakdowns, status meanings, how-it-works content.
 */
export default function DetailsDrawer({
 open,
 onClose,
 title,
 description,
 children,
}: DetailsDrawerProps) {
 useEffect(() => {
 if (!open) return;
 const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
 document.addEventListener("keydown", onKey);
 document.body.style.overflow = "hidden";
 return () => {
 document.removeEventListener("keydown", onKey);
 document.body.style.overflow = "";
 };
 }, [open, onClose]);

 if (!open) return null;

 return (
 <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={title}>
 <button
 type="button"
 aria-label="Close details"
 onClick={onClose}
 className="absolute inset-0 bg-black/50"
 />
 <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl border border-border bg-card shadow-lg sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-none sm:w-[420px] sm:rounded-none sm:border-y-0 sm:border-r-0">
 <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
 <div className="min-w-0">
 <h2 className="text-base font-bold text-card-foreground">{title}</h2>
 {description ? (
 <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
 ) : null}
 </div>
 <button
 type="button"
 onClick={onClose}
 aria-label="Close"
 className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={18} />
 </button>
 </div>
 <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm leading-6 text-muted-foreground">
 {children}
 </div>
 </div>
 </div>
 );
}
