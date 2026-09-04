"use client";

import RouteGuard from "@/guards/RouteGuard";
import { isAdminUser, isSellerUser } from "@/guards/permissions";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import {
  BadgeCheck,
  Bell,
  CreditCard,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  ScanSearch,
  Shield,
  Star,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

type NavItem = readonly [string, string, typeof Package];
type NavGroup = { label: string; items: readonly NavItem[] };

const navGroups: readonly NavGroup[] = [
  {
    label: "Overview",
    items: [["Dashboard", "/account", LayoutDashboard]],
  },
  {
    label: "Shopping",
    items: [
      ["Orders", "/account/orders", Package],
      ["Wishlist", "/wishlist", Heart],
      ["Reviews", "/account/reviews", Star],
    ],
  },
  {
    label: "Delivery & protection",
    items: [
      ["Confirm Delivery", "/account/delivery-verification", BadgeCheck],
      ["Pickup Confirmations", "/account/pickup-verification", ScanSearch],
    ],
  },
  {
    label: "Account",
    items: [
      ["Payments", "/account/payments", CreditCard],
      ["Addresses", "/account/addresses", MapPin],
      ["Notifications", "/account/notifications", Bell],
      ["Security", "/account/security", Shield],
      ["Account Details", "/account/details", UserRound],
    ],
  },
] as const;

const allNav = navGroups.flatMap((group) => group.items);

export default function BuyerAccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hasHydrated);
  const { logout } = useAuth();
  const isUniversalAddressPage = pathname === "/account/addresses";

  useEffect(() => {
    if (!hydrated || isUniversalAddressPage) return;
    if (isSellerUser(user)) router.replace("/seller/account");
    else if (isAdminUser(user)) router.replace("/admin/dashboard");
  }, [hydrated, isUniversalAddressPage, router, user]);

  if (
    !hydrated ||
    (!isUniversalAddressPage && (isSellerUser(user) || isAdminUser(user)))
  ) {
    return <div className="min-h-[50vh] pt-52 text-center text-[#64748b]">Loading your account...</div>;
  }

  const currentLabel = allNav.find((item) => item[1] === pathname)?.[0] || "Account";

  return (
    <RouteGuard
      accountTypes={isUniversalAddressPage ? [] : ["customer"]}
      fallbackPath="/signin"
    >
      <div className="bg-[#f8fafc] pt-[190px] dark:bg-darkTheme-bg lg:pt-[175px]">
        <div className="mx-auto max-w-[1220px] px-4 py-5 sm:px-8">
          <p className="text-sm text-[#64748b]">Home / <span className="font-semibold text-[#0f172a] dark:text-white">My Account</span>{pathname !== "/account" && ` / ${currentLabel}`}</p>
        </div>

        <div className={`mx-auto grid max-w-[1220px] gap-6 px-4 pb-12 sm:px-8 ${isUniversalAddressPage ? "" : "lg:grid-cols-[250px_minmax(0,1fr)]"}`}>
          {!isUniversalAddressPage && (
            <aside className="min-w-0">
              <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[#e2e8f0] bg-white p-2 shadow-sm dark:border-white/10 dark:bg-darkTheme-card lg:sticky lg:top-44 lg:block lg:space-y-4 lg:p-3">
                {navGroups.map((group) => (
                  <div key={group.label} className="contents lg:block">
                    <p className="hidden px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#94a3b8] lg:block">{group.label}</p>
                    <div className="contents lg:block lg:space-y-1">
                      {group.items.map(([label, href, Icon]) => {
                        const active = pathname === href || (href.startsWith("/account/") && pathname.startsWith(`${href}/`));
                        return (
                          <Link
                            key={href}
                            href={href}
                            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-[#f7941d] text-white shadow-sm" : "text-[#4a4f54] hover:bg-orange-50 dark:text-white/70 dark:hover:bg-white/5"}`}
                          >
                            <Icon size={18} />
                            {label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="hidden h-px bg-[#e2e8f0] dark:bg-white/10 lg:block" />
                <button onClick={() => void logout()} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 lg:w-full">
                  <LogOut size={18} />Logout
                </button>
              </div>
            </aside>
          )}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
