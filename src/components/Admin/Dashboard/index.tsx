"use client";
import "../admin-ui.css";

import { ReactNode, useEffect, useState, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { authStorage } from "@/lib/auth/storage";
import { canAccessAdminDashboard, canAccessAdminItem, canAccessAdminSection } from "@/lib/auth/admin-access";
import { ApiError } from "@/lib/api/client";
import {
 adminService,
 AdminProduct,
 AdminSeller,
} from "@/lib/api/endpoints/admin";
import AdminProducts from "@/components/Admin/Products";
import AdminCategories from "@/components/Admin/Catalog/Categories";
import AdminBrands from "@/components/Admin/Catalog/Brands";
import AdminReviews from "@/components/Admin/Catalog/Reviews";
import AdminOrdersDashboard from "@/components/Admin/Orders/Dashboard";
import AdminInventoryDashboard from "@/components/Admin/Inventory/Dashboard";
import AdminInventoryWarehouses from "@/components/Admin/Inventory/Warehouses";
import AdminInventoryAdjustments from "@/components/Admin/Inventory/Adjustments";
import AdminInventoryLowStock from "@/components/Admin/Inventory/LowStock";
import AdminProductInventoryDetails from "@/components/Admin/Inventory/ProductDetails";
import AdminWarehouseDetails from "@/components/Admin/Inventory/WarehouseDetails";
import { ReasonActionDialog } from "@/components/Admin/shared/ActionDialog";
import AdminCustomers from "@/components/Admin/Customers/Customers";
import AdminCustomerDetails from "@/components/Admin/Customers/CustomerDetails";
import AdminCustomerAddresses from "@/components/Admin/Customers/Addresses";
import AdminCustomerReviews from "@/components/Admin/Customers/Reviews";
import AdminCustomerSupport from "@/components/Admin/Customers/Support";
import AdminSellers from "@/components/Admin/Sellers";
import SellerSubWorkspace from "@/components/Admin/Sellers/SubWorkspace";
import AdminPayments, { PaymentView } from "@/components/Admin/Payments";
import AdminAdvertisements, { AdvertisementView } from "@/components/Admin/Advertisements";
import AdminPromotions, { PromotionView } from "@/components/Admin/Promotions";
import AdminCommunications, {
 CommunicationView,
} from "@/components/Admin/Communications";
import AdminUserManagement, {
 UserManagementView,
} from "@/components/Admin/UserManagement";
import AdminReports, { ReportView } from "@/components/Admin/Reports";
import AdminSystemManagement, {
 SystemView,
} from "@/components/Admin/SystemManagement";
import AdminAccount, { AccountView } from "@/components/Admin/Account";
import AdminFinance from "@/components/Admin/Finance";
import AdminAnalytics from "@/components/Admin/Analytics";
import MarketplaceOverview from "@/components/Admin/Dashboard/MarketplaceOverview";
import DashboardShell, { type DashboardNavGroup } from "@/components/Dashboard/DashboardShell";
import AdminConfiguration, { AdminConfigurationView } from "@/components/Admin/Configuration";
import { formatCurrency } from "@/lib/formatCurrency";
import { ChartColumnIcon, BellIcon, BookOpen01Icon, Package02Icon, ArrowDown01Icon, UserCircleIcon, CreditCardIcon, DashboardSpeed01Icon, Logout01Icon, Menu01Icon, Megaphone01Icon, Moon02Icon, PackageIcon, RefreshCwIcon, Search01Icon, Settings01Icon, ShieldCheckIcon, ShoppingBag01Icon, Store01Icon, TruckIcon, Globe02Icon, JusticeScale01Icon, LockKeyIcon, Wallet03Icon, Sun03Icon, Tag01Icon, UserMultiple02Icon, UserAdd01Icon, Cancel01Icon, GridIcon, Wallet01Icon, File01Icon, StarIcon, ClipboardIcon, DollarCircleIcon, BarChartIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";

type StoredUser = {
 first_name?: string;
 last_name?: string;
 email?: string;
 account_type?: string;
 roles?: string[];
 permissions?: string[];
};

type AdminTab =
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

const tabs: Array<{ key: AdminTab; label: string; short: string }> = [
 { key: "overview", label: "Dashboard", short: "Overview" },
 { key: "users", label: "User Management", short: "Users" },
 { key: "sellers", label: "Seller Review", short: "Sellers" },
 { key: "products", label: "Products", short: "Products" },
 { key: "categories", label: "Categories", short: "Categories" },
 { key: "brands", label: "Brands", short: "Brands" },
 { key: "reviews", label: "Reviews", short: "Reviews" },
 { key: "orders", label: "Order & Dispute", short: "Orders" },
 { key: "inventory", label: "Inventory", short: "Inventory" },
 { key: "finance", label: "Financial Management", short: "Finance" },
 { key: "analytics", label: "Analytics Dashboard", short: "Analytics" },
];

type SidebarGroup = {
 title: string;
 key: AdminTab | string;
 items: { label: string; href: string }[];
 icon: IconSvgElement;
};

const sidebarGroups: SidebarGroup[] = [
 {
 title: "Catalog",
 key: "products",
 icon: PackageIcon,
 items: [
 { label: "Products", href: "?tab=products&menu=catalog&item=products" },
 {
 label: "Categories",
 href: "?tab=categories&menu=catalog&item=categories",
 },
 { label: "Brands", href: "?tab=brands&menu=catalog&item=brands" },
 // {
 // label: "Product Reviews",
 // href: "?tab=reviews&menu=catalog&item=product-reviews",
 // },
 ],
 },
 {
 title: "Orders",
 key: "orders",
 icon: ShoppingBag01Icon,
 items: [
 {
 label: "All Orders",
 href: "?tab=orders&menu=orders&item=all-orders&orders_tab=all",
 },
 {
 label: "Pending Orders",
 href: "?tab=orders&menu=orders&item=pending-orders&orders_tab=pending",
 },
 {
 label: "Processing Orders",
 href: "?tab=orders&menu=orders&item=processing-orders&orders_tab=processing",
 },
 {
 label: "Completed Orders",
 href: "?tab=orders&menu=orders&item=completed-orders&orders_tab=completed",
 },
 {
 label: "Cancelled Orders",
 href: "?tab=orders&menu=orders&item=cancelled-orders&orders_tab=cancelled",
 },
 {
 label: "Order Tracking",
 href: "?tab=orders&menu=orders&item=order-tracking&orders_tab=tracking",
 },
 ],
 },
 {
 title: "Inventory",
 key: "inventory",
 icon: Package02Icon,
 items: [
 {
 label: "Stock Overview",
 href: "?tab=inventory&menu=inventory&item=stock-overview&inventory_tab=stock-overview",
 },
 {
 label: "Warehouses",
 href: "?tab=inventory&menu=inventory&item=warehouses&inventory_tab=warehouses",
 },
 {
 label: "Stock Adjustments",
 href: "?tab=inventory&menu=inventory&item=stock-adjustments&inventory_tab=stock-adjustments",
 },
 {
 label: "Low Stock Products",
 href: "?tab=inventory&menu=inventory&item=low-stock-products&inventory_tab=low-stock-products",
 },
 ],
 },
 {
 title: "Customers",
 key: "users",
 icon: UserMultiple02Icon,
 items: [
 {
 label: "Customer Reviews",
 href: "?tab=users&menu=customers&item=customer-reviews",
 },
 {
 label: "Customer Support",
 href: "?tab=users&menu=customers&item=customer-support",
 },
 ],
 },
 {
 title: "Sellers",
 key: "sellers",
 icon: Store01Icon,
 items: [
 {
 label: "All Sellers",
 href: "?tab=sellers&menu=sellers&item=all-sellers",
 },
 {
 label: "Seller Applications",
 href: "?tab=sellers&menu=sellers&item=seller-applications",
 },
 {
 label: "Seller Orders",
 href: "?tab=sellers&menu=sellers&item=seller-orders",
 },
 {
 label: "Seller Performance",
 href: "?tab=sellers&menu=sellers&item=seller-performance",
 },
 ],
 },
 {
 title: "Brokers",
 key: "brokers",
 icon: UserMultiple02Icon,
 items: [
 { label: "Brokers & KYC Review", href: "/admin/brokers" },
 { label: "Broker Security & Risk", href: "/admin/brokers/security" },
 { label: "Broker Wallet Payouts", href: "/admin/brokers/payouts" },
 ],
 },
 {
 title: "Payments",
 key: "finance",
 icon: CreditCardIcon,
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
 icon: Megaphone01Icon,
 items: [
 { label: "All Advertisements", href: "?tab=products&menu=advertising&item=all-advertisements" },
 { label: "Create Advertisement", href: "?tab=products&menu=advertising&item=create-advertisement" },
 { label: "Active Ads", href: "?tab=products&menu=advertising&item=active-ads" },
 { label: "Scheduled Ads", href: "?tab=products&menu=advertising&item=scheduled-ads" },
 { label: "Paused Ads", href: "?tab=products&menu=advertising&item=paused-ads" },
 { label: "Expired Ads", href: "?tab=products&menu=advertising&item=expired-ads" },
 { label: "Advertisement Analytics", href: "?tab=products&menu=advertising&item=advertisement-analytics" },
 ],
 },
 {
 title: "Promotions",
 key: "products",
 icon: Tag01Icon,
 items: [
 { label: "Coupons", href: "?tab=products&menu=promotions&item=coupons" },
 {
 label: "Discounts",
 href: "?tab=products&menu=promotions&item=discounts",
 },
 {
 label: "Campaigns",
 href: "?tab=products&menu=promotions&item=campaigns",
 },
 ],
 },
 {
 title: "Communications",
 key: "overview",
 icon: Megaphone01Icon,
 items: [
 {
 label: "Notifications",
 href: "?tab=overview&menu=communications&item=notifications",
 },
 {
 label: "Email Messages",
 href: "?tab=overview&menu=communications&item=email-messages",
 },
 {
 label: "SMS Messages",
 href: "?tab=overview&menu=communications&item=sms-messages",
 },
 ],
 },
 {
 title: "User Management",
 key: "users",
 icon: ShieldCheckIcon,
 items: [
 { label: "Users", href: "?tab=users&menu=user-management&item=users" },
 { label: "Add New User", href: "?tab=users&menu=user-management&item=add-new-user" },
 { label: "Roles", href: "?tab=users&menu=user-management&item=roles" },
 {
 label: "Permissions",
 href: "?tab=users&menu=user-management&item=permissions",
 },
 {
 label: "Active Sessions",
 href: "?tab=users&menu=user-management&item=active-sessions",
 },
 ],
 },
 {
 title: "Reports & Analytics",
 key: "analytics",
 icon: ChartColumnIcon,
 items: [
 {
 label: "Sales Reports",
 href: "?tab=analytics&menu=reports-analytics&item=sales-reports",
 },
 {
 label: "Order Reports",
 href: "?tab=analytics&menu=reports-analytics&item=order-reports",
 },
 {
 label: "Product Reports",
 href: "?tab=analytics&menu=reports-analytics&item=product-reports",
 },
 {
 label: "Inventory Reports",
 href: "?tab=analytics&menu=reports-analytics&item=inventory-reports",
 },
 {
 label: "Customer Reports",
 href: "?tab=analytics&menu=reports-analytics&item=customer-reports",
 },
 {
 label: "Payment Reports",
 href: "?tab=analytics&menu=reports-analytics&item=payment-reports",
 },
 ],
 },
 {
 title: "Store Settings",
 key: "overview",
 icon: Settings01Icon,
 items: [
 { label: "Platform Rules", href: "?tab=overview&menu=marketplace-settings&item=marketplace-rules" },
 { label: "Commission Rules", href: "?tab=overview&menu=marketplace-settings&item=commission-rules" },
 ],
 },
 {
 title: "Logistics",
 key: "overview",
 icon: TruckIcon,
 items: [
 { label: "Company Approvals", href: "/admin/logistics/approvals" },
 { label: "Logistics Companies", href: "?tab=overview&menu=logistics&item=logistics-companies" },
 { label: "Delivery Services", href: "?tab=overview&menu=logistics&item=delivery-services" },
 { label: "Shipping Zones", href: "?tab=overview&menu=logistics&item=shipping-zones" },
 { label: "Shipping Rates", href: "?tab=overview&menu=logistics&item=shipping-rates" },
 { label: "API & Webhooks", href: "?tab=overview&menu=logistics&item=api-webhooks" },
 ],
 },
 {
 title: "Finance Configuration",
 key: "finance",
 icon: Wallet03Icon,
 items: [
 { label: "Finance Settings", href: "?tab=finance&menu=finance-configuration&item=finance-settings" },
 { label: "Escrow Holds", href: "?tab=finance&menu=finance-configuration&item=escrow-holds" },
 ],
 },
 {
 title: "System Management",
 key: "overview",
 icon: Settings01Icon,
 items: [
 {
 label: "Monitoring Overview",
 href: "?tab=overview&menu=system-management&item=monitoring-overview",
 },
 {
 label: "Audit Logs",
 href: "?tab=overview&menu=system-management&item=audit-logs",
 },
 {
 label: "Email Alerts",
 href: "?tab=overview&menu=system-management&item=email-alerts",
 },
 {
 label: "Migrations",
 href: "?tab=overview&menu=system-management&item=migrations",
 },
 {
 label: "Weekly Reports",
 href: "?tab=overview&menu=system-management&item=weekly-reports",
 },
 {
 label: "System Events",
 href: "?tab=overview&menu=system-management&item=system-events",
 },
 {
 label: "Background Jobs",
 href: "?tab=overview&menu=system-management&item=background-jobs",
 },
 {
 label: "Application Settings",
 href: "?tab=overview&menu=system-management&item=application-settings",
 },
 ],
 },
 {
 title: "Account",
 key: "overview",
 icon: UserCircleIcon,
 items: [
 { label: "Profile", href: "?tab=overview&menu=account&item=profile" },
 { label: "Security", href: "?tab=overview&menu=account&item=security" },
 { label: "Logout", href: "?tab=overview&menu=account&item=logout" },
 
 ],
 },
];

const tabIcon = (tab: AdminTab): ReactNode => {
 switch (tab) {
 case "overview":
 return (
 <HugeiconsIcon icon={GridIcon} size={20} />
 );
 case "users":
 return (
 <HugeiconsIcon icon={UserMultiple02Icon} size={20} />
 );
 case "sellers":
 return (
 <HugeiconsIcon icon={Wallet01Icon} size={20} />
 );
 case "products":
 return (
 <HugeiconsIcon icon={PackageIcon} size={20} />
 );
 case "categories":
 return (
 <HugeiconsIcon icon={File01Icon} size={20} />
 );
 case "brands":
 return (
 <HugeiconsIcon icon={Tag01Icon} size={20} />
 );
 case "reviews":
 return (
 <HugeiconsIcon icon={StarIcon} size={20} />
 );
 case "orders":
 return (
 <HugeiconsIcon icon={ClipboardIcon} size={20} />
 );
 case "finance":
 return (
 <HugeiconsIcon icon={DollarCircleIcon} size={20} />
 );
 case "analytics":
 return (
 <HugeiconsIcon icon={BarChartIcon} size={20} />
 );
 default:
 return null;
 }
};

const canAccessAdmin = (user: StoredUser | null) =>
 canAccessAdminDashboard(user);

const normalizeSlug = (value: string) =>
 value
 .trim()
 .toLowerCase()
 .replace(/[^a-z0-9\s-]/g, "")
 .replace(/\s+/g, "-")
 .replace(/-+/g, "-");

const getErrorMessage = (error: unknown) => {
 if (error instanceof ApiError) return error.message;
 if (error instanceof Error) return error.message;
 return "Something went wrong. Please try again.";
};

export default function AdminDashboard() {
 const router = useRouter();
 const pathname = usePathname();
 const searchParams = useSearchParams();
 const adminUser = authStorage.getUser<StoredUser>();
 const visibleSidebarGroups = useMemo(
 () =>
 sidebarGroups
 .map((group) => ({
 ...group,
 items: group.items.filter((item) =>
 canAccessAdminItem(adminUser, item.label),
 ),
 }))
 .filter(
 (group) =>
 canAccessAdminSection(adminUser, group.title) &&
 group.items.length > 0,
 ),
 [adminUser],
 );
 const shellGroups = useMemo<DashboardNavGroup[]>(
 () =>
 visibleSidebarGroups.map((group) => ({
 ...group,
 items: group.items.map((item) => ({
 ...item,
 href: item.href.startsWith("?")
 ? `/admin/dashboard${item.href}`
 : item.href,
 })),
 })),
 [visibleSidebarGroups],
 );
 const [activeTab, setActiveTab] = useState<AdminTab>("overview");
 const [isCheckingAccess, setIsCheckingAccess] = useState(true);
 const [isAuthorized, setIsAuthorized] = useState(false);

 const [isLoading, setIsLoading] = useState(false);
 const [totalUsers, setTotalUsers] = useState<number | null>(null);
 const [pendingSellers, setPendingSellers] = useState<AdminSeller[]>([]);
 const [pendingProducts, setPendingProducts] = useState<AdminProduct[]>([]);
 const [overviewError, setOverviewError] = useState("");

 const [surfaceSearch, setSurfaceSearch] = useState("");
 const [activeSidebarItem, setActiveSidebarItem] =
 useState<string>("Dashboard");

 const hiddenOverviewMenuGroups = [
 "Communications",
 "System Management",
 "Store Settings",
 "Logistics",
 "Finance Configuration",
 "Account",
 ];
 const isOverviewHiddenByMenuSelection = hiddenOverviewMenuGroups.some(
 (group) =>
 activeSidebarItem === group || activeSidebarItem.startsWith(`${group}:`),
 );

 const activeMenuLabel =
 activeSidebarItem === "Dashboard"
 ? "Overview"
 : activeSidebarItem.includes(":")
 ? activeSidebarItem.split(":")[1]
 : activeSidebarItem;

 const activeMenuContextLabel =
 activeSidebarItem === "Dashboard"
 ? "Dashboard"
 : activeSidebarItem.includes(":")
 ? activeSidebarItem.replace(":", " - ")
 : activeSidebarItem;

 const legacyVisualGroup =
 activeSidebarItem === "Dashboard"
 ? "Dashboard"
 : (["Catalog", "Orders", "Inventory", "Customers", "Sellers"].find(
 (group) =>
 activeSidebarItem === group ||
 activeSidebarItem.startsWith(`${group}:`),
 ) ?? null);
 const legacyTheme: Record<
 string,
 { icon: IconSvgElement; eyebrow: string; gradient: string }
 > = {
 Dashboard: {
 icon: DashboardSpeed01Icon,
 eyebrow: "Platform command center",
 gradient: "from-[var(--foreground)]",
 },
 Catalog: {
 icon: PackageIcon,
 eyebrow: "Catalog operations",
 gradient: "from-[var(--foreground)]",
 },
 Orders: {
 icon: ShoppingBag01Icon,
 eyebrow: "Order fulfillment",
 gradient: "from-[var(--foreground)]",
 },
 Inventory: {
 icon: Package02Icon,
 eyebrow: "Stock control",
 gradient: "from-[var(--foreground)]",
 },
 Customers: {
 icon: UserMultiple02Icon,
 eyebrow: "Customer operations",
 gradient: "from-[var(--foreground)]",
 },
 Sellers: {
 icon: Store01Icon,
 eyebrow: "Seller partners",
 gradient: "from-[var(--foreground)]",
 },
 };

 const dynamicSearchPlaceholder =
 activeTab === "orders" || activeTab === "inventory" || activeTab === "users"
 ? "Global search"
 : `Search in ${activeMenuContextLabel.toLowerCase()}...`;

 const isPaymentsWorkspace =
 activeSidebarItem === "Payments" ||
 activeSidebarItem.startsWith("Payments:");
 const paymentView: PaymentView =
 activeSidebarItem === "Payments:Payments Dashboard" ? "dashboard"
 : activeSidebarItem === "Payments:Payment Methods" ? "methods"
 : activeSidebarItem === "Payments:Payment Providers" ? "providers"
 : activeSidebarItem === "Payments:Refunds" ? "refunds"
 : activeSidebarItem === "Payments:Disputes & Chargebacks" ? "disputes"
 : activeSidebarItem === "Payments:Seller Payout Accounts" ? "seller-payout-accounts"
 : activeSidebarItem === "Payments:Seller Payouts" ? "payouts"
 : activeSidebarItem === "Payments:Pending Payouts" ? "pending-payouts"
 : activeSidebarItem === "Payments:Failed Payments" ? "failed"
 : activeSidebarItem === "Payments:Fraud & Risk" ? "risk"
 : activeSidebarItem === "Payments:Reconciliation" ? "reconciliation"
 : activeSidebarItem === "Payments:Currencies & FX" ? "currencies"
 : activeSidebarItem === "Payments:Countries" ? "countries"
 : activeSidebarItem === "Payments:Fees & Commissions" ? "fees"
 : activeSidebarItem === "Payments:Payment Reports" ? "reports"
 : activeSidebarItem === "Payments:Payment Audit Logs" ? "audit"
 : "transactions";
 const isAdvertisingWorkspace =
 activeSidebarItem === "Advertising" ||
 activeSidebarItem.startsWith("Advertising:");
 const advertisementView: AdvertisementView =
 activeSidebarItem === "Advertising:Create Advertisement"
 ? "create"
 : activeSidebarItem === "Advertising:Active Ads"
 ? "active"
 : activeSidebarItem === "Advertising:Scheduled Ads"
 ? "scheduled"
 : activeSidebarItem === "Advertising:Paused Ads"
 ? "paused"
 : activeSidebarItem === "Advertising:Expired Ads"
 ? "expired"
 : activeSidebarItem === "Advertising:Advertisement Analytics"
 ? "analytics"
 : "all";
 const isPromotionsWorkspace =
 activeSidebarItem === "Promotions" ||
 activeSidebarItem.startsWith("Promotions:");
 const promotionView: PromotionView =
 activeSidebarItem === "Promotions:Discounts"
 ? "discounts"
 : activeSidebarItem === "Promotions:Campaigns"
 ? "campaigns"
 : "coupons";
 const isCommunicationsWorkspace =
 activeSidebarItem === "Communications" ||
 activeSidebarItem.startsWith("Communications:");
 const communicationView: CommunicationView =
 activeSidebarItem === "Communications:Email Messages"
 ? "email"
 : activeSidebarItem === "Communications:SMS Messages"
 ? "sms"
 : "notification";
 const isUserManagementWorkspace =
 activeSidebarItem === "User Management" ||
 activeSidebarItem.startsWith("User Management:");
 const userManagementView: UserManagementView =
 activeSidebarItem === "User Management:Add New User"
 ? "create-user"
 : activeSidebarItem === "User Management:Roles"
 ? "roles"
 : activeSidebarItem === "User Management:Permissions"
 ? "permissions"
 : activeSidebarItem === "User Management:Active Sessions"
 ? "sessions"
 : "users";
 const isReportsWorkspace =
 activeSidebarItem === "Reports & Analytics" ||
 activeSidebarItem.startsWith("Reports & Analytics:");
 const reportView: ReportView =
 activeSidebarItem === "Reports & Analytics:Order Reports"
 ? "orders"
 : activeSidebarItem === "Reports & Analytics:Product Reports"
 ? "products"
 : activeSidebarItem === "Reports & Analytics:Inventory Reports"
 ? "inventory"
 : activeSidebarItem === "Reports & Analytics:Customer Reports"
 ? "customers"
 : activeSidebarItem === "Reports & Analytics:Payment Reports"
 ? "payments"
 : "sales";
 const isSystemWorkspace =
 activeSidebarItem === "System Management" ||
 activeSidebarItem.startsWith("System Management:");
 const systemView: SystemView =
 activeSidebarItem === "System Management:System Events"
 ? "events"
 : activeSidebarItem === "System Management:Background Jobs"
 ? "jobs"
 : activeSidebarItem === "System Management:Application Settings"
 ? "settings"
 : activeSidebarItem === "System Management:Monitoring Overview"
 ? "monitoring"
 : activeSidebarItem === "System Management:Email Alerts"
 ? "alerts"
 : activeSidebarItem === "System Management:Migrations"
 ? "migrations"
 : activeSidebarItem === "System Management:Weekly Reports"
 ? "reports"
 : "audit";
 const isAccountWorkspace =
 activeSidebarItem === "Account" || activeSidebarItem.startsWith("Account:");
 const accountView: AccountView =
 activeSidebarItem === "Account:Security"
 ? "security"
 : activeSidebarItem === "Account:Logout"
 ? "logout"
 : "profile";
 const isConfigurationWorkspace =
 activeSidebarItem.startsWith("Store Settings:") ||
 activeSidebarItem.startsWith("Logistics:") ||
 activeSidebarItem.startsWith("Finance Configuration:");

 const configurationView: AdminConfigurationView =
 activeSidebarItem === "Store Settings:Commission Rules"
 ? "commissions"
 : activeSidebarItem === "Store Settings:Platform Rules"
 ? "marketplace"
 : activeSidebarItem === "Logistics:Delivery Services"
 ? "logistics-services"
 : activeSidebarItem === "Logistics:Shipping Zones"
 ? "logistics-zones"
 : activeSidebarItem === "Logistics:Shipping Rates"
 ? "logistics-rates"
 : activeSidebarItem === "Logistics:API & Webhooks"
 ? "logistics-integration"
 : activeSidebarItem === "Logistics:Logistics Companies"
 ? "logistics-companies"
 : activeSidebarItem === "Finance Configuration:Escrow Holds"
 ? "escrow"
 : "finance-settings";

 const sellerView =
 activeSidebarItem === "Sellers:Seller Applications"
 ? "applications"
 : activeSidebarItem === "Sellers:Seller Products"
 ? "products"
 : activeSidebarItem === "Sellers:Seller Orders"
 ? "orders"
 : activeSidebarItem === "Sellers:Seller Performance"
 ? "performance"
 : "all";

 const [busyAction, setBusyAction] = useState<string | null>(null);
 const [rejectionTarget, setRejectionTarget] = useState<{ kind: "seller" | "product"; id: string } | null>(null);

 const syncSidebarUrl = (tab: AdminTab, sidebarItem: string) => {
 const params = new URLSearchParams(searchParams.toString());

 params.set("tab", tab);

 if (sidebarItem === "Dashboard") {
 params.set("menu", "dashboard");
 params.delete("item");
 } else if (sidebarItem.includes(":")) {
 const [group, item] = sidebarItem.split(":");
 params.set("menu", normalizeSlug(group));
 params.set("item", normalizeSlug(item));
 if (tab === "inventory") {
 params.set("inventory_tab", normalizeSlug(item));
 }
 } else {
 params.set("menu", normalizeSlug(sidebarItem));
 params.delete("item");
 }

 const query = params.toString();
 router.replace(query ? `${pathname}?${query}` : pathname, {
 scroll: false,
 });
 };

 const resolveTab = (tabOrGroup: AdminTab | string): AdminTab => {
 const catalogMap: Record<string, AdminTab> = {
 "Catalog:Products": "products",
 "Catalog:Categories": "categories",
 "Catalog:Brands": "brands",
 "Catalog:Product Reviews": "reviews",
 "Orders:All Orders": "orders",
 "Orders:Pending Orders": "orders",
 "Orders:Processing Orders": "orders",
 "Orders:Completed Orders": "orders",
 "Orders:Cancelled Orders": "orders",
 "Orders:Order Tracking": "orders",
 "Inventory:Stock Overview": "inventory",
 "Inventory:Warehouses": "inventory",
 "Inventory:Stock Adjustments": "inventory",
 "Inventory:Low Stock Products": "inventory",
 "Customers:All Customers": "users",
 "Customers:Customer Addresses": "users",
 "Customers:Customer Reviews": "users",
 "Customers:Customer Support": "users",
 "User Management: UserMultiple02Icon": "users",
 "User Management:Add New User": "users",
 "User Management:Roles": "users",
 "User Management:Permissions": "users",
 "User Management:Active Sessions": "users",
 };

 return catalogMap[tabOrGroup] ?? (tabOrGroup as AdminTab);
 };

 const applySidebarSelection = (
 tabOrGroup: AdminTab | string,
 sidebarItem: string,
 sidebarGroup: string | null = null,
 shouldSyncUrl = true,
 ) => {
 const nextTab = resolveTab(tabOrGroup);

 setActiveTab(nextTab);
 setActiveSidebarItem(sidebarItem);

 if (shouldSyncUrl) {
 syncSidebarUrl(nextTab, sidebarItem);
 }
 };

 const loadOverviewData = async () => {
 setIsLoading(true);
 setOverviewError("");

 try {
 const [usersResponse, sellersResponse, productsResponse] =
 await Promise.all([
 adminService.listUsers({ page: 1, page_size: 8 }),
 adminService.listPendingSellers(),
 adminService.listPendingProducts(),
 ]);

 setTotalUsers(usersResponse.total);
 setPendingSellers(sellersResponse);
 setPendingProducts(productsResponse);
 } catch (error) {
 const message = getErrorMessage(error);
 setTotalUsers(null);
 setOverviewError(message);
 toast.error(message);
 } finally {
 setIsLoading(false);
 }
 };

 const refreshModerationQueues = async () => {
 try {
 const [sellersResponse, productsResponse] = await Promise.all([
 adminService.listPendingSellers(),
 adminService.listPendingProducts(),
 ]);

 setPendingSellers(sellersResponse);
 setPendingProducts(productsResponse);
 } catch (error) {
 toast.error(getErrorMessage(error));
 }
 };

 useEffect(() => {
 const token = authStorage.getAccessToken();
 const user = authStorage.getUser<StoredUser>();

 if (!token) {
 router.replace("/signin?redirect=/admin/dashboard");
 return;
 }

 if (!canAccessAdmin(user)) {
 setIsAuthorized(false);
 setIsCheckingAccess(false);
 return;
 }

 setIsAuthorized(true);
 setIsCheckingAccess(false);
 void loadOverviewData();
 }, [router]);

 useEffect(() => {
 if (isCheckingAccess || !isAuthorized) return;

 const menuParam = searchParams.get("menu");
 const itemParam = searchParams.get("item");

 if (!menuParam) {
 if (pathname === "/admin/dashboard") {
 applySidebarSelection("overview", "Dashboard", null, false);
 } else if (pathname.startsWith("/admin/inventory")) {
 applySidebarSelection("inventory", "Inventory", "Inventory", false);
 } else if (pathname.startsWith("/admin/customers")) {
 const customerItem = pathname.includes("/addresses")
 ? "Customer Addresses"
 : pathname.includes("/reviews")
 ? "Customer Reviews"
 : pathname.includes("/support")
 ? "Customer Support"
 : "All Customers";
 applySidebarSelection(
 "users",
 `Customers:${customerItem}`,
 "Customers",
 false,
 );
 }
 return;
 }

 if (menuParam === "dashboard") {
 applySidebarSelection("overview", "Dashboard", null, false);
 return;
 }

 const matchedGroup = visibleSidebarGroups.find(
 (group) => normalizeSlug(group.title) === menuParam,
 );

 if (!matchedGroup) return;

 if (itemParam) {
 const matchedItem = matchedGroup.items.find(
 (item) => normalizeSlug(item.label) === itemParam,
 );

 if (matchedItem) {
 const subItemKey = `${matchedGroup.title}:${matchedItem.label}`;
 const mappedTab = resolveTab(subItemKey);
 const nextTab = tabs.some((tab) => tab.key === mappedTab)
 ? mappedTab
 : resolveTab(matchedGroup.key);
 applySidebarSelection(nextTab, subItemKey, matchedGroup.title, false);
 return;
 }
 }

 applySidebarSelection(
 matchedGroup.key,
 matchedGroup.title,
 matchedGroup.title,
 false,
 );
 }, [isAuthorized, isCheckingAccess, searchParams]);

 const handleApproveSeller = async (sellerId: string) => {
 setBusyAction(`approve-seller-${sellerId}`);
 try {
 await adminService.approveSeller(sellerId);
 toast.success("Seller approved successfully.");
 await refreshModerationQueues();
 } catch (error) {
 toast.error(getErrorMessage(error));
 } finally {
 setBusyAction(null);
 }
 };

 const handleRejectSeller = (sellerId: string) => setRejectionTarget({ kind: "seller", id: sellerId });

 const handleApproveProduct = async (productId: string) => {
 setBusyAction(`approve-product-${productId}`);
 try {
 await adminService.approveProduct(productId);
 toast.success("Product approved successfully.");
 await refreshModerationQueues();
 } catch (error) {
 toast.error(getErrorMessage(error));
 } finally {
 setBusyAction(null);
 }
 };

 const handleRejectProduct = (productId: string) => setRejectionTarget({ kind: "product", id: productId });

 const submitRejection = async (reason: string) => {
 if (!rejectionTarget) return;
 const { kind, id } = rejectionTarget;
 setBusyAction(`reject-${kind}-${id}`);
 try {
 if (kind === "seller") await adminService.rejectSeller(id, reason);
 else await adminService.rejectProduct(id, reason);
 toast.success(`${kind === "seller" ? "Seller" : "Product"} rejected.`);
 setRejectionTarget(null);
 await refreshModerationQueues();
 } catch (error) {
 toast.error(getErrorMessage(error));
 } finally {
 setBusyAction(null);
 }
 };

 if (isCheckingAccess) {
 return (
 <section className="py-20">
 <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
 Loading admin panel...
 </div>
 </section>
 );
 }

 if (!isAuthorized) {
 return (
 <section className="py-20 bg-muted min-h-screen">
 <div className="max-w-[760px] mx-auto px-4 sm:px-8 xl:px-0">
 <div className="rounded-xl border border-red-light-4 bg-card p-7 text-center">
 <h2 className="text-2xl font-semibold text-foreground mb-2">
 Access denied
 </h2>
 <p className="text-muted-foreground">
 Hii page ni ya admin pekee. Hakikisha ume-login kwa admin account.
 </p>
 </div>
 </div>
 </section>
 );
 }

 const LegacyIcon = legacyVisualGroup
 ? legacyTheme[legacyVisualGroup].icon
 : DashboardSpeed01Icon;

 return (
 <DashboardShell
 user={adminUser}
 groups={shellGroups}
 title={activeMenuLabel}
 breadcrumb={activeMenuContextLabel}
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
 <div className="min-w-0 space-y-5">
 {(activeTab === "overview" ||
 activeTab === "users" ||
 activeTab === "sellers" ||
 activeTab === "products" ||
 activeTab === "categories" ||
 activeTab === "brands" ||
 activeTab === "reviews" ||
 activeTab === "orders" ||
 activeTab === "inventory" ||
 activeTab === "finance" ||
 activeTab === "analytics") &&
 isLoading ? (
 <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground shadow-sm">
 Loading dashboard data...
 </div>
 ) : null}

 {activeTab === "overview" && !isOverviewHiddenByMenuSelection ? (
 <MarketplaceOverview />
 ) : null}

 {false && activeTab === "overview" &&
 !isLoading &&
 !isOverviewHiddenByMenuSelection ? (
 <>
 {overviewError ? (
 <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-red-light-6 px-4 py-3 text-sm text-red-dark">
 <span>Unable to load dashboard statistics: {overviewError}</span>
 <button
 onClick={() => void loadOverviewData()}
 className="shrink-0 whitespace-nowrap font-semibold text-red-dark hover:text-red-800"
 >
 Retry
 </button>
 </div>
 ) : null}

 <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,.75fr)]">
 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card">
 <div className="border-b border-border px-5 py-5 dark:border-border sm:px-6">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
 <div>
 <p className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">
 Ecommerce operations
 </p>
 <h2 className="mt-1 text-2xl font-bold tracking-[-.02em] text-foreground sm:text-[28px]">
 Ecommerce Dashboard
 </h2>
 <p className="mt-1 text-sm text-muted-foreground dark:text-gray-300">
 Here&apos;s what is happening across Xerin Mart right now.
 </p>
 </div>
 <button
 type="button"
 onClick={loadOverviewData}
 className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition hover:border-[var(--primary)] hover:text-primary dark:border-border"
 >
 <HugeiconsIcon icon={RefreshCwIcon} size={16} />
 Refresh
 </button>
 </div>

 <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
 {[
 {
 label: "Registered users",
 value: totalUsers ?? "—",
 hint: "Platform accounts",
 icon: UserMultiple02Icon,
 badge: "bg-muted text-primary",
 },
 {
 label: "Seller reviews",
 value: pendingSellers.length,
 hint: "Awaiting approval",
 icon: Store01Icon,
 badge: "bg-primary/10 text-primary",
 },
 {
 label: "Product reviews",
 value: pendingProducts.length,
 hint: "Awaiting moderation",
 icon: PackageIcon,
 badge: "bg-muted text-primary",
 },
 ].map((metric) => (
 <div
 key={metric.label}
 className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-muted p-4 dark:border-border dark:bg-card/[.03]"
 >
 <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${metric.badge}`}>
 <HugeiconsIcon icon={metric.icon} size={20} />
 </span>
 <div className="min-w-0">
 <p className="truncate text-xs font-medium text-muted-foreground dark:text-gray-300">
 {metric.label}
 </p>
 <div className="mt-0.5 flex items-baseline gap-2">
 <strong className="text-xl font-bold text-foreground">
 {metric.value}
 </strong>
 <span className="truncate text-[11px] text-muted-foreground">
 {metric.hint}
 </span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="p-5 sm:p-6">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h3 className="text-lg font-bold text-foreground">
 Moderation workload
 </h3>
 <p className="text-sm text-muted-foreground dark:text-gray-300">
 Live approval queues returned by your backend.
 </p>
 </div>
 <div className="flex items-center gap-3 text-xs text-muted-foreground">
 <span className="inline-flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-primary" /> Sellers
 </span>
 <span className="inline-flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-primary" /> Products
 </span>
 </div>
 </div>

 <div className="mt-6 rounded-xl border border-border bg-muted p-4 dark:border-border dark:bg-card/[.02] sm:p-5">
 <div className="grid h-48 grid-cols-7 items-end gap-1.5 sm:gap-3 border-b border-l border-border px-2 sm:px-4 pb-0 pt-4 dark:border-border">
 {[42, 58, 50, 72, 61, 84, 70].map((height, index) => {
 const sellerFactor = Math.max(18, Math.min(92, height + Math.min(pendingSellers.length * 2, 12)));
 const productFactor = Math.max(16, Math.min(88, height - 12 + Math.min(pendingProducts.length * 2, 14)));
 return (
 <div key={index} className="flex h-full items-end justify-center gap-1.5">
 <span
 className="w-2.5 rounded-t bg-primary/85 transition-all"
 style={{ height: `${sellerFactor}%` }}
 />
 <span
 className="w-2.5 rounded-t bg-primary/85 transition-all"
 style={{ height: `${productFactor}%` }}
 />
 </div>
 );
 })}
 </div>
 <div className="mt-2 grid grid-cols-7 px-3 text-center text-[10px] font-medium text-muted-foreground">
 {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
 <span key={day}>{day}</span>
 ))}
 </div>
 </div>
 </div>
 </section>

 <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-1">
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card">
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className="text-sm font-bold text-foreground">Approval queues</p>
 <p className="mt-0.5 text-xs text-muted-foreground dark:text-gray-300">Items requiring administrator action</p>
 </div>
 <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
 <HugeiconsIcon icon={ShieldCheckIcon} size={18} />
 </span>
 </div>
 <div className="mt-5 space-y-4">
 <button
 type="button"
 onClick={() => applySidebarSelection("sellers", "Sellers:Seller Applications", "Sellers")}
 className="group w-full text-left"
 >
 <div className="mb-1.5 flex items-center justify-between text-sm">
 <span className="font-semibold text-foreground group-hover:text-primary">Seller applications</span>
 <span className="font-bold text-foreground">{pendingSellers.length}</span>
 </div>
 <div className="h-2 overflow-hidden rounded-full bg-muted dark:bg-card/10">
 <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(8, pendingSellers.length * 12))}%` }} />
 </div>
 </button>
 <button
 type="button"
 onClick={() => applySidebarSelection("products", "Catalog:Products", "Catalog")}
 className="group w-full text-left"
 >
 <div className="mb-1.5 flex items-center justify-between text-sm">
 <span className="font-semibold text-foreground group-hover:text-primary">Product approvals</span>
 <span className="font-bold text-foreground">{pendingProducts.length}</span>
 </div>
 <div className="h-2 overflow-hidden rounded-full bg-muted dark:bg-card/10">
 <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(8, pendingProducts.length * 10))}%` }} />
 </div>
 </button>
 </div>
 </section>

 <section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card">
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className="text-sm font-bold text-foreground">Platform shortcuts</p>
 <p className="mt-0.5 text-xs text-muted-foreground dark:text-gray-300">Jump into key operations</p>
 </div>
 <HugeiconsIcon icon={DashboardSpeed01Icon} size={20} className="text-primary" />
 </div>
 <div className="mt-4 grid grid-cols-2 gap-2">
 {[
 { label: "Orders", icon: ShoppingBag01Icon, tab: "orders" as AdminTab, item: "Orders:All Orders", group: "Orders" },
 { label: "Inventory", icon: Package02Icon, tab: "inventory" as AdminTab, item: "Inventory:Stock Overview", group: "Inventory" },
 { label: "Customers", icon: UserMultiple02Icon, tab: "users" as AdminTab, item: "Customers:All Customers", group: "Customers" },
 { label: "Analytics", icon: ChartColumnIcon, tab: "analytics" as AdminTab, item: "Reports & Analytics:Sales Reports", group: "Reports & Analytics" },
 ].map((shortcut) => (
 <button
 key={shortcut.label}
 type="button"
 onClick={() => applySidebarSelection(shortcut.tab, shortcut.item, shortcut.group)}
 className="flex items-center gap-2 rounded-lg border border-border px-3 py-3 text-left text-xs font-semibold text-muted-foreground transition hover:border-[var(--primary)] hover:text-primary dark:border-border dark:text-gray-200"
 >
 <HugeiconsIcon icon={shortcut.icon} size={16} />
 {shortcut.label}
 </button>
 ))}
 </div>
 </section>
 </div>
 </div>

 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card">
 <div className="flex flex-col gap-3 border-b border-border px-5 py-4 dark:border-border sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h3 className="text-lg font-bold text-foreground">Latest moderation items</h3>
 <p className="text-xs text-muted-foreground dark:text-gray-300">Recent seller and product submissions waiting for review.</p>
 </div>
 <button
 type="button"
 onClick={() => applySidebarSelection("sellers", "Sellers:Seller Applications", "Sellers")}
 className="text-sm font-semibold text-primary hover:text-primary"
 >
 View moderation queue
 </button>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full min-w-[760px] text-left">
 <thead className="bg-muted text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground dark:bg-card/[.03]">
 <tr>
 <th className="px-5 py-3">Type</th>
 <th className="px-5 py-3">Name</th>
 <th className="px-5 py-3">Reference</th>
 <th className="px-5 py-3">Status</th>
 <th className="px-5 py-3">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border)] dark:divide-white/10">
 {[
 ...pendingSellers.slice(0, 3).map((seller) => ({
 key: `seller-${seller.id}`,
 type: "Seller",
 name: seller.business_name,
 reference: seller.contact_email || seller.id.slice(0, 8),
 status: seller.status,
 action: () => applySidebarSelection("sellers", "Sellers:Seller Applications", "Sellers"),
 })),
 ...pendingProducts.slice(0, 3).map((product) => ({
 key: `product-${product.id}`,
 type: "Product",
 name: product.name,
 reference: product.sku,
 status: product.status,
 action: () => applySidebarSelection("products", "Catalog:Products", "Catalog"),
 })),
 ].slice(0, 5).map((row) => (
 <tr key={row.key} className="hover:bg-muted dark:hover:bg-card/[.03]">
 <td className="px-5 py-3.5">
 <span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground dark:bg-card/10 dark:text-gray-200">{row.type}</span>
 </td>
 <td className="max-w-[280px] truncate px-5 py-3.5 text-sm font-semibold text-foreground">{row.name}</td>
 <td className="px-5 py-3.5 text-sm text-muted-foreground dark:text-gray-300">{row.reference}</td>
 <td className="px-5 py-3.5">
 <span className="inline-flex rounded-full bg-primary px-2.5 py-1 text-xs font-semibold capitalize text-primary">{row.status.replaceAll("_", " ")}</span>
 </td>
 <td className="px-5 py-3.5">
 <button type="button" onClick={row.action} className="text-sm font-semibold text-primary hover:underline">Review</button>
 </td>
 </tr>
 ))}
 {pendingSellers.length === 0 && pendingProducts.length === 0 ? (
 <tr>
 <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground dark:text-gray-300">
 No moderation items are waiting right now.
 </td>
 </tr>
 ) : null}
 </tbody>
 </table>
 </div>
 </section>
 </>
 ) : null}

 {isConfigurationWorkspace && !isLoading ? (
 <AdminConfiguration view={configurationView} />
 ) : null}

 {isPaymentsWorkspace && !isLoading ? (
 <AdminPayments view={paymentView} />
 ) : null}
 {isAdvertisingWorkspace && !isLoading ? (
 <AdminAdvertisements view={advertisementView} />
 ) : null}
 {isPromotionsWorkspace && !isLoading ? (
 <AdminPromotions view={promotionView} />
 ) : null}
 {isCommunicationsWorkspace && !isLoading ? (
 <AdminCommunications view={communicationView} />
 ) : null}
 {isUserManagementWorkspace && !isLoading ? (
 <AdminUserManagement view={userManagementView} />
 ) : null}
 {isReportsWorkspace && !isLoading ? (
 <AdminReports view={reportView} />
 ) : null}
 {isSystemWorkspace && !isLoading ? (
 <AdminSystemManagement view={systemView} />
 ) : null}
 {isAccountWorkspace && !isLoading ? (
 <AdminAccount view={accountView} />
 ) : null}

 {activeTab === "products" &&
 !isLoading &&
 !isAdvertisingWorkspace &&
 !isPromotionsWorkspace ? (
 <AdminProducts />
 ) : null}
 {activeTab === "categories" && !isLoading ? (
 <AdminCategories />
 ) : null}
 {activeTab === "brands" && !isLoading ? <AdminBrands /> : null}
 {activeTab === "reviews" && !isLoading ? <AdminReviews /> : null}
 {activeTab === "orders" && !isLoading ? (
 <AdminOrdersDashboard
 initialTab={searchParams.get("orders_tab") ?? "all"}
 />
 ) : null}

 {activeTab === "inventory" && !isLoading ? (
 <>
 {pathname.includes("/admin/inventory/products/") ? (
 <AdminProductInventoryDetails
 productId={
 pathname
 .split("/admin/inventory/products/")[1]
 ?.split("/")[0] ?? ""
 }
 />
 ) : pathname.includes("/admin/inventory/warehouses/") ? (
 <AdminWarehouseDetails
 warehouseId={
 pathname
 .split("/admin/inventory/warehouses/")[1]
 ?.split("/")[0] ?? ""
 }
 />
 ) : (
 <>
 {(searchParams.get("inventory_tab") ?? "stock-overview") ===
 "stock-overview" && <AdminInventoryDashboard />}
 {searchParams.get("inventory_tab") === "warehouses" && (
 <AdminInventoryWarehouses />
 )}
 {searchParams.get("inventory_tab") ===
 "stock-adjustments" && <AdminInventoryAdjustments />}
 {searchParams.get("inventory_tab") ===
 "low-stock-products" && <AdminInventoryLowStock />}
 </>
 )}
 </>
 ) : null}

 {activeTab === "users" &&
 !isLoading &&
 !isUserManagementWorkspace ? (
 <>
 {pathname.includes("/admin/customers/") &&
 pathname.split("/admin/customers/")[1]?.length &&
 !pathname.includes("/addresses") &&
 !pathname.includes("/reviews") &&
 !pathname.includes("/support") ? (
 <AdminCustomerDetails
 customerId={
 pathname.split("/admin/customers/")[1]?.split("/")[0] ??
 ""
 }
 />
 ) : activeSidebarItem === "Customers:Customer Addresses" ||
 pathname.includes("/admin/customers/addresses") ? (
 <AdminCustomerAddresses />
 ) : activeSidebarItem === "Customers:Customer Reviews" ||
 pathname.includes("/admin/customers/reviews") ? (
 <AdminCustomerReviews />
 ) : activeSidebarItem === "Customers:Customer Support" ||
 pathname.includes("/admin/customers/support") ? (
 <AdminCustomerSupport />
 ) : (
 <AdminCustomers />
 )}
 </>
 ) : null}

 {activeTab === "finance" && !isLoading && !isPaymentsWorkspace && !isConfigurationWorkspace ? (
 <AdminFinance />
 ) : null}

 {activeTab === "analytics" && !isLoading && !isReportsWorkspace ? (
 <AdminAnalytics />
 ) : null}

 {activeTab === "sellers" && !isLoading ? (
 sellerView === "all" || sellerView === "applications" ? (
 <AdminSellers mode={sellerView} />
 ) : (
 <SellerSubWorkspace view={sellerView} />
 )
 ) : null}
 {false &&
 activeTab === "sellers" &&
 !isLoading ? (
 <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <h3 className="text-xl font-semibold text-foreground mb-4">
 Pending Seller Applications
 </h3>
 <div className="space-y-3">
 {pendingSellers.length === 0 ? (
 <p className="text-muted-foreground">
 No pending seller applications right now.
 </p>
 ) : (
 pendingSellers.map((seller) => (
 <div
 key={seller.id}
 className="rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
 >
 <div>
 <h4 className="font-medium text-foreground">
 {seller.business_name}
 </h4>
 <p className="text-sm text-muted-foreground">
 Email: {seller.contact_email ?? "-"}
 </p>
 <p className="text-sm text-muted-foreground">
 Phone: {seller.contact_phone ?? "-"}
 </p>
 <p className="text-sm text-muted-foreground capitalize">
 Status: {seller.status}
 </p>
 </div>
 <div className="flex gap-2">
 <button
 type="button"
 onClick={() => void handleApproveSeller(seller.id)}
 disabled={
 busyAction === `approve-seller-${seller.id}`
 }
 className="rounded-lg bg-muted px-3 py-2 text-[var(--success)] hover:opacity-90 disabled:opacity-60"
 >
 Approve
 </button>
 <button
 type="button"
 onClick={() => void handleRejectSeller(seller.id)}
 disabled={
 busyAction === `reject-seller-${seller.id}`
 }
 className="rounded-lg bg-red-light-6 px-3 py-2 text-[var(--destructive)] hover:opacity-90 disabled:opacity-60"
 >
 Reject
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 ) : null}
 </div>
 <ReasonActionDialog key={rejectionTarget ? `${rejectionTarget.kind}:${rejectionTarget.id}` : "closed"} open={Boolean(rejectionTarget)} title={`Reject ${rejectionTarget?.kind || "item"}?`} description="Provide a clear reason. It will be submitted through the backend moderation workflow and should help the applicant understand the decision." busy={Boolean(busyAction?.startsWith("reject-"))} onCancel={() => setRejectionTarget(null)} onSubmit={(reason) => void submitRejection(reason)} />
 </DashboardShell>
 );
}
