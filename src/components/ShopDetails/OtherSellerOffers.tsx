"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { useSimilarProducts } from "@/hooks/useProducts";
import { resolveProductImageUrl } from "@/lib/products/adapters";
import type { SimilarProductMatch } from "@/types/api/product";

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
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 9h16l-1-5H5L4 9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M5 9v10h14V9M8 19v-5h4v5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M15.5 13.5h4M17.5 11.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
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
      className="group w-full overflow-hidden rounded-2xl border border-[#c9d5e3] bg-white text-left shadow-[0_3px_14px_rgba(15,23,42,0.06)] transition hover:border-[#8ebcff] hover:shadow-[0_7px_22px_rgba(15,23,42,0.10)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-darkTheme-border-color dark:bg-darkTheme-card"
    >
      <span className="flex flex-wrap items-center justify-between gap-2.5 border-b border-gray-3 bg-[#f8fbff] px-3.5 py-3 dark:border-darkTheme-border-color dark:bg-white/[0.03] sm:px-4">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf4ff] text-blue shadow-sm dark:bg-blue/15">
            <SellerOffersIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-extrabold leading-5 text-dark dark:text-white">
              Other sellers on Xerin
            </span>
            <span className="mt-0.5 block text-[11px] font-semibold text-blue">
              Compare this product from different sellers
            </span>
          </span>
        </span>

        {count > 0 && (
          <span className="inline-flex shrink-0 items-center rounded-full bg-blue px-2.5 py-1 text-[10px] font-extrabold text-white">
            {offerCountLabel} offer{count === 1 ? "" : "s"}
          </span>
        )}
      </span>

      <span className="flex items-center gap-2.5 px-3.5 py-3.5 sm:px-4">
        <span className="min-w-0 flex-1">
          {isLoading ? (
            <span className="block text-sm font-semibold text-dark-4">Finding matching seller offers...</span>
          ) : count > 0 ? (
            <>
              <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-sm text-dark dark:text-white">
                <span className="font-medium">New ({offerCountLabel}) from</span>
                {lowestOffer ? (
                  <span className="text-base font-extrabold text-orange">
                    <PriceDisplay amount={lowestOffer.amount} sourceCurrency={lowestOffer.currency} />
                  </span>
                ) : (
                  <span className="font-extrabold text-orange">multiple prices</span>
                )}
              </span>

              <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-dark-4 dark:text-gray-5">
                <span className="inline-flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="m7.5 12 3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/>
                  </svg>
                  75%+ product match
                </span>
                <span>{inStockCount > 0 ? `${inStockCount} in stock` : "Check availability"}</span>
              </span>

              <span className="mt-1.5 block text-[11px] leading-4 text-dark-4 dark:text-gray-5">
                Compare prices, stock and key specifications before you choose a seller.
              </span>
            </>
          ) : (
            <>
              <span className="block text-sm font-bold text-dark dark:text-white">No matching offers yet</span>
              <span className="mt-1 block text-[11px] leading-4 text-dark-4">
                Matching products from other sellers will appear here when available.
              </span>
            </>
          )}
        </span>

        {count > 0 && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-3 text-dark transition group-hover:border-blue group-hover:bg-blue group-hover:text-white dark:border-darkTheme-border-color dark:text-white">
            <svg className="h-4 w-4 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </span>

      {count > 0 && (
        <span className="flex items-center gap-2 border-t border-gray-3 bg-[#fcfdff] px-4 py-2 text-[10px] font-semibold text-dark-4 dark:border-darkTheme-border-color dark:bg-white/[0.02]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3 5 6v5c0 4.6 2.8 7.8 7 10 4.2-2.2 7-5.4 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
            <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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

      <div className="relative z-10 max-h-[88vh] w-full overflow-hidden rounded-t-3xl border border-gray-3 bg-white shadow-2xl dark:border-darkTheme-border-color dark:bg-darkTheme-bg sm:max-w-[1040px] sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-3 px-4 py-4 dark:border-darkTheme-border-color sm:px-6 sm:py-5">
          <div>
            <div className="flex items-center gap-2 text-orange">
              <SellerOffersIcon />
              <span className="text-xs font-bold uppercase tracking-[0.12em]">Other seller offers</span>
            </div>
            <h2 id="other-seller-offers-title" className="mt-1 text-lg font-bold text-dark dark:text-white sm:text-xl">
              Similar offers for {productName}
            </h2>
            <p className="mt-1 text-xs leading-5 text-dark-4 sm:text-sm">
              {data.length > 0
                ? `${data.length >= 24 ? "24+" : data.length} matching seller offer${data.length === 1 ? "" : "s"} · at least a 75% weighted specification match.`
                : "Products from other sellers with at least a 75% weighted specification match."}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-3 text-dark transition hover:border-orange hover:text-orange dark:border-darkTheme-border-color dark:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="max-h-[calc(88vh-115px)] overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-gray-2 dark:bg-white/5" />)}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-red/20 bg-red/5 p-5 text-sm text-dark-4">
              We could not load other seller offers right now. Please try again.
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-2xl border border-gray-3 bg-[#fbfcfd] p-6 text-center dark:border-darkTheme-border-color dark:bg-darkTheme-card">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange/10 text-orange"><SellerOffersIcon /></div>
              <h3 className="mt-3 font-bold text-dark dark:text-white">No close seller match yet</h3>
              <p className="mt-1 text-sm text-dark-4">When another seller lists a product with matching specifications, it will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((match) => {
                const regular = Number(match.product.price || 0);
                const sale = match.product.sale_price == null ? null : Number(match.product.sale_price);
                const price = sale && sale > 0 && sale < regular ? sale : regular;
                const reasons = match.matched_attributes.filter((item) => item.match_strength >= 0.5).slice(0, 3);

                return (
                  <div key={String(match.product.id)} className="rounded-2xl border border-gray-3 bg-white p-3.5 transition hover:border-orange/50 hover:shadow-sm dark:border-darkTheme-border-color dark:bg-darkTheme-card">
                    <div className="flex gap-3">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f5f7fa] p-2 dark:bg-white/5">
                        <Image src={imageFor(match)} alt={match.product.name} fill className="object-contain p-2" sizes="96px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-orange/10 px-2 py-1 text-[10px] font-bold text-orange">{Math.round(match.similarity_score)}% match</span>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${match.in_stock ? "bg-green/10 text-green" : "bg-gray-2 text-dark-4 dark:bg-white/10"}`}>
                            {match.in_stock ? "In stock" : "Stock check"}
                          </span>
                        </div>
                        <h3 className="mt-2 line-clamp-2 text-sm font-bold text-dark dark:text-white">{match.product.name}</h3>
                        <div className="mt-1.5 text-base font-bold text-dark dark:text-white">
                          <PriceDisplay amount={price} sourceCurrency={match.product.currency} />
                        </div>
                      </div>
                    </div>

                    {reasons.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 gap-1.5 border-t border-gray-3 pt-3 text-[11px] text-dark-4 dark:border-darkTheme-border-color">
                        {reasons.map((reason) => (
                          <p key={reason.key} className="truncate">
                            <span className="font-semibold text-dark dark:text-white">{reason.name}:</span>{" "}
                            {valueText(reason.candidate_value)}{reason.unit ? ` ${reason.unit}` : ""}
                          </p>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/products/${match.product.id}`}
                      onClick={onClose}
                      className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-orange px-4 text-xs font-bold text-white transition hover:bg-[#e95f23]"
                    >
                      View this seller&apos;s offer
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
