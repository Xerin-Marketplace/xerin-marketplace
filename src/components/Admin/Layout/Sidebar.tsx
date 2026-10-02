"use client";

import "../admin-ui.css";
import { ReactNode, useMemo } from "react";
import { ChartColumnIcon, BellIcon, Package02Icon, UserCircleIcon, Task01Icon, CreditCardIcon, FileCheckIcon, LifebuoyIcon, LockKeyIcon, Megaphone01Icon, PackageIcon, PackageCheckIcon, Search01Icon, Settings01Icon, ShieldCheckIcon, ShoppingBag01Icon, Store01Icon, Tag01Icon, UserMultiple02Icon, UserAdd01Icon, Key01Icon, Wallet03Icon, TruckIcon, Globe02Icon, Cancel01Icon, JusticeScale01Icon, PreferenceHorizontalIcon, DashboardSquare01Icon, Mail01Icon, DatabaseIcon } from "@hugeicons/core-free-icons";

import DashboardShell, {
 type DashboardNavGroup,
 type DashboardShellUser,
} from "@/components/Dashboard/DashboardShell";
import { authStorage } from "@/lib/auth/storage";
import { canAccessAdminItem, canAccessAdminSection } from "@/lib/auth/admin-access";
import { ADMIN_SECTIONS } from "@/components/Admin/navigation";
import ModuleSubNav from "@/components/Admin/shared/ModuleSubNav";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";

export type AdminTab =
 | "overview"
 | "users"
 | "sellers"
 | "products"
 | "categories"
 | "brands"
 | "reviews"
 | "orders"
 | "inventory"
 | "finance"
 | "analytics";



export default function AdminSidebar({
 children,
 title = "Dashboard Overview",
 breadcrumb,
}: {
 children: ReactNode;
 title?: string;
 breadcrumb?: string;
}) {
 const user = authStorage.getUser<DashboardShellUser>();

 const visibleSidebarGroups = useMemo<DashboardNavGroup[]>(
 () =>
 ADMIN_SECTIONS.map((section) => ({
 title: section.label,
 key: section.label,
 icon: section.modules[0]?.icon,
 items: section.modules
 .map((module) => ({
 module,
 children: module.children.filter((child) =>
 canAccessAdminItem(user, child.label),
 ),
 }))
 .filter(
 ({ module, children }) =>
 canAccessAdminSection(user, module.permissionKey ?? module.label) &&
 children.length > 0,
 )
 .map(({ module, children }) => ({
 label: module.label,
 href: children[0].href,
 icon: module.icon,
 matches: children.map((child) => child.href),
 })),
 })).filter((group) => group.items.length > 0),
 [user],
 );

 return (
 <DashboardShell
 user={user}
 groups={visibleSidebarGroups}
 title={title}
 breadcrumb={breadcrumb}
 centerLabel="Admin Center"
 brandSubtitle="Admin Center"
 dashboardHref="/admin/dashboard"
 notificationsHref="/admin/dashboard?tab=overview&menu=communications&item=notifications"
 profileHref="/admin/dashboard?tab=overview&menu=account&item=profile"
 settingsHref="/admin/dashboard?tab=overview&menu=account&item=profile"
 supportHref="/admin/customers/support"
 footerLabel="Xerin Mart Admin Center"
 searchPlaceholder="Search admin records"
 >
 <ModuleSubNav />
 {children}
 </DashboardShell>
 );
}
