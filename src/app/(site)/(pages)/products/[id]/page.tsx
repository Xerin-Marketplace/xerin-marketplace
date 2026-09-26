import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./ProductDetailClient";
import { siteConfig } from "@/lib/site-config";
import { API_SERVER_BASE_URL } from "@/lib/api/endpoints";
import { JsonLd, breadcrumbJsonLd, productJsonLd, truncate } from "@/lib/seo";
import { resolveProductImageUrl } from "@/lib/products/adapters";
import type { Product } from "@/types/api/product";

type RouteParams = { params: Promise<{ id: string }> };

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_SERVER_BASE_URL}/products/${encodeURIComponent(id)}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const product = (await res.json()) as Product;
    if (!Array.isArray(product.images)) {
      try {
        const images = await fetch(
          `${API_SERVER_BASE_URL}/products/${encodeURIComponent(String(product.id))}/images`,
          { next: { revalidate: 300 }, signal: AbortSignal.timeout(15000) },
        );
        if (images.ok) product.images = await images.json();
      } catch {
        /* images optional */
      }
    }
    return product;
  } catch {
    return null;
  }
}

function productImages(product: Product): string[] {
  return (product.images ?? [])
    .map((img) => resolveProductImageUrl(img.image_url))
    .filter(Boolean)
    .slice(0, 6);
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product || !product.is_active || product.status !== "approved") {
    notFound();
  }

  const title = `${product.name} | Buy Online | ${siteConfig.name}`;
  const description = truncate(
    product.description ||
      `Buy ${product.name} online on ${siteConfig.name}. Marketplace checkout with delivery and order tracking.`,
  );
  const url = `${siteConfig.url}/products/${product.slug || product.id}`;
  const images = productImages(product);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: images.map((src) => ({ url: src, alt: product.name })),
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function ProductDetailsPage({ params }: RouteParams) {
  const { id } = await params;
  const product = await fetchProduct(id);

  const indexable = Boolean(product && product.is_active && product.status === "approved");
  if (!indexable || !product) notFound();

  return (
    <>
      {indexable && product ? (
        <JsonLd
          data={[
            productJsonLd({
              name: product.name,
              slug: product.slug || String(product.id),
              description: product.description,
              images: productImages(product),
              price: Number(product.sale_price || product.price || 0),
              currency: product.currency || "TZS",
              sku: product.sku,
              brand: product.brand?.name ?? null,
              categoryName: product.category?.name ?? null,
              inStock: product.marketplace_available !== false,
              sellerName: null,
              rating: product.rating != null ? Number(product.rating) : null,
              reviewCount: product.review_count != null ? Number(product.review_count) : null,
            }),
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              ...(product.category?.name
                ? [
                    {
                      name: product.category.name,
                      url: product.category.slug
                        ? `/category/${product.category.slug}`
                        : `/shop-with-sidebar?category_id=${product.category.id}`,
                    },
                  ]
                : []),
              { name: product.name, url: `/products/${product.slug || product.id}` },
            ]),
          ]}
        />
      ) : null}
      <ProductDetailClient />
    </>
  );
}
