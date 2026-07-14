import axiosInstance from "../client";
import { API_ENDPOINTS } from "../endpoints";
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

export const getBusinessCategories = async (): Promise<SellerBusinessCategory[]> => {
  const res = await axiosInstance.get<SellerBusinessCategory[]>(API_ENDPOINTS.sellers.businessCategories);
  return res.data;
};

export const registerSeller = async (payload: Omit<Seller, "id" | "status">): Promise<Seller> => {
  const res = await axiosInstance.post<Seller>(API_ENDPOINTS.sellers.register, payload);
  return res.data;
};

export const getSellerMe = async (token?: string | null): Promise<Seller> => {
  const res = await axiosInstance.get<Seller>(API_ENDPOINTS.sellers.me);
  return res.data;
};

export const updateSellerMe = async (
  payload: UpdateSellerRequest,
  token?: string | null
): Promise<Seller> => {
  const res = await axiosInstance.patch<Seller>(API_ENDPOINTS.sellers.me, payload);
  return res.data;
};

export const getKycDocuments = async (token?: string | null): Promise<SellerKycDocument[]> => {
  const res = await axiosInstance.get<PaginatedResults<SellerKycDocument> | SellerKycDocument[]>(
    API_ENDPOINTS.sellers.kycDocuments
  );
  return Array.isArray(res.data) ? res.data : res.data.results ?? [];
};

export const getKycStatus = async (token?: string | null): Promise<SellerKycStatus> => {
  const res = await axiosInstance.get<SellerKycStatus>(API_ENDPOINTS.sellers.kycStatus);
  return res.data;
};

export const uploadKycDocument = async (
  payload: UploadSellerKycDocumentRequest,
  token?: string | null
): Promise<SellerKycDocument> => {
  const formData = new FormData();
  formData.append("document_type", payload.document_type);
  formData.append("file", payload.file);

  const res = await axiosInstance.post<SellerKycDocument>(API_ENDPOINTS.sellers.kycDocuments, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getPayoutAccounts = async (token?: string | null): Promise<PayoutAccount[]> => {
  const res = await axiosInstance.get<PaginatedResults<PayoutAccount> | PayoutAccount[]>(
    API_ENDPOINTS.sellers.payoutAccounts
  );
  return Array.isArray(res.data) ? res.data : res.data.results ?? [];
};

export const createPayoutAccount = async (
  payload: PayoutAccountRequest,
  token?: string | null
): Promise<PayoutAccount> => {
  const res = await axiosInstance.post<PayoutAccount>(API_ENDPOINTS.sellers.payoutAccounts, payload);
  return res.data;
};

export const deletePayoutAccount = async (id: ID, token?: string | null): Promise<ApiMessageResponse> => {
  const res = await axiosInstance.delete<ApiMessageResponse>(API_ENDPOINTS.sellers.payoutAccountById(id));
  return res.data;
};

export const sellersApi = {
  getBusinessCategories,
  register: registerSeller,
  getMe: getSellerMe,
  updateMe: updateSellerMe,
  getKycDocuments,
  getKycStatus,
  uploadKycDocument,
  getPayoutAccounts,
  createPayoutAccount,
  deletePayoutAccount,
};
