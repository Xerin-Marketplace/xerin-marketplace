export type SellerEarningsSummary = {
  currency: string;
  gross_sales: number | string;
  commission_deducted: number | string;
  net_earnings: number | string;
  transaction_count: number;
};

export type SellerWallet = {
  id: string;
  seller_id: string;
  currency: string;
  pending_balance: number | string;
  available_balance: number | string;
  reserved_balance: number | string;
  paid_out_balance: number | string;
  refunded_balance: number | string;
  debt_balance: number | string;
  is_frozen: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type WalletTransactionType =
  | "sale_credit"
  | "funds_release"
  | "payout_hold"
  | "payout_completed"
  | "payout_released"
  | "refund_debit"
  | "adjustment"
  | string;

export type SellerWalletTransaction = {
  id: string;
  transaction_type: WalletTransactionType;
  amount: number | string;
  currency: string;
  reference: string;
  order_id?: string | null;
  eligible_at?: string | null;
  released_at?: string | null;
  description?: string | null;
  created_at: string;
};

export type PaginatedWalletTransactionResponse = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: SellerWalletTransaction[];
};

export type SellerWalletTransactionParams = {
  page?: number;
  page_size?: number;
};
