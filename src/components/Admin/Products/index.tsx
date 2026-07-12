"use client";

import { adminService, type AdminProduct, type AdminSeller, type Brand, type ProductCategory } from "@/services/admin.service";
import { ApiError } from "@/lib/api/client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "inactive", label: "Inactive" },
];

const INITIAL_FORM = {
  seller_id: "",
  category_id: "",
  brand_id: null as string | null,
  sku: "",
  barcode: "",
  name: "",
  slug: "",
  short_description: "",
  description: "",
  price: "",
  sale_price: null as string | null,
  cost_price: null as string | null,
  tax_class: "",
  currency: "TZS",
  weight: null as string | null,
  featured: false,
  track_stock: true,
  quantity: "0",
  low_stock_threshold: "5",
  warehouse_id: "",
};

type FormData = typeof INITIAL_FORM;

const formatPrice = (value: number | string | null | undefined) => {
  if (value == null || value === "") return "";
  return Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

const getStockStatus = (product: AdminProduct) => {
  if (!product.track_stock) return { label: "N/A", className: "bg-gray-100 text-gray-500" };
  if (product.quantity <= 0) return { label: "Out of Stock", className: "bg-[#fde2e2] text-[#8f2727]" };
  if (product.quantity <= product.low_stock_threshold) return { label: "Low Stock", className: "bg-[#fef3c7] text-[#92400e]" };
  return { label: "In Stock", className: "bg-[#d9f4e1] text-[#165c30]" };
};

const AdminProducts = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sellers, setSellers] = useState<AdminSeller[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);

  const [detailsProduct, setDetailsProduct] = useState<AdminProduct | null>(null);
  const [bulkCategoryModalOpen, setBulkCategoryModalOpen] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState("");

  const fetchMeta = async () => {
    setMetaLoading(true);
    try {
      const [cats, brs, sels] = await Promise.all([
        adminService.listProductCategories(),
        adminService.listBrands(),
        adminService.listAllSellers(),
      ]);
      setCategories(cats);
      setBrands(brs);
      setSellers(sels);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setMetaLoading(false);
    }
  };

  const fetchProducts = async (currentPage = page) => {
    setLoading(true);
    try {
      const params: Parameters<typeof adminService.listAllProducts>[0] = {
        page: currentPage,
        page_size: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category_id = categoryFilter;
      if (brandFilter) params.brand_id = brandFilter;
      if (sellerFilter) params.seller_id = sellerFilter;
      if (statusFilter === "active") {
        params.status = "approved";
        params.is_active = true;
      } else if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await adminService.listAllProducts(params);
      setProducts(response.results);
      setTotal(response.total);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMeta();
  }, []);

  useEffect(() => {
    void fetchProducts(1);
    setPage(1);
    setSelected(new Set());
  }, [categoryFilter, brandFilter, sellerFilter, statusFilter, pageSize]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchProducts(1);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const filteredProducts = useMemo(() => {
    if (!stockFilter) return products;
    return products.filter((p) => {
      if (!p.track_stock) return stockFilter === "out_of_stock";
      if (p.quantity <= 0) return stockFilter === "out_of_stock";
      if (p.quantity <= p.low_stock_threshold) return stockFilter === "low_stock";
      return stockFilter === "in_stock";
    });
  }, [products, stockFilter]);

  const isAllSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selected.has(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredProducts.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredProducts.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingProduct(product);
    setForm({
      seller_id: product.seller_id,
      category_id: product.category_id,
      brand_id: product.brand_id ?? null,
      sku: product.sku,
      barcode: product.barcode ?? "",
      name: product.name,
      slug: product.slug,
      short_description: product.short_description ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      sale_price: product.sale_price != null ? String(product.sale_price) : null,
      cost_price: product.cost_price != null ? String(product.cost_price) : null,
      tax_class: product.tax_class ?? "",
      currency: product.currency ?? "TZS",
      weight: product.weight != null ? String(product.weight) : null,
      featured: product.featured,
      track_stock: product.track_stock,
      quantity: String(product.quantity ?? 0),
      low_stock_threshold: String(product.low_stock_threshold ?? 5),
      warehouse_id: product.warehouse_id ?? "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setForm(INITIAL_FORM);
  };

  const handleFormChange = (field: keyof FormData, value: string | null | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !editingProduct && typeof value === "string") {
        next.slug = normalizeSlug(value);
      }
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.seller_id || !form.category_id || !form.sku || !form.name || !form.slug || !form.price) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      seller_id: form.seller_id,
      category_id: form.category_id,
      brand_id: form.brand_id,
      sku: form.sku.trim(),
      barcode: form.barcode.trim() || undefined,
      name: form.name.trim(),
      slug: form.slug.trim(),
      short_description: form.short_description.trim() || undefined,
      description: form.description.trim() || undefined,
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      cost_price: form.cost_price ? Number(form.cost_price) : null,
      tax_class: form.tax_class.trim() || undefined,
      currency: form.currency.trim(),
      weight: form.weight ? Number(form.weight) : null,
      featured: form.featured,
      track_stock: form.track_stock,
      quantity: Number(form.quantity ?? 0),
      low_stock_threshold: Number(form.low_stock_threshold ?? 5),
      warehouse_id: form.warehouse_id.trim() || undefined,
    };

    setBusyAction(editingProduct ? "update-product" : "create-product");
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, payload);
        toast.success("Product updated successfully.");
      } else {
        await adminService.createProduct(payload);
        toast.success("Product created successfully.");
      }
      closeModal();
      await fetchProducts(page);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleApprove = async (product: AdminProduct) => {
    setBusyAction(`approve-${product.id}`);
    try {
      await adminService.approveProduct(product.id);
      toast.success("Product approved.");
      await fetchProducts(page);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleReject = async (product: AdminProduct) => {
    const reason = window.prompt("Andika sababu ya kukataa bidhaa:");
    if (!reason || !reason.trim()) return;

    setBusyAction(`reject-${product.id}`);
    try {
      await adminService.rejectProduct(product.id, reason.trim());
      toast.success("Product rejected.");
      await fetchProducts(page);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleToggleActive = async (product: AdminProduct) => {
    setBusyAction(`toggle-active-${product.id}`);
    try {
      await adminService.updateProduct(product.id, { is_active: !product.is_active });
      toast.success(`Product ${product.is_active ? "deactivated" : "activated"}.`);
      await fetchProducts(page);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleDelete = async (product: AdminProduct) => {
    if (!window.confirm(`Delete product "${product.name}"?`)) return;

    setBusyAction(`delete-${product.id}`);
    try {
      await adminService.deleteProduct(product.id);
      toast.success("Product deleted.");
      await fetchProducts(page);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete" | "assign-category") => {
    if (selected.size === 0) {
      toast.error("Select at least one product.");
      return;
    }

    if (action === "delete") {
      if (!window.confirm(`Delete ${selected.size} products?`)) return;
    }

    if (action === "assign-category") {
      setBulkCategoryModalOpen(true);
      return;
    }

    const ids = Array.from(selected);
    setBusyAction(`bulk-${action}`);
    try {
      await Promise.all(
        ids.map((id) => {
          const product = products.find((p) => p.id === id);
          if (!product) return Promise.resolve();
          if (action === "activate") return adminService.updateProduct(id, { is_active: true });
          if (action === "deactivate") return adminService.updateProduct(id, { is_active: false });
          if (action === "delete") return adminService.deleteProduct(id);
          return Promise.resolve();
        })
      );
      toast.success(`${action} completed for ${ids.length} products.`);
      setSelected(new Set());
      await fetchProducts(page);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleBulkAssignCategory = async () => {
    if (!bulkCategoryId) {
      toast.error("Select a category.");
      return;
    }
    const ids = Array.from(selected);
    setBusyAction("bulk-assign-category");
    try {
      await Promise.all(ids.map((id) => adminService.updateProduct(id, { category_id: bulkCategoryId })));
      toast.success(`Category assigned to ${ids.length} products.`);
      setSelected(new Set());
      setBulkCategoryModalOpen(false);
      setBulkCategoryId("");
      await fetchProducts(page);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "-";
  const brandName = (id?: string | null) => (id ? brands.find((b) => b.id === id)?.name ?? "-" : "-");
  const sellerName = (id: string) => sellers.find((s) => s.id === id)?.business_name ?? "-";

  const renderStatusBadge = (status: string) => {
    const classes =
      status === "approved"
        ? "bg-[#d9f4e1] text-[#165c30]"
        : status === "rejected"
        ? "bg-[#fde2e2] text-[#8f2727]"
        : status === "draft"
        ? "bg-gray-100 text-gray-700"
        : status === "inactive"
        ? "bg-gray-100 text-gray-500"
        : "bg-[#fef3c7] text-[#92400e]";
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${classes}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h3 className="text-xl font-semibold text-[#111827]">Products</h3>
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-xl bg-[#4b5563] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937]"
          >
            Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, SKU..."
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
          >
            <option value="">All sellers</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.business_name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
          >
            <option value="">All stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl bg-[#f8fafc]">
            <span className="text-sm text-gray-600">{selected.size} selected:</span>
            <button
              type="button"
              onClick={() => handleBulkAction("activate")}
              disabled={busyAction === "bulk-activate"}
              className="rounded-lg bg-[#d9f4e1] px-3 py-1.5 text-sm text-[#165c30] hover:opacity-90 disabled:opacity-60"
            >
              Activate
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction("deactivate")}
              disabled={busyAction === "bulk-deactivate"}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:opacity-90 disabled:opacity-60"
            >
              Deactivate
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction("assign-category")}
              disabled={busyAction === "bulk-assign-category"}
              className="rounded-lg bg-[#e0e7ff] px-3 py-1.5 text-sm text-[#3730a3] hover:opacity-90 disabled:opacity-60"
            >
              Assign Category
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction("delete")}
              disabled={busyAction === "bulk-delete"}
              className="rounded-lg bg-[#fde2e2] px-3 py-1.5 text-sm text-[#8f2727] hover:opacity-90 disabled:opacity-60"
            >
              Delete
            </button>
          </div>
        )}

        {loading || metaLoading ? (
          <div className="py-12 text-center text-gray-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Product</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">SKU</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Price</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Brand</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Seller</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Stock</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Active</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const stock = getStockStatus(product);
                  return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDetailsProduct(product)}
                        className="font-medium text-[#111827] hover:text-[#4b5563] text-left"
                      >
                        {product.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {product.currency} {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{categoryName(product.category_id)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{brandName(product.brand_id)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sellerName(product.seller_id)}</td>
                    <td className="px-4 py-3">{renderStatusBadge(product.status)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${stock.className}`}>
                        {stock.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.is_active ? "bg-[#d9f4e1] text-[#165c30]" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.is_active ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailsProduct(product)}
                          className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-200"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="rounded-lg bg-[#e0e7ff] px-2.5 py-1.5 text-xs text-[#3730a3] hover:bg-[#c7d2fe]"
                        >
                          Edit
                        </button>
                        {product.status === "pending_review" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(product)}
                              disabled={busyAction === `approve-${product.id}`}
                              className="rounded-lg bg-[#d9f4e1] px-2.5 py-1.5 text-xs text-[#165c30] hover:opacity-90 disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(product)}
                              disabled={busyAction === `reject-${product.id}`}
                              className="rounded-lg bg-[#fde2e2] px-2.5 py-1.5 text-xs text-[#8f2727] hover:opacity-90 disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          disabled={busyAction === `toggle-active-${product.id}`}
                          className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-200 disabled:opacity-60"
                        >
                          {product.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          disabled={busyAction === `delete-${product.id}`}
                          className="rounded-lg bg-[#fde2e2] px-2.5 py-1.5 text-xs text-[#8f2727] hover:opacity-90 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-xl border border-gray-200 bg-[#f8fafc] px-3 py-1.5 text-sm text-gray-700"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const prev = Math.max(1, page - 1);
                setPage(prev);
                void fetchProducts(prev);
              }}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => {
                const next = Math.min(totalPages, page + 1);
                setPage(next);
                void fetchProducts(next);
              }}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-[#111827] mb-5">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!editingProduct && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seller *</label>
                    <select
                      value={form.seller_id}
                      onChange={(e) => handleFormChange("seller_id", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                      required
                    >
                      <option value="">Select seller</option>
                      {sellers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.business_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => handleFormChange("slug", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => handleFormChange("sku", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => handleFormChange("category_id", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select
                    value={form.brand_id ?? ""}
                    onChange={(e) => handleFormChange("brand_id", e.target.value || null)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  >
                    <option value="">None</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => handleFormChange("price", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.sale_price ?? ""}
                    onChange={(e) => handleFormChange("sale_price", e.target.value || null)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(e) => handleFormChange("currency", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.weight ?? ""}
                    onChange={(e) => handleFormChange("weight", e.target.value || null)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={(e) => handleFormChange("barcode", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.cost_price ?? ""}
                    onChange={(e) => handleFormChange("cost_price", e.target.value || null)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Class</label>
                  <input
                    type="text"
                    value={form.tax_class}
                    onChange={(e) => handleFormChange("tax_class", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse ID</label>
                  <input
                    type="text"
                    value={form.warehouse_id}
                    onChange={(e) => handleFormChange("warehouse_id", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => handleFormChange("quantity", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={form.low_stock_threshold}
                    onChange={(e) => handleFormChange("low_stock_threshold", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => handleFormChange("featured", String(e.target.checked))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Featured Product</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.track_stock}
                    onChange={(e) => handleFormChange("track_stock", String(e.target.checked))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Track Stock</span>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <textarea
                    value={form.short_description}
                    onChange={(e) => handleFormChange("short_description", e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busyAction === "create-product" || busyAction === "update-product"}
                  className="rounded-xl bg-[#4b5563] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-60"
                >
                  {busyAction === "create-product" || busyAction === "update-product"
                    ? "Saving..."
                    : editingProduct
                    ? "Save Changes"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-[#111827] mb-4">{detailsProduct.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-700">SKU:</span> {detailsProduct.sku}
              </p>
              <p>
                <span className="font-medium text-gray-700">Slug:</span> {detailsProduct.slug}
              </p>
              <p>
                <span className="font-medium text-gray-700">Price:</span> {detailsProduct.currency} {formatPrice(detailsProduct.price)}
              </p>
              {detailsProduct.sale_price && (
                <p>
                  <span className="font-medium text-gray-700">Sale Price:</span> {detailsProduct.currency} {formatPrice(detailsProduct.sale_price)}
                </p>
              )}
              <p>
                <span className="font-medium text-gray-700">Category:</span> {categoryName(detailsProduct.category_id)}
              </p>
              <p>
                <span className="font-medium text-gray-700">Brand:</span> {brandName(detailsProduct.brand_id)}
              </p>
              <p>
                <span className="font-medium text-gray-700">Seller:</span> {sellerName(detailsProduct.seller_id)}
              </p>
              <p>
                <span className="font-medium text-gray-700">Status:</span> {renderStatusBadge(detailsProduct.status)}
              </p>
              <p>
                <span className="font-medium text-gray-700">Active:</span> {detailsProduct.is_active ? "Yes" : "No"}
              </p>
              {detailsProduct.rejection_reason && (
                <p>
                  <span className="font-medium text-gray-700">Rejection Reason:</span> {detailsProduct.rejection_reason}
                </p>
              )}
              {detailsProduct.barcode && (
                <p>
                  <span className="font-medium text-gray-700">Barcode:</span> {detailsProduct.barcode}
                </p>
              )}
              {detailsProduct.cost_price && (
                <p>
                  <span className="font-medium text-gray-700">Cost Price:</span> {detailsProduct.currency} {formatPrice(detailsProduct.cost_price)}
                </p>
              )}
              {detailsProduct.tax_class && (
                <p>
                  <span className="font-medium text-gray-700">Tax Class:</span> {detailsProduct.tax_class}
                </p>
              )}
              <p>
                <span className="font-medium text-gray-700">Featured:</span> {detailsProduct.featured ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-medium text-gray-700">Track Stock:</span> {detailsProduct.track_stock ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-medium text-gray-700">Quantity:</span> {detailsProduct.quantity}
              </p>
              <p>
                <span className="font-medium text-gray-700">Low Stock Threshold:</span> {detailsProduct.low_stock_threshold}
              </p>
              {detailsProduct.warehouse_id && (
                <p>
                  <span className="font-medium text-gray-700">Warehouse:</span> {detailsProduct.warehouse_id}
                </p>
              )}
              {detailsProduct.short_description && (
                <p>
                  <span className="font-medium text-gray-700">Short Description:</span> {detailsProduct.short_description}
                </p>
              )}
              {detailsProduct.description && (
                <p>
                  <span className="font-medium text-gray-700">Full Description:</span> {detailsProduct.description}
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailsProduct(null)}
                className="rounded-xl bg-[#4b5563] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">Assign Category</h3>
            <select
              value={bulkCategoryId}
              onChange={(e) => setBulkCategoryId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700 mb-5"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setBulkCategoryModalOpen(false);
                  setBulkCategoryId("");
                }}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkAssignCategory}
                disabled={busyAction === "bulk-assign-category"}
                className="rounded-xl bg-[#4b5563] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-60"
              >
                {busyAction === "bulk-assign-category" ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
