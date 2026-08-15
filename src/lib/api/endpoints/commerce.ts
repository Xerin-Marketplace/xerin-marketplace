import axiosInstance from "../client";
import type {
  Cart,
  GuestCartMergeResult,
  Order,
  PaginatedOrders,
  Payment,
  PaymentOption,
  ShippingOption,
} from "@/types/api/commerce";

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
  validate: async () => (await axiosInstance.post<Cart>("/cart/validate")).data,
  merge: async (items: Array<{ product_id: string; variant_id?: string | null; quantity: number }>) =>
    (await axiosInstance.post<GuestCartMergeResult>("/cart/merge", { items })).data,
};

export const checkoutApi = {
  shippingOptions: async (
    addressId: string,
    subtotal: number,
    weightKg = 0,
    signal?: AbortSignal,
  ) => {
    type BackendShippingOption = {
      rate_id: string;
      method_id: string;
      method_name: string;
      carrier_name?: string | null;
      amount: number | string;
      currency: string;
      min_delivery_days: number;
      max_delivery_days: number;
    };
    const response = await axiosInstance.post<BackendShippingOption[]>(
      "/shipping/quote",
      { address_id: addressId, subtotal, weight_kg: weightKg },
      { signal },
    );
    return response.data.map((option) => ({
      id: option.rate_id,
      method_id: option.method_id,
      service_name: option.method_name,
      carrier: option.carrier_name || "Marketplace delivery",
      amount: option.amount,
      currency: option.currency,
      estimated_min_days: option.min_delivery_days,
      estimated_max_days: option.max_delivery_days,
      tracking_supported: true,
    } satisfies ShippingOption));
  },
  paymentOptions: async (): Promise<PaymentOption[]> => [
    {
      id: "mobile_money",
      label: "AzamPay Mobile Money",
      requires_phone: true,
      providers: ["Airtel", "Tigo", "Halopesa", "Azampesa", "Mpesa"],
    },
    {
      id: "card",
      label: "AzamPay Card",
      requires_phone: false,
      providers: ["azampay"],
    },
  ],
};

export const ordersApi = {
  mine: async (params: { page?: number; page_size?: number } = {}, signal?: AbortSignal) =>
    (await axiosInstance.get<PaginatedOrders>("/orders/my-orders", { params, signal })).data,
  get: async (id: string, signal?: AbortSignal) =>
    (await axiosInstance.get<Order>(`/orders/${id}`, { signal })).data,
  create: async (payload: {
    shipping_address_id: string;
    shipping_rate_id: string;
    coupon_code?: string;
    notes?: string;
  }) =>
    (await axiosInstance.post<Order>("/orders", payload)).data,
  updateStatus: async (id: string, payload: { status: string; notes?: string }) =>
    (await axiosInstance.patch<Order>(`/orders/${id}/status`, payload)).data,
  adminList: async (
    params: {
      page?: number;
      page_size?: number;
      status?: string;
      search?: string;
      payment_status?: string;
      date_from?: string;
      date_to?: string;
    } = {},
    signal?: AbortSignal,
  ) =>
    (
      await axiosInstance.get<PaginatedOrders>("/orders/admin/all", {
        params,
        signal,
      })
    ).data,
};

export const paymentsApi = {
  mine: async (signal?: AbortSignal) =>
    (await axiosInstance.get<Payment[]>("/payments/my-payments", { signal })).data,
  get: async (id: string, signal?: AbortSignal) =>
    (await axiosInstance.get<Payment>(`/payments/${id}`, { signal })).data,
  initiate: async (payload: { order_id: string; method: string; provider?: string; phone_number?: string; success_url?: string; failure_url?: string }) =>
    (await axiosInstance.post<Payment>("/payments/initiate", payload)).data,
};
