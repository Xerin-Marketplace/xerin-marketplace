import type { Product } from "./product";
export type BrokerStatus = "pending_kyc" | "kyc_submitted" | "under_review" | "approved" | "rejected" | "suspended";
export type Broker = { id:string; user_id:string; broker_code:string; first_name?:string|null; last_name?:string|null; email?:string|null; phone?:string|null; country:string; region:string; city:string; nida_number?:string|null; status:BrokerStatus; approved_at?:string|null; rejected_at?:string|null; suspended_at?:string|null; status_reason?:string|null; created_at:string; };
export type BrokerKycDocument = { id:string; broker_id:string; document_type:string; original_filename?:string|null; mime_type?:string|null; status:string; rejection_reason?:string|null; reviewed_at?:string|null; created_at:string; };
export type BrokerKycStatus = { broker_status:BrokerStatus; required_documents:string[]; uploaded_documents:string[]; missing_documents:string[]; can_submit_for_review:boolean; can_use_broker_features:boolean; };
export type PaginatedBrokers = { total:number; page:number; page_size:number; results:Broker[]; };


export type BrokerProductImage = { id:string; product_id:string; image_url:string; thumbnail_url?:string|null; is_primary:boolean; display_order?:number; created_at:string; };
export type BrokerProduct = {
  id:string; seller_id?:string|null; store_id?:string|null; broker_id:string; listing_owner_type:"broker";
  category_id:string; brand_id?:string|null; sku:string; name:string; slug:string; description?:string|null;
  price:string; sale_price?:string|null; currency:string; weight?:string|null; status:string; rejection_reason?:string|null;
  is_active:boolean; listing_expires_at?:string|null; listing_expired_at?:string|null; fulfillment_location?:string|null;
  images:BrokerProductImage[]; quantity:number; reserved_quantity:number; available_quantity:number; seconds_remaining?:number|null; created_at:string;
};
export type BrokerProductCreate = { category_id:string; brand_id?:string|null; name:string; description?:string|null; price:string|number; sale_price?:string|number|null; currency:string; weight?:string|number|null; quantity:number; fulfillment_location:string; };
export type BrokerProductUpdate = Partial<BrokerProductCreate>;

export type BrokerOfferSummary = { id:string; product_id:string; seller_id:string; commission_type:"fixed"|"percentage"; commission_value:string; max_attributed_sales?:number|null; attributed_sales_count:number; starts_at:string; ends_at?:string|null; is_active:boolean; created_at:string; accepted_brokers_count:number; estimated_reward_per_unit:string; estimated_seller_net_per_unit:string; };
export type BrokerOpportunity = { offer:BrokerOfferSummary; product:Product; available_quantity:number; already_accepted:boolean; };
export type BrokerOfferAcceptance = { id:string; offer_id:string; broker_id:string; is_active:boolean; accepted_at:string; stopped_at?:string|null; };

export type BrokerReferralLink = { id:string; acceptance_id:string; offer_id:string; broker_id:string; product_id:string; referral_code:string; is_active:boolean; created_at:string; share_path:string; };

export type BrokerCommissionStatus = "pending" | "available" | "partially_reversed" | "reversed" | "cancelled";
export type BrokerCommission = {
  id:string; broker_id:string; order_id:string; order_item_id:string;
  broker_offer_id?:string|null; broker_attribution_id?:string|null; escrow_hold_id?:string|null;
  currency:string; amount:string; reversed_amount:string; net_amount:string;
  status:BrokerCommissionStatus; available_at?:string|null; reversed_at?:string|null;
  reference:string; created_at:string;
};
export type PaginatedBrokerCommissions = {
  total:number; page:number; page_size:number; total_pages:number; results:BrokerCommission[];
};
export type BrokerCommissionSummary = {
  currency:string; pending_amount:string; available_amount:string; reversed_amount:string;
  lifetime_commission:string; total_records:number;
};

export type BrokerWallet = {
  id:string; broker_id:string; currency:string;
  pending_balance:string; available_balance:string; reserved_balance:string;
  paid_out_balance:string; reversed_balance:string; debt_balance:string;
  is_frozen:boolean; created_at:string; updated_at?:string|null;
};
export type BrokerWalletTransaction = {
  id:string; wallet_id:string; broker_id:string; commission_id?:string|null; payout_request_id?:string|null;
  transaction_type:string; amount:string; currency:string; reference:string; description?:string|null; created_at:string;
};
export type PaginatedBrokerWalletTransactions = { total:number; page:number; page_size:number; total_pages:number; results:BrokerWalletTransaction[]; };
export type BrokerPayoutAccount = {
  id:string; broker_id:string; account_type:"mobile_money"|"bank"; provider:string; account_name:string; account_number:string;
  currency:string; is_default:boolean; is_active:boolean; verification_status:"pending"|"verified"|"rejected";
  verification_note?:string|null; verified_at?:string|null; created_at:string; updated_at?:string|null;
};
export type BrokerPayoutAccountCreate = Omit<BrokerPayoutAccount,"id"|"broker_id"|"is_active"|"verification_status"|"verification_note"|"verified_at"|"created_at"|"updated_at">;
export type BrokerPayoutStatus = "pending"|"approved"|"processing"|"completed"|"failed"|"rejected"|"cancelled";
export type BrokerPayoutRequest = {
  id:string; wallet_id:string; broker_id:string; payout_account_id:string; amount:string; currency:string; status:BrokerPayoutStatus;
  provider_reference?:string|null; broker_note?:string|null; admin_note?:string|null; requested_at:string; processed_at?:string|null; completed_at?:string|null;
};
export type PaginatedBrokerPayouts = { total:number; page:number; page_size:number; total_pages:number; results:BrokerPayoutRequest[]; };
