"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { discoveryApi } from "@/lib/api/endpoints/discovery";
import type { SearchProductItem } from "@/types/api/discovery";
import { useAuthStore } from "@/store/useAuthStore";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Clock01Icon, SparklesIcon } from "@hugeicons/core-free-icons";

const productImage = (item: SearchProductItem) =>
  item.primary_image_url || "/images/product/product-1-bg-1.png";

function RailCard({ item }: { item: SearchProductItem }) {
  const regular = Number(item.price || 0);
  const sale = item.sale_price == null ? null : Number(item.sale_price);
  const price = sale && sale > 0 && sale < regular ? sale : regular;

  return (
    <Link
      href={`/products/${item.id}`}
      className="group overflow-hidden rounded-xl border border-border bg-card p-3.5 transition duration-200 hover:border-primary/40"
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-lg bg-muted p-3 sm:h-40">
        <Image
          src={productImage(item)}
          alt={item.name}
          width={160}
          height={160}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
        />
        {sale && sale > 0 && sale < regular ? (
          <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
            Special price
          </span>
        ) : null}
      </div>
      <p className="mt-3 line-clamp-2 min-h-[38px] text-sm font-semibold text-foreground">
        {item.name}
      </p>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="text-base font-bold text-foreground">
          <PriceDisplay amount={price} sourceCurrency={item.currency} />
        </p>
        <span className="text-muted-foreground transition group-hover:text-primary" aria-hidden="true">
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
        </span>
      </div>
    </Link>
  );
}

function Rail({
  title,
  subtitle,
  icon,
  items,
}: {
  title: string;
  subtitle: string;
  icon: "history" | "spark";
  items: SearchProductItem[];
}) {
  // Hide entirely when the backend has no real data — never render an empty shell.
  if (!items.length) return null;

  return (
    <section className="mx-auto w-full max-w-[1170px] px-4 pb-10 sm:px-8 xl:px-0">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HugeiconsIcon icon={icon === "history" ? Clock01Icon : SparklesIcon} size={20} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-foreground sm:text-xl">{title}</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.slice(0, 8).map((item) => (
          <RailCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

/**
 * Personalized discovery rails for the homepage.
 * Both sections consume real backend signals only:
 *  - /recommendations/recently-viewed (server-tracked product views)
 *  - /recommendations (backend-driven recommendation list)
 * Sections render nothing when the API returns no data.
 */
const DiscoveryRails = () => {
  const isAuthenticated = useAuthStore((s) => Boolean(s.accessToken));
  const [recentlyViewed, setRecentlyViewed] = useState<SearchProductItem[]>([]);
  const [recommended, setRecommended] = useState<SearchProductItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    discoveryApi
      .recentlyViewed(8)
      .then((data) => setRecentlyViewed(data.results || []))
      .catch(() => setRecentlyViewed([]));

    discoveryApi
      .recommendations(8)
      .then((data) => setRecommended(data.results || []))
      .catch(() => setRecommended([]));
  }, [isAuthenticated]);

  // New/anonymous visitors get nothing extra — the generic discovery
  // sections (Hero, Categories, FlashDeals, Featured, BestSellers) carry the page.
  if (!isAuthenticated || (!recentlyViewed.length && !recommended.length)) return null;

  return (
    <>
      <Rail
        title="Continue shopping"
        subtitle="Products you viewed recently"
        icon="history"
        items={recentlyViewed}
      />
      <Rail
        title="Recommended for you"
        subtitle="Picked by the marketplace from your activity"
        icon="spark"
        items={recommended}
      />
    </>
  );
};

export default DiscoveryRails;
