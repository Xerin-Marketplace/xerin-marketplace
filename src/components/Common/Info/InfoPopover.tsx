"use client";

import React, { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon, Cancel01Icon } from "@hugeicons/core-free-icons";

type InfoPopoverProps = {
 title: string;
 children: React.ReactNode;
 /** "icon" renders a subtle ? chip; "link" renders a Learn-more style text link. */
 trigger?: "icon" | "link";
 triggerLabel?: string;
 align?: "start" | "end";
};

/**
 * Small contextual explanation. Click to open, ESC/backdrop to close.
 * For short explanations only · use DetailsDrawer for longer content.
 */
export default function InfoPopover({
 title,
 children,
 trigger = "icon",
 triggerLabel = "Learn more",
 align = "start",
}: InfoPopoverProps) {
 const [open, setOpen] = useState(false);
 const ref = useRef<HTMLDivElement | null>(null);

 useEffect(() => {
 if (!open) return;
 const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
 const onClick = (e: MouseEvent) => {
 if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
 };
 document.addEventListener("keydown", onKey);
 document.addEventListener("mousedown", onClick);
 return () => {
 document.removeEventListener("keydown", onKey);
 document.removeEventListener("mousedown", onClick);
 };
 }, [open]);

 return (
 <div ref={ref} className="relative inline-flex">
 {trigger === "icon" ? (
 <button
 type="button"
 onClick={() => setOpen((v) => !v)}
 aria-label={triggerLabel}
 aria-expanded={open}
 className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-primary"
 >
 <HugeiconsIcon icon={InformationCircleIcon} size={15} />
 </button>
 ) : (
 <button
 type="button"
 onClick={() => setOpen((v) => !v)}
 aria-expanded={open}
 className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 transition hover:underline"
 >
 {triggerLabel}
 </button>
 )}

 {open && (
 <div
 role="dialog"
 aria-label={title}
 className={`absolute bottom-[calc(100%+8px)] z-50 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-popover p-4 text-left shadow-md ${
 align === "end" ? "right-0" : "left-0"
 }`}
 >
 <div className="flex items-start justify-between gap-2">
 <p className="text-xs font-bold uppercase tracking-wide text-popover-foreground">{title}</p>
 <button
 type="button"
 onClick={() => setOpen(false)}
 aria-label="Close"
 className="rounded-md p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={14} />
 </button>
 </div>
 <div className="mt-2 space-y-2 text-xs leading-5 text-muted-foreground">{children}</div>
 </div>
 )}
 </div>
 );
}
