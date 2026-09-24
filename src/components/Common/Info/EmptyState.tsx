"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { InformationSquareIcon } from "@hugeicons/core-free-icons";

type EmptyStateProps = {
 icon?: IconSvgElement;
 title: string;
 /** What appears here / why it's empty · teaches the user. */
 hint: string;
 actionLabel?: string;
 actionHref?: string;
 onAction?: () => void;
};

/** Plain, human empty state · no card chrome, just guidance. */
export default function EmptyState({
 icon = InformationSquareIcon,
 title,
 hint,
 actionLabel,
 actionHref,
 onAction,
}: EmptyStateProps) {
 return (
 <div className="flex flex-col items-center px-6 py-14 text-center">
 <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
 <HugeiconsIcon icon={icon} size={22} />
 </span>
 <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
 <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">{hint}</p>
 {actionLabel ? (
 actionHref ? (
 <Link
 href={actionHref}
 className="mt-5 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
 >
 {actionLabel}
 </Link>
 ) : (
 <button
 type="button"
 onClick={onAction}
 className="mt-5 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
 >
 {actionLabel}
 </button>
 )
 ) : null}
 </div>
 );
}
