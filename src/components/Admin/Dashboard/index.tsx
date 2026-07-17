"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authStorage } from "@/lib/auth/storage";
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
import AdminCustomers from "@/components/Admin/Customers/Customers";
import AdminCustomerDetails from "@/components/Admin/Customers/CustomerDetails";
import AdminCustomerAddresses from "@/components/Admin/Customers/Addresses";
import AdminCustomerReviews from "@/components/Admin/Customers/Reviews";
import AdminCustomerSupport from "@/components/Admin/Customers/Support";
import AdminOperationsWorkspace from "@/components/Admin/Operations";
import AdminSellers from "@/components/Admin/Sellers";
import SellerSubWorkspace from "@/components/Admin/Sellers/SubWorkspace";
import AdminPayments, { PaymentView } from "@/components/Admin/Payments";
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
import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  ChevronDown,
  CircleUserRound,
  CreditCard,
  Gauge,
  LogOut,
  Menu,
  Megaphone,
  Moon,
  Package,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Sun,
  Tag,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

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
  icon: LucideIcon;
};

const sidebarGroups: SidebarGroup[] = [
  {
    title: "Catalog",
    key: "products",
    icon: Package,
    items: [
      { label: "Products", href: "?tab=products&menu=catalog&item=products" },
      {
        label: "Categories",
        href: "?tab=categories&menu=catalog&item=categories",
      },
      { label: "Brands", href: "?tab=brands&menu=catalog&item=brands" },
      {
        label: "Product Reviews",
        href: "?tab=reviews&menu=catalog&item=product-reviews",
      },
    ],
  },
  {
    title: "Orders",
    key: "orders",
    icon: ShoppingBag,
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
    icon: Boxes,
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
    icon: Users,
    items: [
      {
        label: "All Customers",
        href: "?tab=users&menu=customers&item=all-customers",
      },
      {
        label: "Customer Addresses",
        href: "?tab=users&menu=customers&item=customer-addresses",
      },
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
    icon: Store,
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
        label: "Seller Products",
        href: "?tab=sellers&menu=sellers&item=seller-products",
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
    title: "Payments",
    key: "finance",
    icon: CreditCard,
    items: [
      {
        label: "Transactions",
        href: "?tab=finance&menu=payments&item=transactions",
      },
      {
        label: "Payment Methods",
        href: "?tab=finance&menu=payments&item=payment-methods",
      },
      { label: "Refunds", href: "?tab=finance&menu=payments&item=refunds" },
      {
        label: "Failed Payments",
        href: "?tab=finance&menu=payments&item=failed-payments",
      },
    ],
  },
  {
    title: "Promotions",
    key: "products",
    icon: Tag,
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
    icon: Megaphone,
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
    icon: ShieldCheck,
    items: [
      { label: "Users", href: "?tab=users&menu=user-management&item=users" },
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
    icon: BarChart3,
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
    title: "System Management",
    key: "overview",
    icon: Settings,
    items: [
      {
        label: "Audit Logs",
        href: "?tab=overview&menu=system-management&item=audit-logs",
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
    icon: CircleUserRound,
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
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M3 3h6v6H3V3Zm8 0h6v6h-6V3ZM3 11h6v6H3v-6Zm8 0h6v6h-6v-6Z" />
        </svg>
      );
    case "users":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 1 1 14 0H3Z" />
        </svg>
      );
    case "sellers":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H2V5Zm0 4h16v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Zm6 2v2h4v-2H8Z" />
        </svg>
      );
    case "products":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 1 2 5l8 4 8-4-8-4Zm-8 7 8 4 8-4v7l-8 4-8-4V8Z" />
        </svg>
      );
    case "categories":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4 3h12a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1Zm2 3v2h8V6H6Zm0 4v2h8v-2H6Z" />
        </svg>
      );
    case "brands":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4 4h12v2H4V4Zm0 5h12v2H4V9Zm0 5h12v2H4v-2Z" />
        </svg>
      );
    case "reviews":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 2l2.5 5.5h5.5l-4.5 4 1.5 6-5-3.5L4.5 18l1.5-6-4.5-4h5.5L10 2Z" />
        </svg>
      );
    case "orders":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4 3h12v2H4V3Zm0 4h12v10H4V7Zm3 2v2h6V9H7Zm0 4v2h4v-2H7Z" />
        </svg>
      );
    case "finance":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7Zm1 11.59V14H9v-1.41a3 3 0 0 1-2-2.82h2a1 1 0 0 0 2 0 .5.5 0 0 0-.5-.5h-1a3 3 0 0 1-.5-5.92V3h2v1.35a3 3 0 0 1 1.85 2.65h-2A1 1 0 0 0 10 6a.5.5 0 0 0 .5.5h1a3 3 0 0 1-.5 5.09Z" />
        </svg>
      );
    case "analytics":
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M3 17h14v-2H3v2Zm2-4h2V8H5v5Zm4 0h2V4H9v9Zm4 0h2v-6h-2v6Z" />
        </svg>
      );
    default:
      return null;
  }
};

const canAccessAdmin = (user: StoredUser | null) => {
  if (!user) return false;

  const accountType = (user.account_type ?? "").toLowerCase();
  const roles = (user.roles ?? []).map((role) => role.toLowerCase());

  return (
    accountType === "admin" ||
    accountType === "super_admin" ||
    roles.includes("admin") ||
    roles.includes("super_admin")
  );
};

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
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const adminUser = authStorage.getUser<StoredUser>();
  const adminName =
    [adminUser?.first_name, adminUser?.last_name].filter(Boolean).join(" ") ||
    "Administrator";
  const formatWalletAmount = (value: number) => formatCurrency(value);

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingSellers, setPendingSellers] = useState<AdminSeller[]>([]);
  const [pendingProducts, setPendingProducts] = useState<AdminProduct[]>([]);

  const [surfaceSearch, setSurfaceSearch] = useState("");
  const [openSidebarGroup, setOpenSidebarGroup] = useState<string | null>(null);
  const [activeSidebarItem, setActiveSidebarItem] =
    useState<string>("Dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const hiddenOverviewMenuGroups = [
    "Communications",
    "System Management",
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
    { icon: LucideIcon; eyebrow: string; gradient: string }
  > = {
    Dashboard: {
      icon: Gauge,
      eyebrow: "Platform command center",
      gradient: "from-[#111827] via-[#263244] to-[#f47524]",
    },
    Catalog: {
      icon: Package,
      eyebrow: "Catalog operations",
      gradient: "from-[#111827] via-[#263244] to-[#f47524]",
    },
    Orders: {
      icon: ShoppingBag,
      eyebrow: "Order fulfillment",
      gradient: "from-[#111827] via-[#263244] to-[#f47524]",
    },
    Inventory: {
      icon: Boxes,
      eyebrow: "Stock control",
      gradient: "from-[#111827] via-[#263244] to-[#f47524]",
    },
    Customers: {
      icon: Users,
      eyebrow: "Customer operations",
      gradient: "from-[#111827] via-[#263244] to-[#f47524]",
    },
    Sellers: {
      icon: Store,
      eyebrow: "Marketplace partners",
      gradient: "from-[#111827] via-[#263244] to-[#f47524]",
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
    activeSidebarItem === "Payments:Payment Methods"
      ? "methods"
      : activeSidebarItem === "Payments:Refunds"
        ? "refunds"
        : activeSidebarItem === "Payments:Failed Payments"
          ? "failed"
          : "transactions";
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
    activeSidebarItem === "User Management:Roles"
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
          : "audit";
  const isAccountWorkspace =
    activeSidebarItem === "Account" || activeSidebarItem.startsWith("Account:");
  const accountView: AccountView =
    activeSidebarItem === "Account:Security"
      ? "security"
      : activeSidebarItem === "Account:Logout"
        ? "logout"
        : "profile";
  const operationsWorkspace = null;
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
      "User Management:Users": "users",
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
    setOpenSidebarGroup(sidebarGroup);
    setIsMobileSidebarOpen(false);

    if (shouldSyncUrl) {
      syncSidebarUrl(nextTab, sidebarItem);
    }
  };

  const loadOverviewData = async () => {
    setIsLoading(true);

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
      toast.error(getErrorMessage(error));
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
      if (pathname.startsWith("/admin/inventory")) {
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

    const matchedGroup = sidebarGroups.find(
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

  const adminWalletCards = [
    { title: "Commission Earned", value: 12927.52, icon: BarChart3 },
    { title: "Delivery Charge Earned", value: 1660, icon: ShoppingBag },
    { title: "Total Tax Collected", value: 2666, icon: CreditCard },
    { title: "Pending Amount", value: 7987.5, icon: RefreshCw },
  ];

  const auctionWalletCards = [
    { title: "Entry Fee", value: 1517, icon: CreditCard },
    { title: "Tax", value: 0, icon: BarChart3 },
    { title: "Commission Collected", value: 0, icon: Gauge },
    { title: "Self Auction Shipping Fee", value: 0, icon: ShoppingBag },
  ];

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

  const handleRejectSeller = async (sellerId: string) => {
    const reason = window.prompt("Andika sababu ya kumkataa seller:");

    if (!reason || !reason.trim()) {
      return;
    }

    setBusyAction(`reject-seller-${sellerId}`);
    try {
      await adminService.rejectSeller(sellerId, reason.trim());
      toast.success("Seller rejected.");
      await refreshModerationQueues();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

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

  const handleRejectProduct = async (productId: string) => {
    const reason = window.prompt("Andika sababu ya kukataa product:");

    if (!reason || !reason.trim()) {
      return;
    }

    setBusyAction(`reject-product-${productId}`);
    try {
      await adminService.rejectProduct(productId, reason.trim());
      toast.success("Product rejected.");
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
      <section className="py-20 bg-gray-1 dark:bg-darkTheme-secondary-bg min-h-screen">
        <div className="max-w-[760px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="rounded-xl border border-red-light-4 bg-white dark:bg-darkTheme-card p-7 text-center">
            <h2 className="text-2xl font-semibold text-dark dark:text-white mb-2">
              Access denied
            </h2>
            <p className="text-dark-4 dark:text-darkTheme-body-color">
              Hii page ni ya admin pekee. Hakikisha ume-login kwa admin account.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const LegacyIcon = legacyVisualGroup
    ? legacyTheme[legacyVisualGroup].icon
    : Gauge;

  return (
    <section className="admin-dashboard-shell min-h-screen bg-[#f3f7fb] py-4 text-[#0f172a] dark:bg-[#111827] dark:text-white sm:py-6">
      {isMobileSidebarOpen ? (
        <button
          aria-label="Close admin navigation"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 xl:hidden"
        />
      ) : null}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 xl:px-8">
        <div
          className={`grid grid-cols-1 gap-6 ${isSidebarCollapsed ? "xl:grid-cols-[88px_1fr]" : "xl:grid-cols-[280px_1fr]"}`}
        >
          <aside
            className={`${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-[286px] overflow-y-auto bg-gradient-to-b from-[#2d3134] to-[#1f2937] p-4 text-white shadow-2xl transition-all xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:w-auto xl:translate-x-0 xl:rounded-2xl ${isSidebarCollapsed ? "xl:px-3" : ""}`}
          >
            <div className="px-3 py-2 border-b border-white/15">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7941d] text-sm font-bold">
                  XM
                </span>
                {!isSidebarCollapsed && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-white/60">
                      Xerin Market
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">Admin Center</h2>
                  </div>
                )}
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="ml-auto xl:hidden"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  applySidebarSelection("overview", "Dashboard", null);
                }}
                className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors ${
                  activeSidebarItem === "Dashboard"
                    ? "bg-white/15 text-white"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                <span className="inline-flex items-center gap-2.5 text-sm font-semibold">
                  <span className="inline-flex h-5 w-5 items-center justify-center shrink-0">
                    {tabIcon("overview")}
                  </span>
                  {!isSidebarCollapsed && "Dashboard"}
                </span>
              </button>
            </div>

            <nav className="mt-4 space-y-1.5">
              {sidebarGroups.map((group) => {
                const GroupIcon = group.icon;
                const isOpen =
                  openSidebarGroup === group.title ||
                  group.items.some((item) => {
                    if (item.href.startsWith("/admin/")) {
                      return pathname.startsWith(item.href.split("?")[0]);
                    }
                    const params = new URLSearchParams(
                      item.href.replace("?", ""),
                    );
                    const menu = params.get("menu");
                    const itemParam = params.get("item");
                    if (!menu) return false;
                    const currentMenu = searchParams.get("menu");
                    const currentItem = searchParams.get("item");
                    return (
                      currentMenu === menu &&
                      (!itemParam || currentItem === itemParam)
                    );
                  });
                const isGroupActive =
                  activeSidebarItem === group.title ||
                  activeSidebarItem.startsWith(`${group.title}:`);

                return (
                  <div key={group.title} className="px-1">
                    <button
                      type="button"
                      title={isSidebarCollapsed ? group.title : undefined}
                      onClick={() => {
                        if (isSidebarCollapsed) {
                          setIsSidebarCollapsed(false);
                          setOpenSidebarGroup(group.title);
                          return;
                        }
                        const nextOpenGroup =
                          openSidebarGroup === group.title ? null : group.title;
                        setOpenSidebarGroup(nextOpenGroup);
                      }}
                      className={`w-full rounded-xl px-2.5 py-2 text-left text-[13px] font-semibold uppercase tracking-[0.08em] transition-all ${
                        isGroupActive || isOpen
                          ? "bg-white/12 text-white shadow-sm"
                          : "text-white/85 hover:bg-white/7 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2.5">
                          <span
                            className="inline-flex h-5 w-5 items-center justify-center text-base leading-none shrink-0"
                            aria-hidden="true"
                          >
                            <GroupIcon size={18} />
                          </span>
                          {!isSidebarCollapsed && <span>{group.title}</span>}
                        </span>
                        {!isSidebarCollapsed && (
                          <svg
                            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 0 1 1.1 1.02l-4.25 4.5a.75.75 0 0 1-1.1 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
                          </svg>
                        )}
                      </span>
                    </button>

                    {isOpen && !isSidebarCollapsed ? (
                      <div className="mt-1 border-l border-white/15 pl-3 space-y-1">
                        {group.items.map((item) => {
                          const subItemKey = `${group.title}:${item.label}`;
                          const isSelected = activeSidebarItem === subItemKey;
                          const isExternal = item.href.startsWith("/admin/");

                          return isExternal ? (
                            <Link
                              key={item.label}
                              href={item.href}
                              className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                                pathname.startsWith(item.href.split("?")[0])
                                  ? "text-white font-semibold"
                                  : "text-white/80 hover:text-white"
                              }`}
                            >
                              <span className="inline-flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${pathname.startsWith(item.href.split("?")[0]) ? "bg-white" : "bg-white/60"}`}
                                />
                                <span>{item.label}</span>
                              </span>
                            </Link>
                          ) : (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {
                                if (group.title === "Catalog") {
                                  applySidebarSelection(
                                    subItemKey,
                                    subItemKey,
                                    group.title,
                                  );
                                  return;
                                }
                                if (group.title === "Orders") {
                                  const orderTabMap: Record<string, string> = {
                                    "All Orders": "all",
                                    "Pending Orders": "pending",
                                    "Processing Orders": "processing",
                                    "Completed Orders": "completed",
                                    "Cancelled Orders": "cancelled",
                                    "Order Tracking": "tracking",
                                  };
                                  const ordersTab =
                                    orderTabMap[item.label] ?? "all";
                                  const itemSlug = normalizeSlug(item.label);
                                  setIsMobileSidebarOpen(false);
                                  router.push(
                                    `/admin/dashboard?tab=orders&menu=orders&item=${itemSlug}&orders_tab=${ordersTab}`,
                                  );
                                  return;
                                }
                                applySidebarSelection(
                                  group.key,
                                  subItemKey,
                                  group.title,
                                );
                              }}
                              className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                                isSelected
                                  ? "bg-gradient-to-r from-[#f47524]/35 to-transparent font-semibold text-white"
                                  : "text-white/75 hover:bg-white/7 hover:text-white"
                              }`}
                            >
                              <span className="inline-flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-[#f6a15e] shadow-[0_0_8px_rgba(244,117,36,.9)]" : "bg-white/45"}`}
                                />
                                <span>{item.label}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>

            {!isSidebarCollapsed && (
              <div className="mt-6 rounded-xl bg-white/10 p-3">
                <p className="text-xs text-white/70">Quick Moderation Queue</p>
                <div className="mt-2 text-sm space-y-1">
                  <p>
                    Sellers:{" "}
                    <span className="font-semibold">
                      {pendingSellers.length}
                    </span>
                  </p>
                  <p>
                    Products:{" "}
                    <span className="font-semibold">
                      {pendingProducts.length}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((v) => !v)}
              className="mt-4 hidden w-full rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/10 xl:block"
            >
              {isSidebarCollapsed ? "Expand" : "Collapse sidebar"}
            </button>
          </aside>

          <main className="space-y-5">
            <header className="sticky top-3 z-30 rounded-2xl border border-[#e2e8f0] bg-white/95 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#1f2937]/95 sm:px-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-white/10 xl:hidden"
                >
                  <Menu size={21} />
                </button>
                <div className="min-w-0">
                  <p className="hidden text-xs text-[#64748b] sm:block">
                    Admin Center / {activeMenuContextLabel}
                  </p>
                  <h2 className="truncate text-base font-bold">
                    {activeMenuLabel}
                  </h2>
                </div>
                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      applySidebarSelection(
                        "overview",
                        "System Management:System Events",
                        "System Management",
                      )
                    }
                    aria-label="System notifications"
                    className="relative rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    <Bell size={19} />
                    {pendingSellers.length + pendingProducts.length > 0 && (
                      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#f7941d]" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className="rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsProfileOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] px-2 py-1.5 dark:border-white/10"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7941d] text-sm font-bold text-white">
                        {adminName[0]}
                      </span>
                      <span className="hidden max-w-32 truncate text-sm font-semibold sm:block">
                        {adminName}
                      </span>
                      <ChevronDown size={15} />
                    </button>
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#e2e8f0] bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#2d3134]">
                        <div className="border-b border-[#e2e8f0] p-3 dark:border-white/10">
                          <p className="font-semibold">{adminName}</p>
                          <p className="truncate text-xs text-[#64748b]">
                            {adminUser?.email}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-green-600">
                            Administrator
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            applySidebarSelection(
                              "overview",
                              "Account:Profile",
                              "Account",
                            );
                            setIsProfileOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/10"
                        >
                          <CircleUserRound size={16} />
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            applySidebarSelection(
                              "overview",
                              "Account:Security",
                              "Account",
                            );
                            setIsProfileOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-white/10"
                        >
                          <ShieldCheck size={16} />
                          Security
                        </button>
                        <button
                          onClick={() => void logout()}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>
            <div
              className={`rounded-2xl p-4 sm:p-5 shadow-sm ${legacyVisualGroup ? `border border-white/10 bg-gradient-to-br ${legacyTheme[legacyVisualGroup].gradient} text-white shadow-lg` : "border border-gray-200 bg-white"}`}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  {legacyVisualGroup ? (
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner"
                      aria-hidden="true"
                    >
                      <LegacyIcon size={24} />
                    </span>
                  ) : null}
                  <div>
                    {legacyVisualGroup ? (
                      <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-white/60">
                        {legacyTheme[legacyVisualGroup].eyebrow}
                      </p>
                    ) : null}
                    <h1
                      className={`text-xl sm:text-2xl font-semibold ${legacyVisualGroup ? "mt-1 text-white" : "text-[#111827]"}`}
                    >
                      {activeTab === "orders"
                        ? "Order Management"
                        : activeTab === "inventory"
                          ? "Inventory Overview"
                          : activeTab === "users" &&
                              activeSidebarItem !== "Dashboard"
                            ? "Customer Management"
                            : "Dashboard Overview"}
                    </h1>
                    <p
                      className={`text-sm mt-1 ${legacyVisualGroup ? "text-white/70" : "text-gray-500"}`}
                    >
                      {activeTab === "orders"
                        ? `Admin / Orders / ${activeMenuLabel}`
                        : activeTab === "inventory"
                          ? `Admin / Inventory / ${activeMenuLabel}`
                          : activeTab === "users" &&
                              activeSidebarItem !== "Dashboard"
                            ? `Manage customer accounts, addresses, orders and engagement`
                            : `Tab: ${activeMenuLabel}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <input
                    value={surfaceSearch}
                    onChange={(event) => setSurfaceSearch(event.target.value)}
                    placeholder={dynamicSearchPlaceholder}
                    className={`rounded-xl px-4 py-2.5 text-sm w-full sm:w-[240px] ${legacyVisualGroup ? "border border-white/20 bg-white/15 text-white placeholder:text-white/55" : "border border-gray-200 bg-[#f8fafc] text-gray-700"}`}
                  />
                  <button
                    type="button"
                    onClick={loadOverviewData}
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${legacyVisualGroup ? "bg-white text-[#111827] hover:bg-white/90" : "bg-[#4b5563] text-white hover:bg-[#1f2937]"}`}
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>

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
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">
                Loading dashboard data...
              </div>
            ) : null}

            {activeTab === "overview" &&
            !isLoading &&
            !isOverviewHiddenByMenuSelection ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Platform users",
                      value: totalUsers,
                      hint: "Registered accounts",
                    },
                    {
                      label: "Seller applications",
                      value: pendingSellers.length,
                      hint: "Awaiting review",
                    },
                    {
                      label: "Product approvals",
                      value: pendingProducts.length,
                      hint: "Awaiting moderation",
                    },
                    {
                      label: "Operational status",
                      value: "Live",
                      hint: "Core API connected",
                    },
                  ].map((metric, index) => {
                    const accents = [
                      "from-blue-500 to-cyan-400",
                      "from-orange-500 to-amber-400",
                      "from-violet-500 to-fuchsia-400",
                      "from-emerald-500 to-lime-400",
                    ];
                    return (
                      <div
                        key={metric.label}
                        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <span
                          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accents[index]}`}
                        />
                        <div
                          className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accents[index]} text-sm font-bold text-white`}
                        >
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium text-gray-500">
                          {metric.label}
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-[#111827]">
                          {metric.value}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {metric.hint}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
                  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#f7941d]">
                          Priority queue
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-[#111827]">
                          Marketplace moderation
                        </h3>
                      </div>
                      <ShieldCheck className="text-[#f7941d]" size={24} />
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() =>
                          applySidebarSelection(
                            "sellers",
                            "Sellers:Seller Applications",
                            "Sellers",
                          )
                        }
                        className="flex items-center justify-between rounded-xl border border-gray-200 p-4 text-left hover:border-[#f7941d]"
                      >
                        <span>
                          <b className="block text-sm">Seller applications</b>
                          <small className="text-gray-500">
                            Review business and KYC submissions
                          </small>
                        </span>
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-[#f7941d]">
                          {pendingSellers.length}
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          applySidebarSelection(
                            "products",
                            "Catalog:Products",
                            "Catalog",
                          )
                        }
                        className="flex items-center justify-between rounded-xl border border-gray-200 p-4 text-left hover:border-[#f7941d]"
                      >
                        <span>
                          <b className="block text-sm">Product approvals</b>
                          <small className="text-gray-500">
                            Moderate submitted catalog items
                          </small>
                        </span>
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-[#f7941d]">
                          {pendingProducts.length}
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          applySidebarSelection(
                            "orders",
                            "Orders:Pending Orders",
                            "Orders",
                          )
                        }
                        className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:border-[#f7941d]"
                      >
                        <ShoppingBag size={20} className="text-[#f7941d]" />
                        <span>
                          <b className="block text-sm">Order operations</b>
                          <small className="text-gray-500">
                            Inspect pending fulfilment
                          </small>
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          applySidebarSelection(
                            "overview",
                            "System Management:System Events",
                            "System Management",
                          )
                        }
                        className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:border-[#f7941d]"
                      >
                        <Bell size={20} className="text-[#f7941d]" />
                        <span>
                          <b className="block text-sm">System events</b>
                          <small className="text-gray-500">
                            Review platform alerts
                          </small>
                        </span>
                      </button>
                    </div>
                  </section>
                  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[.18em] text-green-600">
                          Platform status
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-[#111827]">
                          Operations healthy
                        </h3>
                      </div>
                      <span className="relative flex h-3 w-3">
                        <span className="absolute h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                        <span className="relative h-3 w-3 rounded-full bg-green-500" />
                      </span>
                    </div>
                    <div className="mt-5 space-y-3 text-sm">
                      {[
                        ["Core API", "Connected"],
                        ["Moderation queues", "Available"],
                        ["Admin permissions", "Enforced"],
                        ["Background processing", "Monitor jobs"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between border-b border-gray-100 pb-3"
                        >
                          <span className="text-gray-500">{label}</span>
                          <b>{value}</b>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        applySidebarSelection(
                          "overview",
                          "System Management:Background Jobs",
                          "System Management",
                        )
                      }
                      className="mt-4 text-sm font-semibold text-[#f7941d]"
                    >
                      Open system management
                    </button>
                  </section>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-[#eef3f9] p-4 shadow-sm">
                  <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-[#222]">
                    <CreditCard size={18} className="text-[#f7941d]" />
                    Admin Wallet
                  </h3>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col items-center justify-center text-center min-h-[180px]">
                      <BarChart3 size={30} className="text-[#f7941d]" />
                      <p className="mt-2 text-2xl sm:text-3xl font-semibold text-[#222]">
                        {formatWalletAmount(41992)}
                      </p>
                      <p className="mt-1 text-sm sm:text-base font-medium text-[#222]">
                        In-House Earning
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {adminWalletCards.map((card) => {
                        const CardIcon = card.icon;
                        return (
                          <div
                            key={card.title}
                            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm min-h-[92px]"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xl sm:text-2xl font-semibold leading-tight text-[#222]">
                                  {formatWalletAmount(card.value)}
                                </p>
                                <p className="mt-1 text-xs sm:text-sm text-gray-700">
                                  {card.title}
                                </p>
                              </div>
                              <span
                                className="rounded-xl bg-orange-50 p-2 text-[#f7941d]"
                                aria-hidden="true"
                              >
                                <CardIcon size={20} />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-[#eef3f9] p-4 shadow-sm">
                  <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-[#222]">
                    <Gauge size={18} className="text-[#f7941d]" />
                    Auction Wallet
                  </h3>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col items-center justify-center text-center min-h-[180px]">
                      <Gauge size={30} className="text-[#f7941d]" />
                      <p className="mt-2 text-2xl sm:text-3xl font-semibold text-[#222]">
                        {formatWalletAmount(0)}
                      </p>
                      <p className="mt-1 text-sm sm:text-base font-medium text-[#222]">
                        In-House Total Earning
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {auctionWalletCards.map((card) => {
                        const CardIcon = card.icon;
                        return (
                          <div
                            key={card.title}
                            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm min-h-[92px]"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xl sm:text-2xl font-semibold leading-tight text-[#222]">
                                  {formatWalletAmount(card.value)}
                                </p>
                                <p className="mt-1 text-xs sm:text-sm text-gray-700">
                                  {card.title}
                                </p>
                              </div>
                              <span
                                className="rounded-xl bg-orange-50 p-2 text-[#f7941d]"
                                aria-hidden="true"
                              >
                                <CardIcon size={20} />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {operationsWorkspace && !isLoading ? (
              <AdminOperationsWorkspace workspace={operationsWorkspace} />
            ) : null}

            {isPaymentsWorkspace && !isLoading ? (
              <AdminPayments view={paymentView} />
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
            !operationsWorkspace &&
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
            !operationsWorkspace &&
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

            {activeTab === "sellers" && !isLoading && !operationsWorkspace ? (
              sellerView === "all" || sellerView === "applications" ? (
                <AdminSellers mode={sellerView} />
              ) : (
                <SellerSubWorkspace view={sellerView} />
              )
            ) : null}

            {false &&
            activeTab === "sellers" &&
            !isLoading &&
            !operationsWorkspace ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-semibold text-[#111827] mb-4">
                  Pending Seller Applications
                </h3>

                <div className="space-y-3">
                  {pendingSellers.length === 0 ? (
                    <p className="text-gray-500">
                      No pending seller applications right now.
                    </p>
                  ) : (
                    pendingSellers.map((seller) => (
                      <div
                        key={seller.id}
                        className="rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                      >
                        <div>
                          <h4 className="font-medium text-[#111827]">
                            {seller.business_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Email: {seller.contact_email ?? "-"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Phone: {seller.contact_phone ?? "-"}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">
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
                            className="rounded-lg bg-[#d9f4e1] px-3 py-2 text-[#165c30] hover:opacity-90 disabled:opacity-60"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleRejectSeller(seller.id)}
                            disabled={
                              busyAction === `reject-seller-${seller.id}`
                            }
                            className="rounded-lg bg-[#fde2e2] px-3 py-2 text-[#8f2727] hover:opacity-90 disabled:opacity-60"
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
          </main>
        </div>
      </div>
    </section>
  );
}
