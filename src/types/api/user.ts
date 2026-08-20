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
  roles?: string[];
  permissions?: string[];
};

export type UpdateUserRequest = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
};

export type Address = TimestampFields & {
  id: ID;
  label?: string | null;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  country: string;
  region: string;
  district?: string | null;
  ward?: string | null;
  city: string;
  street: string;
  landmark?: string | null;
  postal_code?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  is_default?: boolean;
  is_active?: boolean;
  is_verified?: boolean;
  delivery_ready?: boolean;
  formatted_address?: string | null;
  place_id?: string | null;
  location_provider?: string | null;
  location_confirmed_at?: string | null;
  delivery_instructions?: string | null;
};

export type AddressRequest = {
  label?: string | null;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  country: string;
  region: string;
  district?: string | null;
  ward?: string | null;
  city: string;
  street: string;
  landmark?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
  formatted_address?: string | null;
  place_id?: string | null;
  delivery_instructions?: string | null;
  is_active?: boolean;
};

export type MapAutocompleteSuggestion = {
  place_id: string;
  description: string;
  main_text?: string | null;
  secondary_text?: string | null;
};

export type MapResolvedLocation = {
  provider: "google";
  place_id?: string | null;
  display_name?: string | null;
  formatted_address: string;
  latitude: number | string;
  longitude: number | string;
  country?: string | null;
  country_code?: string | null;
  region?: string | null;
  city?: string | null;
  district?: string | null;
  ward?: string | null;
  street?: string | null;
  postal_code?: string | null;
};

export type MapPinConfirmationResponse = {
  address: Address;
  resolved_location: MapResolvedLocation;
  message: string;
};

export type PaginatedAddressResponse = {
  total: number;
  page: number;
  page_size: number;
  results: Address[];
};
