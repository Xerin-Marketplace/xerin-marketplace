"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { useSimilarProducts } from "@/hooks/useProducts";
import { resolveProductImageUrl } from "@/lib/products/adapters";
import type { SimilarProductMatch } from "@/types/api/product";
import { HugeiconsIcon } from "@hugeicons/react";
import { Store01Icon, CheckIcon, ShieldCheckIcon, Cancel01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

const PLACEHOLDER = "/images/products/placeholder.svg";

const imageFor = (match: SimilarProductMatch) => {
 const images = match.product.images ?? [];
 const image = images.find((item) => item.is_primary) ?? images[0];
 return image?.image_url ? resolveProductImageUrl(image.image_url) : PLACEHOLDER;
};

const valueText = (value: unknown) => {
 if (Array.isArray(value)) return value.map(String).join(", ");
 if (typeof value === "boolean") return value ? "Yes" : "No";
 if (value == null) return "";
 return String(value);
};

const SellerOffersIcon = ({ className = "" }: { className?: string }) => (
 <HugeiconsIcon icon={Store01Icon} size={20} />
);

export function OtherSellerOffersButton({
 productId,
 onOpen,
}: {
 productId: string;
 onOpen: () => void;
}) {
 const { data = [], isLoading } = useSimilarProducts(productId, 75, 24);
 const count = data.length;
 const reachedOfferLimit = count >= 24;
 const offerCountLabel = reachedOfferLimit ? "24+" : String(count);

 const matches = data as SimilarProductMatch[];

 const lowestOffer = matches.reduce(
 (
 lowest: { amount: number; currency?: string } | null,
 match: SimilarProductMatch,
 ) => {
 const regular = Number(match.product.price || 0);
 const sale =
 match.product.sale_price == null
 ? null
 : Number(match.product.sale_price);
 const amount = sale && sale > 0 && sale < regular ? sale : regular;

 if (!Number.isFinite(amount) || amount <= 0) return lowest;

 if (!lowest || amount < lowest.amount) {
 return { amount, currency: match.product.currency };
 }

 return lowest;
 },
 null as { amount: number; currency?: string } | null,
 );

 const inStockCount = data.filter((match) => match.in_stock).length;

 return (
 <button
 type="button"
 onClick={onOpen}
 disabled={isLoading || count === 0}
 aria-label="View other sellers on Xerin"
 title={
 count > 0
 ? `Compare ${offerCountLabel} matching offer${count === 1 ? "" : "s"} from other sellers`
 : "No matching seller offers yet"
 }
 className="group w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition hover:border-border hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
 >
 <span className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border bg-muted px-3.5 py-3 dark:bg-card/[0.03] sm:px-4">
 <span className="flex min-w-0 items-center gap-2.5">
 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary shadow-sm dark:bg-primary/15">
 <SellerOffersIcon className="h-5 w-5" />
 </span>
 <span className="min-w-0">
 <span className="block text-[15px] font-extrabold leading-5 text-foreground">
 Other sellers on Xerin
 </span>
 <span className="mt-0.5 block text-[11px] font-semibold text-primary">
 Compare this product from different sellers
 </span>
 </span>
 </span>

 {count > 0 && (
 <span className="inline-flex shrink-0 items-center rounded-full bg-primary px-2.5 py-1 text-[10px] font-extrabold text-primary-foreground">
 {offerCountLabel} offer{count === 1 ? "" : "s"}
 </span>
 )}
 </span>

 <span className="flex items-center gap-2.5 px-3.5 py-3.5 sm:px-4">
 <span className="min-w-0 flex-1">
 {isLoading ? (
 <span className="block text-sm font-semibold text-muted-foreground">Finding matching seller offers...</span>
 ) : count > 0 ? (
 <>
 <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-sm text-foreground">
 <span className="font-medium">New ({offerCountLabel}) from</span>
 {lowestOffer ? (
 <span className="text-base font-extrabold text-primary">
 <PriceDisplay amount={lowestOffer.amount} sourceCurrency={lowestOffer.currency} />
 </span>
 ) : (
 <span className="font-extrabold text-primary">multiple prices</span>
 )}
 </span>

 <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-muted-foreground dark:text-muted-foreground">
 <span className="inline-flex items-center gap-1">
 <HugeiconsIcon icon={CheckIcon} size={14} />
 75%+ product match
 </span>
 <span>{inStockCount > 0 ? `${inStockCount} in stock` : "Check availability"}</span>
 </span>

 <span className="mt-1.5 block text-[11px] leading-4 text-muted-foreground dark:text-muted-foreground">
 Compare prices, stock and key specifications before you choose a seller.
 </span>
 </>
 ) : (
 <>
 <span className="block text-sm font-bold text-foreground">No matching offers yet</span>
 <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">
 Matching products from other sellers will appear here when available.
 </span>
 </>
 )}
 </span>

 {count > 0 && (
 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
 <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
 </span>
 )}
 </span>

 {count > 0 && (
 <span className="flex items-center gap-2 border-t border-border bg-muted px-4 py-2 text-[10px] font-semibold text-muted-foreground dark:bg-card/[0.02]">
 <HugeiconsIcon icon={ShieldCheckIcon} size={14} />
 Shop with confidence through Xerin secure checkout and order tracking
 </span>
 )}
 </button>
 );
}

export default function OtherSellerOffersModal({
 productId,
 productName,
 open,
 onClose,
}: {
 productId: string;
 productName: string;
 open: boolean;
 onClose: () => void;
}) {
 const { data = [], isLoading, isError } = useSimilarProducts(productId, 75, 24);

 useEffect(() => {
 if (!open) return;
 const previous = document.body.style.overflow;
 document.body.style.overflow = "hidden";
 const handleKeyDown = (event: KeyboardEvent) => {
 if (event.key === "Escape") onClose();
 };
 window.addEventListener("keydown", handleKeyDown);
 return () => {
 document.body.style.overflow = previous;
 window.removeEventListener("keydown", handleKeyDown);
 };
 }, [open, onClose]);

 if (!open) return null;

 return (
 <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="other-seller-offers-title">
 <button type="button" aria-label="Close other seller offers" className="absolute inset-0 cursor-default" onClick={onClose} />

 <div className="relative z-10 max-h-[88vh] w-full overflow-hidden rounded-t-xl border border-border bg-card shadow-lg sm:max-w-[1040px] sm:rounded-xl">
 <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-6 sm:py-5">
 <div>
 <div className="flex items-center gap-2 text-primary">
 <SellerOffersIcon />
 <span className="text-xs font-bold uppercase tracking-[0.12em]">Other seller offers</span>
 </div>
 <h2 id="other-seller-offers-title" className="mt-1 text-lg font-bold text-foreground sm:text-xl">
 Similar offers for {productName}
 </h2>
 <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
 {data.length > 0
 ? `${data.length >= 24 ? "24+" : data.length} matching seller offer${data.length === 1 ? "" : "s"} · at least a 75% weighted specification match.`
 : "Products from other sellers with at least a 75% weighted specification match."}
 </p>
 </div>
 <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition hover:border-primary hover:text-primary">
 <HugeiconsIcon icon={Cancel01Icon} size={18} />
 </button>
 </div>

 <div className="max-h-[calc(88vh-115px)] overflow-y-auto p-4 sm:p-6">
 {isLoading ? (
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
 {[0, 1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-muted" />)}
 </div>
 ) : isError ? (
 <div className="rounded-2xl border border-red/20 bg-red/5 p-5 text-sm text-muted-foreground">
 We could not load other seller offers right now. Please try again.
 </div>
 ) : data.length === 0 ? (
 <div className="rounded-2xl border border-border bg-muted p-6 text-center">
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><SellerOffersIcon /></div>
 <h3 className="mt-3 font-bold text-foreground">No close seller match yet</h3>
 <p className="mt-1 text-sm text-muted-foreground">When another seller lists a product with matching specifications, it will appear here.</p>
 </div>
 ) : (
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
 {data.map((match) => {
 const regular = Number(match.product.price || 0);
 const sale = match.product.sale_price == null ? null : Number(match.product.sale_price);
 const price = sale && sale > 0 && sale < regular ? sale : regular;
 const reasons = match.matched_attributes.filter((item) => item.match_strength >= 0.5).slice(0, 3);

 return (
 <div key={String(match.product.id)} className="rounded-2xl border border-border bg-card p-3.5 transition hover:border-primary/50 hover:shadow-sm">
 <div className="flex gap-3">
 <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted p-2">
 <Image src={imageFor(match)} alt={match.product.name} fill className="object-contain p-2" sizes="96px" />
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-1.5">
 <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{Math.round(match.similarity_score)}% match</span>
 <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${match.in_stock ? "bg-green/10 text-green" : "bg-muted text-muted-foreground dark:bg-card/10"}`}>
 {match.in_stock ? "In stock" : "Stock check"}
 </span>
 </div>
 <h3 className="mt-2 line-clamp-2 text-sm font-bold text-foreground">{match.product.name}</h3>
 <div className="mt-1.5 text-base font-bold text-foreground">
 <PriceDisplay amount={price} sourceCurrency={match.product.currency} />
 </div>
 </div>
 </div>

 {reasons.length > 0 && (
 <div className="mt-3 grid grid-cols-1 gap-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
 {reasons.map((reason) => (
 <p key={reason.key} className="truncate">
 <span className="font-semibold text-foreground">{reason.name}:</span>{" "}
 {valueText(reason.candidate_value)}{reason.unit ? ` ${reason.unit}` : ""}
 </p>
 ))}
 </div>
 )}

 <Link
 href={`/products/${match.product.id}`}
 onClick={onClose}
 className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:bg-[var(--primary)]"
 >
 View this seller&apos;s offer
 <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
 </Link>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
