"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartColumnIcon, Money03Icon, PackageIcon, UserCircleIcon, Task01Icon, CreditCardIcon, FileCheckIcon, File01Icon, LifebuoyIcon, Message01Icon, Chat01Icon, PackageAddIcon, RotateLeft01Icon, Settings01Icon, ShieldCheckIcon, ShoppingBag01Icon, StarIcon, Location05Icon, Store01Icon, Tag01Icon, Wallet03Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

import DashboardShell, {
 type DashboardNavGroup,
} from "@/components/Dashboard/DashboardShell";
import { authCookies } from "@/lib/auth/cookies";
import { logout } from "@/lib/api/endpoints/auth";
import { sellersApi } from "@/lib/api/endpoints/sellers";
import { authStorage } from "@/lib/auth/storage";
import { useAuthStore } from "@/store/useAuthStore";
import type { Seller } from "@/types/api/seller";

type User = {
 first_name?: string;
 last_name?: string;
 email?: string;
 account_type?: string;
 roles?: string[];
 permissions?: string[];
 seller_status?: string | null;
};

const approvedGroups: DashboardNavGroup[] = [
 {
 title: "Catalog",
 key: "seller-catalog",
 icon: ShoppingBag01Icon,
 items: [
 { label: "Products", href: "/seller/products", icon: ShoppingBag01Icon },
 { label: "Add Product", href: "/seller/products?create=true", icon: PackageAddIcon },
 { label: "Inventory", href: "/seller/inventory", icon: PackageIcon },
 ],
 },
 {
 title: "Sales",
 key: "seller-sales",
 icon: Task01Icon,
 items: [
 { label: "Orders", href: "/seller/orders", icon: Task01Icon },
 { label: "Returns", href: "/seller/returns", icon: RotateLeft01Icon },
 { label: "Cancellations", href: "/seller/cancellations", icon: Cancel01Icon },
 ],
 },
 {
 title: "Store Operations",
 key: "seller-store-operations",
 icon: Store01Icon,
 items: [
 { label: "My Stores", href: "/seller/store", icon: Store01Icon },
 { label: "Pickup Locations", href: "/seller/pickup-locations", icon: Location05Icon },
 { label: "Promotions", href: "/seller/promotions", icon: Tag01Icon },
 { label: "Reviews", href: "/seller/reviews", icon: StarIcon },
 { label: "Product Q&A", href: "/seller/questions", icon: Message01Icon },
 { label: "Messages", href: "/seller/messages", icon: Chat01Icon },
 ],
 },
 {
 title: "Finance",
 key: "seller-finance",
 icon: ChartColumnIcon,
 items: [
 { label: "Wallet & Earnings", href: "/seller/earnings", icon: ChartColumnIcon },
 { label: "Payout Requests", href: "/seller/payouts", icon: Money03Icon },
 { label: "Payout Accounts", href: "/seller/kyc?tab=payouts", icon: Wallet03Icon },
 { label: "Transactions", href: "/seller/transactions", icon: CreditCardIcon },
 ],
 },
 {
 title: "Compliance",
 key: "seller-compliance",
 icon: ShieldCheckIcon,
 items: [
 { label: "KYC Verification", href: "/seller/kyc", icon: ShieldCheckIcon },
 { label: "Business Documents", href: "/seller/kyc?tab=documents", icon: FileCheckIcon },
 ],
 },
 {
 title: "Account",
 key: "seller-account",
 icon: Settings01Icon,
 items: [
 { label: "Account Settings", href: "/seller/account", icon: Settings01Icon },
 { label: "Security", href: "/seller/account/security", icon: UserCircleIcon },
 { label: "Marketplace Home", href: "/", icon: LifebuoyIcon },
 ],
 },
];

const activationGroups: DashboardNavGroup[] = [
 {
 title: "Activation",
 key: "seller-activation",
 icon: ShieldCheckIcon,
 items: [
 { label: "KYC Verification", href: "/seller/kyc", icon: ShieldCheckIcon },
 { label: "Business Documents", href: "/seller/documents", icon: File01Icon },
 ],
 },
 {
 title: "Account",
 key: "seller-activation-account",
 icon: Settings01Icon,
 items: [
 { label: "Account Settings", href: "/seller/account", icon: Settings01Icon },
 { label: "Security", href: "/seller/account/security", icon: UserCircleIcon },
 { label: "Marketplace Home", href: "/", icon: LifebuoyIcon },
 ],
 },
];

const suspendedComplianceGroups: DashboardNavGroup[] = [
 {
 title: "Compliance Hold",
 key: "seller-compliance-hold",
 icon: ShieldCheckIcon,
 items: [
 { label: "Business Documents", href: "/seller/kyc?tab=documents", icon: FileCheckIcon },
 ],
 },
 {
 title: "Existing Obligations",
 key: "seller-existing-obligations",
 icon: Task01Icon,
 items: [
 { label: "Orders", href: "/seller/orders", icon: Task01Icon },
 { label: "Returns", href: "/seller/returns", icon: RotateLeft01Icon },
 { label: "Cancellations", href: "/seller/cancellations", icon: Cancel01Icon },
 { label: "Messages", href: "/seller/messages", icon: Chat01Icon },
 ],
 },
 {
 title: "Account",
 key: "seller-suspended-account",
 icon: Settings01Icon,
 items: [
 { label: "Account Settings", href: "/seller/account", icon: Settings01Icon },
 { label: "Security", href: "/seller/account/security", icon: UserCircleIcon },
 { label: "Marketplace Home", href: "/", icon: LifebuoyIcon },
 ],
 },
];

const suspendedAllowedPaths = [
 "/seller/dashboard",
 "/seller/kyc",
 "/seller/documents",
 "/seller/orders",
 "/seller/returns",
 "/seller/cancellations",
 "/seller/messages",
 "/seller/account",
 "/",
];

const pendingAllowedPaths = [
 "/seller/dashboard",
 "/seller/kyc",
 "/seller/documents",
 "/seller/account",
 "/seller/account/profile",
 "/seller/account/security",
 "/",
];

function sellerPageTitle(pathname: string) {
 if (pathname.includes("/account/security")) return "Security";
 if (pathname.includes("/account/notifications")) return "Notifications";
 if (pathname.includes("/account/profile")) return "Seller Profile";
 if (pathname.includes("/account")) return "Account Settings";
 if (pathname.includes("/products")) return "Products";
 if (pathname.includes("/inventory")) return "Inventory";
 if (pathname.includes("/documents")) return "Business Documents";
 if (pathname.includes("/kyc")) return "KYC Verification";
 if (pathname.includes("/orders/")) return "Order Details";
 if (pathname.includes("/orders")) return "Orders";
 if (pathname.includes("/returns")) return "Returns";
 if (pathname.includes("/cancellations")) return "Cancellations";
 if (pathname.includes("/promotions")) return "Promotions";
 if (pathname.includes("/reviews")) return "Reviews";
 if (pathname.includes("/questions")) return "Product Q&A";
 if (pathname.includes("/messages")) return "Messages";
 if (pathname.includes("/payouts")) return "Payout Requests";
 if (pathname.includes("/earnings")) return "Wallet & Earnings";
 if (pathname.includes("/transactions")) return "Transactions";
 if (pathname.includes("/pickup-locations")) return "Pickup Locations";
 if (pathname.includes("/store")) return "My Stores";
 if (pathname === "/seller/dashboard") return "Dashboard";
 return "Seller Center";
}

export default function SellerLayout({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const router = useRouter();
 const user = authStorage.getUser<User>();
 const [seller, setSeller] = useState<Seller | null>(null);
 const [sellerLoaded, setSellerLoaded] = useState(false);

 useEffect(() => {
 let active = true;
 sellersApi
 .getMe()
 .then((value) => {
 if (!active) return;
 setSeller(value);
 setSellerLoaded(true);
 })
 .catch(() => {
 if (!active) return;
 setSeller(null);
 setSellerLoaded(true);
 });
 return () => {
 active = false;
 };
 }, []);

 const sellerStatus = seller?.status || user?.seller_status || "pending";
 const isApprovedSeller = sellerStatus === "approved";
 const isLicenceExpiredHold =
 sellerStatus === "suspended" &&
 seller?.suspension_reason === "business_license_expired";

 const groups = isApprovedSeller
 ? approvedGroups
 : isLicenceExpiredHold
 ? suspendedComplianceGroups
 : activationGroups;

 useEffect(() => {
 if (!sellerLoaded || isApprovedSeller) return;
 const allowedPaths = isLicenceExpiredHold ? suspendedAllowedPaths : pendingAllowedPaths;
 const allowed = allowedPaths.some(
 (path) => pathname === path || pathname.startsWith(`${path}/`),
 );
 if (!allowed) router.replace("/seller/dashboard");
 }, [isApprovedSeller, isLicenceExpiredHold, pathname, router, sellerLoaded]);

 const title = sellerPageTitle(pathname);
 const breadcrumb = useMemo(
 () => (pathname.includes("/account/") ? `Account / ${title}` : title),
 [pathname, title],
 );

 const signOut = async () => {
 try {
 const refresh = authStorage.getRefreshToken();
 if (refresh) await logout({ refresh_token: refresh });
 } catch {
 // Local logout still runs if the API session is already invalid.
 } finally {
 authStorage.clearSession();
 authCookies.clearAll();
 useAuthStore.getState().clearSession();
 window.location.assign("/signin");
 }
 };

 return (
 <DashboardShell
 user={user}
 groups={groups}
 dashboardHref="/seller/dashboard"
 dashboardLabel="Dashboard"
 title={title}
 breadcrumb={breadcrumb}
 centerLabel="Seller Center"
 brandSubtitle="Seller Center"
 notificationsHref="/seller/account/notifications"
 profileHref="/seller/account/profile"
 settingsHref="/seller/account"
 addressesHref="/account/addresses"
 supportHref="/"
 footerLabel="Xerin Marketplace Seller Center"
 searchPlaceholder={isApprovedSeller ? "Search seller records" : "Search Seller Center"}
 onSignOut={signOut}
 >
 {isLicenceExpiredHold && sellerLoaded && (
 <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-light-4 bg-red-light-6 px-4 py-3.5 text-red-900 dark:border-red-500/30 dark:bg-destructive/10 dark:text-red-200">
 <HugeiconsIcon icon={ShieldCheckIcon} className="mt-0.5 shrink-0" size={18} />
 <div className="min-w-0">
 <p className="text-sm font-semibold">
 Selling temporarily suspended · Business Licence expired
 </p>
 <p className="mt-0.5 text-xs leading-5 opacity-80">
 New listings, inventory changes and new customer sales are blocked. You can still complete existing orders. Renew your Business Licence in Business Documents to restore selling access after Marketplace approval.
 </p>
 <Link
 href="/seller/kyc?tab=documents"
 className="mt-2 inline-flex text-xs font-bold underline underline-offset-2"
 >
 View Business Documents
 </Link>
 </div>
 </div>
 )}

 {!isApprovedSeller &&
 !isLicenceExpiredHold &&
 sellerLoaded &&
 pathname !== "/seller/dashboard" && (
 <div className="mb-5 flex items-start gap-3 rounded-xl border border-yellow-light-2 bg-yellow-light-4 px-4 py-3.5 text-amber-900 dark:border-amber-500/30 dark:bg-warning/10 dark:text-amber-200">
 <HugeiconsIcon icon={ShieldCheckIcon} className="mt-0.5 shrink-0" size={18} />
 <div>
 <p className="text-sm font-semibold">Seller activation in progress</p>
 <p className="mt-0.5 text-xs leading-5 opacity-80">
 Complete KYC and required business documents. Commerce features will unlock after your seller account is approved.
 </p>
 </div>
 </div>
 )}

 {children}
 </DashboardShell>
 );
}
