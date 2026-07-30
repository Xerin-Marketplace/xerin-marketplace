import axiosInstance from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiMessageResponse, ID } from "@/types/api/common";
import type {
  Brand,
  Category,
  Product,
  ProductImage,
  ProductImageRequest,
  ProductListQuery,
  PopularCategory,
  ProductRequest,
  ProductTag,
  ProductTagRequest,
  ProductUpdateRequest,
  ProductVariant,
  ProductVariantRequest,
} from "@/types/api/product";

export const getProducts = async (query?: ProductListQuery): Promise<Product[]> => {
  const res = await axiosInstance.get<Product[]>(API_ENDPOINTS.products.list, {
    params: query,
  });
  return res.data;
};

export const getProduct = async (id: ID): Promise<Product> => {
  const res = await axiosInstance.get<Product>(API_ENDPOINTS.products.byId(id));
  return res.data;
};

export const getMyProducts = async (query?: ProductListQuery | string | null): Promise<Product[]> => {
  const params = query && typeof query === "object" ? query : undefined;
  const res = await axiosInstance.get<Product[]>(API_ENDPOINTS.products.myProducts, {
    params,
  });
  return res.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const res = await axiosInstance.get<Category[]>(API_ENDPOINTS.products.categories);
  return res.data;
};

export const getPopularCategories = async (
  limit = 12,
): Promise<PopularCategory[]> => {
  const res = await axiosInstance.get<PopularCategory[]>(
    "/products/categories/popular",
    { params: { limit } },
  );
  return res.data;
};

export const trackCategoryEngagement = async (
  categoryId: ID,
  action: "view" | "search" = "view",
): Promise<void> => {
  await axiosInstance.post(`/products/categories/${categoryId}/engagement`, {
    action,
  });
};

export const getBrands = async (): Promise<Brand[]> => {
  const res = await axiosInstance.get<Brand[]>(API_ENDPOINTS.products.brands);
  return res.data;
};

export const createProduct = async (payload: ProductRequest, _token?: string | null): Promise<Product> => {
  const res = await axiosInstance.post<Product>(API_ENDPOINTS.products.list, payload);
  return res.data;
};

export const updateProduct = async (
  id: ID,
  payload: ProductUpdateRequest,
  _token?: string | null
): Promise<Product> => {
  const res = await axiosInstance.patch<Product>(API_ENDPOINTS.products.byId(id), payload);
  return res.data;
};

export const deleteProduct = async (id: ID, _token?: string | null): Promise<ApiMessageResponse> => {
  const res = await axiosInstance.delete<ApiMessageResponse>(API_ENDPOINTS.products.byId(id));
  return res.data;
};

export const uploadProductImage = async (
  productId: ID,
  payload: ProductImageRequest
): Promise<ProductImage> => {
  const res = await axiosInstance.post<ProductImage>(
    API_ENDPOINTS.products.images(productId),
    payload
  );
  return res.data;
};

export const getProductImages = async (productId: ID): Promise<ProductImage[]> => {
  const res = await axiosInstance.get<ProductImage[]>(
    API_ENDPOINTS.products.images(productId)
  );
  return res.data;
};

export const uploadProductImages = async (
  productId: ID,
  images: File[],
): Promise<ProductImage[]> => {
  const formData = new FormData();
  images.forEach((image) => formData.append("images", image));
  const res = await axiosInstance.post<ProductImage[]>(
    `/products/${productId}/images/upload`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
};

export const deleteProductImage = async (
  productId: ID,
  imageId: ID,
): Promise<ApiMessageResponse> => {
  const res = await axiosInstance.delete<ApiMessageResponse>(
    `/products/${productId}/images/${imageId}`,
  );
  return res.data;
};

export const addProductVariant = async (
  productId: ID,
  payload: ProductVariantRequest
): Promise<ProductVariant> => {
  const res = await axiosInstance.post<ProductVariant>(
    API_ENDPOINTS.products.variants(productId),
    payload
  );
  return res.data;
};

export const getProductVariants = async (productId: ID): Promise<ProductVariant[]> => {
  const res = await axiosInstance.get<ProductVariant[]>(
    API_ENDPOINTS.products.variants(productId)
  );
  return res.data;
};

export const addProductTag = async (
  productId: ID,
  payload: ProductTagRequest
): Promise<ProductTag> => {
  const res = await axiosInstance.post<ProductTag>(
    API_ENDPOINTS.products.tags(productId),
    payload
  );
  return res.data;
};

export const getProductTags = async (productId: ID): Promise<ProductTag[]> => {
  const res = await axiosInstance.get<ProductTag[]>(
    API_ENDPOINTS.products.tags(productId)
  );
  return res.data;
};

export const productsApi = {
  list: getProducts,
  getById: getProduct,
  getMyProducts,
  getCategories,
  getPopularCategories,
  trackCategoryEngagement,
  getBrands,
  create: createProduct,
  update: updateProduct,
  delete: deleteProduct,
  uploadImage: uploadProductImage,
  getImages: getProductImages,
  uploadImages: uploadProductImages,
  deleteImage: deleteProductImage,
  addVariant: addProductVariant,
  getVariants: getProductVariants,
  addTag: addProductTag,
  getTags: getProductTags,
};
