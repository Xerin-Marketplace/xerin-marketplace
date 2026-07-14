import axiosInstance from "../client";
import type { AdminUser, Order } from "./admin";

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

export const getCustomerSummary = async (): Promise<CustomerSummary> => {
  const res = await axiosInstance.get<CustomerSummary>("/admin/customers/summary");
  return res.data;
};

export const listCustomers = async (params: ListCustomersParams = {}): Promise<PaginatedCustomers> => {
  const res = await axiosInstance.get<PaginatedCustomers>("/admin/customers", { params });
  return res.data;
};

export const getCustomerDetails = async (customerId: string): Promise<CustomerDetails> => {
  const res = await axiosInstance.get<CustomerDetails>(`/admin/customers/${customerId}`);
  return res.data;
};

export const listCustomerAddresses = async (customerId: string): Promise<CustomerAddress[]> => {
  const res = await axiosInstance.get<CustomerAddress[]>(`/admin/customers/${customerId}/addresses`);
  return res.data;
};

export const listAllAddresses = async (params: { search?: string } = {}): Promise<CustomerAddress[]> => {
  const res = await axiosInstance.get<CustomerAddress[]>("/admin/customer-addresses", { params });
  return res.data;
};

export const listCustomerOrders = async (customerId: string): Promise<Order[]> => {
  const res = await axiosInstance.get<Order[]>(`/admin/customers/${customerId}/orders`);
  return res.data;
};

export const listCustomerReviews = async (customerId: string): Promise<CustomerReview[]> => {
  const res = await axiosInstance.get<CustomerReview[]>(`/admin/customers/${customerId}/reviews`);
  return res.data;
};

export const listCustomerPayments = async (customerId: string): Promise<CustomerPayment[]> => {
  const res = await axiosInstance.get<CustomerPayment[]>(`/admin/customers/${customerId}/payments`);
  return res.data;
};

export const listCustomerWishlist = async (customerId: string): Promise<CustomerWishlist[]> => {
  const res = await axiosInstance.get<CustomerWishlist[]>(`/admin/customers/${customerId}/wishlist`);
  return res.data;
};

export const listCustomerLoginHistory = async (customerId: string): Promise<CustomerLoginHistory[]> => {
  const res = await axiosInstance.get<CustomerLoginHistory[]>(`/admin/customers/${customerId}/login-history`);
  return res.data;
};

export const listCustomerNotes = async (customerId: string): Promise<CustomerNote[]> => {
  const res = await axiosInstance.get<CustomerNote[]>(`/admin/customers/${customerId}/notes`);
  return res.data;
};

export const createCustomerNote = async (customerId: string, note: string): Promise<CustomerNote> => {
  const res = await axiosInstance.post<CustomerNote>(`/admin/customers/${customerId}/notes`, { note });
  return res.data;
};

export const deleteCustomerNote = async (customerId: string, noteId: string): Promise<{ message: string }> => {
  const res = await axiosInstance.delete<{ message: string }>(`/admin/customers/${customerId}/notes/${noteId}`);
  return res.data;
};

export const listSupportTickets = async (params: { status?: string; priority?: string } = {}): Promise<SupportTicket[]> => {
  const res = await axiosInstance.get<SupportTicket[]>("/admin/support-tickets", { params });
  return res.data;
};

export const updateSupportTicket = async (
  ticketId: string,
  payload: { status?: string; priority?: string; assigned_to_id?: string | null }
): Promise<SupportTicket> => {
  const res = await axiosInstance.patch<SupportTicket>(`/admin/support-tickets/${ticketId}`, payload);
  return res.data;
};

export const getCustomer = getCustomerDetails;

export const createNote = createCustomerNote;
export const deleteNote = deleteCustomerNote;

export const getSummary = getCustomerSummary;

export const customersService = {
  getCustomerSummary,
  getSummary,
  listCustomers,
  getCustomerDetails,
  getCustomer,
  listCustomerAddresses,
  listAllAddresses,
  listCustomerOrders,
  listCustomerReviews,
  listCustomerPayments,
  listCustomerWishlist,
  listCustomerLoginHistory,
  listCustomerNotes,
  createCustomerNote,
  deleteCustomerNote,
  createNote,
  deleteNote,
  listSupportTickets,
  updateSupportTicket,
};

