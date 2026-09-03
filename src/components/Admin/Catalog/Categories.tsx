"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import {
  AlertTriangle,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  adminService,
  type BusinessCategory,
  type ProductCategory,
} from "@/lib/api/endpoints/admin";

type Mode = "product" | "business";

type Editing =
  | {
      type: "product";
      row: ProductCategory;
    }
  | {
      type: "business";
      row: BusinessCategory;
    }
  | null;

export default function AdminCategories() {
  const [mode, setMode] = useState<Mode>("product");

  const [productRows, setProductRows] = useState<ProductCategory[]>([]);
  const [businessRows, setBusinessRows] = useState<BusinessCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [editing, setEditing] = useState<Editing>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    row: ProductCategory | BusinessCategory;
    type: Mode;
  } | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    parent_id: "",
  });

  const [businessForm, setBusinessForm] = useState({
    name: "",
    slug: "",
    description: "",
    active: true,
  });

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      if (mode === "product") {
        const response =
          await adminService.listProductCategoriesPaginated({
            page,
            page_size: pageSize,
            search: debouncedQuery || undefined,
          });

        setProductRows(response.results);
        setTotal(response.total);
        setTotalPages(response.total_pages);
      } else {
        const response =
          await adminService.listBusinessCategoriesPaginated({
            page,
            page_size: pageSize,
            search: debouncedQuery || undefined,
            active_filter: "all",
          });

        setBusinessRows(response.results);
        setTotal(response.total);
        setTotalPages(response.total_pages);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    void load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, page, pageSize, debouncedQuery]);

  useEffect(() => {
    setPage(1);
    setQuery("");
    setDebouncedQuery("");
  }, [mode]);

  const createProduct = async (event: FormEvent) => {
    event.preventDefault();

    if (!productForm.name.trim()) {
      return;
    }

    setBusy(true);

    try {
      await adminService.createProductCategory({
        name: productForm.name.trim(),
        slug:
          productForm.slug.trim() ||
          slugify(productForm.name),
        parent_id: productForm.parent_id || null,
      });

      setProductForm({
        name: "",
        slug: "",
        parent_id: "",
      });

      toast.success("Product category created.");

      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create category."
      );
    } finally {
      setBusy(false);
    }
  };

  const createBusiness = async (event: FormEvent) => {
    event.preventDefault();

    if (!businessForm.name.trim()) {
      return;
    }

    setBusy(true);

    try {
      await adminService.createBusinessCategory({
        name: businessForm.name.trim(),
        slug:
          businessForm.slug.trim() ||
          slugify(businessForm.name),
        description:
          businessForm.description.trim() || undefined,
        active: businessForm.active,
      });

      setBusinessForm({
        name: "",
        slug: "",
        description: "",
        active: true,
      });

      toast.success("Business category created.");

      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create business category."
      );
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!editing) {
      return;
    }

    setBusy(true);

    try {
      if (editing.type === "product") {
        await adminService.updateProductCategory(
          editing.row.id,
          {
            name: editing.row.name,
            slug: editing.row.slug,
            parent_id: editing.row.parent_id ?? null,
          }
        );
      } else {
        await adminService.updateBusinessCategory(
          editing.row.id,
          {
            name: editing.row.name,
            slug: editing.row.slug,
            description:
              editing.row.description ?? undefined,
            active: editing.row.active,
          }
        );
      }

      toast.success("Category updated.");

      setEditing(null);

      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update category."
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) {
      return;
    }

    setBusy(true);

    try {
      if (deleteTarget.type === "product") {
        await adminService.deleteProductCategory(
          deleteTarget.row.id
        );
      } else {
        await adminService.deleteBusinessCategory(
          deleteTarget.row.id
        );
      }

      toast.success("Category deleted.");

      setDeleteTarget(null);

      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete category."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-catalog-page space-y-5">
        {/* Header */}
        <section className="admin-catalog-header">
          <h2 className="text-2xl font-bold">
            Category Management
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Backend-controlled search and pagination.
          </p>

          <div className="mt-4 inline-flex rounded-xl border bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setMode("product")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === "product"
                  ? "bg-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Product Categories
            </button>

            <button
              type="button"
              onClick={() => setMode("business")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === "business"
                  ? "bg-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Business Categories
            </button>
          </div>
        </section>

        {/* Main Content */}
        <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          {/* Create Form */}
          {mode === "product" ? (
            <form
              onSubmit={createProduct}
              className="admin-catalog-form"
            >
              <h3 className="font-bold">
                Add Product Category
              </h3>

              <Field label="Name">
                <input
                  className="field"
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      name: event.target.value,
                      slug:
                        current.slug ||
                        slugify(event.target.value),
                    }))
                  }
                />
              </Field>

              <Field label="Slug">
                <input
                  className="field"
                  value={productForm.slug}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      slug: slugify(event.target.value),
                    }))
                  }
                />
              </Field>

              <button
                type="submit"
                disabled={
                  busy || !productForm.name.trim()
                }
                className="mt-5 w-full rounded-xl bg-[#111827] py-3 font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus
                  className="mr-2 inline"
                  size={14}
                />
                Add Category
              </button>
            </form>
          ) : (
            <form
              onSubmit={createBusiness}
              className="admin-catalog-form"
            >
              <h3 className="font-bold">
                Add Business Category
              </h3>

              <Field label="Name">
                <input
                  className="field"
                  value={businessForm.name}
                  onChange={(event) =>
                    setBusinessForm((current) => ({
                      ...current,
                      name: event.target.value,
                      slug:
                        current.slug ||
                        slugify(event.target.value),
                    }))
                  }
                />
              </Field>

              <Field label="Slug">
                <input
                  className="field"
                  value={businessForm.slug}
                  onChange={(event) =>
                    setBusinessForm((current) => ({
                      ...current,
                      slug: slugify(event.target.value),
                    }))
                  }
                />
              </Field>

              <Field label="Description">
                <textarea
                  rows={4}
                  className="field"
                  value={businessForm.description}
                  onChange={(event) =>
                    setBusinessForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </Field>

              <label className="mt-4 flex gap-2">
                <input
                  type="checkbox"
                  checked={businessForm.active}
                  onChange={(event) =>
                    setBusinessForm((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                />

                Active
              </label>

              <button
                type="submit"
                disabled={
                  busy || !businessForm.name.trim()
                }
                className="mt-5 w-full rounded-xl bg-[#111827] py-3 font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus
                  className="mr-2 inline"
                  size={14}
                />
                Add Business Category
              </button>
            </form>
          )}

          {/* Categories Table */}
          <section className="admin-catalog-card overflow-hidden">
            <div className="admin-catalog-toolbar">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                />

                <input
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Search categories..."
                  className="h-10 w-full rounded-xl border pl-9 pr-3"
                />
              </div>

              <button
                type="button"
                onClick={() => void load()}
                className="rounded-xl border px-3 transition hover:bg-gray-50"
                title="Refresh"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {loading ? (
              <p className="p-10 text-center">
                Loading...
              </p>
            ) : error ? (
              <p className="p-10 text-center text-red-600">
                {error}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3">
                        Name
                      </th>

                      <th className="px-5 py-3">
                        Slug
                      </th>

                      {mode === "business" && (
                        <th className="px-5 py-3">
                          Status
                        </th>
                      )}

                      <th className="px-5 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {(mode === "product"
                      ? productRows
                      : businessRows
                    ).map((row: any) => (
                      <tr key={row.id}>
                        <td className="px-5 py-4 font-semibold">
                          {row.name}
                        </td>

                        <td className="px-5 py-4 text-gray-500">
                          {row.slug}
                        </td>

                        {mode === "business" && (
                          <td className="px-5 py-4">
                            <span
                              className={
                                row.active
                                  ? "font-medium text-green-600"
                                  : "font-medium text-gray-500"
                              }
                            >
                              {row.active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>
                        )}

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              setEditing({
                                type: mode,
                                row: { ...row },
                              } as Editing)
                            }
                            className="mr-4 text-blue-600 transition hover:text-blue-800"
                          >
                            <Edit3
                              className="mr-1 inline"
                              size={13}
                            />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                row,
                                type: mode,
                              })
                            }
                            className="text-red-600 transition hover:text-red-800"
                          >
                            <Trash2
                              className="mr-1 inline"
                              size={13}
                            />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </section>
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">
                  Edit Category
                </h3>

                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <Field label="Name">
                <input
                  className="field"
                  value={editing.row.name}
                  onChange={(event) =>
                    setEditing((current) =>
                      current
                        ? ({
                            ...current,
                            row: {
                              ...current.row,
                              name: event.target.value,
                            },
                          } as Editing)
                        : current
                    )
                  }
                />
              </Field>

              <Field label="Slug">
                <input
                  className="field"
                  value={editing.row.slug}
                  onChange={(event) =>
                    setEditing((current) =>
                      current
                        ? ({
                            ...current,
                            row: {
                              ...current.row,
                              slug: slugify(
                                event.target.value
                              ),
                            },
                          } as Editing)
                        : current
                    )
                  }
                />
              </Field>

              {editing.type === "business" && (
                <>
                  <Field label="Description">
                    <textarea
                      rows={4}
                      className="field"
                      value={
                        editing.row.description ?? ""
                      }
                      onChange={(event) =>
                        setEditing((current) =>
                          current &&
                          current.type === "business"
                            ? {
                                ...current,
                                row: {
                                  ...current.row,
                                  description:
                                    event.target.value,
                                },
                              }
                            : current
                        )
                      }
                    />
                  </Field>

                  <label className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={editing.row.active}
                      onChange={(event) =>
                        setEditing((current) =>
                          current &&
                          current.type === "business"
                            ? {
                                ...current,
                                row: {
                                  ...current.row,
                                  active:
                                    event.target.checked,
                                },
                              }
                            : current
                        )
                      }
                    />

                    Active
                  </label>
                </>
              )}

              <button
                type="button"
                onClick={() => void save()}
                disabled={busy}
                className="mt-5 w-full rounded-xl bg-[#111827] py-3 font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              {/* Warning Icon + Text */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50">
                  <AlertTriangle
                    size={22}
                    className="text-gray-900"
                  />
                </div>

                <div className="min-w-0">
                  <h3
                    id="delete-category-title"
                    className="text-base font-bold text-gray-900"
                  >
                    Delete category?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    The category{" "}
                    <strong className="font-bold text-gray-900">
                      {deleteTarget.row.name}
                    </strong>{" "}
                    will be permanently deleted. The
                    backend will block deletion if
                    dependent records must be preserved.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                {/* DELETE - LEFT */}
                <button
                  type="button"
                  onClick={() => void remove()}
                  disabled={busy}
                  className="rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy
                    ? "Deleting..."
                    : "Delete category"}
                </button>

                {/* CANCEL - RIGHT */}
                <button
                  type="button"
                  onClick={() =>
                    !busy && setDeleteTarget(null)
                  }
                  disabled={busy}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          .field {
            margin-top: 0.5rem;
            min-height: 46px;
            width: 100%;
            border-radius: 0.75rem;
            border: 2px solid #16181a;
            background: #fff;
            padding: 0.7rem 0.9rem;
            outline: none;
            color: #111827;
          }

          .field:focus {
            border-color: #f47524;
          }

          .field::placeholder {
            color: #9ca3af;
          }
        `}</style>
      </div>
    </>
  );
}

function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const start = total
    ? (page - 1) * pageSize + 1
    : 0;

  const end = Math.min(
    page * pageSize,
    total
  );

  return (
    <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-gray-600">
        Showing {start}-{end} of {total}
      </span>

      <div className="flex gap-2">
        <select
          value={pageSize}
          onChange={(event) =>
            onPageSizeChange(
              Number(event.target.value)
            )
          }
          className="rounded-xl border px-2 py-2 text-sm"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={page <= 1}
          onClick={() =>
            onPageChange(page - 1)
          }
          className="rounded-xl border px-3 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-40"
        >
          Previous
        </button>

        <span className="px-2 py-2 text-xs text-gray-600">
          Page {page} of{" "}
          {Math.max(totalPages, 1)}
        </span>

        <button
          type="button"
          disabled={
            page >= totalPages ||
            !totalPages
          }
          onClick={() =>
            onPageChange(page + 1)
          }
          className="rounded-xl border px-3 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-semibold text-gray-800">
        {label}
      </span>

      {children}
    </label>
  );
}