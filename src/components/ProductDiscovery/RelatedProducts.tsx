"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { discoveryApi } from "@/lib/api/endpoints/discovery";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { useCategories } from "@/hooks/useProducts";
import type { AlsoBoughtProductItem, SearchProductItem } from "@/types/api/discovery";
import SimilarProducts from "./SimilarProducts";

import { resolveProductImageUrl } from "@/lib/products/adapters";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingBasket01Icon, SparklesIcon, CheckIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

const productImage = (item: SearchProductItem) =>
 item.primary_image_url
 ? resolveProductImageUrl(item.primary_image_url)
 : "/images/products/placeholder.svg";

export default function RelatedProducts({ productId }: { productId: string }) {
 const [related, setRelated] = useState<SearchProductItem[]>([]);
 const [alsoBought, setAlsoBought] = useState<AlsoBoughtProductItem[]>([]);
 const [alsoBoughtLoading, setAlsoBoughtLoading] = useState(true);
 const { data: categories = [], isLoading: categoriesLoading } = useCategories();

 useEffect(() => {
 if (!productId) return;

 void discoveryApi
 .related(productId, 8)
 .then((data) =>
 setRelated(data.results.filter((item) => item.id !== productId).slice(0, 8)),
 )
 .catch(() => setRelated([]));

 setAlsoBoughtLoading(true);
 void discoveryApi
 .alsoBought(productId, 8)
 .then((data) =>
 setAlsoBought(data.results.filter((item) => item.id !== productId).slice(0, 8)),
 )
 .catch(() => setAlsoBought([]))
 .finally(() => setAlsoBoughtLoading(false));
 }, [productId]);

 return (
 <div className="space-y-8 bg-muted py-10 sm:space-y-10 sm:py-14">
 <SimilarProducts productId={productId} />

 {alsoBoughtLoading ? (
 <AlsoBoughtLoading />
 ) : alsoBought.length > 0 ? (
 <ProductStrip
 eyebrow="Complete the basket"
 title="Customers who bought this item also bought"
 description="Based on real successful Xerin orders from customers who purchased this product."
 rows={alsoBought}
 tone="blue"
 icon="basket"
 showCoPurchaseEvidence
 />
 ) : null}

 <BrowseCategories categories={categories} loading={categoriesLoading} />

 {related.length > 0 && (
 <ProductStrip
 eyebrow="Keep exploring"
 title="Related Products"
 description="More approved products from similar categories or brands."
 rows={related}
 tone="neutral"
 icon="spark"
 />
 )}
 </div>
 );
}

function AlsoBoughtLoading() {
 return (
 <section className="mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8 xl:px-4">
 <div className="rounded-xl border border-border bg-card p-5 sm:p-7">
 <div className="h-6 w-72 animate-pulse rounded bg-muted" />
 <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
 <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {[0, 1, 2, 3].map((item) => (
 <div key={item} className="h-[300px] animate-pulse rounded-xl bg-muted" />
 ))}
 </div>
 </div>
 </section>
 );
}

function BrowseCategories({
 categories,
 loading,
}: {
 categories: Array<{ id: string | number; parent_id: string | number | null; name: string; slug: string }>;
 loading: boolean;
}) {
 const visible = useMemo(() => {
 const parents = categories.filter((item) => item.parent_id == null);
 return (parents.length ? parents : categories).slice(0, 10);
 }, [categories]);

 if (!loading && visible.length === 0) return null;

 return (
 <section className="mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8 xl:px-4">
 <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7">
 <div className="flex flex-wrap items-end justify-between gap-4">
 <div>
 <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Explore Xerin</span>
 <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">Browse by Category</h2>
 <p className="mt-1.5 text-sm text-muted-foreground">Jump directly into the department you want to explore.</p>
 </div>
 <Link
 href="/shop-with-sidebar"
 className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary"
 >
 Browse all categories <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
 </Link>
 </div>

 <div className="mt-5 flex flex-wrap gap-2.5">
 {(loading ? Array.from({ length: 10 }) : visible).map((category, index) => {
 if (loading) {
 return <div key={index} className="h-10 w-28 animate-pulse rounded-full bg-muted" />;
 }

 const item = category as typeof visible[number];

 return (
 <Link
 key={String(item.id)}
 href={`/shop-with-sidebar?category_id=${encodeURIComponent(String(item.id))}`}
 className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
 >
 {item.name}
 <span className="text-muted-foreground transition group-hover:text-primary" aria-hidden="true">
 <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
 </span>
 </Link>
 );
 })}
 </div>
 </div>
 </section>
 );
}

function ProductStrip({
 eyebrow,
 title,
 description,
 rows,
 tone,
 icon,
 showCoPurchaseEvidence = false,
}: {
 eyebrow: string;
 title: string;
 description: string;
 rows: Array<SearchProductItem | AlsoBoughtProductItem>;
 tone: "blue" | "neutral";
 icon: "basket" | "spark";
 showCoPurchaseEvidence?: boolean;
}) {
 const blue = tone === "blue";

 return (
 <section className="mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8 xl:px-4">
 <div className={`rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7`}>
 <div className="flex items-start gap-3">
 <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
 {icon === "basket" ? (
 <HugeiconsIcon icon={ShoppingBasket01Icon} size={22} />
 ) : (
 <HugeiconsIcon icon={SparklesIcon} size={22} />
 )}
 </span>
 <div>
 <span className={`text-[11px] font-bold uppercase tracking-[0.14em] ${"text-primary"}`}>{eyebrow}</span>
 <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
 <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
 </div>
 </div>

 <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {rows.slice(0, 8).map((item) => {
 const regular = Number(item.price || 0);
 const sale = item.sale_price == null ? null : Number(item.sale_price);
 const price = sale && sale > 0 && sale < regular ? sale : regular;

 return (
 <Link
 key={item.id}
 href={`/products/${item.id}`}
 className="group overflow-hidden rounded-xl border border-border bg-card p-3.5 shadow-sm transition duration-200 hover:border-primary/40 hover:shadow-md"
 >
 <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-lg bg-muted p-3">
 <Image
 src={productImage(item)}
 alt={item.name}
 width={180}
 height={180}
 className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
 />
 {sale && sale > 0 && sale < regular ? (
 <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-1 text-[10px] font-bold text-destructive-foreground">
 Special price
 </span>
 ) : null}
 </div>
 <p className="mt-3 line-clamp-2 min-h-[40px] text-sm font-semibold text-foreground">{item.name}</p>
 <div className="mt-2 flex items-center justify-between gap-2">
 <p className="text-base font-bold text-foreground">
 <PriceDisplay amount={price} sourceCurrency={item.currency} />
 </p>
 <span className="text-muted-foreground transition group-hover:text-primary" aria-hidden="true">
 <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
 </span>
 </div>
 {showCoPurchaseEvidence && "customer_count" in item ? (
 <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
 Bought by {item.customer_count} customer{item.customer_count === 1 ? "" : "s"} who bought this item
 </p>
 ) : null}
 </Link>
 );
 })}
 </div>
 </div>
 </section>
 );
}
