import React, { useState } from "react";
import { useUpdateCartItem, useRemoveCartItem, type CartItemUi } from "@/hooks/useCartActions";
import Image from "next/image";
import Link from "next/link";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon, Delete02Icon } from "@hugeicons/core-free-icons";

const SingleItem = ({ item }: { item: CartItemUi }) => {
 const [quantity, setQuantity] = useState(item.quantity);
 const updateItem = useUpdateCartItem();
 const removeItem = useRemoveCartItem();

 const handleRemoveFromCart = () => {
 removeItem.mutate(item.cartItemId);
 };

 const handleIncreaseQuantity = () => {
 const next = quantity + 1;
 setQuantity(next);
 updateItem.mutate({ itemId: item.cartItemId, quantity: next });
 };

 const handleDecreaseQuantity = () => {
 if (quantity > 1) {
 const next = quantity - 1;
 setQuantity(next);
 updateItem.mutate({ itemId: item.cartItemId, quantity: next });
 }
 };

 return (
 <div className="flex items-center border-t border-border py-5 px-7.5">
 <div className="min-w-[400px]">
 <div className="flex items-center justify-between gap-5">
 <div className="w-full flex items-center gap-5.5">
 <div className="flex items-center justify-center rounded-md bg-muted max-w-[80px] w-full h-17.5">
 <Image width={200} height={200} src={item.imgs?.thumbnails?.[0] || "/images/products/placeholder.svg"} alt="product" />
 </div>

 <div>
 <h3 className="text-foreground ease-out duration-200 hover:text-primary">
 <Link href={`/products/${item.productId}`}> {item.title} </Link>
 </h3>
 </div>
 </div>
 </div>
 </div>

 <div className="min-w-[180px]">
 <p className="text-foreground"><PriceDisplay amount={item.discountedPrice} sourceCurrency="TZS" /></p>
 </div>

 <div className="min-w-[275px]">
 <div className="w-max flex items-center rounded-md border border-border">
 <button
 onClick={() => handleDecreaseQuantity()}
 aria-label="button for remove product"
 disabled={updateItem.isPending}
 className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-primary disabled:opacity-50"
 >
 <HugeiconsIcon icon={MinusSignIcon} size={20} />
 </button>

 <span className="flex items-center justify-center w-16 h-11.5 border-x border-border">
 {quantity}
 </span>

 <button
 onClick={() => handleIncreaseQuantity()}
 aria-label="button for add product"
 disabled={updateItem.isPending}
 className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-primary disabled:opacity-50"
 >
 <HugeiconsIcon icon={PlusSignIcon} size={20} />
 </button>
 </div>
 </div>

 <div className="min-w-[200px]">
 <p className="text-foreground"><PriceDisplay amount={item.discountedPrice * quantity} sourceCurrency="TZS" /></p>
 </div>

 <div className="min-w-[50px] flex justify-end">
 <button
 onClick={() => handleRemoveFromCart()}
 aria-label="button for remove product from cart"
 disabled={removeItem.isPending}
 className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-muted border border-border text-foreground ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-destructive disabled:opacity-50"
 >
 <HugeiconsIcon icon={Delete02Icon} size={22} />
 </button>
 </div>
 </div>
 );
};

export default SingleItem;
