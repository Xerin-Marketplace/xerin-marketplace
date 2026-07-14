import axiosInstance from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiMessageResponse, ID } from "@/types/api/common";
import type {
  Brand,
  Category,
  Product,
  ProductImage,
  ProductListQuery,
  ProductRequest,
  ProductTag,
  ProductVariant,
} from "@/types/api/product";

export const getProducts = async (query?: ProductListQuery): Promise<Product[]> => {
  const res = await axiosInstance.get<Product[]>(API_ENDPOINTS.products.list, { params: query });
  return res.data;
};

export const getProduct = async (id: ID): Promise<Product> => {
  const res = await axiosInstance.get<Product>(API_ENDPOINTS.products.byId(id));
  return res.data;
};

export const getMyProducts = async (query?: ProductListQuery | string | null): Promise<Product[]> => {
  const params = query && typeof query === "object" ? query : undefined;
  const res = await axiosInstance.get<Product[]>(API_ENDPOINTS.products.myProducts, { params });
  return res.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const res = await axiosInstance.get<Category[]>(API_ENDPOINTS.products.categories);
  return res.data;
};

export const getBrands = async (): Promise<Brand[]> => {
  const res = await axiosInstance.get<Brand[]>(API_ENDPOINTS.products.brands);
  return res.data;
};

export const createProduct = async (payload: ProductRequest, token?: string | null): Promise<Product> => {
  const res = await axiosInstance.post<Product>(API_ENDPOINTS.products.list, payload);
  return res.data;
};

export const updateProduct = async (
  id: ID,
  payload: Partial<ProductRequest>,
  token?: string | null
): Promise<Product> => {
  const res = await axiosInstance.patch<Product>(API_ENDPOINTS.products.byId(id), payload);
  return res.data;
};

export const deleteProduct = async (id: ID, token?: string | null): Promise<ApiMessageResponse> => {
  const res = await axiosInstance.delete<ApiMessageResponse>(API_ENDPOINTS.products.byId(id));
  return res.data;
};

export const uploadProductImage = async (
  productId: ID,
  file: File,
  options?: { altText?: string; isPrimary?: boolean; sortOrder?: number },
  token?: string | null
): Promise<ProductImage> => {
  const formData = new FormData();
  formData.append("file", file);

  if (options?.altText) formData.append("alt_text", options.altText);
  if (typeof options?.isPrimary === "boolean") {
    formData.append("is_primary", String(options.isPrimary));
  }
  if (typeof options?.sortOrder === "number") {
    formData.append("sort_order", String(options.sortOrder));
  }

  const res = await axiosInstance.post<ProductImage>(API_ENDPOINTS.products.images(productId), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const addProductVariant = async (
  productId: ID,
  payload: Partial<ProductVariant>,
  token?: string | null
): Promise<ProductVariant> => {
  const res = await axiosInstance.post<ProductVariant>(API_ENDPOINTS.products.variants(productId), payload);
  return res.data;
};

export const addProductTag = async (
  productId: ID,
  payload: Pick<ProductTag, "name">,
  token?: string | null
): Promise<ProductTag> => {
  const res = await axiosInstance.post<ProductTag>(API_ENDPOINTS.products.tags(productId), payload);
  return res.data;
};

export const productsApi = {
  list: getProducts,
  getById: getProduct,
  getMyProducts,
  getCategories,
  getBrands,
  create: createProduct,
  update: updateProduct,
  delete: deleteProduct,
  uploadImage: uploadProductImage,
  addVariant: addProductVariant,
  addTag: addProductTag,
};

