import axiosInstance from "../client";
import { API_ENDPOINTS } from "../endpoints";

export type AccountSession = {
  id: string;
  created_at: string;
  expires_at: string;
};

export const accountApi = {
  listSessions: async (): Promise<AccountSession[]> => {
    const res = await axiosInstance.get<AccountSession[] | { sessions?: AccountSession[] }>(
      API_ENDPOINTS.auth.sessions,
    );
    const raw = Array.isArray(res.data) ? res.data : res.data.sessions ?? [];
    return raw.map((s) => {
      const item = s as AccountSession & { started_at?: string; issued_at?: string };
      return {
        ...item,
        created_at: item.created_at ?? item.started_at ?? item.issued_at ?? "",
      };
    });
  },

  revokeSession: async (id: string) =>
    (await axiosInstance.delete(`${API_ENDPOINTS.auth.sessions}/${id}`)).data,

  revokeOtherSessions: async () =>
    (await axiosInstance.post(API_ENDPOINTS.auth.revokeOtherSessions, {})).data,

  deleteAccount: async (payload: { current_password: string; confirmation: string }) =>
    (await axiosInstance.delete(API_ENDPOINTS.users.me, { data: payload })).data,
};
