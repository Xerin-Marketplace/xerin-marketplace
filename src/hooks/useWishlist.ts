"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/endpoints/users";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";
import type { Product as UiProduct } from "@/types/product";
import type { Product } from "@/types/api/product";
import toast from "react-hot-toast";

const WISHLIST_QUERY_KEY = ["wishlist"];

export type WishlistItemUi = {
  id: string;
  productId: string;
  title: string;
  price: number;
  discountedPrice: number;
  status: string;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

export const useWishlist = () => {
  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: () => usersApi.getWishlist(),
  });
};

export const mapWishlistToUi = (items: Product[]): WishlistItemUi[] => {
  return items.map((product) => {
    const ui = mapApiProductToUiProduct(product);
    return {
      id: String(product.id),
      productId: String(product.id),
      title: ui.title,
      price: ui.price,
      discountedPrice: ui.discountedPrice,
      status: (product as any).status || "available",
      quantity: 1,
      imgs: ui.imgs,
    };
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => usersApi.addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      toast.success("Added to wishlist");
    },
    onError: () => {
      toast.error("Failed to add to wishlist");
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => usersApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      toast.success("Removed from wishlist");
    },
    onError: () => {
      toast.error("Failed to remove from wishlist");
    },
  });
};

export const productToWishlistItem = (product: UiProduct): WishlistItemUi => ({
  id: String(product.id),
  productId: String(product.id),
  title: product.title,
  price: product.price,
  discountedPrice: product.discountedPrice,
  status: "available",
  quantity: 1,
  imgs: product.imgs,
});
