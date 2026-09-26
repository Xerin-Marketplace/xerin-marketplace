import axiosInstance from "../client";

export type WarehouseStatus = "active" | "inactive" | "maintenance";

export type Warehouse = {
  id: string;
  name: string;
  code: string;
  country: string;
  region: string;
  district: string | null;
  ward: string | null;
  street: string | null;
  latitude: number | null;
  longitude: number | null;
  total_capacity: number | null;
  used_capacity: number | null;
  status: WarehouseStatus;
  created_at: string;
  updated_at: string | null;
};

export type WarehouseCreate = {
  name: string;
  code: string;
  country: string;
  region: string;
  district?: string | null;
  ward?: string | null;
  street?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  total_capacity?: number;
  status?: WarehouseStatus;
};

export type WarehouseBin = {
  id: string;
  warehouse_id: string;
  aisle: string;
  shelf: string;
  bin: string;
  zone: string | null;
  capacity: number;
  used_capacity: number;
  is_active: boolean;
};

export type WarehouseBinCreate = {
  aisle: string;
  shelf: string;
  bin: string;
  zone?: string | null;
  capacity?: number;
};

export type WarehouseInventoryItem = {
  id: string;
  warehouse_id: string;
  warehouse_name: string | null;
  product_id: string;
  product_name: string | null;
  variant_id: string | null;
  seller_id: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  low_stock_threshold: number;
  warehouse_bin_id: string | null;
  bin_label: string | null;
  updated_at: string | null;
};

export type InventoryAdjustPayload = {
  adjustment_type: "increase" | "decrease";
  quantity: number;
  reason: string;
  notes?: string | null;
};

export type AdminFulfilmentDashboard = {
  warehouses: { total: number; active: number; maintenance: number };
  inbound: { pending: number; in_transit: number; received: number; completed: number; cancelled: number };
  pick_lists: { pending: number; in_progress: number; picked: number; packed: number; cancelled: number };
  inventory: { total_skus: number; total_units: number; low_stock_items: number; out_of_stock_items: number };
};

type InventoryParams = {
  warehouse_id?: string;
  seller_id?: string;
  product_id?: string;
  low_stock?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
};

export const fulfilmentApi = {
  getDashboard: async (): Promise<AdminFulfilmentDashboard> =>
    (await axiosInstance.get<AdminFulfilmentDashboard>("/fulfilment/dashboard")).data,

  listWarehouses: async (params?: { status?: string; country?: string; search?: string; page?: number; page_size?: number }): Promise<Warehouse[]> =>
    (await axiosInstance.get<Warehouse[]>("/fulfilment/warehouses", { params })).data,

  getWarehouse: async (id: string): Promise<Warehouse> =>
    (await axiosInstance.get<Warehouse>(`/fulfilment/warehouses/${id}`)).data,

  createWarehouse: async (payload: WarehouseCreate): Promise<Warehouse> =>
    (await axiosInstance.post<Warehouse>("/fulfilment/warehouses", payload)).data,

  updateWarehouse: async (id: string, payload: Partial<WarehouseCreate>): Promise<Warehouse> =>
    (await axiosInstance.put<Warehouse>(`/fulfilment/warehouses/${id}`, payload)).data,

  deleteWarehouse: async (id: string): Promise<void> =>
    (await axiosInstance.delete(`/fulfilment/warehouses/${id}`)).data,

  listBins: async (warehouseId: string): Promise<WarehouseBin[]> =>
    (await axiosInstance.get<WarehouseBin[]>(`/fulfilment/warehouses/${warehouseId}/bins`)).data,

  createBin: async (warehouseId: string, payload: WarehouseBinCreate): Promise<WarehouseBin> =>
    (await axiosInstance.post<WarehouseBin>(`/fulfilment/warehouses/${warehouseId}/bins`, payload)).data,

  listInventory: async (params?: InventoryParams): Promise<WarehouseInventoryItem[]> =>
    (await axiosInstance.get<WarehouseInventoryItem[]>("/fulfilment/inventory", { params })).data,

  getInventoryItem: async (id: string): Promise<WarehouseInventoryItem> =>
    (await axiosInstance.get<WarehouseInventoryItem>(`/fulfilment/inventory/${id}`)).data,

  adjustInventory: async (id: string, payload: InventoryAdjustPayload): Promise<WarehouseInventoryItem> =>
    (await axiosInstance.post<WarehouseInventoryItem>(`/fulfilment/inventory/${id}/adjust`, payload)).data,
};
