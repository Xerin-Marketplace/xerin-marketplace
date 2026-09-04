"use client";

import React, { useMemo } from "react";
import { useProductSpecifications } from "@/hooks/useProducts";
import type { ProductSpecification } from "@/types/api/product";
import type { ID } from "@/types/api/common";

const isEmptyValue = (value: unknown) => {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const formatValue = (spec: ProductSpecification) => {
  const { value, input_type: inputType, unit } = spec;

  let rendered: string;
  if (inputType === "boolean") {
    rendered = value === true || value === "true" || value === 1 || value === "1" ? "Yes" : "No";
  } else if (Array.isArray(value)) {
    rendered = value.map(String).filter(Boolean).join(", ");
  } else if (typeof value === "object" && value !== null) {
    rendered = Object.values(value).map(String).filter(Boolean).join(", ");
  } else {
    rendered = String(value ?? "").trim();
  }

  if (!unit || !rendered) return rendered;
  const normalizedRendered = rendered.toLocaleLowerCase();
  const normalizedUnit = unit.trim().toLocaleLowerCase();
  return normalizedRendered.endsWith(normalizedUnit) ? rendered : `${rendered} ${unit}`;
};

const SpecIcon = ({ spec }: { spec: ProductSpecification }) => {
  const text = `${spec.key} ${spec.name}`.toLowerCase();
  const common = "h-[18px] w-[18px] sm:h-5 sm:w-5";

  if (/ram|memory/.test(text)) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M8 10v4m4-4v4m4-4v4M7 4v3m5-3v3m5-3v3M7 17v3m5-3v3m5-3v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
  }
  if (/storage|disk|capacity/.test(text)) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3" stroke="currentColor" strokeWidth="1.7"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" stroke="currentColor" strokeWidth="1.7"/></svg>;
  }
  if (/screen|display|inch/.test(text)) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.7"/><path d="M10 18.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
  }
  if (/battery/.test(text)) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="5" width="11" height="14" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M9 2h5M10 9h3l-2 3h3l-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
  if (/network|5g|4g|wifi|connect/.test(text)) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 9.5a10.6 10.6 0 0 1 15 0M7.5 12.5a6.4 6.4 0 0 1 9 0M10.5 15.5a2.1 2.1 0 0 1 3 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="12" cy="18.3" r="1" fill="currentColor"/></svg>;
  }
  if (/operating|system|os|software/.test(text)) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
  }
  if (/colour|color/.test(text)) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 0-3.6h-.7a1.7 1.7 0 0 1 0-3.4H15a6 6 0 0 0 0-12h-3Z" stroke="currentColor" strokeWidth="1.7"/><circle cx="8" cy="9" r="1" fill="currentColor"/><circle cx="11" cy="6.5" r="1" fill="currentColor"/><circle cx="7.5" cy="13" r="1" fill="currentColor"/></svg>;
  }
  if (/brand|maker|manufacturer/.test(text)) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9h16l-1-5H5L4 9Zm1 0v11h14V9M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>;
  }
  if (/model|phone|device/.test(text)) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.7"/><path d="M10 5h4m-3 13.5h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
  }
  if (/gender|women|men/.test(text)) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="5" stroke="currentColor" strokeWidth="1.7"/><path d="M13.5 6.5 19 3m0 0v4m0-4h-4M10 15v6m-3-3h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
  }
  if (/ingredient|material|composition/.test(text)) {
    return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3h8M9 3v5l-4 8a3.5 3.5 0 0 0 3.1 5h7.8A3.5 3.5 0 0 0 19 16l-4-8V3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 15h9" stroke="currentColor" strokeWidth="1.7"/></svg>;
  }

  return <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h8l4 4v14H7V3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M15 3v5h4M10 12h6m-6 4h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
};

type ProductSpecificationsProps = {
  productId: ID;
  variant?: "full" | "overview";
  overviewLimit?: number;
  embedded?: boolean;
};

export default function ProductSpecifications({
  productId,
  variant = "full",
  overviewLimit = 6,
  embedded = false,
}: ProductSpecificationsProps) {
  const { data, isLoading, isError } = useProductSpecifications(productId);

  const specifications = useMemo(
    () => (data ?? [])
      .filter((spec) => !isEmptyValue(spec.value))
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.name.localeCompare(b.name)),
    [data],
  );

  if (isError) return null;

  if (variant === "overview") {
    if (isLoading) {
      return (
        <div className="mt-6 rounded-2xl border border-gray-3 bg-[#fbfcfd] p-4 dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:p-5">
          <div className="mb-4 h-5 w-44 animate-pulse rounded bg-gray-2 dark:bg-darkTheme-secondary-bg" />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-[72px] animate-pulse rounded-xl bg-gray-2 dark:bg-darkTheme-secondary-bg" />
            ))}
          </div>
        </div>
      );
    }

    if (specifications.length === 0) return null;

    const overviewSpecs = specifications.slice(0, overviewLimit);

    return (
      <div className="mt-6 rounded-2xl border border-gray-3 bg-[#fbfcfd] p-4 dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h8l4 4v14H7V3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M15 3v5h4M10 12h6m-6 4h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-dark dark:text-white sm:text-base">Product specifications</h2>
              <p className="mt-0.5 text-[11px] text-dark-4 sm:text-xs">Key details at a glance</p>
            </div>
          </div>
          <a href="#product-specifications" className="shrink-0 text-[11px] font-bold text-orange transition hover:underline sm:text-xs">
            View all
          </a>
        </div>

        <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {overviewSpecs.map((spec) => (
            <div key={String(spec.id)} className="flex min-h-[72px] items-start gap-2.5 rounded-xl border border-gray-3 bg-white p-3 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg sm:p-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange/10 text-orange sm:h-9 sm:w-9">
                <SpecIcon spec={spec} />
              </span>
              <div className="min-w-0">
                <dt className="truncate text-[10px] font-semibold uppercase tracking-wide text-dark-4 sm:text-[11px]">{spec.name}</dt>
                <dd className="mt-1 line-clamp-2 break-words text-xs font-bold leading-4 text-dark dark:text-white sm:text-sm">{formatValue(spec)}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        id="product-specifications"
        className={`scroll-mt-28 rounded-3xl border border-gray-3 bg-white p-5 dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:p-7 lg:p-8 ${
          embedded ? "h-full shadow-[0_10px_35px_rgba(15,23,42,0.05)]" : "mt-6 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-gray-3 pb-4 dark:border-darkTheme-border-color">
          <span className="h-6 w-1 rounded-full bg-orange" />
          <h2 className="text-lg font-bold text-dark dark:text-white sm:text-xl">Product specifications</h2>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-14 animate-pulse rounded-xl bg-gray-2 dark:bg-darkTheme-secondary-bg" />
          ))}
        </div>
      </div>
    );
  }

  if (specifications.length === 0) return null;

  return (
    <div
      id="product-specifications"
      className={`scroll-mt-28 rounded-3xl border border-gray-3 bg-white p-5 dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:p-7 lg:p-8 ${
        embedded ? "h-full shadow-[0_10px_35px_rgba(15,23,42,0.05)]" : "mt-6 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-gray-3 pb-4 dark:border-darkTheme-border-color">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h8l4 4v14H7V3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M15 3v5h4M10 12h6m-6 4h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
          </span>
          <div>
            <h2 className="text-lg font-bold text-dark dark:text-white sm:text-xl">Product specifications</h2>
            <p className="mt-1 text-xs text-dark-4 sm:text-sm">Complete structured details provided for this product.</p>
          </div>
        </div>
        <span className="hidden rounded-full bg-orange/10 px-3 py-1 text-xs font-semibold text-orange sm:inline-flex">
          {specifications.length} {specifications.length === 1 ? "detail" : "details"}
        </span>
      </div>

      <dl className="mt-5 grid overflow-hidden rounded-xl border border-gray-3 dark:border-darkTheme-border-color sm:grid-cols-2">
        {specifications.map((spec, index) => (
          <div
            key={String(spec.id)}
            className={`flex min-h-[76px] items-start gap-3 border-gray-3 px-4 py-3.5 dark:border-darkTheme-border-color sm:px-5 ${index < specifications.length - (specifications.length % 2 || 2) ? "sm:border-b" : ""} ${index % 2 === 0 ? "sm:border-r" : ""} ${index !== specifications.length - 1 ? "border-b sm:border-b-0" : ""}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-2 text-orange dark:bg-darkTheme-secondary-bg">
              <SpecIcon spec={spec} />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-semibold text-dark-4 sm:text-sm">{spec.name}</dt>
              <dd className="mt-1 break-words text-sm font-bold text-dark dark:text-white sm:text-[15px]">{formatValue(spec)}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
