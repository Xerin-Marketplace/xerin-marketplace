"use client";

import React, { useState } from "react";
import {
 useApplyCoupon,
 useApplyPromotion,
 useAvailableCartPromotions,
 useCartView,
 useRemoveCoupon,
 useRemovePromotion,
} from "@/hooks/useCartActions";
import PriceDisplay from "@/components/shared/PriceDisplay";

const pretty = (value: string) =>
 value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function Discount() {
 const cart = useCartView();
 const [couponCode, setCouponCode] = useState("");
 const [promotionCode, setPromotionCode] = useState("");

 const applyCoupon = useApplyCoupon();
 const removeCoupon = useRemoveCoupon();
 const applyPromotion = useApplyPromotion();
 const removePromotion = useRemovePromotion();
 const offers = useAvailableCartPromotions(
 cart.isAuthenticated && cart.items.length > 0,
 );

 if (!cart.isAuthenticated) {
 return (
 <div className="w-full rounded-xl border border-yellow-light-2 bg-yellow-light-4 p-5 text-sm text-yellow-dark-2">
 Sign in to use seller promotions or platform coupon codes. Your guest cart
 can still be merged after login.
 </div>
 );
 }

 const busy =
 applyCoupon.isPending ||
 removeCoupon.isPending ||
 applyPromotion.isPending ||
 removePromotion.isPending;

 return (
 <div className="w-full space-y-5">
 <section className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm dark:border-border">
 <h3 className="mt-1 text-lg font-bold text-foreground">
 Seller Promotions
 </h3>
 <p className="mt-1 text-sm leading-6 text-muted-foreground">
 Seller-funded discounts apply only to eligible products. Xerin
 platform commission remains separate from the seller discount.
 </p>

 {cart.promotion ? (
 <div className="mt-4 rounded-xl border border-green-light-4 bg-green-light-6 p-4">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
 <div>
 <p className="text-sm font-bold text-emerald-800">
 {cart.promotion.name}
 {cart.promotion.code ? ` · ${cart.promotion.code}` : ""}
 </p>
 <p className="mt-1 text-xs text-green-dark">
 {pretty(cart.promotion.promotion_type)}
 {" · "}
 Eligible subtotal{" "}
 <PriceDisplay amount={Number(cart.promotion.eligible_subtotal)} sourceCurrency="TZS" />
 </p>
 <p className="mt-1 text-xs font-semibold text-emerald-800">
 Seller promotion discount:{" "}
 <PriceDisplay amount={Number(cart.promotion.discount_amount)} sourceCurrency="TZS" />
 </p>
 {cart.promotion.promotion_type === "free_shipping" && (
 <p className="mt-1 text-xs text-green-dark">
 The shipping benefit will be applied when delivery is selected
 in the next phase.
 </p>
 )}
 </div>
 <button
 type="button"
 disabled={busy}
 onClick={() => removePromotion.mutate()}
 className="text-xs font-bold text-destructive disabled:opacity-50"
 >
 Remove
 </button>
 </div>
 </div>
 ) : (
 <>
 <div className="mt-4 flex flex-col gap-2 sm:flex-row">
 <input
 value={promotionCode}
 onChange={(event) =>
 setPromotionCode(
 event.target.value.toUpperCase().replace(/\s+/g, ""),
 )
 }
 placeholder="Enter seller promo code"
 className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-muted px-4 text-sm outline-none focus:border-primary dark:border-border dark:bg-muted"
 />
 <button
 type="button"
 disabled={busy || !promotionCode.trim()}
 onClick={() => applyPromotion.mutate(promotionCode.trim())}
 className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
 >
 {applyPromotion.isPending ? "Applying..." : "Apply Promotion"}
 </button>
 </div>

 {offers.data && offers.data.length > 0 && (
 <div className="mt-5">
 <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
 Eligible offers for this cart
 </p>
 <div className="mt-3 grid gap-3 md:grid-cols-2">
 {offers.data.slice(0, 6).map((offer) => (
 <button
 type="button"
 key={offer.promotion_id}
 disabled={
 busy ||
 !offer.code ||
 (Boolean(cart.couponCode) && !offer.stackable)
 }
 onClick={() =>
 offer.code && applyPromotion.mutate(offer.code)
 }
 className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-left transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
 >
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="font-semibold text-foreground">
 {offer.name}
 </p>
 <p className="mt-1 text-xs text-muted-foreground">
 {pretty(offer.promotion_type)}
 {offer.code ? ` · ${offer.code}` : " · Automatic"}
 </p>
 </div>
 <span className="rounded-full bg-card px-2.5 py-1 text-[10px] font-bold uppercase text-primary shadow-sm">
 Seller funded
 </span>
 </div>

 <p className="mt-3 text-sm font-bold text-green-dark">
 {offer.promotion_type === "free_shipping" ? (
 "Free shipping benefit"
 ) : (
 <>Save <PriceDisplay amount={Number(offer.discount_amount)} sourceCurrency="TZS" /></>
 )}
 </p>

 {!offer.stackable && cart.couponCode && (
 <p className="mt-2 text-[11px] text-yellow-dark-2">
 Remove the current coupon before using this offer.
 </p>
 )}
 </button>
 ))}
 </div>
 </div>
 )}
 </>
 )}
 </section>

 <section className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm dark:border-border">
 <h3 className="font-bold text-foreground">
 Platform Coupon
 </h3>
 <p className="mt-1 text-sm text-muted-foreground">
 Platform/admin coupons are separate from seller-funded promotions.
 </p>

 {cart.couponCode ? (
 <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-primary-200 bg-primary-50 p-4">
 <div>
 <p className="text-sm font-bold text-primary-800">
 {cart.couponCode}
 </p>
 <p className="mt-1 text-xs text-primary-700">
 Coupon discount:{" "}
 <PriceDisplay amount={cart.couponDiscountAmount} sourceCurrency="TZS" />
 </p>
 </div>
 <button
 type="button"
 disabled={busy}
 onClick={() => removeCoupon.mutate()}
 className="text-xs font-bold text-destructive disabled:opacity-50"
 >
 Remove
 </button>
 </div>
 ) : (
 <form
 className="mt-4 flex flex-col gap-2 sm:flex-row"
 onSubmit={(event) => {
 event.preventDefault();
 if (couponCode.trim()) {
 applyCoupon.mutate(couponCode.trim().toUpperCase());
 }
 }}
 >
 <input
 value={couponCode}
 onChange={(event) =>
 setCouponCode(
 event.target.value.toUpperCase().replace(/\s+/g, ""),
 )
 }
 placeholder="Enter platform coupon code"
 className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-muted px-4 text-sm outline-none focus:border-primary dark:border-border dark:bg-muted"
 />
 <button
 disabled={busy || !couponCode.trim()}
 className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background disabled:opacity-50"
 >
 {applyCoupon.isPending ? "Applying..." : "Apply Coupon"}
 </button>
 </form>
 )}
 </section>
 </div>
 );
}
