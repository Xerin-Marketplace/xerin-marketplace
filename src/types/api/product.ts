import type { ID, TimestampFields } from "./common";


export type ListingCurrency = {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  is_base: boolean;
};

export type ProductStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "inactive"
  | string;

export type Category = {
  id: ID;
  parent_id: ID | null;
  name: string;
  slug: string;
  created_at: string;
};


export type CategoryAttributeInputType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "multiselect"
  | "date";

export type CategoryAttribute = {
  id: ID;
  category_id: ID;
  key: string;
  name: string;
  description?: string | null;
  input_type: CategoryAttributeInputType;
  unit?: string | null;
  allowed_values: string[];
  settings?: Record<string, unknown>;
  is_required: boolean;
  is_filterable: boolean;
  is_comparable: boolean;
  use_for_similarity: boolean;
  similarity_weight: string | number;
  is_variant_attribute: boolean;
  inherit_to_children: boolean;
  display_order: number;
  is_active: boolean;
  source_category_id?: ID | null;
  inherited?: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type ProductSpecification = {
  id: ID;
  product_id: ID;
  attribute_id: ID;
  key: string;
  name: string;
  input_type: CategoryAttributeInputType;
  unit?: string | null;
  value: unknown;
  normalized_value?: string | null;
  is_comparable: boolean;
  use_for_similarity: boolean;
  similarity_weight: string | number;
  display_order: number;
};

export type ProductSpecificationInput = {
  attribute_id: ID;
  value: unknown;
};

export type Brand = {
  id: ID;
  name: string;
  slug: string;
  created_at: string;
};

export type ProductImage = {
  id: ID;
  product_id: ID;
  image_url: string;
  thumbnail_url?: string | null;
  storage_key?: string | null;
  original_filename?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  display_order?: number;
  is_primary: boolean;
  created_at: string;
};

export type ProductVariant = {
  id: ID;
  product_id: ID;
  variant_name: string;
  sku: string;
  seller_base_price?: string | null;
  seller_sale_price?: string | null;
  commission_rate_snapshot?: string | null;
  commission_amount_snapshot?: string | null;
  price: string | null;
  sale_price?: string | null;
  attributes: Record<string, unknown> | null;
  created_at: string;
};

export type ProductTag = {
  id: ID;
  product_id: ID;
  tag: string;
};

export type Product = TimestampFields & {
  id: ID;
  seller_id: ID | null;
  store_id: ID | null;
  broker_id?: ID | null;
  listing_owner_type?: "seller" | "broker" | string;
  listing_expires_at?: string | null;
  listing_expired_at?: string | null;
  fulfillment_location?: string | null;
  category_id: ID;
  brand_id: ID | null;
  sku: string;
  name: string;
  slug: string;
  description: string | null;

  // Seller-entered prices are preserved separately from customer-facing prices.
  seller_base_price?: string;
  seller_sale_price?: string | null;
  commission_rate_snapshot?: string;
  commission_amount_snapshot?: string;

  // Marketplace/customer-facing prices.
  price: string;
  sale_price: string | null;
  currency: string;
  weight: string | null;
  status: ProductStatus;
  rejection_reason: string | null;
  is_active: boolean;
  submitted_at?: string | null;
  approved_at?: string | null;
  approved_by_user_id?: ID | null;
  approval_method?: "automatic" | "manual" | string | null;

  // Optional frontend-enriched fields when fetched separately.
  images?: ProductImage[];
  variants?: ProductVariant[];
  tags?: ProductTag[];
  category?: Category;
  brand?: Brand;

  // Optional storefront fields returned by some endpoints.
  rating?: number | string | null;
  review_count?: number | null;
  is_featured?: boolean;
  is_best_seller?: boolean;
};

export type ProductListQuery = {
  search?: string;
  store_id?: ID;
  category_id?: ID;
  brand_id?: ID;
  seller_id?: ID;
  skip?: number;
  limit?: number;
};

export type ProductRequest = {
  store_id: ID;
  category_id: ID;
  brand_id?: ID | null;
  sku: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number | string;
  sale_price?: number | string | null;
  currency?: string;
  weight?: number | string | null;
};

export type ProductUpdateRequest = Partial<
  ProductRequest & {
    is_active: boolean | null;
  }
>;

export type ProductImageRequest = {
  image_url: string;
  is_primary?: boolean;
};

export type ProductVariantRequest = {
  variant_name: string;
  sku: string;
  price?: number | string | null;
  attributes?: Record<string, unknown> | null;
};

export type ProductTagRequest = {
  tag: string;
};

export type BrokerOffer = { id:string; product_id:string; seller_id:string; commission_type:"fixed"|"percentage"; commission_value:string; max_attributed_sales?:number|null; attributed_sales_count:number; starts_at:string; ends_at?:string|null; is_active:boolean; created_at:string; accepted_brokers_count:number; estimated_reward_per_unit:string; estimated_seller_net_per_unit:string; };
export type BrokerOfferRequest = { commission_type:"fixed"|"percentage"; commission_value:number|string; max_attributed_sales?:number|null; starts_at?:string|null; ends_at?:string|null; };
