import axiosInstance from "../client";

export type MarketingTemplate = {
  id: string; key: string; name: string; purpose: string | null;
  channel: "email" | "sms"; language: string; subject: string | null;
  body: string; variables: string[]; is_approved: boolean; version: number;
  created_at: string | null; updated_at: string | null;
};

export type MarketingCampaign = {
  id: string; name: string; description: string | null;
  channel: "email" | "sms"; status: string; segment_key: string;
  subject: string | null; body: string; template_id: string | null;
  scheduled_at: string | null; approved_at: string | null;
  sent_at: string | null; stats: Record<string, number>;
  created_at: string | null;
};

export type MarketingSegment = { key: string; label: string; estimated_recipients: number };

export type MarketingEvent = {
  id: string; name: string; rule_type: string; jurisdiction: string;
  category: string | null; is_estimated: boolean; lead_days: number;
  suggested_email: string | null; suggested_sms: string | null;
  is_enabled: boolean; date_this_year: string | null;
};

export type MarketingOverview = {
  contacts: { total_customers: number; email_eligible: number; sms_eligible: number; opted_out: number };
  campaigns: Record<string, number>;
  delivery: Record<string, Record<string, number>>;
  upcoming_events: { name: string; date: string | null; estimated: boolean }[];
};

export type MonthlyAutomation = {
  is_enabled: boolean; auto_send: boolean; day_of_month: number;
  send_time: string; timezone: string; channels: string[];
  segment_key: string; last_run_at: string | null; next_run_at: string | null;
  last_campaign_id: string | null;
};

export type MarketingMessage = {
  id: string; recipient: string; channel: string; status: string;
  error: string | null; attempts: number; sent_at: string | null; created_at: string | null;
};

export const marketingApi = {
  overview: async () =>
    (await axiosInstance.get<MarketingOverview>("/admin/marketing/overview")).data,
  segments: async (channel: "email" | "sms" = "email") =>
    (await axiosInstance.get<MarketingSegment[]>("/admin/marketing/segments", { params: { channel } })).data,

  templates: async (channel?: string) =>
    (await axiosInstance.get<MarketingTemplate[]>("/admin/marketing/templates", { params: channel ? { channel } : {} })).data,
  createTemplate: async (data: Partial<MarketingTemplate>) =>
    (await axiosInstance.post<MarketingTemplate>("/admin/marketing/templates", data)).data,
  approveTemplate: async (id: string) =>
    (await axiosInstance.post<{ approved: boolean }>(`/admin/marketing/templates/${id}/approve`)).data,
  deleteTemplate: async (id: string) =>
    (await axiosInstance.delete(`/admin/marketing/templates/${id}`)).data,

  campaigns: async (status?: string) =>
    (await axiosInstance.get<MarketingCampaign[]>("/admin/marketing/campaigns", { params: status ? { status } : {} })).data,
  createCampaign: async (data: Partial<MarketingCampaign>) =>
    (await axiosInstance.post<MarketingCampaign>("/admin/marketing/campaigns", data)).data,
  approveCampaign: async (id: string) =>
    (await axiosInstance.post<MarketingCampaign>(`/admin/marketing/campaigns/${id}/approve`)).data,
  sendCampaign: async (id: string) =>
    (await axiosInstance.post<{ queued: number; recipients: number }>(`/admin/marketing/campaigns/${id}/send`)).data,
  pauseCampaign: async (id: string) =>
    (await axiosInstance.post<MarketingCampaign>(`/admin/marketing/campaigns/${id}/pause`)).data,
  cancelCampaign: async (id: string) =>
    (await axiosInstance.post<MarketingCampaign>(`/admin/marketing/campaigns/${id}/cancel`)).data,
  duplicateCampaign: async (id: string) =>
    (await axiosInstance.post<MarketingCampaign>(`/admin/marketing/campaigns/${id}/duplicate`)).data,
  campaignMessages: async (id: string, params?: { status?: string; page?: number }) =>
    (await axiosInstance.get<{ results: MarketingMessage[]; total: number }>(
      `/admin/marketing/campaigns/${id}/messages`, { params })).data,

  events: async (year?: number) =>
    (await axiosInstance.get<MarketingEvent[]>("/admin/marketing/events", { params: year ? { year } : {} })).data,
  seedEvents: async () =>
    (await axiosInstance.post<{ created: number }>("/admin/marketing/events/seed")).data,

  monthlyAutomation: async () =>
    (await axiosInstance.get<MonthlyAutomation>("/admin/marketing/automation/monthly")).data,
  updateMonthlyAutomation: async (data: Partial<MonthlyAutomation>) =>
    (await axiosInstance.patch<MonthlyAutomation>("/admin/marketing/automation/monthly", data)).data,

  suppressions: async () =>
    (await axiosInstance.get<{ user_id: string; email_marketing: boolean; sms_marketing: boolean }[]>(
      "/admin/marketing/suppressions")).data,
};
