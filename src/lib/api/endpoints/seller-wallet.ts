import axiosInstance from "../client";
import type {
  PaginatedWalletTransactionResponse,
  SellerEarningsSummary,
  SellerWallet,
  SellerWalletTransactionParams,
} from "@/types/api/seller-wallet";

export const getSellerEarningsSummary =
  async (): Promise<SellerEarningsSummary> => {
    const res = await axiosInstance.get<SellerEarningsSummary>(
      "/commissions/seller/me/summary",
    );
    return res.data;
  };

export const getSellerWallet = async (): Promise<SellerWallet> => {
  const res = await axiosInstance.get<SellerWallet>("/wallet/me");
  return res.data;
};

export const getSellerWalletTransactions = async (
  params: SellerWalletTransactionParams = {},
): Promise<PaginatedWalletTransactionResponse> => {
  const res = await axiosInstance.get<PaginatedWalletTransactionResponse>(
    "/wallet/me/transactions",
    { params },
  );
  return res.data;
};

export const sellerWalletApi = {
  earningsSummary: getSellerEarningsSummary,
  wallet: getSellerWallet,
  transactions: getSellerWalletTransactions,
};
