"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";
import PriceDisplay from "@/components/shared/PriceDisplay";
import type { Product as ApiProduct } from "@/types/api/product";

const FEATURED_LIMIT = 10;

function ProductCard({ product }: { product: ApiProduct }) {
  const uiProduct = mapApiProductToUiProduct(product);
  const imageUrl = uiProduct.imgs?.previews?.[0] ?? "/images/products/placeholder.svg";
  const regularPrice = Number(product.price || 0);
  const salePrice = product.sale_price ? Number(product.sale_price) : null;
  const hasDiscount = salePrice !== null && salePrice > 0 && salePrice < regularPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-3 bg-white shadow-sm transition duration-300 hover:shadow-lg dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:hover:-translate-y-1">
      <Link
        href={`/products/${product.id}`}
        className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#f7f8fa] p-2.5 dark:bg-darkTheme-secondary-bg sm:h-56 sm:aspect-auto sm:p-5"
      >
        {hasDiscount && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
            -{discountPercentage}%
          </span>
        )}
        <Image
          src={imageUrl}
          alt={product.name}
          width={240}
          height={240}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-[18px] text-dark transition group-hover:text-orange dark:text-white sm:min-h-[44px] sm:text-sm sm:leading-5">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        <div className="mt-2 flex items-end justify-between gap-2 border-t border-gray-3 pt-2 dark:border-darkTheme-border-color sm:pt-3">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[15px] font-extrabold text-red-500 dark:text-white sm:text-base sm:text-dark">
                <PriceDisplay amount={hasDiscount ? salePrice! : regularPrice} sourceCurrency={product.currency} />
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-dark-4 line-through sm:text-xs">
                  <PriceDisplay amount={regularPrice} sourceCurrency={product.currency} />
                </span>
              )}
            </div>
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
      <div className="aspect-square animate-pulse bg-gray-2 dark:bg-darkTheme-secondary-bg sm:h-56 sm:aspect-auto" />
      <div className="space-y-2 p-3 sm:p-4">
        <div className="h-3 w-4/5 animate-pulse rounded bg-gray-2 dark:bg-darkTheme-secondary-bg" />
        <div className="h-4 w-2/5 animate-pulse rounded bg-gray-2 dark:bg-darkTheme-secondary-bg" />
      </div>
    </div>
  );
}

const FeaturedProducts = () => {
  const { data: products = [], isLoading, isError } = useProducts({ limit: FEATURED_LIMIT });
  const { data: categories = [] } = useCategories();

  const categoryNameById = React.useMemo(
    () => new Map(categories.map((c) => [String(c.id), c.name] as const)),
    [categories],
  );

  const featured = React.useMemo(() => {
    if (!products.length) return [];
    return products
      .filter((p) => p.is_active && p.status === "approved")
      .slice(0, 8);
  }, [products]);

  if (isError || (!isLoading && featured.length === 0)) return null;

  return (
    <section className="overflow-hidden bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 py-10 lg:py-16 lg:px-6">
        {/* Section header */}
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Featured Products
            </span>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
              Trending on XerinMarket
            </h2>
            <p className="mt-1.5 hidden max-w-lg text-sm text-gray-500 dark:text-gray-400 sm:block">
              Discover products our buyers love — handpicked from top sellers across the marketplace.
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

        {/* Mobile: horizontal scroll rail */}
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[180px] shrink-0">
                  <SkeletonCard />
                </div>
              ))
            : featured.map((product) => (
                <div key={String(product.id)} className="w-[180px] shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
        </div>

        {/* Desktop: grid */}
        <div className="hidden gap-5 sm:grid sm:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : featured.map((product) => (
                <ProductCard key={String(product.id)} product={product} />
              ))}
        </div>

        {/* Mobile "View all" button */}
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

export default FeaturedProducts;
