export type Product = {
  title: string;
  reviews: number;
  reviewCount?: number;
  rating?: number;
  price: number;
  discountedPrice: number;
  id: number | string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
