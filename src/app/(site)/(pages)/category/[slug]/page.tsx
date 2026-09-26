import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { API_SERVER_BASE_URL } from "@/lib/api/endpoints";
import { siteConfig } from "@/lib/site-config";
import {
  JsonLd,
  breadcrumbJsonLd,
  itemListJsonLd,
  canonicalUrl,
  truncate,
} from "@/lib/seo";
import { resolveProductImageUrl } from "@/lib/products/adapters";
import PriceDisplay from "@/components/shared/PriceDisplay";
import type { Category, Product } from "@/types/api/product";

type RouteParams = { params: Promise<{ slug: string }> };
const REVALIDATE = 600;

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_SERVER_BASE_URL}/products/categories`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    return (await res.json()) as Category[];
  } catch {
    return [];
  }
}

async function fetchCategoryProducts(categoryId: string, page = 1, pageSize = 24) {
  try {
    const res = await fetch(
      `${API_SERVER_BASE_URL}/products?category_id=${encodeURIComponent(categoryId)}&limit=${pageSize}&skip=${(page - 1) * pageSize}`,
      { next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(15000) },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const list: Product[] = Array.isArray(data) ? data : data?.results ?? [];
    return list.filter((p) => p.is_active && p.status === "approved");
  } catch {
    return [];
  }
}

// Dynamic rendering keeps notFound() returning a real 404 for unknown
// slugs — cached ISR results would otherwise be served with a 200.
export const dynamic = "force-dynamic";

const resolveCategory = (categories: Category[], slug: string) =>
  categories.find((c) => c.slug === slug) ??
  categories.find((c) => String(c.id) === slug);

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const categories = await fetchCategories();
  const category = resolveCategory(categories, slug);

  // Throwing here (before any streaming starts) is what makes the
  // response carry a real 404 status for unknown slugs.
  if (!category) notFound();

  const title = `${category.name} | Buy Online | ${siteConfig.name}`;
  const description = truncate(
    `Shop ${category.name} on ${siteConfig.name}. Browse real seller listings with protected checkout, delivery quotes and order tracking.`,
  );
  const url = canonicalUrl(`/category/${category.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: [{ url: `${siteConfig.url}/og/category/${category.slug}`, width: 1200, height: 630, alt: category.name }],
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteConfig.url}/og/category/${category.slug}`],
    },
  };
}

export default async function CategoryPage({ params }: RouteParams) {
  const { slug } = await params;
  const categories = await fetchCategories();
  const category = resolveCategory(categories, slug);
  if (!category) notFound();

  const [products, parent, children] = await Promise.all([
    fetchCategoryProducts(String(category.id)),
    Promise.resolve(
      category.parent_id
        ? categories.find((c) => String(c.id) === String(category.parent_id)) ?? null
        : null,
    ),
    Promise.resolve(
      categories.filter((c) => String(c.parent_id) === String(category.id)),
    ),
  ]);

  const categoryUrl = `/category/${category.slug}`;
  const crumbs = [
    { name: "Home", url: "/" },
    ...(parent ? [{ name: parent.name, url: `/category/${parent.slug}` }] : []),
    { name: category.name, url: categoryUrl },
  ];

  return (
    <main className="bg-muted/40">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          itemListJsonLd(
            products.slice(0, 24).map((p) => ({
              name: p.name,
              url: `/products/${p.slug || p.id}`,
              image: p.images?.[0]
                ? resolveProductImageUrl(p.images[0].image_url)
                : undefined,
            })),
            `${category.name} on ${siteConfig.name}`,
          ),
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-border bg-card">
        <ol className="mx-auto flex max-w-screen-xl flex-wrap items-center gap-2 px-4 py-4 text-xs text-muted-foreground lg:px-6">
          {crumbs.map((crumb, i) => (
            <li key={crumb.url} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === crumbs.length - 1 ? (
                <span aria-current="page" className="font-semibold text-foreground">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.url} className="transition hover:text-primary">
                  {crumb.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-12">
        {/* Header + intro copy */}
        <header className="mb-8 max-w-2xl">
          <span className="mb-1.5 inline-block text-sm font-semibold text-primary">
            Category
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {category.name}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Browse {category.name.toLowerCase()} from sellers on {siteConfig.name} —
            protected checkout, delivery quotes and order tracking on every order.
          </p>
        </header>

        {/* Subcategories */}
        {children.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Browse {category.name} subcategories
            </h2>
            <div className="flex flex-wrap gap-2">
              {children.map((child) => (
                <Link
                  key={String(child.id)}
                  href={`/category/${child.slug}`}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Product grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-6">
            {products.map((product) => {
              const imageUrl = product.images?.[0]
                ? resolveProductImageUrl(product.images[0].image_url)
                : "/images/products/placeholder.svg";
              const price = Number(product.sale_price || product.price || 0);
              const hasDiscount =
                product.sale_price && Number(product.sale_price) < Number(product.price);
              const pct = hasDiscount
                ? Math.round(
                    ((Number(product.price) - Number(product.sale_price)) /
                      Number(product.price)) *
                      100,
                  )
                : 0;

              return (
                <article
                  key={String(product.id)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:shadow-lg sm:hover:-translate-y-1"
                >
                  <Link
                    href={`/products/${product.slug || product.id}`}
                    className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted p-3"
                  >
                    {hasDiscount && (
                      <span className="absolute left-2 top-2 z-10 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-white">
                        -{pct}%
                      </span>
                    )}
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      width={220}
                      height={220}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-3">
                    <h3 className="line-clamp-2 text-[13px] font-semibold leading-[18px] text-foreground group-hover:text-primary">
                      <Link href={`/products/${product.slug || product.id}`}>
                        {product.name}
                      </Link>
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[15px] font-extrabold text-foreground">
                        <PriceDisplay amount={price} sourceCurrency={product.currency} />
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          <PriceDisplay
                            amount={Number(product.price)}
                            sourceCurrency={product.currency}
                          />
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No products are listed in {category.name} yet.
            </p>
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
