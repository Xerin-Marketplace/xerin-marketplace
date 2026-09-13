"use client";

import React, { FormEvent, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";
import CurrencySelector from "./CurrencySelector";

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
      <div className="lg:hidden border-b border-gray-3 bg-white dark:border-darkTheme-border-color dark:bg-darkTheme-bg">
        <div className="px-3.5 pt-[max(8px,env(safe-area-inset-top))] pb-2.5">
          {/* Main Bar with Categories Toggle, Search Trigger Button, and Main Menu Toggle */}
          <div className="flex items-center justify-between gap-2">
            {/* Toggle 1: Categories Button */}
            <button
              type="button"
              onClick={onToggleCategories}
              aria-label="Open categories menu"
              className={`flex h-9.5 items-center gap-1.5 rounded-[10px] border px-3 text-xs font-semibold transition-colors ${
                isCategoriesOpen
                  ? "border-orange bg-orange text-white"
                  : "border-gray-3 bg-gray-1/60 text-dark hover:border-orange hover:text-orange dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color"
              }`}
            >
              <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" strokeLinecap="round"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" strokeLinecap="round"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" strokeLinecap="round"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" strokeLinecap="round"/>
              </svg>
              <span>Categories</span>
            </button>

            {/* Centered Search Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search products"
              className="flex h-9.5 flex-1 items-center justify-between rounded-[10px] border border-gray-3 bg-gray-1/60 px-3 text-xs text-dark-4 transition-colors hover:border-orange dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-white/60"
            >
              <span className="truncate">Search products, brands...</span>
              <div className="flex size-7 items-center justify-center rounded-[7px] bg-orange text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
                  <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </button>

            {/* Toggle 2: Main Menu Hamburger Button */}
            <button
              type="button"
              onClick={onToggleMenu}
              aria-label="Toggle main menu"
              className={`flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[10px] border transition-colors ${
                isMenuOpen
                  ? "border-orange bg-orange text-white"
                  : "border-gray-3 bg-gray-1/60 text-dark hover:border-orange hover:text-orange dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color"
              }`}
            >
              {isMenuOpen ? (
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-3 bg-white p-5 shadow-2xl dark:border-darkTheme-border-color dark:bg-darkTheme-card animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-orange/10 text-orange">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
                    <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-dark dark:text-white">
                  Search Products
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="flex size-8 items-center justify-center rounded-full text-dark-4 hover:bg-gray-1 dark:text-white/60 dark:hover:bg-white/10"
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
                  className="h-12 w-full rounded-xl border-2 border-orange/40 bg-gray-1/60 pl-4 pr-12 text-sm text-dark outline-none transition-colors focus:border-orange dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-white dark:focus:border-orange"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-dark-4 hover:text-dark dark:text-white/40 dark:hover:text-white"
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-orange text-white shadow transition hover:bg-orange/90"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
                    <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Popular Searches / Quick Suggestions */}
            <div>
              <p className="mb-2 text-xs font-semibold text-dark-4 dark:text-white/50">
                Popular Searches:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Laptops", "Shoes", "Phones", "Watches", "Dresses", "Electronics", "Beauty"].map(
                  (term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleQuickSearch(term)}
                      className="rounded-full border border-gray-3 bg-gray-1/60 px-3 py-1 text-xs font-medium text-dark transition-colors hover:border-orange hover:bg-orange/10 hover:text-orange dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:hover:text-orange"
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
