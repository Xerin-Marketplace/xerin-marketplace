import axiosInstance from "../client";
import type { Cart, Order, PaginatedOrders, Payment } from "@/types/api/commerce";

export const cartApi = {
  get: async (signal?: AbortSignal) =>
    (await axiosInstance.get<Cart>("/cart", { signal })).data,
  addItem: async (payload: { product_id: string; variant_id?: string | null; quantity: number }) =>
    (await axiosInstance.post<Cart>("/cart/items", payload)).data,
  updateItem: async (itemId: string, quantity: number) =>
    (await axiosInstance.put<Cart>(`/cart/items/${itemId}`, { quantity })).data,
  removeItem: async (itemId: string) =>
    (await axiosInstance.delete<Cart>(`/cart/items/${itemId}`)).data,
  clear: async () => (await axiosInstance.delete<Cart>("/cart")).data,
  applyCoupon: async (code: string) =>
    (await axiosInstance.post<Cart>("/cart/apply-coupon", { code })).data,
  removeCoupon: async () => (await axiosInstance.delete<Cart>("/cart/coupon")).data,
};

export const ordersApi = {
  mine: async (params: { page?: number; page_size?: number } = {}, signal?: AbortSignal) =>
    (await axiosInstance.get<PaginatedOrders>("/orders/my-orders", { params, signal })).data,
  get: async (id: string, signal?: AbortSignal) =>
    (await axiosInstance.get<Order>(`/orders/${id}`, { signal })).data,
  create: async (payload: { shipping_address_id?: string; coupon_code?: string; notes?: string }) =>
    (await axiosInstance.post<Order>("/orders", payload)).data,
  updateStatus: async (id: string, payload: { status: string; notes?: string }) =>
    (await axiosInstance.patch<Order>(`/orders/${id}/status`, payload)).data,
  adminList: async (params: { page?: number; page_size?: number; status?: string } = {}, signal?: AbortSignal) =>
    (await axiosInstance.get<PaginatedOrders>("/orders/admin/all", { params, signal })).data,
};

export const paymentsApi = {
  mine: async (signal?: AbortSignal) =>
    (await axiosInstance.get<Payment[]>("/payments/my-payments", { signal })).data,
  get: async (id: string, signal?: AbortSignal) =>
    (await axiosInstance.get<Payment>(`/payments/${id}`, { signal })).data,
  initiate: async (payload: { order_id: string; method: string; provider?: string; phone_number?: string }) =>
    (await axiosInstance.post<Payment>("/payments/initiate", payload)).data,
};
