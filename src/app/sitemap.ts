import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { API_SERVER_BASE_URL } from "@/lib/api/endpoints";

const REVALIDATE_SECONDS = 3600;

type SitemapProduct = { slug?: string | null; id?: string | number; updated_at?: string | null };
type SitemapCategory = { slug?: string | null; id?: string | number; parent_id?: string | number | null };
type SitemapStore = { slug?: string | null; id?: string | number; is_public?: boolean };

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_SERVER_BASE_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      // Never let a slow/unreachable backend stall the sitemap (or the build).
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const staticRoutes: Array<{ path: string; priority: number; freq: "daily" | "weekly" | "monthly" }> = [
    { path: "", priority: 1.0, freq: "daily" },
    { path: "/shop-with-sidebar", priority: 0.9, freq: "daily" },
    { path: "/shop-without-sidebar", priority: 0.8, freq: "daily" },
    { path: "/track", priority: 0.5, freq: "monthly" },
    { path: "/contact", priority: 0.6, freq: "monthly" },
    { path: "/help", priority: 0.6, freq: "monthly" },
    { path: "/seller/register", priority: 0.6, freq: "monthly" },
    { path: "/policies/product-listing", priority: 0.4, freq: "monthly" },
    { path: "/policies/terms-of-use", priority: 0.4, freq: "monthly" },
    { path: "/policies/privacy", priority: 0.4, freq: "monthly" },
    { path: "/policies/integrity-compliance", priority: 0.4, freq: "monthly" },
    { path: "/policies/intellectual-property", priority: 0.4, freq: "monthly" },
    { path: "/policies/legal-enquiry", priority: 0.3, freq: "monthly" },
    { path: "/privacy", priority: 0.4, freq: "monthly" },
    { path: "/terms", priority: 0.4, freq: "monthly" },
  ];

  for (const route of staticRoutes) {
    entries.push({
      url: `${siteConfig.url}${route.path}`,
      lastModified,
      changeFrequency: route.freq,
      priority: route.priority,
    });
  }

  const [products, categories, stores] = await Promise.all([
    fetchJson<SitemapProduct[]>("/products?limit=1000"),
    fetchJson<SitemapCategory[]>("/products/categories"),
    fetchJson<{ results?: SitemapStore[] } | SitemapStore[]>("/stores?limit=500"),
  ]);

  for (const category of categories ?? []) {
    if (!category.slug) continue;
    entries.push({
      url: `${siteConfig.url}/category/${encodeURIComponent(String(category.slug))}`,
      lastModified,
      changeFrequency: "weekly",
      priority: category.parent_id == null ? 0.7 : 0.6,
    });
  }

  for (const product of products ?? []) {
    const slugOrId = product.slug || product.id;
    if (!slugOrId) continue;
    entries.push({
      url: `${siteConfig.url}/products/${encodeURIComponent(String(slugOrId))}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  const storeList = Array.isArray(stores) ? stores : stores?.results ?? [];
  for (const store of storeList) {
    const slugOrId = store.slug || store.id;
    if (!slugOrId) continue;
    entries.push({
      url: `${siteConfig.url}/stores/${encodeURIComponent(String(slugOrId))}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
