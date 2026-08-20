import axiosInstance from "../client";
import type {
  LogisticsCompanyAccount,
  LogisticsDashboard,
  LogisticsMember,
  LogisticsPickupJob,
  LogisticsShipment,
  Paginated,
  PickupJobStatus,
  ShipmentStatus,
} from "@/types/api/logistics";

export const LOGISTICS_ENDPOINTS = {
  account: "/logistics/me/account",
  company: "/logistics/me/company",
  dashboard: "/logistics/me/dashboard",
  users: "/logistics/me/users",
  zones: "/logistics/me/zones",
  services: "/logistics/me/services",
  rates: "/logistics/me/rates",
  pricing: "/logistics/me/pricing",
  shipments: "/logistics/me/shipments",
  pickupJobs: "/logistics/me/pickup-jobs",
  integration: "/logistics/me/integration",
  webhookEvents: "/logistics/me/webhook-events",
  wallet: "/logistics/wallet/me",
  walletTransactions: "/logistics/wallet/me/transactions",
  payoutAccounts: "/logistics/wallet/me/payout-accounts",
  payouts: "/logistics/wallet/me/payouts",
} as const;

const getAccount = async (): Promise<LogisticsCompanyAccount> =>
  (await axiosInstance.get<LogisticsCompanyAccount>(LOGISTICS_ENDPOINTS.account)).data;

const getDashboard = async (): Promise<LogisticsDashboard> =>
  (await axiosInstance.get<LogisticsDashboard>(LOGISTICS_ENDPOINTS.dashboard)).data;

type PageParams<T> = { page?: number; page_size?: number; status?: T; search?: string };

const getShipments = async (params: PageParams<ShipmentStatus> = {}): Promise<Paginated<LogisticsShipment>> =>
  (await axiosInstance.get<Paginated<LogisticsShipment>>(LOGISTICS_ENDPOINTS.shipments, { params })).data;

const updateShipment = async (shipmentId: string, data: {
  status: ShipmentStatus; location?: string; notes?: string; tracking_number?: string; carrier_name?: string;
}): Promise<LogisticsShipment> =>
  (await axiosInstance.post<LogisticsShipment>(`${LOGISTICS_ENDPOINTS.shipments}/${shipmentId}/events`, data)).data;

const createPickupJob = async (shipmentId: string, data: {
  assigned_membership_id?: string; scheduled_for?: string; dispatcher_notes?: string;
} = {}): Promise<LogisticsPickupJob> =>
  (await axiosInstance.post<LogisticsPickupJob>(`${LOGISTICS_ENDPOINTS.shipments}/${shipmentId}/pickup-job`, data)).data;

const getPickupJobs = async (params: PageParams<PickupJobStatus> & { assigned_to_me?: boolean } = {}): Promise<Paginated<LogisticsPickupJob>> =>
  (await axiosInstance.get<Paginated<LogisticsPickupJob>>(LOGISTICS_ENDPOINTS.pickupJobs, { params })).data;

const assignPickupJob = async (jobId: string, data: {
  assigned_membership_id: string; scheduled_for?: string; dispatcher_notes?: string;
}): Promise<LogisticsPickupJob> =>
  (await axiosInstance.patch<LogisticsPickupJob>(`${LOGISTICS_ENDPOINTS.pickupJobs}/${jobId}/assign`, data)).data;

const updatePickupJobStatus = async (jobId: string, data: {
  status: PickupJobStatus; notes?: string; failure_reason?: string;
}): Promise<LogisticsPickupJob> =>
  (await axiosInstance.post<LogisticsPickupJob>(`${LOGISTICS_ENDPOINTS.pickupJobs}/${jobId}/status`, data)).data;

const getMembers = async (): Promise<LogisticsMember[]> =>
  (await axiosInstance.get<LogisticsMember[]>(LOGISTICS_ENDPOINTS.users)).data;

export const logisticsApi = {
  getAccount, getDashboard, getShipments, updateShipment, createPickupJob,
  getPickupJobs, assignPickupJob, updatePickupJobStatus, getMembers,
};
