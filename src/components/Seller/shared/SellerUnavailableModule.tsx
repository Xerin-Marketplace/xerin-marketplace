"use client";

import Link from "next/link";
import { ArrowLeft01Icon, DatabaseIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";

export type SellerUnavailableModuleProps = {
 title: string;
 description: string;
 icon: IconSvgElement;
 action?: string;
 backHref?: string;
 backLabel?: string;
};

export default function SellerUnavailableModule({
 title,
 description,
 icon: Icon,
 action = "This feature is not available yet.",
 backHref = "/seller/dashboard",
 backLabel = "Back to dashboard",
}: SellerUnavailableModuleProps) {
 return (
 <div className="mx-auto max-w-[1280px]">
 <div className="overflow-hidden rounded-xl border border-border bg-card text-center shadow-sm dark:border-border dark:bg-card">
 <div className="h-1 bg-primary" />
 <div className="p-6 sm:p-10 lg:p-12">
 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/10">
 <HugeiconsIcon icon={Icon} size={32} />
 </div>
 <p className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-primary"><HugeiconsIcon icon={DatabaseIcon} size={14} />Backend dependency</p>
 <h2 className="mt-2 text-2xl font-bold tracking-[-.02em]">{title}</h2>
 <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
 {description}
 </p>
 <p className="mx-auto mt-5 block max-w-2xl rounded-xl border border-dashed border-[var(--muted-foreground)] bg-muted px-5 py-3 text-xs leading-5 text-muted-foreground dark:border-white/15 dark:bg-card/[.03]">
 {action}
 </p>
 <div className="mt-6">
 <Link
 href={backHref}
 className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
 >
 <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
 {backLabel}
 </Link>
 </div>
 </div>
 </div>
 </div>
 );
}
