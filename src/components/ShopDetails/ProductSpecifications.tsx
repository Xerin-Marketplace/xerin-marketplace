"use client";

import React, { useMemo } from "react";
import { useProductSpecifications } from "@/hooks/useProducts";
import type { ProductSpecification } from "@/types/api/product";
import type { ID } from "@/types/api/common";
import { HugeiconsIcon } from "@hugeicons/react";
import { CpuIcon, DatabaseIcon, SmartPhone01Icon, BatteryCharging01Icon, Wifi01Icon, Settings01Icon, PaintBoardIcon, Store01Icon, MaleSymbolIcon, BeakerIcon, File01Icon } from "@hugeicons/core-free-icons";

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
 return <HugeiconsIcon icon={CpuIcon} size={18} className="shrink-0" />;
 }
 if (/storage|disk|capacity/.test(text)) {
 return <HugeiconsIcon icon={DatabaseIcon} size={18} className="shrink-0" />;
 }
 if (/screen|display|inch/.test(text)) {
 return <HugeiconsIcon icon={SmartPhone01Icon} size={18} className="shrink-0" />;
 }
 if (/battery/.test(text)) {
 return <HugeiconsIcon icon={BatteryCharging01Icon} size={18} className="shrink-0" />;
 }
 if (/network|5g|4g|wifi|connect/.test(text)) {
 return <HugeiconsIcon icon={Wifi01Icon} size={18} className="shrink-0" />;
 }
 if (/operating|system|os|software/.test(text)) {
 return <HugeiconsIcon icon={Settings01Icon} size={18} className="shrink-0" />;
 }
 if (/colour|color/.test(text)) {
 return <HugeiconsIcon icon={PaintBoardIcon} size={18} className="shrink-0" />;
 }
 if (/brand|maker|manufacturer/.test(text)) {
 return <HugeiconsIcon icon={Store01Icon} size={18} className="shrink-0" />;
 }
 if (/model|phone|device/.test(text)) {
 return <HugeiconsIcon icon={SmartPhone01Icon} size={18} className="shrink-0" />;
 }
 if (/gender|women|men/.test(text)) {
 return <HugeiconsIcon icon={MaleSymbolIcon} size={18} className="shrink-0" />;
 }
 if (/ingredient|material|composition/.test(text)) {
 return <HugeiconsIcon icon={BeakerIcon} size={18} className="shrink-0" />;
 }

 return <HugeiconsIcon icon={File01Icon} size={18} className="shrink-0" />;
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
 <div className="mt-6 rounded-2xl border border-border bg-muted p-4 sm:p-5">
 <div className="mb-4 h-5 w-44 animate-pulse rounded bg-muted" />
 <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
 {[0, 1, 2, 3, 4, 5].map((item) => (
 <div key={item} className="h-[72px] animate-pulse rounded-lg bg-muted" />
 ))}
 </div>
 </div>
 );
 }

 if (specifications.length === 0) return null;

 const overviewSpecs = specifications.slice(0, overviewLimit);

 return (
 <div className="mt-6 rounded-2xl border border-border bg-muted p-4 sm:p-5">
 <div className="mb-4 flex items-center justify-between gap-3">
 <div className="flex min-w-0 items-center gap-2.5">
 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
 <HugeiconsIcon icon={File01Icon} size={18} className="shrink-0" />
 </span>
 <div className="min-w-0">
 <h2 className="text-sm font-bold text-foreground sm:text-base">Product specifications</h2>
 <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">Key details at a glance</p>
 </div>
 </div>
 <a href="#product-specifications" className="shrink-0 text-[11px] font-bold text-primary transition hover:underline sm:text-xs">
 View all
 </a>
 </div>

 <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
 {overviewSpecs.map((spec) => (
 <div key={String(spec.id)} className="flex min-h-[72px] items-start gap-2.5 rounded-lg border border-border bg-card p-3 sm:p-3.5">
 <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9">
 <SpecIcon spec={spec} />
 </span>
 <div className="min-w-0">
 <dt className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[11px]">{spec.name}</dt>
 <dd className="mt-1 line-clamp-2 break-words text-xs font-bold leading-4 text-foreground sm:text-sm">{formatValue(spec)}</dd>
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
 className={`scroll-mt-28 rounded-xl border border-border bg-card p-5 sm:p-7 lg:p-8 ${
 embedded ? "h-full shadow-[0_10px_35px_rgba(15,23,42,0.05)]" : "mt-6 shadow-sm"
 }`}
 >
 <div className="flex items-center gap-3 border-b border-border pb-4">
 <span className="h-6 w-1 rounded-full bg-primary" />
 <h2 className="text-lg font-bold text-foreground sm:text-xl">Product specifications</h2>
 </div>
 <div className="mt-5 grid gap-3 sm:grid-cols-2">
 {[0, 1, 2, 3].map((item) => (
 <div key={item} className="h-14 animate-pulse rounded-lg bg-muted" />
 ))}
 </div>
 </div>
 );
 }

 if (specifications.length === 0) return null;

 return (
 <div
 id="product-specifications"
 className={`scroll-mt-28 rounded-xl border border-border bg-card p-5 sm:p-7 lg:p-8 ${
 embedded ? "h-full shadow-[0_10px_35px_rgba(15,23,42,0.05)]" : "mt-6 shadow-sm"
 }`}
 >
 <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
 <div className="flex items-center gap-3">
 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
 <HugeiconsIcon icon={File01Icon} size={18} className="shrink-0" />
 </span>
 <div>
 <h2 className="text-lg font-bold text-foreground sm:text-xl">Product specifications</h2>
 <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Complete structured details provided for this product.</p>
 </div>
 </div>
 <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
 {specifications.length} {specifications.length === 1 ? "detail" : "details"}
 </span>
 </div>

 <dl className="mt-5 grid overflow-hidden rounded-lg border border-border sm:grid-cols-2">
 {specifications.map((spec, index) => (
 <div
 key={String(spec.id)}
 className={`flex min-h-[76px] items-start gap-3 border-border px-4 py-3.5 sm:px-5 ${index < specifications.length - (specifications.length % 2 || 2) ? "sm:border-b" : ""} ${index % 2 === 0 ? "sm:border-r" : ""} ${index !== specifications.length - 1 ? "border-b sm:border-b-0" : ""}`}
 >
 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
 <SpecIcon spec={spec} />
 </span>
 <div className="min-w-0">
 <dt className="text-xs font-semibold text-muted-foreground sm:text-sm">{spec.name}</dt>
 <dd className="mt-1 break-words text-sm font-bold text-foreground sm:text-[15px]">{formatValue(spec)}</dd>
 </div>
 </div>
 ))}
 </dl>
 </div>
 );
}
