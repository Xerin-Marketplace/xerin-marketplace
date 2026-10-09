"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BellIcon, ArrowDown01Icon, ArrowRight01Icon, UserCircleIcon, Home01Icon, DashboardSquare01Icon, Location01Icon, Menu01Icon, Moon02Icon, SidebarLeft01Icon, SidebarRight01Icon, Search01Icon, Settings01Icon, Logout01Icon, Sun03Icon, Cancel01Icon, LockKeyIcon } from "@hugeicons/core-free-icons";

import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";

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
 icon?: IconSvgElement;
 /** Renders a lock marker for gated sections (e.g. pending KYC). */
 locked?: boolean;
 /** Additional hrefs that should mark this item active (module children). */
 matches?: string[];
};

export type DashboardNavGroup = {
 title: string;
 key: string;
 items: DashboardNavItem[];
 icon: IconSvgElement;
};

function hrefScore(href: string) {
 return Array.from(new URL(href, "http://localhost").searchParams.keys()).length;
}

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
 brandSubtitle = "Store Center",
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
 const [navQuery, setNavQuery] = useState("");
 const profileMenuRef = useRef<HTMLDivElement | null>(null);
 const searchRef = useRef<HTMLDivElement | null>(null);
 const router = useRouter();

 const displayName =
 [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
 user?.email ||
 "Xerin account";



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

 // Highest query-specificity among all matching hrefs — used so only the
 // most specific module lights up (e.g. `?tab=overview` must not mark the
 // Dashboard active while inside Communications).
 const bestMatchScore = useMemo(() => {
 let best = -1;
 groups.forEach((group) =>
 group.items.forEach((item) =>
 [item.href, ...(item.matches ?? [])].forEach((href) => {
 if (isItemActive(href, pathname, searchParams)) {
 best = Math.max(best, hrefScore(href));
 }
 }),
 ),
 );
 return best;
 }, [groups, pathname, searchParams]);

 const isNavItemActive = (item: DashboardNavItem) =>
 [item.href, ...(item.matches ?? [])].some(
 (href) =>
 isItemActive(href, pathname, searchParams) &&
 hrefScore(href) === bestMatchScore,
 );

 const activeGroup = useMemo(
 () =>
 groups.find((group) => group.items.some((item) => isNavItemActive(item)))
 ?.title,
 // eslint-disable-next-line react-hooks/exhaustive-deps
 [groups, pathname, searchParams, bestMatchScore],
 );

 const dashboardActive =
 pathname === new URL(dashboardHref, "http://localhost").pathname &&
 !searchParams.get("tab");

 // Header search = page finder across the visible navigation.
 const navResults = useMemo(() => {
 const q = navQuery.trim().toLowerCase();
 if (!q) return [];
 const flat = groups.flatMap((group) =>
 group.items.map((item) => ({ ...item, section: group.title })),
 );
 return flat
 .filter((item) => item.label.toLowerCase().includes(q))
 .slice(0, 8);
 }, [groups, navQuery]);

 // Close menus on outside click.
 useEffect(() => {
 const onDown = (event: MouseEvent) => {
 if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
 setProfileOpen(false);
 }
 if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
 setNavQuery("");
 }
 };
 document.addEventListener("mousedown", onDown);
 return () => document.removeEventListener("mousedown", onDown);
 }, []);

 return (
 <div
 className="admin-dashboard-shell min-h-screen bg-muted text-foreground antialiased"
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
 collapsed ? "lg:w-[72px]" : "lg:w-[240px]"
 } fixed inset-y-0 left-0 z-50 flex h-dvh w-[250px] flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 lg:translate-x-0`}
 >
 <div className="flex h-[74px] shrink-0 items-center border-b border-border px-5 dark:border-border">
 {!collapsed && (
 <div className="min-w-0">
 <Image
 src="/images/logo/logooriginal.png"
 alt="Xerin Marketplace logo"
 width={150}
 height={48}
 className="h-10 w-auto object-contain"
 priority
 />
 <p className="mt-0.5 text-xs text-muted-foreground /50">
 {brandSubtitle}
 </p>
 </div>
 )}
 <button
 onClick={() => setMobileOpen(false)}
 aria-label="Close navigation"
 className="ml-auto rounded-lg p-2 text-muted-foreground hover:bg-muted dark:hover:bg-card/10 lg:hidden"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={18} />
 </button>
 </div>

 <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-gutter:stable]">
 <div>
 {!collapsed && (
 <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground /35">
 Overview
 </p>
 )}
 <Link
 href={dashboardHref}
 title={collapsed ? dashboardLabel : undefined}
 className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-normal transition ${
 dashboardActive
 ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground"
 : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground /65 dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground"
 }`}
 >
 <HugeiconsIcon icon={DashboardSquare01Icon} size={18} />
 {!collapsed && <span>{dashboardLabel}</span>}
 </Link>
 </div>

 {groups.map((group) => {
 const GroupIcon = group.icon;
 const hideGroupLabel = group.items.length === 1 && group.items[0]?.label === group.title;
 return (
 <div key={group.title} data-active-group={activeGroup === group.title || undefined}>
 {!collapsed && !hideGroupLabel && (
 <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground /35">
 {group.title}
 </p>
 )}
 <div className="space-y-1">
 {group.items.map((item) => {
 const Icon = item.icon || GroupIcon;
 const active = isNavItemActive(item);
 return (
 <Link
 key={`${group.title}-${item.label}`}
 href={item.href}
 title={collapsed ? item.label : undefined}
 className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-normal transition ${
 active
 ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground"
 : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground /65 dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground"
 }`}
 >
 <HugeiconsIcon icon={Icon} size={18} strokeWidth={active ? 2.25 : 1.9} className={`shrink-0 ${item.locked ? "opacity-50" : ""}`} />
 {!collapsed && (
 <>
 <span className={`truncate ${item.locked ? "opacity-60" : ""}`}>{item.label}</span>
 {item.locked && <HugeiconsIcon icon={LockKeyIcon} size={13} className="ml-auto opacity-60" />}
 {!item.locked && active && <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="ml-auto opacity-80" />}
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

 <div className="shrink-0 border-t border-border p-3 dark:border-border">
 <div className="mb-1 flex items-center gap-1">
 <button
 onClick={toggleTheme}
 title="Toggle theme"
 className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground /65 dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground ${
 collapsed ? "w-full justify-center" : "flex-1"
 }`}
 >
 {theme === "dark" ? <HugeiconsIcon icon={Sun03Icon} size={18} /> : <HugeiconsIcon icon={Moon02Icon} size={18} />}
 {!collapsed && <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
 </button>

 {!collapsed && settingsHref && (
 <Link
 href={settingsHref}
 title="Settings"
 className="rounded-xl p-2.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground /65 dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground"
 >
 <HugeiconsIcon icon={Settings01Icon} size={18} />
 </Link>
 )}
 </div>

 <button
 onClick={() => setCollapsed(!collapsed)}
 title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
 className="hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground /65 dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground lg:flex"
 >
 {collapsed ? <HugeiconsIcon icon={SidebarRight01Icon} size={18} /> : <HugeiconsIcon icon={SidebarLeft01Icon} size={18} />}
 {!collapsed && <span>Collapse sidebar</span>}
 </button>

 <button
 onClick={() => void handleSignOut()}
 title="Sign out"
 className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-destructive transition hover:bg-red-light-6 hover:text-destructive dark:text-red-300 dark:hover:bg-destructive/10 ${
 collapsed ? "justify-center" : ""
 }`}
 >
 <HugeiconsIcon icon={Logout01Icon} size={18} />
 {!collapsed && <span>Sign out</span>}
 </button>
 </div>
 </aside>

 <div className={`transition-all duration-200 ${collapsed ? "lg:pl-[72px]" : "lg:pl-[240px]"}`}>
 <header className="sticky top-0 z-30 border-b border-border bg-background/90 shadow-sm backdrop-blur-sm dark:border-border">
 <div className="flex h-[74px] items-center gap-3 px-4 sm:px-6 lg:px-7">
 <button
 onClick={() => setMobileOpen(true)}
 aria-label="Open navigation"
 className="rounded-xl p-2 hover:bg-muted dark:hover:bg-card/10 lg:hidden"
 >
 <HugeiconsIcon icon={Menu01Icon} size={20} />
 </button>

 <div className="min-w-0">
 <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex /50">
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

 <div ref={searchRef} className="relative mx-auto hidden w-full max-w-sm md:block">
 <HugeiconsIcon
 icon={Search01Icon}
 size={16}
 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
 />
 <input
 value={navQuery}
 onChange={(event) => setNavQuery(event.target.value)}
 onKeyDown={(event) => {
 if (event.key === "Enter" && navResults[0]) {
 event.preventDefault();
 router.push(navResults[0].href);
 setNavQuery("");
 }
 }}
 placeholder={searchPlaceholder}
 aria-label={searchPlaceholder}
 role="combobox"
 aria-expanded={navQuery.trim().length > 0}
 className="h-10 w-full rounded-full border border-border bg-muted pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-[var(--primary)] focus:bg-card dark:border-border dark:bg-card/[.03]"
 />
 {navQuery.trim().length > 0 && (
 <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 max-h-80 overflow-auto rounded-xl border border-border bg-card p-1.5 shadow-lg dark:border-border">
 {navResults.length === 0 ? (
 <p className="px-3 py-2.5 text-sm text-muted-foreground">No matching pages.</p>
 ) : (
 navResults.map((item) => (
 <button
 key={item.href}
 type="button"
 onClick={() => {
 router.push(item.href);
 setNavQuery("");
 }}
 className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground dark:hover:bg-card/[.08] dark:hover:text-white"
 >
 <span>{item.label}</span>
 <span className="text-xs text-muted-foreground/60">{item.section}</span>
 </button>
 ))
 )}
 </div>
 )}
 </div>

 <div className="ml-auto flex items-center gap-1 sm:gap-2">
 <button
 type="button"
 onClick={toggleTheme}
 aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
 className="rounded-xl p-2.5 hover:bg-muted dark:hover:bg-card/10"
 >
 <HugeiconsIcon icon={theme === "dark" ? Sun03Icon : Moon02Icon} size={18} />
 </button>

 {settingsHref && (
 <Link
 href={settingsHref}
 aria-label="Settings"
 title="Settings"
 className="rounded-xl p-2.5 hover:bg-muted dark:hover:bg-card/10"
 >
 <HugeiconsIcon icon={Settings01Icon} size={18} />
 </Link>
 )}

 {notificationsHref && (
 <Link
 href={notificationsHref}
 aria-label="Notifications"
 className="relative rounded-xl p-2.5 hover:bg-muted dark:hover:bg-card/10"
 >
 <HugeiconsIcon icon={BellIcon} size={18} />
 </Link>
 )}

 {addressesHref && (
 <Link
 href={addressesHref}
 aria-label="Delivery addresses"
 title="Delivery addresses"
 className="rounded-xl p-2.5 hover:bg-muted dark:hover:bg-card/10"
 >
 <HugeiconsIcon icon={Location01Icon} size={18} />
 </Link>
 )}

 <div ref={profileMenuRef} className="relative">
 <button
 type="button"
 onClick={() => setProfileOpen((open) => !open)}
 aria-label="Account menu"
 aria-haspopup="menu"
 aria-expanded={profileOpen}
 className={`flex items-center gap-1 rounded-xl p-2.5 transition hover:bg-muted dark:hover:bg-card/10 ${
 profileOpen ? "bg-muted dark:bg-card/10" : ""
 }`}
 >
 <HugeiconsIcon icon={UserCircleIcon} size={18} />
 <HugeiconsIcon icon={ArrowDown01Icon}
 size={14}
 className={`hidden transition-transform sm:block ${
 profileOpen ? "rotate-180" : ""
 }`}
 />
 </button>

 {profileOpen && (
 <div
 role="menu"
 className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card"
 >
 <div className="border-b border-border px-4 py-3.5 dark:border-border">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
 {initials}
 </div>
 <div className="min-w-0">
 <p className="truncate text-sm font-semibold text-foreground">
 {displayName}
 </p>
 <p className="mt-0.5 truncate text-xs text-muted-foreground">
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
 className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground /70 dark:hover:bg-card/[0.08] dark:hover:text-white"
 >
 <HugeiconsIcon icon={UserCircleIcon} size={18} />
 <span>Profile</span>
 </Link>
 )}

 {settingsHref && (
 <Link
 role="menuitem"
 href={settingsHref}
 onClick={() => setProfileOpen(false)}
 className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground /70 dark:hover:bg-card/[0.08] dark:hover:text-white"
 >
 <HugeiconsIcon icon={Settings01Icon} size={18} />
 <span>Settings</span>
 </Link>
 )}

 <Link
 role="menuitem"
 href="/"
 onClick={() => setProfileOpen(false)}
 className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground /70 dark:hover:bg-card/[0.08] dark:hover:text-white"
 >
 <HugeiconsIcon icon={Home01Icon} size={18} />
 <span>Home</span>
 </Link>

 <button
 type="button"
 role="menuitem"
 onClick={() => void handleSignOut()}
 className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-destructive transition hover:bg-red-light-6 hover:text-destructive dark:text-red-300 dark:hover:bg-destructive/10"
 >
 <HugeiconsIcon icon={Logout01Icon} size={18} />
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

 <footer className="flex flex-col gap-2 border-t border-border px-6 py-4 text-xs text-muted-foreground dark:border-border sm:flex-row sm:items-center sm:justify-between">
 <p>© 2026 {footerLabel}</p>
 <div className="flex gap-4">
 <Link href="/privacy">Privacy Policy</Link>
 <Link href="/terms">Terms</Link>
 <Link href={supportHref}>Support</Link>
 </div>
 </footer>
 </div>
 </div>
 );
}
