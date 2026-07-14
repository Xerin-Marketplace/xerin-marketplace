import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishListItem = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

interface WishlistState {
  items: WishListItem[];
  addItemToWishlist: (item: WishListItem) => void;
  removeItemFromWishlist: (id: number) => void;
  removeAllItemsFromWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],

      addItemToWishlist: (newItem) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, newItem] };
        }),

      removeItemFromWishlist: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      removeAllItemsFromWishlist: () => set({ items: [] }),
    }),
    {
      name: "xerin_wishlist_store",
    }
  )
);
