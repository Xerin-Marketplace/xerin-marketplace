"use client";

import "../admin-ui.css";
import { ReactNode, useMemo } from "react";
import {
  BarChart3,
  Bell,
  Boxes,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  FileCheck2,
  LifeBuoy,
  LockKeyhole,
  Megaphone,
  Package,
  PackageCheck,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Users,
  UserPlus,
  KeyRound,
  WalletCards,
  Truck,
  Globe2,
  X,
  Scale,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

import DashboardShell, {
  type DashboardNavGroup,
  type DashboardShellUser,
} from "@/components/Dashboard/DashboardShell";
import { authStorage } from "@/lib/auth/storage";
import { canAccessAdminItem, canAccessAdminSection } from "@/lib/auth/admin-access";

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

type NavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

export type SidebarGroup = {
  title: string;
  key: AdminTab | string;
  items: NavItem[];
  icon: LucideIcon;
};

const sidebarGroups: SidebarGroup[] = [
  {
    title: "Marketplace Operations",
    key: "orders",
    icon: Truck,
    items: [
      { label: "Fulfilment Workflow", href: "/admin/operations/workflow", icon: PackageCheck },
      { label: "Financial Flow", href: "/admin/operations/finance-flow", icon: WalletCards },
      { label: "Command Center", href: "/admin/operations/command-center", icon: ShieldCheck },
      { label: "End-to-End QA", href: "/admin/operations/qa", icon: FileCheck2 },
    ],
  },
  {
    title: "Catalog",
    key: "products",
    icon: Package,
    items: [
      { label: "Products", href: "/admin/dashboard?tab=products&menu=catalog&item=products", icon: ShoppingBag },
      { label: "Categories", href: "/admin/dashboard?tab=categories&menu=catalog&item=categories", icon: Boxes },
      { label: "Brands", href: "/admin/dashboard?tab=brands&menu=catalog&item=brands", icon: Tag },
      // { label: "Product Reviews", href: "/admin/dashboard?tab=reviews&menu=catalog&item=product-reviews", icon: FileCheck2 },
    ],
  },
  {
    title: "Orders",
    key: "orders",
    icon: ShoppingBag,
    items: [
      { label: "All Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=all-orders&orders_tab=all", icon: ClipboardList },
      { label: "Pending Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=pending-orders&orders_tab=pending", icon: ClipboardList },
      { label: "Processing Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=processing-orders&orders_tab=processing", icon: ClipboardList },
      { label: "Completed Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=completed-orders&orders_tab=completed", icon: ClipboardList },
      { label: "Cancelled Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=cancelled-orders&orders_tab=cancelled", icon: X },
      { label: "Order Tracking", href: "/admin/dashboard?tab=orders&menu=orders&item=order-tracking&orders_tab=tracking", icon: Search },
    ],
  },
  {
    title: "Inventory",
    key: "inventory",
    icon: Boxes,
    items: [
      { label: "Stock Overview", href: "/admin/dashboard?tab=inventory&menu=inventory&item=stock-overview&inventory_tab=stock-overview", icon: Boxes },
      { label: "Warehouses", href: "/admin/dashboard?tab=inventory&menu=inventory&item=warehouses&inventory_tab=warehouses", icon: Store },
      { label: "Stock Adjustments", href: "/admin/dashboard?tab=inventory&menu=inventory&item=stock-adjustments&inventory_tab=stock-adjustments", icon: SlidersHorizontal },
      { label: "Low Stock Products", href: "/admin/dashboard?tab=inventory&menu=inventory&item=low-stock-products&inventory_tab=low-stock-products", icon: Package },
    ],
  },
  {
    title: "Customers",
    key: "users",
    icon: Users,
    items: [
      { label: "Customer Reviews", href: "/admin/customers/reviews", icon: FileCheck2 },
      { label: "Customer Support", href: "/admin/customers/support", icon: LifeBuoy },
    ],
  },
  {
    title: "Sellers",
    key: "sellers",
    icon: Store,
    items: [
      { label: "All Sellers", href: "/admin/dashboard?tab=sellers&menu=sellers&item=all-sellers", icon: Store },
      { label: "Seller Applications", href: "/admin/dashboard?tab=sellers&menu=sellers&item=seller-applications", icon: ShieldCheck },
      { label: "Seller Products", href: "/admin/dashboard?tab=sellers&menu=sellers&item=seller-products", icon: Package },
      { label: "Seller Orders", href: "/admin/dashboard?tab=sellers&menu=sellers&item=seller-orders", icon: ClipboardList },
      { label: "Seller Performance", href: "/admin/dashboard?tab=sellers&menu=sellers&item=seller-performance", icon: BarChart3 },
    ],
  },
  {
    title: "Brokers",
    key: "brokers",
    icon: Users,
    items: [
      { label: "Brokers & KYC Review", href: "/admin/brokers", icon: ShieldCheck },
      { label: "Broker Security & Risk", href: "/admin/brokers/security", icon: LockKeyhole },
      { label: "Broker Wallet Payouts", href: "/admin/brokers/payouts", icon: WalletCards },
    ],
  },
  {
    title: "Payments",
    key: "finance",
    icon: CreditCard,
    items: [
      { label: "Payments Dashboard", href: "?tab=finance&menu=payments&item=payments-dashboard" },
      { label: "Transactions", href: "?tab=finance&menu=payments&item=transactions" },
      { label: "Payment Methods", href: "?tab=finance&menu=payments&item=payment-methods" },
      { label: "Payment Providers", href: "?tab=finance&menu=payments&item=payment-providers" },
      { label: "Refunds", href: "?tab=finance&menu=payments&item=refunds" },
      { label: "Disputes & Chargebacks", href: "?tab=finance&menu=payments&item=disputes-chargebacks" },
      { label: "Seller Payout Accounts", href: "?tab=finance&menu=payments&item=seller-payout-accounts" },
      { label: "Seller Payouts", href: "?tab=finance&menu=payments&item=seller-payouts" },
      { label: "Pending Payouts", href: "?tab=finance&menu=payments&item=pending-payouts" },
      { label: "Failed Payments", href: "?tab=finance&menu=payments&item=failed-payments" },
      { label: "Fraud & Risk", href: "?tab=finance&menu=payments&item=fraud-risk" },
      { label: "Reconciliation", href: "?tab=finance&menu=payments&item=reconciliation" },
      { label: "Currencies & FX", href: "?tab=finance&menu=payments&item=currencies-fx" },
      { label: "Countries", href: "?tab=finance&menu=payments&item=countries" },
      { label: "Fees & Commissions", href: "?tab=finance&menu=payments&item=fees-commissions" },
      { label: "Payment Reports", href: "?tab=finance&menu=payments&item=payment-reports" },
      { label: "Payment Audit Logs", href: "?tab=finance&menu=payments&item=payment-audit-logs" },
    ],
  },
  {
    title: "Advertising",
    key: "products",
    icon: Megaphone,
    items: [
      { label: "All Advertisements", href: "/admin/dashboard?tab=products&menu=advertising&item=all-advertisements", icon: Megaphone },
      { label: "Create Advertisement", href: "/admin/dashboard?tab=products&menu=advertising&item=create-advertisement", icon: Megaphone },
      { label: "Active Ads", href: "/admin/dashboard?tab=products&menu=advertising&item=active-ads", icon: Megaphone },
      { label: "Scheduled Ads", href: "/admin/dashboard?tab=products&menu=advertising&item=scheduled-ads", icon: Megaphone },
      { label: "Paused Ads", href: "/admin/dashboard?tab=products&menu=advertising&item=paused-ads", icon: Megaphone },
      { label: "Expired Ads", href: "/admin/dashboard?tab=products&menu=advertising&item=expired-ads", icon: Megaphone },
      { label: "Advertisement Analytics", href: "/admin/dashboard?tab=products&menu=advertising&item=advertisement-analytics", icon: Megaphone },
    ],
  },
  {
    title: "Promotions",
    key: "products",
    icon: Tag,
    items: [
      { label: "Coupons", href: "/admin/dashboard?tab=products&menu=promotions&item=coupons", icon: Tag },
      { label: "Discounts", href: "/admin/dashboard?tab=products&menu=promotions&item=discounts", icon: Tag },
      { label: "Campaigns", href: "/admin/dashboard?tab=products&menu=promotions&item=campaigns", icon: Megaphone },
    ],
  },
  {
    title: "Disputes",
    key: "orders",
    icon: Scale,
    items: [
      { label: "All Disputes", href: "/admin/disputes", icon: Scale },
      { label: "Open Disputes", href: "/admin/disputes?status=open", icon: Scale },
      { label: "Resolved Disputes", href: "/admin/disputes?status=resolved", icon: FileCheck2 },
    ],
  },
  {
    title: "Analytics",
    key: "analytics",
    icon: BarChart3,
    items: [
      { label: "Sales Reports", href: "/admin/analytics?report=sales", icon: BarChart3 },
      { label: "Order Reports", href: "/admin/analytics?report=orders", icon: ClipboardList },
      { label: "Product Reports", href: "/admin/analytics?report=products", icon: Package },
      { label: "Customer Reports", href: "/admin/analytics?report=customers", icon: Users },
    ],
  },
  {
    title: "Communications",
    key: "overview",
    icon: Megaphone,
    items: [
      { label: "Notifications", href: "/admin/dashboard?tab=overview&menu=communications&item=notifications", icon: Bell },
      { label: "Email Messages", href: "/admin/dashboard?tab=overview&menu=communications&item=email-messages", icon: Bell },
      { label: "SMS Messages", href: "/admin/dashboard?tab=overview&menu=communications&item=sms-messages", icon: Bell },
    ],
  },
  {
    title: "User Management",
    key: "users",
    icon: ShieldCheck,
    items: [
      { label: "Users", href: "/admin/dashboard?tab=users&menu=user-management&item=users", icon: Users },
      { label: "Add New User", href: "/admin/dashboard?tab=users&menu=user-management&item=add-new-user", icon: UserPlus },
      { label: "Roles", href: "/admin/dashboard?tab=users&menu=user-management&item=roles", icon: ShieldCheck },
      { label: "Permissions", href: "/admin/dashboard?tab=users&menu=user-management&item=permissions", icon: KeyRound },
      { label: "Active Sessions", href: "/admin/dashboard?tab=users&menu=user-management&item=active-sessions", icon: LockKeyhole },
    ],
  },
  {
    title: "Marketplace Settings",
    key: "overview",
    icon: SlidersHorizontal,
    items: [
      { label: "Marketplace Rules", href: "/admin/dashboard?tab=overview&menu=marketplace-settings&item=marketplace-rules", icon: SlidersHorizontal },
      { label: "Commission Rules", href: "/admin/dashboard?tab=overview&menu=marketplace-settings&item=commission-rules", icon: Scale },
    ],
  },
  {
    title: "Logistics",
    key: "overview",
    icon: Truck,
    items: [
      { label: "Company Approvals", href: "/admin/logistics/approvals", icon: FileCheck2 },
      { label: "Logistics Companies", href: "/admin/dashboard?tab=overview&menu=logistics&item=logistics-companies", icon: Store },
      { label: "Delivery Services", href: "/admin/dashboard?tab=overview&menu=logistics&item=delivery-services", icon: Truck },
      { label: "Shipping Zones", href: "/admin/dashboard?tab=overview&menu=logistics&item=shipping-zones", icon: Globe2 },
      { label: "Shipping Rates", href: "/admin/dashboard?tab=overview&menu=logistics&item=shipping-rates", icon: WalletCards },
      { label: "API & Webhooks", href: "/admin/dashboard?tab=overview&menu=logistics&item=api-webhooks", icon: Settings },
    ],
  },
  {
    title: "Finance Configuration",
    key: "finance",
    icon: WalletCards,
    items: [
      { label: "Finance Settings", href: "/admin/dashboard?tab=finance&menu=finance-configuration&item=finance-settings", icon: Settings },
      { label: "Escrow Holds", href: "/admin/dashboard?tab=finance&menu=finance-configuration&item=escrow-holds", icon: LockKeyhole },
    ],
  },
  {
    title: "System Management",
    key: "overview",
    icon: Settings,
    items: [
      { label: "Audit Logs", href: "/admin/dashboard?tab=overview&menu=system-management&item=audit-logs", icon: FileCheck2 },
      { label: "System Events", href: "/admin/dashboard?tab=overview&menu=system-management&item=system-events", icon: ShieldCheck },
      { label: "Background Jobs", href: "/admin/dashboard?tab=overview&menu=system-management&item=background-jobs", icon: Settings },
      { label: "Application Settings", href: "/admin/dashboard?tab=overview&menu=system-management&item=application-settings", icon: Settings },
    ],
  },
  {
    title: "Account",
    key: "overview",
    icon: CircleUserRound,
    items: [
      { label: "Logout", href: "/signout", icon: X },
    ],
  },
];

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
      sidebarGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            canAccessAdminItem(user, item.label),
          ),
        }))
        .filter(
          (group) =>
            canAccessAdminSection(user, group.title) && group.items.length > 0,
        ),
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
      supportHref="/admin/support"
      footerLabel="Xerin Market Admin Center"
      searchPlaceholder="Search admin records"
    >
      {children}
    </DashboardShell>
  );
}
