"use client";

import React, { FormEvent, useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GridIcon,
  Search01Icon,
  Cancel01Icon,
  Menu01Icon,
  Location01Icon,
  ShoppingCart01Icon,
  UserIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { useAddresses } from "@/hooks/useAddresses";
import type { User } from "@/types/api/user";

const avatarSrc = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return url.replace(/^\/uploads\//, "/backend-uploads/");
  return url;
};

interface MobileStorefrontHeaderProps {
  onToggleCategories: () => void;
  onToggleMenu: () => void;
  isMenuOpen: boolean;
  isCategoriesOpen: boolean;
  isAuthenticated: boolean;
  accountHref: string;
  accountLabel: string;
  cartCount: number;
  onOpenCart: () => void;
  user?: User | null;
}

export default function MobileStorefrontHeader({
  onToggleCategories,
  onToggleMenu,
  isMenuOpen,
  isCategoriesOpen,
  isAuthenticated,
  accountHref,
  accountLabel,
  cartCount,
  onOpenCart,
  user,
}: MobileStorefrontHeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addresses } = useAddresses(isAuthenticated);

  const defaultAddress =
    addresses.find((a) => a.is_default) ?? addresses[0] ?? null;
  const locationLabel = defaultAddress
    ? [defaultAddress.city, defaultAddress.region]
        .filter(Boolean)
        .join(", ")
    : null;

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    setIsSearchOpen(false);
    router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  };

  const handleQuickSearch = (term: string) => {
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <div className="lg:hidden border-b border-border bg-card">
        <div className="px-3.5 pt-[max(6px,env(safe-area-inset-top))] pb-2.5">
          {/* Row 1: menu, logo, account, cart */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onToggleMenu}
              aria-label="Toggle main menu"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                isMenuOpen
                  ? "border-primary bg-orange text-white"
                  : "border-border bg-muted/60 text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <HugeiconsIcon
                icon={isMenuOpen ? Cancel01Icon : Menu01Icon}
                size={18}
              />
            </button>

            <Link href="/" className="flex min-w-0 flex-1 items-center justify-center px-1" aria-label="Xerin Mart home">
              <Image
                src="/images/logo/logooriginal.png"
                alt="Xerin Mart"
                width={200}
                height={64}
                className="h-12 w-auto object-contain"
                priority
              />
            </Link>

            {isAuthenticated ? (
              <Link
                href={accountHref}
                aria-label={accountLabel}
                className="flex shrink-0 items-center gap-2 rounded-2xl border border-border bg-muted/60 py-1 pl-1 pr-2.5 transition-colors hover:border-primary"
              >
                {avatarSrc(user?.avatar_url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc(user?.avatar_url)!}
                    alt=""
                    className="h-8 w-8 rounded-xl object-cover ring-1 ring-primary/30"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-xs font-black text-primary-foreground">
                    {(user?.first_name?.[0] || user?.email?.[0] || "X").toUpperCase()}
                  </span>
                )}
                <span className="flex flex-col leading-none">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">My Xerin</span>
                  <span className="mt-0.5 max-w-[70px] truncate text-xs font-bold text-foreground">
                    {user?.first_name || "Account"}
                  </span>
                </span>
              </Link>
            ) : (
              <Link
                href={accountHref}
                aria-label={accountLabel}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <HugeiconsIcon icon={UserIcon} size={18} />
              </Link>
            )}

            <button
              type="button"
              onClick={onOpenCart}
              aria-label="Open cart"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <HugeiconsIcon icon={ShoppingCart01Icon} size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Row 2: delivery location */}
          <Link
            href={isAuthenticated ? "/account/addresses" : "/signin?returnTo=/account/addresses"}
            className="mt-2 flex items-center gap-1.5 rounded-lg py-1 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <HugeiconsIcon icon={Location01Icon} size={14} className="shrink-0 text-primary" />
            <span className="truncate">
              {locationLabel ? (
                <>
                  Deliver to <b className="font-semibold text-foreground">{locationLabel}</b>
                </>
              ) : (
                "Set your delivery location"
              )}
            </span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="ml-auto shrink-0" />
          </Link>

          {/* Row 3: categories + search */}
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleCategories}
              aria-label="Open categories menu"
              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors ${
                isCategoriesOpen
                  ? "border-primary bg-orange text-white"
                  : "border-border bg-muted/60 text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <HugeiconsIcon icon={GridIcon} size={16} className="shrink-0" />
              <span>Categories</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search products"
              className="flex h-10 flex-1 items-center justify-between rounded-xl border border-border bg-muted/60 px-3 text-xs text-muted-foreground transition-colors hover:border-primary"
            >
              <span className="truncate">Search products, brands...</span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-orange text-white">
                <HugeiconsIcon icon={Search01Icon} size={14} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Centered Search Modal Dialog */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSearchOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-lg animate-in fade-in zoom-in-95 duration-200">
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
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted dark:hover:bg-card/10"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              </button>
            </div>

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
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
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
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
