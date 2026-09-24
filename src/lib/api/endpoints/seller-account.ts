import axiosInstance from "../client";

export type SellerUserProfile = {
  id: string; first_name: string; last_name: string; email: string; phone: string | null;
  is_verified: boolean; status: string | null; account_type: string; roles?: string[];
};
export type SellerSession = { id: string; created_at: string; expires_at: string };

export const sellerAccountApi = {
  getUser: async () => (await axiosInstance.get<SellerUserProfile>("/users/me")).data,
  updateUser: async (payload: Pick<SellerUserProfile, "first_name" | "last_name" | "phone">) =>
    (await axiosInstance.patch<SellerUserProfile>("/users/me", payload)).data,
  changePassword: async (current_password: string, new_password: string) =>
    (await axiosInstance.post<{ message: string }>("/auth/change-password", { current_password, new_password })).data,
  listSessions: async () => {
    const res = await axiosInstance.get<SellerSession[] | { sessions?: SellerSession[] }>("/auth/sessions");
    const raw = Array.isArray(res.data) ? res.data : res.data.sessions ?? [];
    // Normalize: backend may use alternate timestamp field names.
    return raw.map((s) => {
      const item = s as SellerSession & { started_at?: string; issued_at?: string };
      return {
        ...item,
        created_at: item.created_at ?? item.started_at ?? item.issued_at ?? "",
      };
    });
  },
  revokeSession: async (id: string) => (await axiosInstance.delete(`/auth/sessions/${id}`)).data,
  deleteAccount: async (payload: { current_password: string; confirmation: string }) =>
    (await axiosInstance.delete("/users/me", { data: payload })).data,
};
