"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { authStorage } from "@/lib/auth/storage";
import { ApiError } from "@/lib/api/client";
import {
  adminService,
  AdminProduct,
  AdminSeller,
  AdminUser,
} from "@/services/admin.service";
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

type StoredUser = {
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
  items: string[];
  icon: string;
};

const sidebarGroups: SidebarGroup[] = [
  {
    title: "Catalog",
    key: "products",
    items: ["Products", "Categories", "Brands", "Product Reviews"],
    icon: "📦",
  },
  {
    title: "Orders",
    key: "orders",
    items: ["All Orders", "Pending Orders", "Processing Orders", "Completed Orders", "Cancelled Orders", "Order Tracking"],
    icon: "🧾",
  },
  {
    title: "Inventory",
    key: "inventory",
    items: ["Stock Overview", "Warehouses", "Stock Adjustments", "Low Stock Products"],
    icon: "📚",
  },
  {
    title: "Customers",
    key: "users",
    items: ["All Customers", "Customer Addresses", "Customer Reviews", "Customer Support"],
    icon: "👥",
  },
  {
    title: "Sellers",
    key: "sellers",
    items: ["All Sellers", "Seller Applications", "Seller Products", "Seller Orders", "Seller Performance"],
    icon: "🏪",
  },
  {
    title: "Payments",
    key: "finance",
    items: ["Transactions", "Payment Methods", "Refunds", "Failed Payments"],
    icon: "💳",
  },
  {
    title: "Promotions",
    key: "products",
    items: ["Coupons", "Discounts", "Campaigns"],
    icon: "🏷️",
  },
  {
    title: "Communications",
    key: "overview",
    items: ["Notifications", "Email Messages", "SMS Messages"],
    icon: "📣",
  },
  {
    title: "User Management",
    key: "users",
    items: ["Users", "Roles", "Permissions", "Active Sessions"],
    icon: "🛡️",
  },
  {
    title: "Reports & Analytics",
    key: "analytics",
    items: ["Sales Reports", "Order Reports", "Product Reports", "Inventory Reports", "Customer Reports", "Payment Reports"],
    icon: "📊",
  },
  {
    title: "System Management",
    key: "overview",
    items: ["Audit Logs", "System Events", "Background Jobs", "Application Settings"],
    icon: "⚙️",
  },
  {
    title: "Account",
    key: "overview",
    items: ["Profile", "Security", "Logout"],
    icon: "👤",
  },
];

const tabIcon = (tab: AdminTab): ReactNode => {
  switch (tab) {
    case "overview":
      return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M3 3h6v6H3V3Zm8 0h6v6h-6V3ZM3 11h6v6H3v-6Zm8 0h6v6h-6v-6Z" />
        </svg>
      );
    case "users":
      return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 1 1 14 0H3Z" />
        </svg>
      );
    case "sellers":
      return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H2V5Zm0 4h16v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Zm6 2v2h4v-2H8Z" />
        </svg>
      );
    case "products":
      return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 1 2 5l8 4 8-4-8-4Zm-8 7 8 4 8-4v7l-8 4-8-4V8Z" />
        </svg>
      );
    case "categories":
      return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M4 3h12a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1Zm2 3v2h8V6H6Zm0 4v2h8v-2H6Z" />
        </svg>
      );
    case "brands":
      return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M4 4h12v2H4V4Zm0 5h12v2H4V9Zm0 5h12v2H4v-2Z" />
        </svg>
      );
    case "reviews":
      return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 2l2.5 5.5h5.5l-4.5 4 1.5 6-5-3.5L4.5 18l1.5-6-4.5-4h5.5L10 2Z" />
        </svg>
      );
    case "orders":
      return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M4 3h12v2H4V3Zm0 4h12v10H4V7Zm3 2v2h6V9H7Zm0 4v2h4v-2H7Z" />
        </svg>
      );
    case "finance":
      return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7Zm1 11.59V14H9v-1.41a3 3 0 0 1-2-2.82h2a1 1 0 0 0 2 0 .5.5 0 0 0-.5-.5h-1a3 3 0 0 1-.5-5.92V3h2v1.35a3 3 0 0 1 1.85 2.65h-2A1 1 0 0 0 10 6a.5.5 0 0 0 .5.5h1a3 3 0 0 1-.5 5.09Z" />
        </svg>
      );
    case "analytics":
      return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
  const formatWalletAmount = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingSellers, setPendingSellers] = useState<AdminSeller[]>([]);
  const [pendingProducts, setPendingProducts] = useState<AdminProduct[]>([]);

  const [userSearch, setUserSearch] = useState("");
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);

  const [surfaceSearch, setSurfaceSearch] = useState("");
  const [openSidebarGroup, setOpenSidebarGroup] = useState<string | null>(null);
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>("Dashboard");

  const hiddenOverviewMenuGroups = ["Communications", "System Management", "Account"];
  const isOverviewHiddenByMenuSelection = hiddenOverviewMenuGroups.some(
    (group) => activeSidebarItem === group || activeSidebarItem.startsWith(`${group}:`)
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

  const dynamicSearchPlaceholder = activeTab === "orders" || activeTab === "inventory" || activeTab === "users" ? "Global search" : `Search in ${activeMenuContextLabel.toLowerCase()}...`;

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
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
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
    };
    return catalogMap[tabOrGroup] ?? (tabOrGroup as AdminTab);
  };

  const applySidebarSelection = (
    tab: AdminTab | string,
    sidebarItem: string,
    openGroup: string | null,
    writeUrl = true
  ) => {
    const resolvedTab = resolveTab(tab);
    setActiveTab(resolvedTab);
    setActiveSidebarItem(sidebarItem);
    setOpenSidebarGroup(openGroup);

    if (writeUrl) {
      syncSidebarUrl(resolvedTab, sidebarItem);
    }
  };

  const loadOverviewData = async () => {
    setIsLoading(true);

    try {
      const [usersResponse, sellersResponse, productsResponse] = await Promise.all([
        adminService.listUsers({ page: 1, page_size: 8 }),
        adminService.listPendingSellers(),
        adminService.listPendingProducts(),
      ]);

      setUsers(usersResponse.results);
      setTotalUsers(usersResponse.total);
      setPendingSellers(sellersResponse);
      setPendingProducts(productsResponse);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUsers = async (search: string) => {
    setIsRefreshingUsers(true);

    try {
      const response = await adminService.listUsers({
        page: 1,
        page_size: 15,
        search: search || undefined,
      });

      setUsers(response.results);
      setTotalUsers(response.total);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsRefreshingUsers(false);
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
        applySidebarSelection("users", "Customers", "Customers", false);
      }
      return;
    }

    if (menuParam === "dashboard") {
      applySidebarSelection("overview", "Dashboard", null, false);
      return;
    }

    const matchedGroup = sidebarGroups.find((group) => normalizeSlug(group.title) === menuParam);

    if (!matchedGroup) return;

    if (itemParam) {
      const matchedItem = matchedGroup.items.find((item) => normalizeSlug(item) === itemParam);

      if (matchedItem) {
        const subItemKey = `${matchedGroup.title}:${matchedItem}`;
        applySidebarSelection(
          subItemKey,
          subItemKey,
          matchedGroup.title,
          false
        );
        return;
      }
    }

    applySidebarSelection(matchedGroup.key, matchedGroup.title, matchedGroup.title, false);
  }, [isAuthorized, isCheckingAccess, searchParams]);

  const adminWalletCards = [
    { title: "Commission Earned", value: 12927.52, icon: "📈" },
    { title: "Delivery Charge Earned", value: 1660, icon: "🚚" },
    { title: "Total Tax Collected", value: 2666, icon: "💸" },
    { title: "Pending Amount", value: 7987.5, icon: "💵" },
  ];

  const auctionWalletCards = [
    { title: "Entry Fee", value: 1517, icon: "💵" },
    { title: "Tax", value: 0, icon: "💸" },
    { title: "Commission Collected", value: 0, icon: "🪙" },
    { title: "Self Auction Shipping Fee", value: 0, icon: "🚚" },
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
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">Loading admin panel...</div>
      </section>
    );
  }

  if (!isAuthorized) {
    return (
      <section className="py-20 bg-gray-1 dark:bg-darkTheme-secondary-bg min-h-screen">
          <div className="max-w-[760px] mx-auto px-4 sm:px-8 xl:px-0">
            <div className="rounded-xl border border-red-light-4 bg-white dark:bg-darkTheme-card p-7 text-center">
              <h2 className="text-2xl font-semibold text-dark dark:text-white mb-2">Access denied</h2>
              <p className="text-dark-4 dark:text-darkTheme-body-color">
                Hii page ni ya admin pekee. Hakikisha ume-login kwa admin account.
              </p>
            </div>
          </div>
        </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f3f7fb] py-6">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
          <aside className="xl:sticky xl:top-6 h-fit rounded-2xl bg-gradient-to-b from-[#4b5563] to-[#1f2937] p-4 text-white shadow-xl">
            <div className="px-3 py-2 border-b border-white/15">
              <p className="text-xs uppercase tracking-[0.15em] text-white/60">Xerin Market</p>
              <h2 className="text-xl font-semibold mt-1">Admin Panel</h2>
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
                  Dashboard
                </span>
              </button>
            </div>

            <nav className="mt-4 space-y-1.5">
              {sidebarGroups.map((group) => {
                const isOpen = openSidebarGroup === group.title;

                return (
                <div key={group.title} className="px-1">
                  <button
                    type="button"
                    onClick={() => {
                      const nextOpenGroup = openSidebarGroup === group.title ? null : group.title;
                      applySidebarSelection(group.key, group.title, nextOpenGroup);
                    }}
                    className={`w-full text-left rounded-lg px-2.5 py-2 text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${
                      activeSidebarItem === group.title ? "text-white" : "text-white/85"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2.5">
                        <span className="inline-flex h-5 w-5 items-center justify-center text-base leading-none shrink-0" aria-hidden="true">
                          {group.icon}
                        </span>
                        <span>{group.title}</span>
                      </span>
                      <svg
                        className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 0 1 1.1 1.02l-4.25 4.5a.75.75 0 0 1-1.1 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
                      </svg>
                    </span>
                  </button>

                  {isOpen ? (
                  <div className="mt-1 border-l border-white/15 pl-3 space-y-1">
                    {group.items.map((item) => {
                      const subItemKey = `${group.title}:${item}`;
                      const isSelected = activeSidebarItem === subItemKey;

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            if (group.title === "Catalog") {
                              applySidebarSelection(subItemKey, subItemKey, group.title);
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
                              const ordersTab = orderTabMap[item] ?? "all";
                              const itemSlug = normalizeSlug(item);
                              router.push(`/admin/dashboard?tab=orders&menu=orders&item=${itemSlug}&orders_tab=${ordersTab}`);
                              return;
                            }
                            applySidebarSelection(group.key, subItemKey, group.title);
                          }}
                          className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                            isSelected
                              ? "text-white font-semibold"
                              : "text-white/80 hover:text-white"
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-white/60"}`} />
                            <span>{item}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  ) : null}
                </div>
              );})}
            </nav>

            <div className="mt-6 rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/70">Quick Moderation Queue</p>
              <div className="mt-2 text-sm space-y-1">
                <p>Sellers: <span className="font-semibold">{pendingSellers.length}</span></p>
                <p>Products: <span className="font-semibold">{pendingProducts.length}</span></p>
              </div>
            </div>

          </aside>

          <main className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-[#111827]">
                    {activeTab === "orders"
                      ? "Order Management"
                      : activeTab === "inventory"
                        ? "Inventory Overview"
                        : activeTab === "users" && activeSidebarItem !== "Dashboard"
                          ? "Customer Management"
                          : "Dashboard Overview"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {activeTab === "orders"
                      ? `Admin / Orders / ${activeMenuLabel}`
                      : activeTab === "inventory"
                        ? `Admin / Inventory / ${activeMenuLabel}`
                        : activeTab === "users" && activeSidebarItem !== "Dashboard"
                          ? `Manage customer accounts, addresses, orders and engagement`
                          : `Tab: ${activeMenuLabel}`}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <input
                    value={surfaceSearch}
                    onChange={(event) => setSurfaceSearch(event.target.value)}
                    placeholder={dynamicSearchPlaceholder}
                    className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700 w-full sm:w-[240px]"
                  />
                  <button
                    type="button"
                    onClick={loadOverviewData}
                    className="rounded-xl bg-[#4b5563] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937]"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>

          {(activeTab === "overview" || activeTab === "users" || activeTab === "sellers" || activeTab === "products" || activeTab === "categories" || activeTab === "brands" || activeTab === "reviews" || activeTab === "orders" || activeTab === "inventory" || activeTab === "finance" || activeTab === "analytics") && isLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm">
              Loading dashboard data...
            </div>
          ) : null}

          {activeTab === "overview" && !isLoading && !isOverviewHiddenByMenuSelection ? (
            <>
              <div className="rounded-2xl border border-gray-200 bg-[#eef3f9] p-4 shadow-sm">
                <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-[#222]">
                  <span className="text-base">💰</span>
                  Admin Wallet
                </h3>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-3">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col items-center justify-center text-center min-h-[180px]">
                    <span className="text-3xl">📊</span>
                    <p className="mt-2 text-2xl sm:text-3xl font-semibold text-[#222]">{formatWalletAmount(41992)}</p>
                    <p className="mt-1 text-sm sm:text-base font-medium text-[#222]">In-House Earning</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {adminWalletCards.map((card) => (
                      <div key={card.title} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm min-h-[92px]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xl sm:text-2xl font-semibold leading-tight text-[#222]">{formatWalletAmount(card.value)}</p>
                            <p className="mt-1 text-xs sm:text-sm text-gray-700">{card.title}</p>
                          </div>
                          <span className="text-xl sm:text-2xl" aria-hidden="true">
                            {card.icon}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-[#eef3f9] p-4 shadow-sm">
                <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-[#222]">
                  <span className="text-base">💰</span>
                  Auction Wallet
                </h3>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-3">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col items-center justify-center text-center min-h-[180px]">
                    <span className="text-3xl">💰</span>
                    <p className="mt-2 text-2xl sm:text-3xl font-semibold text-[#222]">{formatWalletAmount(0)}</p>
                    <p className="mt-1 text-sm sm:text-base font-medium text-[#222]">In-House Total Earning</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {auctionWalletCards.map((card) => (
                      <div key={card.title} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm min-h-[92px]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xl sm:text-2xl font-semibold leading-tight text-[#222]">{formatWalletAmount(card.value)}</p>
                            <p className="mt-1 text-xs sm:text-sm text-gray-700">{card.title}</p>
                          </div>
                          <span className="text-xl sm:text-2xl" aria-hidden="true">
                            {card.icon}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </>
          ) : null}

          {activeTab === "products" && !isLoading ? <AdminProducts /> : null}
          {activeTab === "categories" && !isLoading ? <AdminCategories /> : null}
          {activeTab === "brands" && !isLoading ? <AdminBrands /> : null}
          {activeTab === "reviews" && !isLoading ? <AdminReviews /> : null}
          {activeTab === "orders" && !isLoading ? (
            <AdminOrdersDashboard initialTab={searchParams.get("orders_tab") ?? "all"} />
          ) : null}

          {activeTab === "inventory" && !isLoading ? (
            <>
              {pathname.includes("/admin/inventory/products/") ? (
                <AdminProductInventoryDetails productId={pathname.split("/admin/inventory/products/")[1]?.split("/")[0] ?? ""} />
              ) : pathname.includes("/admin/inventory/warehouses/") ? (
                <AdminWarehouseDetails warehouseId={pathname.split("/admin/inventory/warehouses/")[1]?.split("/")[0] ?? ""} />
              ) : (
                <>
                  {(searchParams.get("inventory_tab") ?? "stock-overview") === "stock-overview" && <AdminInventoryDashboard />}
                  {searchParams.get("inventory_tab") === "warehouses" && <AdminInventoryWarehouses />}
                  {searchParams.get("inventory_tab") === "stock-adjustments" && <AdminInventoryAdjustments />}
                  {searchParams.get("inventory_tab") === "low-stock-products" && <AdminInventoryLowStock />}
                </>
              )}
            </>
          ) : null}

          {activeTab === "users" && !isLoading ? (
            <>
              {pathname.includes("/admin/customers/") && pathname.split("/admin/customers/")[1]?.length && !pathname.includes("/addresses") && !pathname.includes("/reviews") && !pathname.includes("/support") ? (
                <AdminCustomerDetails customerId={pathname.split("/admin/customers/")[1]?.split("/")[0] ?? ""} />
              ) : pathname.includes("/admin/customers/addresses") ? (
                <AdminCustomerAddresses />
              ) : pathname.includes("/admin/customers/reviews") ? (
                <AdminCustomerReviews />
              ) : pathname.includes("/admin/customers/support") ? (
                <AdminCustomerSupport />
              ) : (
                <AdminCustomers />
              )}
            </>
          ) : null}

          {activeTab === "sellers" && !isLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-[#111827] mb-4">Pending Seller Applications</h3>

              <div className="space-y-3">
                {pendingSellers.length === 0 ? (
                  <p className="text-gray-500">No pending seller applications right now.</p>
                ) : (
                  pendingSellers.map((seller) => (
                    <div
                      key={seller.id}
                      className="rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div>
                        <h4 className="font-medium text-[#111827]">{seller.business_name}</h4>
                        <p className="text-sm text-gray-500">Email: {seller.contact_email ?? "-"}</p>
                        <p className="text-sm text-gray-500">Phone: {seller.contact_phone ?? "-"}</p>
                        <p className="text-sm text-gray-500 capitalize">Status: {seller.status}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void handleApproveSeller(seller.id)}
                          disabled={busyAction === `approve-seller-${seller.id}`}
                          className="rounded-lg bg-[#d9f4e1] px-3 py-2 text-[#165c30] hover:opacity-90 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRejectSeller(seller.id)}
                          disabled={busyAction === `reject-seller-${seller.id}`}
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

          {activeTab === "users" && !isLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-[#111827] mb-4">User Management</h3>

              <div className="mb-4">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(event) => {
                    setUserSearch(event.target.value);
                    void refreshUsers(event.target.value);
                  }}
                  placeholder="Search users by name or email"
                  className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700 w-full sm:w-[360px]"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f8fafc]">
                    <tr>
                      <th className="px-4 py-3 text-sm font-medium text-gray-700">Name</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-700">Email</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-700">Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-3 text-sm text-[#111827]">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.phone ?? "-"}</td>
                        <td className="px-4 py-3 text-sm capitalize text-gray-600">{user.status}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.is_verified ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && !isRefreshingUsers && (
                <p className="text-gray-500 mt-4">No users found.</p>
              )}
            </div>
          ) : null}

          </main>
        </div>
      </div>
    </section>
  );
}
