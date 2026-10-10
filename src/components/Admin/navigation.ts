import type { IconSvgElement } from "@hugeicons/react";
import {
 ChartColumnIcon,
 CreditCardIcon,
 FileCheckIcon,
 JusticeScale01Icon,
 LockKeyIcon,
 Megaphone01Icon,
 Package02Icon,
 PackageIcon,
 PackageCheckIcon,
 Settings01Icon,
 ShieldCheckIcon,
 ShoppingBag01Icon,
 Store01Icon,
 Tag01Icon,
 Task01Icon,
 TruckIcon,
 UserCircleIcon,
 UserMultiple02Icon,
 Wallet03Icon,
 BellIcon,
 Mail01Icon,
 MailSend01Icon,
 Settings02Icon,
 DatabaseIcon,
 PreferenceHorizontalIcon,
 DashboardSquare01Icon,
 Globe02Icon,
 UserAdd01Icon,
 Key01Icon,
 LifebuoyIcon,
 Location01Icon,
 Search01Icon,
 Cancel01Icon,
} from "@hugeicons/core-free-icons";

export type AdminNavChild = {
 label: string;
 href: string;
 icon?: IconSvgElement;
};

export type AdminNavModule = {
 /** Module label — matches the permission section name (e.g. "Payments"). */
 label: string;
 /** Sidebar section this module belongs to. */
 section: string;
 icon: IconSvgElement;
 /** Module landing route — where the sidebar item links. */
 landing: string;
 /** Permission section key (ADMIN_SECTION_PERMISSIONS) when it differs from label. */
 permissionKey?: string;
 /** Every existing destination grouped inside the module. */
 children: AdminNavChild[];
};

export type AdminNavSection = {
 label: string;
 modules: AdminNavModule[];
};

const D = (query: string) => `/admin/dashboard${query}`;

/**
 * Canonical admin navigation. The sidebar renders only the top-level
 * modules; children become in-page navigation inside each module.
 * Every href maps to an existing route — nothing was renamed.
 */
export const ADMIN_SECTIONS: AdminNavSection[] = [
 {
 label: "Overview",
 modules: [
 {
 label: "Dashboard",
 section: "Overview",
 icon: DashboardSquare01Icon,
 landing: D("?tab=overview"),
 children: [{ label: "Dashboard", href: D("?tab=overview") }],
 },
 ],
 },
 {
 label: "Commerce",
 modules: [
 {
 label: "Catalog",
 section: "Commerce",
 icon: PackageIcon,
 landing: D("?tab=products&menu=catalog&item=products"),
 children: [
 { label: "Products", href: D("?tab=products&menu=catalog&item=products"), icon: ShoppingBag01Icon },
 { label: "Categories", href: D("?tab=categories&menu=catalog&item=categories"), icon: Package02Icon },
 { label: "Brands", href: D("?tab=brands&menu=catalog&item=brands"), icon: Tag01Icon },
 ],
 },
 {
 label: "Orders",
 section: "Commerce",
 icon: ShoppingBag01Icon,
 landing: D("?tab=orders&menu=orders&item=all-orders&orders_tab=all"),
 children: [
 { label: "All Orders", href: D("?tab=orders&menu=orders&item=all-orders&orders_tab=all"), icon: Task01Icon },
 { label: "Pending Orders", href: D("?tab=orders&menu=orders&item=pending-orders&orders_tab=pending"), icon: Task01Icon },
 { label: "Processing Orders", href: D("?tab=orders&menu=orders&item=processing-orders&orders_tab=processing"), icon: Task01Icon },
 { label: "Completed Orders", href: D("?tab=orders&menu=orders&item=completed-orders&orders_tab=completed"), icon: Task01Icon },
 { label: "Cancelled Orders", href: D("?tab=orders&menu=orders&item=cancelled-orders&orders_tab=cancelled"), icon: Cancel01Icon },
 { label: "Order Tracking", href: D("?tab=orders&menu=orders&item=order-tracking&orders_tab=tracking"), icon: Search01Icon },
 ],
 },
 {
 label: "Disputes",
 section: "Commerce",
 icon: JusticeScale01Icon,
 landing: "/admin/disputes",
 children: [
 { label: "All Disputes", href: "/admin/disputes", icon: JusticeScale01Icon },
 { label: "Open Disputes", href: "/admin/disputes?status=open", icon: JusticeScale01Icon },
 { label: "Resolved Disputes", href: "/admin/disputes?status=resolved", icon: FileCheckIcon },
 ],
 },
 {
 label: "Inventory",
 section: "Commerce",
 icon: Package02Icon,
 landing: D("?tab=inventory&menu=inventory&item=stock-overview&inventory_tab=stock-overview"),
 children: [
 { label: "Stock Overview", href: D("?tab=inventory&menu=inventory&item=stock-overview&inventory_tab=stock-overview"), icon: Package02Icon },
 { label: "Warehouses", href: D("?tab=inventory&menu=inventory&item=warehouses&inventory_tab=warehouses"), icon: Store01Icon },
 { label: "Stock Adjustments", href: D("?tab=inventory&menu=inventory&item=stock-adjustments&inventory_tab=stock-adjustments"), icon: PreferenceHorizontalIcon },
 { label: "Low Stock Products", href: D("?tab=inventory&menu=inventory&item=low-stock-products&inventory_tab=low-stock-products"), icon: PackageIcon },
 ],
 },
 {
 label: "Customers",
 section: "Commerce",
 icon: UserMultiple02Icon,
 landing: D("?tab=users&menu=customers&item=all-customers"),
 children: [
 { label: "All Customers", href: D("?tab=users&menu=customers&item=all-customers"), icon: UserMultiple02Icon },
 { label: "Customer Addresses", href: D("?tab=users&menu=customers&item=customer-addresses"), icon: Location01Icon },
 { label: "Customer Reviews", href: "/admin/customers/reviews", icon: FileCheckIcon },
 { label: "Customer Support", href: "/admin/customers/support", icon: LifebuoyIcon },
 ],
 },
 {
 label: "Sellers",
 section: "Commerce",
 icon: Store01Icon,
 landing: D("?tab=sellers&menu=sellers&item=all-sellers"),
 children: [
 { label: "All Sellers", href: D("?tab=sellers&menu=sellers&item=all-sellers"), icon: Store01Icon },
 { label: "Seller Applications", href: D("?tab=sellers&menu=sellers&item=seller-applications"), icon: ShieldCheckIcon },
 { label: "Seller Products", href: D("?tab=sellers&menu=sellers&item=seller-products"), icon: PackageIcon },
 { label: "Seller Orders", href: D("?tab=sellers&menu=sellers&item=seller-orders"), icon: Task01Icon },
 { label: "Seller Performance", href: D("?tab=sellers&menu=sellers&item=seller-performance"), icon: ChartColumnIcon },
 ],
 },
 {
 label: "Brokers",
 section: "Commerce",
 icon: ShieldCheckIcon,
 landing: "/admin/brokers",
 children: [
 { label: "Brokers & KYC Review", href: "/admin/brokers", icon: ShieldCheckIcon },
 { label: "Broker Security & Risk", href: "/admin/brokers/security", icon: LockKeyIcon },
 { label: "Broker Wallet Payouts", href: "/admin/brokers/payouts", icon: Wallet03Icon },
 ],
 },
 ],
 },
 {
 label: "Money",
 modules: [
 {
 label: "Payments",
 section: "Money",
 icon: CreditCardIcon,
 landing: D("?tab=finance&menu=payments&item=payments-dashboard"),
 children: [
 { label: "Payments Dashboard", href: D("?tab=finance&menu=payments&item=payments-dashboard") },
 { label: "Transactions", href: D("?tab=finance&menu=payments&item=transactions") },
 { label: "Payment Methods", href: D("?tab=finance&menu=payments&item=payment-methods") },
 { label: "Payment Providers", href: D("?tab=finance&menu=payments&item=payment-providers") },
 { label: "Refunds", href: D("?tab=finance&menu=payments&item=refunds") },
 { label: "Disputes & Chargebacks", href: D("?tab=finance&menu=payments&item=disputes-chargebacks") },
 { label: "Seller Payout Accounts", href: D("?tab=finance&menu=payments&item=seller-payout-accounts") },
 { label: "Seller Payouts", href: D("?tab=finance&menu=payments&item=seller-payouts") },
 { label: "Pending Payouts", href: D("?tab=finance&menu=payments&item=pending-payouts") },
 { label: "Failed Payments", href: D("?tab=finance&menu=payments&item=failed-payments") },
 { label: "Fraud & Risk", href: D("?tab=finance&menu=payments&item=fraud-risk") },
 { label: "Reconciliation", href: D("?tab=finance&menu=payments&item=reconciliation") },
 { label: "Currencies & FX", href: D("?tab=finance&menu=payments&item=currencies-fx") },
 { label: "Countries", href: D("?tab=finance&menu=payments&item=countries") },
 { label: "Fees & Commissions", href: D("?tab=finance&menu=payments&item=fees-commissions") },
 { label: "Payment Reports", href: D("?tab=finance&menu=payments&item=payment-reports") },
 { label: "Payment Audit Logs", href: D("?tab=finance&menu=payments&item=payment-audit-logs") },
 ],
 },
 {
 label: "Finance",
 section: "Money",
 permissionKey: "Finance Configuration",
 icon: Wallet03Icon,
 landing: D("?tab=finance&menu=finance-configuration&item=finance-settings"),
 children: [
 { label: "Finance Settings", href: D("?tab=finance&menu=finance-configuration&item=finance-settings"), icon: Settings01Icon },
 { label: "Escrow Holds", href: D("?tab=finance&menu=finance-configuration&item=escrow-holds"), icon: LockKeyIcon },
 ],
 },
 ],
 },
 {
 label: "Marketing",
 modules: [
 {
 label: "Advertising",
 section: "Marketing",
 icon: Megaphone01Icon,
 landing: D("?tab=products&menu=advertising&item=all-advertisements"),
 children: [
 { label: "All Advertisements", href: D("?tab=products&menu=advertising&item=all-advertisements"), icon: Megaphone01Icon },
 { label: "Create Advertisement", href: D("?tab=products&menu=advertising&item=create-advertisement"), icon: Megaphone01Icon },
 { label: "Active Ads", href: D("?tab=products&menu=advertising&item=active-ads"), icon: Megaphone01Icon },
 { label: "Scheduled Ads", href: D("?tab=products&menu=advertising&item=scheduled-ads"), icon: Megaphone01Icon },
 { label: "Paused Ads", href: D("?tab=products&menu=advertising&item=paused-ads"), icon: Megaphone01Icon },
 { label: "Expired Ads", href: D("?tab=products&menu=advertising&item=expired-ads"), icon: Megaphone01Icon },
 { label: "Advertisement Analytics", href: D("?tab=products&menu=advertising&item=advertisement-analytics"), icon: ChartColumnIcon },
 ],
 },
 {
 label: "Promotions",
 section: "Marketing",
 icon: Tag01Icon,
 landing: D("?tab=products&menu=promotions&item=coupons"),
 children: [
 { label: "Coupons", href: D("?tab=products&menu=promotions&item=coupons"), icon: Tag01Icon },
 { label: "Discounts", href: D("?tab=products&menu=promotions&item=discounts"), icon: Tag01Icon },
 { label: "Campaigns", href: D("?tab=products&menu=promotions&item=campaigns"), icon: Megaphone01Icon },
 ],
 },
 {
 label: "Engagement",
 section: "Marketing",
 icon: MailSend01Icon,
 landing: D("?tab=overview&menu=engagement&item=overview"),
 children: [
 { label: "Overview", href: D("?tab=overview&menu=engagement&item=overview"), icon: ChartColumnIcon },
 { label: "Campaigns", href: D("?tab=overview&menu=engagement&item=campaigns"), icon: Megaphone01Icon },
 { label: "Templates", href: D("?tab=overview&menu=engagement&item=templates"), icon: Tag01Icon },
 { label: "Holiday Calendar", href: D("?tab=overview&menu=engagement&item=calendar"), icon: Megaphone01Icon },
 { label: "Monthly Automation", href: D("?tab=overview&menu=engagement&item=automation"), icon: Settings02Icon },
 ],
 },
 {
 label: "Communications",
 section: "Marketing",
 icon: BellIcon,
 landing: D("?tab=overview&menu=communications&item=notifications"),
 children: [
 { label: "Notifications", href: D("?tab=overview&menu=communications&item=notifications"), icon: BellIcon },
 { label: "Email Messages", href: D("?tab=overview&menu=communications&item=email-messages"), icon: Mail01Icon },
 { label: "SMS Messages", href: D("?tab=overview&menu=communications&item=sms-messages"), icon: Mail01Icon },
 ],
 },
 ],
 },
 {
 label: "Management",
 modules: [
 {
 label: "Operations",
 section: "Management",
 permissionKey: "Store Operations",
 icon: PackageCheckIcon,
 landing: "/admin/operations/workflow",
 children: [
 { label: "Fulfilment Workflow", href: "/admin/operations/workflow", icon: PackageCheckIcon },
 { label: "End-to-End QA", href: "/admin/operations/qa", icon: FileCheckIcon },
 ],
 },
 {
 label: "User Management",
 section: "Management",
 icon: ShieldCheckIcon,
 landing: D("?tab=users&menu=user-management&item=users"),
 children: [
 { label: "Users", href: D("?tab=users&menu=user-management&item=users"), icon: UserMultiple02Icon },
 { label: "Add New User", href: D("?tab=users&menu=user-management&item=add-new-user"), icon: UserAdd01Icon },
 { label: "Roles", href: D("?tab=users&menu=user-management&item=roles"), icon: ShieldCheckIcon },
 { label: "Permissions", href: D("?tab=users&menu=user-management&item=permissions"), icon: Key01Icon },
 { label: "Active Sessions", href: D("?tab=users&menu=user-management&item=active-sessions"), icon: LockKeyIcon },
 ],
 },
 {
 label: "Reports & Analytics",
 section: "Management",
 icon: ChartColumnIcon,
 landing: "/admin/analytics?report=sales",
 children: [
 { label: "Sales Reports", href: "/admin/analytics?report=sales", icon: ChartColumnIcon },
 { label: "Order Reports", href: "/admin/analytics?report=orders", icon: Task01Icon },
 { label: "Product Reports", href: "/admin/analytics?report=products", icon: PackageIcon },
 { label: "Inventory Reports", href: D("?tab=analytics&menu=reports-analytics&item=inventory-reports"), icon: Package02Icon },
 { label: "Customer Reports", href: "/admin/analytics?report=customers", icon: UserMultiple02Icon },
 { label: "Payment Reports", href: D("?tab=analytics&menu=reports-analytics&item=payment-reports"), icon: CreditCardIcon },
 ],
 },
 {
 label: "Logistics",
 section: "Management",
 icon: TruckIcon,
 landing: "/admin/logistics/approvals",
 children: [
 { label: "Company Approvals", href: "/admin/logistics/approvals", icon: FileCheckIcon },
 { label: "Logistics Companies", href: D("?tab=overview&menu=logistics&item=logistics-companies"), icon: Store01Icon },
 { label: "Delivery Services", href: D("?tab=overview&menu=logistics&item=delivery-services"), icon: TruckIcon },
 { label: "Shipping Zones", href: D("?tab=overview&menu=logistics&item=shipping-zones"), icon: Globe02Icon },
 { label: "Shipping Rates", href: D("?tab=overview&menu=logistics&item=shipping-rates"), icon: Wallet03Icon },
 { label: "API & Webhooks", href: D("?tab=overview&menu=logistics&item=api-webhooks"), icon: Settings01Icon },
 ],
 },
 ],
 },
 {
 label: "System",
 modules: [
 {
 label: "System",
 section: "System",
 permissionKey: "System Management",
 icon: Settings01Icon,
 landing: D("?tab=overview&menu=system-management&item=monitoring-overview"),
 children: [
 { label: "Monitoring Overview", href: D("?tab=overview&menu=system-management&item=monitoring-overview"), icon: DashboardSquare01Icon },
 { label: "Audit Logs", href: D("?tab=overview&menu=system-management&item=audit-logs"), icon: FileCheckIcon },
 { label: "System Events", href: D("?tab=overview&menu=system-management&item=system-events"), icon: ShieldCheckIcon },
 { label: "Email Alerts", href: D("?tab=overview&menu=system-management&item=email-alerts"), icon: Mail01Icon },
 { label: "Migrations", href: D("?tab=overview&menu=system-management&item=migrations"), icon: DatabaseIcon },
 { label: "Weekly Reports", href: D("?tab=overview&menu=system-management&item=weekly-reports"), icon: FileCheckIcon },
 { label: "Background Jobs", href: D("?tab=overview&menu=system-management&item=background-jobs"), icon: Settings01Icon },
 ],
 },
 {
 label: "Settings",
 section: "System",
 permissionKey: "Store Settings",
 icon: PreferenceHorizontalIcon,
 landing: D("?tab=overview&menu=marketplace-settings&item=marketplace-rules"),
 children: [
 { label: "Platform Rules", href: D("?tab=overview&menu=marketplace-settings&item=marketplace-rules"), icon: PreferenceHorizontalIcon },
 { label: "Commission Rules", href: D("?tab=overview&menu=marketplace-settings&item=commission-rules"), icon: JusticeScale01Icon },
 { label: "Application Settings", href: D("?tab=overview&menu=system-management&item=application-settings"), icon: Settings01Icon },
 ],
 },
 ],
 },
 {
 label: "Account",
 modules: [
 {
 label: "Account",
 section: "Account",
 icon: UserCircleIcon,
 landing: D("?tab=overview&menu=account&item=profile"),
 children: [
 { label: "Profile", href: D("?tab=overview&menu=account&item=profile"), icon: UserCircleIcon },
 { label: "Security", href: D("?tab=overview&menu=account&item=security"), icon: LockKeyIcon },
 { label: "Logout", href: D("?tab=overview&menu=account&item=logout"), icon: Cancel01Icon },
 ],
 },
 ],
 },
];

export const ADMIN_MODULES: AdminNavModule[] = ADMIN_SECTIONS.flatMap(
 (section) => section.modules,
);

/**
 * True when a nav href matches the current location. Href query params
 * must all match; hrefs without params match by pathname prefix.
 */
export function isAdminNavHrefActive(
 href: string,
 pathname: string,
 searchParams: { get(key: string): string | null },
) {
 const url = new URL(href, "http://localhost");
 const keys = Array.from(url.searchParams.keys());

 if (!keys.length) {
 return pathname === url.pathname || pathname.startsWith(`${url.pathname}/`);
 }
 if (url.pathname !== pathname) return false;
 return keys.every((key) => searchParams.get(key) === url.searchParams.get(key));
}

export const hrefSpecificity = (href: string) =>
 Array.from(new URL(href, "http://localhost").searchParams.keys()).length;

/**
 * The module that owns the current location. When multiple children match
 * (e.g. `?tab=overview` also matches Communications pages), the most
 * specific href wins.
 */
export function getActiveAdminModule(
 pathname: string,
 searchParams: { get(key: string): string | null },
) {
 let best: { module: AdminNavModule; score: number } | null = null;
 for (const mod of ADMIN_MODULES) {
 for (const child of mod.children) {
 if (!isAdminNavHrefActive(child.href, pathname, searchParams)) continue;
 const score = hrefSpecificity(child.href);
 if (!best || score > best.score) best = { module: mod, score };
 }
 }
 return best?.module ?? null;
}
