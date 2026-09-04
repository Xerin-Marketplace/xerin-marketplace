export type Product = {
  title: string;
  reviews?: number;
  reviewCount?: number;
  rating?: number;
  description?: string | null;
  sku?: string;
  status?: string;
  isActive?: boolean;
  marketplaceAvailable?: boolean;
  marketplaceUnavailableReason?: string | null;
  sellerComplianceStatus?: string | null;
  variants?: Array<{
    id: string | number;
    name: string;
    sku: string;
    price?: number | null;
    attributes?: Record<string, unknown> | null;
  }>;
  price: number;
  discountedPrice: number;
  currency?: string;
  id: number | string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
