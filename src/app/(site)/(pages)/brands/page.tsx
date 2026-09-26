import type { Metadata } from "next";
import Link from "next/link";
import { API_SERVER_BASE_URL } from "@/lib/api/endpoints";
import { siteConfig } from "@/lib/site-config";
import { JsonLd, breadcrumbJsonLd, itemListJsonLd, canonicalUrl } from "@/lib/seo";
import type { Brand } from "@/types/api/product";

export const dynamic = "force-dynamic";

async function fetchBrands(): Promise<Brand[]> {
  try {
    const res = await fetch(`${API_SERVER_BASE_URL}/products/brands`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    return (await res.json()) as Brand[];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: `Brands on ${siteConfig.name}`,
  description: `Browse products by brand on ${siteConfig.name} — verified sellers, protected checkout and tracked delivery across Tanzania.`,
  alternates: { canonical: canonicalUrl("/brands") },
};

export default async function BrandsPage() {
  const brands = (await fetchBrands()).filter((b) => b.slug);
  const crumbs = [
    { name: "Home", url: "/" },
    { name: "Brands", url: "/brands" },
  ];

  return (
    <main className="bg-muted/40">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          itemListJsonLd(
            brands.map((b) => ({ name: b.name, url: `/brands/${b.slug}` })),
            `Brands on ${siteConfig.name}`,
          ),
        ]}
      />

      <nav aria-label="Breadcrumb" className="border-b border-border bg-card">
        <ol className="mx-auto flex max-w-screen-xl flex-wrap items-center gap-2 px-4 py-4 text-xs text-muted-foreground lg:px-6">
          <li>
            <Link href="/" className="transition hover:text-primary">Home</Link>
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-semibold text-foreground">Brands</span>
          </li>
        </ol>
      </nav>

      <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-12">
        <header className="mb-8 max-w-2xl">
          <span className="mb-1.5 inline-block text-sm font-semibold text-primary">Brands</span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Shop by brand
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Find products from the brands carried by sellers on {siteConfig.name}.
          </p>
        </header>

        {brands.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
            {brands.map((brand) => (
              <Link
                key={String(brand.id)}
                href={`/brands/${brand.slug}`}
                className="flex h-20 items-center justify-center rounded-2xl border border-border bg-card px-4 text-center text-sm font-bold text-foreground shadow-sm transition hover:border-primary hover:text-primary"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">No brands are listed yet.</p>
            <Link
              href="/shop-with-sidebar"
              className="mt-4 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
