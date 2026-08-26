export type LogisticsDocumentType =
  | "tin_certificate"
  | "registration_certificate"
  | "business_license"
  | "representative_id"
  | "proof_of_address"
  | "insurance_certificate"
  | "logistics_license"
  | "other";

export type LogisticsDocumentStatus =
  | "pending_review"
  | "under_review"
  | "approved"
  | "changes_requested"
  | "rejected";

export type LogisticsCompanyDocument = {
  id: string;
  logistics_company_id: string;
  document_type: LogisticsDocumentType;
  document_name: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  version: number;
  is_current: boolean;
  status: LogisticsDocumentStatus;
  review_comment?: string | null;
  uploaded_by_user_id?: string | null;
  reviewed_by_user_id?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  can_edit: boolean;
  can_delete: boolean;
};

export type PaginatedLogisticsDocuments = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: LogisticsCompanyDocument[];
};

export type LogisticsDocumentRequirements = {
  required_types: LogisticsDocumentType[];
  optional_types: LogisticsDocumentType[];
  uploaded_required_types: LogisticsDocumentType[];
  missing_required_types: LogisticsDocumentType[];
  all_required_uploaded: boolean;
  all_required_approved: boolean;
  editing_locked: boolean;
};
