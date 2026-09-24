"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";

function getVisiblePages(current: number, totalPages: number): (number | "...")[] {
 if (totalPages <= 7) {
 return Array.from({ length: totalPages }, (_, i) => i + 1);
 }

 const pages: (number | "...")[] = [1];

 if (current > 3) pages.push("...");

 const start = Math.max(2, current - 1);
 const end = Math.min(totalPages - 1, current + 1);

 for (let i = start; i <= end; i++) pages.push(i);

 if (current < totalPages - 2) pages.push("...");
 pages.push(totalPages);

 return pages;
}

export interface PaginationProps {
 page: number;
 totalPages: number;
 total: number;
 pageSize?: number;
 onPageChange: (page: number) => void;
 onPageSizeChange?: (size: number) => void;
 pageSizeOptions?: number[];
 showSummary?: boolean;
 className?: string;
}

export default function Pagination({
 page,
 totalPages,
 total,
 pageSize,
 onPageChange,
 onPageSizeChange,
 pageSizeOptions = [10, 20, 50, 100],
 showSummary = true,
 className,
}: PaginationProps) {
 const safeTotalPages = Math.max(totalPages, 1);
 const from = total ? (page - 1) * (pageSize || 0) + 1 : 0;
 const to = Math.min(page * (pageSize || 0), total);
 const visiblePages = getVisiblePages(page, safeTotalPages);

 const baseBtn =
 "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

 const pageBtnActive =
 "border-primary bg-primary text-primary-foreground hover:bg-primary/90";

 const pageBtnIdle =
 "border-border bg-card text-foreground hover:bg-muted";

 return (
 <div
 className={`flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${className || ""}`}
 >
 {showSummary && (
 <p className="text-sm text-muted-foreground">
 Showing <b className="text-foreground">{from}-{to}</b> of{" "}
 <b className="text-foreground">{total}</b>
 </p>
 )}

 <div className="flex flex-wrap items-center gap-2">
 {onPageSizeChange && pageSize && (
 <select
 value={pageSize}
 onChange={(e) => onPageSizeChange(Number(e.target.value))}
 className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none"
 >
 {pageSizeOptions.map((size) => (
 <option key={size} value={size}>
 {size} / page
 </option>
 ))}
 </select>
 )}

 <button
 type="button"
 disabled={page <= 1}
 onClick={() => onPageChange(page - 1)}
 aria-label="Go to previous page"
 className={`${baseBtn} ${pageBtnIdle}`}
 >
 <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
 <span className="hidden sm:inline">Previous</span>
 </button>

 <div className="flex items-center gap-1">
 {visiblePages.map((p, idx) =>
 p === "..." ? (
 <span
 key={`ellipsis-${idx}`}
 className="flex h-9 w-9 items-center justify-center text-muted-foreground"
 >
 <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
 </span>
 ) : (
 <button
 key={p}
 type="button"
 onClick={() => onPageChange(p)}
 aria-label={`Go to page ${p}`}
 aria-current={p === page ? "page" : undefined}
 className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors ${
 p === page ? pageBtnActive : pageBtnIdle
 }`}
 >
 {p}
 </button>
 ),
 )}
 </div>

 <button
 type="button"
 disabled={page >= safeTotalPages}
 onClick={() => onPageChange(page + 1)}
 aria-label="Go to next page"
 className={`${baseBtn} ${pageBtnIdle}`}
 >
 <span className="hidden sm:inline">Next</span>
 <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
 </button>
 </div>
 </div>
 );
}
