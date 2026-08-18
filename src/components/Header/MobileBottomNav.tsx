"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useCartView } from "@/hooks/useCartActions";
import { useAuth } from "@/hooks/useAuth";
import { getAccountHref } from "@/guards/auth-routing";

const NavIcon = ({
  type,
}: {
  type: "home" | "categories" | "cart" | "account";
}) => {
  if (type === "home")
    return (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    );
  if (type === "categories")
    return (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
        <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="6" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    );
  if (type === "cart")
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 4h2l2 11h10.5l2-7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="19" r="1.4" fill="currentColor"/>
        <circle cx="17" cy="19" r="1.4" fill="currentColor"/>
      </svg>
    );
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M4 21c.8-4.1 3.4-6 8-6s7.2 1.9 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
};

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { openCartModal } = useCartModalContext();
  const { items } = useCartView();
  const { user, isAuthenticated } = useAuth();
  const accountHref = getAccountHref(isAuthenticated, user);

  const active = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const itemClass = (isActive: boolean) =>
    `relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-semibold ${
      isActive ? "text-[#f37522]" : "text-[#475569] dark:text-white/60"
    }`;

  return (
    <>
      <div
        aria-hidden="true"
        className="h-[calc(var(--xerin-mobile-nav-height)+var(--xerin-safe-bottom))] lg:hidden"
      />
      <nav
        aria-label="Mobile marketplace navigation"
        className="fixed inset-x-0 bottom-0 z-[9998] border-t border-[#e2e8f0] bg-white/95 pb-[var(--xerin-safe-bottom)] shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden dark:border-white/10 dark:bg-[#1f2327]/95"
      >
        <div className="mx-auto flex h-[var(--xerin-mobile-nav-height)] max-w-[560px] items-stretch">
          <Link href="/" className={itemClass(active("/"))}>
            <NavIcon type="home" />
            <span>Home</span>
          </Link>

          <Link
            href="/shop-with-sidebar"
            className={itemClass(
              pathname.startsWith("/shop") ||
                pathname.startsWith("/search") ||
                pathname.startsWith("/products"),
            )}
          >
            <NavIcon type="categories" />
            <span>Categories</span>
          </Link>

          <button
            type="button"
            onClick={openCartModal}
            className={itemClass(false)}
            aria-label={`Open cart with ${items.length} items`}
          >
            <span className="relative">
              <NavIcon type="cart" />
              {items.length > 0 && (
                <span className="absolute -right-2.5 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[9px] leading-4 text-white">
                  {items.length > 99 ? "99+" : items.length}
                </span>
              )}
            </span>
            <span>Cart</span>
          </button>

          <Link
            href={accountHref}
            className={itemClass(
              pathname === "/account" ||
                pathname.startsWith("/account/") ||
                pathname === "/signin" ||
                pathname === "/signup",
            )}
          >
            <NavIcon type="account" />
            <span>{isAuthenticated ? "Account" : "Sign in"}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
