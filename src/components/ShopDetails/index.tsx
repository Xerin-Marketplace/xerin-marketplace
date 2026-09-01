"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import RecentlyViewdItems from "./RecentlyViewd";
import Newsletter from "../Common/Newsletter";
import StarRating from "@/components/Common/StarRating";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { ROUTES } from "@/constants/links";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useProductDetailsStore } from "@/store/useProductDetailsStore";
import { useAddCartItem, addProductToCartPayload } from "@/hooks/useCartActions";
import type { Product } from "@/types/product";

const CheckIcon = ({ className = "text-orange" }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="m8 12 2.6 2.6L16.5 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrustIcon = ({ type }: { type: "return" | "delivery" | "secure" | "market" }) => {
  if (type === "delivery") {
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 6h11v10H3V6Zm11 4h4l3 3v3h-7v-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.7"/><circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.7"/></svg>;
  }
  if (type === "secure") {
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3 5 6v5c0 4.7 2.9 8.2 7 10 4.1-1.8 7-5.3 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
  if (type === "market") {
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 9h16l-1-5H5L4 9Zm1 0v11h14V9M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>;
  }
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 8h10a5 5 0 0 1 0 10H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="m8 5-3 3 3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
};

const ShopDetails = ({ product }: { product: Product }) => {
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { openPreviewModal } = usePreviewSlider();
  const updatePreviewProduct = useProductDetailsStore((state) => state.updateproductDetails);
  const addCartItem = useAddCartItem();
  const router = useRouter();

  const available = Boolean(product.isActive && product.status === "approved");
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
      return attrs ? `${variant.name} — ${attrs}` : variant.name;
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
      <div className="hidden sm:block"><Breadcrumb title="Product Details" pages={["product details"]} /></div>

      <section className="bg-white pb-8 pt-[92px] dark:bg-darkTheme-bg sm:pb-12 sm:pt-6 lg:pb-16 lg:pt-10">
        <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-6 lg:px-8 xl:px-4">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-9 xl:gap-12">
            {/* Gallery */}
            <div className="min-w-0">
              <div className="relative aspect-[1.03/1] min-h-[310px] overflow-hidden rounded-2xl border border-gray-3 bg-[#eef2f6] shadow-sm dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:min-h-[430px] lg:min-h-[510px]">
                <button
                  type="button"
                  onClick={handlePreviewSlider}
                  aria-label="Open image preview"
                  className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-3 bg-white text-dark shadow-sm transition hover:border-orange hover:text-orange dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-white"
                >
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                {images[previewImg] ? (
                  <Image
                    src={images[previewImg]}
                    alt={product.title}
                    fill
                    className="object-cover object-center transition-transform duration-500 ease-out hover:scale-[1.02]"
                    sizes="(max-width: 640px) 96vw, (max-width: 1024px) 56vw, 610px"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-dark-4">No product image available</div>
                )}
              </div>

              {thumbnails.length > 0 && (
                <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-2 sm:mt-4 sm:gap-3">
                  {thumbnails.map((item, key) => (
                    <button
                      type="button"
                      onClick={() => setPreviewImg(key)}
                      key={`${item}-${key}`}
                      className={`flex h-[70px] w-[70px] shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-[#f5f7fa] p-2 transition sm:h-[86px] sm:w-[86px] ${key === previewImg ? "border-orange shadow-sm" : "border-transparent hover:border-gray-4"}`}
                    >
                      <Image width={76} height={76} src={item} alt={`${product.title} thumbnail ${key + 1}`} className="h-full w-full object-cover object-center" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product content */}
            <div className="min-w-0 lg:pt-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-[26px] font-bold leading-tight text-dark dark:text-white sm:text-3xl lg:text-[34px]">
                    {product.title}
                  </h1>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                    {product.rating != null && product.reviewCount != null ? (
                      <StarRating rating={product.rating} reviewCount={product.reviewCount} size={16} />
                    ) : (
                      <span className="text-dark-4">New marketplace listing</span>
                    )}
                    <span className="hidden h-4 w-px bg-gray-3 sm:block" />
                    <span className={`inline-flex items-center gap-1.5 font-medium ${available ? "text-green" : "text-dark-4"}`}>
                      <CheckIcon className={available ? "text-green" : "text-dark-4"} />
                      {available ? "In Stock" : "Availability not confirmed"}
                    </span>
                  </div>
                </div>
                {discountPercent > 0 && (
                  <span className="shrink-0 rounded-lg bg-orange px-2.5 py-1 text-xs font-bold text-white sm:text-sm">-{discountPercent}%</span>
                )}
              </div>

              <div className="mt-5 border-y border-gray-3 py-4 dark:border-darkTheme-border-color sm:mt-6 sm:py-5">
                <div className="flex flex-wrap items-end gap-2.5">
                  <span className="text-2xl font-bold text-dark dark:text-white sm:text-[30px]">
                    <PriceDisplay amount={product.discountedPrice} sourceCurrency={product.currency} />
                  </span>
                  {discountPercent > 0 && (
                    <span className="pb-1 text-base text-dark-4 line-through">
                      <PriceDisplay amount={product.price} sourceCurrency={product.currency} />
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-dark-4 sm:text-sm">Delivery price is calculated at checkout based on the selected destination.</p>
              </div>

              <div className="mt-5 space-y-2.5 sm:mt-6">
                {product.sku && <div className="flex items-center gap-2 text-sm text-dark dark:text-darkTheme-body-color"><CheckIcon /> <span><strong>SKU:</strong> {product.sku}</span></div>}
                <div className="flex items-center gap-2 text-sm text-dark dark:text-darkTheme-body-color"><CheckIcon /> <span>Buyer protection and order tracking through Xerin Market</span></div>
                {variantHighlights.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-dark dark:text-darkTheme-body-color"><span className="mt-0.5"><CheckIcon /></span><span>{item}</span></div>
                ))}
              </div>

              {product.variants?.length ? (
                <div className="mt-5 sm:mt-6">
                  <p className="mb-2 text-sm font-semibold text-dark dark:text-white">Available options</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <span key={String(variant.id)} className="rounded-lg border border-gray-3 bg-white px-3 py-2 text-xs font-medium text-dark dark:border-darkTheme-border-color dark:bg-darkTheme-card dark:text-white sm:text-sm">
                        {variant.name}{variant.sku ? ` · ${variant.sku}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:mt-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-dark dark:text-white">Qty:</span>
                  <div className="flex h-11 items-center overflow-hidden rounded-lg border border-gray-3 dark:border-darkTheme-border-color">
                    <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-full w-11 items-center justify-center text-lg transition hover:bg-gray-2 hover:text-orange">−</button>
                    <span className="flex h-full w-12 items-center justify-center border-x border-gray-3 text-sm font-semibold dark:border-darkTheme-border-color">{quantity}</span>
                    <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)} className="flex h-full w-11 items-center justify-center text-lg transition hover:bg-gray-2 hover:text-orange">+</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
                  <button
                    type="button"
                    onClick={addToCart}
                    disabled={addCartItem.isPending || !available}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-orange bg-white px-4 text-sm font-bold text-orange transition hover:bg-orange hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[170px] sm:px-7"
                  >
                    {addCartItem.isPending ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    type="button"
                    onClick={buyNow}
                    disabled={addCartItem.isPending || !available}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-orange px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#e95f23] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[170px] sm:px-7"
                  >
                    Buy Now
                  </button>
                  <a href={ROUTES.wishlist} aria-label="Add to wishlist" className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-3 px-4 text-sm font-semibold text-dark transition hover:border-dark dark:border-darkTheme-border-color dark:text-white sm:col-auto sm:w-12 sm:px-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="sm:hidden">Wishlist</span>
                  </a>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-gray-3 bg-[#fbfcfd] dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:grid-cols-4">
                {[
                  { type: "return" as const, title: "Returns", text: "Policy applies" },
                  { type: "delivery" as const, title: "Delivery", text: "Shown at checkout" },
                  { type: "secure" as const, title: "Protection", text: "Secure checkout" },
                  { type: "market" as const, title: "Marketplace", text: "Xerin order tracking" },
                ].map((item, index) => (
                  <div key={item.title} className={`flex min-h-[92px] items-start gap-2.5 p-3.5 text-dark dark:text-white sm:p-4 ${index % 2 === 0 ? "border-r" : ""} ${index < 2 ? "border-b sm:border-b-0" : ""} sm:border-r sm:last:border-r-0 border-gray-3 dark:border-darkTheme-border-color`}>
                    <span className="mt-0.5 text-orange"><TrustIcon type={item.type} /></span>
                    <span><span className="block text-xs font-bold sm:text-sm">{item.title}</span><span className="mt-1 block text-[11px] leading-4 text-dark-4 sm:text-xs">{item.text}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-2 py-8 dark:bg-darkTheme-secondary-bg sm:py-12">
        <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-6 lg:px-8 xl:px-4">
          <div className="rounded-2xl border border-gray-3 bg-white p-5 shadow-sm dark:border-darkTheme-border-color dark:bg-darkTheme-card sm:p-7 lg:p-8">
            <div className="flex items-center gap-3 border-b border-gray-3 pb-4 dark:border-darkTheme-border-color">
              <span className="h-6 w-1 rounded-full bg-orange" />
              <h2 className="text-lg font-bold text-dark dark:text-white sm:text-xl">Product description</h2>
            </div>
            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-dark-4 dark:text-darkTheme-secondary-muted sm:text-base">
              {product.description || "The seller has not provided a product description yet."}
            </p>
          </div>
        </div>
      </section>

      <RecentlyViewdItems />
      <Newsletter />
    </>
  );
};

export default ShopDetails;
