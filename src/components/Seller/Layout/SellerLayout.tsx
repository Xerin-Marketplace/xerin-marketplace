"use client";

import { useTheme } from "@/app/context/ThemeContext";
import { authCookies } from "@/lib/auth/cookies";
import { logout } from "@/lib/api/endpoints/auth";
import { sellersApi } from "@/lib/api/endpoints/sellers";
import { authStorage } from "@/lib/auth/storage";
import { useAuthStore } from "@/store/useAuthStore";
import type { Seller } from "@/types/api/seller";
import {
  BarChart3,
  Bell,
  Box,
  ChevronDown,
  CircleHelp,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  FileCheck2,
  HelpCircle,
  Home,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  PackagePlus,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Sun,
  Tag,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type User = {
  first_name?: string;
  last_name?: string;
  email?: string;
  account_type?: string;
  roles?: string[];
  seller_status?: string | null;
};
type NavItem = {
  label: string;
  href?: string;
  icon: typeof Home;
  soon?: boolean;
};
const groups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/seller/dashboard", icon: Home }],
  },
  {
    label: "Catalog",
    items: [
      { label: "Products", href: "/seller/products", icon: ShoppingBag },
      {
        label: "Add Product",
        href: "/seller/products?create=true",
        icon: PackagePlus,
      },
      { label: "Inventory", icon: Box, soon: true },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Orders", icon: ClipboardList, soon: true },
      { label: "Returns", icon: RotateCcw, soon: true },
      { label: "Cancellations", icon: X, soon: true },
    ],
  },
  {
    label: "Store Operations",
    items: [
      { label: "Store Profile", href: "/seller/store", icon: Store },
      { label: "Promotions", icon: Tag, soon: true },
      { label: "Reviews", icon: Star, soon: true },
      { label: "Messages", icon: MessageSquare, soon: true },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Earnings", icon: BarChart3, soon: true },
      { label: "Payouts", href: "/seller/kyc?tab=payouts", icon: WalletCards },
      { label: "Transactions", icon: CreditCard, soon: true },
    ],
  },
  {
    label: "Compliance",
    items: [
      { label: "KYC Verification", href: "/seller/kyc", icon: ShieldCheck },
      {
        label: "Business Documents",
        href: "/seller/kyc?tab=documents",
        icon: FileCheck2,
      },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Account Settings", href: "/seller/account", icon: Settings },
      {
        label: "Security",
        href: "/seller/account/security",
        icon: CircleUserRound,
      },
      { label: "Help & Support", href: "/seller/support", icon: LifeBuoy },
    ],
  },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const user = authStorage.getUser<User>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const title = pathname.includes("/account/security")
    ? "Security"
    : pathname.includes("/account/notifications")
      ? "Notifications"
      : pathname.includes("/account/profile")
        ? "Seller Profile"
        : pathname.includes("/account")
          ? "Account Settings"
          : pathname.includes("/store")
            ? "Store Settings"
            : pathname.includes("/support")
              ? "Help & Support"
              : pathname.includes("/products")
                ? "Products"
                : pathname.includes("/kyc")
                  ? "Verification & Payouts"
                  : "Seller Dashboard";
  const crumbs = useMemo(
    () =>
      pathname.includes("/account/")
        ? ["Seller Center", "Account", title]
        : ["Seller Center", title],
    [pathname, title],
  );
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      )
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const signOut = async () => {
    try {
      const refresh = authStorage.getRefreshToken();
      if (refresh) await logout({ refresh_token: refresh });
    } catch {
    } finally {
      authStorage.clearSession();
      authCookies.clearAll();
      useAuthStore.getState().clearSession();
      window.location.assign("/signin");
    }
  };
  const storeName =
    seller?.business_name || `${user?.first_name || "Seller"}'s Store`;
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] dark:bg-[#111827] dark:text-white">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
        />
      )}
      <aside
        className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-[88px]" : "lg:w-[270px]"} fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-[#2d3134] text-white shadow-xl transition-all lg:translate-x-0`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7941d] font-bold">
            XM
          </div>
          {!collapsed && (
            <div>
              <p className="font-semibold">Xerin Market</p>
              <p className="text-xs text-white/50">Seller Center</p>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        {!collapsed && (
          <div className="mx-4 mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="truncate text-sm font-semibold">{storeName}</p>
            <p className="mt-1 truncate text-xs text-white/50">{user?.email}</p>
            <div className="mt-3 flex gap-2">
              <Badge
                label={`Account: ${seller?.status || user?.seller_status || "pending"}`}
                tone={seller?.status === "approved" ? "green" : "amber"}
              />
            </div>
          </div>
        )}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-white/35">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Nav
                    key={item.label}
                    item={item}
                    active={Boolean(
                      item.href && pathname === item.href.split("?")[0],
                    )}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 hover:bg-white/10 hover:text-white lg:flex"
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <>
                <PanelLeftClose size={18} />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
          <button
            onClick={() => void signOut()}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 hover:bg-red-500/10"
          >
            {" "}
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <div
        className={`transition-all ${collapsed ? "lg:pl-[88px]" : "lg:pl-[270px]"}`}
      >
        <header className="sticky top-0 z-30 border-b border-[#e2e8f0] bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#1f2937]/95">
          <div className="flex h-20 items-center gap-3 px-4 sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden"
            >
              <Menu size={21} />
            </button>
            <div className="min-w-0">
              <div className="hidden items-center gap-1 text-xs text-[#64748b] sm:flex">
                {crumbs.map((crumb, index) => (
                  <span key={crumb}>
                    {index > 0 && <span className="mr-1">/</span>}
                    {crumb}
                  </span>
                ))}
              </div>
              <h1 className="truncate text-lg font-semibold">{title}</h1>
            </div>
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <label className="hidden items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 lg:flex dark:border-white/10 dark:bg-white/5">
                <Search size={17} className="text-[#64748b]" />
                <input
                  aria-label="Search seller records"
                  placeholder="Search seller records"
                  className="w-44 bg-transparent text-sm outline-none"
                />
              </label>
              <Link
                href="/seller/support"
                aria-label="Help"
                className="rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <CircleHelp size={19} />
              </Link>
              <Link
                href="/seller/account/notifications"
                aria-label="Notifications"
                className="relative rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <Bell size={19} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#f7941d]" />
              </Link>
              <button
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className="rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
              </button>
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] px-2 py-1.5 dark:border-white/10"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7941d] text-sm font-bold text-white">
                    {user?.first_name?.[0] || "S"}
                  </span>
                  <span className="hidden max-w-28 truncate text-sm font-semibold sm:block">
                    {user?.first_name || "Seller"}
                  </span>
                  <ChevronDown size={15} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#e2e8f0] bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#2d3134]">
                    <div className="border-b border-[#e2e8f0] p-3 dark:border-white/10">
                      <p className="font-semibold">{storeName}</p>
                      <p className="truncate text-xs text-[#64748b]">
                        {user?.email}
                      </p>
                      <p className="mt-2 text-xs capitalize text-green-600">
                        {seller?.status || user?.seller_status || "pending"}
                      </p>
                    </div>
                    <Drop href="/seller/account/profile" icon={CircleUserRound} label="Seller Profile" />
                    <Drop href="/seller/account" icon={Settings} label="Account Settings" />
                    <Drop href="/seller/store" icon={Store} label="Store Settings" />
                    <Drop href="/seller/account/security" icon={ShieldCheck} label="Security" />
                    <Drop href="/seller/support" icon={LifeBuoy} label="Help & Support" />
                    <Drop
                      href="/shop-with-sidebar"
                      icon={Store}
                      label="View storefront"
                    />
                    <button
                      onClick={() => void signOut()}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-8.5rem)] p-4 sm:p-6">
          {children}
        </main>
        <footer className="flex flex-col gap-2 border-t border-[#e2e8f0] px-6 py-4 text-xs text-[#64748b] dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Xerin Market Seller Center</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/seller/support">Support</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Nav({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const classes = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-[#f7941d] font-semibold text-white" : "text-white/65 hover:bg-white/10 hover:text-white"}`;
  if (item.soon)
    return (
      <div
        title={`${item.label} — coming soon`}
        className={`${classes} cursor-not-allowed opacity-45`}
      >
        <Icon size={18} />
        {!collapsed && (
          <>
            <span>{item.label}</span>
            <span className="ml-auto text-[9px] uppercase">Soon</span>
          </>
        )}
      </div>
    );
  return (
    <Link
      href={item.href!}
      title={collapsed ? item.label : undefined}
      className={classes}
    >
      <Icon size={18} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}
function Badge({ label, tone }: { label: string; tone: "green" | "amber" }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${tone === "green" ? "bg-green-400/15 text-green-300" : "bg-amber-400/15 text-amber-300"}`}
    >
      {label}
    </span>
  );
}
function Drop({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Home;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/10"
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
