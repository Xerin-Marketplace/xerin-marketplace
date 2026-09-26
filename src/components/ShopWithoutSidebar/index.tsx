"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";

import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import CustomSelect from "../ShopWithSidebar/CustomSelect";
import Pagination from "../ui/Pagination";

import { discoveryApi } from "@/lib/api/endpoints/discovery";
import { mapSearchItemToUiProduct } from "@/lib/products/adapters";
import type { SearchSort } from "@/types/api/discovery";
import type { Product as UiProduct } from "@/types/product";
import { HugeiconsIcon } from "@hugeicons/react";
import { GridIcon, Menu01Icon } from "@hugeicons/core-free-icons";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
 { label: "Latest Products", value: "newest" },
 { label: "Best Selling", value: "popular" },
 { label: "Price: Low to High", value: "price_asc" },
 { label: "Price: High to Low", value: "price_desc" },
];

const ShopWithoutSidebar = () => {
 const [productStyle, setProductStyle] = useState("grid");
 const [page, setPage] = useState(1);
 const [sort, setSort] = useState<SearchSort>("newest");
 const [products, setProducts] = useState<UiProduct[]>([]);
 const [totalCount, setTotalCount] = useState(0);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 // Shares the discovery search endpoint with /search so both pages show
 // the same visibility criteria, totals and pagination.
 useEffect(() => {
 let active = true;
 setIsLoading(true);
 setError(null);

 discoveryApi
 .searchProducts({ sort, page, page_size: PAGE_SIZE })
 .then((data) => {
 if (!active) return;
 setProducts(data.results.map(mapSearchItemToUiProduct));
 setTotalCount(data.total);
 })
 .catch((err) => {
 if (!active) return;
 setProducts([]);
 setTotalCount(0);
 setError(
 err instanceof Error
 ? err.message
 : "Unable to load products from backend.",
 );
 })
 .finally(() => {
 if (active) setIsLoading(false);
 });

 return () => {
 active = false;
 };
 }, [sort, page]);

 const showingFrom = totalCount ? (page - 1) * PAGE_SIZE + 1 : 0;
 const showingTo = Math.min(page * PAGE_SIZE, totalCount);

 return (
 <>
 <Breadcrumb
 title={"Explore All Products"}
 pages={["shop", "/", "shop without sidebar"]}
 />
 <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[var(--muted)]">
 <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
 <div className="flex gap-7.5">
 {/* // <!-- Content Start --> */}
 <div className="w-full">
 <div className="rounded-lg bg-card shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
 <div className="flex items-center justify-between">
 {/* <!-- top bar left --> */}
 <div className="flex flex-wrap items-center gap-4">
 <CustomSelect
 options={SORT_OPTIONS}
 value={sort}
 onChange={(value) => {
 setSort(value as SearchSort);
 setPage(1);
 }}
 />

 <p>
 Showing{" "}
 <span className="text-foreground">
 {showingFrom}-{showingTo} of {totalCount}
 </span>{" "}
 Products
 </p>
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
 ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-7 lg:gap-x-7.5 lg:gap-y-9"
 : "flex flex-col gap-7.5"
 }`}
 >
 {isLoading && <CatalogState text="Loading products..." />}
 {error && <CatalogState error text="Products could not be loaded. Please try again." />}
 {!isLoading && !error && products.length === 0 && (
 <CatalogState text="No products are available yet." />
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
 onPageChange={setPage}
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

const CatalogState = ({ text, error = false }: { text: string; error?: boolean }) => (
 <div className={`w-full rounded-xl border bg-card px-6 py-12 text-center text-sm ${error ? "border-red-light-4 text-destructive" : "border-border text-muted-foreground"}`}>
 {text}
 </div>
);

export default ShopWithoutSidebar;
