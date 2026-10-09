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
import Link from "next/link";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon, StarIcon, ViewIcon } from "@hugeicons/core-free-icons";

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
 const reviews = item.reviewCount ?? item.reviews ?? 0;

 const handleQuickViewUpdate = () => {
 updateQuickView({ ...item });
 };

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
 <div className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
 <Link
 href={`/products/${item.id}`}
 className="relative block aspect-square overflow-hidden bg-muted"
 >
 {hasDiscount && (
 <span className="absolute left-2 top-2 z-10 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm sm:left-3 sm:top-3">
 -{savingsPercent}%
 </span>
 )}

 <button
 onClick={(e) => {
 e.preventDefault();
 handleItemToWishList();
 }}
 disabled={addToWishlist.isPending}
 aria-label="Add to wishlist"
 className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card/95 text-foreground shadow-sm transition hover:text-primary disabled:opacity-50 sm:right-3 sm:top-3"
 >
 <HugeiconsIcon icon={FavouriteIcon} size={15} />
 </button>

 <Image
 src={item.imgs.previews[0]}
 alt={item.title}
 width={400}
 height={400}
 className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
 />

 <div className="absolute inset-x-0 bottom-0 hidden translate-y-full items-center justify-center gap-2 px-4 pb-3 transition-transform duration-300 group-hover:translate-y-0 sm:flex">
 <button
 onClick={(e) => {
 e.preventDefault();
 openModal();
 handleQuickViewUpdate();
 }}
 aria-label="Quick view product"
 className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/95 text-foreground shadow-md transition hover:text-primary"
 >
 <HugeiconsIcon icon={ViewIcon} size={15} />
 </button>
 <button
 onClick={(e) => {
 e.preventDefault();
 handleAddToCart();
 }}
 disabled={addCartItem.isPending}
 className="flex-1 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:opacity-50"
 >
 {addCartItem.isPending ? "Adding..." : t("product_add_to_cart")}
 </button>
 </div>
 </Link>

 <div className="flex flex-1 flex-col p-3 sm:p-4">
 <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-medium leading-[18px] text-foreground transition group-hover:text-primary sm:min-h-[40px] sm:text-sm sm:leading-5">
 <Link href={`/products/${item.id}`}>{item.title}</Link>
 </h3>

 <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
 <span className="text-[15px] font-extrabold text-foreground sm:text-base">
 <PriceDisplay amount={item.discountedPrice} sourceCurrency={item.currency} />
 </span>
 {hasDiscount && (
 <span className="text-[11px] text-muted-foreground line-through sm:text-xs">
 <PriceDisplay amount={item.price} sourceCurrency={item.currency} />
 </span>
 )}
 </div>

 <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
 {reviews > 0 ? (
 <>
 <HugeiconsIcon icon={StarIcon} size={12} className="fill-amber-400 text-amber-400" />
 <span className="font-semibold text-foreground/80">{Number(item.rating || 0).toFixed(1)}</span>
 <span>·</span>
 <span>{reviews} review{reviews === 1 ? "" : "s"}</span>
 </>
 ) : (
 <span>New on Xerin Marketplace</span>
 )}
 </div>

 <button
 type="button"
 onClick={handleAddToCart}
 disabled={addCartItem.isPending}
 className="mt-3 flex h-9 w-full items-center justify-center rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:hidden"
 >
 {addCartItem.isPending ? "Adding..." : t("product_add_to_cart")}
 </button>
 </div>
 </div>
 );
};

export default ProductItem;
