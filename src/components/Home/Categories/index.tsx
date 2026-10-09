"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCategories, useProducts } from "@/hooks/useProducts";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { useQuery } from "@tanstack/react-query";
import { listPublicStores } from "@/lib/api/endpoints/store";
import type { Store } from "@/types/api/store";
import { HugeiconsIcon } from "@hugeicons/react";
import { PackageIcon, ArrowDown01Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/app/context/LanguageContext";

const PAGE_SIZE = 12;

type LocationFilter = "all" | "local" | "global" | `country:${string}`;

const TANZANIA_NAMES = new Set([
 "tanzania",
 "united republic of tanzania",
 "tanzania, united republic of",
]);

function normalizedCountry(country?: string | null) {
 return String(country ?? "").trim();
}

function isTanzania(country?: string | null) {
 return TANZANIA_NAMES.has(normalizedCountry(country).toLowerCase());
}

function flagForCountry(country?: string | null) {
 const value = normalizedCountry(country).toLowerCase();

 if (TANZANIA_NAMES.has(value)) return "🇹🇿";
 if (["united arab emirates", "uae"].includes(value)) return "🇦🇪";
 if (["china", "people's republic of china", "prc"].includes(value)) return "🇨🇳";
 if (["turkey", "türkiye", "turkiye"].includes(value)) return "🇹🇷";
 if (["united states", "united states of america", "usa", "us"].includes(value)) return "🇺🇸";
 if (["united kingdom", "uk", "great britain"].includes(value)) return "🇬🇧";

 return "🌍";
}

function countryDisplayName(country?: string | null) {
 const value = normalizedCountry(country);
 if (!value) return "Location not configured";
 if (["united arab emirates", "uae"].includes(value.toLowerCase())) return "UAE / Dubai";
 return value;
}

function storeMatchesLocation(store: Store | undefined, filter: LocationFilter) {
 if (filter === "all") return true;
 if (!store) return false;

 const country = normalizedCountry(store.country);
 const local = store.store_scope === "local" || isTanzania(country);

 if (filter === "local") return local;
 if (filter === "global") return !local;

 const selectedCountry = filter.slice("country:".length);
 return country.toLowerCase() === selectedCountry.toLowerCase();
}


const Categories = () => {
 const { t } = useLanguage();
 const [categoryId, setCategoryId] = useState("");
 const [locationFilter, setLocationFilter] = useState<LocationFilter>("all");
 const [page, setPage] = useState(1);

 const { data: publicStores = [] } = useQuery<Store[]>({
 queryKey: ["public-stores", "landing-location-filter"],
 queryFn: listPublicStores,
 staleTime: 60_000,
 retry: false,
 });

 const productQuery = useMemo(
 () => ({
 category_id: categoryId || undefined,
 // Location filtering depends on the product's store. When a location
 // filter is active we fetch a wider catalog window and paginate the
 // filtered result locally.
 skip: locationFilter === "all" ? (page - 1) * PAGE_SIZE : 0,
 limit: locationFilter === "all" ? PAGE_SIZE + 1 : 100,
 }),
 [categoryId, locationFilter, page],
 );

 const {
 data: productResults = [],
 isLoading,
 isFetching,
 isError,
 refetch,
 } = useProducts(productQuery);

 const { data: categories = [] } = useCategories();

 const storeById = useMemo<Map<string, Store>>(
 () => new Map<string, Store>(publicStores.map((store) => [String(store.id), store])),
 [publicStores],
 );

 const countryOptions = useMemo(() => {
 const values = new Set<string>();
 publicStores.forEach((store) => {
 const country = normalizedCountry(store.country);
 if (country) values.add(country);
 });
 return Array.from(values).sort((a, b) => a.localeCompare(b));
 }, [publicStores]);

 const locationFilteredProducts = useMemo(
 () =>
 locationFilter === "all"
 ? productResults
 : productResults.filter((product) =>
 storeMatchesLocation(storeById.get(String(product.store_id)), locationFilter),
 ),
 [locationFilter, productResults, storeById],
 );

 const locationStart = (page - 1) * PAGE_SIZE;
 const hasNextPage =
 locationFilter === "all"
 ? productResults.length > PAGE_SIZE
 : locationFilteredProducts.length > locationStart + PAGE_SIZE;

 const products =
 locationFilter === "all"
 ? productResults.slice(0, PAGE_SIZE)
 : locationFilteredProducts.slice(locationStart, locationStart + PAGE_SIZE);

 const selectedLocationLabel = useMemo(() => {
 if (locationFilter === "all") return "All locations";
 if (locationFilter === "local") return "🇹🇿 Local · Tanzania";
 if (locationFilter === "global") return "🌍 Global · All countries";
 const country = locationFilter.slice("country:".length);
 return `${flagForCountry(country)} ${countryDisplayName(country)}`;
 }, [locationFilter]);

 const categoryNameById = useMemo<Map<string, string>>(
 () => new Map(categories.map((category) => [String(category.id), category.name] as const)),
 [categories],
 );

 const clearFilters = () => {
 setCategoryId("");
 setLocationFilter("all");
 setPage(1);
 };

 const showingFrom = products.length ? (page - 1) * PAGE_SIZE + 1 : 0;
 const showingTo = products.length ? showingFrom + products.length - 1 : 0;

 return (
 <section className="overflow-hidden bg-muted pb-4 pt-[64px] sm:pt-[72px] lg:pt-10 sm:pb-8">
 <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-6">
 {/* Heading */}
 <div className="mb-3 flex items-end justify-between gap-3 sm:mb-5 lg:items-end">
 <div>
 <span className="mb-1 hidden items-center gap-2 text-sm font-medium text-primary sm:flex sm:text-base">
 <HugeiconsIcon icon={PackageIcon} size={20} />
 Products
 </span>
 <h2 className="text-lg font-bold text-foreground sm:text-2xl xl:text-heading-5">
 Explore products from our sellers
 </h2>
 <p className="mt-1 hidden max-w-2xl text-sm text-muted-foreground sm:block">
 Browse live products published by sellers. Search by product name, description or SKU,
 or filter the catalog by category.
 </p>
 </div>

 <details className="group relative shrink-0">
 <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground shadow-sm transition hover:border-primary hover:text-primary sm:px-4 sm:py-2.5 sm:text-sm">
 <span className="max-w-[180px] truncate">{selectedLocationLabel}</span>
 <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
 </summary>

 <div className="absolute right-0 z-40 mt-2 w-[290px] overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-lg">
 <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
 {t("footer_shop_products")}
 </p>

 {[
 { value: "all" as LocationFilter, label: `🌐 ${t("filter_all_products")}`, note: "" },
 { value: "local" as LocationFilter, label: `🇹🇿 ${t("filter_local")}`, note: "" },
 { value: "global" as LocationFilter, label: `🌍 ${t("filter_global")}`, note: "" },
 ].map((item) => (
 <button
 key={item.value}
 type="button"
 onClick={(event) => {
 setLocationFilter(item.value);
 setPage(1);
 (event.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open");
 }}
 className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition ${
 locationFilter === item.value
 ? "bg-primary/10 text-primary"
 : "text-foreground hover:bg-muted "
 }`}
 >
 <span>
 <span className="block text-sm font-semibold">{item.label}</span>
 <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.note}</span>
 </span>
 </button>
 ))}

 {countryOptions.length > 0 && (
 <>
 <div className="my-2 border-t border-border" />
 <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
 Countries
 </p>
 <div className="max-h-52 overflow-y-auto">
 {countryOptions.map((country) => {
 const value = `country:${country}` as LocationFilter;
 return (
 <button
 key={country}
 type="button"
 onClick={(event) => {
 setLocationFilter(value);
 setPage(1);
 (event.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open");
 }}
 className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
 locationFilter === value
 ? "bg-primary/10 text-primary"
 : "text-foreground hover:bg-muted "
 }`}
 >
 <span className="text-base">{flagForCountry(country)}</span>
 <span>{countryDisplayName(country)}</span>
 </button>
 );
 })}
 </div>
 </>
 )}

 <div className="mt-2 border-t border-border p-2">
 <Link
 href="/shop-with-sidebar"
 className="flex w-full items-center justify-center rounded-lg bg-foreground px-4 py-2.5 text-xs font-semibold text-background transition hover:bg-primary/90 dark:bg-card dark:text-foreground"
 >
 Open full shop
 </Link>
 </div>
 </div>
 </details>
 </div>

 {/* Mobile category rail */}
 <div className="xerin-horizontal-scroll -mx-4 mb-4 flex gap-2 px-4 pb-1 sm:hidden">
 <button
 type="button"
 onClick={() => {
 setCategoryId("");
 setPage(1);
 }}
 className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${
 !categoryId
 ? "border-primary bg-primary text-primary-foreground"
 : "border-border bg-card text-foreground"
 }`}
 >
 All
 </button>
 {categories.map((category) => (
 <button
 key={String(category.id)}
 type="button"
 onClick={() => {
 setCategoryId(String(category.id));
 setPage(1);
 }}
 className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${
 categoryId === String(category.id)
 ? "border-primary bg-primary text-primary-foreground"
 : "border-border bg-card text-foreground"
 }`}
 >
 {category.name}
 </button>
 ))}
 </div>

 {/* Active filters */}
 {(categoryId || locationFilter !== "all") && (
 <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
 <span className="text-muted-foreground">Active filters:</span>
 {categoryId && (
 <span className="rounded-full bg-card px-3 py-1 font-medium text-primary shadow-sm">
 Category: {categoryNameById.get(categoryId) ?? "Selected category"}
 </span>
 )}
 {locationFilter !== "all" && (
 <span className="rounded-full bg-card px-3 py-1 font-medium text-primary shadow-sm">
 Location: {selectedLocationLabel}
 </span>
 )}
 <button
 type="button"
 onClick={clearFilters}
 className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
 >
 Clear filters
 </button>
 </div>
 )}

 {/* Results information */}
 <div className="mb-3 hidden flex-wrap items-center justify-between gap-3 sm:flex sm:mb-5">
 <p className="text-sm text-muted-foreground">
 {isLoading
 ? "Loading products..."
 : products.length
 ? `Showing products ${showingFrom}-${showingTo}`
 : "No products to show"}
 </p>
 <span className="rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
 Page {page}
 </span>
 </div>

 {/* Product states */}
 {isLoading ? (
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
 {Array.from({ length: 8 }).map((_, index) => (
 <div
 key={index}
 className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
 >
 <div className="aspect-square animate-pulse bg-muted sm:h-64 sm:aspect-auto" />
 <div className="space-y-2 p-3 sm:space-y-3 sm:p-5">
 <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
 <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
 <div className="h-4 w-full animate-pulse rounded bg-muted" />
 <div className="h-6 w-2/5 animate-pulse rounded bg-muted" />
 </div>
 </div>
 ))}
 </div>
 ) : isError ? (
 <div className="rounded-2xl border border-red-light-4 bg-red-light-6 px-6 py-12 text-center">
 <h3 className="font-semibold text-red-dark">Products could not be loaded</h3>
 <p className="mt-2 text-sm text-destructive">
 The product catalog could not be loaded. Please try again.
 </p>
 <button
 type="button"
 onClick={() => void refetch()}
 className="mt-5 rounded-lg bg-destructive px-5 py-2.5 text-sm font-semibold text-white"
 >
 Retry
 </button>
 </div>
 ) : products.length === 0 ? (
 <div className="px-6 py-14 text-center">
 <p className="text-base font-medium text-foreground">No products found</p>
 <p className="mt-1.5 text-sm text-muted-foreground">
 Try another search term, category, or location filter.
 </p>
 {(categoryId || locationFilter !== "all") && (
 <button
 type="button"
 onClick={clearFilters}
 className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
 >
 Show all products
 </button>
 )}
 </div>
 ) : (
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
 {products.map((product) => {
 const uiProduct = mapApiProductToUiProduct(product);
 const imageUrl = uiProduct.imgs?.previews?.[0] ?? "/images/products/placeholder.svg";
 const regularPrice = Number(product.price || 0);
 const salePrice = product.sale_price ? Number(product.sale_price) : null;
 const hasDiscount = salePrice !== null && salePrice > 0 && salePrice < regularPrice;
 const discountPercentage = hasDiscount
 ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
 : 0;

 return (
 <article
 key={String(product.id)}
 className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
 >
 <Link
 href={`/products/${product.id}`}
 className="relative block aspect-square overflow-hidden bg-muted"
 >
 {hasDiscount && (
 <span className="absolute left-2 top-2 z-10 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
 -{discountPercentage}%
 </span>
 )}
 <Image
 src={imageUrl}
 alt={product.name}
 width={400}
 height={400}
 className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
 />
 </Link>

 <div className="flex flex-1 flex-col p-2.5 sm:p-3">
 <h3 className="line-clamp-2 min-h-[34px] text-[12px] font-medium leading-[17px] text-foreground transition group-hover:text-primary sm:min-h-[36px] sm:text-[13px] sm:leading-[18px]">
 <Link href={`/products/${product.id}`}>{product.name}</Link>
 </h3>

 <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
 <span className="text-[14px] font-extrabold text-foreground sm:text-[15px]">
 <PriceDisplay amount={hasDiscount ? salePrice! : regularPrice} sourceCurrency={product.currency} />
 </span>
 {hasDiscount && (
 <span className="text-[10px] text-muted-foreground line-through sm:text-[11px]">
 <PriceDisplay amount={regularPrice} sourceCurrency={product.currency} />
 </span>
 )}
 </div>

 {(() => {
 const store = storeById.get(String(product.store_id));
 const country = normalizedCountry(store?.country);
 const countryLabel = country
 ? countryDisplayName(country)
 : store?.store_scope === "local"
 ? "Tanzania"
 : "Marketplace";

 return (
 <div className="mt-1.5 flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
 <HugeiconsIcon icon={Location01Icon} size={11} className="shrink-0" />
 <span className="truncate">{countryLabel}</span>
 </div>
 );
 })()}
 </div>
 </article>
 );
 })}
 </div>
 )}

 {/* Pagination */}
 {!isLoading && !isError && (page > 1 || hasNextPage) && (
 <div className="mt-5 flex items-center justify-center gap-2 sm:mt-6 sm:gap-3">
 <button
 type="button"
 onClick={() => {
 setPage((current) => Math.max(1, current - 1));
 window.scrollTo({ top: 0, behavior: "smooth" });
 }}
 disabled={page === 1 || isFetching}
 className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
 >
 Previous
 </button>

 <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-orange px-4 text-sm font-semibold text-white">
 {page}
 </span>

 <button
 type="button"
 onClick={() => {
 setPage((current) => current + 1);
 window.scrollTo({ top: 0, behavior: "smooth" });
 }}
 disabled={!hasNextPage || isFetching}
 className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
 >
 Next
 </button>
 </div>
 )}
 </div>
 </section>
 );
};

export default Categories;
