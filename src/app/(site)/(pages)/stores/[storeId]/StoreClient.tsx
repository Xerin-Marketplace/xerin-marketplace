"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProductItem from "@/components/Common/ProductItem";
import { storeApi } from "@/lib/api/endpoints/store";
import { useProducts } from "@/hooks/useProducts";
import { mapApiProductsToUiProducts, resolveProductImageUrl } from "@/lib/products/adapters";

export const StoreClient = () => {
 const params = useParams();
 const storeId = String(params?.storeId || "");

 const {
 data: stores = [],
 isLoading: storeLoading,
 error: storeError,
 } = useQuery({
 queryKey: ["stores", "public"],
 queryFn: () => storeApi.listPublicStores(),
 staleTime: 60_000,
 });

 const store = stores.find((item) => String(item.id) === storeId);

 const {
 data: apiProducts = [],
 isLoading: productsLoading,
 } = useProducts(storeId ? { store_id: storeId, limit: 100 } : undefined);

 const products = mapApiProductsToUiProducts(apiProducts).filter(
 (product) => String(product.storeId || "") === storeId,
 );

 if (storeLoading) {
 return (
 <main className="mx-auto max-w-[1170px] px-4 py-16 sm:px-6">
 <div className="animate-pulse rounded-3xl border border-border bg-card p-8">
 <div className="h-7 w-56 rounded bg-muted" />
 <div className="mt-4 h-4 w-80 max-w-full rounded bg-muted" />
 </div>
 </main>
 );
 }

 if (storeError || !store) {
 return (
 <main className="mx-auto max-w-[1170px] px-4 py-16 text-center sm:px-6">
 <h1 className="text-2xl font-bold text-foreground">Store not found</h1>
 <p className="mt-2 text-muted-foreground">This store is unavailable or is no longer public.</p>
 <Link
 href="/shop-with-sidebar"
 className="mt-6 inline-flex rounded-xl bg-orange px-5 py-3 font-semibold text-white"
 >
 Continue shopping
 </Link>
 </main>
 );
 }

 const banner = store.banner_url ? resolveProductImageUrl(store.banner_url) : null;
 const logo = store.logo_url ? resolveProductImageUrl(store.logo_url) : null;
 const location = [store.region, store.country].filter(Boolean).join(", ");

 return (
 <main className="pb-16">
 <section className="mx-auto max-w-[1170px] px-4 pt-6 sm:px-6 sm:pt-8">
 <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
 <div className="relative h-40 from-orange/15 via-orange/[0.07] to-transparent sm:h-56">
 {banner ? (
 <Image
 src={banner}
 alt={`${store.store_name} banner`}
 fill
 priority
 className="object-cover"
 />
 ) : null}
 <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
 </div>

 <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
 <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
 <div className="flex min-w-0 items-end gap-4">
 <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-card shadow-md sm:h-28 sm:w-28">
 {logo ? (
 <Image src={logo} alt={`${store.store_name} logo`} fill className="object-contain p-2" />
 ) : (
 <span className="text-3xl font-extrabold text-primary">
 {store.store_name.slice(0, 1).toUpperCase()}
 </span>
 )}
 </div>

 <div className="min-w-0 pb-1">
 <div className="flex flex-wrap items-center gap-2">
 <h1 className="break-words text-2xl font-extrabold text-foreground sm:text-3xl">
 {store.store_name}
 </h1>
 {store.is_verified ? (
 <span className="rounded-full bg-green/10 px-2.5 py-1 text-xs font-bold text-green">
 Verified store
 </span>
 ) : null}
 </div>
 <p className="mt-1 text-sm text-muted-foreground">
 {location || (store.store_scope === "global" ? "Global store" : "Local store")}
 </p>
 </div>
 </div>

 <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
 <span className="rounded-full border border-border px-3 py-1.5">
 {store.review_count || 0} reviews
 </span>
 <span className="rounded-full border border-border px-3 py-1.5">
 Rating {Number(store.rating || 0).toFixed(1)}
 </span>
 </div>
 </div>

 {store.description || store.about ? (
 <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
 {store.description || store.about}
 </p>
 ) : null}
 </div>
 </div>
 </section>

 <section className="mx-auto max-w-[1170px] px-4 pt-10 sm:px-6">
 <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Seller store</p>
 <h2 className="mt-1 text-2xl font-extrabold text-foreground">
 Products from {store.store_name}
 </h2>
 </div>
 {!productsLoading ? (
 <span className="text-sm text-muted-foreground">
 {products.length} {products.length === 1 ? "product" : "products"}
 </span>
 ) : null}
 </div>

 {productsLoading ? (
 <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
 {Array.from({ length: 8 }).map((_, index) => (
 <div
 key={index}
 className="aspect-[0.72] animate-pulse rounded-2xl bg-muted"
 />
 ))}
 </div>
 ) : products.length ? (
 <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
 {products.map((product) => (
 <ProductItem key={String(product.id)} item={product} />
 ))}
 </div>
 ) : (
 <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
 <h3 className="font-bold text-foreground">No products available</h3>
 <p className="mt-1 text-sm text-muted-foreground">
 This store does not currently have approved products available for purchase.
 </p>
 </div>
 )}
 </section>
 </main>
 );
};


