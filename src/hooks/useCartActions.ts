"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/endpoints/commerce";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";
import type { CartItem as BackendCartItem, Cart } from "@/types/api/commerce";
import type { Product as UiProduct } from "@/types/product";
import toast from "react-hot-toast";

export type CartItemUi = {
  id: string;
  cartItemId: string;
  productId: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

export const mapBackendCartToUi = (cart: Cart): CartItemUi[] => {
  if (!cart?.items) return [];
  return cart.items.map((item: BackendCartItem) => {
    const product = mapApiProductToUiProduct(item.product);
    return {
      id: item.product_id,
      cartItemId: item.id,
      productId: item.product_id,
      title: product.title,
      price: product.price,
      discountedPrice: product.discountedPrice,
      quantity: item.quantity,
      imgs: product.imgs,
    };
  });
};

export const useBackendCart = (enabled = true) =>
  useQuery({
    queryKey: ["cart"],
    queryFn: ({ signal }) => cartApi.get(signal),
    enabled,
  });

export const useAddCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartApi.addItem,
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      toast.success("Added to cart");
    },
    onError: () => {
      toast.error("Failed to add to cart");
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    },
    onError: () => {
      toast.error("Failed to update quantity");
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartApi.removeItem,
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      toast.success("Removed from cart");
    },
    onError: () => {
      toast.error("Failed to remove item");
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartApi.clear,
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      toast.success("Cart cleared");
    },
    onError: () => {
      toast.error("Failed to clear cart");
    },
  });
};

export const useApplyCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartApi.applyCoupon,
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      toast.success("Coupon applied");
    },
    onError: () => {
      toast.error("Invalid or expired coupon");
    },
  });
};

export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartApi.removeCoupon,
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      toast.success("Coupon removed");
    },
  });
};

export const addProductToCartPayload = (product: UiProduct, quantity = 1) => ({
  product_id: String(product.id),
  variant_id: null as string | null,
  quantity,
});
