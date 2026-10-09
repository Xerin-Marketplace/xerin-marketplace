"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo } from "react";

import {
 ADMIN_MODULES,
 getActiveAdminModule,
 isAdminNavHrefActive,
 hrefSpecificity,
} from "@/components/Admin/navigation";
import { authStorage } from "@/lib/auth/storage";
import { canAccessAdminItem } from "@/lib/auth/admin-access";
import type { DashboardShellUser } from "@/components/Dashboard/DashboardShell";

/**
 * Secondary navigation rendered at the top of a module page.
 * The sidebar only exposes top-level modules; this bar exposes the
 * module's existing destinations as horizontally-scrollable tabs.
 */
export default function ModuleSubNav() {
 const pathname = usePathname();
 const searchParams = useSearchParams();
 const user = authStorage.getUser<DashboardShellUser>();

 const activeModule = getActiveAdminModule(pathname, searchParams);

 const children = useMemo(
 () =>
 (activeModule?.children ?? []).filter((child) =>
 canAccessAdminItem(user, child.label),
 ),
 [activeModule, user],
 );

 if (!activeModule || children.length <= 1) return null;

 // Same "most specific href wins" rule used for module detection, so only
 // one tab is ever marked active.
 let best = -1;
 children.forEach((child) => {
 if (isAdminNavHrefActive(child.href, pathname, searchParams)) {
 best = Math.max(best, hrefSpecificity(child.href));
 }
 });

 return (
 <nav
 aria-label={`${activeModule.label} sections`}
 className="sticky top-[73px] z-20 -mx-4 -mt-4 mb-2 overflow-x-auto bg-[#f7f7f9] px-4 pb-0.5 pt-1 [scrollbar-width:none] dark:bg-[#0c0f14] sm:-mx-6 sm:px-6 lg:-mx-7 lg:px-7 2xl:-mx-8 2xl:px-8 [&::-webkit-scrollbar]:hidden"
 >
 <div className="flex min-w-max items-center gap-1 border-b border-border">
 {children.map((child) => {
 const active =
 isAdminNavHrefActive(child.href, pathname, searchParams) &&
 hrefSpecificity(child.href) === best;
 return (
 <Link
 key={child.href}
 href={child.href}
 aria-current={active ? "page" : undefined}
 className={`relative whitespace-nowrap px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
 active
 ? "text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary"
 : "text-muted-foreground hover:text-foreground"
 }`}
 >
 <span className="inline-flex items-center gap-1.5">
 {child.icon && (
 <HugeiconsIcon icon={child.icon} size={14} className="opacity-70" />
 )}
 {child.label}
 </span>
 </Link>
 );
 })}
 </div>
 </nav>
 );
}
