"use client";

import Link from "next/link";
import { ArrowLeft, DatabaseZap, type LucideIcon } from "lucide-react";

export type SellerUnavailableModuleProps = {
  title: string;
  description: string;
  icon: LucideIcon;
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
      <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white text-center shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
        <div className="h-1 bg-gradient-to-r from-[#f47524] via-[#f7941d] to-transparent" />
        <div className="p-6 sm:p-10 lg:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#f7941d] dark:bg-orange-500/10">
          <Icon size={32} />
        </div>
        <p className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#f47524]"><DatabaseZap size={13} />Backend dependency</p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-.02em]">{title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#64748b]">
          {description}
        </p>
        <p className="mx-auto mt-5 block max-w-2xl rounded-xl border border-dashed border-[#cbd5e1] bg-slate-50 px-5 py-3 text-xs leading-5 text-[#64748b] dark:border-white/15 dark:bg-white/[.03]">
          {action}
        </p>
        <div className="mt-6">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2d3134] px-5 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
