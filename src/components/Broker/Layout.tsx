"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
 ChartColumnIcon,
 DollarCircleIcon,
 PackageIcon,
 ShieldCheckIcon,
 Wallet03Icon,
 LockKeyIcon,
 ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import DashboardShell, {
 type DashboardNavGroup,
} from "@/components/Dashboard/DashboardShell";
import { useAuth } from "@/hooks/useAuth";
import { brokersApi } from "@/lib/api/endpoints/brokers";
import type { Broker } from "@/types/api/broker";

function buildBrokerGroups(approved: boolean): DashboardNavGroup[] {
 const locked = !approved;
 return [
 {
 title: "Broker Workspace",
 key: "broker-workspace",
 icon: DollarCircleIcon,
 items: [
 { href: "/broker/kyc", label: "KYC Verification", icon: ShieldCheckIcon },
 { href: "/broker/products", label: "Own Products", icon: PackageIcon, locked },
 { href: "/broker/opportunities", label: "Opportunities", icon: DollarCircleIcon, locked },
 ],
 },
 {
 title: "Finance",
 key: "broker-finance",
 icon: Wallet03Icon,
 items: [
 { href: "/broker/earnings", label: "Earnings", icon: Wallet03Icon, locked },
 { href: "/broker/wallet", label: "Wallet & Payouts", icon: Wallet03Icon, locked },
 { href: "/broker/analytics", label: "Analytics", icon: ChartColumnIcon, locked },
 ],
 },
 ];
}

const statusLabel: Record<string, string> = {
 pending_kyc: "Complete KYC",
 kyc_submitted: "KYC submitted — awaiting review",
 under_review: "Under review",
 rejected: "Action required",
 suspended: "Suspended",
};

// Routes that stay reachable before KYC approval. Everything else locks.
const OPEN_ROUTES = ["/broker/dashboard", "/broker/kyc"];

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
 const router = useRouter();
 const { user, isAuthenticated, logout } = useAuth();
 const title = brokerTitle(pathname);

 const [broker, setBroker] = useState<Broker | null>(null);
 const [gateError, setGateError] = useState("");
 const [gateChecked, setGateChecked] = useState(false);

 useEffect(() => {
 if (!isAuthenticated) {
 setGateChecked(true);
 return;
 }
 brokersApi
 .me()
 .then(setBroker)
 .catch(() => setGateError("no-profile"))
 .finally(() => setGateChecked(true));
 }, [isAuthenticated]);

 const approved = broker?.status === "approved";
 const routeOpen = OPEN_ROUTES.some((r) => pathname.startsWith(r));
 const locked = gateChecked && broker && !approved && !routeOpen;
 const noProfile = gateChecked && gateError === "no-profile";

 return (
 <DashboardShell
 user={user}
 groups={buildBrokerGroups(approved)}
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
 {noProfile ? (
 <GatePanel
 title="Finish creating your Winga account"
 body="Your broker profile was not found. Complete the Winga onboarding form to activate this workspace."
 action="Complete Winga setup"
 onAction={() => router.push("/onboarding/winga")}
 />
 ) : locked ? (
 <GatePanel
 title="This feature unlocks after KYC verification"
 body={`Your account status: ${statusLabel[broker!.status] || broker!.status}. Wallet, earnings, opportunities and your own product listings unlock once an administrator approves your identity.`}
 action={
 broker!.status === "pending_kyc" || broker!.status === "rejected"
 ? "Complete KYC verification"
 : "View KYC status"
 }
 onAction={() => router.push("/broker/kyc")}
 />
 ) : (
 children
 )}
 </DashboardShell>
 );
}

function GatePanel({
 title,
 body,
 action,
 onAction,
}: {
 title: string;
 body: string;
 action: string;
 onAction: () => void;
}) {
 return (
 <div className="flex min-h-[50vh] items-center justify-center px-4">
 <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
 <HugeiconsIcon icon={LockKeyIcon} size={26} />
 </div>
 <h2 className="mt-5 text-lg font-bold text-foreground">{title}</h2>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
 <button
 onClick={onAction}
 className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
 >
 {action}
 <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
 </button>
 </div>
 </div>
 );
}
