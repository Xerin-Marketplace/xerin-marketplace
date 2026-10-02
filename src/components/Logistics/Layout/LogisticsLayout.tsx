"use client";

import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkBadge01Icon, BellIcon, Package02Icon, CheckListIcon, Location01Icon, PackageCheckIcon, Settings01Icon, TruckIcon, UserMultiple02Icon, Wallet03Icon, WebhookIcon } from "@hugeicons/core-free-icons";

import DashboardShell, {
 type DashboardNavGroup,
} from "@/components/Dashboard/DashboardShell";
import RouteGuard from "@/guards/RouteGuard";
import { authCookies } from "@/lib/auth/cookies";
import { authStorage } from "@/lib/auth/storage";
import { useAuthStore } from "@/store/useAuthStore";

const logisticsGroups: DashboardNavGroup[] = [
 {
 title: "Operations",
 key: "logistics-operations",
 icon: TruckIcon,
 items: [
 { label: "Setup Checklist", href: "/logistics/onboarding", icon: CheckListIcon },
 { label: "Shipments", href: "/logistics/shipments", icon: TruckIcon },
 { label: "Pickup Jobs", href: "/logistics/pickups", icon: PackageCheckIcon },
 {
 label: "Delivery Verification",
 href: "/logistics/delivery-verification",
 icon: CheckmarkBadge01Icon,
 },
 { label: "Notifications", href: "/logistics/notifications", icon: BellIcon },
 ],
 },
 {
 title: "Network & Pricing",
 key: "logistics-network",
 icon: Package02Icon,
 items: [
 { label: "Delivery Addresses", href: "/account/addresses", icon: Location01Icon },
 { label: "Zones & Rates", href: "/logistics/pricing", icon: Package02Icon },
 { label: "Team", href: "/logistics/team", icon: UserMultiple02Icon },
 ],
 },
 {
 title: "Finance & Integration",
 key: "logistics-finance-integration",
 icon: Wallet03Icon,
 items: [
 { label: "Wallet", href: "/logistics/wallet", icon: Wallet03Icon },
 { label: "Integration", href: "/logistics/integration", icon: WebhookIcon },
 { label: "Company Settings", href: "/logistics/settings", icon: Settings01Icon },
 ],
 },
];

function logisticsTitle(pathname: string) {
 const items = logisticsGroups.flatMap((group) => group.items);
 return (
 items.find(
 (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
 )?.label || "Dashboard"
 );
}

function Workspace({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const router = useRouter();
 const user = useAuthStore((state) => state.user);
 const title = logisticsTitle(pathname);

 const signOut = () => {
 authStorage.clearSession();
 authCookies.clearAll();
 useAuthStore.getState().clearSession();
 router.replace("/signin");
 };

 return (
 <DashboardShell
 user={user}
 groups={logisticsGroups}
 dashboardHref="/logistics/dashboard"
 dashboardLabel="Dashboard"
 title={title}
 breadcrumb={title}
 centerLabel="Logistics Center"
 brandSubtitle="Logistics Center"
 notificationsHref="/logistics/notifications"
 profileHref="/logistics/settings"
 settingsHref="/logistics/settings"
 addressesHref="/account/addresses"
 supportHref="/"
 footerLabel="Xerin Mart Logistics Center"
 searchPlaceholder="Search logistics records"
 onSignOut={signOut}
 >
 {children}
 </DashboardShell>
 );
}

export default function LogisticsLayout({ children }: { children: React.ReactNode }) {
 return (
 <RouteGuard logisticsOnly fallbackPath="/account">
 <Workspace>{children}</Workspace>
 </RouteGuard>
 );
}
