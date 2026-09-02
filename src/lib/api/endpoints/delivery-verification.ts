import axiosInstance from "../client";
import type { DeliveryDisputeReason, DeliveryProof, DeliveryProofStart } from "@/types/api/delivery-verification";

const ROOT = "/delivery-verification";

export const deliveryVerificationApi = {
  start: async (shipmentId: string, data: FormData) =>
    (await axiosInstance.post<DeliveryProofStart>(`${ROOT}/logistics/shipments/${shipmentId}/start`, data)).data,
  verify: async (proofId: string, otpCode: string) =>
    (await axiosInstance.post<DeliveryProof>(`${ROOT}/logistics/proofs/${proofId}/verify`, { otp_code: otpCode })).data,
  resendOtp: async (proofId: string) =>
    (await axiosInstance.post<DeliveryProofStart>(`${ROOT}/logistics/proofs/${proofId}/resend-otp`)).data,
  mine: async (signal?: AbortSignal) =>
    (await axiosInstance.get<DeliveryProof[]>(`${ROOT}/customer/my`, { signal })).data,
  dispute: async (proofId: string, payload: { reason: DeliveryDisputeReason; notes?: string }) =>
    (await axiosInstance.post<DeliveryProof>(`${ROOT}/customer/proofs/${proofId}/dispute`, payload)).data,
};
