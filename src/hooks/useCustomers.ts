import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerSummary,
  listCustomers,
  getCustomerDetails,
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
  listSupportTickets,
  updateSupportTicket,
} from "@/lib/api/endpoints/customers";
import type { ListCustomersParams } from "@/lib/api/endpoints/customers";

export const useCustomerSummary = () => {
  return useQuery({
    queryKey: ["customer-summary"],
    queryFn: getCustomerSummary,
  });
};

export const useCustomersList = (params?: ListCustomersParams) => {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => listCustomers(params),
  });
};

export const useCustomerDetails = (customerId: string) => {
  return useQuery({
    queryKey: ["customer-details", customerId],
    queryFn: () => getCustomerDetails(customerId),
    enabled: Boolean(customerId),
  });
};

export const useCustomerAddresses = (customerId: string) => {
  return useQuery({
    queryKey: ["customer-addresses", customerId],
    queryFn: () => listCustomerAddresses(customerId),
    enabled: Boolean(customerId),
  });
};

export const useAllAddresses = (params?: { search?: string }) => {
  return useQuery({
    queryKey: ["all-addresses", params],
    queryFn: () => listAllAddresses(params),
  });
};

export const useCustomerOrdersList = (customerId: string) => {
  return useQuery({
    queryKey: ["customer-orders", customerId],
    queryFn: () => listCustomerOrders(customerId),
    enabled: Boolean(customerId),
  });
};

export const useCustomerReviewsList = (customerId: string) => {
  return useQuery({
    queryKey: ["customer-reviews", customerId],
    queryFn: () => listCustomerReviews(customerId),
    enabled: Boolean(customerId),
  });
};

export const useCustomerPaymentsList = (customerId: string) => {
  return useQuery({
    queryKey: ["customer-payments", customerId],
    queryFn: () => listCustomerPayments(customerId),
    enabled: Boolean(customerId),
  });
};

export const useCustomerWishlistList = (customerId: string) => {
  return useQuery({
    queryKey: ["customer-wishlist", customerId],
    queryFn: () => listCustomerWishlist(customerId),
    enabled: Boolean(customerId),
  });
};

export const useCustomerLoginHistoryList = (customerId: string) => {
  return useQuery({
    queryKey: ["customer-login-history", customerId],
    queryFn: () => listCustomerLoginHistory(customerId),
    enabled: Boolean(customerId),
  });
};

export const useCustomerNotesList = (customerId: string) => {
  return useQuery({
    queryKey: ["customer-notes", customerId],
    queryFn: () => listCustomerNotes(customerId),
    enabled: Boolean(customerId),
  });
};

export const useCreateCustomerNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, note }: { customerId: string; note: string }) =>
      createCustomerNote(customerId, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customer-notes", variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ["customer-details", variables.customerId] });
    },
  });
};

export const useDeleteCustomerNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, noteId }: { customerId: string; noteId: string }) =>
      deleteCustomerNote(customerId, noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customer-notes", variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ["customer-details", variables.customerId] });
    },
  });
};

export const useSupportTicketsList = (params?: { status?: string; priority?: string }) => {
  return useQuery({
    queryKey: ["support-tickets", params],
    queryFn: () => listSupportTickets(params),
  });
};

export const useUpdateSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      payload,
    }: {
      ticketId: string;
      payload: { status?: string; priority?: string; assigned_to_id?: string | null };
    }) => updateSupportTicket(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });
};
