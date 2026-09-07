"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  Boxes,
  ListChecks,
  MapPin,
  PackageCheck,
  Settings,
  Truck,
  Users,
  WalletCards,
  Webhook,
} from "lucide-react";

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
    icon: Truck,
    items: [
      { label: "Setup Checklist", href: "/logistics/onboarding", icon: ListChecks },
      { label: "Shipments", href: "/logistics/shipments", icon: Truck },
      { label: "Pickup Jobs", href: "/logistics/pickups", icon: PackageCheck },
      {
        label: "Delivery Verification",
        href: "/logistics/delivery-verification",
        icon: BadgeCheck,
      },
      { label: "Notifications", href: "/logistics/notifications", icon: Bell },
    ],
  },
  {
    title: "Network & Pricing",
    key: "logistics-network",
    icon: Boxes,
    items: [
      { label: "Delivery Addresses", href: "/account/addresses", icon: MapPin },
      { label: "Zones & Rates", href: "/logistics/pricing", icon: Boxes },
      { label: "Team", href: "/logistics/team", icon: Users },
    ],
  },
  {
    title: "Finance & Integration",
    key: "logistics-finance-integration",
    icon: WalletCards,
    items: [
      { label: "Wallet", href: "/logistics/wallet", icon: WalletCards },
      { label: "Integration", href: "/logistics/integration", icon: Webhook },
      { label: "Company Settings", href: "/logistics/settings", icon: Settings },
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
      footerLabel="Xerin Marketplace Logistics Center"
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
