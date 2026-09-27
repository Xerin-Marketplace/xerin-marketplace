"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import BrandDropdown from "./BrandDropdown";
import PriceDropdown from "./PriceDropdown";
import { useCategories } from "@/lib/products";
import { mapSearchItemToUiProduct } from "@/lib/products/adapters";
import { discoveryApi } from "@/lib/api/endpoints/discovery";
import type { SearchSort } from "@/types/api/discovery";
import type { Product as UiProduct } from "@/types/product";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import Pagination from "../ui/Pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, GridIcon, Menu01Icon } from "@hugeicons/core-free-icons";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
 { label: "Latest Products", value: "newest" },
 { label: "Best Selling", value: "popular" },
 { label: "Price: Low to High", value: "price_asc" },
 { label: "Price: High to Low", value: "price_desc" },
];

const ShopWithSidebar = () => {
 const searchParams = useSearchParams();
 const router = useRouter();
 const categoryId = searchParams.get("category_id") || undefined;
 const minPrice = searchParams.get("min_price") || "";
 const maxPrice = searchParams.get("max_price") || "";
 const brandId = searchParams.get("brand_id") || undefined;
 const inStockOnly = searchParams.get("in_stock") === "1";
 const sort = (searchParams.get("sort") || "newest") as SearchSort;
 const page = Math.max(1, Number(searchParams.get("page") || 1));
 const [productStyle, setProductStyle] = useState("grid");
 const [productSidebar, setProductSidebar] = useState(false);
 const [stickyMenu, setStickyMenu] = useState(false);

 const [products, setProducts] = useState<UiProduct[]>([]);
 const [totalCount, setTotalCount] = useState(0);
 const [productsLoading, setProductsLoading] = useState(true);
 const [productsError, setProductsError] = useState<string | null>(null);

 const updateParams = (updates: Record<string, string | null>) => {
 const next = new URLSearchParams(searchParams.toString());
 Object.entries(updates).forEach(([key, value]) => {
 if (!value) next.delete(key);
 else next.set(key, value);
 });
 router.push(`/shop-with-sidebar?${next.toString()}`);
 };

 const handleStickyMenu = () => {
 if (window.scrollY >= 80) {
 setStickyMenu(true);
 } else {
 setStickyMenu(false);
 }
 };

 // Shop shares the discovery search endpoint with /search so both pages
 // show the same visibility criteria, totals and pagination.
 useEffect(() => {
 let active = true;
 setProductsLoading(true);
 setProductsError(null);

 discoveryApi
 .searchProducts({
 category_id: categoryId,
 min_price: minPrice ? Number(minPrice) : undefined,
 max_price: maxPrice ? Number(maxPrice) : undefined,
 brand_id: brandId,
 in_stock: inStockOnly || undefined,
 sort,
 page,
 page_size: PAGE_SIZE,
 })
 .then((data) => {
 if (!active) return;
 setProducts(data.results.map(mapSearchItemToUiProduct));
 setTotalCount(data.total);
 })
 .catch((err) => {
 if (!active) return;
 setProducts([]);
 setTotalCount(0);
 setProductsError(
 err instanceof Error
 ? err.message
 : "Unable to load products from backend.",
 );
 })
 .finally(() => {
 if (active) setProductsLoading(false);
 });

 return () => {
 active = false;
 };
 }, [categoryId, brandId, inStockOnly, minPrice, maxPrice, sort, page]);

 const {
 categories: apiCategories,
 isLoading: categoriesLoading,
 error: categoriesError,
 } = useCategories();

 const categories = apiCategories;
 const showingFrom = totalCount ? (page - 1) * PAGE_SIZE + 1 : 0;
 const showingTo = Math.min(page * PAGE_SIZE, totalCount);

 useEffect(() => {
 window.addEventListener("scroll", handleStickyMenu);

 // closing sidebar while clicking outside
 function handleClickOutside(event) {
 if (!event.target.closest(".sidebar-content")) {
 setProductSidebar(false);
 }
 }

 if (productSidebar) {
 document.addEventListener("mousedown", handleClickOutside);
 }

 return () => {
 document.removeEventListener("mousedown", handleClickOutside);
 };
 });

 return (
 <>
 <Breadcrumb
 title={"Explore All Products"}
 pages={["shop", "/", "shop with sidebar"]}
 />
 <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[var(--muted)]">
 <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
 <div className="flex gap-7.5">
 {/* <!-- Sidebar Start --> */}
 <div
 className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 ${
 productSidebar
 ? "translate-x-0 bg-card p-5 h-screen overflow-y-auto"
 : "-translate-x-full"
 }`}
 >
 <button
 onClick={() => setProductSidebar(!productSidebar)}
 aria-label="button for product sidebar toggle"
 className={`xl:hidden absolute -right-12.5 sm:-right-8 flex items-center justify-center w-8 h-8 rounded-md bg-card shadow-1 ${
 stickyMenu
 ? "lg:top-20 sm:top-34.5 top-35"
 : "lg:top-24 sm:top-39 top-37"
 }`}
 >
 <HugeiconsIcon icon={Search01Icon} size={18} />
 </button>

 <form onSubmit={(e) => e.preventDefault()}>
 <div className="flex flex-col gap-6">
 {/* <!-- filter box --> */}
 <div className="bg-card shadow-1 rounded-lg py-4 px-5">
 <div className="flex items-center justify-between">
 <p>Filters:</p>
 <button
 type="button"
 onClick={() => router.push("/shop-with-sidebar")}
 className="text-primary"
 >
 Clean All
 </button>
 </div>
 </div>

 {/* <!-- category box --> */}
 <CategoryDropdown categories={categories} />

 {/* <!-- brand box --> */}
 <BrandDropdown />

 {/* // <!-- availability --> */}
 <div className="bg-card shadow-1 rounded-lg py-4 px-5">
 <label className="flex cursor-pointer items-center gap-2 text-custom-sm font-medium text-foreground">
 <input
 type="checkbox"
 checked={inStockOnly}
 onChange={(e) =>
 updateParams({
 in_stock: e.target.checked ? "1" : null,
 page: null,
 })
 }
 className="h-4 w-4 accent-primary"
 />
 In stock only
 </label>
 </div>

 {/* // <!-- price range box --> */}
 <PriceDropdown
 minPrice={minPrice}
 maxPrice={maxPrice}
 onApply={(min, max) =>
 updateParams({
 min_price: min || null,
 max_price: max || null,
 page: null,
 })
 }
 />
 </div>
 </form>
 </div>
 {/* // <!-- Sidebar End --> */}

 {/* // <!-- Content Start --> */}
 <div className="xl:max-w-[870px] w-full">
 <div className="rounded-lg bg-card shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
 <div className="flex items-center justify-between">
 {/* <!-- top bar left --> */}
 <div className="flex flex-wrap items-center gap-4">
 <CustomSelect
 options={SORT_OPTIONS}
 value={sort}
 onChange={(value) =>
 updateParams({ sort: value, page: null })
 }
 />

 <p>
 Showing{" "}
 <span className="text-foreground">
 {showingFrom}-{showingTo} of {totalCount}
 </span>{" "}
 Products
 </p>

 {(productsLoading || categoriesLoading) && (
 <p className="text-custom-sm text-muted-foreground">
 Loading marketplace data...
 </p>
 )}

 {(productsError || categoriesError) && (
 <p className="text-custom-sm font-medium text-destructive">
 Marketplace data could not be loaded. Please try again.
 </p>
 )}
 </div>

 {/* <!-- top bar right --> */}
 <div className="flex items-center gap-2.5">
 <button
 onClick={() => setProductStyle("grid")}
 aria-label="button for product grid tab"
 className={`${
 productStyle === "grid"
 ? "bg-blue border-primary text-white"
 : "text-foreground bg-muted border-border"
 } flex items-center justify-center w-10.5 h-9 rounded-md border ease-out duration-200 hover:bg-primary hover:border-primary hover:text-primary-foreground`}
 >
 <HugeiconsIcon icon={GridIcon} size={18} />
 </button>

 <button
 onClick={() => setProductStyle("list")}
 aria-label="button for product list tab"
 className={`${
 productStyle === "list"
 ? "bg-blue border-primary text-white"
 : "text-foreground bg-muted border-border"
 } flex items-center justify-center w-10.5 h-9 rounded-md border ease-out duration-200 hover:bg-primary hover:border-primary hover:text-primary-foreground`}
 >
 <HugeiconsIcon icon={Menu01Icon} size={18} />
 </button>
 </div>
 </div>
 </div>

 {/* <!-- Products Grid Tab Content Start --> */}
 <div
 className={`${
 productStyle === "grid"
 ? "grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-7 lg:gap-x-7.5 lg:gap-y-9"
 : "flex flex-col gap-7.5"
 }`}
 >
 {!productsLoading && !productsError && products.length === 0 && (
 <div className="col-span-full rounded-lg border border-border bg-card px-6 py-12 text-center">
 <h2 className="text-lg font-semibold text-foreground">No products found</h2>
 <p className="mt-2 text-sm text-muted-foreground">There are no marketplace products matching this view.</p>
 </div>
 )}
 {products.map((item) =>
 productStyle === "grid" ? (
 <SingleGridItem item={item} key={item.id} />
 ) : (
 <SingleListItem item={item} key={item.id} />
 )
 )}
 </div>
 {/* <!-- Products Grid Tab Content End --> */}

 {/* <!-- Products Pagination Start --> */}
 <div className="mt-10">
 <Pagination
 page={page}
 totalPages={Math.max(Math.ceil(totalCount / PAGE_SIZE), 1)}
 total={totalCount}
 pageSize={PAGE_SIZE}
 onPageChange={(next) => updateParams({ page: String(next) })}
 showSummary={false}
 />
 </div>
 {/* <!-- Products Pagination End --> */}
 </div>
 {/* // <!-- Content End --> */}
 </div>
 </div>
 </section>
 </>
 );
};

export default ShopWithSidebar;
