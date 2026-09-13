"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCategories, useProducts } from "@/hooks/useProducts";
import type { Category } from "@/types/api/product";

interface CategoryMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Map common category names to representative icons
const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("apparel") || lower.includes("fashion") || lower.includes("cloth") || lower.includes("women") || lower.includes("men")) {
    return (
      <svg className="size-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (lower.includes("electronic") || lower.includes("phone") || lower.includes("computer") || lower.includes("tech")) {
    return (
      <svg className="size-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 18v-6a9 9 0 0118 0v6" strokeLinecap="round"/>
        <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (lower.includes("home") || lower.includes("garden") || lower.includes("furniture") || lower.includes("kitchen")) {
    return (
      <svg className="size-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (lower.includes("beauty") || lower.includes("health") || lower.includes("cosmetic")) {
    return (
      <svg className="size-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-3a2 2 0 00-2-2h-3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 3h4a2 2 0 012 2v3a2 2 0 01-2 2h-4V3z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (lower.includes("sport") || lower.includes("outdoor") || lower.includes("fitness")) {
    return (
      <svg className="size-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
        <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24" strokeLinecap="round"/>
      </svg>
    );
  }
  if (lower.includes("shoe") || lower.includes("footwear") || lower.includes("sneaker")) {
    return (
      <svg className="size-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 17l4-2 7 2 7-4 2 1v3H2v-0z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 15l2-7 4 1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (lower.includes("jewelry") || lower.includes("watch") || lower.includes("accessory") || lower.includes("ring")) {
    return (
      <svg className="size-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 3h12l4 6-10 12L2 9z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 3L8 9l4 12 4-12-3-6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (lower.includes("bag") || lower.includes("luggage") || lower.includes("case")) {
    return (
      <svg className="size-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="7" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (lower.includes("kid") || lower.includes("toy") || lower.includes("baby")) {
    return (
      <svg className="size-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" strokeLinecap="round"/>
        <path d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 005 0" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (lower.includes("vehicle") || lower.includes("car") || lower.includes("motor") || lower.includes("auto")) {
    return (
      <svg className="size-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h11l4 4v4a2 2 0 01-2 2M5 17a2 2 0 104 0M15 17a2 2 0 104 0" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  // Default general grid icon
  return (
    <svg className="size-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" strokeLinecap="round"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5" strokeLinecap="round"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5" strokeLinecap="round"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5" strokeLinecap="round"/>
    </svg>
  );
};

const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({ isOpen, onClose }) => {
  const { data: categories = [] } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  // Set default selected category
  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === "all") {
      // keep "all" as top recommendation or set first category
    }
  }, [categories, selectedCategoryId]);

  const activeCategory = categories.find((c) => String(c.id) === selectedCategoryId);

  // Fetch products for active selection
  const { data: products = [], isLoading: isProductsLoading } = useProducts(
    selectedCategoryId !== "all" ? { category_id: selectedCategoryId, limit: 14 } : { limit: 14 }
  );

  // Close when ESC key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 top-[52px] lg:top-[140px] z-[998] bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Mega Menu Container */}
      <div className="fixed lg:absolute left-0 right-0 top-[52px] lg:top-full z-[999] mx-auto w-full max-w-[1440px] px-2 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex h-[78vh] max-h-[580px] lg:h-[540px] overflow-hidden rounded-b-2xl border border-t-0 border-gray-3 bg-white shadow-2xl dark:border-darkTheme-border-color dark:bg-darkTheme-card">
          {/* Left Column: Category List (Alibaba style) */}
          <div className="w-[120px] sm:w-[220px] lg:w-[280px] shrink-0 overflow-y-auto border-r border-gray-3 py-2 lg:py-3 dark:border-darkTheme-border-color">
            <ul className="flex flex-col">
              {/* Top Featured Entry: "Categories for you" */}
              <li>
                <button
                  type="button"
                  onMouseEnter={() => setSelectedCategoryId("all")}
                  onClick={() => setSelectedCategoryId("all")}
                  className={`relative flex w-full items-center gap-2 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 lg:py-3 text-left text-xs lg:text-custom-sm font-medium transition-colors ${
                    selectedCategoryId === "all"
                      ? "bg-gray-1 text-dark font-semibold before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-dark dark:bg-white/10 dark:text-white dark:before:bg-orange"
                      : "text-dark-4 hover:bg-gray-1/60 hover:text-dark dark:text-darkTheme-body-color dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <svg className="size-4 lg:size-4.5 shrink-0 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="truncate">For you</span>
                </button>
              </li>

              {/* Dynamic Categories */}
              {categories.map((category) => {
                const isSelected = selectedCategoryId === String(category.id);
                return (
                  <li key={String(category.id)}>
                    <button
                      type="button"
                      onMouseEnter={() => setSelectedCategoryId(String(category.id))}
                      onClick={() => setSelectedCategoryId(String(category.id))}
                      className={`relative flex w-full items-center gap-2 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 lg:py-3 text-left text-xs lg:text-custom-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-gray-1 text-dark font-semibold before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-dark dark:bg-white/10 dark:text-white dark:before:bg-orange"
                          : "text-dark-4 hover:bg-gray-1/60 hover:text-dark dark:text-darkTheme-body-color dark:hover:bg-white/5 dark:hover:text-white"
                      }`}
                    >
                      <span className={`${isSelected ? "text-dark dark:text-white" : "text-dark-4/70 dark:text-white/50"}`}>
                        {getCategoryIcon(category.name)}
                      </span>
                      <span className="truncate">{category.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right Column: Circular Product Grid (Alibaba style) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {/* Header row */}
            <div className="mb-4 lg:mb-6 flex items-center justify-between border-b border-gray-2 pb-2.5 lg:pb-3 dark:border-darkTheme-border-color">
              <h3 className="text-sm font-bold text-dark dark:text-white sm:text-base lg:text-lg">
                {selectedCategoryId === "all" ? "Categories for you" : activeCategory?.name}
              </h3>
              <Link
                href={
                  selectedCategoryId === "all"
                    ? "/shop-with-sidebar"
                    : `/shop-with-sidebar?category_id=${encodeURIComponent(selectedCategoryId)}`
                }
                onClick={onClose}
                className="text-2xs sm:text-xs font-semibold text-dark-4 underline-offset-4 hover:text-orange hover:underline dark:text-white/70 dark:hover:text-orange"
              >
                Browse all &rarr;
              </Link>
            </div>

            {/* Circular Item Grid */}
            {isProductsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-2 border-orange border-t-transparent"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-dark-4 dark:text-white/50">
                  No products available in this category.
                </p>
                <Link
                  href="/shop-with-sidebar"
                  onClick={onClose}
                  className="mt-3 rounded-[8px] bg-orange px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange/90"
                >
                  Explore All Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 min-[420px]:grid-cols-3 gap-y-5 gap-x-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
                {products.map((product, idx) => {
                  const hasImage = Boolean(product.images?.[0]?.image_url);
                  const isHot = idx % 3 === 0;
                  const isTrending = idx % 3 === 1;

                  return (
                    <Link
                      key={String(product.id)}
                      href={`/products/${product.id}`}
                      onClick={onClose}
                      className="group flex flex-col items-center text-center"
                    >
                      {/* Circular Bubble */}
                      <div className="relative mb-2 flex size-16 sm:size-20 lg:size-22 items-center justify-center rounded-full bg-[#f4f5f7] p-1.5 sm:p-2 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-md dark:bg-white/5">
                        {/* Hot / Trending Badge */}
                        {isHot && (
                          <span
                            className="absolute -right-0.5 top-0 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white shadow"
                            title="Hot product"
                          >
                            🔥
                          </span>
                        )}
                        {isTrending && (
                          <span
                            className="absolute -right-0.5 top-0 flex size-4 items-center justify-center rounded-full bg-blue text-[8px] text-white shadow"
                            title="Trending"
                          >
                            ↗
                          </span>
                        )}

                        {hasImage ? (
                          <Image
                            src={product.images![0].image_url}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="size-11 sm:size-14 lg:size-16 rounded-full object-contain"
                          />
                        ) : (
                          <div className="flex size-11 sm:size-14 items-center justify-center rounded-full bg-orange/10 text-orange">
                            {getCategoryIcon(activeCategory?.name || "all")}
                          </div>
                        )}
                      </div>

                      {/* Product Name */}
                      <span className="line-clamp-2 max-w-[85px] sm:max-w-[100px] text-[11px] sm:text-xs font-medium leading-tight text-dark transition-colors group-hover:text-orange dark:text-darkTheme-body-color dark:group-hover:text-orange">
                        {product.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryMegaMenu;
