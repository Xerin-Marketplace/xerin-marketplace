"use client";

import { usePathname } from "next/navigation";
import {
  BarChart3,
  BadgeDollarSign,
  Package,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import DashboardShell, {
  type DashboardNavGroup,
} from "@/components/Dashboard/DashboardShell";
import { useAuth } from "@/hooks/useAuth";

const brokerGroups: DashboardNavGroup[] = [
  {
    title: "Broker Workspace",
    key: "broker-workspace",
    icon: BadgeDollarSign,
    items: [
      { href: "/broker/kyc", label: "KYC Verification", icon: ShieldCheck },
      { href: "/broker/products", label: "Own Products", icon: Package },
      { href: "/broker/opportunities", label: "Opportunities", icon: BadgeDollarSign },
    ],
  },
  {
    title: "Finance",
    key: "broker-finance",
    icon: WalletCards,
    items: [
      { href: "/broker/earnings", label: "Earnings", icon: WalletCards },
      { href: "/broker/wallet", label: "Wallet & Payouts", icon: WalletCards },
      { href: "/broker/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
];

function brokerTitle(pathname: string) {
  if (pathname.startsWith("/broker/kyc")) return "KYC Verification";
  if (pathname.startsWith("/broker/products")) return "Own Products";
  if (pathname.startsWith("/broker/opportunities")) return "Opportunities";
  if (pathname.startsWith("/broker/earnings")) return "Earnings";
  if (pathname.startsWith("/broker/analytics")) return "Analytics";
  if (pathname.startsWith("/broker/wallet")) return "Wallet & Payouts";
  return "Dashboard";
}

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const title = brokerTitle(pathname);

  return (
    <DashboardShell
      user={user}
      groups={brokerGroups}
      dashboardHref="/broker/dashboard"
      dashboardLabel="Dashboard"
      title={title}
      breadcrumb={title}
      centerLabel="Broker Center"
      brandSubtitle="Broker Center"
      notificationsHref="/account/notifications"
      profileHref="/account"
      settingsHref="/account/security"
      addressesHref="/account/addresses"
      supportHref="/"
      footerLabel="Xerin Marketplace Broker Center"
      searchPlaceholder="Search Broker Center"
      onSignOut={() => logout()}
    >
      {children}
    </DashboardShell>
  );
}
