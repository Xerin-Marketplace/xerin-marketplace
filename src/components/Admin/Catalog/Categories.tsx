"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, Edit02Icon, PlusIcon, RefreshCwIcon, Search01Icon, Delete02Icon, Settings02Icon, Cancel01Icon, Image01Icon, Upload04Icon } from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import { resolveProductImageUrl } from "@/lib/products/adapters";
import {
 adminService,
 type BusinessCategory,
 type ProductCategory,
 type CategoryAttribute,
 type CategoryAttributeInputType,
} from "@/lib/api/endpoints/admin";
import Pagination from "@/components/ui/Pagination";

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
 const [attributeCategory, setAttributeCategory] = useState<ProductCategory | null>(null);
 const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
 const [attributesLoading, setAttributesLoading] = useState(false);
 const [editingAttribute, setEditingAttribute] = useState<CategoryAttribute | null>(null);
 const [attributeForm, setAttributeForm] = useState({
 key: "", name: "", description: "", input_type: "text" as CategoryAttributeInputType, unit: "",
 allowed_values: "", is_required: false, is_filterable: true, is_comparable: true, use_for_similarity: true,
 similarity_weight: "1", is_variant_attribute: false, inherit_to_children: true, display_order: "0", is_active: true,
 });

 const [deleteTarget, setDeleteTarget] = useState<{
 row: ProductCategory | BusinessCategory;
 type: Mode;
 } | null>(null);

 const [productForm, setProductForm] = useState({
 name: "",
 slug: "",
 parent_id: "",
 });
 const [createImage, setCreateImage] = useState<File | null>(null);
 const [createPreview, setCreatePreview] = useState<string | null>(null);
 const createImageRef = useRef<HTMLInputElement | null>(null);

 useEffect(() => {
 if (!createImage) { setCreatePreview(null); return; }
 const url = URL.createObjectURL(createImage);
 setCreatePreview(url);
 return () => URL.revokeObjectURL(url);
 }, [createImage]);

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

 const resetAttributeForm = () => {
 setEditingAttribute(null);
 setAttributeForm({ key: "", name: "", description: "", input_type: "text", unit: "", allowed_values: "", is_required: false, is_filterable: true, is_comparable: true, use_for_similarity: true, similarity_weight: "1", is_variant_attribute: false, inherit_to_children: true, display_order: "0", is_active: true });
 };

 const loadAttributes = async (category: ProductCategory) => {
 setAttributeCategory(category);
 setAttributesLoading(true);
 try { setAttributes(await adminService.listProductCategoryAttributes(category.id, true)); }
 catch (cause) { toast.error(cause instanceof Error ? cause.message : "Unable to load category attributes."); }
 finally { setAttributesLoading(false); }
 };

 const saveAttribute = async (event: FormEvent) => {
 event.preventDefault();
 if (!attributeCategory || !attributeForm.name.trim()) return;
 const key = (attributeForm.key.trim() || slugify(attributeForm.name).replaceAll("-", "_")).toLowerCase();
 const allowedValues = attributeForm.allowed_values.split(/[,\n]/).map(v => v.trim()).filter(Boolean);
 if (["select", "multiselect"].includes(attributeForm.input_type) && !allowedValues.length) { toast.error("Add at least one allowed value for select fields."); return; }
 const payload = {
 key, name: attributeForm.name.trim(), description: attributeForm.description.trim() || null, input_type: attributeForm.input_type,
 unit: attributeForm.unit.trim() || null, allowed_values: allowedValues, is_required: attributeForm.is_required,
 is_filterable: attributeForm.is_filterable, is_comparable: attributeForm.is_comparable, use_for_similarity: attributeForm.use_for_similarity,
 similarity_weight: Number(attributeForm.similarity_weight || 1), is_variant_attribute: attributeForm.is_variant_attribute,
 inherit_to_children: attributeForm.inherit_to_children, display_order: Number(attributeForm.display_order || 0), is_active: attributeForm.is_active,
 };
 setBusy(true);
 try {
 if (editingAttribute) await adminService.updateProductCategoryAttribute(attributeCategory.id, editingAttribute.id, payload);
 else await adminService.createProductCategoryAttribute(attributeCategory.id, payload);
 toast.success(editingAttribute ? "Attribute updated." : "Attribute added.");
 resetAttributeForm();
 setAttributes(await adminService.listProductCategoryAttributes(attributeCategory.id, true));
 } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Unable to save attribute."); }
 finally { setBusy(false); }
 };

 const beginEditAttribute = (attribute: CategoryAttribute) => {
 if (attribute.inherited) { toast.error("Edit inherited attributes on their source category."); return; }
 setEditingAttribute(attribute);
 setAttributeForm({
 key: attribute.key, name: attribute.name, description: attribute.description ?? "", input_type: attribute.input_type, unit: attribute.unit ?? "",
 allowed_values: (attribute.allowed_values ?? []).join(", "), is_required: attribute.is_required, is_filterable: attribute.is_filterable,
 is_comparable: attribute.is_comparable, use_for_similarity: attribute.use_for_similarity, similarity_weight: String(attribute.similarity_weight ?? 1),
 is_variant_attribute: attribute.is_variant_attribute, inherit_to_children: attribute.inherit_to_children, display_order: String(attribute.display_order ?? 0), is_active: attribute.is_active,
 });
 };

 const removeAttribute = async (attribute: CategoryAttribute) => {
 if (!attributeCategory || attribute.inherited) return;
 if (!window.confirm(`Delete attribute “${attribute.name}”?`)) return;
 setBusy(true);
 try { await adminService.deleteProductCategoryAttribute(attributeCategory.id, attribute.id); toast.success("Attribute deleted."); setAttributes(await adminService.listProductCategoryAttributes(attributeCategory.id, true)); }
 catch (cause) { toast.error(cause instanceof Error ? cause.message : "Unable to delete attribute."); }
 finally { setBusy(false); }
 };

 const createProduct = async (event: FormEvent) => {
 event.preventDefault();

 if (!productForm.name.trim()) {
 return;
 }

 setBusy(true);

 try {
 const payload = {
 name: productForm.name.trim(),
 slug:
 productForm.slug.trim() ||
 slugify(productForm.name),
 parent_id: productForm.parent_id || null,
 };
 if (createImage) {
 await adminService.createProductCategoryWithImage(payload, createImage);
 } else {
 await adminService.createProductCategory(payload);
 }

 setProductForm({
 name: "",
 slug: "",
 parent_id: "",
 });
 setCreateImage(null);
 if (createImageRef.current) createImageRef.current.value = "";

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

 const imageInputRef = useRef<HTMLInputElement | null>(null);
 const [imageBusy, setImageBusy] = useState(false);

 const uploadImage = async (file: File) => {
 if (!editing || editing.type !== "product") return;
 if (!file.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
 setImageBusy(true);
 try {
 const updated = await adminService.uploadProductCategoryImage(editing.row.id, file);
 setEditing({ type: "product", row: { ...editing.row, image_url: updated.image_url, thumbnail_url: updated.thumbnail_url } });
 setProductRows((rows) => rows.map((r) => (r.id === updated.id ? { ...r, image_url: updated.image_url, thumbnail_url: updated.thumbnail_url } : r)));
 toast.success("Category image updated.");
 } catch (cause) {
 toast.error(cause instanceof Error ? cause.message : "Unable to upload image.");
 } finally {
 setImageBusy(false);
 if (imageInputRef.current) imageInputRef.current.value = "";
 }
 };

 const removeImage = async () => {
 if (!editing || editing.type !== "product") return;
 setImageBusy(true);
 try {
 await adminService.removeProductCategoryImage(editing.row.id);
 setEditing({ type: "product", row: { ...editing.row, image_url: null, thumbnail_url: null } });
 setProductRows((rows) => rows.map((r) => (r.id === editing.row.id ? { ...r, image_url: null, thumbnail_url: null } : r)));
 toast.success("Category image removed.");
 } catch (cause) {
 toast.error(cause instanceof Error ? cause.message : "Unable to remove image.");
 } finally {
 setImageBusy(false);
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

 <p className="mt-1 text-sm text-muted-foreground">
 Backend-controlled search and pagination.
 </p>

 <div className="mt-4 inline-flex rounded-xl border bg-muted p-1">
 <button
 type="button"
 onClick={() => setMode("product")}
 className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
 mode === "product"
 ? "bg-card shadow-sm"
 : "text-muted-foreground hover:text-foreground"
 }`}
 >
 Product Categories
 </button>

 <button
 type="button"
 onClick={() => setMode("business")}
 className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
 mode === "business"
 ? "bg-card shadow-sm"
 : "text-muted-foreground hover:text-foreground"
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

 <Field label="Image (optional)">
 <input
 ref={createImageRef}
 type="file"
 accept="image/png,image/jpeg,image/webp"
 className="hidden"
 onChange={(event) => setCreateImage(event.target.files?.[0] ?? null)}
 />
 <div className="flex items-center gap-3">
 {createPreview ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={createPreview} alt="Preview" className="h-14 w-14 rounded-lg border object-cover" />
 ) : (
 <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed bg-muted text-muted-foreground">
 <HugeiconsIcon icon={Image01Icon} size={18} />
 </span>
 )}
 <div className="flex flex-col gap-1">
 <button
 type="button"
 onClick={() => createImageRef.current?.click()}
 className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
 >
 <HugeiconsIcon icon={Upload04Icon} size={12} />
 {createImage ? "Change" : "Choose image"}
 </button>
 {createImage && (
 <button type="button" onClick={() => setCreateImage(null)} className="text-left text-xs font-semibold text-destructive">
 Remove
 </button>
 )}
 </div>
 </div>
 </Field>

 <button
 type="submit"
 disabled={
 busy || !productForm.name.trim()
 }
 className="mt-5 w-full rounded-xl bg-foreground py-3 font-semibold text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
 >
 <HugeiconsIcon icon={PlusIcon}
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
 className="mt-5 w-full rounded-xl bg-foreground py-3 font-semibold text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
 >
 <HugeiconsIcon icon={PlusIcon}
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
 <HugeiconsIcon icon={Search01Icon}
 size={16}
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
 className="rounded-xl border px-3 transition hover:bg-muted"
 title="Refresh"
 >
 <HugeiconsIcon icon={RefreshCwIcon} size={16} />
 </button>
 </div>

 {loading ? (
 <p className="p-10 text-center">
 Loading...
 </p>
 ) : error ? (
 <p className="p-10 text-center text-destructive">
 {error}
 </p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[650px] text-left text-sm">
 <thead className="bg-muted">
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
 <div className="flex items-center gap-3">
 {mode === "product" && (
 row.thumbnail_url || row.image_url ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={resolveProductImageUrl(row.thumbnail_url || row.image_url)}
 alt={row.name}
 className="h-10 w-10 shrink-0 rounded-lg border object-cover"
 />
 ) : (
 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
 <HugeiconsIcon icon={Image01Icon} size={16} />
 </span>
 )
 )}
 <span>{row.name}</span>
 </div>
 </td>

 <td className="px-5 py-4 text-muted-foreground">
 {row.slug}
 </td>

 {mode === "business" && (
 <td className="px-5 py-4">
 <span
 className={
 row.active
 ? "font-medium text-green-600"
 : "font-medium text-muted-foreground"
 }
 >
 {row.active
 ? "Active"
 : "Inactive"}
 </span>
 </td>
 )}

 <td className="px-5 py-4">
 {mode === "product" && (
 <button type="button" onClick={() => void loadAttributes(row as ProductCategory)} className="mr-4 text-primary transition hover:text-primary">
 <HugeiconsIcon icon={Settings02Icon} className="mr-1 inline" size={14} /> Attributes
 </button>
 )}
 <button
 type="button"
 onClick={() =>
 setEditing({
 type: mode,
 row: { ...row },
 } as Editing)
 }
 className="mr-4 text-primary-600 transition hover:text-primary-800"
 >
 <HugeiconsIcon icon={Edit02Icon}
 className="mr-1 inline"
 size={14}
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
 className="text-destructive transition hover:text-red-800"
 >
 <HugeiconsIcon icon={Delete02Icon}
 className="mr-1 inline"
 size={14}
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

 {attributeCategory && (
 <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4">
 <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-card p-6 shadow-lg">
 <div className="flex items-start justify-between gap-4">
 <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Product specifications</p><h3 className="mt-1 text-xl font-bold text-foreground">{attributeCategory.name} attributes</h3><p className="mt-1 text-sm text-muted-foreground">These fields automatically appear when a seller selects this category. Inherited fields are shown too.</p></div>
 <button type="button" onClick={() => { setAttributeCategory(null); resetAttributeForm(); }} className="rounded-lg p-2 hover:bg-muted"><HugeiconsIcon icon={Cancel01Icon} size={18}/></button>
 </div>

 <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
 <div className="overflow-hidden rounded-xl border">
 <div className="border-b bg-muted px-4 py-3 text-sm font-bold">Configured attributes</div>
 {attributesLoading ? <p className="p-6 text-sm text-muted-foreground">Loading attributes...</p> : attributes.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No attributes yet. Add the first field.</p> : (
 <div className="divide-y">{attributes.map((attribute) => (
 <div key={attribute.id} className="flex items-start justify-between gap-3 p-4">
 <div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-foreground">{attribute.name}</span>{attribute.unit && <span className="text-xs text-muted-foreground">({attribute.unit})</span>}{attribute.is_required && <span className="rounded-full bg-red-light-6 px-2 py-0.5 text-[10px] font-bold text-destructive">Required</span>}{attribute.inherited && <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-600">Inherited</span>}</div><p className="mt-1 text-xs text-muted-foreground">{attribute.input_type} · key: {attribute.key} · similarity weight {String(attribute.similarity_weight)}</p>{attribute.allowed_values?.length > 0 && <p className="mt-1 text-xs text-muted-foreground">Values: {attribute.allowed_values.join(", ")}</p>}</div>
 {!attribute.inherited && <div className="flex shrink-0 gap-2"><button type="button" onClick={() => beginEditAttribute(attribute)} className="text-xs font-semibold text-primary-600">Edit</button><button type="button" onClick={() => void removeAttribute(attribute)} className="text-xs font-semibold text-destructive">Delete</button></div>}
 </div>
 ))}</div>
 )}
 </div>

 <form onSubmit={saveAttribute} className="rounded-xl border p-4">
 <div className="flex items-center justify-between"><h4 className="font-bold text-foreground">{editingAttribute ? "Edit attribute" : "Add attribute"}</h4>{editingAttribute && <button type="button" onClick={resetAttributeForm} className="text-xs font-semibold text-muted-foreground">Cancel edit</button>}</div>
 <div className="grid gap-3 sm:grid-cols-2">
 <Field label="Display name"><input className="field" value={attributeForm.name} onChange={e => setAttributeForm(f => ({...f,name:e.target.value,key:f.key || slugify(e.target.value).replaceAll("-","_")}))} placeholder="RAM" /></Field>
 <Field label="Key"><input className="field" value={attributeForm.key} onChange={e => setAttributeForm(f => ({...f,key:e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,"_")}))} placeholder="ram" /></Field>
 <Field label="Input type"><select className="field" value={attributeForm.input_type} onChange={e => setAttributeForm(f => ({...f,input_type:e.target.value as CategoryAttributeInputType}))}>{["text","textarea","number","boolean","select","multiselect","date"].map(type => <option key={type} value={type}>{type}</option>)}</select></Field>
 <Field label="Unit"><input className="field" value={attributeForm.unit} onChange={e => setAttributeForm(f => ({...f,unit:e.target.value}))} placeholder="GB, ml, inch..." /></Field>
 </div>
 <Field label="Description"><textarea className="field" rows={2} value={attributeForm.description} onChange={e => setAttributeForm(f => ({...f,description:e.target.value}))} placeholder="Help the seller understand what to enter." /></Field>
 {["select","multiselect"].includes(attributeForm.input_type) && <Field label="Allowed values"><textarea className="field" rows={3} value={attributeForm.allowed_values} onChange={e => setAttributeForm(f => ({...f,allowed_values:e.target.value}))} placeholder="4 GB, 6 GB, 8 GB, 12 GB" /></Field>}
 <div className="grid gap-3 sm:grid-cols-2"><Field label="Similarity weight"><input className="field" type="number" min="0" step="0.1" value={attributeForm.similarity_weight} onChange={e => setAttributeForm(f => ({...f,similarity_weight:e.target.value}))}/></Field><Field label="Display order"><input className="field" type="number" min="0" value={attributeForm.display_order} onChange={e => setAttributeForm(f => ({...f,display_order:e.target.value}))}/></Field></div>
 <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">{([
 ["is_required","Required for submission"],["is_filterable","Filterable"],["is_comparable","Comparable"],["use_for_similarity","Use for similarity"],["is_variant_attribute","Variant attribute"],["inherit_to_children","Inherit to child categories"],["is_active","Active"],
 ] as const).map(([key,label]) => <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={attributeForm[key]} onChange={e => setAttributeForm(f => ({...f,[key]:e.target.checked}))}/>{label}</label>)}</div>
 <button type="submit" disabled={busy} className="mt-5 w-full rounded-xl bg-foreground px-4 py-3 text-sm font-bold text-background disabled:opacity-50">{busy ? "Saving..." : editingAttribute ? "Update attribute" : "Add attribute"}</button>
 </form>
 </div>
 </div>
 </div>
 )}

 {/* Edit Modal */}
 {editing && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
 <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
 <div className="flex items-center justify-between">
 <h3 className="font-bold text-foreground">
 Edit Category
 </h3>

 <button
 type="button"
 onClick={() => setEditing(null)}
 className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
 aria-label="Close"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={18} />
 </button>
 </div>

 {editing.type === "product" && (
 <div className="mt-4">
 <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category image</p>
 <p className="mt-1 text-xs text-muted-foreground">Shown on the mobile app home and categories screens. Square images (at least 400×400) look best.</p>
 <div className="mt-3 flex items-center gap-4">
 {editing.row.image_url ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={resolveProductImageUrl(editing.row.thumbnail_url || editing.row.image_url)}
 alt={editing.row.name}
 className="h-20 w-20 rounded-xl border object-cover"
 />
 ) : (
 <span className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed bg-muted text-muted-foreground">
 <HugeiconsIcon icon={Image01Icon} size={24} />
 </span>
 )}
 <div className="flex flex-col gap-2">
 <input
 ref={imageInputRef}
 type="file"
 accept="image/png,image/jpeg,image/webp"
 className="hidden"
 onChange={(event) => {
 const file = event.target.files?.[0];
 if (file) void uploadImage(file);
 }}
 />
 <button
 type="button"
 disabled={imageBusy}
 onClick={() => imageInputRef.current?.click()}
 className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
 >
 <HugeiconsIcon icon={Upload04Icon} size={14} />
 {imageBusy ? "Uploading..." : editing.row.image_url ? "Replace image" : "Upload image"}
 </button>
 {editing.row.image_url && (
 <button
 type="button"
 disabled={imageBusy}
 onClick={() => void removeImage()}
 className="text-left text-xs font-semibold text-destructive disabled:opacity-50"
 >
 Remove image
 </button>
 )}
 </div>
 </div>
 </div>
 )}

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

 <label className="mt-4 flex items-center gap-2 text-sm font-medium text-accent-foreground">
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
 className="mt-5 w-full rounded-xl bg-foreground py-3 font-semibold text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
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
 <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
 {/* Warning Icon + Text */}
 <div className="flex items-start gap-4">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
 <HugeiconsIcon icon={Alert02Icon}
 size={20}
 className="text-foreground"
 />
 </div>

 <div className="min-w-0">
 <h3
 id="delete-category-title"
 className="text-base font-bold text-foreground"
 >
 Delete category?
 </h3>

 <p className="mt-2 text-sm leading-6 text-accent-foreground">
 The category{" "}
 <strong className="font-bold text-foreground">
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
 className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
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
 className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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

function Field({
 label,
 children,
}: {
 label: string;
 children: ReactNode;
}) {
 return (
 <label className="mt-4 block">
 <span className="text-sm font-semibold text-foreground">
 {label}
 </span>

 {children}
 </label>
 );
}