import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type {
  AuthTokenResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterBuyerRequest,
  RegisterSellerRequest,
  ResetPasswordRequest,
  SendOtpRequest,
  VerifyOtpRequest,
} from "@/types/api/auth";
import type { ApiMessageResponse } from "@/types/api/common";

export const authApi = {
  login: (payload: LoginRequest) =>
    apiClient<AuthTokenResponse>(API_ENDPOINTS.auth.login, {
      method: "POST",
      body: payload,
    }),

  registerBuyer: (payload: RegisterBuyerRequest) =>
    apiClient<AuthTokenResponse>(API_ENDPOINTS.auth.register, {
      method: "POST",
      body: payload,
    }),

  registerSeller: (payload: RegisterSellerRequest) =>
    apiClient<AuthTokenResponse>(API_ENDPOINTS.auth.registerSeller, {
      method: "POST",
      body: payload,
    }),

  logout: (token?: string | null) =>
    apiClient<ApiMessageResponse>(API_ENDPOINTS.auth.logout, {
      method: "POST",
      token,
    }),

  refreshToken: (refreshToken: string) =>
    apiClient<AuthTokenResponse>(API_ENDPOINTS.auth.refreshToken, {
      method: "POST",
      body: { refresh_token: refreshToken },
    }),

  sendOtp: (payload: SendOtpRequest) =>
    apiClient<ApiMessageResponse>(API_ENDPOINTS.auth.sendOtp, {
      method: "POST",
      body: payload,
    }),

  verifyOtp: (payload: VerifyOtpRequest) =>
    apiClient<ApiMessageResponse>(API_ENDPOINTS.auth.verifyOtp, {
      method: "POST",
      body: payload,
    }),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    apiClient<ApiMessageResponse>(API_ENDPOINTS.auth.forgotPassword, {
      method: "POST",
      body: payload,
    }),

  resetPassword: (payload: ResetPasswordRequest) =>
    apiClient<ApiMessageResponse>(API_ENDPOINTS.auth.resetPassword, {
      method: "POST",
      body: payload,
    }),
};
