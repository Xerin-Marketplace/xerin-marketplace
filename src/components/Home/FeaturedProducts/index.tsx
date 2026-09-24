"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";
import PriceDisplay from "@/components/shared/PriceDisplay";
import type { Product as ApiProduct } from "@/types/api/product";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, StarIcon } from "@hugeicons/core-free-icons";

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
 <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:shadow-lg sm:hover:-translate-y-1">
 <Link
 href={`/products/${product.id}`}
 className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted p-2.5 sm:h-56 sm:aspect-auto sm:p-5"
 >
 {hasDiscount && (
 <span className="absolute left-2 top-2 z-10 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-white shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
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
 <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-[18px] text-foreground transition group-hover:text-primary sm:min-h-[44px] sm:text-sm sm:leading-5">
 <Link href={`/products/${product.id}`}>{product.name}</Link>
 </h3>

 <div className="mt-2 flex items-end justify-between gap-2 border-t border-border pt-2 sm:pt-3">
 <div>
 <div className="flex flex-wrap items-center gap-1.5">
 <span className="text-[15px] font-extrabold text-destructive sm:text-base sm:text-foreground">
 <PriceDisplay amount={hasDiscount ? salePrice! : regularPrice} sourceCurrency={product.currency} />
 </span>
 {hasDiscount && (
 <span className="text-[10px] text-muted-foreground line-through sm:text-xs">
 <PriceDisplay amount={regularPrice} sourceCurrency={product.currency} />
 </span>
 )}
 </div>
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
 <div className="aspect-square animate-pulse bg-muted sm:h-56 sm:aspect-auto" />
 <div className="space-y-2 p-3 sm:p-4">
 <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
 <div className="h-4 w-2/5 animate-pulse rounded bg-muted" />
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
 <section className="overflow-hidden bg-card dark:bg-muted">
 <div className="mx-auto max-w-screen-xl px-4 py-10 lg:py-16 lg:px-6">
 {/* Section header */}
 <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
 <div>
 <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-primary">
 <HugeiconsIcon icon={StarIcon} size={18} className="text-yellow-dark" />
 Featured Products
 </span>
 <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
 Trending on XerinMarket
 </h2>
 <p className="mt-1.5 hidden max-w-lg text-sm text-muted-foreground dark:text-muted-foreground sm:block">
 Discover products our buyers love · handpicked from top sellers across the marketplace.
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

export default FeaturedProducts;
