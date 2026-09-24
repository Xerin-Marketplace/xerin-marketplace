import type { Category } from "@/types/api/product";
import React from "react";
import Link from "next/link";

const SingleItem = ({ item }: { item: Category }) => {
 return (
 <Link
 href={`/shop-with-sidebar?category_id=${encodeURIComponent(String(item.id))}`}
 className="group flex h-full flex-col items-center rounded-lg border border-border bg-card p-2.5 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
 >
 <div className="relative mb-2 sm:mb-4 h-[70px] w-[70px] sm:h-[110px] sm:w-[110px] lg:h-[132px] lg:w-[132px] shrink-0 overflow-hidden rounded-full bg-muted">
 <div
 aria-hidden="true"
 className="flex h-full w-full items-center justify-center text-2xl font-semibold uppercase text-primary sm:text-4xl"
 >
 {item.name.trim().charAt(0)}
 </div>
 </div>

 <div className="text-center">
 <h3 className="mb-1 sm:mb-2 inline-block text-xs sm:text-sm lg:text-base font-semibold text-foreground transition-colors duration-300 group-hover:text-primary leading-tight">
 {item.name}
 </h3>
 <p className="text-2xs sm:text-sm text-muted-foreground hidden sm:block">
 {item.slug}
 </p>
 </div>

 <span className="mt-2 sm:mt-4 inline-flex items-center rounded-full bg-muted px-2 sm:px-3 py-0.5 sm:py-1 text-2xs sm:text-xs font-medium text-muted-foreground transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary">
 Shop now
 </span>
 </Link>
 );
};

export default SingleItem;
