import type { Metadata } from "next";
import React from "react";
import { siteConfig } from "@/lib/site-config";

/** Apply to any page/layout that must never be indexed. */
export const noindexMetadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

/** Render a JSON-LD script tag. Server-component safe. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/images/logo/xerin-logo-mark.png`,
  contactPoint: {
    "@type": "ContactPoint",
    email: siteConfig.contact.email,
    contactType: "customer support",
  },
  sameAs: Object.values(siteConfig.social).filter(Boolean),
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

type ProductLdInput = {
  name: string;
  slug: string;
  description?: string | null;
  images: string[];
  price: number;
  currency: string;
  sku?: string | null;
  brand?: string | null;
  categoryName?: string | null;
  inStock: boolean;
  sellerName?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
};

export function productJsonLd(p: ProductLdInput) {
  const url = `${siteConfig.url}/products/${p.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    url,
    image: p.images,
    description: p.description || `${p.name} on ${siteConfig.name}`,
    ...(p.sku ? { sku: p.sku } : {}),
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    ...(p.categoryName
      ? { category: p.categoryName }
      : {}),
    ...(p.rating != null && p.reviewCount && p.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: p.rating,
            reviewCount: p.reviewCount,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url,
      price: p.price,
      priceCurrency: p.currency,
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      ...(p.sellerName
        ? { seller: { "@type": "Organization", name: p.sellerName } }
        : {}),
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

export const canonicalUrl = (path = "/"): string => {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return `${siteConfig.url}${clean}`;
};

export const pageMetadata = ({
  title,
  description,
  path = "/",
  image,
  noindex = false,
  ogType = "website",
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  ogType?: "website" | "article";
}): Metadata => {
  const url = canonicalUrl(path);
  // Site-relative image paths (e.g. /og/product/123) resolve to absolute
  // URLs — crawlers require absolute og:image values.
  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${siteConfig.url}${image}`
    : `${siteConfig.url}/og/fallback`;
  const images = [{ url: imageUrl }];
  return {
    title,
    description: truncate(description),
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { type: ogType, url, title, description: truncate(description), images, siteName: siteConfig.name },
    twitter: { card: "summary_large_image", title, description: truncate(description), images: images.map((i) => i.url) },
  };
};

export function itemListJsonLd(
  items: Array<{ name: string; url: string; image?: string }>,
  listName: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url.startsWith("http") ? item.url : canonicalUrl(item.url),
      name: item.name,
      ...(item.image ? { image: item.image } : {}),
    })),
  };
}

export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
}
