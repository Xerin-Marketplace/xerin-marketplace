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
  barcode?: string | null;
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  price: number;
  sale_price?: number | null;
  cost_price?: number | null;
  tax_class?: string | null;
  currency: string;
  weight?: number | null;
  featured: boolean;
  track_stock: boolean;
  quantity: number;
  low_stock_threshold: number;
  warehouse_id?: string | null;
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
  description?: string | null;
  logo_url?: string | null;
  website?: string | null;
  is_active: boolean;
  products_count: number;
  created_at: string;
};

export type ListUsersParams = {
  page?: number;
  page_size?: number;
  search?: string;
  status_filter?: string;
};

export type PaginatedAdminProducts = {
  total: number;
  page: number;
  page_size: number;
  results: AdminProduct[];
};

export type ListAllProductsParams = {
  page?: number;
  page_size?: number;
  search?: string;
  category_id?: string;
  brand_id?: string;
  seller_id?: string;
  status?: string;
  is_active?: boolean;
};

export type ProductCategory = {
  id: string;
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
  products_count: number;
  created_at: string;
};

export type CreateBusinessCategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  active?: boolean;
};

export type CreateProductCategoryPayload = {
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
};

export type UpdateProductCategoryPayload = {
  parent_id?: string | null;
  name?: string;
  slug?: string;
  description?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
};

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string | null;
  status: string;
  admin_reply?: string | null;
  created_at: string;
};

export type UpdateProductReviewPayload = {
  rating?: number;
  comment?: string;
  status?: string;
  admin_reply?: string;
};

export type CreateBrandPayload = {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  is_active?: boolean;
};

export type UpdateBrandPayload = {
  name?: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  is_active?: boolean;
};

export type CreateProductPayload = {
  seller_id: string;
  category_id: string;
  brand_id?: string | null;
  sku: string;
  barcode?: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  price: number;
  sale_price?: number | null;
  cost_price?: number | null;
  tax_class?: string;
  currency?: string;
  weight?: number | null;
  featured?: boolean;
  track_stock?: boolean;
  quantity?: number;
  low_stock_threshold?: number;
  warehouse_id?: string;
};

export type UpdateProductPayload = {
  category_id?: string;
  brand_id?: string | null;
  sku?: string;
  barcode?: string;
  name?: string;
  slug?: string;
  short_description?: string;
  description?: string;
  price?: number;
  sale_price?: number | null;
  cost_price?: number | null;
  tax_class?: string;
  currency?: string;
  weight?: number | null;
  featured?: boolean;
  track_stock?: boolean;
  quantity?: number;
  low_stock_threshold?: number;
  warehouse_id?: string;
  is_active?: boolean;
};



export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "payment_verification"
  | "confirmed"
  | "processing"
  | "packed"
  | "ready_for_dispatch"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled"
  | "rejected"
  | "refunded"
  | "failed";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "partially_paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type OrderItem = {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  sku: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  subtotal: number;
  created_at: string;
};

export type OrderStatusHistoryEntry = {
  id: string;
  order_id: string;
  status: string;
  previous_status: string | null;
  notes: string | null;
  created_by_id: string | null;
  created_at: string;
};

export type OrderPayment = {
  id: string;
  order_id: string;
  user_id: string;
  method: string;
  transaction_reference: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderAddress = {
  id: string;
  country: string;
  region: string;
  city: string;
  street: string;
  postal_code: string | null;
  is_default: boolean;
};

export type OrderCustomer = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  is_verified: boolean;
  status: string;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string;
  address_id: string | null;
  seller_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  delivery_method: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  estimated_delivery_date: string | null;
  delivered_at: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  cancellation_reason: string | null;
  refund_notes: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  status_history: OrderStatusHistoryEntry[];
  payments: OrderPayment[];
  address: OrderAddress | null;
  user: OrderCustomer | null;
  seller: AdminSeller | null;
};

export type PaginatedOrders = {
  total: number;
  page: number;
  page_size: number;
  results: Order[];
};

export type ListOrdersParams = {
  page?: number;
  page_size?: number;
  status?: string;
  payment_status?: string;
  search?: string;
  customer_id?: string;
  seller_id?: string;
  payment_method?: string;
  min_amount?: number;
  max_amount?: number;
  date_from?: string;
  date_to?: string;
};

export type UpdateOrderStatusPayload = {
  status: string;
  notes?: string;
};

export type CancelOrderPayload = {
  reason: string;
};

export type RefundOrderPayload = {
  amount: number;
  notes?: string;
};

export type UpdateOrderTrackingPayload = {
  courier_name?: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
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

  listAllSellers: () =>
    apiClient<AdminSeller[]>("/admin/sellers", {
      method: "GET",
      token: requireToken(),
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

  listAllProducts: (params: ListAllProductsParams = {}) =>
    apiClient<PaginatedAdminProducts>("/admin/products", {
      method: "GET",
      token: requireToken(),
      query: params,
    }),

  createProduct: (payload: CreateProductPayload) =>
    apiClient<AdminProduct>("/admin/products", {
      method: "POST",
      token: requireToken(),
      body: payload,
    }),

  listPendingProducts: () =>
    apiClient<AdminProduct[]>("/admin/products/pending", {
      method: "GET",
      token: requireToken(),
    }),

  updateProduct: (productId: string, payload: UpdateProductPayload) =>
    apiClient<AdminProduct>(`/admin/products/${productId}`, {
      method: "PATCH",
      token: requireToken(),
      body: payload,
    }),

  deleteProduct: (productId: string) =>
    apiClient<{ message: string }>(`/admin/products/${productId}`, {
      method: "DELETE",
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

  listProductCategories: () =>
    apiClient<ProductCategory[]>("/admin/product-categories", {
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

  updateBrand: (brandId: string, payload: UpdateBrandPayload) =>
    apiClient<Brand>(`/admin/brands/${brandId}`, {
      method: "PATCH",
      token: requireToken(),
      body: payload,
    }),

  deleteBrand: (brandId: string) =>
    apiClient<{ message: string }>(`/admin/brands/${brandId}`, {
      method: "DELETE",
      token: requireToken(),
    }),

  createProductCategory: (payload: CreateProductCategoryPayload) =>
    apiClient<ProductCategory>("/admin/product-categories", {
      method: "POST",
      token: requireToken(),
      body: payload,
    }),

  updateProductCategory: (categoryId: string, payload: UpdateProductCategoryPayload) =>
    apiClient<ProductCategory>(`/admin/product-categories/${categoryId}`, {
      method: "PATCH",
      token: requireToken(),
      body: payload,
    }),

  deleteProductCategory: (categoryId: string) =>
    apiClient<{ message: string }>(`/admin/product-categories/${categoryId}`, {
      method: "DELETE",
      token: requireToken(),
    }),

  listProductReviews: (params: { status?: string } = {}) =>
    apiClient<ProductReview[]>("/admin/reviews", {
      method: "GET",
      token: requireToken(),
      query: params,
    }),

  updateProductReview: (reviewId: string, payload: UpdateProductReviewPayload) =>
    apiClient<ProductReview>(`/admin/reviews/${reviewId}`, {
      method: "PATCH",
      token: requireToken(),
      body: payload,
    }),

  deleteProductReview: (reviewId: string) =>
    apiClient<{ message: string }>(`/admin/reviews/${reviewId}`, {
      method: "DELETE",
      token: requireToken(),
    }),


  listOrders: (params: ListOrdersParams = {}) =>
    apiClient<PaginatedOrders>("/admin/orders", {
      method: "GET",
      token: requireToken(),
      query: params,
    }),

  getOrder: (orderId: string) =>
    apiClient<Order>(`/admin/orders/${orderId}`, {
      method: "GET",
      token: requireToken(),
    }),

  updateOrderStatus: (orderId: string, payload: UpdateOrderStatusPayload) =>
    apiClient<Order>(`/admin/orders/${orderId}/status`, {
      method: "PATCH",
      token: requireToken(),
      body: payload,
    }),

  updateOrderTracking: (orderId: string, payload: UpdateOrderTrackingPayload) =>
    apiClient<Order>(`/admin/orders/${orderId}/tracking`, {
      method: "PATCH",
      token: requireToken(),
      body: payload,
    }),

  cancelOrder: (orderId: string, payload: CancelOrderPayload) =>
    apiClient<Order>(`/admin/orders/${orderId}/cancel`, {
      method: "POST",
      token: requireToken(),
      body: payload,
    }),

  refundOrder: (orderId: string, payload: RefundOrderPayload) =>
    apiClient<Order>(`/admin/orders/${orderId}/refund`, {
      method: "POST",
      token: requireToken(),
      body: payload,
    }),
};