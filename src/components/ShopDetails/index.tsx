"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StarRating from "@/components/Common/StarRating";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { ROUTES } from "@/constants/links";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useProductDetailsStore } from "@/store/useProductDetailsStore";
import { useAddCartItem, addProductToCartPayload } from "@/hooks/useCartActions";
import type { Product } from "@/types/product";
import ProductSpecifications from "./ProductSpecifications";
import OtherSellerOffersModal, { OtherSellerOffersButton } from "./OtherSellerOffers";
import SellerCard from "./SellerCard";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckIcon, TruckIcon, ShieldCheckIcon, Store01Icon, RotateLeft01Icon, ExpandIcon, FavouriteIcon, File01Icon, ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import InfoPopover from "@/components/Common/Info/InfoPopover";

const SpecCheckIcon = ({ className = "text-primary" }: { className?: string }) => (
 <HugeiconsIcon icon={CheckIcon} size={18} />
);

const TrustIcon = ({ type }: { type: "return" | "delivery" | "secure" | "market" }) => {
 if (type === "delivery") {
 return <HugeiconsIcon icon={TruckIcon} size={22} />;
 }
 if (type === "secure") {
 return <HugeiconsIcon icon={ShieldCheckIcon} size={22} />;
 }
 if (type === "market") {
 return <HugeiconsIcon icon={Store01Icon} size={22} />;
 }
 return <HugeiconsIcon icon={RotateLeft01Icon} size={22} />;
};

const ShopDetails = ({ product }: { product: Product }) => {
 const [previewImg, setPreviewImg] = useState(0);
 const [zooming, setZooming] = useState(false);
 const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
 const [quantity, setQuantity] = useState(1);
 const [sellerOffersOpen, setSellerOffersOpen] = useState(false);
 const { openPreviewModal } = usePreviewSlider();
 const updatePreviewProduct = useProductDetailsStore((state) => state.updateproductDetails);
 const addCartItem = useAddCartItem();
 const router = useRouter();

 const complianceUnavailable =
 product.marketplaceAvailable === false ||
 product.sellerComplianceStatus === "suspended";
 const available = Boolean(
 product.isActive &&
 product.status === "approved" &&
 !complianceUnavailable,
 );
 const discountPercent = product.price > product.discountedPrice
 ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
 : 0;
 const images = product.imgs?.previews?.length ? product.imgs.previews : product.imgs?.thumbnails || [];
 const thumbnails = product.imgs?.thumbnails?.length ? product.imgs.thumbnails : images;

 const variantHighlights = useMemo(() => {
 if (!product.variants?.length) return [];
 return product.variants.slice(0, 5).map((variant) => {
 const attrs = variant.attributes && typeof variant.attributes === "object"
 ? Object.entries(variant.attributes).slice(0, 2).map(([key, value]) => `${key}: ${String(value)}`).join(" · ")
 : "";
 return attrs ? `${variant.name} · ${attrs}` : variant.name;
 });
 }, [product.variants]);

 const handlePreviewSlider = () => {
 updatePreviewProduct(product);
 openPreviewModal();
 };

 const addToCart = () => addCartItem.mutate(addProductToCartPayload(product, quantity));
 const buyNow = () => addCartItem.mutate(addProductToCartPayload(product, quantity), {
 onSuccess: () => router.push("/checkout"),
 });

 if (!product.title) return <div className="py-20 text-center">Please add product</div>;

 return (
 <>
 <section className="bg-background pb-8 pt-[92px] sm:pb-12 sm:pt-6 lg:pb-16 lg:pt-10">
 <div className="mx-auto w-full max-w-[1360px] px-3 sm:px-6 lg:px-8">
 <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:mb-5 sm:text-sm">
 <Link href="/" className="transition hover:text-primary">Home</Link>
 <span>/</span>
 {product.categorySlug ? (
 <Link href={`/category/${product.categorySlug}`} className="transition hover:text-primary">
 {product.categoryName || "Category"}
 </Link>
 ) : (
 <Link href="/shop-with-sidebar" className="transition hover:text-primary">Shop</Link>
 )}
 <span>/</span>
 <span className="truncate max-w-[240px] text-foreground/80 sm:max-w-none sm:whitespace-normal">{product.title}</span>
 </nav>
 <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)_290px] lg:gap-6 xl:gap-8">
 {/* Gallery — vertical thumbs + main image + seller card (Alibaba layout) */}
 <div className="min-w-0">
 <div className="flex gap-3">
 {thumbnails.length > 1 && (
 <div className="no-scrollbar hidden max-h-[420px] w-[68px] shrink-0 flex-col gap-2 overflow-y-auto sm:flex">
 {thumbnails.map((item, key) => (
 <button
 type="button"
 onClick={() => setPreviewImg(key)}
 key={`${item}-${key}`}
 className={`flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-muted transition ${key === previewImg ? "border-primary shadow-sm" : "border-transparent hover:border-border"}`}
 >
 <Image width={56} height={56} src={item} alt={`${product.title} thumbnail ${key + 1}`} className="h-full w-full object-cover object-center" />
 </button>
 ))}
 </div>
 )}

 <div className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
 <button
 type="button"
 onClick={handlePreviewSlider}
 aria-label="Open image preview"
 className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition hover:border-primary hover:text-primary"
 >
 <HugeiconsIcon icon={ExpandIcon} size={21} />
 </button>

 {images.length > 1 && (
 <>
 <button
 type="button"
 onClick={() => setPreviewImg((i) => (i - 1 + images.length) % images.length)}
 aria-label="Previous image"
 className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-sm transition hover:border-primary hover:text-primary"
 >
 <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
 </button>
 <button
 type="button"
 onClick={() => setPreviewImg((i) => (i + 1) % images.length)}
 aria-label="Next image"
 className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-sm transition hover:border-primary hover:text-primary"
 >
 <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
 </button>
 <span className="absolute bottom-3 right-3 z-20 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
 {previewImg + 1} / {images.length}
 </span>
 </>
 )}

 {images[previewImg] ? (
 <button
 type="button"
 onClick={handlePreviewSlider}
 onMouseMove={(e) => {
 const rect = e.currentTarget.getBoundingClientRect();
 setZoomOrigin({
 x: ((e.clientX - rect.left) / rect.width) * 100,
 y: ((e.clientY - rect.top) / rect.height) * 100,
 });
 }}
 onMouseEnter={() => setZooming(true)}
 onMouseLeave={() => setZooming(false)}
 aria-label="Zoom product image"
 className="absolute inset-0 block h-full w-full cursor-zoom-in"
 >
 <Image
 src={images[previewImg]}
 alt={product.title}
 fill
 className="object-cover object-center transition-transform duration-200 ease-out"
 style={zooming ? { transform: "scale(2)", transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` } : undefined}
 sizes="(max-width: 640px) 96vw, (max-width: 1024px) 56vw, 610px"
 priority
 />
 <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">
 Hover to zoom · click to expand
 </span>
 </button>
 ) : (
 <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">No product image available</div>
 )}
 </div>
 </div>

 {thumbnails.length > 1 && (
 <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 sm:hidden">
 {thumbnails.map((item, key) => (
 <button
 type="button"
 onClick={() => setPreviewImg(key)}
 key={`${item}-${key}`}
 className={`flex h-[62px] w-[62px] shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-muted transition ${key === previewImg ? "border-primary shadow-sm" : "border-transparent hover:border-border"}`}
 >
 <Image width={56} height={56} src={item} alt={`${product.title} thumbnail ${key + 1}`} className="h-full w-full object-cover object-center" />
 </button>
 ))}
 </div>
 )}

 {/* Supplier card under gallery — Alibaba style */}
 {product.sellerId ? (
 <div className="mt-4">
 <SellerCard sellerId={product.sellerId} />
 </div>
 ) : null}
 </div>

 {/* Product content */}
 <div className="min-w-0 lg:pt-1">
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <h1 className="break-words text-[24px] font-bold leading-tight text-foreground sm:text-3xl lg:text-[34px]">
 {product.title}
 </h1>
 <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
 {product.rating != null && product.reviewCount != null ? (
 <StarRating rating={product.rating} reviewCount={product.reviewCount} size={16} />
 ) : (
 <span className="text-muted-foreground">New listing</span>
 )}
 <span className="hidden h-4 w-px bg-border sm:block" />
 <span className={`inline-flex items-center gap-1.5 font-medium ${available ? "text-green-dark" : "text-muted-foreground"}`}>
 <SpecCheckIcon className={available ? "text-green-dark" : "text-muted-foreground"} />
 {available ? "In Stock" : "Availability not confirmed"}
 </span>
 </div>
 </div>
 {discountPercent > 0 && (
 <span className="shrink-0 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground sm:text-sm">-{discountPercent}%</span>
 )}
 </div>

 <div className="mt-5 border-y border-border py-4 sm:mt-6 sm:py-5">
 <div className="flex min-w-0 flex-wrap items-end gap-2.5">
 <span className="min-w-0 break-words text-2xl font-bold text-foreground sm:text-[30px]">
 <PriceDisplay amount={product.discountedPrice} sourceCurrency={product.currency} />
 </span>
 {discountPercent > 0 && (
 <span className="pb-1 text-base text-muted-foreground line-through">
 <PriceDisplay amount={product.price} sourceCurrency={product.currency} />
 </span>
 )}
 </div>
 <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">Delivery price is calculated at checkout based on the selected destination.</p>
 </div>

 <div className="mt-5 sm:mt-6">
 <div className="min-w-0">
 <div className="space-y-2.5">
 {product.sku && <div className="flex items-center gap-2 text-sm text-foreground"><SpecCheckIcon /> <span><strong>SKU:</strong> {product.sku}</span></div>}
 <div className="flex items-center gap-2 text-sm text-foreground"><SpecCheckIcon /> <span className="inline-flex items-center gap-1.5">Buyer protection and order tracking through Xerin Marketplace<InfoPopover title="Buyer protection"><p>Your payment is held safely and only released to the seller after you confirm delivery.</p><p>If the item never arrives or is not as described, open a dispute from your order and our team will review it.</p></InfoPopover></span></div>
 {variantHighlights.map((item) => (
 <div key={item} className="flex items-start gap-2 text-sm text-foreground"><span className="mt-0.5"><SpecCheckIcon /></span><span>{item}</span></div>
 ))}
 </div>

 {product.variants?.length ? (
 <div className="mt-5">
 <p className="mb-2 text-sm font-semibold text-foreground">Available options</p>
 <div className="flex flex-wrap gap-2">
 {product.variants.map((variant) => (
 <span key={String(variant.id)} className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground sm:text-sm">
 {variant.name}{variant.sku ? ` · ${variant.sku}` : ""}
 </span>
 ))}
 </div>
 </div>
 ) : null}

 <div className="mt-6 rounded-2xl border border-border bg-muted p-3.5 sm:border-0 sm:bg-transparent sm:p-0 sm:dark:bg-transparent">
 <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
 <span className="shrink-0 text-sm font-semibold text-foreground">Qty:</span>
 <div className="flex h-11 shrink-0 items-center overflow-hidden rounded-lg border border-border bg-card">
 <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-full w-11 items-center justify-center text-lg transition hover:bg-muted hover:text-primary">−</button>
 <span className="flex h-full w-12 items-center justify-center border-x border-border text-sm font-semibold">{quantity}</span>
 <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)} className="flex h-full w-11 items-center justify-center text-lg transition hover:bg-muted hover:text-primary">+</button>
 </div>
 </div>

 {complianceUnavailable && (
 <div className="mt-4 rounded-2xl border border-yellow-light-2 bg-yellow-light-4 px-4 py-3 text-yellow-dark-2">
 <p className="text-sm font-bold">Temporarily unavailable</p>
 <p className="mt-1 text-xs leading-5">
 This seller cannot accept new sales while their business licence is under renewal. You can keep browsing or choose another seller offer.
 </p>
 </div>
 )}

 <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_48px] sm:gap-3">
 <button
 type="button"
 onClick={addToCart}
 disabled={addCartItem.isPending || !available}
 className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border-2 border-primary bg-card px-4 text-center text-sm font-bold leading-5 text-primary transition hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
 >
 {complianceUnavailable ? "Unavailable" : addCartItem.isPending ? "Adding..." : "Add to Cart"}
 </button>
 <button
 type="button"
 onClick={buyNow}
 disabled={addCartItem.isPending || !available}
 className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-4 text-center text-sm font-bold leading-5 text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
 >
 {complianceUnavailable ? "Unavailable" : "Buy Now"}
 </button>
 <a href={ROUTES.wishlist} aria-label="Add to wishlist" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary hover:text-primary sm:w-12 sm:px-0">
 <HugeiconsIcon icon={FavouriteIcon} size={20} />
 <span className="sm:hidden">Wishlist</span>
 </a>
 </div>
 </div>
 </div>

 </div>
 </div>

 {/* Right column — shipping + order protection (Alibaba style) */}
 <aside className="min-w-0 space-y-4 lg:pt-1">
 <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
 <h3 className="text-sm font-bold text-foreground">Shipping</h3>
 <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
 Shipping fee and delivery date are calculated at checkout based on your delivery address and chosen courier.
 </p>
 </div>

 <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
 <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
 Xerin order protection
 <InfoPopover title="Order protection">
 <p>Your payment is held safely and only released to the seller after you confirm delivery.</p>
 <p>If the item never arrives or is not as described, open a dispute from your order and our team will review it.</p>
 </InfoPopover>
 </h3>
 <div className="mt-3 space-y-3.5">
 <div className="flex items-start gap-3">
 <span className="mt-0.5 shrink-0 text-green-dark"><HugeiconsIcon icon={ShieldCheckIcon} size={18} /></span>
 <div>
 <p className="text-[13px] font-semibold text-foreground">Secure payments</p>
 <p className="mt-0.5 text-xs leading-5 text-muted-foreground">Every payment on Xerin Marketplace is processed over encrypted, PCI-compliant channels.</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <span className="mt-0.5 shrink-0 text-green-dark"><HugeiconsIcon icon={RotateLeft01Icon} size={18} /></span>
 <div>
 <p className="text-[13px] font-semibold text-foreground">Money-back protection</p>
 <p className="mt-0.5 text-xs leading-5 text-muted-foreground">Claim a refund if your order doesn&apos;t ship or arrives with product issues.</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <span className="mt-0.5 shrink-0 text-green-dark"><HugeiconsIcon icon={TruckIcon} size={18} /></span>
 <div>
 <p className="text-[13px] font-semibold text-foreground">Delivery tracking</p>
 <p className="mt-0.5 text-xs leading-5 text-muted-foreground">Follow your order from seller preparation to your doorstep.</p>
 </div>
 </div>
 </div>
 </div>

 <OtherSellerOffersButton
 productId={String(product.id)}
 onOpen={() => setSellerOffersOpen(true)}
 />
 </aside>

 <div className="min-w-0 lg:col-span-3">
 <ProductSpecifications productId={product.id} variant="overview" overviewLimit={6} />
 </div>
 </div>

 <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-muted sm:grid-cols-4">
 {[
 { type: "return" as const, title: "Returns", text: "Buyer protection applies" },
 { type: "delivery" as const, title: "Delivery", text: "Shown at checkout" },
 { type: "secure" as const, title: "Protection", text: "Secure checkout" },
 { type: "market" as const, title: "Tracking", text: "Order tracking included" },
 ].map((item, index) => (
 <div key={item.title} className={`flex min-h-[92px] items-start gap-2.5 p-3.5 text-foreground sm:p-4 ${index % 2 === 0 ? "border-r" : ""} ${index < 2 ? "border-b sm:border-b-0" : ""} sm:border-r sm:last:border-r-0 border-border`}>
 <span className="mt-0.5 text-primary"><TrustIcon type={item.type} /></span>
 <span><span className="block text-xs font-bold sm:text-sm">{item.title}</span><span className="mt-1 block text-[11px] leading-4 text-muted-foreground sm:text-xs">{item.text}</span></span>
 </div>
 ))}
 </div>
 </div>
 </section>

 <section className="relative overflow-hidden border-y border-border bg-muted py-10 sm:py-14">

 <div className="relative mx-auto w-full max-w-[1280px] px-3 sm:px-6 lg:px-8 xl:px-4">
 <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
 <div>
 <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
 <span className="h-1.5 w-1.5 rounded-full bg-primary" />
 Product information
 </div>
 <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
 Everything you need to know
 </h2>
 <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
 Review the seller&apos;s description together with structured product specifications before you buy.
 </p>
 </div>
 <span className="hidden rounded-2xl border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm sm:inline-flex">
 Verified listing details
 </span>
 </div>

 <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-6">
 <article className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7">
 <div className="relative">
 <div className="flex items-center gap-3 border-b border-border pb-4">
 <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
 <HugeiconsIcon icon={File01Icon} size={22} />
 </span>
 <div>
 <h3 className="text-lg font-extrabold text-foreground sm:text-xl">Product description</h3>
 <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">Seller-provided overview and important product notes.</p>
 </div>
 </div>

 <p className="mt-5 whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-[15px] sm:leading-8">
 {product.description || "The seller has not provided a product description yet."}
 </p>

 <div className="mt-6 flex flex-wrap gap-2">
 <span className="inline-flex items-center gap-1.5 rounded-full bg-green-light-6 px-3 py-1.5 text-[11px] font-semibold text-green-dark">
 <SpecCheckIcon className="text-green-dark" /> Approved listing
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary">
 Xerin buyer protection
 </span>
 </div>
 </div>
 </article>

 <ProductSpecifications productId={product.id} embedded />
 </div>
 </div>
 </section>

 <OtherSellerOffersModal
 productId={String(product.id)}
 productName={product.title}
 open={sellerOffersOpen}
 onClose={() => setSellerOffersOpen(false)}
 />
 </>
 );
};

export default ShopDetails;
