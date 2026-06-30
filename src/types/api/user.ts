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
  is_active?: boolean;
  is_verified?: boolean;
};

export type UpdateUserRequest = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_photo?: string;
};

export type Address = TimestampFields & {
  id: ID;
  user_id?: ID;
  full_name?: string;
  phone?: string;
  country?: string;
  region?: string;
  city?: string;
  district?: string;
  street?: string;
  address_line_1?: string;
  address_line_2?: string | null;
  postal_code?: string | null;
  is_default?: boolean;
};

export type AddressRequest = Omit<Address, "id" | "user_id" | "created_at" | "updated_at">;
