import axiosInstance from "../client";
import type { IntegrationConfig, IntegrationPayload, Paginated, Payout, PayoutAccount, PayoutAccountCreate, WalletTransaction, LogisticsWallet, WebhookEvent } from "@/types/api/logistics-business";

const E = {
  wallet: "/logistics/wallet/me", transactions: "/logistics/wallet/me/transactions",
  accounts: "/logistics/wallet/me/payout-accounts", payouts: "/logistics/wallet/me/payouts",
  integration: "/logistics/me/integration", events: "/logistics/me/webhook-events",
};

export const logisticsBusinessApi = {
  wallet: async () => (await axiosInstance.get<LogisticsWallet>(E.wallet)).data,
  transactions: async (page = 1) => (await axiosInstance.get<Paginated<WalletTransaction>>(E.transactions, { params: { page, page_size: 10 } })).data,
  accounts: async () => (await axiosInstance.get<PayoutAccount[]>(E.accounts)).data,
  createAccount: async (data: PayoutAccountCreate) => (await axiosInstance.post<PayoutAccount>(E.accounts, data)).data,
  updateAccount: async (id: string, data: Partial<Omit<PayoutAccountCreate, "account_type" | "account_number">> & { is_active?: boolean }) => (await axiosInstance.patch<PayoutAccount>(`${E.accounts}/${id}`, data)).data,
  payouts: async (page = 1) => (await axiosInstance.get<Paginated<Payout>>(E.payouts, { params: { page, page_size: 10 } })).data,
  requestPayout: async (data: { payout_account_id: string; amount: number; note?: string }) => (await axiosInstance.post<Payout>(E.payouts, data)).data,
  cancelPayout: async (id: string) => (await axiosInstance.post<Payout>(`${E.payouts}/${id}/cancel`)).data,
  integration: async () => (await axiosInstance.get<IntegrationConfig>(E.integration)).data,
  saveIntegration: async (data: IntegrationPayload) => (await axiosInstance.put<IntegrationConfig>(E.integration, data)).data,
  webhookEvents: async (params: { page?: number; direction?: string; processed?: boolean } = {}) => (await axiosInstance.get<Paginated<WebhookEvent>>(E.events, { params: { ...params, page_size: 12 } })).data,
};
