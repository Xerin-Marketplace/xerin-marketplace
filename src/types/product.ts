export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number | string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
