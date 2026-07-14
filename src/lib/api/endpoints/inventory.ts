import axiosInstance from "../client";

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
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reference_id: string | null;
  reference_type: string | null;
  description: string | null;
  created_by_id: string | null;
  created_at: string;
  reference?: string | null;
  quantity_in?: number | null;
  quantity_out?: number | null;
  balance_after?: number | null;
  product: {
    id: string;
    name: string;
    sku: string;
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

export type ListInventoryParams = {
  search?: string;
  warehouse_id?: string;
  category_id?: string;
  stock_status?: string;
  page?: number;
  page_size?: number;
  limit?: number;
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

export type CreateStockAdjustmentPayload = {
  product_id: string;
  variant_id?: string | null;
  warehouse_id: string;
  adjustment_type: string;
  quantity?: number;
  reason: string;
  reference_number?: string;
  unit_cost?: number;
  adjustment_quantity?: number;
};

export const getInventorySummary = async (): Promise<InventorySummary> => {
  const res = await axiosInstance.get<InventorySummary>("/admin/inventory/summary");
  return res.data;
};

export const listInventory = async (params: ListInventoryParams = {}): Promise<InventoryItem[]> => {
  const res = await axiosInstance.get<InventoryItem[]>("/admin/inventory", { params });
  return res.data;
};

export const listWarehouses = async (): Promise<Warehouse[]> => {
  const res = await axiosInstance.get<Warehouse[]>("/admin/warehouses");
  return res.data;
};

export const createWarehouse = async (payload: CreateWarehousePayload): Promise<Warehouse> => {
  const res = await axiosInstance.post<Warehouse>("/admin/warehouses", payload);
  return res.data;
};

export const updateWarehouse = async (warehouseId: string, payload: Partial<CreateWarehousePayload>): Promise<Warehouse> => {
  const res = await axiosInstance.patch<Warehouse>(`/admin/warehouses/${warehouseId}`, payload);
  return res.data;
};

export const deleteWarehouse = async (warehouseId: string): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(`/admin/warehouses/${warehouseId}`);
  return res.data;
};

export const listStockAdjustments = async (params: { warehouse_id?: string; adjustment_type?: string } = {}): Promise<StockAdjustment[]> => {
  const res = await axiosInstance.get<StockAdjustment[]>("/admin/stock-adjustments", { params });
  return res.data;
};

export const createStockAdjustment = async (payload: CreateStockAdjustmentPayload): Promise<StockAdjustment> => {
  const res = await axiosInstance.post<StockAdjustment>("/admin/stock-adjustments", payload);
  return res.data;
};

export const listStockMovements = async (params: { product_id?: string; warehouse_id?: string } = {}): Promise<StockMovement[]> => {
  const res = await axiosInstance.get<StockMovement[]>("/admin/inventory/movements", { params });
  return res.data;
};

export const listLowStock = async (params?: { severity?: string; warehouse_id?: string }): Promise<InventoryItem[]> => {
  const res = await axiosInstance.get<InventoryItem[]>("/admin/inventory/low-stock", { params });
  return res.data;
};

export const getProductInventoryDetails = async (
  productId: string
): Promise<{ product: any; totals: any; inventory: InventoryItem[]; movements: StockMovement[] }> => {
  const res = await axiosInstance.get<{ product: any; totals: any; inventory: InventoryItem[]; movements: StockMovement[] }>(
    `/admin/inventory/products/${productId}`
  );
  return res.data;
};

export const getWarehouseInventoryDetails = async (
  warehouseId: string
): Promise<{ warehouse: Warehouse; inventory: InventoryItem[]; low_stock: InventoryItem[]; movements: StockMovement[] }> => {
  const res = await axiosInstance.get<{ warehouse: Warehouse; inventory: InventoryItem[]; low_stock: InventoryItem[]; movements: StockMovement[] }>(
    `/admin/inventory/warehouses/${warehouseId}`
  );
  return res.data;
};

export const listAdjustments = listStockAdjustments;
export const createAdjustment = createStockAdjustment;
export const listMovements = listStockMovements;

export const getSummary = getInventorySummary;

export const getProductInventory = getProductInventoryDetails;
export const getWarehouseInventory = getWarehouseInventoryDetails;

export const getWarehouse = getWarehouseInventoryDetails;

export const inventoryService = {
  getInventorySummary,
  getSummary,
  listInventory,
  listWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  listStockAdjustments,
  createStockAdjustment,
  listStockMovements,
  listAdjustments,
  createAdjustment,
  listMovements,
  listLowStock,
  getProductInventoryDetails,
  getWarehouseInventoryDetails,
  getProductInventory,
  getWarehouseInventory,
  getWarehouse,
};

