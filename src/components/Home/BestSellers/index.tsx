"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";
import PriceDisplay from "@/components/shared/PriceDisplay";
import type { Product as ApiProduct } from "@/types/api/product";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon, ArrowRight01Icon, Award01Icon } from "@hugeicons/core-free-icons";

function BestSellerCard({ product, rank }: { product: ApiProduct; rank: number }) {
 const uiProduct = mapApiProductToUiProduct(product);
 const imageUrl = uiProduct.imgs?.previews?.[0] ?? "/images/products/placeholder.svg";
 const regularPrice = Number(product.price || 0);
 const salePrice = product.sale_price ? Number(product.sale_price) : null;
 const hasDiscount = salePrice !== null && salePrice > 0 && salePrice < regularPrice;

 const badgeColors = [
 "text-white",
 "text-white",
 "text-white",
 ];
 const badgeColor = rank <= 3 ? badgeColors[rank - 1] : "bg-muted text-foreground ";

 return (
 <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:shadow-lg sm:hover:-translate-y-1">
 <Link
 href={`/products/${product.id}`}
 className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted p-2.5 sm:h-52 sm:aspect-auto sm:p-5"
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
 <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-[18px] text-foreground transition group-hover:text-primary sm:min-h-[42px] sm:text-sm sm:leading-5">
 <Link href={`/products/${product.id}`}>{product.name}</Link>
 </h3>

 {typeof product.review_count === "number" && product.review_count > 0 && (
 <div className="mt-1.5 flex items-center gap-1">
 <div className="flex items-center gap-0.5">
 {Array.from({ length: 5 }).map((_, i) => (
 <HugeiconsIcon key={i} icon={StarIcon} size={14} className="text-yellow-dark" />
 ))}
 </div>
 <span className="text-[11px] text-muted-foreground">
 ({product.review_count})
 </span>
 </div>
 )}

 <div className="mt-2 flex items-end justify-between gap-2 border-t border-border pt-2 sm:pt-3">
 <div className="flex flex-wrap items-center gap-1.5">
 <span className="text-base font-extrabold text-foreground sm:text-lg">
 <PriceDisplay amount={hasDiscount ? salePrice! : regularPrice} sourceCurrency={product.currency} />
 </span>
 {hasDiscount && (
 <span className="text-[10px] text-muted-foreground line-through sm:text-xs">
 <PriceDisplay amount={regularPrice} sourceCurrency={product.currency} />
 </span>
 )}
 </div>
 <Link
 href={`/products/${product.id}`}
 className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition hover:bg-primary/90 dark:bg-card dark:text-foreground sm:h-9 sm:w-9"
 aria-label="View product"
 >
 <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
 </Link>
 </div>
 </div>
 </article>
 );
}

function SkeletonCard() {
 return (
 <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
 <div className="aspect-square animate-pulse bg-muted sm:h-52 sm:aspect-auto" />
 <div className="space-y-2 p-3 sm:p-4">
 <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
 <div className="h-4 w-2/5 animate-pulse rounded bg-muted" />
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
 <section className="overflow-hidden bg-muted dark:bg-muted">
 <div className="mx-auto max-w-screen-xl px-4 py-10 lg:py-14 lg:px-6">
 {/* Header */}
 <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
 <div>
 <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-primary">
 <HugeiconsIcon icon={Award01Icon} size={18} />
 Best Sellers
 </span>
 <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
 Most loved by buyers
 </h2>
 <p className="mt-1.5 hidden max-w-lg text-sm text-muted-foreground dark:text-muted-foreground sm:block">
 Top-rated products based on reviews, ratings, and buyer popularity across Xerin Mart.
 </p>
 </div>

 <Link
 href="/shop-with-sidebar"
 className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary dark:border-border dark:hover:border-primary sm:inline-flex"
 >
 View all
 <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
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
 className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary dark:border-border"
 >
 View all products
 <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
 </Link>
 </div>
 </div>
 </section>
 );
};

export default BestSellers;
