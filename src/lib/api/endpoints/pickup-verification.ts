import axiosInstance from "../client";
import type { CustomerPickupProof, PaginatedPickupProofs, PickupProofProblemReason } from "@/types/api/pickup-verification";

export const pickupVerificationApi = {
  list: async (
    params: { page?: number; page_size?: number; status?: string } = {},
    signal?: AbortSignal,
  ) => (await axiosInstance.get<PaginatedPickupProofs>("/orders/pickup-proofs", { params, signal })).data,
  get: async (proofId: string, signal?: AbortSignal) =>
    (await axiosInstance.get<CustomerPickupProof>(`/orders/pickup-proofs/${proofId}`, { signal })).data,
  approve: async (proofId: string) =>
    (await axiosInstance.post<CustomerPickupProof>(`/orders/pickup-proofs/${proofId}/approve`)).data,
  reportProblem: async (
    proofId: string,
    payload: { reason: PickupProofProblemReason; notes?: string },
  ) => (await axiosInstance.post<CustomerPickupProof>(`/orders/pickup-proofs/${proofId}/report-problem`, payload)).data,
};
