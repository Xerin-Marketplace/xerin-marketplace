"use client";

import {
  adminService,
  type ProductCategory,
  type CreateProductCategoryPayload,
  type UpdateProductCategoryPayload,
} from "@/services/admin.service";
import { ApiError } from "@/lib/api/client";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  return "Something went wrong";
};

const INITIAL_FORM: CreateProductCategoryPayload & { id?: string } = {
  parent_id: null,
  name: "",
  slug: "",
  description: "",
  image_url: "",
  display_order: 0,
  is_active: true,
};

const AdminCategories = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await adminService.listProductCategories();
      setCategories(response);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEdit = (category: ProductCategory) => {
    setEditing(category);
    setForm({
      parent_id: category.parent_id ?? null,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image_url: category.image_url ?? "",
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required.");
      return;
    }

    const payload = {
      parent_id: form.parent_id || null,
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description?.trim() || undefined,
      image_url: form.image_url?.trim() || undefined,
      display_order: Number(form.display_order ?? 0),
      is_active: form.is_active,
    };

    setBusyAction(editing ? "update-category" : "create-category");
    try {
      if (editing) {
        await adminService.updateProductCategory(editing.id, payload as UpdateProductCategoryPayload);
        toast.success("Category updated.");
      } else {
        await adminService.createProductCategory(payload);
        toast.success("Category created.");
      }
      closeModal();
      await fetchCategories();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleDelete = async (category: ProductCategory) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    setBusyAction(`delete-${category.id}`);
    try {
      await adminService.deleteProductCategory(category.id);
      toast.success("Category deleted.");
      await fetchCategories();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const parentName = (id?: string | null) => {
    if (!id) return "-";
    return categories.find((c) => c.id === id)?.name ?? "-";
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[#111827]">Categories</h3>
          <button
            type="button"
            onClick={openAdd}
            className="rounded-xl bg-[#4b5563] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937]"
          >
            Add Category
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No categories found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Image</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Slug</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Parent</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Products</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Order</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#111827]">{category.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{category.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{parentName(category.parent_id)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{category.products_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{category.display_order}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          category.is_active ? "bg-[#d9f4e1] text-[#165c30]" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          className="rounded-lg bg-[#e0e7ff] px-2.5 py-1.5 text-xs text-[#3730a3] hover:bg-[#c7d2fe]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          disabled={busyAction === `delete-${category.id}`}
                          className="rounded-lg bg-[#fde2e2] px-2.5 py-1.5 text-xs text-[#8f2727] hover:opacity-90 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-5 text-xl font-semibold text-[#111827]">
              {editing ? "Edit Category" : "Add Category"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: editing ? prev.slug : normalizeSlug(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  value={form.parent_id ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      parent_id: e.target.value || null,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                >
                  <option value="">None</option>
                  {categories
                    .filter((c) => c.id !== editing?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, display_order: Number(e.target.value) }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Active</span>
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
                  disabled={busyAction === "create-category" || busyAction === "update-category"}
                  className="rounded-xl bg-[#4b5563] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-60"
                >
                  {busyAction === "create-category" || busyAction === "update-category"
                    ? "Saving..."
                    : editing
                    ? "Save Changes"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
