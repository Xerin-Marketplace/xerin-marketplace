"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  adminService,
  type ProductCategory,
} from "@/lib/api/endpoints/admin";
import { API_BASE_URL } from "@/lib/api/endpoints";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const resolveImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return null;
  if (/^(https?:|data:|blob:)/.test(imageUrl)) return imageUrl;
  return `${API_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

export default function AdminCategories() {
  const [rows, setRows] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [busy, setBusy] = useState(false);

  const previewUrl = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image],
  );

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await adminService.listProductCategories());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load categories.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleImageChange = (file?: File) => {
    setImageError("");
    if (!file) {
      setImage(null);
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImage(null);
      setImageError("Choose a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImage(null);
      setImageError("Category image must not exceed 5 MB.");
      return;
    }
    setImage(file);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !slug.trim() || !image) return;

    setBusy(true);
    try {
      const category = await adminService.createProductCategory({
        name: name.trim(),
        slug: slug.trim(),
        parent_id: parentId || null,
      });
      await adminService.uploadProductCategoryImage(category.id, image);

      setName("");
      setSlug("");
      setParentId("");
      setImage(null);
      toast.success("Category and image created.");
      await load();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Unable to create category.",
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row: ProductCategory) => {
    if (!window.confirm(`Delete category "${row.name}"?`)) return;
    setBusy(true);
    try {
      await adminService.deleteProductCategory(row.id);
      toast.success("Category deleted.");
      await load();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Unable to delete category.",
      );
    } finally {
      setBusy(false);
    }
  };

  const parentName = (id?: string | null) =>
    id ? rows.find((row) => row.id === id)?.name || id : "—";

  return (
    <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
      <form
        onSubmit={submit}
        className="rounded-2xl border bg-white p-5 shadow-sm"
      >
        <h3 className="font-semibold">Add category</h3>

        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Category name"
          className="mt-4 w-full rounded-xl border px-4 py-2.5"
        />
        <input
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder="category-slug"
          className="mt-3 w-full rounded-xl border px-4 py-2.5"
        />
        <select
          value={parentId}
          onChange={(event) => setParentId(event.target.value)}
          className="mt-3 w-full rounded-xl border px-4 py-2.5"
        >
          <option value="">No parent</option>
          {rows.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </select>

        <label className="mt-3 block rounded-xl border border-dashed border-gray-300 p-4 text-center">
          <span className="block text-sm font-semibold text-gray-800">
            Category image
          </span>
          <span className="mt-1 block text-xs text-gray-500">
            JPG, PNG or WEBP · maximum 5 MB
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => handleImageChange(event.target.files?.[0])}
            className="mt-3 block w-full text-xs text-gray-600"
          />
        </label>

        {previewUrl ? (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <Image
              src={previewUrl}
              alt="Category image preview"
              width={72}
              height={72}
              unoptimized
              className="h-18 w-18 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{image?.name}</p>
              <button
                type="button"
                onClick={() => setImage(null)}
                className="mt-1 text-xs font-semibold text-red-600"
              >
                Remove image
              </button>
            </div>
          </div>
        ) : null}

        {imageError ? (
          <p className="mt-2 text-xs font-medium text-red-600">{imageError}</p>
        ) : null}

        <button
          disabled={busy || !name.trim() || !slug.trim() || !image}
          className="mt-4 w-full rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Creating category..." : "Create category"}
        </button>
      </form>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex justify-between border-b p-5">
          <h3 className="font-semibold">Categories</h3>
          <button
            onClick={() => void load()}
            className="text-sm font-semibold text-orange-600"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="p-10 text-center text-gray-500">
            Loading categories...
          </p>
        ) : error ? (
          <p className="p-10 text-center text-red-600">{error}</p>
        ) : !rows.length ? (
          <p className="p-10 text-center text-gray-500">
            No categories found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3">Image</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Parent</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => {
                  const rowImage = resolveImageUrl(row.image_url);
                  return (
                    <tr key={row.id}>
                      <td className="px-5 py-4">
                        {rowImage ? (
                          <Image
                            src={rowImage}
                            alt={`${row.name} category`}
                            width={48}
                            height={48}
                            unoptimized
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                            None
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold">{row.name}</td>
                      <td className="px-5 py-4 text-gray-500">{row.slug}</td>
                      <td className="px-5 py-4 text-gray-500">
                        {parentName(row.parent_id)}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          disabled={busy}
                          onClick={() => void remove(row)}
                          className="text-sm font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
