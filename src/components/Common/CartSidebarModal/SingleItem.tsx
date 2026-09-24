import React from "react";
import { useRemoveCartItem, type CartItemUi } from "@/hooks/useCartActions";
import Image from "next/image";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";

const SingleItem = ({ item }: { item: CartItemUi }) => {
 const removeItem = useRemoveCartItem();

 const handleRemoveFromCart = () => {
 removeItem.mutate(item.cartItemId);
 };

 return (
 <div className="flex items-center justify-between gap-3 sm:gap-5">
 <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
 <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted sm:h-22.5 sm:w-full sm:max-w-[90px]">
 <Image src={item.imgs?.thumbnails?.[0] || "/images/products/placeholder.svg"} alt="product" width={100} height={100} />
 </div>

 <div className="min-w-0 flex-1">
 <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground transition hover:text-primary sm:text-base sm:font-medium">
 <a href={`/products/${item.productId}`}> {item.title} </a>
 </h3>
 <p className="text-custom-sm">Price: <PriceDisplay amount={item.discountedPrice} sourceCurrency="TZS" /></p>
 </div>
 </div>

 <button
 onClick={handleRemoveFromCart}
 disabled={removeItem.isPending}
 aria-label="button for remove product from cart"
 className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg sm:h-9.5 sm:w-full sm:max-w-[38px] bg-muted border border-border text-foreground ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red disabled:opacity-50"
 >
 <HugeiconsIcon icon={Delete02Icon} size={22} />
 </button>
 </div>
 );
};

export default SingleItem;
