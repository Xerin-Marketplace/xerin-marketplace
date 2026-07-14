import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInventorySummary,
  listInventory,
  listWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  listStockAdjustments,
  createStockAdjustment,
  listStockMovements,
  listLowStock,
  getProductInventoryDetails,
  getWarehouseInventoryDetails,
} from "@/lib/api/endpoints/inventory";
import type {
  ListInventoryParams,
  CreateWarehousePayload,
  CreateStockAdjustmentPayload,
} from "@/lib/api/endpoints/inventory";

export const useInventorySummary = () => {
  return useQuery({
    queryKey: ["inventory-summary"],
    queryFn: getInventorySummary,
  });
};

export const useInventoryList = (params?: ListInventoryParams) => {
  return useQuery({
    queryKey: ["inventory-list", params],
    queryFn: () => listInventory(params),
  });
};

export const useWarehousesList = () => {
  return useQuery({
    queryKey: ["warehouses"],
    queryFn: listWarehouses,
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
    },
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      warehouseId,
      payload,
    }: {
      warehouseId: string;
      payload: Partial<CreateWarehousePayload>;
    }) => updateWarehouse(warehouseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-details", variables.warehouseId] });
    },
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
    },
  });
};

export const useStockAdjustmentsList = (params?: { warehouse_id?: string; adjustment_type?: string }) => {
  return useQuery({
    queryKey: ["stock-adjustments", params],
    queryFn: () => listStockAdjustments(params),
  });
};

export const useCreateStockAdjustment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStockAdjustment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
      queryClient.invalidateQueries({ queryKey: ["low-stock"] });
    },
  });
};

export const useStockMovementsList = (params?: { product_id?: string; warehouse_id?: string }) => {
  return useQuery({
    queryKey: ["stock-movements", params],
    queryFn: () => listStockMovements(params),
  });
};

export const useLowStockList = () => {
  return useQuery({
    queryKey: ["low-stock"],
    queryFn: () => listLowStock(),
  });
};

export const useProductInventoryDetails = (productId: string) => {
  return useQuery({
    queryKey: ["product-inventory-details", productId],
    queryFn: () => getProductInventoryDetails(productId),
    enabled: Boolean(productId),
  });
};

export const useWarehouseInventoryDetails = (warehouseId: string) => {
  return useQuery({
    queryKey: ["warehouse-details", warehouseId],
    queryFn: () => getWarehouseInventoryDetails(warehouseId),
    enabled: Boolean(warehouseId),
  });
};
