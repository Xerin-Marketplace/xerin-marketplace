import React from "react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useRemoveFromWishlist } from "@/hooks/useWishlist";
import { useAddCartItem, addProductToCartPayload } from "@/hooks/useCartActions";
import Image from "next/image";
import PriceDisplay from "@/components/shared/PriceDisplay";
import type { WishListItem } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";

const SingleItem = ({ item }: { item: WishListItem }) => {
 const removeItemFromWishlist = useWishlistStore((state) => state.removeItemFromWishlist);
 const removeFromBackend = useRemoveFromWishlist();
 const addCartItem = useAddCartItem();
 const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

 const handleRemoveFromWishlist = () => {
 if (!isAuthenticated) removeItemFromWishlist(item.id);
 removeFromBackend.mutate(String(item.id));
 };

 const handleAddToCart = () => {
 addCartItem.mutate(addProductToCartPayload({
 id: item.id,
 title: item.title,
 price: item.price,
 discountedPrice: item.discountedPrice,
 imgs: item.imgs,
 reviews: 0,
 }));
 };

 return (
 <div className="flex items-center border-t border-border py-5 px-10">
 <div className="min-w-[83px]">
 <button
 onClick={() => handleRemoveFromWishlist()}
 disabled={removeFromBackend.isPending}
 aria-label="button for remove product from wishlist"
 className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-muted border border-border ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red disabled:opacity-50"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={22} />
 </button>
 </div>

 <div className="min-w-[387px]">
 <div className="flex items-center justify-between gap-5">
 <div className="w-full flex items-center gap-5.5">
 <div className="flex items-center justify-center rounded-md bg-muted max-w-[80px] w-full h-17.5">
 <Image src={item.imgs?.thumbnails?.[0] || "/images/products/placeholder.svg"} alt="product" width={200} height={200} />
 </div>

 <div>
 <h3 className="text-foreground ease-out duration-200 hover:text-primary">
 <a href={`/products/${item.id}`}> {item.title} </a>
 </h3>
 </div>
 </div>
 </div>
 </div>

 <div className="min-w-[205px]">
 <p className="text-foreground"><PriceDisplay amount={item.discountedPrice} sourceCurrency={item.currency || "TZS"} /></p>
 </div>

 <div className="min-w-[265px]">
 <div className="flex items-center gap-1.5">
 <HugeiconsIcon icon={InformationCircleIcon} size={20} />

 <span className="text-muted-foreground"> {item.status === "in_stock" ? "In stock" : item.status === "out_of_stock" ? "Out of stock" : "Unavailable"} </span>
 </div>
 </div>

 <div className="min-w-[150px] flex justify-end">
 <button
 onClick={() => handleAddToCart()}
 disabled={addCartItem.isPending}
 className="inline-flex text-foreground hover:text-white bg-muted border border-border py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-primary hover:border-primary disabled:opacity-50"
 >
 {addCartItem.isPending ? "Adding..." : "Add to Cart"}
 </button>
 </div>
 </div>
 );
};

export default SingleItem;
