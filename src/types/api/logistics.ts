type ID = string;

export type LogisticsMemberRole =
  | "company_admin"
  | "operations_manager"
  | "dispatcher"
  | "driver"
  | "viewer"
  | string;

export type LogisticsCompany = {
  id: ID;
  name: string;
  code?: string;
  legal_name?: string | null;
  description?: string | null;
  logo_url?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  status?: string;
  supports_cod?: boolean;
  supports_tracking?: boolean;
  supports_webhooks?: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type LogisticsCompanyAccount = {
  company: LogisticsCompany;
  membership_id: ID;
  title?: string | null;
  member_role: LogisticsMemberRole;
  effective_permissions: string[];
  is_primary_contact: boolean;
  can_manage_profile: boolean;
};

export type LogisticsDashboard = {
  logistics_company_id: ID;
  members: number;
  active_zones: number;
  active_services: number;
  active_rates: number;
  shipments_total: number;
  shipments_by_status: Record<string, number>;
  pickup_jobs_total: number;
  pickup_jobs_by_status: Record<string, number>;
  webhook_events_24h: number;
  webhook_failures_24h: number;
  integration_configured: boolean;
  integration_active: boolean;
};

export type ShipmentStatus =
  | "pending" | "ready_for_dispatch" | "dispatched" | "in_transit"
  | "out_for_delivery" | "delivered" | "delivery_failed"
  | "returned_to_sender" | "cancelled";

export type PickupJobStatus =
  | "scheduled" | "assigned" | "en_route" | "arrived"
  | "completed" | "failed" | "cancelled";

export type ShipmentTrackingEvent = {
  id: ID;
  shipment_id: ID;
  status: ShipmentStatus;
  location?: string | null;
  notes?: string | null;
  created_by_id?: ID | null;
  created_at: string;
};

export type LogisticsShipment = {
  id: ID;
  order_id: ID;
  seller_id: ID;
  logistics_company_id?: ID | null;
  shipping_method_id?: ID | null;
  status: ShipmentStatus;
  carrier_name?: string | null;
  tracking_number?: string | null;
  estimated_delivery_from?: string | null;
  estimated_delivery_to?: string | null;
  dispatched_at?: string | null;
  delivered_at?: string | null;
  items: Array<{ id: ID; order_item_id: ID; quantity: number }>;
  tracking_events: ShipmentTrackingEvent[];
  created_at: string;
  updated_at?: string | null;
};

export type LogisticsPickupJob = {
  id: ID;
  logistics_company_id: ID;
  shipment_id: ID;
  assigned_membership_id?: ID | null;
  status: PickupJobStatus;
  scheduled_for?: string | null;
  pickup_reference: string;
  dispatcher_notes?: string | null;
  courier_notes?: string | null;
  failure_reason?: string | null;
  assigned_at?: string | null;
  started_at?: string | null;
  arrived_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  created_by_id?: ID | null;
  created_at: string;
  updated_at?: string | null;
};

export type LogisticsMember = {
  id: ID;
  user_id: ID;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  title?: string | null;
  member_role: LogisticsMemberRole;
  is_active: boolean;
};

export type Paginated<T> = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
};
