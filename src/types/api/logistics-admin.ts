export type LogisticsRole = "company_admin" | "operations_manager" | "dispatcher" | "driver" | "viewer";
export type LogisticsPermission = "profile:manage" | "users:manage" | "zones:manage" | "rates:manage" | "pickups:manage" | "shipments:manage";

export type LogisticsCompanyProfile = {
  id: string; name: string; code: string; description?: string | null; legal_name?: string | null;
  registration_number?: string | null; tax_identification_number?: string | null; license_number?: string | null;
  logo_url?: string | null; contact_name?: string | null; contact_email?: string | null; contact_phone?: string | null;
  website_url?: string | null; address_line1?: string | null; address_line2?: string | null; city?: string | null;
  region?: string | null; country: string; postal_code?: string | null; scope: string; status: string;
  supports_cod: boolean; supports_tracking: boolean; supports_webhooks: boolean; created_at: string; updated_at?: string | null;
};
export type CompanyProfilePayload = Pick<LogisticsCompanyProfile, "name" | "legal_name" | "description" | "registration_number" | "tax_identification_number" | "license_number" | "logo_url" | "contact_name" | "contact_email" | "contact_phone" | "website_url" | "address_line1" | "address_line2" | "city" | "region" | "country" | "postal_code">;

export type LogisticsAccount = {
  company: LogisticsCompanyProfile; membership_id: string; title?: string | null; member_role: LogisticsRole;
  effective_permissions: LogisticsPermission[]; is_primary_contact: boolean; can_manage_profile: boolean;
};
export type LogisticsTeamMember = {
  id: string; logistics_company_id: string; user_id: string; title?: string | null; member_role: LogisticsRole;
  permissions_json: LogisticsPermission[]; effective_permissions: LogisticsPermission[]; is_primary_contact: boolean;
  is_active: boolean; first_name?: string | null; last_name?: string | null; email: string; created_at: string;
};
export type TeamMemberCreate = { user_id: string; title?: string | null; member_role: LogisticsRole; permissions_json: LogisticsPermission[]; is_primary_contact: boolean; is_active: boolean };
export type TeamMemberUpdate = Omit<TeamMemberCreate, "user_id">;
