import axiosInstance from "../client";
import type { ActivityLog, OperationsOverview, Page, SupportTicketSummary, SystemAlert } from "@/types/api/operations-command";
export const operationsCommandApi = {
  overview: async () => (await axiosInstance.get<OperationsOverview>("/admin/dashboard/operations-overview", { params: { limit: 100 } })).data,
  tickets: async () => (await axiosInstance.get<Page<SupportTicketSummary>>("/admin/support-tickets", { params: { page: 1, page_size: 8 } })).data,
  alerts: async () => (await axiosInstance.get<SystemAlert[]>("/admin/dashboard/alerts", { params: { resolved: false, limit: 25 } })).data,
  activity: async () => (await axiosInstance.get<ActivityLog[]>("/admin/dashboard/activity-logs", { params: { limit: 20 } })).data,
  resolveAlert: async (id: string) => (await axiosInstance.patch(`/admin/dashboard/alerts/${id}/resolve`)).data,
  retryNotification: async (id: string) => (await axiosInstance.post(`/admin/notifications/deliveries/${id}/retry`)).data,
  processNotifications: async () => (await axiosInstance.post("/admin/notifications/deliveries/process", null, { params: { limit: 100 } })).data,
  resolveSecurityEvent: async (id: string, note: string) => (await axiosInstance.patch(`/audit-logs/security/events/${id}/resolve`, { note })).data,
};
