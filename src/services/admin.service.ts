import { apiClient } from "@/lib/api/client";
import { authStorage } from "@/lib/auth/storage";

export type AdminUser = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  status: string;
  is_verified: boolean;
  created_at: string;
};

export type PaginatedAdminUsers = {
  total: number;
  page: number;
  page_size: number;
  results: AdminUser[];
};

export type AdminSeller = {
  id: string;
  user_id: string;
  business_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
};

export type AdminProduct = {
  id: string;
  seller_id: string;
  category_id: string;
  brand_id?: string | null;
  sku: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number | null;
  currency: string;
  status: string;
  rejection_reason?: string | null;
  is_active: boolean;
  created_at: string;
};

export type BusinessCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  created_at: string;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type ListUsersParams = {
  page?: number;
  page_size?: number;
  search?: string;
  status_filter?: string;
};

export type CreateBusinessCategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  active?: boolean;
};

export type CreateBrandPayload = {
  name: string;
  slug: string;
};

const requireToken = (): string => {
  const token = authStorage.getAccessToken();

  if (!token) {
    throw new Error("No active session. Please sign in again.");
  }

  return token;
};

export const adminService = {
  listUsers: (params: ListUsersParams = {}) =>
    apiClient<PaginatedAdminUsers>("/admin/users", {
      method: "GET",
      token: requireToken(),
      query: params,
    }),

  listPendingSellers: () =>
    apiClient<AdminSeller[]>("/admin/sellers/pending", {
      method: "GET",
      token: requireToken(),
    }),

  approveSeller: (sellerId: string) =>
    apiClient<AdminSeller>(`/admin/sellers/${sellerId}/approve`, {
      method: "POST",
      token: requireToken(),
    }),

  rejectSeller: (sellerId: string, reason: string) => {
    const formData = new FormData();
    formData.append("reason", reason);

    return apiClient<AdminSeller>(`/admin/sellers/${sellerId}/reject`, {
      method: "POST",
      token: requireToken(),
      body: formData,
    });
  },

  listPendingProducts: () =>
    apiClient<AdminProduct[]>("/admin/products/pending", {
      method: "GET",
      token: requireToken(),
    }),

  approveProduct: (productId: string) =>
    apiClient<AdminProduct>(`/admin/products/${productId}/approve`, {
      method: "POST",
      token: requireToken(),
    }),

  rejectProduct: (productId: string, reason: string) => {
    const formData = new FormData();
    formData.append("reason", reason);

    return apiClient<AdminProduct>(`/admin/products/${productId}/reject`, {
      method: "POST",
      token: requireToken(),
      body: formData,
    });
  },

  listBusinessCategories: () =>
    apiClient<BusinessCategory[]>("/admin/business-categories", {
      method: "GET",
      token: requireToken(),
    }),

  createBusinessCategory: (payload: CreateBusinessCategoryPayload) =>
    apiClient<BusinessCategory>("/admin/business-categories", {
      method: "POST",
      token: requireToken(),
      body: payload,
    }),

  deleteBusinessCategory: (categoryId: string) =>
    apiClient<{ message: string }>(`/admin/business-categories/${categoryId}`, {
      method: "DELETE",
      token: requireToken(),
    }),

  listBrands: () =>
    apiClient<Brand[]>("/admin/brands", {
      method: "GET",
      token: requireToken(),
    }),

  createBrand: (payload: CreateBrandPayload) =>
    apiClient<Brand>("/admin/brands", {
      method: "POST",
      token: requireToken(),
      body: payload,
    }),

  deleteBrand: (brandId: string) =>
    apiClient<{ message: string }>(`/admin/brands/${brandId}`, {
      method: "DELETE",
      token: requireToken(),
    }),
};
