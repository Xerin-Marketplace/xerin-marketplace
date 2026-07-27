import axiosInstance from "../client";

export type SellerInventory = {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  warehouse_location: string | null;
  low_stock_threshold: number;
  restock_date: string | null;
  updated_at: string | null;
};

export type SellerInventoryUpdate = Partial<Pick<SellerInventory, "quantity" | "reserved_quantity" | "warehouse_location" | "low_stock_threshold">>;

export const sellerInventoryApi = {
  list: async () => (await axiosInstance.get<SellerInventory[]>("/inventory/my-inventory")).data,
  lowStock: async () => (await axiosInstance.get<SellerInventory[]>("/inventory/low-stock")).data,
  update: async (id: string, payload: SellerInventoryUpdate) =>
    (await axiosInstance.put<SellerInventory>(`/inventory/${id}`, payload)).data,
};
