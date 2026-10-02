"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useCartView } from "@/hooks/useCartActions";
import { useAuth } from "@/hooks/useAuth";
import { getAccountHref } from "@/guards/auth-routing";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, GridIcon, ShoppingCart01Icon, UserIcon } from "@hugeicons/core-free-icons";

const NavIcon = ({
 type,
}: {
 type: "home" | "categories" | "cart" | "account";
}) => {
 const icon = {
 home: Home01Icon,
 categories: GridIcon,
 cart: ShoppingCart01Icon,
 account: UserIcon,
 }[type];
 return <HugeiconsIcon icon={icon} size={23} strokeWidth={1.8} />;
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
 isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] /60"
 }`;

 return (
 <>
 <div
 aria-hidden="true"
 className="h-[calc(var(--xerin-mobile-nav-height)+var(--xerin-safe-bottom))] lg:hidden"
 />
 <nav
 aria-label="Mobile store navigation"
 className="fixed inset-x-0 bottom-0 z-[9998] border-t border-[var(--border)] bg-card/95 pb-[var(--xerin-safe-bottom)] shadow-sm backdrop-blur lg:hidden dark:border-border dark:bg-[var(--card)]/95"
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
 <span className="absolute -right-2.5 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[var(--destructive)] px-1 text-[9px] leading-4 text-white">
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
