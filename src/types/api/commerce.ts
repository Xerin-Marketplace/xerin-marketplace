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
  user_id: string;
  shipping_address_id: string | null;
  status: string;
  currency: string;
  subtotal: number | string;
  discount_amount: number | string;
  shipping_amount: number | string;
  tax_amount: number | string;
  total: number | string;
  coupon_code: string | null;
  notes: string | null;
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
  paid_at: string | null;
  transactions: Array<Record<string, unknown>>;
};

export type PaginatedOrders = PaginatedResults<Order>;
