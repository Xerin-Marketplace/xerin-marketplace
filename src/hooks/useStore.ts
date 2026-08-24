import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { storeApi } from "@/lib/api/endpoints/store";
import type { CreateStorePayload, UpdateStorePayload } from "@/types/api/store";

const MY_STORES_QUERY_KEY = ["stores", "mine"] as const;

export const useMyStores = () =>
  useQuery({
    queryKey: MY_STORES_QUERY_KEY,
    queryFn: () => storeApi.listMyStores(),
  });

export const useMyStoreById = (storeId?: string | null) =>
  useQuery({
    queryKey: ["stores", "mine", storeId],
    queryFn: () => storeApi.getMyStoreById(storeId as string),
    enabled: Boolean(storeId),
  });

export const useCreateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStorePayload) => storeApi.createStore(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MY_STORES_QUERY_KEY }),
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, payload }: { storeId: string; payload: UpdateStorePayload }) =>
      storeApi.updateMyStoreById(storeId, payload),
    onSuccess: (store) => {
      queryClient.invalidateQueries({ queryKey: MY_STORES_QUERY_KEY });
      queryClient.setQueryData(["stores", "mine", store.id], store);
    },
  });
};

export const useUploadStoreLogoById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, file }: { storeId: string; file: File }) =>
      storeApi.uploadStoreLogoById(storeId, file),
    onSuccess: (store) => {
      queryClient.invalidateQueries({ queryKey: MY_STORES_QUERY_KEY });
      queryClient.setQueryData(["stores", "mine", store.id], store);
    },
  });
};

export const useUploadStoreBannerById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, file }: { storeId: string; file: File }) =>
      storeApi.uploadStoreBannerById(storeId, file),
    onSuccess: (store) => {
      queryClient.invalidateQueries({ queryKey: MY_STORES_QUERY_KEY });
      queryClient.setQueryData(["stores", "mine", store.id], store);
    },
  });
};

// Legacy hooks remain available while older seller pages migrate away from /stores/me.
export const useMyStore = () =>
  useQuery({ queryKey: ["store", "me"], queryFn: () => storeApi.getMyStore() });

export const useUpdateMyStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStorePayload) => storeApi.updateMyStore(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["store", "me"] }),
  });
};

export const useUploadStoreLogo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => storeApi.uploadStoreLogo(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["store", "me"] }),
  });
};

export const useUploadStoreBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => storeApi.uploadStoreBanner(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["store", "me"] }),
  });
};
