"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";
import PriceDisplay from "@/components/shared/PriceDisplay";
import type { Product as ApiProduct } from "@/types/api/product";

function useCountdown(hours: number) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date();
    target.setHours(target.getHours() + hours);
    target.setMinutes(0, 0, 0);

    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [hours]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return { hours: pad(timeLeft.hours), minutes: pad(timeLeft.minutes), seconds: pad(timeLeft.seconds) };
}

function DealCard({ product }: { product: ApiProduct }) {
  const uiProduct = mapApiProductToUiProduct(product);
  const imageUrl = uiProduct.imgs?.previews?.[0] ?? "/images/products/placeholder.svg";
  const regularPrice = Number(product.price || 0);
  const salePrice = product.sale_price ? Number(product.sale_price) : null;
  const hasDiscount = salePrice !== null && salePrice > 0 && salePrice < regularPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((regularPrice - salePrice!) / regularPrice) * 100)
    : 0;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm transition duration-300 hover:shadow-lg dark:border-red-500/20 dark:bg-darkTheme-card sm:hover:-translate-y-1">
      <Link
        href={`/products/${product.id}`}
        className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 p-3 dark:from-red-500/5 dark:to-orange-500/5 sm:h-52 sm:aspect-auto sm:p-5"
      >
        {hasDiscount && (
          <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md sm:text-xs">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
            -{discountPercentage}%
          </span>
        )}
        <Image
          src={imageUrl}
          alt={product.name}
          width={240}
          height={240}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-[18px] text-dark transition group-hover:text-red-500 dark:text-white sm:min-h-[42px] sm:text-sm sm:leading-5">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        <div className="mt-2 flex items-end justify-between gap-2 border-t border-gray-3 pt-2 dark:border-darkTheme-border-color sm:pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-base font-extrabold text-red-500 dark:text-red-400 sm:text-lg">
              <PriceDisplay amount={hasDiscount ? salePrice! : regularPrice} sourceCurrency={product.currency} />
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-dark-4 line-through sm:text-xs">
                <PriceDisplay amount={regularPrice} sourceCurrency={product.currency} />
              </span>
            )}
          </div>
          <Link
            href={`/products/${product.id}`}
            className="flex h-8 shrink-0 items-center justify-center rounded-full bg-red-500 px-3 text-[11px] font-bold text-white transition hover:bg-red-600 sm:h-9 sm:px-4 sm:text-xs"
          >
            Grab it
          </Link>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm dark:border-red-500/20 dark:bg-darkTheme-card">
      <div className="aspect-square animate-pulse bg-red-50 dark:bg-red-500/5 sm:h-52 sm:aspect-auto" />
      <div className="space-y-2 p-3 sm:p-4">
        <div className="h-3 w-4/5 animate-pulse rounded bg-gray-2 dark:bg-darkTheme-secondary-bg" />
        <div className="h-5 w-2/5 animate-pulse rounded bg-gray-2 dark:bg-darkTheme-secondary-bg" />
      </div>
    </div>
  );
}

const FlashDeals = () => {
  const { data: products = [], isLoading, isError } = useProducts({ limit: 30 });
  const { hours, minutes, seconds } = useCountdown(12);

  const deals = React.useMemo(() => {
    if (!products.length) return [];
    return products
      .filter((p) => p.is_active && p.status === "approved" && p.sale_price && Number(p.sale_price) > 0)
      .sort((a, b) => {
        const pctA = a.sale_price ? 1 - Number(a.sale_price) / Number(a.price || 1) : 0;
        const pctB = b.sale_price ? 1 - Number(b.sale_price) / Number(b.price || 1) : 0;
        return pctB - pctA;
      })
      .slice(0, 10);
  }, [products]);

  const [current, setCurrent] = useState(0);

  const goTo = useCallback((index: number) => {
    setCurrent((index + deals.length) % deals.length);
  }, [deals.length]);

  useEffect(() => {
    if (deals.length <= 1) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % deals.length), 4000);
    return () => clearInterval(timer);
  }, [deals.length]);

  if (isError || (!isLoading && deals.length === 0)) return null;

  return (
    <section className="overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-white dark:from-red-500/5 dark:via-orange-500/5 dark:to-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 py-10 lg:py-14 lg:px-6">
        {/* Header with countdown */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                </svg>
                Flash Deals
              </span>
              <span className="text-xs font-medium text-red-400 dark:text-red-300">
                Ends in
              </span>
              <div className="flex items-center gap-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-xs font-bold text-white dark:bg-white dark:text-gray-900 sm:h-8 sm:w-8">
                  {hours}
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">:</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-xs font-bold text-white dark:bg-white dark:text-gray-900 sm:h-8 sm:w-8">
                  {minutes}
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">:</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-xs font-bold text-white dark:bg-white dark:text-gray-900 sm:h-8 sm:w-8">
                  {seconds}
                </span>
              </div>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
              Limited-time mega discounts
            </h2>
            <p className="mt-1.5 hidden max-w-lg text-sm text-gray-500 dark:text-gray-400 sm:block">
              Hurry up! These deals expire when the timer hits zero. Up to 70% off selected products.
            </p>
          </div>

          <Link
            href="/shop-with-sidebar"
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 dark:bg-white dark:text-gray-900 dark:hover:bg-red-500 dark:hover:text-white sm:inline-flex"
          >
            See all deals
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mobile: single product carousel */}
        {isLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-4 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[200px] shrink-0">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden sm:hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {deals.map((product) => (
                <div key={String(product.id)} className="w-full flex-shrink-0 px-1">
                  <DealCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop: grid */}
        <div className="hidden gap-5 sm:grid sm:grid-cols-3 lg:grid-cols-5">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : deals.slice(0, 5).map((product) => (
                <DealCard key={String(product.id)} product={product} />
              ))}
        </div>

        {/* Mobile "See all" button */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/shop-with-sidebar"
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            See all deals
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FlashDeals;
