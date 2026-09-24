"use client";
import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { useQuickViewStore } from "@/store/useQuickViewStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAddCartItem, addProductToCartPayload } from "@/hooks/useCartActions";
import { useAddToWishlist } from "@/hooks/useWishlist";
import StarRating from "@/components/Common/StarRating";
import PriceDisplay from "@/components/shared/PriceDisplay";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, FavouriteIcon } from "@hugeicons/core-free-icons";

const SingleGridItem = ({ item }: { item: Product }) => {
 const { openModal } = useModalContext();

 const updateQuickView = useQuickViewStore((state) => state.updateQuickView);
 const addCartItem = useAddCartItem();
 const addToWishlist = useAddToWishlist();
 const addItemToWishlistLocal = useWishlistStore((state) => state.addItemToWishlist);

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
 <div className="group">
 <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-card shadow-1 min-h-[270px] mb-4">
 <Image src={item.imgs.previews[0]} alt="" width={250} height={250} />

 <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
 <button
 onClick={() => {
 openModal();
 handleQuickViewUpdate();
 }}
 id="newOne"
 aria-label="button for quick view"
 className="flex items-center justify-center w-9 h-9 rounded-lg shadow-1 ease-out duration-200 text-foreground bg-card hover:text-primary"
 >
 <HugeiconsIcon icon={ViewIcon} size={16} />
 </button>

 <button
 onClick={() => handleAddToCart()}
 disabled={addCartItem.isPending}
 className="inline-flex font-medium text-custom-sm py-[7px] px-5 rounded-lg bg-blue text-white ease-out duration-200 hover:bg-primary-dark disabled:opacity-50"
 >
 {addCartItem.isPending ? "Adding..." : "Add to cart"}
 </button>

 <button
 onClick={() => handleItemToWishList()}
 disabled={addToWishlist.isPending}
 aria-label="button for favorite select"
 id="favOne"
 className="flex items-center justify-center w-9 h-9 rounded-lg shadow-1 ease-out duration-200 text-foreground bg-card hover:text-primary disabled:opacity-50"
 >
 <HugeiconsIcon icon={FavouriteIcon} size={16} />
 </button>
 </div>
 </div>

 <div className="flex items-center gap-2.5 mb-2">
 <StarRating rating={item.rating} reviewCount={item.reviewCount ?? item.reviews} size={15} />
 </div>

 <h3 className="font-medium text-foreground ease-out duration-200 hover:text-primary mb-1.5">
 <Link href={`/products/${item.id}`}> {item.title} </Link>
 </h3>

 <span className="flex items-center gap-2 font-medium text-lg">
 <span className="text-foreground"><PriceDisplay amount={item.discountedPrice} sourceCurrency={item.currency} /></span>
 <span className="text-muted-foreground line-through"><PriceDisplay amount={item.price} sourceCurrency={item.currency} /></span>
 </span>
 </div>
 );
};

export default SingleGridItem;
