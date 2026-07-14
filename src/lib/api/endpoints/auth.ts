import axiosInstance from "../client";
import { API_ENDPOINTS } from "../endpoints";
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

export const login = async (payload: LoginRequest): Promise<AuthTokenResponse> => {
  const res = await axiosInstance.post<AuthTokenResponse>(API_ENDPOINTS.auth.login, payload);
  return res.data;
};

export const registerBuyer = async (payload: RegisterBuyerRequest): Promise<AuthTokenResponse> => {
  const res = await axiosInstance.post<AuthTokenResponse>(API_ENDPOINTS.auth.register, payload);
  return res.data;
};

export const registerSeller = async (payload: RegisterSellerRequest): Promise<AuthTokenResponse> => {
  const res = await axiosInstance.post<AuthTokenResponse>(API_ENDPOINTS.auth.registerSeller, payload);
  return res.data;
};

export const logout = async (): Promise<ApiMessageResponse> => {
  const res = await axiosInstance.post<ApiMessageResponse>(API_ENDPOINTS.auth.logout);
  return res.data;
};

export const sendOtp = async (payload: SendOtpRequest): Promise<ApiMessageResponse> => {
  const res = await axiosInstance.post<ApiMessageResponse>(API_ENDPOINTS.auth.sendOtp, payload);
  return res.data;
};

export const verifyOtp = async (payload: VerifyOtpRequest): Promise<ApiMessageResponse> => {
  const res = await axiosInstance.post<ApiMessageResponse>(API_ENDPOINTS.auth.verifyOtp, payload);
  return res.data;
};

export const forgotPassword = async (payload: ForgotPasswordRequest): Promise<ApiMessageResponse> => {
  const res = await axiosInstance.post<ApiMessageResponse>(API_ENDPOINTS.auth.forgotPassword, payload);
  return res.data;
};

export const resetPassword = async (payload: ResetPasswordRequest): Promise<ApiMessageResponse> => {
  const res = await axiosInstance.post<ApiMessageResponse>(API_ENDPOINTS.auth.resetPassword, payload);
  return res.data;
};

export const authApi = {
  login,
  registerBuyer,
  registerSeller,
  logout,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
};

