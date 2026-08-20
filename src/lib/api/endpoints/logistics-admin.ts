import axiosInstance from "../client";
import type { CompanyProfilePayload, LogisticsAccount, LogisticsCompanyProfile, LogisticsOnboardingStatus, LogisticsTeamMember, TeamMemberCreate, TeamMemberUpdate } from "@/types/api/logistics-admin";

const ROOT = "/logistics/me";
export const logisticsAdminApi = {
  account: async () => (await axiosInstance.get<LogisticsAccount>(`${ROOT}/account`)).data,
  onboarding: async () => (await axiosInstance.get<LogisticsOnboardingStatus>(`${ROOT}/onboarding`)).data,
  company: async () => (await axiosInstance.get<LogisticsCompanyProfile>(`${ROOT}/company`)).data,
  updateCompany: async (payload: CompanyProfilePayload) => (await axiosInstance.patch<LogisticsCompanyProfile>(`${ROOT}/company`, payload)).data,
  members: async () => (await axiosInstance.get<LogisticsTeamMember[]>(`${ROOT}/users`)).data,
  addMember: async (payload: TeamMemberCreate) => (await axiosInstance.post<LogisticsTeamMember>(`${ROOT}/users`, payload)).data,
  updateMember: async (userId: string, payload: TeamMemberUpdate) => (await axiosInstance.patch<LogisticsTeamMember>(`${ROOT}/users/${userId}`, payload)).data,
  removeMember: async (userId: string) => (await axiosInstance.delete(`${ROOT}/users/${userId}`)).data,
};
