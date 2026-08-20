import axiosInstance from "../client";
import type { SellerPickupLocation, SellerPickupLocationList, SellerPickupLocationPayload } from "@/types/api/seller-pickup";

const ROOT = "/seller/pickup-locations";
export const sellerPickupApi = {
  list: async () => (await axiosInstance.get<SellerPickupLocationList>(ROOT, { params: { page: 1, page_size: 100 } })).data,
  create: async (payload: SellerPickupLocationPayload) => (await axiosInstance.post<SellerPickupLocation>(ROOT, payload)).data,
  setDefault: async (id: string) => (await axiosInstance.post<SellerPickupLocation>(`${ROOT}/${id}/default`)).data,
  remove: async (id: string) => { await axiosInstance.delete(`${ROOT}/${id}`); },
};
