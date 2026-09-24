"use client";

import React, { useState, useEffect } from "react";
import { resolveProductImageUrl } from "@/lib/products/adapters";
import Link from "next/link";
import Image from "next/image";
import { useCategories, useProducts } from "@/hooks/useProducts";
import type { Category } from "@/types/api/product";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Shirt01Icon, HeadphonesIcon, Home01Icon, BlushBrush01Icon, Basketball01Icon, ShoesIcon, DiamondIcon, Briefcase01Icon, KidIcon, Car01Icon, GridIcon, StarIcon } from "@hugeicons/core-free-icons";

interface CategoryMegaMenuProps {
 isOpen: boolean;
 onClose: () => void;
}

// Map common category names to representative icons
const getCategoryIcon = (name: string) => {
 const icon = (iconData: IconSvgElement) => (
 <HugeiconsIcon icon={iconData} size={18} className="shrink-0" />
 );
 const lower = name.toLowerCase();
 if (lower.includes("apparel") || lower.includes("fashion") || lower.includes("cloth") || lower.includes("women") || lower.includes("men")) {
 return icon(Shirt01Icon);
 }
 if (lower.includes("electronic") || lower.includes("phone") || lower.includes("computer") || lower.includes("tech")) {
 return icon(HeadphonesIcon);
 }
 if (lower.includes("home") || lower.includes("garden") || lower.includes("furniture") || lower.includes("kitchen")) {
 return icon(Home01Icon);
 }
 if (lower.includes("beauty") || lower.includes("health") || lower.includes("cosmetic")) {
 return icon(BlushBrush01Icon);
 }
 if (lower.includes("sport") || lower.includes("outdoor") || lower.includes("fitness")) {
 return icon(Basketball01Icon);
 }
 if (lower.includes("shoe") || lower.includes("footwear") || lower.includes("sneaker")) {
 return icon(ShoesIcon);
 }
 if (lower.includes("jewelry") || lower.includes("watch") || lower.includes("accessory") || lower.includes("ring")) {
 return icon(DiamondIcon);
 }
 if (lower.includes("bag") || lower.includes("luggage") || lower.includes("case")) {
 return icon(Briefcase01Icon);
 }
 if (lower.includes("kid") || lower.includes("toy") || lower.includes("baby")) {
 return icon(KidIcon);
 }
 if (lower.includes("vehicle") || lower.includes("car") || lower.includes("motor") || lower.includes("auto")) {
 return icon(Car01Icon);
 }
 // Default general grid icon
 return icon(GridIcon);
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
 <div className="flex h-[78vh] max-h-[580px] lg:h-[540px] overflow-hidden rounded-b-2xl border border-t-0 border-border bg-card shadow-lg">
 {/* Left Column: Category List (Alibaba style) */}
 <div className="w-[120px] sm:w-[220px] lg:w-[280px] shrink-0 overflow-y-auto border-r border-border py-2 lg:py-3">
 <ul className="flex flex-col">
 {/* Top Featured Entry: "Categories for you" */}
 <li>
 <button
 type="button"
 onMouseEnter={() => setSelectedCategoryId("all")}
 onClick={() => setSelectedCategoryId("all")}
 className={`relative flex w-full items-center gap-2 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 lg:py-3 text-left text-xs lg:text-custom-sm font-medium transition-colors ${
 selectedCategoryId === "all"
 ? "bg-muted text-foreground font-semibold before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-foreground dark:bg-muted dark:text-background dark:before:bg-orange"
 : "text-muted-foreground hover:bg-muted/60 hover:text-foreground dark:hover:bg-card/5 dark:hover:text-white"
 }`}
 >
 <HugeiconsIcon icon={StarIcon} size={18} className="text-primary" />
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
 ? "bg-muted text-foreground font-semibold before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-foreground dark:bg-muted dark:text-background dark:before:bg-orange"
 : "text-muted-foreground hover:bg-muted/60 hover:text-foreground dark:hover:bg-card/5 dark:hover:text-white"
 }`}
 >
 <span className={`${isSelected ? "text-foreground" : "text-muted-foreground/70 /50"}`}>
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
 <div className="mb-4 lg:mb-6 flex items-center justify-between border-b border-border pb-2.5 lg:pb-3">
 <h3 className="text-sm font-bold text-foreground sm:text-base lg:text-lg">
 {selectedCategoryId === "all" ? "Categories for you" : activeCategory?.name}
 </h3>
 <Link
 href={
 selectedCategoryId === "all"
 ? "/shop-with-sidebar"
 : `/shop-with-sidebar?category_id=${encodeURIComponent(selectedCategoryId)}`
 }
 onClick={onClose}
 className="text-2xs sm:text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-primary hover:underline /70 dark:hover:text-primary"
 >
 Browse all &rarr;
 </Link>
 </div>

 {/* Circular Item Grid */}
 {isProductsLoading ? (
 <div className="flex h-64 items-center justify-center">
 <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
 </div>
 ) : products.length === 0 ? (
 <div className="flex h-64 flex-col items-center justify-center text-center">
 <p className="text-sm font-medium text-muted-foreground /50">
 No products available in this category.
 </p>
 <Link
 href="/shop-with-sidebar"
 onClick={onClose}
 className="mt-3 rounded-md bg-orange px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
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
 <div className="relative mb-2 flex size-16 sm:size-20 lg:size-22 items-center justify-center rounded-full bg-muted p-1.5 sm:p-2 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-md dark:bg-muted">
 {/* Hot / Trending Badge */}
 {isHot && (
 <span
 className="absolute -right-0.5 top-0 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] text-white shadow"
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
 src={resolveProductImageUrl(product.images![0].image_url)}
 alt={product.name}
 width={64}
 height={64}
 className="size-11 sm:size-14 lg:size-16 rounded-full object-contain"
 />
 ) : (
 <div className="flex size-11 sm:size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
 {getCategoryIcon(activeCategory?.name || "all")}
 </div>
 )}
 </div>

 {/* Product Name */}
 <span className="line-clamp-2 max-w-[85px] sm:max-w-[100px] text-[11px] sm:text-xs font-medium leading-tight text-foreground transition-colors group-hover:text-primary dark:group-hover:text-primary">
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
