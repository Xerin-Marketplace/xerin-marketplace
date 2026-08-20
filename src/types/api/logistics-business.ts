export type Paginated<T> = { total: number; page: number; page_size: number; total_pages: number; results: T[] };

export type LogisticsWallet = {
  id: string; logistics_company_id: string; currency: string;
  pending_balance: string; available_balance: string; reserved_balance: string;
  paid_out_balance: string; refunded_balance: string; debt_balance: string;
  is_frozen: boolean; created_at: string; updated_at?: string | null;
};

export type WalletTransaction = {
  id: string; transaction_type: string; amount: string; currency: string; reference: string;
  order_id?: string | null; payout_request_id?: string | null; eligible_at?: string | null;
  released_at?: string | null; description?: string | null; created_at: string;
};

export type PayoutAccount = {
  id: string; logistics_company_id: string; account_type: "bank" | "mobile_money";
  provider: string; account_name: string; masked_account_number: string; currency: string;
  is_default: boolean; is_active: boolean; verification_status: string;
  verification_note?: string | null; verified_at?: string | null; created_at: string; updated_at?: string | null;
};

export type PayoutAccountCreate = {
  account_type: "bank" | "mobile_money"; provider: string; account_name: string;
  account_number: string; currency: string; is_default: boolean;
};

export type Payout = {
  id: string; logistics_company_id: string; payout_account_id: string; amount: string;
  currency: string; status: string; provider_reference?: string | null; company_note?: string | null;
  admin_note?: string | null; requested_at: string; processed_at?: string | null; completed_at?: string | null;
};

export type IntegrationAuthType = "none" | "api_key" | "bearer" | "basic" | "oauth2" | "custom" | string;
export type IntegrationConfig = {
  id: string; logistics_company_id: string; api_base_url?: string | null; outbound_webhook_url?: string | null;
  auth_type: IntegrationAuthType; credential_reference?: string | null; webhook_secret_reference?: string | null;
  api_key_header?: string | null; extra_config: Record<string, unknown>; webhook_enabled_events: string[];
  is_active: boolean; last_tested_at?: string | null; last_test_success?: boolean | null; last_test_message?: string | null;
  last_webhook_sent_at?: string | null; last_webhook_received_at?: string | null; created_at: string; updated_at?: string | null;
};
export type IntegrationPayload = Omit<IntegrationConfig, "id" | "logistics_company_id" | "last_tested_at" | "last_test_success" | "last_test_message" | "last_webhook_sent_at" | "last_webhook_received_at" | "created_at" | "updated_at">;

export type WebhookEvent = {
  id: string; logistics_company_id: string; direction: "inbound" | "outbound" | string; event_type: string;
  external_event_id?: string | null; shipment_id?: string | null; http_status?: number | null; processed: boolean;
  delivery_status: string; attempt_count: number; max_attempts: number; next_attempt_at?: string | null;
  last_attempt_at?: string | null; delivered_at?: string | null; dead_lettered_at?: string | null;
  error_message?: string | null; created_at: string;
};
