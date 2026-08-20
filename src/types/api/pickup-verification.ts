export type PickupProofStatus = "pending" | "approved" | "disputed" | "auto_approved";
export type PickupProofProblemReason = "wrong_product" | "wrong_variant" | "wrong_quantity" | "damaged" | "photo_unclear" | "other";

export type CustomerPickupProof = {
  id: string;
  shipment_id: string;
  handover_id: string;
  order_id: string;
  customer_id: string;
  seller_id: string;
  logistics_company_id: string;
  photo_url: string;
  original_filename?: string | null;
  mime_type: string;
  file_size: number;
  pickup_latitude: number | string;
  pickup_longitude: number | string;
  courier_reference?: string | null;
  notes?: string | null;
  status: PickupProofStatus;
  review_deadline: string;
  customer_reviewed_at?: string | null;
  customer_reviewed_by_id?: string | null;
  problem_reason?: PickupProofProblemReason | null;
  problem_notes?: string | null;
  uploaded_by_id?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type PaginatedPickupProofs = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: CustomerPickupProof[];
};
