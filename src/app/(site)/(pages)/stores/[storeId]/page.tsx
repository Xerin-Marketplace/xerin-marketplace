import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreClient } from "./StoreClient";
import { siteConfig } from "@/lib/site-config";
import { API_SERVER_BASE_URL } from "@/lib/api/endpoints";
import { JsonLd, breadcrumbJsonLd, truncate } from "@/lib/seo";
import { resolveProductImageUrl } from "@/lib/products/adapters";
import type { Store } from "@/types/api/store";

type RouteParams = { params: Promise<{ storeId: string }> };

async function fetchStore(storeId: string): Promise<Store | null> {
  try {
    const res = await fetch(`${API_SERVER_BASE_URL}/stores/${encodeURIComponent(storeId)}`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) return (await res.json()) as Store;
  } catch {
    /* fall through to list lookup */
  }
  try {
    const res = await fetch(`${API_SERVER_BASE_URL}/stores?page=1&page_size=100`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: Store[] } | Store[];
    const list = Array.isArray(data) ? data : data.results ?? [];
    return list.find((s) => String(s.id) === storeId || s.slug === storeId) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { storeId } = await params;
  const store = await fetchStore(storeId);

  if (!store) notFound();

  const title = store.seo_title || `${store.store_name} | ${siteConfig.name}`;
  const description = truncate(
    store.seo_description ||
      store.description ||
      `Shop products from ${store.store_name} on ${siteConfig.name}.`,
  );
  const url = `${siteConfig.url}/stores/${store.slug || store.id}`;
  const ogCard = `${siteConfig.url}/og/store/${store.slug || store.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: [{ url: ogCard, width: 1200, height: 630, alt: store.store_name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogCard] },
  };
}

export default async function StorefrontPage({ params }: RouteParams) {
  const { storeId } = await params;
  const store = await fetchStore(storeId);
  if (!store) notFound();

  return (
    <>
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: store.store_name,
              url: `${siteConfig.url}/stores/${store.slug || store.id}`,
              ...(store.description ? { description: truncate(store.description) } : {}),
              ...(store.logo_url
                ? { logo: resolveProductImageUrl(store.logo_url) }
                : {}),
            },
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              { name: store.store_name, url: `/stores/${store.slug || store.id}` },
            ]),
          ]}
        />
      <StoreClient />
    </>
  );
}
