import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts as apiGetProducts,
  getProduct as apiGetProduct,
  getMyProducts as apiGetMyProducts,
  getCategories as apiGetCategories,
  getBrands as apiGetBrands,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  uploadProductImage as apiUploadProductImage,
} from "@/lib/api/endpoints/products";
import type { ProductListQuery, ProductRequest } from "@/types/api/product";
import type { ID } from "@/types/api/common";

export const useProducts = (query?: ProductListQuery) => {
  return useQuery({
    queryKey: ["products", query],
    queryFn: () => apiGetProducts(query),
  });
};

export const useProduct = (id: ID) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => apiGetProduct(id),
    enabled: Boolean(id),
  });
};

export const useMyProducts = (query?: ProductListQuery) => {
  return useQuery({
    queryKey: ["my-products", query],
    queryFn: () => apiGetMyProducts(query),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: apiGetCategories,
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: apiGetBrands,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductRequest) => apiCreateProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: ID; payload: Partial<ProductRequest> }) =>
      apiUpdateProduct(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: ID) => apiDeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
  });
};

export const useUploadProductImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      file,
      options,
    }: {
      productId: ID;
      file: File;
      options?: { altText?: string; isPrimary?: boolean; sortOrder?: number };
    }) => apiUploadProductImage(productId, file, options),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
    },
  });
};
