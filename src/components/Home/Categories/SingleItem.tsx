import type { PopularCategory } from "@/types/api/product";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api/endpoints";
import { productsApi } from "@/lib/api/endpoints/products";

const resolveImageUrl = (imageUrl: string | null) => {
  if (!imageUrl) return "/images/products/placeholder.svg";
  if (/^(https?:|data:|blob:)/.test(imageUrl)) return imageUrl;
  return `${API_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

const SingleItem = ({ item }: { item: PopularCategory }) => {
  return (
    <Link
      href={`/shop-with-sidebar?category_id=${encodeURIComponent(String(item.id))}`}
      onClick={() => {
        void productsApi.trackCategoryEngagement(item.id).catch(() => undefined);
      }}
      className="group flex h-full flex-col items-center rounded-xl border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-card p-2.5 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative mb-2 sm:mb-4 h-[70px] w-[70px] sm:h-[110px] sm:w-[110px] lg:h-[132px] lg:w-[132px] shrink-0 overflow-hidden rounded-full bg-[#F2F3F8] dark:bg-darkTheme-secondary-bg">
        <Image
          src={resolveImageUrl(item.image_url)}
          alt={item.name}
          fill
          quality={90}
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 639px) 70px, (max-width: 1023px) 110px, 132px"
        />
      </div>

      <div className="text-center">
        <h3 className="mb-1 sm:mb-2 inline-block text-xs sm:text-sm lg:text-base font-semibold text-dark dark:text-white transition-colors duration-300 group-hover:text-blue leading-tight">
          {item.name}
        </h3>
        <p className="text-2xs sm:text-sm text-dark-4 dark:text-darkTheme-secondary-muted hidden sm:block">
          {item.product_count} {item.product_count === 1 ? "product" : "products"}
        </p>
      </div>

      <span className="mt-2 sm:mt-4 inline-flex items-center rounded-full bg-gray-1 dark:bg-darkTheme-secondary-bg px-2 sm:px-3 py-0.5 sm:py-1 text-2xs sm:text-xs font-medium text-dark-4 dark:text-darkTheme-secondary-muted transition-colors duration-300 group-hover:bg-blue/10 group-hover:text-blue">
        Shop now
      </span>
    </Link>
  );
};

export default SingleItem;
