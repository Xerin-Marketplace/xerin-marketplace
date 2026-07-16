import type { ID, TimestampFields } from "./common";

export type UserRole = "buyer" | "seller" | "admin" | "super_admin" | "support" | string;

export type User = TimestampFields & {
  id: ID;
  email: string;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  profile_photo?: string | null;
  role?: UserRole;
  status?: string;
  account_type?: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_seller?: boolean;
  seller_status?: string | null;
};

export type UpdateUserRequest = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
};

export type Address = TimestampFields & {
  id: ID;
  country: string;
  region: string;
  city: string;
  street: string;
  postal_code?: string | null;
  is_default?: boolean;
};

export type AddressRequest = {
  country: string;
  region: string;
  city: string;
  street: string;
  postal_code?: string | null;
  is_default?: boolean;
};

export type PaginatedAddressResponse = {
  total: number;
  page: number;
  page_size: number;
  results: Address[];
};
