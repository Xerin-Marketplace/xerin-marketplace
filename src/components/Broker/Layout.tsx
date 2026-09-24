"use client";

import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartColumnIcon, DollarCircleIcon, PackageIcon, ShieldCheckIcon, Wallet03Icon } from "@hugeicons/core-free-icons";

import DashboardShell, {
 type DashboardNavGroup,
} from "@/components/Dashboard/DashboardShell";
import { useAuth } from "@/hooks/useAuth";

const brokerGroups: DashboardNavGroup[] = [
 {
 title: "Broker Workspace",
 key: "broker-workspace",
 icon: DollarCircleIcon,
 items: [
 { href: "/broker/kyc", label: "KYC Verification", icon: ShieldCheckIcon },
 { href: "/broker/products", label: "Own Products", icon: PackageIcon },
 { href: "/broker/opportunities", label: "Opportunities", icon: DollarCircleIcon },
 ],
 },
 {
 title: "Finance",
 key: "broker-finance",
 icon: Wallet03Icon,
 items: [
 { href: "/broker/earnings", label: "Earnings", icon: Wallet03Icon },
 { href: "/broker/wallet", label: "Wallet & Payouts", icon: Wallet03Icon },
 { href: "/broker/analytics", label: "Analytics", icon: ChartColumnIcon },
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
