import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type { ApiMessageResponse, ID, PaginatedResults } from "@/types/api/common";
import type {
  PayoutAccount,
  PayoutAccountRequest,
  Seller,
  SellerBusinessCategory,
  SellerKycDocument,
  SellerKycStatus,
  UpdateSellerRequest,
  UploadSellerKycDocumentRequest,
} from "@/types/api/seller";

export const sellersApi = {
  getBusinessCategories: () =>
    apiClient<SellerBusinessCategory[]>(API_ENDPOINTS.sellers.businessCategories, {
      method: "GET",
    }),

  register: (payload: Omit<Seller, "id" | "status">) =>
    apiClient<Seller>(API_ENDPOINTS.sellers.register, {
      method: "POST",
      body: payload,
    }),

  getMe: (token?: string | null) =>
    apiClient<Seller>(API_ENDPOINTS.sellers.me, {
      method: "GET",
      token,
    }),

  updateMe: (payload: UpdateSellerRequest, token?: string | null) =>
    apiClient<Seller>(API_ENDPOINTS.sellers.me, {
      method: "PATCH",
      token,
      body: payload,
    }),

  getKycDocuments: async (token?: string | null) => {
    const response = await apiClient<PaginatedResults<SellerKycDocument> | SellerKycDocument[]>(
      API_ENDPOINTS.sellers.kycDocuments,
      {
        method: "GET",
        token,
      }
    );
    return Array.isArray(response) ? response : response.results ?? [];
  },

  getKycStatus: (token?: string | null) =>
    apiClient<SellerKycStatus>(API_ENDPOINTS.sellers.kycStatus, {
      method: "GET",
      token,
    }),

  uploadKycDocument: (
    payload: UploadSellerKycDocumentRequest,
    token?: string | null
  ) => {
    const formData = new FormData();
    formData.append("document_type", payload.document_type);
    formData.append("file", payload.file);

    return apiClient<SellerKycDocument>(API_ENDPOINTS.sellers.kycDocuments, {
      method: "POST",
      token,
      body: formData,
    });
  },

  getPayoutAccounts: async (token?: string | null) => {
    const response = await apiClient<PaginatedResults<PayoutAccount> | PayoutAccount[]>(
      API_ENDPOINTS.sellers.payoutAccounts,
      {
        method: "GET",
        token,
      }
    );
    return Array.isArray(response) ? response : response.results ?? [];
  },

  createPayoutAccount: (payload: PayoutAccountRequest, token?: string | null) =>
    apiClient<PayoutAccount>(API_ENDPOINTS.sellers.payoutAccounts, {
      method: "POST",
      token,
      body: payload,
    }),

  deletePayoutAccount: (id: ID, token?: string | null) =>
    apiClient<ApiMessageResponse>(API_ENDPOINTS.sellers.payoutAccountById(id), {
      method: "DELETE",
      token,
    }),
};
