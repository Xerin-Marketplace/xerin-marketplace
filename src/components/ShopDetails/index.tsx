"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StarRating from "@/components/Common/StarRating";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { ROUTES } from "@/constants/links";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useProductDetailsStore } from "@/store/useProductDetailsStore";
import { useAddCartItem, addProductToCartPayload } from "@/hooks/useCartActions";
import { useAddToWishlist } from "@/hooks/useWishlist";
import { useWishlistStore } from "@/store/useWishlistStore";
import type { Product } from "@/types/product";
import ProductSpecifications from "./ProductSpecifications";
import OtherSellerOffersModal, { OtherSellerOffersButton } from "./OtherSellerOffers";
import SellerCard from "./SellerCard";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TruckIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ExpandIcon,
  FavouriteIcon,
  WarehouseIcon,
  SecurityCheckIcon,
  MoneySafeIcon,
  CheckmarkBadge01Icon,
  CustomerService01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-hidden rounded-2xl bg-card shadow-sm ${className}`}>{children}</div>
);

const CardBody = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-3.5 sm:px-5 sm:py-4">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-extrabold text-foreground sm:text-[15px]">{children}</h3>
);

const SpecRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2.5 last:border-0 last:pb-0">
    <span className="text-xs text-muted-foreground sm:text-[13px]">{label}</span>
    <span className="text-right text-xs font-semibold text-foreground sm:text-[13px]">{value}</span>
  </div>
);

const ShopDetails = ({ product }: { product: Product }) => {
  const [previewImg, setPreviewImg] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [quantity, setQuantity] = useState(1);
  const [sellerOffersOpen, setSellerOffersOpen] = useState(false);
  const { openPreviewModal } = usePreviewSlider();
  const updatePreviewProduct = useProductDetailsStore((state) => state.updateproductDetails);
  const addCartItem = useAddCartItem();
  const addToWishlist = useAddToWishlist();
  const addItemToWishlistLocal = useWishlistStore((state) => state.addItemToWishlist);
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
  const reviews = product.reviewCount ?? product.reviews ?? 0;

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
      <section className="bg-muted pb-24 pt-[92px] sm:pb-28 sm:pt-6">
        <div className="mx-auto w-full max-w-[1200px] space-y-2.5 px-2.5 sm:space-y-3 sm:px-4 lg:px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 px-1 pb-1 text-[11px] text-muted-foreground sm:text-xs">
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
            <span className="truncate max-w-[220px] text-foreground/80">{product.title}</span>
          </nav>

          <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-2 lg:items-start">
          {/* Gallery card — left column */}
          <Card className="lg:sticky lg:top-24">
            <div className="relative aspect-square overflow-hidden bg-muted sm:aspect-[4/3] lg:aspect-[16/10]">
              <button
                type="button"
                onClick={handlePreviewSlider}
                aria-label="Open image preview"
                className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-card/95 text-foreground shadow-sm transition hover:text-primary"
              >
                <HugeiconsIcon icon={ExpandIcon} size={17} />
              </button>
              <button
                type="button"
                onClick={() => {
                  addItemToWishlistLocal({
                    ...product,
                    status: "available",
                    quantity: 1,
                  });
                  addToWishlist.mutate(String(product.id));
                }}
                disabled={addToWishlist.isPending}
                aria-label="Add to wishlist"
                className="absolute right-3 top-14 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-card/95 text-foreground shadow-sm transition hover:text-primary disabled:opacity-50"
              >
                <HugeiconsIcon icon={FavouriteIcon} size={16} />
              </button>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setPreviewImg((i) => (i - 1 + images.length) % images.length)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm transition hover:text-primary"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewImg((i) => (i + 1) % images.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm transition hover:text-primary"
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} size={17} />
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
                    sizes="(max-width: 960px) 100vw, 960px"
                    priority
                  />
                </button>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">No product image available</div>
              )}
            </div>

            {thumbnails.length > 1 && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto p-3">
                {thumbnails.map((item, key) => (
                  <button
                    type="button"
                    onClick={() => setPreviewImg(key)}
                    key={`${item}-${key}`}
                    className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-muted transition sm:h-16 sm:w-16 ${key === previewImg ? "border-primary" : "border-transparent hover:border-border"}`}
                  >
                    <Image width={56} height={56} src={item} alt={`${product.title} thumbnail ${key + 1}`} className="h-full w-full object-cover object-center" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Right column — price, variants, protection, delivery */}
          <div className="space-y-2.5 sm:space-y-3">
          {/* Price & title card */}
          <Card>
            <CardBody>
              <div className="flex items-end gap-2">
                {discountPercent > 0 && (
                  <span className="mb-0.5 rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-extrabold text-primary-foreground">
                    -{discountPercent}%
                  </span>
                )}
                <span className="text-[22px] font-extrabold tracking-tight text-primary sm:text-2xl">
                  <PriceDisplay amount={product.discountedPrice} sourceCurrency={product.currency} />
                </span>
                {discountPercent > 0 && (
                  <span className="pb-0.5 text-xs text-muted-foreground line-through sm:text-sm">
                    <PriceDisplay amount={product.price} sourceCurrency={product.currency} />
                  </span>
                )}
                <span className={`ml-auto pb-0.5 text-[11px] font-medium sm:text-xs ${available ? "text-green-dark" : "text-muted-foreground"}`}>
                  {available ? "In stock" : "Unavailable"}
                </span>
              </div>

              <h1 className="mt-2 break-words text-[15px] font-semibold leading-snug text-foreground sm:text-base">
                {product.title}
              </h1>

              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
                {product.rating != null && reviews > 0 ? (
                  <>
                    <HugeiconsIcon icon={StarIcon} size={13} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-foreground/80">{Number(product.rating).toFixed(1)}</span>
                    <span>({reviews} review{reviews === 1 ? "" : "s"})</span>
                  </>
                ) : (
                  <span>New listing</span>
                )}
                {product.categoryName && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-medium">
                    {product.categoryName}
                  </span>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Variants card */}
          {product.variants?.length ? (
            <Card>
              <CardBody>
                <CardTitle>Available options</CardTitle>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const attrs = variant.attributes && typeof variant.attributes === "object"
                      ? Object.entries(variant.attributes).slice(0, 2).map(([k, v]) => `${k}: ${String(v)}`).join(" · ")
                      : "";
                    return (
                      <span key={String(variant.id)} className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
                        {variant.name}{attrs ? ` · ${attrs}` : ""}
                      </span>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          ) : null}

          {/* Order protection card */}
          <Card>
            <CardBody>
              <CardTitle>Order protection</CardTitle>
              <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
                Every payment on Xerin Marketplace is protected
              </p>
              <div className="mt-3 grid grid-cols-4 gap-1">
                {[
                  { icon: SecurityCheckIcon, label: "Secure payments" },
                  { icon: MoneySafeIcon, label: "Buyer protection" },
                  { icon: CheckmarkBadge01Icon, label: "Verified sellers" },
                  { icon: CustomerService01Icon, label: "24/7 support" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1.5 text-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-light-6 text-green-dark">
                      <HugeiconsIcon icon={item.icon} size={17} />
                    </span>
                    <span className="text-[10px] font-medium leading-tight text-foreground/75 sm:text-[11px]">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Delivery card */}
          <Card>
            <CardBody>
              <CardTitle>Delivery</CardTitle>
              <div className="mt-2.5 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-primary"><HugeiconsIcon icon={TruckIcon} size={16} /></span>
                  <p className="text-xs leading-5 text-foreground/80">
                    Shipping fee and delivery date are calculated at checkout based on your address and chosen courier.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-muted-foreground"><HugeiconsIcon icon={WarehouseIcon} size={16} /></span>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Ships from the seller&apos;s store — tracking available from preparation to your doorstep.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
          </div>
          </div>

          {/* Key attributes card — full width */}
          <Card>
            <CardBody>
              <CardTitle>Key attributes</CardTitle>
              <div className="mt-1.5">
                <SpecRow label="SKU" value={product.sku || "N/A"} />
                <SpecRow label="Category" value={product.categoryName || "N/A"} />
                {product.brandName ? <SpecRow label="Brand" value={product.brandName} /> : null}
                <SpecRow label="Availability" value={available ? "In stock" : "Not confirmed"} />
              </div>
            </CardBody>
          </Card>

          {/* Seller card */}
          {product.sellerId ? (
            <Card className="p-0">
              <SellerCard sellerId={product.sellerId} />
            </Card>
          ) : null}

          {/* Other sellers */}
          <div className="px-1">
            <OtherSellerOffersButton
              productId={String(product.id)}
              onOpen={() => setSellerOffersOpen(true)}
            />
          </div>

          {/* Description card */}
          <Card>
            <CardBody>
              <CardTitle>Description</CardTitle>
              <p className="mt-2 whitespace-pre-line text-xs leading-6 text-foreground/70 sm:text-[13px] sm:leading-6">
                {product.description || "The seller has not provided a product description yet."}
              </p>
            </CardBody>
          </Card>

          {/* Full specifications */}
          <ProductSpecifications productId={product.id} embedded />
        </div>
      </section>

      {/* Sticky bottom action bar — mobile parity */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-3 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex w-full max-w-[960px] items-center gap-2.5">
          <div className="hidden h-11 shrink-0 items-center overflow-hidden rounded-lg border border-border bg-background sm:flex">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((v) => Math.max(1, v - 1))} className="flex h-full w-10 items-center justify-center text-lg transition hover:bg-muted hover:text-primary">−</button>
            <span className="flex h-full w-10 items-center justify-center border-x border-border text-sm font-semibold">{quantity}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((v) => v + 1)} className="flex h-full w-10 items-center justify-center text-lg transition hover:bg-muted hover:text-primary">+</button>
          </div>
          <button
            type="button"
            onClick={addToCart}
            disabled={addCartItem.isPending || !available}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border-2 border-primary bg-card text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {complianceUnavailable ? "Unavailable" : addCartItem.isPending ? "Adding..." : "Add to Cart"}
          </button>
          <button
            type="button"
            onClick={buyNow}
            disabled={addCartItem.isPending || !available}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {complianceUnavailable ? "Unavailable" : `Buy Now${quantity > 1 ? ` ×${quantity}` : ""}`}
          </button>
        </div>
      </div>

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
