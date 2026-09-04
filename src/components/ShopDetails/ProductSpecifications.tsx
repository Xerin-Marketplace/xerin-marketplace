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

export default function ProductSpecifications({ productId }: { productId: ID }) {
  const { data, isLoading, isError } = useProductSpecifications(productId);

  const specifications = useMemo(
    () => (data ?? [])
      .filter((spec) => !isEmptyValue(spec.value))
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.name.localeCompare(b.name)),
    [data],
  );

  if (isError) return null;

  if (isLoading) {
    return (
      <div className="mt-6 rounded-2xl border border-gray-3 bg-white p-5 shadow-sm dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:p-7 lg:p-8">
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
    <div className="mt-6 rounded-2xl border border-gray-3 bg-white p-5 shadow-sm dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:p-7 lg:p-8">
      <div className="flex items-start justify-between gap-4 border-b border-gray-3 pb-4 dark:border-darkTheme-border-color">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-orange" />
          <div>
            <h2 className="text-lg font-bold text-dark dark:text-white sm:text-xl">Product specifications</h2>
            <p className="mt-1 text-xs text-dark-4 sm:text-sm">Structured details provided for this product.</p>
          </div>
        </div>
        <span className="hidden rounded-full bg-orange/10 px-3 py-1 text-xs font-semibold text-orange sm:inline-flex">
          {specifications.length} {specifications.length === 1 ? "detail" : "details"}
        </span>
      </div>

      <dl className="mt-5 overflow-hidden rounded-xl border border-gray-3 dark:border-darkTheme-border-color">
        {specifications.map((spec, index) => (
          <div
            key={String(spec.id)}
            className={`grid gap-1 px-4 py-3.5 sm:grid-cols-[minmax(150px,0.75fr)_minmax(0,1.25fr)] sm:gap-6 sm:px-5 ${index !== specifications.length - 1 ? "border-b border-gray-3 dark:border-darkTheme-border-color" : ""} ${index % 2 === 0 ? "bg-[#fbfcfd] dark:bg-darkTheme-secondary-bg/40" : "bg-white dark:bg-darkTheme-card"}`}
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-dark-4 sm:text-sm sm:normal-case sm:tracking-normal">{spec.name}</dt>
            <dd className="break-words text-sm font-semibold text-dark dark:text-white sm:text-[15px]">{formatValue(spec)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
