export type DeliveryDisputeReason = "not_received" | "wrong_recipient" | "damaged" | "wrong_location" | "other";

export type DeliveryProofEvent = {
  id: string;
  action: string;
  note?: string | null;
  created_by_id?: string | null;
  created_at: string;
};

export type DeliveryProof = {
  id: string;
  shipment_id: string;
  order_id: string;
  customer_id: string;
  logistics_company_id: string;
  status: string;
  recipient_name: string;
  recipient_phone_last4?: string | null;
  photo_url: string;
  delivery_latitude: number | string;
  delivery_longitude: number | string;
  destination_latitude: number | string;
  destination_longitude: number | string;
  distance_from_destination_meters: number | string;
  otp_expires_at: string;
  otp_attempts: number;
  notes?: string | null;
  verified_at?: string | null;
  disputed_at?: string | null;
  dispute_reason?: string | null;
  dispute_notes?: string | null;
  logistics_release_transaction_id?: string | null;
  settlement_status: string;
  created_at: string;
  updated_at?: string | null;
  events: DeliveryProofEvent[];
};

export type DeliveryProofStart = {
  proof: DeliveryProof;
  otp_delivery_channels: string[];
  dev_otp?: string | null;
};
