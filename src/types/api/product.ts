import type { ID, TimestampFields } from "./common";

export type ProductStatus = "draft" | "pending" | "approved" | "rejected" | "active" | "inactive" | string;

export type Category = TimestampFields & {
  id: ID;
  name: string;
  slug?: string;
  parent_id?: ID | null;
  description?: string | null;
  is_active?: boolean;
};

export type Brand = TimestampFields & {
  id: ID;
  name: string;
  slug?: string;
  description?: string | null;
  is_active?: boolean;
};

export type ProductImage = TimestampFields & {
  id: ID;
  product_id?: ID;
  image_url?: string;
  url?: string;
  alt_text?: string | null;
  is_primary?: boolean;
  sort_order?: number;
};

export type ProductVariant = TimestampFields & {
  id: ID;
  product_id?: ID;
  name?: string;
  sku?: string;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  weight?: number | string | null;
  price?: number | string | null;
  stock_quantity?: number;
};

export type ProductTag = TimestampFields & {
  id: ID;
  product_id?: ID;
  name: string;
  slug?: string;
};

export type Product = TimestampFields & {
  id: ID;
  seller_id?: ID;
  category_id?: ID;
  brand_id?: ID | null;
  sku?: string;
  name: string;
  slug?: string;
  title?: string;
  description?: string | null;
  price: number | string;
  sale_price?: number | string | null;
  discounted_price?: number | string | null;
  currency?: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
  weight?: number | string | null;
  status?: ProductStatus;
  rejection_reason?: string | null;
  is_active?: boolean;
  images?: ProductImage[];
  variants?: ProductVariant[];
  tags?: ProductTag[];
  category?: Category;
  brand?: Brand;
};

export type ProductListQuery = {
  search?: string;
  category_id?: ID;
  brand_id?: ID;
  seller_id?: ID;
  skip?: number;
  limit?: number;
  sort_by?: string;
  is_active?: boolean;
};

export type ProductRequest = {
  category_id: ID;
  brand_id?: ID | null;
  name: string;
  description?: string;
  price: number | string;
  sale_price?: number | string | null;
  currency?: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
  weight?: number | string | null;
};
