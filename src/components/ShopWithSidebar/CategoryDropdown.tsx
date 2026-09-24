"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { UiCategoryFilter } from "@/lib/products/adapters";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, CheckIcon } from "@hugeicons/core-free-icons";

const CategoryItem = ({
 category,
 selected,
}: {
 category: UiCategoryFilter;
 selected: boolean;
}) => {
 return (
 <Link
 href={`/shop-with-sidebar?category_id=${encodeURIComponent(String(category.id))}`}
 className={`${
 selected && "text-primary"
 } group flex items-center justify-between ease-out duration-200 hover:text-primary `}
 >
 <div className="flex items-center gap-2">
 <div
 className={`cursor-pointer flex items-center justify-center rounded w-4 h-4 border ${
 selected ? "border-primary bg-blue" : "bg-card border-border"
 }`}
 >
 <HugeiconsIcon icon={CheckIcon} size={12} />
 </div>

 <span>{category.name}</span>
 </div>

 </Link>
 );
};

const CategoryDropdown = ({
 categories,
}: {
 categories: UiCategoryFilter[];
}) => {
 const [toggleDropdown, setToggleDropdown] = useState(true);
 const selectedCategoryId = useSearchParams().get("category_id");

 return (
 <div className="bg-card shadow-1 rounded-lg">
 <div
 onClick={(e) => {
 e.preventDefault();
 setToggleDropdown(!toggleDropdown);
 }}
 className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
 toggleDropdown && "shadow-filter"
 }`}
 >
 <p className="text-foreground">Category</p>
 <button
 aria-label="button for category dropdown"
 className={`text-foreground ease-out duration-200 ${
 toggleDropdown && "rotate-180"
 }`}
 >
 <HugeiconsIcon icon={ArrowDown01Icon} size={12} />
 </button>
 </div>

 {/* dropdown && 'shadow-filter */}
 {/* <!-- dropdown menu --> */}
 <div
 className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${
 toggleDropdown ? "flex" : "hidden"
 }`}
 >
 {categories.length === 0 ? (
 <p className="text-sm text-muted-foreground">No categories available.</p>
 ) : (
 categories.map((category) => (
 <CategoryItem
 key={String(category.id)}
 category={category}
 selected={String(category.id) === selectedCategoryId}
 />
 ))
 )}
 </div>
 </div>
 );
};

export default CategoryDropdown;
