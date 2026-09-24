"use client";

import React, { FormEvent, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";
import CurrencySelector from "./CurrencySelector";
import { HugeiconsIcon } from "@hugeicons/react";
import { GridIcon, Search01Icon, Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";

interface MobileStorefrontHeaderProps {
 onToggleCategories: () => void;
 onToggleMenu: () => void;
 isMenuOpen: boolean;
 isCategoriesOpen: boolean;
 isAuthenticated: boolean;
 accountHref: string;
 accountLabel: string;
}

export default function MobileStorefrontHeader({
 onToggleCategories,
 onToggleMenu,
 isMenuOpen,
 isCategoriesOpen,
 isAuthenticated,
 accountHref,
 accountLabel,
}: MobileStorefrontHeaderProps) {
 const router = useRouter();
 const [query, setQuery] = useState("");
 const [isSearchOpen, setIsSearchOpen] = useState(false);
 const inputRef = useRef<HTMLInputElement>(null);

 // Auto focus input when modal opens
 useEffect(() => {
 if (isSearchOpen) {
 setTimeout(() => {
 inputRef.current?.focus();
 }, 100);
 }
 }, [isSearchOpen]);

 const submitSearch = (event: FormEvent<HTMLFormElement>) => {
 event.preventDefault();
 const value = query.trim();
 setIsSearchOpen(false);
 if (value) {
 router.push(`/search?q=${encodeURIComponent(value)}`);
 } else {
 router.push("/search");
 }
 };

 const handleQuickSearch = (term: string) => {
 setIsSearchOpen(false);
 router.push(`/search?q=${encodeURIComponent(term)}`);
 };

 return (
 <>
 <div className="lg:hidden border-b border-border bg-card">
 <div className="px-3.5 pt-[max(8px,env(safe-area-inset-top))] pb-2.5">
 {/* Main Bar with Categories Toggle, Search Trigger Button, and Main Menu Toggle */}
 <div className="flex items-center justify-between gap-2">
 {/* Toggle 1: Categories Button */}
 <button
 type="button"
 onClick={onToggleCategories}
 aria-label="Open categories menu"
 className={`flex h-9.5 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
 isCategoriesOpen
 ? "border-primary bg-orange text-white"
 : "border-border bg-muted/60 text-foreground hover:border-primary hover:text-primary "
 }`}
 >
 <HugeiconsIcon icon={GridIcon} size={16} className="shrink-0" />
 <span>Categories</span>
 </button>

 {/* Centered Search Trigger Button */}
 <button
 type="button"
 onClick={() => setIsSearchOpen(true)}
 aria-label="Search products"
 className="flex h-9.5 flex-1 items-center justify-between rounded-lg border border-border bg-muted/60 px-3 text-xs text-muted-foreground transition-colors hover:border-primary /60"
 >
 <span className="truncate">Search products, brands...</span>
 <div className="flex size-7 items-center justify-center rounded-md bg-orange text-white">
 <HugeiconsIcon icon={Search01Icon} size={14} />
 </div>
 </button>

 {/* Toggle 2: Main Menu Hamburger Button */}
 <button
 type="button"
 onClick={onToggleMenu}
 aria-label="Toggle main menu"
 className={`flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
 isMenuOpen
 ? "border-primary bg-orange text-white"
 : "border-border bg-muted/60 text-foreground hover:border-primary hover:text-primary "
 }`}
 >
 {isMenuOpen ? (
 <HugeiconsIcon icon={Cancel01Icon} size={18} />
 ) : (
 <HugeiconsIcon icon={Menu01Icon} size={18} />
 )}
 </button>
 </div>
 </div>
 </div>

 {/* Centered Search Modal Dialog */}
 {isSearchOpen && (
 <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
 {/* Backdrop */}
 <div
 className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
 onClick={() => setIsSearchOpen(false)}
 />

 {/* Centered Modal Content */}
 <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-lg animate-in fade-in zoom-in-95 duration-200">
 {/* Modal Header */}
 <div className="mb-4 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
 <HugeiconsIcon icon={Search01Icon} size={14} />
 </div>
 <h3 className="font-bold text-base text-foreground">
 Search Products
 </h3>
 </div>
 <button
 type="button"
 onClick={() => setIsSearchOpen(false)}
 className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted /60 dark:hover:bg-card/10"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={18} />
 </button>
 </div>

 {/* Search Form */}
 <form onSubmit={submitSearch}>
 <div className="relative mb-4">
 <input
 ref={inputRef}
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 type="search"
 placeholder="Type product name, brand, or category..."
 className="h-12 w-full rounded-xl border-2 border-primary/40 bg-muted/60 pl-4 pr-12 text-sm text-foreground outline-none transition-colors focus:border-primary dark:focus:border-primary"
 />
 {query && (
 <button
 type="button"
 onClick={() => setQuery("")}
 className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground/40 dark:hover:text-white"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={18} />
 </button>
 )}
 <button
 type="submit"
 aria-label="Search"
 className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-orange text-white shadow transition hover:bg-primary/90"
 >
 <HugeiconsIcon icon={Search01Icon} size={14} />
 </button>
 </div>
 </form>

 {/* Popular Searches / Quick Suggestions */}
 <div>
 <p className="mb-2 text-xs font-semibold text-muted-foreground /50">
 Popular Searches:
 </p>
 <div className="flex flex-wrap gap-1.5">
 {["Laptops", "Shoes", "Phones", "Watches", "Dresses", "Electronics", "Beauty"].map(
 (term) => (
 <button
 key={term}
 type="button"
 onClick={() => handleQuickSearch(term)}
 className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary dark:hover:text-primary"
 >
 {term}
 </button>
 )
 )}
 </div>
 </div>
 </div>
 </div>
 )}
 </>
 );
}
