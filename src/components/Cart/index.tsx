"use client";


import { Spinner } from "@/components/ui/Spinner";
import { formatCurrency } from "@/lib/formatCurrency";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Discount from "@/components/Cart/Discount";
import {
 useCartView,
 useClearCart,
 useRemoveCartItem,
 useUpdateCartItem,
 useValidateCart,
} from "@/hooks/useCartActions";
import PriceDisplay from "@/components/shared/PriceDisplay";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, RefreshCwIcon, ShieldCheckIcon, ShoppingCart01Icon, Tag01Icon } from "@hugeicons/core-free-icons";

export default function Cart() {
 const cart = useCartView();
 const update = useUpdateCartItem();
 const remove = useRemoveCartItem();
 const clear = useClearCart();
 const validate = useValidateCart();

 const busy =
 update.isPending ||
 remove.isPending ||
 clear.isPending ||
 validate.isPending;

 const hasBlockingValidation = cart.validationMessages.some((message) =>
 /no longer available|inventory is not configured|only \d+ item/i.test(
 message,
 ),
 );

 return (
 <>
 <Breadcrumb title="Cart" pages={["Cart"]} />

 <section className="bg-muted py-12 sm:py-16">
 <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
 {cart.isLoading ? (
 <div className="rounded-2xl bg-card p-14 text-center">
 <Spinner className="mx-auto" />
 <p className="mt-3">Loading your cart...</p>
 </div>
 ) : cart.error ? (
 <div className="rounded-2xl border border-red-light-4 bg-red-light-6 p-10 text-center text-destructive-dark">
 <p>Your cart could not be loaded. Your account cart was not changed.</p>
 <button
 onClick={() => void cart.refetch()}
 className="mt-3 font-semibold underline"
 >
 Retry
 </button>
 </div>
 ) : !cart.items.length ? (
 <div className="rounded-2xl bg-card p-14 text-center">
 <HugeiconsIcon icon={ShoppingCart01Icon} size={32} className="mx-auto text-muted-foreground" />
 <h2 className="mt-3 text-xl font-semibold">Your cart is empty</h2>
 <p className="mt-2 text-muted-foreground">
 Browse approved seller products and add items to your cart.
 </p>
 <Link
 href="/search"
 className="mt-5 inline-block rounded-xl bg-foreground px-6 py-3 font-medium text-background"
 >
 Continue Shopping
 </Link>
 </div>
 ) : (
 <>
 <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
 <div>
 <h1 className="mt-1 text-2xl font-bold text-foreground">
 Cart & Promotions
 </h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Prices and stock are confirmed again before checkout.
 </p>
 </div>

 <div className="flex flex-wrap gap-2">
 {cart.isAuthenticated && (
 <button
 disabled={busy}
 onClick={() => validate.mutate()}
 className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold disabled:opacity-50 dark:border-border"
 >
 {validate.isPending ? <Spinner /> : <HugeiconsIcon icon={RefreshCwIcon} size={14} />}
 Refresh Price & Stock
 </button>
 )}
 <button
 disabled={busy}
 onClick={() => clear.mutate()}
 className="rounded-xl border border-red-light-4 px-4 py-2.5 text-sm font-semibold text-destructive disabled:opacity-50"
 >
 {clear.isPending ? "Clearing..." : "Clear Cart"}
 </button>
 </div>
 </div>

 {!cart.isAuthenticated && (
 <div className="mb-5 rounded-xl border border-yellow-light-2 bg-yellow-light-4 p-4 text-sm text-yellow-dark-2">
 Guest cart · sign in to sync items, use seller promotions and
 proceed through secure checkout.
 </div>
 )}

 {cart.validationMessages.length > 0 && (
 <div className="mb-5 rounded-2xl border border-yellow-light-2 bg-yellow-light-4 p-4">
 <div className="flex items-start gap-3">
 <HugeiconsIcon icon={AlertCircleIcon}
 size={18}
 className="mt-0.5 shrink-0 text-yellow-dark-2"
 />
 <div>
 <p className="text-sm font-bold text-yellow-dark-2">
 Cart needs your attention
 </p>
 <ul className="mt-2 space-y-1 text-xs leading-5 text-yellow-dark-2">
 {cart.validationMessages.map((message, index) => (
 <li key={`${message}-${index}`}>• {message}</li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 )}

 <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
 <div className="space-y-6">
 <div className="overflow-x-auto rounded-2xl bg-card shadow-sm">
 <table className="w-full min-w-[850px] text-left">
 <thead className="bg-muted text-xs font-bold uppercase tracking-wide text-muted-foreground dark:bg-muted">
 <tr>
 {["Product", "Customer Price", "Quantity", "Subtotal", ""].map(
 (heading) => (
 <th key={heading} className="px-6 py-4">
 {heading}
 </th>
 ),
 )}
 </tr>
 </thead>

 <tbody className="divide-y dark:divide-white/10">
 {cart.items.map((item) => (
 <tr key={item.cartItemId}>
 <td className="px-6 py-5">
 <Link
 className="font-semibold hover:text-primary"
 href={`/products/${item.productId}`}
 >
 {item.title}
 </Link>
 {item.sellerName && (
 <p className="mt-1 text-[11px] text-muted-foreground">
 Sold by {item.sellerName}
 </p>
 )}
 </td>

 <td className="px-6 py-5 font-semibold">
 {formatCurrency(
 item.discountedPrice,
 cart.currency,
 )}
 </td>

 <td className="px-6 py-5">
 <div className="inline-flex items-center overflow-hidden rounded-xl border border-border dark:border-border">
 <button
 disabled={busy || item.quantity <= 1}
 onClick={() =>
 update.mutate({
 itemId: item.cartItemId,
 quantity: item.quantity - 1,
 })
 }
 className="px-3 py-2 disabled:opacity-40"
 >
 −
 </button>
 <span className="border-x border-border px-4 py-2 dark:border-border">
 {item.quantity}
 </span>
 <button
 disabled={busy}
 onClick={() =>
 update.mutate({
 itemId: item.cartItemId,
 quantity: item.quantity + 1,
 })
 }
 className="px-3 py-2 disabled:opacity-40"
 >
 +
 </button>
 </div>
 </td>

 <td className="px-6 py-5 font-bold">
 {formatCurrency(
 item.discountedPrice * item.quantity,
 cart.currency,
 )}
 </td>

 <td className="px-6 py-5 text-right">
 <button
 disabled={busy}
 onClick={() =>
 remove.mutate(item.cartItemId)
 }
 className="font-semibold text-destructive disabled:opacity-40"
 >
 Remove
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <Discount />
 </div>

 <aside className="h-fit rounded-2xl border border-[var(--border)] bg-card p-6 shadow-sm dark:border-border">
 <div className="flex items-center gap-3">
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <HugeiconsIcon icon={ShieldCheckIcon} size={19} />
 </span>
 <div>
 <h2 className="font-bold text-foreground">
 Order Summary
 </h2>
 <p className="mt-0.5 text-xs text-muted-foreground">
 Review your items and discounts
 </p>
 </div>
 </div>

 <div className="mt-6 space-y-3 text-sm">
 <Row
 label="Product subtotal"
 value={<PriceDisplay amount={cart.subtotal} sourceCurrency="TZS" />}
 />

 {cart.promotionDiscountAmount > 0 && (
 <Row
 label="Seller promotion"
 value={`-${formatCurrency(
 cart.promotionDiscountAmount,
 cart.currency,
 )}`}
 saving
 />
 )}

 {cart.couponDiscountAmount > 0 && (
 <Row
 label="Platform coupon"
 value={`-${formatCurrency(
 cart.couponDiscountAmount,
 cart.currency,
 )}`}
 saving
 />
 )}

 {cart.promotion?.promotion_type === "free_shipping" && (
 <div className="flex items-start gap-2 rounded-lg bg-green-light-6 p-3 text-xs leading-5 text-green-dark">
 <HugeiconsIcon icon={Tag01Icon} size={14} className="mt-0.5 shrink-0" />
 Free-shipping promotion saved. Its delivery benefit will
 be resolved when a logistics service is selected.
 </div>
 )}

 <div className="border-t border-border pt-4 dark:border-border">
 <Row
 label="Cart total"
 value={<PriceDisplay amount={cart.total} sourceCurrency="TZS" />}
 strong
 />
 </div>
 </div>

 <p className="mt-4 text-xs leading-5 text-muted-foreground">
 Delivery cost is calculated at checkout based on your
 address and the delivery service you choose, and is shown
 before you confirm your order.
 </p>

 <Link
 href={
 !cart.isAuthenticated
 ? "/signin?redirect=/cart"
 : hasBlockingValidation
 ? "#"
 : "/checkout"
 }
 aria-disabled={hasBlockingValidation}
 className={`mt-6 flex justify-center rounded-xl px-6 py-3 font-semibold text-white ${
 hasBlockingValidation
 ? "pointer-events-none bg-muted"
 : "bg-primary hover:bg-primary-dark"
 }`}
 >
 {!cart.isAuthenticated
 ? "Sign in to Continue"
 : hasBlockingValidation
 ? "Fix Cart Before Checkout"
 : "Continue to Delivery"}
 </Link>
 </aside>
 </div>
 </>
 )}
 </div>
 </section>
 </>
 );
}

function Row({
 label,
 value,
 saving = false,
 strong = false,
}: {
 label: string;
 value: React.ReactNode;
 saving?: boolean;
 strong?: boolean;
}) {
 return (
 <div className={`flex items-center justify-between gap-4 ${strong ? "text-lg" : ""}`}>
 <span className={strong ? "font-bold" : "text-muted-foreground"}>{label}</span>
 <span
 className={
 saving
 ? "font-bold text-green-dark"
 : strong
 ? "font-bold"
 : "font-semibold"
 }
 >
 {value}
 </span>
 </div>
 );
}
