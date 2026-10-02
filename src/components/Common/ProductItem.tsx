"use client";
import React from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { useQuickViewStore } from "@/store/useQuickViewStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAddCartItem, addProductToCartPayload } from "@/hooks/useCartActions";
import { useAddToWishlist } from "@/hooks/useWishlist";
import { useLanguage } from "@/app/context/LanguageContext";
import StarRating from "@/components/Common/StarRating";
import Link from "next/link";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon, ViewIcon } from "@hugeicons/core-free-icons";

const ProductItem = ({ item }: { item: Product }) => {
 const { openModal } = useModalContext();

 const updateQuickView = useQuickViewStore((state) => state.updateQuickView);
 const addCartItem = useAddCartItem();
 const { t } = useLanguage();
 const addToWishlist = useAddToWishlist();
 const addItemToWishlistLocal = useWishlistStore((state) => state.addItemToWishlist);

 const hasDiscount = item.price > item.discountedPrice;
 const savingsPercent = hasDiscount
 ? Math.round(((item.price - item.discountedPrice) / item.price) * 100)
 : 0;

 // update the QuickView state
 const handleQuickViewUpdate = () => {
 updateQuickView({ ...item });
 };

 // add to cart
 const handleAddToCart = () => {
 addCartItem.mutate(addProductToCartPayload(item));
 };

 const handleItemToWishList = () => {
 addItemToWishlistLocal({
 ...item,
 status: "available",
 quantity: 1,
 });
 addToWishlist.mutate(String(item.id));
 };

 return (
 <div className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
 <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted sm:aspect-auto sm:min-h-[285px]">
 {hasDiscount && (
 <span className="absolute left-2 top-2 z-10 rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground shadow-sm sm:left-4 sm:top-4 sm:rounded-full sm:px-3 sm:text-xs sm:font-semibold">
 Save {savingsPercent}%
 </span>
 )}

 <button
 onClick={() => handleItemToWishList()}
 disabled={addToWishlist.isPending}
 aria-label="Add to wishlist"
 className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-card/95 text-foreground shadow-sm transition-colors duration-200 hover:bg-primary hover:text-primary-foreground dark:bg-muted dark:text-foreground disabled:opacity-50 sm:right-4 sm:top-4"
 >
 <HugeiconsIcon icon={FavouriteIcon} size={16} />
 </button>

 <Image
 src={item.imgs.previews[0]}
 alt={item.title}
 width={250}
 height={250}
 className="h-auto max-h-[160px] w-auto max-w-[90%] object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03] sm:max-h-[240px] sm:p-8"
 />

 <div className="absolute inset-x-0 bottom-0 hidden translate-y-full items-center justify-center gap-2.5 px-4 pb-5 transition-transform duration-300 group-hover:translate-y-0 sm:flex">
 <button
 onClick={() => {
 openModal();
 handleQuickViewUpdate();
 }}
 aria-label="Quick view product"
 className="flex h-10 w-10 items-center justify-center rounded-md bg-card text-foreground shadow-sm transition-colors duration-200 hover:bg-primary hover:text-primary-foreground dark:bg-muted dark:text-foreground"
 >
 <HugeiconsIcon icon={ViewIcon} size={16} />
 </button>

 <button
 onClick={() => handleAddToCart()}
 disabled={addCartItem.isPending}
 className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-4 py-[10px] text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 disabled:opacity-50"
 >
 {addCartItem.isPending ? "Adding..." : t("product_add_to_cart")}
 </button>
 </div>
 </div>

 <div className="flex flex-1 flex-col p-2.5 sm:p-5">
 <div className="mb-2 flex min-w-0 items-center justify-between gap-2 sm:mb-3 sm:gap-3">
 <StarRating rating={item.rating} reviewCount={item.reviewCount ?? item.reviews} size={14} />

 <span className="hidden rounded-full bg-green-light-6 px-3 py-1 text-xs font-semibold text-green-dark sm:inline-flex">
 Delivery options at checkout
 </span>
 </div>

 <h3
 className="mb-2 line-clamp-2 min-h-[38px] text-[13px] font-semibold leading-[19px] text-foreground transition-colors duration-200 hover:text-primary sm:min-h-0 sm:text-base sm:leading-normal"
 >
 <Link href={`/products/${item.id}`}>{item.title}</Link>
 </h3>



 <div className="mt-auto flex min-w-0 items-end justify-between gap-2 sm:gap-4">
 <div>
 <span className="mb-1 hidden text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground sm:block">
 Price
 </span>
 <span className="flex min-w-0 flex-wrap items-baseline gap-1 text-sm font-extrabold sm:gap-2 sm:text-lg sm:font-semibold">
 <span className="text-foreground">
 <PriceDisplay amount={item.discountedPrice} sourceCurrency={item.currency} />
 </span>
 <span className="text-[10px] text-muted-foreground line-through sm:text-sm">
 <PriceDisplay amount={item.price} sourceCurrency={item.currency} />
 </span>
 </span>
 </div>

 <button
 onClick={() => {
 openModal();
 handleQuickViewUpdate();
 }}
 className="hidden items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background sm:inline-flex"
 >
 Quick view
 </button>
 </div>

 <button
 type="button"
 onClick={handleAddToCart}
 disabled={addCartItem.isPending}
 className="mt-2 flex h-10 w-full items-center justify-center rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:hidden"
 >
 {addCartItem.isPending ? "Adding..." : t("product_add_to_cart")}
 </button>
 </div>
 </div>
 );
};

export default ProductItem;