"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Home,
  LayoutDashboard,
  MapPin,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  LogOut,
  Sun,
  X,
  type LucideIcon,
} from "lucide-react";

import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";

export type DashboardShellUser = {
  first_name?: string;
  last_name?: string;
  email?: string;
  account_type?: string;
  roles?: string[];
  permissions?: string[];
};

export type DashboardNavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

export type DashboardNavGroup = {
  title: string;
  key: string;
  items: DashboardNavItem[];
  icon: LucideIcon;
};

function isItemActive(
  href: string,
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
) {
  const url = new URL(href, "http://localhost");
  const keys = Array.from(url.searchParams.keys());

  if (!keys.length) {
    return pathname === url.pathname || pathname.startsWith(`${url.pathname}/`);
  }

  if (url.pathname !== pathname) return false;

  return keys.every((key) => searchParams.get(key) === url.searchParams.get(key));
}

export default function DashboardShell({
  children,
  user,
  groups,
  title = "Dashboard Overview",
  breadcrumb,
  centerLabel = "Xerin Center",
  brandSubtitle = "Marketplace Center",
  dashboardHref,
  dashboardLabel = "Dashboard",
  notificationsHref,
  profileHref,
  settingsHref,
  addressesHref = "/account/addresses",
  supportHref = "/support",
  footerLabel = "Xerin Marketplace",
  searchPlaceholder = "Search",
  onSignOut,
}: {
  children: ReactNode;
  user?: DashboardShellUser | null;
  groups: DashboardNavGroup[];
  title?: string;
  breadcrumb?: string;
  centerLabel?: string;
  brandSubtitle?: string;
  dashboardHref: string;
  dashboardLabel?: string;
  notificationsHref?: string;
  profileHref?: string;
  settingsHref?: string;
  addressesHref?: string;
  supportHref?: string;
  footerLabel?: string;
  searchPlaceholder?: string;
  onSignOut?: () => void | Promise<void>;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const { logout: defaultLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.email ||
    "Xerin account";

  const role = user?.account_type || user?.roles?.[0] || "user";

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "X";

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  const handleSignOut = async () => {
    setProfileOpen(false);

    if (onSignOut) {
      await onSignOut();
      return;
    }

    await defaultLogout();
  };

  const activeGroup = useMemo(
    () =>
      groups.find((group) =>
        group.items.some((item) => isItemActive(item.href, pathname, searchParams)),
      )?.title,
    [groups, pathname, searchParams],
  );

  const dashboardActive =
    pathname === new URL(dashboardHref, "http://localhost").pathname &&
    !searchParams.get("tab");

  return (
    <div
      className="admin-dashboard-shell min-h-screen bg-[#f6f7f9] text-[#111827] antialiased dark:bg-[#111827] dark:text-white"
      style={{ fontFamily: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
    >
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${
          collapsed ? "lg:w-[88px]" : "lg:w-[270px]"
        } fixed inset-y-0 left-0 z-50 flex h-dvh w-[282px] flex-col overflow-hidden border-r border-[#e7ebf0] bg-white/95 text-[#111827] shadow-[8px_0_30px_rgba(15,23,42,0.035)] backdrop-blur-xl transition-all duration-200 dark:border-white/10 dark:bg-[#1f2937]/95 dark:text-white lg:translate-x-0`}
      >
        <div className="flex h-[74px] shrink-0 items-center border-b border-[#e7ebf0] px-5 dark:border-white/10">
          {!collapsed && (
            <div className="min-w-0">
              <Image
                src="/images/logo/logo.png"
                alt="Xerin Marketplace logo"
                width={150}
                height={46}
                className="h-10 w-auto object-contain"
                priority
              />
              <p className="mt-0.5 text-xs text-[#94a3b8] dark:text-white/50">
                {brandSubtitle}
              </p>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="ml-auto rounded-lg p-2 text-[#64748b] hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {!collapsed && (
          <div className="mx-3 mt-4 rounded-2xl border border-[#e7ebf0] bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7941d] text-sm font-bold text-white shadow-[0_6px_16px_rgba(247,148,29,0.20)]">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111827] dark:text-white">
                  {displayName}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#94a3b8]">
                  {user?.email || "Xerin account"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#94a3b8]">
                Account
              </span>
              <span className="rounded-full bg-[#fff1e3] px-2.5 py-1 text-[10px] font-semibold capitalize text-[#d96800] dark:bg-orange-400/10 dark:text-orange-300">
                {role.replaceAll("_", " ")}
              </span>
            </div>
          </div>
        )}

        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-gutter:stable]">
          <div>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#94a3b8] dark:text-white/35">
                Overview
              </p>
            )}
            <Link
              href={dashboardHref}
              title={collapsed ? dashboardLabel : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-normal transition ${
                dashboardActive
                  ? "bg-[#f7941d] font-semibold text-white shadow-[0_6px_18px_rgba(247,148,29,0.18)]"
                  : "text-[#64748b] hover:bg-slate-100 hover:text-[#111827] dark:text-white/65 dark:hover:bg-white/[0.08] dark:hover:text-white"
              }`}
            >
              <LayoutDashboard size={18} strokeWidth={2} />
              {!collapsed && <span>{dashboardLabel}</span>}
            </Link>
          </div>

          {groups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={group.title} data-active-group={activeGroup === group.title || undefined}>
                {!collapsed && (
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#94a3b8] dark:text-white/35">
                    {group.title}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon || GroupIcon;
                    const active = isItemActive(item.href, pathname, searchParams);
                    return (
                      <Link
                        key={`${group.title}-${item.label}`}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-normal transition ${
                          active
                            ? "bg-[#f7941d] font-semibold text-white shadow-[0_6px_18px_rgba(247,148,29,0.18)]"
                            : "text-[#64748b] hover:bg-slate-100 hover:text-[#111827] dark:text-white/65 dark:hover:bg-white/[0.08] dark:hover:text-white"
                        }`}
                      >
                        <Icon size={18} strokeWidth={active ? 2.25 : 1.9} className="shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            {active && <ChevronRight size={14} className="ml-auto opacity-80" />}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-[#e7ebf0] p-3 dark:border-white/10">
          <div className="mb-1 flex items-center gap-1">
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[#64748b] transition hover:bg-slate-100 hover:text-[#111827] dark:text-white/65 dark:hover:bg-white/[0.08] dark:hover:text-white ${
                collapsed ? "w-full justify-center" : "flex-1"
              }`}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {!collapsed && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
            </button>

            {!collapsed && settingsHref && (
              <Link
                href={settingsHref}
                title="Settings"
                className="rounded-xl p-2.5 text-[#64748b] hover:bg-slate-100 hover:text-[#111827] dark:text-white/65 dark:hover:bg-white/[0.08] dark:hover:text-white"
              >
                <Settings size={18} />
              </Link>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[#64748b] transition hover:bg-slate-100 hover:text-[#111827] dark:text-white/65 dark:hover:bg-white/[0.08] dark:hover:text-white lg:flex"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && <span>Collapse sidebar</span>}
          </button>

          <button
            onClick={() => void handleSignOut()}
            title="Sign out"
            className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:text-red-300 dark:hover:bg-red-500/10 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <div className={`transition-all duration-200 ${collapsed ? "lg:pl-[88px]" : "lg:pl-[270px]"}`}>
        <header className="sticky top-0 z-30 border-b border-[#e7ebf0] bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1f2937]/90">
          <div className="flex h-[74px] items-center gap-3 px-4 sm:px-6 lg:px-7">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0">
              <div className="hidden items-center gap-1 text-xs text-[#64748b] sm:flex dark:text-white/50">
                <span>{centerLabel}</span>
                {breadcrumb && (
                  <>
                    <span>/</span>
                    <span>{breadcrumb}</span>
                  </>
                )}
              </div>
              <h1 className="truncate text-lg font-bold tracking-[-0.02em]">{title}</h1>
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <label className="hidden items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 lg:flex dark:border-white/10 dark:bg-white/5">
                <Search size={17} className="text-[#64748b]" />
                <input
                  aria-label={`Search ${centerLabel.toLowerCase()} records`}
                  placeholder={searchPlaceholder}
                  className="w-36 bg-transparent text-sm outline-none placeholder:text-[#98a2b3]"
                />
              </label>

              {notificationsHref && (
                <Link
                  href={notificationsHref}
                  aria-label="Notifications"
                  className="relative rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <Bell size={19} />
                </Link>
              )}

              {addressesHref && (
                <Link
                  href={addressesHref}
                  aria-label="Delivery addresses"
                  title="Delivery addresses"
                  className="rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <MapPin size={19} />
                </Link>
              )}

              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  className={`flex items-center gap-1 rounded-xl p-2.5 transition hover:bg-slate-100 dark:hover:bg-white/10 ${
                    profileOpen ? "bg-slate-100 dark:bg-white/10" : ""
                  }`}
                >
                  <CircleUserRound size={19} />
                  <ChevronDown
                    size={13}
                    className={`hidden transition-transform sm:block ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-64 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-[#1f2937]"
                  >
                    <div className="border-b border-[#e7ebf0] px-4 py-3.5 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7941d] text-sm font-bold text-white">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#111827] dark:text-white">
                            {displayName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[#94a3b8]">
                            {user?.email || "Xerin account"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      {profileHref && (
                        <Link
                          role="menuitem"
                          href={profileHref}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#475569] transition hover:bg-slate-100 hover:text-[#111827] dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white"
                        >
                          <CircleUserRound size={18} />
                          <span>Profile</span>
                        </Link>
                      )}

                      <Link
                        role="menuitem"
                        href="/"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#475569] transition hover:bg-slate-100 hover:text-[#111827] dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white"
                      >
                        <Home size={18} />
                        <span>Home</span>
                      </Link>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => void handleSignOut()}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-8.5rem)] p-4 sm:p-6 lg:p-7 2xl:p-8">{children}</main>

        <footer className="flex flex-col gap-2 border-t border-[#e2e8f0] px-6 py-4 text-xs text-[#64748b] dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {footerLabel}</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
            <Link href={supportHref}>Support</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
