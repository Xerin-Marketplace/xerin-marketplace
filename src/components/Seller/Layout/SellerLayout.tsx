"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Banknote,
  Box,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  FileCheck2,
  FileText,
  LifeBuoy,
  MessageCircle,
  MessageSquare,
  PackagePlus,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  MapPinned,
  Store,
  Tag,
  WalletCards,
  X,
} from "lucide-react";

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
    icon: ShoppingBag,
    items: [
      { label: "Products", href: "/seller/products", icon: ShoppingBag },
      { label: "Add Product", href: "/seller/products?create=true", icon: PackagePlus },
      { label: "Inventory", href: "/seller/inventory", icon: Box },
    ],
  },
  {
    title: "Sales",
    key: "seller-sales",
    icon: ClipboardList,
    items: [
      { label: "Orders", href: "/seller/orders", icon: ClipboardList },
      { label: "Returns", href: "/seller/returns", icon: RotateCcw },
      { label: "Cancellations", href: "/seller/cancellations", icon: X },
    ],
  },
  {
    title: "Store Operations",
    key: "seller-store-operations",
    icon: Store,
    items: [
      { label: "My Stores", href: "/seller/store", icon: Store },
      { label: "Pickup Locations", href: "/seller/pickup-locations", icon: MapPinned },
      { label: "Promotions", href: "/seller/promotions", icon: Tag },
      { label: "Reviews", href: "/seller/reviews", icon: Star },
      { label: "Product Q&A", href: "/seller/questions", icon: MessageCircle },
      { label: "Messages", href: "/seller/messages", icon: MessageSquare },
    ],
  },
  {
    title: "Finance",
    key: "seller-finance",
    icon: BarChart3,
    items: [
      { label: "Wallet & Earnings", href: "/seller/earnings", icon: BarChart3 },
      { label: "Payout Requests", href: "/seller/payouts", icon: Banknote },
      { label: "Payout Accounts", href: "/seller/kyc?tab=payouts", icon: WalletCards },
      { label: "Transactions", href: "/seller/transactions", icon: CreditCard },
    ],
  },
  {
    title: "Compliance",
    key: "seller-compliance",
    icon: ShieldCheck,
    items: [
      { label: "KYC Verification", href: "/seller/kyc", icon: ShieldCheck },
      { label: "Business Documents", href: "/seller/kyc?tab=documents", icon: FileCheck2 },
    ],
  },
  {
    title: "Account",
    key: "seller-account",
    icon: Settings,
    items: [
      { label: "Account Settings", href: "/seller/account", icon: Settings },
      { label: "Security", href: "/seller/account/security", icon: CircleUserRound },
      { label: "Marketplace Home", href: "/", icon: LifeBuoy },
    ],
  },
];

const activationGroups: DashboardNavGroup[] = [
  {
    title: "Activation",
    key: "seller-activation",
    icon: ShieldCheck,
    items: [
      { label: "KYC Verification", href: "/seller/kyc", icon: ShieldCheck },
      { label: "Business Documents", href: "/seller/documents", icon: FileText },
    ],
  },
  {
    title: "Account",
    key: "seller-activation-account",
    icon: Settings,
    items: [
      { label: "Account Settings", href: "/seller/account", icon: Settings },
      { label: "Security", href: "/seller/account/security", icon: CircleUserRound },
      { label: "Marketplace Home", href: "/", icon: LifeBuoy },
    ],
  },
];

const suspendedComplianceGroups: DashboardNavGroup[] = [
  {
    title: "Compliance Hold",
    key: "seller-compliance-hold",
    icon: ShieldCheck,
    items: [
      { label: "Business Documents", href: "/seller/kyc?tab=documents", icon: FileCheck2 },
    ],
  },
  {
    title: "Existing Obligations",
    key: "seller-existing-obligations",
    icon: ClipboardList,
    items: [
      { label: "Orders", href: "/seller/orders", icon: ClipboardList },
      { label: "Returns", href: "/seller/returns", icon: RotateCcw },
      { label: "Cancellations", href: "/seller/cancellations", icon: X },
      { label: "Messages", href: "/seller/messages", icon: MessageSquare },
    ],
  },
  {
    title: "Account",
    key: "seller-suspended-account",
    icon: Settings,
    items: [
      { label: "Account Settings", href: "/seller/account", icon: Settings },
      { label: "Security", href: "/seller/account/security", icon: CircleUserRound },
      { label: "Marketplace Home", href: "/", icon: LifeBuoy },
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
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <ShieldCheck className="mt-0.5 shrink-0" size={19} />
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              Selling temporarily suspended — Business Licence expired
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
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <ShieldCheck className="mt-0.5 shrink-0" size={19} />
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
