"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import {
  useCartView,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/hooks/useCartActions";
import { formatCurrency } from "@/lib/formatCurrency";
import Link from "next/link";

export default function Cart() {
  const cart = useCartView();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const clear = useClearCart();
  const busy = update.isPending || remove.isPending || clear.isPending;

  return (
    <>
      <Breadcrumb title="Cart" pages={["Cart"]} />
      <section className="bg-gray-2 py-16 dark:bg-darkTheme-bg">
        <div className="mx-auto max-w-[1170px] px-4 sm:px-8">
          {cart.isLoading ? (
            <p className="rounded-xl bg-white p-12 text-center dark:bg-darkTheme-card">Loading your cart…</p>
          ) : cart.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-red-700">
              <p>Your cart could not be loaded. Your account cart was not changed.</p>
              <button onClick={() => void cart.refetch()} className="mt-3 font-semibold underline">Retry</button>
            </div>
          ) : !cart.items.length ? (
            <div className="rounded-xl bg-white p-12 text-center dark:bg-darkTheme-card">
              <h2 className="text-xl font-semibold">Your cart is empty</h2>
              <p className="mt-2 text-dark-4">Browse products and add items to your cart.</p>
              <Link href="/shop-with-sidebar" className="mt-5 inline-block rounded-lg bg-dark px-6 py-3 font-medium text-white">Continue Shopping</Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Your Cart</h2>
                  {!cart.isAuthenticated && <p className="mt-1 text-sm text-dark-4">Guest cart — sign in to sync and checkout.</p>}
                </div>
                <button disabled={busy} onClick={() => clear.mutate()} className="font-semibold text-red-600 disabled:opacity-50">
                  {clear.isPending ? "Clearing…" : "Clear Shopping Cart"}
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl bg-white shadow-1 dark:bg-darkTheme-card">
                <table className="w-full min-w-[800px] text-left">
                  <thead className="bg-gray-1 dark:bg-darkTheme-secondary-bg">
                    <tr>{["Product", "Price", "Quantity", "Subtotal", ""].map((heading) => <th key={heading} className="px-6 py-4">{heading}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y dark:divide-darkTheme-border-color">
                    {cart.items.map((item) => (
                      <tr key={item.cartItemId}>
                        <td className="px-6 py-5 font-medium"><Link href={`/products/${item.productId}`}>{item.title}</Link></td>
                        <td className="px-6 py-5">{formatCurrency(item.discountedPrice, cart.currency)}</td>
                        <td className="px-6 py-5">
                          <div className="inline-flex items-center rounded-lg border">
                            <button disabled={busy || item.quantity <= 1} onClick={() => update.mutate({ itemId: item.cartItemId, quantity: item.quantity - 1 })} className="px-3 py-2 disabled:opacity-40">−</button>
                            <span className="border-x px-4 py-2">{item.quantity}</span>
                            <button disabled={busy} onClick={() => update.mutate({ itemId: item.cartItemId, quantity: item.quantity + 1 })} className="px-3 py-2 disabled:opacity-40">+</button>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-semibold">{formatCurrency(item.discountedPrice * item.quantity, cart.currency)}</td>
                        <td className="px-6 py-5"><button disabled={busy} onClick={() => remove.mutate(item.cartItemId)} className="font-semibold text-red-600 disabled:opacity-40">Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 ml-auto max-w-md rounded-xl bg-white p-6 shadow-1 dark:bg-darkTheme-card">
                <div className="flex justify-between text-sm"><span>Subtotal</span><b>{formatCurrency(cart.subtotal, cart.currency)}</b></div>
                <div className="mt-3 flex justify-between text-sm"><span>Discount</span><b>{formatCurrency(cart.discountAmount, cart.currency)}</b></div>
                <div className="mt-4 flex justify-between border-t pt-4 text-lg"><b>Total</b><b>{formatCurrency(cart.total, cart.currency)}</b></div>
                <Link
                  href={cart.isAuthenticated ? "/checkout" : "/signin?redirect=/checkout"}
                  className="mt-6 flex justify-center rounded-lg bg-blue px-6 py-3 font-medium text-white"
                >
                  {cart.isAuthenticated ? "Proceed to Checkout" : "Sign in to Checkout"}
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
