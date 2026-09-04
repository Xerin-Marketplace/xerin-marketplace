"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { discoveryApi } from "@/lib/api/endpoints/discovery";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { useCategories } from "@/hooks/useProducts";
import type { AlsoBoughtProductItem, SearchProductItem } from "@/types/api/discovery";
import SimilarProducts from "./SimilarProducts";

import { resolveProductImageUrl } from "@/lib/products/adapters";

const productImage = (item: SearchProductItem) =>
  item.primary_image_url
    ? resolveProductImageUrl(item.primary_image_url)
    : "/images/products/placeholder.svg";

export default function RelatedProducts({ productId }: { productId: string }) {
  const [related, setRelated] = useState<SearchProductItem[]>([]);
  const [alsoBought, setAlsoBought] = useState<AlsoBoughtProductItem[]>([]);
  const [alsoBoughtLoading, setAlsoBoughtLoading] = useState(true);
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  useEffect(() => {
    if (!productId) return;

    void discoveryApi
      .related(productId, 8)
      .then((data) =>
        setRelated(data.results.filter((item) => item.id !== productId).slice(0, 8)),
      )
      .catch(() => setRelated([]));

    setAlsoBoughtLoading(true);
    void discoveryApi
      .alsoBought(productId, 8)
      .then((data) =>
        setAlsoBought(data.results.filter((item) => item.id !== productId).slice(0, 8)),
      )
      .catch(() => setAlsoBought([]))
      .finally(() => setAlsoBoughtLoading(false));
  }, [productId]);

  return (
    <div className="space-y-8 bg-[#f7f9fc] py-10 dark:bg-darkTheme-bg sm:space-y-10 sm:py-14">
      <SimilarProducts productId={productId} />

      {alsoBoughtLoading ? (
        <AlsoBoughtLoading />
      ) : alsoBought.length > 0 ? (
        <ProductStrip
          eyebrow="Complete the basket"
          title="Customers who bought this item also bought"
          description="Based on real successful Xerin orders from customers who purchased this product."
          rows={alsoBought}
          tone="blue"
          icon="basket"
          showCoPurchaseEvidence
        />
      ) : null}

      <BrowseCategories categories={categories} loading={categoriesLoading} />

      {related.length > 0 && (
        <ProductStrip
          eyebrow="Keep exploring"
          title="Related Products"
          description="More approved products from similar categories or brands."
          rows={related}
          tone="neutral"
          icon="spark"
        />
      )}
    </div>
  );
}

function AlsoBoughtLoading() {
  return (
    <section className="mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8 xl:px-4">
      <div className="rounded-3xl border border-[#d7e6ff] bg-gradient-to-br from-white to-[#f5f9ff] p-5 dark:border-[#2563eb]/20 dark:from-darkTheme-card dark:to-[#2563eb]/[0.05] sm:p-7">
        <div className="h-6 w-72 animate-pulse rounded bg-gray-3 dark:bg-white/10" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-gray-2 dark:bg-white/5" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-[300px] animate-pulse rounded-2xl bg-gray-2 dark:bg-white/5" />
          ))}
        </div>
      </div>
    </section>
  );
}

function BrowseCategories({
  categories,
  loading,
}: {
  categories: Array<{ id: string | number; parent_id: string | number | null; name: string; slug: string }>;
  loading: boolean;
}) {
  const visible = useMemo(() => {
    const parents = categories.filter((item) => item.parent_id == null);
    return (parents.length ? parents : categories).slice(0, 10);
  }, [categories]);

  if (!loading && visible.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8 xl:px-4">
      <div className="rounded-3xl border border-gray-3 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange">Explore Xerin</span>
            <h2 className="mt-1 text-xl font-extrabold text-dark dark:text-white sm:text-2xl">Browse by Category</h2>
            <p className="mt-1.5 text-sm text-dark-4">Jump directly into the marketplace department you want to explore.</p>
          </div>
          <Link
            href="/shop-with-sidebar"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-3 px-4 text-xs font-bold text-dark transition hover:border-orange hover:text-orange dark:border-darkTheme-border-color dark:text-white"
          >
            Browse all categories <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(loading ? Array.from({ length: 10 }) : visible).map((category, index) => {
            if (loading) {
              return <div key={index} className="h-[104px] animate-pulse rounded-2xl bg-gray-2 dark:bg-white/5" />;
            }

            const item = category as typeof visible[number];
            const initials = item.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join("");

            return (
              <Link
                key={String(item.id)}
                href={`/shop-with-sidebar?category_id=${encodeURIComponent(String(item.id))}`}
                className="group flex min-h-[104px] flex-col justify-between rounded-2xl border border-gray-3 bg-[#fbfcfd] p-4 transition hover:-translate-y-0.5 hover:border-orange/40 hover:bg-orange/[0.04] hover:shadow-md dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange/10 text-xs font-extrabold text-orange transition group-hover:bg-orange group-hover:text-white">
                  {initials || "•"}
                </span>
                <span className="mt-3 flex items-center justify-between gap-2">
                  <span className="line-clamp-2 text-sm font-bold leading-5 text-dark dark:text-white">{item.name}</span>
                  <span className="shrink-0 text-orange transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProductStrip({
  eyebrow,
  title,
  description,
  rows,
  tone,
  icon,
  showCoPurchaseEvidence = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  rows: Array<SearchProductItem | AlsoBoughtProductItem>;
  tone: "blue" | "neutral";
  icon: "basket" | "spark";
  showCoPurchaseEvidence?: boolean;
}) {
  const blue = tone === "blue";

  return (
    <section className="mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8 xl:px-4">
      <div className={`rounded-3xl border p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:p-7 ${
        blue
          ? "border-[#d7e6ff] bg-gradient-to-br from-white to-[#f5f9ff] dark:border-[#2563eb]/20 dark:from-darkTheme-card dark:to-[#2563eb]/[0.05]"
          : "border-gray-3 bg-white dark:border-darkTheme-border-color dark:bg-darkTheme-card"
      }`}>
        <div className="flex items-start gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${blue ? "bg-[#2563eb]/10 text-[#2563eb]" : "bg-orange/10 text-orange"}`}>
            {icon === "basket" ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 9h16l-1.5 10h-13L4 9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                <path d="m8 9 4-6 4 6M9 13v2m3-2v2m3-2v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                <path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            )}
          </span>
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-[0.14em] ${blue ? "text-[#2563eb]" : "text-orange"}`}>{eyebrow}</span>
            <h2 className="mt-1 text-xl font-extrabold text-dark dark:text-white sm:text-2xl">{title}</h2>
            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-dark-4">{description}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rows.slice(0, 8).map((item) => {
            const regular = Number(item.price || 0);
            const sale = item.sale_price == null ? null : Number(item.sale_price);
            const price = sale && sale > 0 && sale < regular ? sale : regular;

            return (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-gray-3 bg-white p-3.5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange/40 hover:shadow-lg dark:border-white/10 dark:bg-darkTheme-card"
              >
                <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl bg-[#f7f8fa] p-3 dark:bg-white/5">
                  <Image
                    src={productImage(item)}
                    alt={item.name}
                    width={180}
                    height={180}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                  {sale && sale > 0 && sale < regular ? (
                    <span className="absolute left-2 top-2 rounded-full bg-orange px-2 py-1 text-[10px] font-extrabold text-white">
                      Special price
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 line-clamp-2 min-h-[40px] text-sm font-bold text-dark dark:text-white">{item.name}</p>
                <p className="mt-2 text-base font-extrabold text-dark dark:text-white">
                  <PriceDisplay amount={price} sourceCurrency={item.currency} />
                </p>
                {showCoPurchaseEvidence && "customer_count" in item ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#2563eb]/[0.08] px-2.5 py-1 text-[10px] font-bold text-[#2563eb]">
                    <span aria-hidden="true">✓</span>
                    Bought by {item.customer_count} customer{item.customer_count === 1 ? "" : "s"} who bought this item
                  </p>
                ) : null}
                <div className="mt-3 flex items-center justify-between border-t border-gray-3 pt-3 text-xs font-bold text-orange dark:border-white/10">
                  <span>View product</span>
                  <span className="transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
