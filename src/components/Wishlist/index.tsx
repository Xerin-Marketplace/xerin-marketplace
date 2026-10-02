"use client";

import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useWishlistStore } from "@/store/useWishlistStore";
import {
 mapWishlistToUi,
 useClearWishlist,
 useWishlist,
} from "@/hooks/useWishlist";
import SingleItem from "./SingleItem";
import { useAuthStore } from "@/store/useAuthStore";

const PAGE_SIZE = 20;

export const Wishlist = () => {
 const [page, setPage] = useState(1);
 const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
 const {
 data: backendWishlist,
 isLoading,
 isFetching,
 isError,
 refetch,
 } = useWishlist({ page, page_size: PAGE_SIZE });

 const guestWishlistItems = useWishlistStore((state) => state.items);
 const removeAllItemsFromWishlist = useWishlistStore(
 (state) => state.removeAllItemsFromWishlist,
 );
 const clearBackendWishlist = useClearWishlist();

 const wishlistItems = isAuthenticated
 ? mapWishlistToUi(backendWishlist?.results ?? [])
 : guestWishlistItems;

 const total = isAuthenticated
 ? backendWishlist?.total ?? 0
 : guestWishlistItems.length;
 const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

 return (
 <>
 <Breadcrumb title="Wishlist" pages={["Wishlist"]} />
 <section className="overflow-hidden bg-muted py-16">
 <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
 <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
 <div>

 <h2 className="mt-1 text-2xl font-semibold text-foreground">
 Your Wishlist
 </h2>
 <p className="mt-1 text-sm text-muted-foreground">
 {total} saved product{total === 1 ? "" : "s"}. Availability is
 rechecked by the backend before purchase.
 </p>
 </div>

 {wishlistItems.length > 0 && (
 <button
 onClick={() => {
 if (isAuthenticated) clearBackendWishlist.mutate();
 else removeAllItemsFromWishlist();
 }}
 disabled={clearBackendWishlist.isPending}
 className="rounded-lg border border-red-light-4 px-4 py-2 text-sm font-semibold text-destructive disabled:opacity-50"
 >
 {clearBackendWishlist.isPending
 ? "Clearing..."
 : "Clear Wishlist"}
 </button>
 )}
 </div>

 <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
 {isLoading ? (
 <div className="p-14 text-center text-muted-foreground">
 Loading wishlist...
 </div>
 ) : isError ? (
 <div className="p-14 text-center">
 <p className="font-semibold text-foreground">
 We could not load your wishlist.
 </p>
 <p className="mt-1 text-sm text-muted-foreground">
 Check your connection and try again.
 </p>
 <button
 onClick={() => refetch()}
 className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
 >
 Retry
 </button>
 </div>
 ) : (
 <div className="w-full overflow-x-auto">
 <div className="min-w-[1170px]">
 <div className="flex items-center bg-muted px-10 py-4 text-xs font-bold uppercase tracking-wide text-muted-foreground dark:bg-muted">
 <div className="min-w-[83px]" />
 <div className="min-w-[387px]">Product</div>
 <div className="min-w-[205px]">Customer Price</div>
 <div className="min-w-[265px]">Availability</div>
 <div className="min-w-[150px] text-right">Action</div>
 </div>

 {wishlistItems.map((item) => (
 <SingleItem item={item} key={item.id} />
 ))}

 {!wishlistItems.length && (
 <div className="px-10 py-14 text-center text-muted-foreground">
 Your wishlist is empty. Browse approved products
 and save items you want to compare later.
 </div>
 )}
 </div>
 </div>
 )}
 </div>

 {isAuthenticated && total > PAGE_SIZE && (
 <div className="mt-6 flex items-center justify-center gap-3">
 <button
 type="button"
 disabled={page <= 1 || isFetching}
 onClick={() => setPage((value) => Math.max(1, value - 1))}
 className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold disabled:opacity-40"
 >
 Previous
 </button>
 <span className="text-sm text-muted-foreground">
 Page {page} of {totalPages}
 </span>
 <button
 type="button"
 disabled={page >= totalPages || isFetching}
 onClick={() => setPage((value) => value + 1)}
 className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold disabled:opacity-40"
 >
 Next
 </button>
 </div>
 )}
 </div>
 </section>
 </>
 );
};
