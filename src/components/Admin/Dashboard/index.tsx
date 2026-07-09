"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/Common/Breadcrumb";
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

type AdminTab = "overview" | "users" | "sellers" | "products" | "catalog";

const tabs: Array<{ key: AdminTab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users" },
  { key: "sellers", label: "Seller Approvals" },
  { key: "products", label: "Product Moderation" },
  { key: "catalog", label: "Catalog" },
];

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

  const [busyAction, setBusyAction] = useState<string | null>(null);

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

  const stats = useMemo(
    () => [
      { title: "Total Users", value: totalUsers },
      { title: "Pending Sellers", value: pendingSellers.length },
      { title: "Pending Products", value: pendingProducts.length },
      { title: "Business Categories", value: businessCategories.length },
      { title: "Brands", value: brands.length },
    ],
    [totalUsers, pendingSellers.length, pendingProducts.length, businessCategories.length, brands.length]
  );

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
      <>
        <Breadcrumb title="Admin" pages={["Admin"]} />
        <section className="py-20 bg-gray-1 dark:bg-darkTheme-secondary-bg">
          <div className="max-w-[760px] mx-auto px-4 sm:px-8 xl:px-0">
            <div className="rounded-xl border border-red-light-4 bg-white dark:bg-darkTheme-card p-7 text-center">
              <h2 className="text-2xl font-semibold text-dark dark:text-white mb-2">Access denied</h2>
              <p className="text-dark-4 dark:text-darkTheme-body-color">
                Hii page ni ya admin pekee. Hakikisha ume-login kwa admin account.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Admin Dashboard" pages={["Admin", "Dashboard"]} />

      <section className="py-14 bg-gray-1 dark:bg-darkTheme-secondary-bg">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 space-y-6">
          <div className="rounded-2xl border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-dark text-white dark:bg-blue"
                      : "bg-gray-2 text-dark hover:bg-gray-3 dark:bg-darkTheme-tertiary-bg dark:text-darkTheme-body-color"
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <button
                type="button"
                onClick={loadOverviewData}
                className="ml-auto rounded-lg border border-gray-3 px-4 py-2 text-sm font-medium text-dark dark:text-darkTheme-body-color hover:bg-gray-2"
              >
                Refresh All
              </button>
            </div>
          </div>

          {(activeTab === "overview" || activeTab === "users" || activeTab === "sellers" || activeTab === "products" || activeTab === "catalog") && isLoading ? (
            <div className="rounded-2xl border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-card p-8 text-center">
              Loading dashboard data...
            </div>
          ) : null}

          {activeTab === "overview" && !isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              {stats.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-card p-5"
                >
                  <p className="text-sm text-dark-4 dark:text-darkTheme-secondary-muted">{item.title}</p>
                  <h3 className="mt-2 text-3xl font-semibold text-dark dark:text-white">{item.value}</h3>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "users" && !isLoading ? (
            <div className="rounded-2xl border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-card p-5">
              <div className="flex flex-wrap gap-3 items-center mb-5">
                <input
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Search user by email, phone, first name..."
                  className="w-full md:max-w-lg rounded-lg border border-gray-3 bg-gray-1 py-3 px-4 outline-none focus:ring-2 focus:ring-blue/20"
                />
                <button
                  type="button"
                  onClick={() => void refreshUsers(userSearch.trim())}
                  disabled={isRefreshingUsers}
                  className="rounded-lg bg-dark px-4 py-2.5 text-white hover:bg-blue disabled:opacity-70"
                >
                  {isRefreshingUsers ? "Searching..." : "Search"}
                </button>
              </div>

              <p className="mb-3 text-sm text-dark-4 dark:text-darkTheme-secondary-muted">Total users: {totalUsers}</p>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-3 text-left">
                      <th className="py-3">Name</th>
                      <th className="py-3">Email</th>
                      <th className="py-3">Phone</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td className="py-4 text-dark-4" colSpan={5}>
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-2">
                          <td className="py-3">{`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "-"}</td>
                          <td className="py-3">{user.email}</td>
                          <td className="py-3">{user.phone ?? "-"}</td>
                          <td className="py-3 capitalize">{user.status}</td>
                          <td className="py-3">{user.is_verified ? "Yes" : "No"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeTab === "sellers" && !isLoading ? (
            <div className="rounded-2xl border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-card p-5">
              <h3 className="text-xl font-semibold text-dark dark:text-white mb-4">Pending Seller Approvals</h3>

              <div className="space-y-3">
                {pendingSellers.length === 0 ? (
                  <p className="text-dark-4 dark:text-darkTheme-secondary-muted">No pending sellers right now.</p>
                ) : (
                  pendingSellers.map((seller) => (
                    <div
                      key={seller.id}
                      className="rounded-xl border border-gray-3 dark:border-darkTheme-border-color p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div>
                        <h4 className="font-medium text-dark dark:text-white">{seller.business_name}</h4>
                        <p className="text-sm text-dark-4 dark:text-darkTheme-secondary-muted">{seller.contact_email || "No contact email"}</p>
                        <p className="text-sm text-dark-4 dark:text-darkTheme-secondary-muted">{seller.contact_phone || "No contact phone"}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void handleApproveSeller(seller.id)}
                          disabled={busyAction === `approve-seller-${seller.id}`}
                          className="rounded-lg bg-green-light-4 px-3 py-2 text-green-dark hover:opacity-90 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRejectSeller(seller.id)}
                          disabled={busyAction === `reject-seller-${seller.id}`}
                          className="rounded-lg bg-red-light-4 px-3 py-2 text-red-dark hover:opacity-90 disabled:opacity-60"
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

          {activeTab === "products" && !isLoading ? (
            <div className="rounded-2xl border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-card p-5">
              <h3 className="text-xl font-semibold text-dark dark:text-white mb-4">Pending Product Moderation</h3>

              <div className="space-y-3">
                {pendingProducts.length === 0 ? (
                  <p className="text-dark-4 dark:text-darkTheme-secondary-muted">No pending products right now.</p>
                ) : (
                  pendingProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-xl border border-gray-3 dark:border-darkTheme-border-color p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div>
                        <h4 className="font-medium text-dark dark:text-white">{product.name}</h4>
                        <p className="text-sm text-dark-4 dark:text-darkTheme-secondary-muted">SKU: {product.sku}</p>
                        <p className="text-sm text-dark-4 dark:text-darkTheme-secondary-muted">
                          Price: {product.price} {product.currency}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void handleApproveProduct(product.id)}
                          disabled={busyAction === `approve-product-${product.id}`}
                          className="rounded-lg bg-green-light-4 px-3 py-2 text-green-dark hover:opacity-90 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRejectProduct(product.id)}
                          disabled={busyAction === `reject-product-${product.id}`}
                          className="rounded-lg bg-red-light-4 px-3 py-2 text-red-dark hover:opacity-90 disabled:opacity-60"
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

          {activeTab === "catalog" && !isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-card p-5">
                <h3 className="text-xl font-semibold text-dark dark:text-white mb-4">Business Categories</h3>

                <form className="space-y-3 mb-5" onSubmit={handleCreateCategory}>
                  <input
                    value={newCategoryName}
                    onChange={(event) => {
                      setNewCategoryName(event.target.value);
                      if (!newCategorySlug) {
                        setNewCategorySlug(normalizeSlug(event.target.value));
                      }
                    }}
                    placeholder="Category name"
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                  <input
                    value={newCategorySlug}
                    onChange={(event) => setNewCategorySlug(normalizeSlug(event.target.value))}
                    placeholder="category-slug"
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                  <textarea
                    value={newCategoryDescription}
                    onChange={(event) => setNewCategoryDescription(event.target.value)}
                    placeholder="Description (optional)"
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                  <button
                    type="submit"
                    disabled={busyAction === "create-category"}
                    className="rounded-lg bg-dark px-4 py-2.5 text-white hover:bg-blue disabled:opacity-70"
                  >
                    {busyAction === "create-category" ? "Creating..." : "Create Category"}
                  </button>
                </form>

                <div className="space-y-2">
                  {businessCategories.map((category) => (
                    <div
                      key={category.id}
                      className="rounded-lg border border-gray-3 px-3 py-2 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-dark dark:text-white">{category.name}</p>
                        <p className="text-xs text-dark-4 dark:text-darkTheme-secondary-muted">{category.slug}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleDeleteCategory(category.id)}
                        disabled={busyAction === `delete-category-${category.id}`}
                        className="rounded-md bg-red-light-4 px-2.5 py-1.5 text-xs text-red-dark disabled:opacity-70"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-3 dark:border-darkTheme-border-color bg-white dark:bg-darkTheme-card p-5">
                <h3 className="text-xl font-semibold text-dark dark:text-white mb-4">Brands</h3>

                <form className="space-y-3 mb-5" onSubmit={handleCreateBrand}>
                  <input
                    value={newBrandName}
                    onChange={(event) => {
                      setNewBrandName(event.target.value);
                      if (!newBrandSlug) {
                        setNewBrandSlug(normalizeSlug(event.target.value));
                      }
                    }}
                    placeholder="Brand name"
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                  <input
                    value={newBrandSlug}
                    onChange={(event) => setNewBrandSlug(normalizeSlug(event.target.value))}
                    placeholder="brand-slug"
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue/20"
                  />

                  <button
                    type="submit"
                    disabled={busyAction === "create-brand"}
                    className="rounded-lg bg-dark px-4 py-2.5 text-white hover:bg-blue disabled:opacity-70"
                  >
                    {busyAction === "create-brand" ? "Creating..." : "Create Brand"}
                  </button>
                </form>

                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div
                      key={brand.id}
                      className="rounded-lg border border-gray-3 px-3 py-2 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-dark dark:text-white">{brand.name}</p>
                        <p className="text-xs text-dark-4 dark:text-darkTheme-secondary-muted">{brand.slug}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleDeleteBrand(brand.id)}
                        disabled={busyAction === `delete-brand-${brand.id}`}
                        className="rounded-md bg-red-light-4 px-2.5 py-1.5 text-xs text-red-dark disabled:opacity-70"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
