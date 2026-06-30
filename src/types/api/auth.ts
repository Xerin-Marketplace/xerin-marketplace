import type { User } from "./user";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterBuyerRequest = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
};

export type RegisterSellerRequest = RegisterBuyerRequest & {
  business_name: string;
  business_category?: string;
  contact_email?: string;
  contact_phone?: string;
  agreement_accepted: boolean;
};

export type AuthTokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: User;
};

export type SendOtpRequest = {
  email?: string;
  phone?: string;
  purpose?: "registration" | "login" | "password_reset" | string;
};

export type VerifyOtpRequest = {
  email?: string;
  phone?: string;
  otp: string;
  purpose?: "registration" | "login" | "password_reset" | string;
};

export type ForgotPasswordRequest = {
  email?: string;
  phone?: string;
};

export type ResetPasswordRequest = {
  token?: string;
  otp?: string;
  email?: string;
  phone?: string;
  new_password: string;
};
