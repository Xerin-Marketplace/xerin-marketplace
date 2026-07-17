import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi, ordersApi, paymentsApi } from "@/lib/api/endpoints/commerce";

export const useBackendCart = (enabled = true) =>
  useQuery({ queryKey: ["cart"], queryFn: ({ signal }) => cartApi.get(signal), enabled });

export const useMyOrders = (params: { page?: number; page_size?: number } = {}) =>
  useQuery({ queryKey: ["orders", "mine", params], queryFn: ({ signal }) => ordersApi.mine(params, signal) });

export const useOrder = (id: string) =>
  useQuery({ queryKey: ["orders", id], queryFn: ({ signal }) => ordersApi.get(id, signal), enabled: Boolean(id) });

export const useMyPayments = () =>
  useQuery({ queryKey: ["payments", "mine"], queryFn: ({ signal }) => paymentsApi.mine(signal) });

export const useAddCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartApi.addItem,
    onSuccess: (cart) => queryClient.setQueryData(["cart"], cart),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders", "mine"] });
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
