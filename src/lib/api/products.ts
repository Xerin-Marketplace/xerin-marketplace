import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
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

export const productsApi = {
  list: (query?: ProductListQuery) =>
    apiClient<Product[]>(API_ENDPOINTS.products.list, {
      method: "GET",
      query,
    }),

  getById: (id: ID) =>
    apiClient<Product>(API_ENDPOINTS.products.byId(id), {
      method: "GET",
    }),

  getMyProducts: (token?: string | null, query?: ProductListQuery) =>
    apiClient<Product[]>(API_ENDPOINTS.products.myProducts, {
      method: "GET",
      token,
      query,
    }),

  getCategories: () =>
    apiClient<Category[]>(API_ENDPOINTS.products.categories, {
      method: "GET",
    }),

  getBrands: () =>
    apiClient<Brand[]>(API_ENDPOINTS.products.brands, {
      method: "GET",
    }),

  create: (payload: ProductRequest, token?: string | null) =>
    apiClient<Product>(API_ENDPOINTS.products.list, {
      method: "POST",
      token,
      body: payload,
    }),

  update: (id: ID, payload: Partial<ProductRequest>, token?: string | null) =>
    apiClient<Product>(API_ENDPOINTS.products.byId(id), {
      method: "PATCH",
      token,
      body: payload,
    }),

  delete: (id: ID, token?: string | null) =>
    apiClient<ApiMessageResponse>(API_ENDPOINTS.products.byId(id), {
      method: "DELETE",
      token,
    }),

  uploadImage: (
    productId: ID,
    file: File,
    token?: string | null,
    options?: { altText?: string; isPrimary?: boolean; sortOrder?: number }
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    if (options?.altText) formData.append("alt_text", options.altText);
    if (typeof options?.isPrimary === "boolean") {
      formData.append("is_primary", String(options.isPrimary));
    }
    if (typeof options?.sortOrder === "number") {
      formData.append("sort_order", String(options.sortOrder));
    }

    return apiClient<ProductImage>(API_ENDPOINTS.products.images(productId), {
      method: "POST",
      token,
      body: formData,
    });
  },

  addVariant: (productId: ID, payload: Partial<ProductVariant>, token?: string | null) =>
    apiClient<ProductVariant>(API_ENDPOINTS.products.variants(productId), {
      method: "POST",
      token,
      body: payload,
    }),

  addTag: (productId: ID, payload: Pick<ProductTag, "name">, token?: string | null) =>
    apiClient<ProductTag>(API_ENDPOINTS.products.tags(productId), {
      method: "POST",
      token,
      body: payload,
    }),
};
