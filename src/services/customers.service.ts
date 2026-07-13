import { apiClient } from "@/lib/api/client";
import { authStorage } from "@/lib/auth/storage";
import type { AdminUser } from "./admin.service";
import type { Order } from "./admin.service";

const requireToken = (): string => {
  const token = authStorage.getAccessToken();
  if (!token) throw new Error("No active session. Please sign in again.");
  return token;
};

export type Customer = AdminUser & {
  profile_photo?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  last_login_at?: string | null;
};

export type CustomerSummary = {
  total_customers: number;
  active_customers: number;
  verified_customers: number;
  new_today: number;
  customers_with_orders: number;
  blocked_customers: number;
  vip_customers: number;
  lifetime_revenue: number;
};

export type CustomerStats = {
  orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_spent: number;
  average_order: number;
  reviews: number;
  wishlist_items: number;
};

export type CustomerAddress = {
  id: string;
  label: string | null;
  address_type: string;
  country: string;
  region: string;
  city: string;
  street: string;
  postal_code: string | null;
  is_default: boolean;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
  updated_at: string | null;
};

export type CustomerReview = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  status: string;
  admin_reply: string | null;
  created_at: string;
  updated_at: string | null;
  product?: { name: string };
};

export type CustomerPayment = {
  id: string;
  order_id: string;
  method: string;
  transaction_reference: string | null;
  amount: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
};

export type CustomerWishlist = {
  id: string;
  product_id: string;
  product_name: string | null;
  price: number | null;
  is_available: boolean;
  created_at: string;
};

export type CustomerLoginHistory = {
  id: string;
  device: string | null;
  browser: string | null;
  ip_address: string | null;
  country: string | null;
  login_at: string;
};

export type CustomerNote = {
  id: string;
  user_id: string;
  note: string;
  created_by_id: string | null;
  created_at: string;
  updated_at: string | null;
};

export type CustomerDetails = {
  customer: Customer;
  stats: CustomerStats;
  orders: Order[];
  addresses: CustomerAddress[];
  reviews: CustomerReview[];
  payments: CustomerPayment[];
  wishlist: CustomerWishlist[];
  login_history: CustomerLoginHistory[];
  notes: CustomerNote[];
};

export type SupportTicket = {
  id: string;
  ticket_number: string;
  user_id: string;
  customer_name: string | null;
  subject: string;
  description: string | null;
  priority: string;
  status: string;
  assigned_to_id: string | null;
  assigned_to_name: string | null;
  created_at: string;
  updated_at: string | null;
};

export type ListCustomersParams = {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  verification_status?: string;
  has_orders?: boolean;
  customer_type?: string;
  date_from?: string;
  date_to?: string;
};

export type PaginatedCustomers = {
  total: number;
  page: number;
  page_size: number;
  results: Customer[];
};

export const customersService = {
  getSummary: () =>
    apiClient<CustomerSummary>("/admin/customers/summary", {
      method: "GET",
      token: requireToken(),
    }),

  listCustomers: (params: ListCustomersParams = {}) =>
    apiClient<PaginatedCustomers>("/admin/customers", {
      method: "GET",
      token: requireToken(),
      query: params,
    }),

  getCustomer: (customerId: string) =>
    apiClient<CustomerDetails>(`/admin/customers/${customerId}`, {
      method: "GET",
      token: requireToken(),
    }),

  listAddresses: (customerId: string) =>
    apiClient<CustomerAddress[]>(`/admin/customers/${customerId}/addresses`, {
      method: "GET",
      token: requireToken(),
    }),

  listAllAddresses: (params: { search?: string } = {}) =>
    apiClient<CustomerAddress[]>("/admin/customer-addresses", {
      method: "GET",
      token: requireToken(),
      query: params,
    }),

  listOrders: (customerId: string) =>
    apiClient<Order[]>(`/admin/customers/${customerId}/orders`, {
      method: "GET",
      token: requireToken(),
    }),

  listReviews: (customerId: string) =>
    apiClient<CustomerReview[]>(`/admin/customers/${customerId}/reviews`, {
      method: "GET",
      token: requireToken(),
    }),

  listPayments: (customerId: string) =>
    apiClient<CustomerPayment[]>(`/admin/customers/${customerId}/payments`, {
      method: "GET",
      token: requireToken(),
    }),

  listWishlist: (customerId: string) =>
    apiClient<CustomerWishlist[]>(`/admin/customers/${customerId}/wishlist`, {
      method: "GET",
      token: requireToken(),
    }),

  listLoginHistory: (customerId: string) =>
    apiClient<CustomerLoginHistory[]>(`/admin/customers/${customerId}/login-history`, {
      method: "GET",
      token: requireToken(),
    }),

  listNotes: (customerId: string) =>
    apiClient<CustomerNote[]>(`/admin/customers/${customerId}/notes`, {
      method: "GET",
      token: requireToken(),
    }),

  createNote: (customerId: string, note: string) =>
    apiClient<CustomerNote>(`/admin/customers/${customerId}/notes`, {
      method: "POST",
      token: requireToken(),
      body: { note },
    }),

  deleteNote: (customerId: string, noteId: string) =>
    apiClient<{ message: string }>(`/admin/customers/${customerId}/notes/${noteId}`, {
      method: "DELETE",
      token: requireToken(),
    }),

  listSupportTickets: (params: { status?: string; priority?: string } = {}) =>
    apiClient<SupportTicket[]>("/admin/support-tickets", {
      method: "GET",
      token: requireToken(),
      query: params,
    }),

  updateSupportTicket: (ticketId: string, payload: { status?: string; priority?: string; assigned_to_id?: string | null }) =>
    apiClient<SupportTicket>(`/admin/support-tickets/${ticketId}`, {
      method: "PATCH",
      token: requireToken(),
      body: payload,
    }),
};
