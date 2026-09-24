"use client";
import React, { useEffect, useState } from "react";

import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useCartView } from "@/hooks/useCartActions";
import SingleItem from "./SingleItem";
import Link from "next/link";
import EmptyCart from "./EmptyCart";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

const CartSidebarModal = () => {
 const { isCartModalOpen, closeCartModal } = useCartModalContext();
 const { items: cartItems, total: totalPrice, isAuthenticated } = useCartView();

 useEffect(() => {
 // closing modal while clicking outside
 function handleClickOutside(event) {
 if (!event.target.closest(".modal-content")) {
 closeCartModal();
 }
 }

 if (isCartModalOpen) {
 document.addEventListener("mousedown", handleClickOutside);
 }

 return () => {
 document.removeEventListener("mousedown", handleClickOutside);
 };
 }, [isCartModalOpen, closeCartModal]);

 return (
 <div
 aria-hidden={!isCartModalOpen}
 className={`fixed inset-0 z-99999 w-full overflow-hidden bg-black/70 ease-linear duration-300 ${
 isCartModalOpen ? "visible translate-x-0 opacity-100" : "invisible pointer-events-none translate-x-full opacity-0"
 }`}
 >
 <div className="flex min-h-[100dvh] items-stretch justify-end">
 <div className="modal-content relative flex h-[100dvh] w-full max-w-[500px] flex-col bg-card px-4 shadow-1 sm:px-7.5 lg:px-11">
 <div className="z-10 flex shrink-0 items-center justify-between border-b border-border bg-card pb-4 pt-[max(14px,env(safe-area-inset-top))] sm:pb-7 sm:pt-7.5 lg:pt-11">
 <h2 className="font-medium text-foreground text-lg sm:text-2xl">
 Cart View
 </h2>
 <button
 onClick={() => closeCartModal()}
 aria-label="button for close modal"
 className="flex items-center justify-center ease-in duration-150 bg-meta text-muted-foreground hover:text-foreground dark:hover:text-white"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={18} />
 </button>
 </div>

 <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto py-4 sm:py-7.5">
 <div className="flex flex-col gap-6">
 {/* <!-- cart item --> */}
 {cartItems.length > 0 ? (
 cartItems.map((item, key) => (
 <SingleItem
 key={key}
 item={item}
 />
 ))
 ) : (
 <EmptyCart />
 )}
 </div>
 </div>

 {cartItems.length > 0 && <div className="shrink-0 border-t border-border bg-card pb-[calc(var(--xerin-mobile-nav-height)+var(--xerin-safe-bottom)+10px)] pt-4 sm:pb-7.5 sm:pt-5 lg:pb-11">
 <div className="flex items-center justify-between gap-5 mb-6">
 <p className="font-medium text-xl text-foreground">Subtotal:</p>

 <p className="font-medium text-xl text-foreground"><PriceDisplay amount={totalPrice} sourceCurrency="TZS" /></p>
 </div>

 <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-4">
 <Link
 onClick={() => closeCartModal()}
 href="/cart"
 className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark sm:px-6 sm:font-medium"
 >
 View Cart
 </Link>

 <Link
 href={isAuthenticated ? "/checkout" : "/signin?redirect=/checkout"}
 className="flex h-12 w-full items-center justify-center rounded-lg bg-foreground px-3 text-sm font-semibold text-background transition hover:bg-opacity-95 sm:px-6 sm:font-medium"
 >
 Checkout
 </Link>
 </div>
 </div>}
 </div>
 </div>
 </div>
 );
};

export default CartSidebarModal;
