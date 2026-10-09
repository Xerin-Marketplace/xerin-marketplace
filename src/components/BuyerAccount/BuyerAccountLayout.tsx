"use client";

import DashboardShell, {
 type DashboardNavGroup,
} from "@/components/Dashboard/DashboardShell";
import RouteGuard from "@/guards/RouteGuard";
import {
 isAdminUser,
 isBrokerUser,
 isLogisticsUser,
 isSellerUser,
} from "@/guards/permissions";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkBadge01Icon, BellIcon, CreditCardIcon, FavouriteIcon, Location01Icon, PackageIcon, SearchFocusIcon, ShieldIcon, StarIcon, UserIcon } from "@hugeicons/core-free-icons";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const customerGroups: DashboardNavGroup[] = [
 {
 title: "Shopping",
 key: "customer-shopping",
 icon: PackageIcon,
 items: [
 { label: "Orders", href: "/account/orders", icon: PackageIcon },
 { label: "Wishlist", href: "/wishlist", icon: FavouriteIcon },
 { label: "Reviews", href: "/account/reviews", icon: StarIcon },
 ],
 },
 {
 title: "Delivery & Protection",
 key: "customer-delivery-protection",
 icon: CheckmarkBadge01Icon,
 items: [
 {
 label: "Confirm Delivery",
 href: "/account/delivery-verification",
 icon: CheckmarkBadge01Icon,
 },
 {
 label: "Pickup Confirmations",
 href: "/account/pickup-verification",
 icon: SearchFocusIcon,
 },
 ],
 },
 {
 title: "Account",
 key: "customer-account",
 icon: UserIcon,
 items: [
 { label: "Payments", href: "/account/payments", icon: CreditCardIcon },
 { label: "Addresses", href: "/account/addresses", icon: Location01Icon },
 { label: "Notifications", href: "/account/notifications", icon: BellIcon },
 { label: "Security", href: "/account/security", icon: ShieldIcon },
 { label: "Account Details", href: "/account/details", icon: UserIcon },
 ],
 },
];

const universalAddressGroups: DashboardNavGroup[] = [
 {
 title: "Shopping Account",
 key: "universal-shopping-account",
 icon: Location01Icon,
 items: [
 { label: "Delivery Addresses", href: "/account/addresses", icon: Location01Icon },
 ],
 },
];

function accountPageTitle(pathname: string) {
 if (pathname.includes("/orders/")) return "Order Details";
 if (pathname === "/account/orders") return "My Orders";
 if (pathname === "/account/payments") return "My Payments";
 if (pathname === "/account/addresses") return "Delivery Addresses";
 if (pathname === "/account/reviews") return "My Reviews";
 if (pathname === "/account/notifications") return "Notifications";
 if (pathname === "/account/security") return "Account Security";
 if (pathname === "/account/details") return "Account Details";
 if (pathname === "/account/delivery-verification") return "Confirm Delivery";
 if (pathname === "/account/pickup-verification") return "Pickup Confirmations";
 return "My Account";
}

function ownerWorkspace(user: ReturnType<typeof useAuthStore.getState>["user"]) {
 if (isSellerUser(user)) {
 return {
 href: "/seller/dashboard",
 label: "Seller Dashboard",
 center: "Seller Center",
 subtitle: "Seller Center",
 notifications: "/seller/account/notifications",
 profile: "/seller/account",
 settings: "/seller/account/security",
 };
 }

 if (isBrokerUser(user)) {
 return {
 href: "/broker/dashboard",
 label: "Broker Dashboard",
 center: "Broker Center",
 subtitle: "Broker Center",
 notifications: "/broker/dashboard",
 profile: "/broker/kyc",
 settings: "/broker/kyc",
 };
 }

 if (isLogisticsUser(user)) {
 return {
 href: "/logistics/dashboard",
 label: "Logistics Dashboard",
 center: "Logistics Center",
 subtitle: "Logistics Center",
 notifications: "/logistics/notifications",
 profile: "/logistics/company-settings",
 settings: "/logistics/company-settings",
 };
 }

 if (isAdminUser(user)) {
 return {
 href: "/admin/dashboard",
 label: "Admin Dashboard",
 center: "Admin Center",
 subtitle: "Admin Center",
 notifications: "/admin/dashboard?tab=notifications",
 profile: "/admin/dashboard",
 settings: "/admin/dashboard?tab=settings",
 };
 }

 return null;
}

export default function BuyerAccountLayout({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const router = useRouter();
 const user = useAuthStore((state) => state.user);
 const hydrated = useAuthStore((state) => state.hasHydrated);
 const { logout } = useAuth();
 const isUniversalAddressPage = pathname === "/account/addresses";

 useEffect(() => {
 if (!hydrated || isUniversalAddressPage) return;
 if (isSellerUser(user)) router.replace("/seller/account");
 else if (isAdminUser(user)) router.replace("/admin/dashboard");
 else if (isLogisticsUser(user)) router.replace("/logistics/dashboard");
 else if (isBrokerUser(user)) router.replace("/broker/dashboard");
 }, [hydrated, isUniversalAddressPage, router, user]);

 const foreignWorkspace = useMemo(
 () => (isUniversalAddressPage ? ownerWorkspace(user) : null),
 [isUniversalAddressPage, user],
 );

 if (
 !hydrated ||
 (!isUniversalAddressPage &&
 (isSellerUser(user) ||
 isAdminUser(user) ||
 isLogisticsUser(user) ||
 isBrokerUser(user)))
 ) {
 return (
 <div className="min-h-screen bg-muted pt-32 text-center text-muted-foreground dark:bg-card">
 Loading your account...
 </div>
 );
 }

 const groups = foreignWorkspace ? universalAddressGroups : customerGroups;
 const dashboardHref = foreignWorkspace?.href || "/account";
 const dashboardLabel = foreignWorkspace?.label || "My Account";
 const centerLabel = foreignWorkspace?.center || "Customer Center";
 const brandSubtitle = foreignWorkspace?.subtitle || "Customer Center";

 return (
 <RouteGuard
 accountTypes={isUniversalAddressPage ? [] : ["customer"]}
 fallbackPath="/signin"
 >
 <DashboardShell
 user={user}
 groups={groups}
 title={accountPageTitle(pathname)}
 breadcrumb={pathname === "/account" ? undefined : accountPageTitle(pathname)}
 centerLabel={centerLabel}
 brandSubtitle={brandSubtitle}
 dashboardHref={dashboardHref}
 dashboardLabel={dashboardLabel}
 notificationsHref={
 foreignWorkspace?.notifications || "/account/notifications"
 }
 profileHref={foreignWorkspace?.profile || "/account/details"}
 settingsHref={foreignWorkspace?.settings || "/account/security"}
 addressesHref="/account/addresses"
 supportHref="/contact"
 footerLabel="Xerin Marketplace"
 searchPlaceholder="Search your account"
 onSignOut={logout}
 >
 {children}
 </DashboardShell>
 </RouteGuard>
 );
}
