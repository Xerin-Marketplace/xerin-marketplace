import axiosInstance from "../client";
import type { CommissionRule, EscrowHold, FinanceDashboard, FinancePayout, Page, Reconciliation, SellerWallet } from "@/types/api/finance-flow";
export const financeFlowApi = {
  dashboard: async () => (await axiosInstance.get<FinanceDashboard>("/admin/payments/dashboard")).data,
  sellerWallets: async () => (await axiosInstance.get<SellerWallet[]>("/wallet/admin/wallets")).data,
  escrow: async () => (await axiosInstance.get<Page<EscrowHold>>("/admin/finance/escrow-holds", { params: { page: 1, page_size: 8 } })).data,
  commissions: async () => (await axiosInstance.get<Page<CommissionRule>>("/admin/marketplace-settings/commission-rules", { params: { page: 1, page_size: 8 } })).data,
  payouts: async () => (await axiosInstance.get<Page<FinancePayout>>("/admin/payouts", { params: { page: 1, page_size: 8 } })).data,
  reconciliation: async () => (await axiosInstance.get<Page<Reconciliation>>("/admin/reconciliation", { params: { page: 1, page_size: 8 } })).data,
  updatePayout: async (id: string, data: { status: string; provider_reference?: string; note?: string }) => (await axiosInstance.patch(`/wallet/admin/payouts/${id}`, data)).data,
  updateReconciliation: async (id: string, data: { status: string; reconciliation_note?: string }) => (await axiosInstance.patch(`/admin/reconciliation/${id}`, data)).data,
};
