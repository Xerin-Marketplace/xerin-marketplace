"use client";
import { useLanguage } from "@/app/context/LanguageContext";

import React from "react";
import { useProducts, useCategories } from "@/hooks/useProducts";
import ProductRail from "@/components/Home/ProductRail";
import { SparklesIcon, GridIcon } from "@hugeicons/core-free-icons";
import type { Product as ApiProduct } from "@/types/api/product";

const activeApproved = (p: ApiProduct) => p.is_active && p.status === "approved";

/**
 * New Arrivals + per-category discovery rails.
 * Every rail is driven by the real /products catalogue — a rail hides
 * itself entirely when the API returns nothing for it.
 */
const MarketRails = () => {
  const { t } = useLanguage();
  const { data: products = [], isLoading, isError } = useProducts({ limit: 60 });
  const { data: categories = [] } = useCategories();

  const newArrivals = React.useMemo(
    () =>
      products
        .filter(activeApproved)
        .sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime(),
        )
        .slice(0, 12),
    [products],
  );

  // Pick the two categories with the most approved in-catalogue products.
  const categoryRails = React.useMemo(() => {
    const approved = products.filter(activeApproved);
    const byCategory = new Map<string, ApiProduct[]>();
    for (const p of approved) {
      const key = String(p.category_id ?? "");
      if (!key) continue;
      const list = byCategory.get(key) ?? [];
      list.push(p);
      byCategory.set(key, list);
    }
    const nameById = new Map(categories.map((c) => [String(c.id), c.name]));
    return Array.from(byCategory.entries())
      .filter(([id, list]) => nameById.has(id) && list.length >= 3)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 2)
      .map(([id, list]) => ({
        id,
        name: String(nameById.get(id) || ""),
        href: `/search?category_id=${encodeURIComponent(id)}`,
        products: list.slice(0, 10),
      }));
  }, [products, categories]);

  return (
    <>
      <ProductRail
        eyebrow="New Arrivals"
        title={t("rail_fresh")}
        subtitle={t("rail_fresh_sub")}
        icon={SparklesIcon}
        products={newArrivals}
        isLoading={isLoading}
        isError={isError}
      />
      {categoryRails.map((rail) => (
        <ProductRail
          key={rail.id}
          eyebrow="Shop by Category"
          title={t("rail_popular_in", { name: rail.name })}
          subtitle={t("rail_popular_sub")}
          icon={GridIcon}
          products={rail.products}
          isLoading={false}
          isError={false}
          viewAllHref={rail.href}
        />
      ))}
    </>
  );
};

export default MarketRails;
