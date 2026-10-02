"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { ArrowRight01Icon, ShoppingCartAdd01Icon } from "@hugeicons/core-free-icons";
import PriceDisplay from "@/components/shared/PriceDisplay";
import StarRating from "@/components/Common/StarRating";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";
import { useLanguage } from "@/app/context/LanguageContext";
import {
  addProductToCartPayload,
  useAddCartItem,
} from "@/hooks/useCartActions";
import type { Product as ApiProduct } from "@/types/api/product";

function RailCard({ product }: { product: ApiProduct }) {
  const uiProduct = mapApiProductToUiProduct(product);
  const addToCart = useAddCartItem();
  const { t } = useLanguage();
  const imageUrl =
    uiProduct.imgs?.previews?.[0] ?? "/images/products/placeholder.svg";
  const regularPrice = Number(product.price || 0);
  const salePrice = product.sale_price ? Number(product.sale_price) : null;
  const hasDiscount =
    salePrice !== null && salePrice > 0 && salePrice < regularPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.review_count || 0);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:shadow-lg sm:hover:-translate-y-1">
      <Link
        href={`/products/${product.id}`}
        className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted p-2 sm:p-4"
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

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {reviewCount > 0 && (
          <div className="mb-1.5">
            <StarRating rating={rating} reviewCount={reviewCount} size={12} />
          </div>
        )}
        <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-[18px] text-foreground transition group-hover:text-primary sm:text-sm sm:leading-5">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[15px] font-extrabold text-foreground sm:text-base">
            <PriceDisplay
              amount={hasDiscount ? salePrice! : regularPrice}
              sourceCurrency={product.currency}
            />
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-muted-foreground line-through sm:text-xs">
              <PriceDisplay
                amount={regularPrice}
                sourceCurrency={product.currency}
              />
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={addToCart.isPending}
          onClick={() =>
            addToCart.mutate(addProductToCartPayload(uiProduct))
          }
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-xs font-bold text-background transition hover:bg-primary disabled:opacity-50 dark:bg-card dark:text-foreground dark:hover:bg-primary dark:hover:text-primary-foreground sm:text-sm"
        >
          <HugeiconsIcon icon={ShoppingCartAdd01Icon} size={16} />
          {addToCart.isPending ? "Adding…" : t("product_add_to_cart")}
        </button>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-2 p-3 sm:p-4">
        <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/5 animate-pulse rounded bg-muted" />
        <div className="h-9 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export default function ProductRail({
  eyebrow,
  title,
  subtitle,
  icon,
  products,
  isLoading,
  isError,
  viewAllHref = "/shop-with-sidebar",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: IconSvgElement;
  products: ApiProduct[];
  isLoading: boolean;
  isError: boolean;
  viewAllHref?: string;
}) {
  if (isError || (!isLoading && products.length === 0)) return null;

  return (
    <section className="overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-4 py-10 lg:px-6 lg:py-14">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-primary">
              <HugeiconsIcon icon={icon} size={18} />
              {eyebrow}
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              {title}
            </h2>
            <p className="mt-1.5 hidden max-w-lg text-sm text-muted-foreground sm:block">
              {subtitle}
            </p>
          </div>

          <Link
            href={viewAllHref}
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary dark:border-border dark:hover:border-primary sm:inline-flex"
          >
            View all
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </Link>
        </div>

        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[180px] shrink-0 snap-start sm:w-[220px] lg:w-[240px]"
                >
                  <SkeletonCard />
                </div>
              ))
            : products.map((product) => (
                <div
                  key={String(product.id)}
                  className="w-[180px] shrink-0 snap-start sm:w-[220px] lg:w-[240px]"
                >
                  <RailCard product={product} />
                </div>
              ))}
        </div>

        <div className="mt-4 flex justify-center sm:hidden">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary dark:border-border"
          >
            View all products
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
