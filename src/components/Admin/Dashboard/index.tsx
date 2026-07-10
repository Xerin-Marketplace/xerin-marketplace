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
  Brand,
  BusinessCategory,
} from "@/services/admin.service";

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
  | "catalog"
  | "orders"
  | "finance"
  | "analytics";

const tabs: Array<{ key: AdminTab; label: string; short: string }> = [
  { key: "overview", label: "Dashboard", short: "Overview" },
  { key: "users", label: "User Management", short: "Users" },
  { key: "sellers", label: "Seller Review", short: "Sellers" },
  { key: "products", label: "Product Review", short: "Products" },
  { key: "catalog", label: "Product & Catalogue", short: "Catalog" },
  { key: "orders", label: "Order & Dispute", short: "Orders" },
  { key: "finance", label: "Financial Management", short: "Finance" },
  { key: "analytics", label: "Analytics Dashboard", short: "Analytics" },
];

type SrsModule = {
  key: AdminTab;
  title: string;
  subtitle: string;
  features: string[];
  architecture: string;
};

const srsModules: SrsModule[] = [
  {
    key: "users",
    title: "User Management",
    subtitle: "Buyers, sellers, KYC, roles, permissions",
    features: [
      "View, search, and filter all buyers and sellers",
      "Suspend, ban, or reinstate user accounts",
      "Review KYC documents and approve/reject seller applications",
      "Assign and manage admin roles and permissions",
    ],
    architecture: "Presentation + Auth + Admin API",
  },
  {
    key: "catalog",
    title: "Product & Catalogue",
    subtitle: "Listings, categories, brands, featured slots",
    features: [
      "Review and approve/reject new product listings",
      "Edit or remove non-compliant listings",
      "Manage category tree, brands, and attributes",
      "Configure flash sales and featured product slots",
    ],
    architecture: "Product Service + Catalogue Data + Media Storage",
  },
  {
    key: "orders",
    title: "Order & Dispute",
    subtitle: "Audit trail, refunds, cancellations, dispute handling",
    features: [
      "View all platform orders with full audit trail",
      "Intervene in buyer-seller disputes",
      "Manually trigger refunds or order cancellations",
      "Export order data for reconciliation",
    ],
    architecture: "Order Service + Payments + Logistics events",
  },
  {
    key: "finance",
    title: "Financial Management",
    subtitle: "Revenue, commissions, payouts, rate control",
    features: [
      "View platform revenue, commissions, and payouts",
      "Approve or hold seller payout batches",
      "Configure commission rates per category or seller tier",
      "Generate financial reports daily, monthly, and annual",
    ],
    architecture: "Payments + Ledger + Reporting pipeline",
  },
  {
    key: "analytics",
    title: "Analytics Dashboard",
    subtitle: "GMV, users, growth, funnels, market heatmaps",
    features: [
      "Platform GMV over time",
      "Active users, registrations, and churn metrics",
      "Top-selling products and categories",
      "Country and region performance heatmaps",
      "Funnel analytics from visits to purchase",
    ],
    architecture: "Analytics service + warehouse + charts layer",
  },
];

type SidebarGroup = {
  title: string;
  key: AdminTab;
  items: string[];
  icon: string;
};

const sidebarGroups: SidebarGroup[] = [
  {
    title: "Catalog",
    key: "catalog",
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
    key: "catalog",
    items: ["Stock Overview", "Warehouses", "Stock Adjustments", "Low Stock Products"],
    icon: "📚",
  },
  {
    title: "Customers",
    key: "users",
    items: ["All Customers", "Customer Details", "Addresses", "Customer Reviews"],
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
    key: "catalog",
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
    case "catalog":
      return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M4 3h12a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1Zm2 3v2h8V6H6Zm0 4v2h8v-2H6Z" />
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
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [userSearch, setUserSearch] = useState("");
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandSlug, setNewBrandSlug] = useState("");
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

  const dynamicSearchPlaceholder = `Search in ${activeMenuContextLabel.toLowerCase()}...`;

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
    } else {
      params.set("menu", normalizeSlug(sidebarItem));
      params.delete("item");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const applySidebarSelection = (
    tab: AdminTab,
    sidebarItem: string,
    openGroup: string | null,
    writeUrl = true
  ) => {
    setActiveTab(tab);
    setActiveSidebarItem(sidebarItem);
    setOpenSidebarGroup(openGroup);

    if (writeUrl) {
      syncSidebarUrl(tab, sidebarItem);
    }
  };

  const loadOverviewData = async () => {
    setIsLoading(true);

    try {
      const [usersResponse, sellersResponse, productsResponse, categoriesResponse, brandsResponse] =
        await Promise.all([
          adminService.listUsers({ page: 1, page_size: 8 }),
          adminService.listPendingSellers(),
          adminService.listPendingProducts(),
          adminService.listBusinessCategories(),
          adminService.listBrands(),
        ]);

      setUsers(usersResponse.results);
      setTotalUsers(usersResponse.total);
      setPendingSellers(sellersResponse);
      setPendingProducts(productsResponse);
      setBusinessCategories(categoriesResponse);
      setBrands(brandsResponse);
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

  const refreshCatalog = async () => {
    try {
      const [categoriesResponse, brandsResponse] = await Promise.all([
        adminService.listBusinessCategories(),
        adminService.listBrands(),
      ]);

      setBusinessCategories(categoriesResponse);
      setBrands(brandsResponse);
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

    if (!menuParam) return;

    if (menuParam === "dashboard") {
      applySidebarSelection("overview", "Dashboard", null, false);
      return;
    }

    const matchedGroup = sidebarGroups.find((group) => normalizeSlug(group.title) === menuParam);

    if (!matchedGroup) return;

    if (itemParam) {
      const matchedItem = matchedGroup.items.find((item) => normalizeSlug(item) === itemParam);

      if (matchedItem) {
        applySidebarSelection(
          matchedGroup.key,
          `${matchedGroup.title}:${matchedItem}`,
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

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newCategoryName.trim()) {
      toast.error("Category name is required.");
      return;
    }

    const slug = normalizeSlug(newCategorySlug || newCategoryName);

    if (!slug) {
      toast.error("Category slug is required.");
      return;
    }

    setBusyAction("create-category");

    try {
      await adminService.createBusinessCategory({
        name: newCategoryName.trim(),
        slug,
        description: newCategoryDescription.trim() || undefined,
        active: true,
      });

      toast.success("Business category created.");
      setNewCategoryName("");
      setNewCategorySlug("");
      setNewCategoryDescription("");
      await refreshCatalog();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm("Delete this business category?")) return;

    setBusyAction(`delete-category-${categoryId}`);

    try {
      await adminService.deleteBusinessCategory(categoryId);
      toast.success("Business category deleted.");
      await refreshCatalog();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleCreateBrand = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newBrandName.trim()) {
      toast.error("Brand name is required.");
      return;
    }

    const slug = normalizeSlug(newBrandSlug || newBrandName);

    if (!slug) {
      toast.error("Brand slug is required.");
      return;
    }

    setBusyAction("create-brand");

    try {
      await adminService.createBrand({
        name: newBrandName.trim(),
        slug,
      });

      toast.success("Brand created.");
      setNewBrandName("");
      setNewBrandSlug("");
      await refreshCatalog();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!window.confirm("Delete this brand?")) return;

    setBusyAction(`delete-brand-${brandId}`);

    try {
      await adminService.deleteBrand(brandId);
      toast.success("Brand deleted.");
      await refreshCatalog();
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
                  <h1 className="text-xl sm:text-2xl font-semibold text-[#111827]">Dashboard Overview</h1>
                  <p className="text-sm text-gray-500 mt-1">Tab: {activeMenuLabel}</p>
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

          {(activeTab === "overview" || activeTab === "users" || activeTab === "sellers" || activeTab === "products" || activeTab === "catalog" || activeTab === "orders" || activeTab === "finance" || activeTab === "analytics") && isLoading ? (
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

          {activeTab === "products" && !isLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-[#111827] mb-4">Pending Product Moderation</h3>

              <div className="space-y-3">
                {pendingProducts.length === 0 ? (
                  <p className="text-gray-500">No pending products right now.</p>
                ) : (
                  pendingProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div>
                        <h4 className="font-medium text-[#111827]">{product.name}</h4>
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        <p className="text-sm text-gray-500">
                          Price: {product.price} {product.currency}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void handleApproveProduct(product.id)}
                          disabled={busyAction === `approve-product-${product.id}`}
                          className="rounded-lg bg-[#d9f4e1] px-3 py-2 text-[#165c30] hover:opacity-90 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRejectProduct(product.id)}
                          disabled={busyAction === `reject-product-${product.id}`}
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
