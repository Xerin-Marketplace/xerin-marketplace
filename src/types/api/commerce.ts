import type { PaginatedResults, TimestampFields } from "./common";
import type { Product } from "./product";

export type CartItem = {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number | string;
  product: Product;
};

export type Cart = {
  id: string;
  user_id: string;
  coupon_code: string | null;
  items: CartItem[];
  subtotal: number | string;
  discount_amount: number | string;
  total: number | string;
  currency: string;
  validation_messages: string[];
};

export type GuestCartMergeResult = {
  cart: Cart;
  rejected_items: Array<{
    product_id: string;
    reason: string;
    available_quantity?: number;
  }>;
};

export type ShippingOption = {
  id: string;
  method_id: string;
  service_name: string;
  carrier: string;
  amount: number | string;
  currency: string;
  estimated_min_days: number;
  estimated_max_days: number;
  tracking_supported: boolean;
};

export type PaymentOption = {
  id: string;
  label: string;
  requires_phone: boolean;
  providers: string[];
};

export type CheckoutQuote = {
  cart_id: string;
  currency: string;
  subtotal: number | string;
  discount_amount: number | string;
  shipping_amount: number | string;
  tax_amount: number | string;
  total: number | string;
  shipping_option: ShippingOption;
  validation_messages: string[];
};

export type OrderItem = {
  id: string;
  product_id: string;
  variant_id: string | null;
  seller_id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number | string;
  total_price: number | string;
};

export type Order = TimestampFields & {
  id: string;
  order_number?: string | null;
  user_id: string;
  shipping_address_id: string | null;
  seller_id?: string | null;
  status: string;
  payment_status?: string | null;
  currency: string;
  subtotal: number | string;
  discount_amount: number | string;
  shipping_amount: number | string;
  tax_amount: number | string;
  total: number | string;
  coupon_code: string | null;
  notes: string | null;
  delivery_method?: string | null;
  courier_name?: string | null;
  tracking_number?: string | null;
  estimated_delivery_date?: string | null;
  delivered_at?: string | null;
  cancellation_reason?: string | null;
  refund_notes?: string | null;
  user?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  payments?: Array<{
    id: string;
    method?: string | null;
    status?: string | null;
    amount?: number | string;
    currency?: string;
    transaction_reference?: string | null;
    paid_at?: string | null;
  }>;
  address?: {
    country?: string;
    region?: string;
    city?: string;
    street?: string;
    postal_code?: string | null;
  } | null;
  items: OrderItem[];
  status_history: Array<{ id: string; status: string; notes: string | null; created_at: string }>;
};

export type Payment = TimestampFields & {
  id: string;
  order_id: string;
  user_id: string;
  amount: number | string;
  currency: string;
  method: string;
  provider: string | null;
  status: string;
  provider_transaction_id: string | null;
  provider_response?: {
    checkout_url?: string | null;
    message?: string | null;
    [key: string]: unknown;
  } | null;
  paid_at: string | null;
  transactions: Array<Record<string, unknown>>;
};

export type PaginatedOrders = PaginatedResults<Order>;
