export type SellerOrderStatus = "new"|"accepted"|"processing"|"ready_to_ship"|"shipped"|"delivered"|"cancellation_requested"|"cancelled";
export type SellerOrderItem={id:string;product_id:string;variant_id?:string|null;store_id:string;product_name:string;variant_name?:string|null;quantity:number;unit_price:number|string;total_price:number|string};
export type SellerOrder={id:string;order_id:string;seller_id:string;store_id:string;store_name?:string|null;store_country?:string|null;order_status:string;seller_status:SellerOrderStatus;currency:string;seller_subtotal:number|string;item_count:number;customer_name:string;customer_phone?:string|null;shipping_address?:Record<string,unknown>|null;shipping_method_name?:string|null;shipping_carrier?:string|null;estimated_delivery_from?:string|null;estimated_delivery_to?:string|null;seller_notes?:string|null;cancellation_reason?:string|null;items:SellerOrderItem[];shipment?:Record<string,unknown>|null;created_at:string;updated_at?:string|null};
export type SellerOrderList={total:number;page:number;page_size:number;results:SellerOrder[]};
export type SellerOrderSummary={total_orders:number;new_orders:number;accepted_orders:number;processing_orders:number;ready_to_ship_orders:number;shipped_orders:number;delivered_orders:number;cancellation_requests:number;gross_sales:number|string;units_sold:number};
export type SellerOrderQuery={page?:number;page_size?:number;search?:string;status?:SellerOrderStatus;date_from?:string;date_to?:string};


export type ShipmentHandoverStatus = "awaiting_courier" | "courier_arrived" | "seller_confirmed";

export type ShipmentHandover = {
  id: string;
  shipment_id: string;
  seller_order_id: string;
  seller_id: string;
  logistics_company_id?: string | null;
  status: ShipmentHandoverStatus;
  courier_arrived_at?: string | null;
  courier_arrived_by_id?: string | null;
  courier_arrival_latitude?: number | string | null;
  courier_arrival_longitude?: number | string | null;
  courier_arrival_notes?: string | null;
  seller_confirmed_at?: string | null;
  seller_confirmed_by_id?: string | null;
  seller_confirmation_notes?: string | null;
  pickup_snapshot: Record<string, unknown>;
  package_snapshot: Record<string, unknown>[];
  created_at: string;
  updated_at?: string | null;
};

export type SellerHandoverConfirmationRequest = {
  notes?: string | null;
};


export type SellerOrderMessageAttachment = {
  id: string;
  file_url: string;
  file_name?: string | null;
  mime_type?: string | null;
  created_at: string;
};

export type SellerOrderMessage = {
  id: string;
  seller_order_id: string;
  sender_user_id?: string | null;
  sender_role_label?: string | null;
  message: string;
  is_internal: boolean;
  attachments: SellerOrderMessageAttachment[];
  created_at: string;
};

export type SellerOrderMessageCreate = {
  message: string;
  is_internal?: boolean;
  attachment_urls?: string[];
};


export type SellerOrderPackageAttachment = {
  id: string;
  file_url: string;
  file_name?: string | null;
  mime_type?: string | null;
  created_at: string;
};

export type SellerOrderPackage = {
  id: string;
  seller_order_id: string;
  weight_kg?: number | string | null;
  length_cm?: number | string | null;
  width_cm?: number | string | null;
  height_cm?: number | string | null;
  package_count: number;
  notes?: string | null;
  is_ready: boolean;
  prepared_at?: string | null;
  attachments: SellerOrderPackageAttachment[];
  created_at: string;
  updated_at?: string | null;
};

export type SellerOrderPackageUpsert = {
  weight_kg?: number | null;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  package_count: number;
  notes?: string | null;
  is_ready: boolean;
  attachment_urls?: string[];
};

export type SellerFulfillmentReadinessCheck = {
  code: string;
  label: string;
  ready: boolean;
  blocking: boolean;
  detail?: string | null;
};

export type SellerFulfillmentReadiness = {
  seller_order_id: string;
  ready_to_ship: boolean;
  pickup_location_id?: string | null;
  package_id?: string | null;
  package_ids: string[];
  package_groups: number;
  physical_package_count: number;
  total_weight_kg: number | string;
  shipment_id?: string | null;
  blockers: string[];
  warnings: string[];
  checks: SellerFulfillmentReadinessCheck[];
};
