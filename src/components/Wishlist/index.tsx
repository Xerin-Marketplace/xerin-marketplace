"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useWishlist, mapWishlistToUi, useClearWishlist } from "@/hooks/useWishlist";
import SingleItem from "./SingleItem";
import { useAuthStore } from "@/store/useAuthStore";

export const Wishlist = () => {
  const { data: backendWishlist, isLoading } = useWishlist();
  const guestWishlistItems = useWishlistStore((state) => state.items);
  const removeAllItemsFromWishlist = useWishlistStore((state) => state.removeAllItemsFromWishlist);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearBackendWishlist = useClearWishlist();
  const wishlistItems = isAuthenticated ? mapWishlistToUi(backendWishlist ?? []) : guestWishlistItems;

  if (isLoading) {
    return (
      <>
        <Breadcrumb title="Wishlist" pages={["Wishlist"]} />
        <section className="py-20 text-center bg-gray-2 dark:bg-darkTheme-bg">
          <p className="text-dark dark:text-white">Loading wishlist...</p>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2 dark:bg-darkTheme-bg">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark dark:text-white text-2xl">Your Wishlist</h2>
            <button
              onClick={() => {
                if (isAuthenticated) clearBackendWishlist.mutate();
                else removeAllItemsFromWishlist();
              }}
              disabled={clearBackendWishlist.isPending}
              className="text-blue disabled:opacity-50"
            >
              Clear Wishlist
            </button>
          </div>

          <div className="bg-white dark:bg-darkTheme-card rounded-[10px] shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                {/* <!-- table header --> */}
                <div className="flex items-center py-5.5 px-10">
                  <div className="min-w-[83px]"></div>
                  <div className="min-w-[387px]">
                    <p className="text-dark dark:text-darkTheme-body-color">Product</p>
                  </div>

                  <div className="min-w-[205px]">
                    <p className="text-dark dark:text-darkTheme-body-color">Unit Price</p>
                  </div>

                  <div className="min-w-[265px]">
                    <p className="text-dark dark:text-darkTheme-body-color">Stock Status</p>
                  </div>

                  <div className="min-w-[150px]">
                    <p className="text-dark dark:text-darkTheme-body-color text-right">Action</p>
                  </div>
                </div>

                {/* <!-- wish item --> */}
                {wishlistItems.map((item, key) => (
                  <SingleItem item={item} key={key} />
                ))}
                {!wishlistItems.length && (
                  <p className="border-t border-gray-3 px-10 py-12 text-center text-dark-4">
                    Your wishlist is empty.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
