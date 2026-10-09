"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";
import PriceDisplay from "@/components/shared/PriceDisplay";

const FrequentlySearched = () => {
  const { data: products = [], isLoading } = useProducts({ limit: 12 });

  const items = React.useMemo(
    () =>
      products
        .filter((p) => p.is_active && p.status === "approved")
        .slice(0, 6)
        .map(mapApiProductToUiProduct),
    [products],
  );

  if (isLoading || items.length === 0) return null;

  return (
    <section className="bg-[var(--muted)] py-4 sm:py-6">
      <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-5 lg:px-8 xl:px-10 2xl:px-6">
        <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-1">
          {items.map((product) => {
            const image =
              product.imgs?.previews?.[0] ?? "/images/products/placeholder.svg";
            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group flex w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-[236px]"
              >
                <div className="px-4 pb-1 pt-4">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Frequently searched
                  </p>
                  <h3 className="mt-0.5 line-clamp-1 text-sm font-bold text-foreground transition group-hover:text-primary">
                    {product.title}
                  </h3>
                </div>
                <div className="flex items-end justify-between gap-2 px-4 pb-4">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px] font-extrabold text-foreground">
                      <PriceDisplay
                        amount={product.discountedPrice || product.price}
                        sourceCurrency={product.currency}
                      />
                    </span>
                  </div>
                  <Image
                    src={image}
                    alt={product.title}
                    width={92}
                    height={92}
                    className="h-20 w-20 shrink-0 rounded-lg object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FrequentlySearched;
