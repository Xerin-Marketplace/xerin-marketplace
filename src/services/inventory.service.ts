import { apiClient } from "@/lib/api/client";
import { authStorage } from "@/lib/auth/storage";

const requireToken = (): string => {
  const token = authStorage.getAccessToken();
  if (!token) throw new Error("Authentication required. Please log in.");
  return token;
};

export type InventorySummary = {
  total_products: number;
  total_on_hand: number;
  total_available: number;
  total_reserved: number;
  total_incoming: number;
  total_damaged: number;
  low_stock: number;
  out_of_stock: number;
  inventory_value: number;
  warehouses: number;
  adjustments_today: number;
};

export type InventoryItem = {
  id: string;
  product_id: string;
  variant_id: string | null;
  warehouse_id: string;
  on_hand: number;
  reserved: number;
  incoming: number;
  damaged: number;
  available: number;
  low_stock_threshold: number;
  reorder_quantity: number | null;
  created_at: string;
  updated_at: string | null;
  product: {
    id: string;
    name: string;
    sku: string;
    barcode: string | null;
    thumbnail: string | null;
    cost_price: number | null;
  } | null;
  variant: {
    id: string;
    variant_name: string;
    sku: string;
  } | null;
  warehouse: {
    id: string;
    name: string;
    code: string;
  } | null;
};

export type Warehouse = {
  id: string;
  name: string;
  code: string;
  country: string | null;
  region: string | null;
  district: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_person: string | null;
  phone_number: string | null;
  email: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
};

export type StockAdjustment = {
  id: string;
  adjustment_number: string;
  product_id: string;
  variant_id: string | null;
  warehouse_id: string;
  adjustment_type: string;
  previous_quantity: number;
  adjustment_quantity: number;
  new_quantity: number;
  unit_cost: number | null;
  reason: string;
  reference_number: string | null;
  status: string;
  created_by_id: string | null;
  approved_by_id: string | null;
  created_at: string;
  updated_at: string | null;
};

export type StockMovement = {
  id: string;
  product_id: string;
  variant_id: string | null;
  warehouse_id: string;
  movement_type: string;
  reference: string | null;
  quantity_in: number | null;
  quantity_out: number | null;
  balance_after: number;
  notes: string | null;
  performed_by_id: string | null;
  created_at: string;
};

export type ListInventoryParams = {
  search?: string;
  warehouse_id?: string;
  category_id?: string;
  brand_id?: string;
  stock_status?: string;
  product_status?: string;
  min_quantity?: number;
  max_quantity?: number;
  skip?: number;
  limit?: number;
};

export type CreateAdjustmentPayload = {
  product_id: string;
  variant_id?: string;
  warehouse_id: string;
  adjustment_type: string;
  adjustment_quantity: number;
  unit_cost?: number;
  reason: string;
  reference_number?: string;
};

export type CreateWarehousePayload = {
  name: string;
  code: string;
  country?: string;
  region?: string;
  district?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  contact_person?: string;
  phone_number?: string;
  email?: string;
  status?: string;
};

export const inventoryService = {
  getSummary: () =>
    apiClient<InventorySummary>("/admin/inventory/summary", {
      method: "GET",
      token: requireToken(),
    }),

  listInventory: (params: ListInventoryParams = {}) =>
    apiClient<InventoryItem[]>("/admin/inventory", {
      method: "GET",
      token: requireToken(),
      query: params,
    }),

  listWarehouses: (status?: string) =>
    apiClient<Warehouse[]>("/admin/warehouses", {
      method: "GET",
      token: requireToken(),
      query: status ? { status } : undefined,
    }),

  createWarehouse: (payload: CreateWarehousePayload) =>
    apiClient<Warehouse>("/admin/warehouses", {
      method: "POST",
      token: requireToken(),
      body: payload,
    }),

  updateWarehouse: (warehouseId: string, payload: CreateWarehousePayload) =>
    apiClient<Warehouse>(`/admin/warehouses/${warehouseId}`, {
      method: "PATCH",
      token: requireToken(),
      body: payload,
    }),

  deleteWarehouse: (warehouseId: string) =>
    apiClient<{ message: string }>(`/admin/warehouses/${warehouseId}`, {
      method: "DELETE",
      token: requireToken(),
    }),

  listAdjustments: (params: { status?: string; adjustment_type?: string; warehouse_id?: string } = {}) =>
    apiClient<StockAdjustment[]>("/admin/stock-adjustments", {
      method: "GET",
      token: requireToken(),
      query: params,
    }),

  createAdjustment: (payload: CreateAdjustmentPayload) =>
    apiClient<StockAdjustment>("/admin/stock-adjustments", {
      method: "POST",
      token: requireToken(),
      body: payload,
    }),

  listMovements: (params: { product_id?: string; warehouse_id?: string; movement_type?: string } = {}) =>
    apiClient<StockMovement[]>("/admin/inventory/movements", {
      method: "GET",
      token: requireToken(),
      query: params,
    }),

  listLowStock: (params: { warehouse_id?: string; category_id?: string; brand_id?: string; severity?: string } = {}) =>
    apiClient<InventoryItem[]>("/admin/inventory/low-stock", {
      method: "GET",
      token: requireToken(),
      query: params,
    }),

  getProductInventory: (productId: string) =>
    apiClient<{ product: unknown; totals: unknown; inventory: InventoryItem[]; movements: StockMovement[] }>(
      `/admin/inventory/products/${productId}`,
      {
        method: "GET",
        token: requireToken(),
      }
    ),

  getWarehouse: (warehouseId: string) =>
    apiClient<{ warehouse: Warehouse; inventory: InventoryItem[]; low_stock: InventoryItem[]; movements: StockMovement[] }>(
      `/admin/warehouses/${warehouseId}`,
      {
        method: "GET",
        token: requireToken(),
      }
    ),
};
