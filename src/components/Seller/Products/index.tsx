"use client";

import { productsApi } from "@/lib/api/endpoints/products";
import { ApiError } from "@/lib/api/client";
import { authStorage } from "@/lib/auth/storage";
import type { Brand, Category, Product, ProductRequest } from "@/types/api/product";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type StoredUser = {
  account_type?: string;
  roles?: string[];
  seller_status?: string | null;
  first_name?: string | null;
};

const STATUS_OPTIONS = ["all", "draft", "pending_review", "approved", "rejected", "inactive"];

const INITIAL_FORM: ProductRequest & { id?: string } = {
  category_id: "",
  brand_id: null,
  sku: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  sale_price: null,
  currency: "TZS",
  weight: null,
};

const SellerProducts = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = authStorage.getUser<StoredUser>();
  const token = authStorage.getAccessToken();

  const isSeller = useMemo(() => {
    if (!user) return false;
    const roles = user.roles ?? [];
    return user.account_type === "seller" || roles.includes("seller");
  }, [user]);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductRequest>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const requestedStatus = searchParams.get("status");
    if (requestedStatus && STATUS_OPTIONS.includes(requestedStatus)) {
      setStatusFilter(requestedStatus);
    }
    if (searchParams.get("create") === "true") {
      openCreate();
    }
  }, [searchParams]);

  useEffect(() => {
    if (!token) {
      router.replace("/signin?redirect=/seller/products");
      return;
    }

    if (!isSeller) {
      router.replace("/my-account");
      return;
    }

    void loadData();
  }, [isSeller, router, token]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const [items, categoryList, brandList] = await Promise.all([
        productsApi.getMyProducts(token),
        productsApi.getCategories(),
        productsApi.getBrands(),
      ]);
      setProducts(items);
      setCategories(categoryList);
      setBrands(brandList);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load products.");
      }
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const category = categories.find((c) => c.id === product.category_id);
      const brand = brands.find((b) => b.id === product.brand_id);
      const haystack = `${product.name} ${product.sku ?? ""} ${product.status ?? ""} ${category?.name ?? ""} ${brand?.name ?? ""}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, categories, brands, search, statusFilter]);

  function openCreate() {
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      category_id: product.category_id ?? "",
      brand_id: product.brand_id ?? null,
      sku: product.sku ?? "",
      name: product.name,
      slug: product.slug ?? "",
      description: product.description ?? "",
      price: product.price,
      sale_price: product.sale_price ?? null,
      currency: product.currency ?? "TZS",
      weight: product.weight ?? null,
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    if (!form.category_id || !form.sku || !form.name || !form.slug || !form.price) {
      toast.error("Please fill in category, SKU, name, slug, and price.");
      return;
    }

    const payload: ProductRequest = {
      ...form,
      brand_id: form.brand_id || null,
      sale_price: form.sale_price || null,
      weight: form.weight || null,
    };

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, payload, token);
        toast.success("Product updated successfully.");
      } else {
        await productsApi.create(payload, token);
        toast.success("Product created successfully.");
      }
      setModalOpen(false);
      setEditingProduct(null);
      setForm(INITIAL_FORM);
      await loadData();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save product.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!token || !deleteTarget) return;
    setIsDeleting(true);
    try {
      await productsApi.delete(deleteTarget.id, token);
      toast.success("Product deleted.");
      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete product.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  function formatPrice(value: number | string | null | undefined) {
    if (value === null || value === undefined) return "-";
    const numeric = typeof value === "string" ? parseFloat(value) : value;
    if (Number.isNaN(numeric)) return "-";
    return numeric.toLocaleString();
  }

  if (!token || !isSeller) return null;

  return (
    <>
      <section>
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-6 flex justify-end">
            <button type="button" onClick={openCreate} className="rounded-xl bg-[#f7941d] px-5 py-3 font-semibold text-white transition hover:brightness-95">Add Product</button>
          </div>

          <div className="mb-8 rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block mb-2.5 dark:text-darkTheme-body-color">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search product, SKU, category, or brand"
                  className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <div>
                <label className="block mb-2.5 dark:text-darkTheme-body-color">Status</label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "All statuses" : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6">
              <p className="text-dark-4 dark:text-darkTheme-body-color text-sm mb-1">Total products</p>
              <p className="text-2xl font-semibold text-dark dark:text-white">{products.length}</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6">
              <p className="text-dark-4 dark:text-darkTheme-body-color text-sm mb-1">Filtered products</p>
              <p className="text-2xl font-semibold text-dark dark:text-white">{filteredProducts.length}</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6">
              <p className="text-dark-4 dark:text-darkTheme-body-color text-sm mb-1">Categories loaded</p>
              <p className="text-2xl font-semibold text-dark dark:text-white">{categories.length}</p>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-darkTheme-card shadow-1 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-dark-4 dark:text-darkTheme-body-color">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-dark-4 dark:text-darkTheme-body-color">
                No products found. Click &quot;Add Product&quot; to create your first product.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-1 dark:bg-darkTheme-secondary-bg">
                    <tr>
                      <th className="px-6 py-4 text-sm font-medium text-dark dark:text-white">Product</th>
                      <th className="px-6 py-4 text-sm font-medium text-dark dark:text-white">SKU</th>
                      <th className="px-6 py-4 text-sm font-medium text-dark dark:text-white">Category</th>
                      <th className="px-6 py-4 text-sm font-medium text-dark dark:text-white">Price</th>
                      <th className="px-6 py-4 text-sm font-medium text-dark dark:text-white">Status</th>
                      <th className="px-6 py-4 text-sm font-medium text-dark dark:text-white text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-3 dark:divide-darkTheme-border-color">
                    {filteredProducts.map((product) => {
                      const category = categories.find((c) => c.id === product.category_id);
                      const brand = brands.find((b) => b.id === product.brand_id);
                      return (
                        <tr key={product.id} className="hover:bg-gray-1/50 dark:hover:bg-darkTheme-secondary-bg/50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-dark dark:text-white">{product.name}</p>
                              {brand && (
                                <p className="text-sm text-dark-4 dark:text-darkTheme-body-color">{brand.name}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-dark-4 dark:text-darkTheme-body-color">
                            {product.sku ?? "-"}
                          </td>
                          <td className="px-6 py-4 text-dark-4 dark:text-darkTheme-body-color">
                            {category?.name ?? "-"}
                          </td>
                          <td className="px-6 py-4 text-dark dark:text-white">
                            {product.currency} {formatPrice(product.price)}
                            {product.sale_price ? (
                              <span className="block text-sm text-success">
                                Sale: {product.currency} {formatPrice(product.sale_price)}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
                                product.status === "approved"
                                  ? "bg-success/10 text-success"
                                  : product.status === "rejected"
                                  ? "bg-red/10 text-red"
                                  : product.status === "draft"
                                  ? "bg-gray-2 text-dark-2"
                                  : "bg-warning/10 text-warning"
                              }`}
                            >
                              {product.status ?? "pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => openEdit(product)}
                                className="text-sm text-blue hover:text-blue-dark"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(product)}
                                className="text-sm text-red hover:text-red-dark"
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
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6 sm:p-8 my-auto">
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-6">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">
                    Category <span className="text-red">*</span>
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(event) => setForm({ ...form, category_id: event.target.value })}
                    required
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">Brand</label>
                  <select
                    value={form.brand_id ?? ""}
                    onChange={(event) =>
                      setForm({ ...form, brand_id: event.target.value ? event.target.value : null })
                    }
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  >
                    <option value="">No brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">
                    Product name <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">
                    Slug <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(event) => setForm({ ...form, slug: event.target.value })}
                    required
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">
                    SKU <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(event) => setForm({ ...form, sku: event.target.value })}
                    required
                    disabled={isSubmitting || Boolean(editingProduct)}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">Currency</label>
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(event) => setForm({ ...form, currency: event.target.value })}
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2.5 dark:text-darkTheme-body-color">Description</label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  disabled={isSubmitting}
                  rows={4}
                  className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">
                    Price <span className="text-red">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    required
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">Sale price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sale_price ?? ""}
                    onChange={(event) =>
                      setForm({ ...form, sale_price: event.target.value ? event.target.value : null })
                    }
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div>
                  <label className="block mb-2.5 dark:text-darkTheme-body-color">Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.weight ?? ""}
                    onChange={(event) =>
                      setForm({ ...form, weight: event.target.value ? event.target.value : null })
                    }
                    disabled={isSubmitting}
                    className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color w-full py-3 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingProduct(null);
                    setForm(INITIAL_FORM);
                  }}
                  disabled={isSubmitting}
                  className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color text-dark dark:text-white py-2.5 px-5 hover:bg-gray-1 dark:hover:bg-darkTheme-secondary-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue text-white py-2.5 px-5 hover:bg-blue-dark disabled:opacity-60"
                >
                  {isSubmitting ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-w-md w-full rounded-xl bg-white dark:bg-darkTheme-card shadow-1 p-6">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">Delete product?</h3>
            <p className="text-dark-4 dark:text-darkTheme-body-color mb-6">
              This action cannot be undone. Product: {deleteTarget.name}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color text-dark dark:text-white py-2.5 px-5 hover:bg-gray-1 dark:hover:bg-darkTheme-secondary-bg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red text-white py-2.5 px-5 hover:bg-red-dark disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SellerProducts;
