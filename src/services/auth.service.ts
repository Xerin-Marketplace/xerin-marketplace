import { AuthSession, AuthUser } from "@/redux/features/auth-slice";
import { apiClient, AUTH_STORAGE_KEY } from "./api/client";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterBuyerRequest = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
};

export type VerifyOtpRequest = {
  phone: string;
  otp_code: string;
  purpose: string;
};

export const getStoredAuthSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null;

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawSession ? (JSON.parse(rawSession) as AuthSession) : null;
  } catch {
    return null;
  }
};

export const saveAuthSession = (session: AuthSession) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const authService = {
  login: (data: LoginRequest) => {
    return apiClient.post<AuthSession>("/auth/login", data, { auth: false });
  },

  registerBuyer: (data: RegisterBuyerRequest) => {
    return apiClient.post<AuthUser>("/auth/register", data, { auth: false });
  },

  me: () => {
    return apiClient.get<AuthUser>("/users/me");
  },

  refreshToken: (refreshToken: string) => {
    return apiClient.post<Partial<AuthSession>>(
      "/auth/refresh-token",
      { refresh_token: refreshToken },
      { auth: false }
    );
  },

  verifyOtp: (data: VerifyOtpRequest) => {
    return apiClient.post("/auth/verify-otp", data, { auth: false });
  },

  sendOtp: (phone: string, purpose = "registration") => {
    return apiClient.post("/auth/send-otp", { phone, purpose }, { auth: false });
  },

  logout: () => {
    return apiClient.post("/auth/logout");
  },
};
