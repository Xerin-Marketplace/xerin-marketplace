"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";
import PriceDisplay from "@/components/shared/PriceDisplay";
import type { Product as ApiProduct } from "@/types/api/product";

function BestSellerCard({ product, rank }: { product: ApiProduct; rank: number }) {
  const uiProduct = mapApiProductToUiProduct(product);
  const imageUrl = uiProduct.imgs?.previews?.[0] ?? "/images/products/placeholder.svg";
  const regularPrice = Number(product.price || 0);
  const salePrice = product.sale_price ? Number(product.sale_price) : null;
  const hasDiscount = salePrice !== null && salePrice > 0 && salePrice < regularPrice;

  const badgeColors = [
    "bg-gradient-to-br from-yellow-400 to-orange-500 text-white",
    "bg-gradient-to-br from-gray-300 to-gray-400 text-white",
    "bg-gradient-to-br from-orange-300 to-orange-400 text-white",
  ];
  const badgeColor = rank <= 3 ? badgeColors[rank - 1] : "bg-gray-100 text-dark dark:bg-darkTheme-secondary-bg dark:text-white";

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-3 bg-white shadow-sm transition duration-300 hover:shadow-lg dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:hover:-translate-y-1">
      <Link
        href={`/products/${product.id}`}
        className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#f7f8fa] p-2.5 dark:bg-darkTheme-secondary-bg sm:h-52 sm:aspect-auto sm:p-5"
      >
        <span className={`absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold shadow-md sm:left-3 sm:top-3 sm:h-8 sm:w-8 ${badgeColor}`}>
          {rank}
        </span>
        <Image
          src={imageUrl}
          alt={product.name}
          width={240}
          height={240}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-[18px] text-dark transition group-hover:text-orange dark:text-white sm:min-h-[42px] sm:text-sm sm:leading-5">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        {typeof product.review_count === "number" && product.review_count > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`h-3 w-3 ${i < Math.round(Number(product.rating || 0)) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[11px] text-dark-4 dark:text-darkTheme-secondary-muted">
              ({product.review_count})
            </span>
          </div>
        )}

        <div className="mt-2 flex items-end justify-between gap-2 border-t border-gray-3 pt-2 dark:border-darkTheme-border-color sm:pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-base font-extrabold text-dark dark:text-white sm:text-lg">
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
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dark text-white transition hover:bg-orange dark:bg-white dark:text-dark sm:h-9 sm:w-9"
            aria-label="View product"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-3 bg-white shadow-sm dark:border-darkTheme-border-color dark:bg-darkTheme-card">
      <div className="aspect-square animate-pulse bg-gray-2 dark:bg-darkTheme-secondary-bg sm:h-52 sm:aspect-auto" />
      <div className="space-y-2 p-3 sm:p-4">
        <div className="h-3 w-4/5 animate-pulse rounded bg-gray-2 dark:bg-darkTheme-secondary-bg" />
        <div className="h-4 w-2/5 animate-pulse rounded bg-gray-2 dark:bg-darkTheme-secondary-bg" />
      </div>
    </div>
  );
}

const BestSellers = () => {
  const { data: products = [], isLoading, isError } = useProducts({ limit: 30 });
  const [current, setCurrent] = useState(0);

  const bestSellers = React.useMemo(() => {
    if (!products.length) return [];
    return products
      .filter((p) => p.is_active && p.status === "approved")
      .sort((a, b) => {
        const scoreA = (Number(a.review_count || 0) * 2) + Number(a.rating || 0) + (a.is_best_seller ? 100 : 0) + (a.is_featured ? 50 : 0);
        const scoreB = (Number(b.review_count || 0) * 2) + Number(b.rating || 0) + (b.is_best_seller ? 100 : 0) + (b.is_featured ? 50 : 0);
        return scoreB - scoreA;
      })
      .slice(0, 10);
  }, [products]);

  const goTo = useCallback((index: number) => {
    setCurrent((index + bestSellers.length) % bestSellers.length);
  }, [bestSellers.length]);

  useEffect(() => {
    if (bestSellers.length <= 1) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % bestSellers.length), 4500);
    return () => clearInterval(timer);
  }, [bestSellers.length]);

  if (isError || (!isLoading && bestSellers.length === 0)) return null;

  return (
    <section className="overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 py-10 lg:py-14 lg:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0012 0V2z" />
              </svg>
              Best Sellers
            </span>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
              Most loved by buyers
            </h2>
            <p className="mt-1.5 hidden max-w-lg text-sm text-gray-500 dark:text-gray-400 sm:block">
              Top-rated products based on reviews, ratings, and buyer popularity across the marketplace.
            </p>
          </div>

          <Link
            href="/shop-with-sidebar"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-orange hover:text-orange dark:border-gray-700 dark:text-white dark:hover:border-orange sm:inline-flex"
          >
            View all
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
              {bestSellers.map((product, idx) => (
                <div key={String(product.id)} className="w-full flex-shrink-0 px-1">
                  <BestSellerCard product={product} rank={idx + 1} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop: grid */}
        <div className="hidden gap-5 sm:grid sm:grid-cols-3 lg:grid-cols-5">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : bestSellers.slice(0, 5).map((product, idx) => (
                <BestSellerCard key={String(product.id)} product={product} rank={idx + 1} />
              ))}
        </div>

        {/* Mobile "View all" */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            href="/shop-with-sidebar"
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-orange hover:text-orange dark:border-gray-700 dark:text-white"
          >
            View all products
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
