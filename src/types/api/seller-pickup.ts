export type SellerPickupLocation = {
  id: string; seller_id: string; label: string; formatted_address: string;
  country: string; region: string; city: string; district?: string | null;
  ward?: string | null; street?: string | null; landmark?: string | null;
  postal_code?: string | null; place_id?: string | null;
  latitude: number | string; longitude: number | string;
  pickup_contact_name: string; pickup_phone: string;
  pickup_instructions?: string | null; is_default: boolean;
  is_verified: boolean; is_active: boolean; created_at: string; updated_at?: string | null;
};

export type SellerPickupLocationPayload = {
  label: string; formatted_address: string; country: string; region: string; city: string;
  district?: string | null; ward?: string | null; street?: string | null;
  landmark?: string | null; postal_code?: string | null; place_id?: string | null;
  latitude: number; longitude: number; pickup_contact_name: string; pickup_phone: string;
  pickup_instructions?: string | null; is_default: boolean; is_active: boolean;
};

export type SellerPickupLocationList = {
  total: number; page: number; page_size: number; total_pages: number; results: SellerPickupLocation[];
};
