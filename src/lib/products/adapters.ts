import type { Product as ApiProduct, Category as ApiCategory } from "@/types/api/product";
import type { Product as UiProduct } from "@/types/product";

const FALLBACK_PRODUCT_IMAGE = "/images/products/product-1-bg-1.png";

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const getProductImageUrl = (product: ApiProduct) => {
  const primaryImage = product.images?.find((image) => image.is_primary);
  const firstImage = primaryImage || product.images?.[0];

  return (
    firstImage?.image_url ||
    firstImage?.url ||
    FALLBACK_PRODUCT_IMAGE
  );
};

export const mapApiProductToUiProduct = (product: ApiProduct): UiProduct => {
  const price = toNumber(product.price);
  const discountedPrice = toNumber(
    product.sale_price ?? product.discounted_price,
    price
  );
  const imageUrl = getProductImageUrl(product);

  return {
    id: toNumber(product.id),
    title: product.name || product.title || "Untitled product",
    reviews: 0,
    price,
    discountedPrice,
    imgs: {
      thumbnails: [imageUrl],
      previews: [imageUrl],
    },
  };
};

export const mapApiProductsToUiProducts = (products: ApiProduct[]) =>
  products.map(mapApiProductToUiProduct);

export type UiCategoryFilter = {
  name: string;
  products: number;
  isRefined: boolean;
  id?: string | number;
};

export const mapApiCategoryToFilter = (
  category: ApiCategory,
  index: number
): UiCategoryFilter => ({
  id: category.id,
  name: category.name,
  products: 0,
  isRefined: index === 0,
});

export const mapApiCategoriesToFilters = (categories: ApiCategory[]) =>
  categories.map(mapApiCategoryToFilter);
