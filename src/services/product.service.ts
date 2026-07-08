import { apiClient, ApiQueryValue } from "./api/client";

export type ProductQuery = Record<string, ApiQueryValue>;

export const productService = {
  getProducts: (query?: ProductQuery) => {
    return apiClient.get("/products", { query });
  },

  getProductById: (id: string) => {
    return apiClient.get(`/products/${id}`);
  },

  getCategories: () => {
    return apiClient.get("/products/categories");
  },

  getBrands: () => {
    return apiClient.get("/products/brands");
  },
};
