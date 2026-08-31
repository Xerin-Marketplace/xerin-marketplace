import axiosInstance from "../client";

export type NotificationItem = {
  id: string;
  event: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  action_url?: string | null;
  is_read: boolean;
  read_at?: string | null;
  expires_at?: string | null;
  created_at: string;
};

export type NotificationSummary = {
  total: number;
  unread: number;
  read: number;
};

export const notificationsApi = {
  list: async (params?: { unread_only?: boolean; limit?: number; offset?: number }) =>
    (
      await axiosInstance.get<NotificationItem[]>("/notifications", {
        params: {
          unread_only: params?.unread_only ?? false,
          limit: params?.limit ?? 50,
          offset: params?.offset ?? 0,
        },
      })
    ).data,

  summary: async () =>
    (await axiosInstance.get<NotificationSummary>("/notifications/summary")).data,

  markRead: async (id: string) =>
    (await axiosInstance.patch<NotificationItem>(`/notifications/${id}/read`)).data,

  markAllRead: async () =>
    (await axiosInstance.patch<NotificationSummary>("/notifications/read-all")).data,

  remove: async (id: string) => {
    await axiosInstance.delete(`/notifications/${id}`);
  },
};
