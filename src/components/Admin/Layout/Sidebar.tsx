"use client";

import "../admin-ui.css";
import { ReactNode, useMemo } from "react";
import { ChartColumnIcon, BellIcon, Package02Icon, UserCircleIcon, Task01Icon, CreditCardIcon, FileCheckIcon, LifebuoyIcon, LockKeyIcon, Megaphone01Icon, PackageIcon, PackageCheckIcon, Search01Icon, Settings01Icon, ShieldCheckIcon, ShoppingBag01Icon, Store01Icon, Tag01Icon, UserMultiple02Icon, UserAdd01Icon, Key01Icon, Wallet03Icon, TruckIcon, Globe02Icon, Cancel01Icon, JusticeScale01Icon, PreferenceHorizontalIcon, DashboardSquare01Icon, Mail01Icon, DatabaseIcon } from "@hugeicons/core-free-icons";

import DashboardShell, {
 type DashboardNavGroup,
 type DashboardShellUser,
} from "@/components/Dashboard/DashboardShell";
import { authStorage } from "@/lib/auth/storage";
import { canAccessAdminItem, canAccessAdminSection } from "@/lib/auth/admin-access";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";

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
 icon?: IconSvgElement;
};

export type SidebarGroup = {
 title: string;
 key: AdminTab | string;
 items: NavItem[];
 icon: IconSvgElement;
};

const sidebarGroups: SidebarGroup[] = [
 {
 title: "Store Operations",
 key: "orders",
 icon: TruckIcon,
 items: [
 { label: "Fulfilment Workflow", href: "/admin/operations/workflow", icon: PackageCheckIcon },
 { label: "Financial Flow", href: "/admin/dashboard?tab=finance&menu=payments&item=payments-dashboard", icon: Wallet03Icon },
 { label: "Command Center", href: "/admin/dashboard", icon: ShieldCheckIcon },
 { label: "End-to-End QA", href: "/admin/operations/qa", icon: FileCheckIcon },
 ],
 },
 {
 title: "Catalog",
 key: "products",
 icon: PackageIcon,
 items: [
 { label: "Products", href: "/admin/dashboard?tab=products&menu=catalog&item=products", icon: ShoppingBag01Icon },
 { label: "Categories", href: "/admin/dashboard?tab=categories&menu=catalog&item=categories", icon: Package02Icon },
 { label: "Brands", href: "/admin/dashboard?tab=brands&menu=catalog&item=brands", icon: Tag01Icon },
 // { label: "Product Reviews", href: "/admin/dashboard?tab=reviews&menu=catalog&item=product-reviews", icon: FileCheckIcon },
 ],
 },
 {
 title: "Orders",
 key: "orders",
 icon: ShoppingBag01Icon,
 items: [
 { label: "All Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=all-orders&orders_tab=all", icon: Task01Icon },
 { label: "Pending Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=pending-orders&orders_tab=pending", icon: Task01Icon },
 { label: "Processing Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=processing-orders&orders_tab=processing", icon: Task01Icon },
 { label: "Completed Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=completed-orders&orders_tab=completed", icon: Task01Icon },
 { label: "Cancelled Orders", href: "/admin/dashboard?tab=orders&menu=orders&item=cancelled-orders&orders_tab=cancelled", icon: Cancel01Icon },
 { label: "Order Tracking", href: "/admin/dashboard?tab=orders&menu=orders&item=order-tracking&orders_tab=tracking", icon: Search01Icon },
 ],
 },
 {
 title: "Inventory",
 key: "inventory",
 icon: Package02Icon,
 items: [
 { label: "Stock Overview", href: "/admin/dashboard?tab=inventory&menu=inventory&item=stock-overview&inventory_tab=stock-overview", icon: Package02Icon },
 { label: "Warehouses", href: "/admin/dashboard?tab=inventory&menu=inventory&item=warehouses&inventory_tab=warehouses", icon: Store01Icon },
 { label: "Stock Adjustments", href: "/admin/dashboard?tab=inventory&menu=inventory&item=stock-adjustments&inventory_tab=stock-adjustments", icon: PreferenceHorizontalIcon },
 { label: "Low Stock Products", href: "/admin/dashboard?tab=inventory&menu=inventory&item=low-stock-products&inventory_tab=low-stock-products", icon: PackageIcon },
 ],
 },
 {
 title: "Customers",
 key: "users",
 icon: UserMultiple02Icon,
 items: [
 { label: "Customer Reviews", href: "/admin/customers/reviews", icon: FileCheckIcon },
 { label: "Customer Support", href: "/admin/customers/support", icon: LifebuoyIcon },
 ],
 },
 {
 title: "Sellers",
 key: "sellers",
 icon: Store01Icon,
 items: [
 { label: "All Sellers", href: "/admin/dashboard?tab=sellers&menu=sellers&item=all-sellers", icon: Store01Icon },
 { label: "Seller Applications", href: "/admin/dashboard?tab=sellers&menu=sellers&item=seller-applications", icon: ShieldCheckIcon },
 { label: "Seller Products", href: "/admin/dashboard?tab=sellers&menu=sellers&item=seller-products", icon: PackageIcon },
 { label: "Seller Orders", href: "/admin/dashboard?tab=sellers&menu=sellers&item=seller-orders", icon: Task01Icon },
 { label: "Seller Performance", href: "/admin/dashboard?tab=sellers&menu=sellers&item=seller-performance", icon: ChartColumnIcon },
 ],
 },
 {
 title: "Brokers",
 key: "brokers",
 icon: UserMultiple02Icon,
 items: [
 { label: "Brokers & KYC Review", href: "/admin/brokers", icon: ShieldCheckIcon },
 { label: "Broker Security & Risk", href: "/admin/brokers/security", icon: LockKeyIcon },
 { label: "Broker Wallet Payouts", href: "/admin/brokers/payouts", icon: Wallet03Icon },
 ],
 },
 {
 title: "Payments",
 key: "finance",
 icon: CreditCardIcon,
 items: [
 { label: "Payments Dashboard", href: "/admin/dashboard?tab=finance&menu=payments&item=payments-dashboard" },
 { label: "Transactions", href: "/admin/dashboard?tab=finance&menu=payments&item=transactions" },
 { label: "Payment Methods", href: "/admin/dashboard?tab=finance&menu=payments&item=payment-methods" },
 { label: "Payment Providers", href: "/admin/dashboard?tab=finance&menu=payments&item=payment-providers" },
 { label: "Refunds", href: "/admin/dashboard?tab=finance&menu=payments&item=refunds" },
 { label: "Disputes & Chargebacks", href: "/admin/dashboard?tab=finance&menu=payments&item=disputes-chargebacks" },
 { label: "Seller Payout Accounts", href: "/admin/dashboard?tab=finance&menu=payments&item=seller-payout-accounts" },
 { label: "Seller Payouts", href: "/admin/dashboard?tab=finance&menu=payments&item=seller-payouts" },
 { label: "Pending Payouts", href: "/admin/dashboard?tab=finance&menu=payments&item=pending-payouts" },
 { label: "Failed Payments", href: "/admin/dashboard?tab=finance&menu=payments&item=failed-payments" },
 { label: "Fraud & Risk", href: "/admin/dashboard?tab=finance&menu=payments&item=fraud-risk" },
 { label: "Reconciliation", href: "/admin/dashboard?tab=finance&menu=payments&item=reconciliation" },
 { label: "Currencies & FX", href: "/admin/dashboard?tab=finance&menu=payments&item=currencies-fx" },
 { label: "Countries", href: "/admin/dashboard?tab=finance&menu=payments&item=countries" },
 { label: "Fees & Commissions", href: "/admin/dashboard?tab=finance&menu=payments&item=fees-commissions" },
 { label: "Payment Reports", href: "/admin/dashboard?tab=finance&menu=payments&item=payment-reports" },
 { label: "Payment Audit Logs", href: "/admin/dashboard?tab=finance&menu=payments&item=payment-audit-logs" },
 ],
 },
 {
 title: "Advertising",
 key: "products",
 icon: Megaphone01Icon,
 items: [
 { label: "All Advertisements", href: "/admin/dashboard?tab=products&menu=advertising&item=all-advertisements", icon: Megaphone01Icon },
 { label: "Create Advertisement", href: "/admin/dashboard?tab=products&menu=advertising&item=create-advertisement", icon: Megaphone01Icon },
 { label: "Active Ads", href: "/admin/dashboard?tab=products&menu=advertising&item=active-ads", icon: Megaphone01Icon },
 { label: "Scheduled Ads", href: "/admin/dashboard?tab=products&menu=advertising&item=scheduled-ads", icon: Megaphone01Icon },
 { label: "Paused Ads", href: "/admin/dashboard?tab=products&menu=advertising&item=paused-ads", icon: Megaphone01Icon },
 { label: "Expired Ads", href: "/admin/dashboard?tab=products&menu=advertising&item=expired-ads", icon: Megaphone01Icon },
 { label: "Advertisement Analytics", href: "/admin/dashboard?tab=products&menu=advertising&item=advertisement-analytics", icon: Megaphone01Icon },
 ],
 },
 {
 title: "Promotions",
 key: "products",
 icon: Tag01Icon,
 items: [
 { label: "Coupons", href: "/admin/dashboard?tab=products&menu=promotions&item=coupons", icon: Tag01Icon },
 { label: "Discounts", href: "/admin/dashboard?tab=products&menu=promotions&item=discounts", icon: Tag01Icon },
 { label: "Campaigns", href: "/admin/dashboard?tab=products&menu=promotions&item=campaigns", icon: Megaphone01Icon },
 ],
 },
 {
 title: "Disputes",
 key: "orders",
 icon: JusticeScale01Icon,
 items: [
 { label: "All Disputes", href: "/admin/disputes", icon: JusticeScale01Icon },
 { label: "Open Disputes", href: "/admin/disputes?status=open", icon: JusticeScale01Icon },
 { label: "Resolved Disputes", href: "/admin/disputes?status=resolved", icon: FileCheckIcon },
 ],
 },
 {
 title: "Analytics",
 key: "analytics",
 icon: ChartColumnIcon,
 items: [
 { label: "Sales Reports", href: "/admin/analytics?report=sales", icon: ChartColumnIcon },
 { label: "Order Reports", href: "/admin/analytics?report=orders", icon: Task01Icon },
 { label: "Product Reports", href: "/admin/analytics?report=products", icon: PackageIcon },
 { label: "Customer Reports", href: "/admin/analytics?report=customers", icon: UserMultiple02Icon },
 ],
 },
 {
 title: "Communications",
 key: "overview",
 icon: Megaphone01Icon,
 items: [
 { label: "Notifications", href: "/admin/dashboard?tab=overview&menu=communications&item=notifications", icon: BellIcon },
 { label: "Email Messages", href: "/admin/dashboard?tab=overview&menu=communications&item=email-messages", icon: BellIcon },
 { label: "SMS Messages", href: "/admin/dashboard?tab=overview&menu=communications&item=sms-messages", icon: BellIcon },
 ],
 },
 {
 title: "User Management",
 key: "users",
 icon: ShieldCheckIcon,
 items: [
 { label: "Users", href: "/admin/dashboard?tab=users&menu=user-management&item=users", icon: UserMultiple02Icon },
 { label: "Add New User", href: "/admin/dashboard?tab=users&menu=user-management&item=add-new-user", icon: UserAdd01Icon },
 { label: "Roles", href: "/admin/dashboard?tab=users&menu=user-management&item=roles", icon: ShieldCheckIcon },
 { label: "Permissions", href: "/admin/dashboard?tab=users&menu=user-management&item=permissions", icon: Key01Icon },
 { label: "Active Sessions", href: "/admin/dashboard?tab=users&menu=user-management&item=active-sessions", icon: LockKeyIcon },
 ],
 },
 {
 title: "Store Settings",
 key: "overview",
 icon: PreferenceHorizontalIcon,
 items: [
 { label: "Platform Rules", href: "/admin/dashboard?tab=overview&menu=marketplace-settings&item=marketplace-rules", icon: PreferenceHorizontalIcon },
 { label: "Commission Rules", href: "/admin/dashboard?tab=overview&menu=marketplace-settings&item=commission-rules", icon: JusticeScale01Icon },
 ],
 },
 {
 title: "Logistics",
 key: "overview",
 icon: TruckIcon,
 items: [
 { label: "Company Approvals", href: "/admin/logistics/approvals", icon: FileCheckIcon },
 { label: "Logistics Companies", href: "/admin/dashboard?tab=overview&menu=logistics&item=logistics-companies", icon: Store01Icon },
 { label: "Delivery Services", href: "/admin/dashboard?tab=overview&menu=logistics&item=delivery-services", icon: TruckIcon },
 { label: "Shipping Zones", href: "/admin/dashboard?tab=overview&menu=logistics&item=shipping-zones", icon: Globe02Icon },
 { label: "Shipping Rates", href: "/admin/dashboard?tab=overview&menu=logistics&item=shipping-rates", icon: Wallet03Icon },
 { label: "API & Webhooks", href: "/admin/dashboard?tab=overview&menu=logistics&item=api-webhooks", icon: Settings01Icon },
 ],
 },
 {
 title: "Finance Configuration",
 key: "finance",
 icon: Wallet03Icon,
 items: [
 { label: "Finance Settings", href: "/admin/dashboard?tab=finance&menu=finance-configuration&item=finance-settings", icon: Settings01Icon },
 { label: "Escrow Holds", href: "/admin/dashboard?tab=finance&menu=finance-configuration&item=escrow-holds", icon: LockKeyIcon },
 ],
 },
 {
 title: "System Management",
 key: "overview",
 icon: Settings01Icon,
 items: [
 { label: "Monitoring Overview", href: "/admin/dashboard?tab=overview&menu=system-management&item=monitoring-overview", icon: DashboardSquare01Icon },
 { label: "Audit Logs", href: "/admin/dashboard?tab=overview&menu=system-management&item=audit-logs", icon: FileCheckIcon },
 { label: "System Events", href: "/admin/dashboard?tab=overview&menu=system-management&item=system-events", icon: ShieldCheckIcon },
 { label: "Email Alerts", href: "/admin/dashboard?tab=overview&menu=system-management&item=email-alerts", icon: Mail01Icon },
 { label: "Migrations", href: "/admin/dashboard?tab=overview&menu=system-management&item=migrations", icon: DatabaseIcon },
 { label: "Weekly Reports", href: "/admin/dashboard?tab=overview&menu=system-management&item=weekly-reports", icon: FileCheckIcon },
 { label: "Background Jobs", href: "/admin/dashboard?tab=overview&menu=system-management&item=background-jobs", icon: Settings01Icon },
 { label: "Application Settings", href: "/admin/dashboard?tab=overview&menu=system-management&item=application-settings", icon: Settings01Icon },
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
 supportHref="/admin/customers/support"
 footerLabel="Xerin Mart Admin Center"
 searchPlaceholder="Search admin records"
 >
 {children}
 </DashboardShell>
 );
}
