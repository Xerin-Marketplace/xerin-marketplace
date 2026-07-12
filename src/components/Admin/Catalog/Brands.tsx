"use client";

import { adminService, type Brand, type CreateBrandPayload, type UpdateBrandPayload } from "@/services/admin.service";
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

const INITIAL_FORM: CreateBrandPayload & { id?: string } = {
  name: "",
  slug: "",
  description: "",
  logo_url: "",
  website: "",
  is_active: true,
};

const AdminBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await adminService.listBrands();
      setBrands(response);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBrands();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditing(brand);
    setForm({
      name: brand.name,
      slug: brand.slug,
      description: brand.description ?? "",
      logo_url: brand.logo_url ?? "",
      website: brand.website ?? "",
      is_active: brand.is_active,
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
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description?.trim() || undefined,
      logo_url: form.logo_url?.trim() || undefined,
      website: form.website?.trim() || undefined,
      is_active: form.is_active,
    };

    setBusyAction(editing ? "update-brand" : "create-brand");
    try {
      if (editing) {
        await adminService.updateBrand(editing.id, payload as UpdateBrandPayload);
        toast.success("Brand updated.");
      } else {
        await adminService.createBrand(payload);
        toast.success("Brand created.");
      }
      closeModal();
      await fetchBrands();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!window.confirm(`Delete brand "${brand.name}"?`)) return;
    setBusyAction(`delete-${brand.id}`);
    try {
      await adminService.deleteBrand(brand.id);
      toast.success("Brand deleted.");
      await fetchBrands();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[#111827]">Brands</h3>
          <button
            type="button"
            onClick={openAdd}
            className="rounded-xl bg-[#4b5563] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937]"
          >
            Add Brand
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading brands...</div>
        ) : brands.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No brands found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Logo</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Slug</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Products</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#111827]">{brand.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{brand.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{brand.products_count}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          brand.is_active ? "bg-[#d9f4e1] text-[#165c30]" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {brand.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(brand)}
                          className="rounded-lg bg-[#e0e7ff] px-2.5 py-1.5 text-xs text-[#3730a3] hover:bg-[#c7d2fe]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(brand)}
                          disabled={busyAction === `delete-${brand.id}`}
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
              {editing ? "Edit Brand" : "Add Brand"}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  type="text"
                  value={form.logo_url}
                  onChange={(e) => setForm((prev) => ({ ...prev, logo_url: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-2.5 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
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
                  disabled={busyAction === "create-brand" || busyAction === "update-brand"}
                  className="rounded-xl bg-[#4b5563] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-60"
                >
                  {busyAction === "create-brand" || busyAction === "update-brand"
                    ? "Saving..."
                    : editing
                    ? "Save Changes"
                    : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;
