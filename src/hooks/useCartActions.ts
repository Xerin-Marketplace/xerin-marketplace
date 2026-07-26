"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/endpoints/commerce";
import { mapApiProductToUiProduct } from "@/lib/products/adapters";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
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

type LocalCartItem = ReturnType<typeof useCartStore.getState>["items"][number];

const mapLocalCartToUi = (items: LocalCartItem[]): CartItemUi[] =>
  items.map((item) => ({
    id: String(item.id),
    cartItemId: String(item.id),
    productId: String(item.id),
    title: item.title,
    price: item.price,
    discountedPrice: item.discountedPrice,
    quantity: item.quantity,
    imgs: item.imgs,
  }));

export const useBackendCart = (enabled = true) =>
  useQuery({
    queryKey: ["cart"],
    queryFn: ({ signal }) => cartApi.get(signal),
    enabled,
  });

export const useCart = () => {
  const { isAuthenticated, hasHydrated } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    hasHydrated: state.hasHydrated,
  }));
  const backendEnabled = hasHydrated && isAuthenticated;
  const backend = useBackendCart(backendEnabled);
  const guestItems = useCartStore((state) => state.items);

  if (!hasHydrated) {
    return {
      items: [] as CartItemUi[],
      isLoading: true,
      total: 0,
      isGuest: false,
      cart: null as Cart | null,
    };
  }

  if (isAuthenticated) {
    const items = backend.data ? mapBackendCartToUi(backend.data) : [];
    const total = items.reduce(
      (sum, item) => sum + item.discountedPrice * item.quantity,
      0,
    );
    return {
      items,
      isLoading: backend.isLoading,
      total,
      isGuest: false,
      cart: backend.data ?? null,
    };
  }

  const items = mapLocalCartToUi(guestItems);
  const total = items.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0,
  );
  return {
    items,
    isLoading: false,
    total,
    isGuest: true,
    cart: null as Cart | null,
  };
};

export type AddCartItemInput = {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  product?: UiProduct;
};

export const addProductToCartPayload = (
  product: UiProduct,
  quantity = 1,
): AddCartItemInput => ({
  product_id: String(product.id),
  variant_id: null,
  quantity,
  product,
});

const addGuestCartItem = (product: UiProduct, quantity = 1) => {
  useCartStore.getState().addItemToCart({
    id: product.id,
    title: product.title,
    price: product.price,
    discountedPrice: product.discountedPrice,
    quantity,
    imgs: product.imgs,
  });
  toast.success("Added to cart");
};

export const useAddCartItem = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useMutation({
    mutationFn: async (payload: AddCartItemInput) => {
      if (isAuthenticated) {
        return cartApi.addItem({
          product_id: payload.product_id,
          variant_id: payload.variant_id,
          quantity: payload.quantity,
        });
      }
      if (!payload.product) throw new Error("Product details required");
      addGuestCartItem(payload.product, payload.quantity);
      return null;
    },
    onSuccess: (cart) => {
      if (cart) queryClient.setQueryData(["cart"], cart);
    },
    onError: () => {
      toast.error("Failed to add to cart");
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      if (isAuthenticated) return cartApi.updateItem(itemId, quantity);
      useCartStore.getState().updateCartItemQuantity(itemId, quantity);
      return null;
    },
    onSuccess: (cart) => {
      if (cart) queryClient.setQueryData(["cart"], cart);
    },
    onError: () => {
      toast.error("Failed to update quantity");
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (isAuthenticated) return cartApi.removeItem(itemId);
      useCartStore.getState().removeItemFromCart(itemId);
      return null;
    },
    onSuccess: (cart) => {
      if (cart) queryClient.setQueryData(["cart"], cart);
      else toast.success("Removed from cart");
    },
    onError: () => {
      toast.error("Failed to remove item");
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useMutation({
    mutationFn: async () => {
      if (isAuthenticated) return cartApi.clear();
      useCartStore.getState().removeAllItemsFromCart();
      return null;
    },
    onSuccess: (cart) => {
      if (cart) queryClient.setQueryData(["cart"], cart);
      else toast.success("Cart cleared");
    },
    onError: () => {
      toast.error("Failed to clear cart");
    },
  });
};

export const useApplyCoupon = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useMutation({
    mutationFn: async (code: string) => {
      if (!isAuthenticated) {
        toast.error("Please sign in to apply coupon codes");
        throw new Error("Sign in required");
      }
      return cartApi.applyCoupon(code);
    },
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        toast.error("Please sign in to manage coupons");
        throw new Error("Sign in required");
      }
      return cartApi.removeCoupon();
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      toast.success("Coupon removed");
    },
    onError: () => {
      toast.error("Failed to remove coupon");
    },
  });
};
