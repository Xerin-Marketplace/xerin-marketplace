import axiosInstance from "../client";

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

export const listUsers = async (params: ListUsersParams = {}): Promise<PaginatedAdminUsers> => {
  const res = await axiosInstance.get<PaginatedAdminUsers>("/admin/users", { params });
  return res.data;
};

export const listAllSellers = async (): Promise<AdminSeller[]> => {
  const res = await axiosInstance.get<AdminSeller[]>("/admin/sellers");
  return res.data;
};

export const listPendingSellers = async (): Promise<AdminSeller[]> => {
  const res = await axiosInstance.get<AdminSeller[]>("/admin/sellers/pending");
  return res.data;
};

export const approveSeller = async (sellerId: string): Promise<AdminSeller> => {
  const res = await axiosInstance.post<AdminSeller>(`/admin/sellers/${sellerId}/approve`);
  return res.data;
};

export const rejectSeller = async (sellerId: string, reason: string): Promise<AdminSeller> => {
  const formData = new FormData();
  formData.append("reason", reason);
  const res = await axiosInstance.post<AdminSeller>(`/admin/sellers/${sellerId}/reject`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const listAllProducts = async (params: ListAllProductsParams = {}): Promise<PaginatedAdminProducts> => {
  const res = await axiosInstance.get<PaginatedAdminProducts>("/admin/products", { params });
  return res.data;
};

export const createProduct = async (payload: CreateProductPayload): Promise<AdminProduct> => {
  const res = await axiosInstance.post<AdminProduct>("/admin/products", payload);
  return res.data;
};

export const listPendingProducts = async (): Promise<AdminProduct[]> => {
  const res = await axiosInstance.get<AdminProduct[]>("/admin/products/pending");
  return res.data;
};

export const getProduct = async (productId: string): Promise<AdminProduct> => {
  const res = await axiosInstance.get<AdminProduct>(`/admin/products/${productId}`);
  return res.data;
};

export const deleteProduct = async (productId: string): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(`/admin/products/${productId}`);
  return res.data;
};

export const updateProduct = async (productId: string, payload: UpdateProductPayload): Promise<AdminProduct> => {
  const res = await axiosInstance.patch<AdminProduct>(`/admin/products/${productId}`, payload);
  return res.data;
};


export const approveProduct = async (productId: string): Promise<AdminProduct> => {
  const res = await axiosInstance.post<AdminProduct>(`/admin/products/${productId}/approve`);
  return res.data;
};

export const rejectProduct = async (productId: string, reason: string): Promise<AdminProduct> => {
  const formData = new FormData();
  formData.append("reason", reason);
  const res = await axiosInstance.post<AdminProduct>(`/admin/products/${productId}/reject`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const listBusinessCategories = async (): Promise<BusinessCategory[]> => {
  const res = await axiosInstance.get<BusinessCategory[]>("/admin/business-categories");
  return res.data;
};

export const listProductCategories = async (): Promise<ProductCategory[]> => {
  const res = await axiosInstance.get<ProductCategory[]>("/admin/product-categories");
  return res.data;
};

export const createBusinessCategory = async (payload: CreateBusinessCategoryPayload): Promise<BusinessCategory> => {
  const res = await axiosInstance.post<BusinessCategory>("/admin/business-categories", payload);
  return res.data;
};

export const deleteBusinessCategory = async (categoryId: string): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(`/admin/business-categories/${categoryId}`);
  return res.data;
};

export const listBrands = async (): Promise<Brand[]> => {
  const res = await axiosInstance.get<Brand[]>("/admin/brands");
  return res.data;
};

export const createBrand = async (payload: CreateBrandPayload): Promise<Brand> => {
  const res = await axiosInstance.post<Brand>("/admin/brands", payload);
  return res.data;
};

export const updateBrand = async (brandId: string, payload: UpdateBrandPayload): Promise<Brand> => {
  const res = await axiosInstance.patch<Brand>(`/admin/brands/${brandId}`, payload);
  return res.data;
};

export const deleteBrand = async (brandId: string): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(`/admin/brands/${brandId}`);
  return res.data;
};

export const createProductCategory = async (payload: CreateProductCategoryPayload): Promise<ProductCategory> => {
  const res = await axiosInstance.post<ProductCategory>("/admin/product-categories", payload);
  return res.data;
};

export const updateProductCategory = async (categoryId: string, payload: UpdateProductCategoryPayload): Promise<ProductCategory> => {
  const res = await axiosInstance.patch<ProductCategory>(`/admin/product-categories/${categoryId}`, payload);
  return res.data;
};

export const deleteProductCategory = async (categoryId: string): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(`/admin/product-categories/${categoryId}`);
  return res.data;
};

export const listProductReviews = async (params: { status?: string } = {}): Promise<ProductReview[]> => {
  const res = await axiosInstance.get<ProductReview[]>("/admin/reviews", { params });
  return res.data;
};

export const updateProductReview = async (reviewId: string, payload: UpdateProductReviewPayload): Promise<ProductReview> => {
  const res = await axiosInstance.patch<ProductReview>(`/admin/reviews/${reviewId}`, payload);
  return res.data;
};

export const deleteProductReview = async (reviewId: string): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(`/admin/reviews/${reviewId}`);
  return res.data;
};

export const listOrders = async (params: ListOrdersParams = {}): Promise<PaginatedOrders> => {
  const res = await axiosInstance.get<PaginatedOrders>("/admin/orders", { params });
  return res.data;
};

export const getOrder = async (orderId: string): Promise<Order> => {
  const res = await axiosInstance.get<Order>(`/admin/orders/${orderId}`);
  return res.data;
};

export const updateOrderStatus = async (orderId: string, payload: UpdateOrderStatusPayload): Promise<Order> => {
  const res = await axiosInstance.patch<Order>(`/admin/orders/${orderId}/status`, payload);
  return res.data;
};

export const updateOrderTracking = async (orderId: string, payload: UpdateOrderTrackingPayload): Promise<Order> => {
  const res = await axiosInstance.patch<Order>(`/admin/orders/${orderId}/tracking`, payload);
  return res.data;
};

export const cancelOrder = async (orderId: string, payload: CancelOrderPayload): Promise<Order> => {
  const res = await axiosInstance.post<Order>(`/admin/orders/${orderId}/cancel`, payload);
  return res.data;
};

export const refundOrder = async (orderId: string, payload: RefundOrderPayload): Promise<Order> => {
  const res = await axiosInstance.post<Order>(`/admin/orders/${orderId}/refund`, payload);
  return res.data;
};

export type FinanceSummary = {
  totalRevenue: number;
  totalCommissions: number;
  totalPayouts: number;
  pendingPayouts: number;
  failedPayments: number;
};

export type AdminTransaction = {
  id: string;
  reference: string;
  method: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
};

export type Dispute = {
  id: string;
  order_number: string;
  reason: string;
  status: "open" | "under_review" | "resolved" | "closed";
  created_at: string;
};

export type AnalyticsOverview = {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: { id: string; name: string; sales: number }[];
  newCustomers: number;
  returningCustomers: number;
};

export const getFinanceSummary = async (): Promise<FinanceSummary> => {
  const res = await axiosInstance.get<FinanceSummary>("/admin/finance/summary");
  return res.data;
};

export const listTransactions = async (params: { status?: string } = {}): Promise<AdminTransaction[]> => {
  const res = await axiosInstance.get<AdminTransaction[]>("/admin/finance/transactions", { params });
  return res.data;
};

export const listDisputes = async (params: { status?: string } = {}): Promise<Dispute[]> => {
  const res = await axiosInstance.get<Dispute[]>("/admin/disputes", { params });
  return res.data;
};

export const getAnalyticsOverview = async (): Promise<AnalyticsOverview> => {
  const res = await axiosInstance.get<AnalyticsOverview>("/admin/analytics/overview");
  return res.data;
};

export const adminService = {
  listUsers,
  listAllSellers,
  listPendingSellers,
  approveSeller,
  rejectSeller,
  listAllProducts,
  createProduct,
  listPendingProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  approveProduct,
  rejectProduct,
  listBusinessCategories,
  listProductCategories,
  createBusinessCategory,
  deleteBusinessCategory,
  listBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  listProductReviews,
  updateProductReview,
  deleteProductReview,
  listOrders,
  getOrder,
  updateOrderStatus,
  updateOrderTracking,
  cancelOrder,
  refundOrder,
  getFinanceSummary,
  listTransactions,
  listDisputes,
  getAnalyticsOverview,
};

