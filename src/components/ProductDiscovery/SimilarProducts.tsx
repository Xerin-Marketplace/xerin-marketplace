"use client";

import Image from "next/image";
import Link from "next/link";
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

const displayValue = (value: unknown) => {
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value == null) return "";
  return String(value);
};

export default function SimilarProducts({ productId }: { productId: string }) {
  const { data = [], isLoading, isError } = useSimilarProducts(productId, 75, 8);

  if (isError) return null;

  if (isLoading) {
    return (
      <section className="mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8 xl:px-4">
        <div className="rounded-3xl border border-gray-3 bg-white p-5 dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:p-7">
          <div className="h-7 w-64 animate-pulse rounded bg-gray-3 dark:bg-white/10" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-[310px] animate-pulse rounded-2xl bg-gray-2 dark:bg-white/5" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (data.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8 xl:px-4">
      <div className="relative overflow-hidden rounded-3xl border border-[#ffd8c3] bg-gradient-to-br from-white via-white to-[#fff7f2] p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] dark:border-orange/20 dark:from-darkTheme-card dark:via-darkTheme-card dark:to-orange/[0.05] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange/[0.07]" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange text-white shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 9h16l-1-5H5L4 9Zm1 0v11h14V9M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
              </svg>
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange">Compare marketplace offers</span>
              <h2 className="mt-1 text-xl font-extrabold text-dark dark:text-white sm:text-2xl">Similar products from other sellers</h2>
              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-dark-4">
                Strong alternatives with a 75%+ weighted specification match, so you can compare price, stock and product details confidently.
              </p>
            </div>
          </div>
          <span className="rounded-full border border-orange/20 bg-white px-3 py-1.5 text-xs font-bold text-orange shadow-sm dark:bg-darkTheme-card">
            {data.length} matched offer{data.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="relative mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((match) => {
            const regular = Number(match.product.price || 0);
            const sale = match.product.sale_price == null ? null : Number(match.product.sale_price);
            const price = sale && sale > 0 && sale < regular ? sale : regular;
            const reasons = match.matched_attributes.filter((item) => item.match_strength >= 0.5).slice(0, 3);

            return (
              <Link
                key={String(match.product.id)}
                href={`/products/${match.product.id}`}
                className="group overflow-hidden rounded-2xl border border-gray-3 bg-white p-3.5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange/40 hover:shadow-lg dark:border-white/10 dark:bg-darkTheme-card"
              >
                <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl bg-[#f7f8fa] p-3 dark:bg-white/5">
                  <Image
                    src={imageFor(match)}
                    alt={match.product.name}
                    width={180}
                    height={180}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-orange px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
                    {Math.round(match.similarity_score)}% match
                  </span>
                  <span className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold ${match.in_stock ? "bg-green/10 text-green" : "bg-gray-3 text-dark-4 dark:bg-white/10"}`}>
                    {match.in_stock ? "In stock" : "Stock check"}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 min-h-[40px] text-sm font-bold text-dark dark:text-white">
                  {match.product.name}
                </p>
                <p className="mt-2 text-base font-extrabold text-dark dark:text-white">
                  <PriceDisplay amount={price} sourceCurrency={match.product.currency} />
                </p>

                {reasons.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-gray-3 pt-3 text-[11px] text-dark-4 dark:border-white/10">
                    {reasons.map((reason) => (
                      <p key={reason.key} className="line-clamp-1">
                        <span className="font-bold text-dark dark:text-white">{reason.name}:</span>{" "}
                        {displayValue(reason.candidate_value)}{reason.unit ? ` ${reason.unit}` : ""}
                      </p>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs font-bold text-orange">
                  <span>View this offer</span>
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
