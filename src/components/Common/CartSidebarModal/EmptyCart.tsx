import React from "react";
import Link from "next/link";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingCart01Icon } from "@hugeicons/core-free-icons";

const EmptyCart = () => {
 const { closeCartModal } = useCartModalContext();

 return (
 <div className="text-center">
 <div className="mx-auto pb-7.5">
 <div className="mx-auto grid size-24 place-items-center rounded-full bg-muted"><HugeiconsIcon icon={ShoppingCart01Icon} size={40} className="text-muted-foreground" /></div>
 </div>

 <h3 className="font-semibold text-lg text-foreground">Your cart is empty</h3>
 <p className="pb-6 pt-2 text-muted-foreground">Browse products and add items to your cart.</p>

 <Link
 onClick={() => closeCartModal()}
 href="/shop-with-sidebar"
 className="w-full lg:w-10/12 mx-auto flex justify-center font-medium text-background bg-foreground py-[13px] px-6 rounded-lg ease-out duration-200 hover:bg-opacity-95"
 >
 Continue Shopping
 </Link>
 </div>
 );
};

export default EmptyCart;
