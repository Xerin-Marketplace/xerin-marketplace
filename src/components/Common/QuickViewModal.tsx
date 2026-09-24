"use client";
import React, { useEffect, useState } from "react";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { useQuickViewStore } from "@/store/useQuickViewStore";
import { useProductDetailsStore } from "@/store/useProductDetailsStore";
import { useAddCartItem, addProductToCartPayload } from "@/hooks/useCartActions";
import { useAddToWishlist } from "@/hooks/useWishlist";
import { useWishlistStore } from "@/store/useWishlistStore";
import StarRating from "@/components/Common/StarRating";
import Image from "next/image";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon, ArrowRight01Icon, CheckmarkCircle02Icon, PlusSignIcon, MinusSignIcon, Cancel01Icon } from "@hugeicons/core-free-icons";

const QuickViewModal = () => {
 const { isModalOpen, closeModal } = useModalContext();
 const { openPreviewModal } = usePreviewSlider();
 const [quantity, setQuantity] = useState(1);

 const addCartItem = useAddCartItem();
 const addToWishlist = useAddToWishlist();
 const addItemToWishlistLocal = useWishlistStore((state) => state.addItemToWishlist);
 const updateproductDetails = useProductDetailsStore((state) => state.updateproductDetails);
 const product = useQuickViewStore((state) => state.value);

 const [activePreview, setActivePreview] = useState(0);

 // preview modal
 const handlePreviewSlider = () => {
 updateproductDetails(product);

 openPreviewModal();
 };

 // add to cart
 const handleAddToCart = () => {
 addCartItem.mutate(addProductToCartPayload(product, quantity), {
 onSuccess: () => closeModal(),
 });
 };

 const handleAddToWishlist = () => {
 addItemToWishlistLocal({
 ...product,
 status: "available",
 quantity: 1,
 });
 addToWishlist.mutate(String(product.id), {
 onSuccess: () => closeModal(),
 });
 };

 useEffect(() => {
 // closing modal while clicking outside
 function handleClickOutside(event) {
 if (!event.target.closest(".modal-content")) {
 closeModal();
 }
 }

 if (isModalOpen) {
 document.addEventListener("mousedown", handleClickOutside);
 }

 return () => {
 document.removeEventListener("mousedown", handleClickOutside);

 setQuantity(1);
 };
 }, [isModalOpen, closeModal]);

 return (
 <div
 className={`${isModalOpen ? "z-99999" : "hidden"
 } fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[230px] bg-black/70 sm:px-8 px-4 py-5`}
 >
 <div className="flex items-center justify-center">
 <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-card p-7.5 relative modal-content">
 <button
 onClick={() => closeModal()}
 aria-label="button for close modal"
 className="absolute top-0 right-0 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-foreground"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={22} />
 </button>

 <div className="flex flex-wrap items-center gap-12.5">
 <div className="max-w-[526px] w-full">
 <div className="flex gap-5">
 <div className="flex flex-col gap-5">
 {product.imgs.thumbnails?.map((img, key) => (
 <button
 onClick={() => setActivePreview(key)}
 key={key}
 className={`flex items-center justify-center w-20 h-20 overflow-hidden rounded-lg bg-muted ease-out duration-200 hover:border-2 hover:border-primary ${activePreview === key && "border-2 border-primary"
 }`}
 >
 <Image
 src={img || ""}
 alt="thumbnail"
 width={61}
 height={61}
 className="aspect-square"
 />
 </button>
 ))}
 </div>

 <div className="relative z-1 overflow-hidden flex items-center justify-center w-full sm:min-h-[508px] bg-muted rounded-lg border border-border">
 <div>
 <button
 onClick={handlePreviewSlider}
 aria-label="button for zoom"
 className="gallery__Image w-10 h-10 rounded-md bg-card shadow-1 flex items-center justify-center ease-out duration-200 text-foreground hover:text-primary absolute top-4 lg:top-8 right-4 lg:right-8 z-50"
 >
 <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} />
 </button>

 {product?.imgs?.previews?.[activePreview] && (
 <Image
 src={product.imgs.previews[activePreview]}
 alt="products-details"
 width={400}
 height={400}
 />
 )}
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-[445px] w-full">
 {product.price > product.discountedPrice && (
 <span className="inline-block text-custom-xs font-medium text-white py-1 px-3 bg-green mb-6.5">
 SALE {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
 </span>
 )}

 <h3 className="font-semibold text-xl xl:text-heading-5 text-foreground mb-4">
 {product.title}
 </h3>

 <div className="flex flex-wrap items-center gap-5 mb-6">
 <div className="flex items-center gap-1.5">
 {product.rating != null && product.reviewCount != null ? (
 <>
 <StarRating rating={product.rating} reviewCount={product.reviewCount} size={18} />
 <span>
 <span className="font-medium text-foreground">{product.rating} Rating</span>
 <span className="text-foreground"> ({product.reviewCount} reviews)</span>
 </span>
 </>
 ) : null}
 </div>

 <div className="flex items-center gap-2">
 <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />

 <span className="font-medium text-foreground">
 {product.isActive && product.status === "approved" ? "Available" : "Availability not confirmed"}
 </span>
 </div>
 </div>

 <p>
 This product is available from a Xerin Market seller. Review price,
 availability, and delivery options before adding it to cart.
 </p>

 <div className="flex flex-wrap justify-between gap-5 mt-6 mb-7.5">
 <div>
 <h4 className="font-semibold text-lg text-foreground mb-3.5">
 Price
 </h4>

 <span className="flex items-center gap-2">
 <PriceDisplay
 amount={product.discountedPrice}
 sourceCurrency={product.currency}
 className="font-semibold text-foreground text-xl xl:text-heading-4"
 />
 {product.price > product.discountedPrice ? (
 <PriceDisplay
 amount={product.price}
 sourceCurrency={product.currency}
 className="font-medium text-muted-foreground text-lg xl:text-2xl line-through"
 />
 ) : null}
 </span>
 </div>

 <div>
 <h4 className="font-semibold text-lg text-foreground mb-3.5">
 Quantity
 </h4>

 <div className="flex items-center gap-3">
 <button
 onClick={() => quantity > 1 && setQuantity(quantity - 1)}
 aria-label="button for remove product"
 className="flex items-center justify-center w-10 h-10 rounded-md bg-muted text-foreground ease-out duration-200 hover:text-primary"
 disabled={quantity < 0 && true}
 >
 <HugeiconsIcon icon={PlusSignIcon} size={16} />
 </button>

 <span
 className="flex items-center justify-center w-20 h-10 rounded-md border border-border bg-card font-medium text-foreground"
 x-text="quantity"
 >
 {quantity}
 </span>

 <button
 onClick={() => setQuantity(quantity + 1)}
 aria-label="button for add product"
 className="flex items-center justify-center w-10 h-10 rounded-md bg-muted text-foreground ease-out duration-200 hover:text-primary"
 >
 <HugeiconsIcon icon={MinusSignIcon} size={16} />
 </button>
 </div>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-4">
 <button
 disabled={quantity === 0 && true || addCartItem.isPending}
 onClick={() => handleAddToCart()}
 className={`inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-primary-dark disabled:opacity-50
 `}
 >
 {addCartItem.isPending ? "Adding..." : "Add to Cart"}
 </button>

 <button
 type="button"
 onClick={handleAddToWishlist}
 disabled={addToWishlist.isPending}
 className={`inline-flex items-center gap-2 font-medium text-background bg-foreground py-3 px-6 rounded-md ease-out duration-200 hover:bg-opacity-95 disabled:opacity-50 `}
 >
 <HugeiconsIcon icon={FavouriteIcon} size={18} />
 {addToWishlist.isPending ? "Adding..." : "Add to Wishlist"}
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default QuickViewModal;
