"use client";


import { Spinner } from "@/components/ui/Spinner";
import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { PercentCircleIcon, Calendar01Icon, CheckmarkCircle02Icon, ArrowLeft01Icon, ArrowRight01Icon, DollarCircleIcon, Copy01Icon, Edit02Icon, PackageIcon, PlusIcon, RefreshCwIcon, Search01Icon, Tag01Icon, TicketStarIcon, Delete02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";

import { ApiError } from "@/lib/api/client";
import { productsApi } from "@/lib/api/endpoints/products";
import { sellerPromotionsApi } from "@/lib/api/endpoints/promotions";
import type { Product } from "@/types/api/product";
import type {
 PromotionType,
 SellerPromotion,
 SellerPromotionRequest,
} from "@/types/api/promotion";

type Filter = "all" | "active" | "inactive";

type PromotionFormState = {
 name: string;
 code: string;
 description: string;
 promotion_type: PromotionType;
 discount_value: string;
 minimum_order_amount: string;
 maximum_discount_amount: string;
 usage_limit: string;
 usage_per_customer: string;
 stackable: boolean;
 automatic: boolean;
 is_active: boolean;
 starts_at: string;
 ends_at: string;
 product_ids: string[];
};

const initialForm: PromotionFormState = {
 name: "",
 code: "",
 description: "",
 promotion_type: "percentage",
 discount_value: "",
 minimum_order_amount: "",
 maximum_discount_amount: "",
 usage_limit: "",
 usage_per_customer: "1",
 stackable: false,
 automatic: false,
 is_active: true,
 starts_at: "",
 ends_at: "",
 product_ids: [],
};

const money = (value: number | string | null | undefined, currency = "TZS") => {
 const amount = Number(value ?? 0);
 return new Intl.NumberFormat("en-TZ", {
 style: "currency",
 currency,
 maximumFractionDigits: 0,
 }).format(Number.isFinite(amount) ? amount : 0);
};

const pretty = (value: string) =>
 value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const localDateTimeToIso = (value: string) =>
 value ? new Date(value).toISOString() : null;

const apiError = (error: unknown) => {
 if (error instanceof ApiError) return error.message;
 const candidate = error as {
 response?: { data?: { detail?: string | Array<{ msg?: string }> } };
 message?: string;
 };
 const detail = candidate.response?.data?.detail;
 if (typeof detail === "string") return detail;
 if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg || "We couldn't complete your request. Please try again.";
 return candidate.message || "We couldn't complete your request. Please try again.";
};

export default function SellerPromotions() {
 const [rows, setRows] = useState<SellerPromotion[]>([]);
 const [products, setProducts] = useState<Product[]>([]);
 const [loading, setLoading] = useState(true);
 const [productsLoading, setProductsLoading] = useState(false);
 const [busy, setBusy] = useState<string | null>(null);
 const [error, setError] = useState("");

 const [search, setSearch] = useState("");
 const [filter, setFilter] = useState<Filter>("all");
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(10);
 const [meta, setMeta] = useState({ total: 0, total_pages: 0 });

 const [editorOpen, setEditorOpen] = useState(false);
 const [editing, setEditing] = useState<SellerPromotion | null>(null);
 const [form, setForm] = useState<PromotionFormState>(initialForm);
 const [saving, setSaving] = useState(false);
 const [productSearch, setProductSearch] = useState("");
 const [deleteTarget, setDeleteTarget] = useState<SellerPromotion | null>(null);

 const activeFilter =
 filter === "active" ? true : filter === "inactive" ? false : undefined;

 const loadPromotions = async () => {
 setLoading(true);
 setError("");

 try {
 const result = await sellerPromotionsApi.list({
 page,
 page_size: pageSize,
 search: search.trim() || undefined,
 active: activeFilter,
 });

 setRows(result.results);
 setMeta({ total: result.total, total_pages: result.total_pages });
 } catch (cause) {
 const message = apiError(cause);
 setError(message);
 toast.error(message);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 const timer = window.setTimeout(() => void loadPromotions(), 250);
 return () => window.clearTimeout(timer);
 }, [page, pageSize, search, filter]);

 const loadProducts = async () => {
 if (products.length || productsLoading) return;

 setProductsLoading(true);
 try {
 const result = await productsApi.getMyProducts();
 setProducts(result);
 } catch (cause) {
 toast.error(apiError(cause));
 } finally {
 setProductsLoading(false);
 }
 };

 const openCreate = async () => {
 setEditing(null);
 setForm(initialForm);
 setProductSearch("");
 setEditorOpen(true);
 await loadProducts();
 };

 const openEdit = (promotion: SellerPromotion) => {
 setEditing(promotion);
 setForm({
 ...initialForm,
 name: promotion.name,
 code: promotion.code || "",
 description: promotion.description || "",
 promotion_type: promotion.promotion_type as PromotionType,
 discount_value: String(promotion.discount_value ?? ""),
 minimum_order_amount:
 promotion.minimum_order_amount == null
 ? ""
 : String(promotion.minimum_order_amount),
 maximum_discount_amount:
 promotion.maximum_discount_amount == null
 ? ""
 : String(promotion.maximum_discount_amount),
 usage_limit:
 promotion.usage_limit == null ? "" : String(promotion.usage_limit),
 usage_per_customer:
 promotion.usage_per_customer == null
 ? ""
 : String(promotion.usage_per_customer),
 stackable: promotion.stackable,
 automatic: promotion.automatic,
 is_active: promotion.is_active,
 starts_at: promotion.starts_at
 ? promotion.starts_at.slice(0, 16)
 : "",
 ends_at: promotion.ends_at ? promotion.ends_at.slice(0, 16) : "",
 product_ids: [],
 });
 setEditorOpen(true);
 };

 const closeEditor = () => {
 if (saving) return;
 setEditorOpen(false);
 setEditing(null);
 setForm(initialForm);
 };

 const validateForm = () => {
 if (form.name.trim().length < 2) return "Enter a promotion name.";

 if (!form.automatic && form.code.trim().length < 2) {
 return "Enter a promo code, or enable Automatic Promotion.";
 }

 const discount = Number(form.discount_value);
 if (
 form.promotion_type !== "free_shipping" &&
 form.promotion_type !== "buy_x_get_y" &&
 (!Number.isFinite(discount) || discount <= 0)
 ) {
 return "Enter a valid discount value.";
 }

 if (form.promotion_type === "percentage" && discount > 100) {
 return "Percentage discount cannot exceed 100%.";
 }

 if (form.starts_at && form.ends_at) {
 if (new Date(form.ends_at) <= new Date(form.starts_at)) {
 return "End date must be later than start date.";
 }
 }

 if (!editing && form.product_ids.length === 0) {
 return "Select at least one of your products for this promotion.";
 }

 return null;
 };

 const submit = async () => {
 const validation = validateForm();
 if (validation) {
 toast.error(validation);
 return;
 }

 setSaving(true);
 try {
 if (editing) {
 await sellerPromotionsApi.update(editing.id, {
 name: form.name.trim(),
 description: form.description.trim() || null,
 discount_value: Number(form.discount_value || 0),
 minimum_order_amount: form.minimum_order_amount
 ? Number(form.minimum_order_amount)
 : null,
 maximum_discount_amount: form.maximum_discount_amount
 ? Number(form.maximum_discount_amount)
 : null,
 usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
 usage_per_customer: form.usage_per_customer
 ? Number(form.usage_per_customer)
 : null,
 stackable: form.stackable,
 automatic: form.automatic,
 is_active: form.is_active,
 starts_at: localDateTimeToIso(form.starts_at),
 ends_at: localDateTimeToIso(form.ends_at),
 });

 toast.success("Promotion updated.");
 } else {
 const payload: SellerPromotionRequest = {
 name: form.name.trim(),
 code: form.automatic ? form.code.trim().toUpperCase() || null : form.code.trim().toUpperCase(),
 description: form.description.trim() || null,
 promotion_type: form.promotion_type,
 discount_value: Number(form.discount_value || 0),
 minimum_order_amount: form.minimum_order_amount
 ? Number(form.minimum_order_amount)
 : null,
 maximum_discount_amount: form.maximum_discount_amount
 ? Number(form.maximum_discount_amount)
 : null,
 usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
 usage_per_customer: form.usage_per_customer
 ? Number(form.usage_per_customer)
 : null,
 stackable: form.stackable,
 automatic: form.automatic,
 is_active: form.is_active,
 starts_at: localDateTimeToIso(form.starts_at),
 ends_at: localDateTimeToIso(form.ends_at),
 rules: form.product_ids.map((productId) => ({
 rule_type: "product",
 product_id: productId,
 })),
 };

 await sellerPromotionsApi.create(payload);
 toast.success("Promotion created.");
 }

 closeEditor();
 await loadPromotions();
 } catch (cause) {
 toast.error(apiError(cause));
 } finally {
 setSaving(false);
 }
 };

 const togglePromotion = async (promotion: SellerPromotion) => {
 setBusy(String(promotion.id));
 try {
 await sellerPromotionsApi.update(promotion.id, {
 is_active: !promotion.is_active,
 });
 toast.success(
 promotion.is_active ? "Promotion paused." : "Promotion activated.",
 );
 await loadPromotions();
 } catch (cause) {
 toast.error(apiError(cause));
 } finally {
 setBusy(null);
 }
 };

 const removePromotion = async (promotion: SellerPromotion) => {
 setBusy(String(promotion.id));
 try {
 await sellerPromotionsApi.delete(promotion.id);
 toast.success(
 promotion.usage_count
 ? "Promotion deactivated and history preserved."
 : "Promotion deleted.",
 );
 setDeleteTarget(null);
 await loadPromotions();
 } catch (cause) {
 toast.error(apiError(cause));
 } finally {
 setBusy(null);
 }
 };

 const visibleProducts = useMemo(() => {
 const term = productSearch.trim().toLowerCase();
 if (!term) return products;
 return products.filter((product) =>
 `${product.name} ${product.sku}`.toLowerCase().includes(term),
 );
 }, [productSearch, products]);

 const activeCount = rows.filter((row) => row.is_active).length;
 const usedCount = rows.reduce((sum, row) => sum + row.usage_count, 0);

 return (
 <div className="space-y-5">
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
 <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
 <div className="max-w-3xl">
 <div className="flex items-center gap-3">
 <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary-400/10">
 <HugeiconsIcon icon={TicketStarIcon} size={20} />
 </span>
 <div>
 <h1 className="mt-0.5 text-2xl font-bold tracking-[-0.02em] text-foreground">
 Promotions & Promo Codes
 </h1>
 </div>
 </div>

 <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground /60">
 Create seller-funded promotions for your products. Xerin Marketplace
 commission remains separate from the seller-funded discount, so
 promotions do not silently reduce Xerin&apos;s commission.
 </p>
 </div>

 <button
 type="button"
 onClick={() => void openCreate()}
 className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary"
 >
 <HugeiconsIcon icon={PlusIcon} size={16} />
 Create Promotion
 </button>
 </div>

 <div className="mt-5 grid gap-3 sm:grid-cols-3">
 <SummaryCard
 label="Promotions on this page"
 value={rows.length}
 icon={Tag01Icon}
 />
 <SummaryCard
 label="Active on this page"
 value={activeCount}
 icon={CheckmarkCircle02Icon}
 />
 <SummaryCard
 label="Total uses on this page"
 value={usedCount}
 icon={PercentCircleIcon}
 />
 </div>
 </section>

 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card">
 <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between dark:border-border">
 <div>
 <h2 className="font-bold text-foreground">
 My Promotions
 </h2>
 <p className="mt-1 text-xs text-muted-foreground">
 Search and pagination are handled by the backend.
 </p>
 </div>

 <div className="flex flex-col gap-2 sm:flex-row">
 <label className="relative">
 <HugeiconsIcon icon={Search01Icon}
 size={16}
 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
 />
 <input
 value={search}
 onChange={(event) => {
 setSearch(event.target.value);
 setPage(1);
 }}
 placeholder="Search name or promo code..."
 className="h-11 min-w-[270px] rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-ring/30 dark:border-border"
 />
 </label>

 <select
 value={filter}
 onChange={(event) => {
 setFilter(event.target.value as Filter);
 setPage(1);
 }}
 className="h-11 rounded-xl border border-border bg-card px-3 text-sm outline-none dark:border-border"
 >
 <option value="all">All promotions</option>
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 </select>
 </div>
 </div>

 {error && (
 <div className="m-5 rounded-xl border border-red-light-4 bg-red-light-6 p-4 text-sm text-red-dark">
 {error}
 </div>
 )}

 {loading ? (
 <div className="p-12 text-center text-sm text-muted-foreground">
 <Spinner className="mx-auto" />
 <p className="mt-3">Loading promotions...</p>
 </div>
 ) : (
 <>
 <div className="overflow-x-auto">
 <table className="w-full min-w-[1080px] text-left text-sm">
 <thead className="bg-muted text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
 <tr>
 {[
 "Promotion",
 "Code",
 "Discount",
 "Schedule",
 "Usage",
 "Funding",
 "Status",
 "Actions",
 ].map((header) => (
 <th key={header} className="px-5 py-3.5">
 {header}
 </th>
 ))}
 </tr>
 </thead>

 <tbody className="divide-y divide-[#eef1f5] dark:divide-white/10">
 {rows.map((promotion) => (
 <tr key={promotion.id}>
 <td className="px-5 py-4">
 <p className="font-semibold text-foreground">
 {promotion.name}
 </p>
 <p className="mt-1 max-w-[280px] truncate text-xs text-muted-foreground">
 {promotion.description || pretty(promotion.promotion_type)}
 </p>
 </td>

 <td className="px-5 py-4">
 {promotion.code ? (
 <button
 type="button"
 onClick={async () => {
 await navigator.clipboard.writeText(
 promotion.code || "",
 );
 toast.success("Promo code copied.");
 }}
 className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1.5 font-mono text-xs font-bold text-primary"
 >
 {promotion.code}
 <HugeiconsIcon icon={Copy01Icon} size={12} />
 </button>
 ) : (
 <span className="text-xs text-muted-foreground">Automatic</span>
 )}
 </td>

 <td className="px-5 py-4">
 <p className="font-semibold text-foreground">
 {promotion.promotion_type === "percentage"
 ? `${Number(promotion.discount_value).toLocaleString()}%`
 : promotion.promotion_type === "fixed_amount"
 ? money(promotion.discount_value)
 : pretty(promotion.promotion_type)}
 </p>
 {promotion.maximum_discount_amount != null && (
 <p className="mt-1 text-xs text-muted-foreground">
 Max {money(promotion.maximum_discount_amount)}
 </p>
 )}
 </td>

 <td className="px-5 py-4 text-xs text-muted-foreground /60">
 <p>
 {promotion.starts_at
 ? new Date(promotion.starts_at).toLocaleDateString()
 : "Starts immediately"}
 </p>
 <p className="mt-1">
 {promotion.ends_at
 ? `Ends ${new Date(promotion.ends_at).toLocaleDateString()}`
 : "No end date"}
 </p>
 </td>

 <td className="px-5 py-4">
 <p className="font-semibold text-foreground">
 {promotion.usage_count}
 {promotion.usage_limit != null
 ? ` / ${promotion.usage_limit}`
 : ""}
 </p>
 <p className="mt-1 text-xs text-muted-foreground">
 {promotion.usage_per_customer
 ? `${promotion.usage_per_customer} per customer`
 : "No customer limit"}
 </p>
 </td>

 <td className="px-5 py-4">
 <span className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-700">
 {promotion.funding_source || "seller"}
 </span>
 </td>

 <td className="px-5 py-4">
 <StatusBadge
 active={promotion.is_active}
 startsAt={promotion.starts_at}
 endsAt={promotion.ends_at}
 />
 </td>

 <td className="px-5 py-4">
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => openEdit(promotion)}
 className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted dark:border-border dark:hover:bg-card/5"
 aria-label="Edit promotion"
 >
 <HugeiconsIcon icon={Edit02Icon} size={14} />
 </button>

 <button
 type="button"
 disabled={busy === String(promotion.id)}
 onClick={() => void togglePromotion(promotion)}
 className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground disabled:opacity-50 dark:border-border /70"
 >
 {promotion.is_active ? "Pause" : "Activate"}
 </button>

 <button
 type="button"
 disabled={busy === String(promotion.id)}
 onClick={() => setDeleteTarget(promotion)}
 className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-light-4 text-destructive hover:bg-red-light-6 disabled:opacity-50"
 aria-label="Delete promotion"
 >
 <HugeiconsIcon icon={Delete02Icon} size={14} />
 </button>
 </div>
 </td>
 </tr>
 ))}

 {!rows.length && (
 <tr>
 <td colSpan={8} className="px-5 py-14 text-center">
 <HugeiconsIcon icon={TicketStarIcon}
 size={28}
 className="mx-auto text-muted-foreground"
 />
 <p className="mt-3 font-semibold text-muted-foreground /80">
 No promotions found
 </p>
 <p className="mt-1 text-sm text-muted-foreground">
 Create your first product promotion or change the filters.
 </p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 <Pagination
 page={page}
 pageSize={pageSize}
 total={meta.total}
 totalPages={meta.total_pages}
 onPageChange={setPage}
 onPageSizeChange={(size) => {
 setPageSize(size);
 setPage(1);
 }}
 />
 </>
 )}
 </section>

 {editorOpen && (
 <PromotionEditor
 editing={editing}
 form={form}
 setForm={setForm}
 products={visibleProducts}
 productSearch={productSearch}
 setProductSearch={setProductSearch}
 productsLoading={productsLoading}
 saving={saving}
 onClose={closeEditor}
 onSave={() => void submit()}
 />
 )}
 {deleteTarget && (
 <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
 <div role="dialog" aria-modal="true" aria-labelledby="delete-promotion-title" className="w-full max-w-md rounded-t-2xl bg-card p-5 shadow-lg dark:bg-card sm:rounded-xl sm:p-6">
 <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-light-6 text-destructive dark:bg-destructive/10"><HugeiconsIcon icon={Delete02Icon} size={20} /></span><div><h2 id="delete-promotion-title" className="font-bold text-foreground">{deleteTarget.usage_count ? "Deactivate promotion?" : "Delete promotion?"}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{deleteTarget.usage_count ? `“${deleteTarget.name}” has usage history, so it will be safely deactivated and its records preserved.` : `“${deleteTarget.name}” will be permanently deleted. This action cannot be undone.`}</p></div></div>
 <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={busy !== null} onClick={() => setDeleteTarget(null)} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold dark:border-border">Keep promotion</button><button type="button" disabled={busy !== null} onClick={() => void removePromotion(deleteTarget)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-bold text-white disabled:opacity-50">{busy && <Spinner />}{deleteTarget.usage_count ? "Deactivate" : "Delete promotion"}</button></div>
 </div>
 </div>
 )}
 </div>
 );
}

function PromotionEditor({
 editing,
 form,
 setForm,
 products,
 productSearch,
 setProductSearch,
 productsLoading,
 saving,
 onClose,
 onSave,
}: {
 editing: SellerPromotion | null;
 form: PromotionFormState;
 setForm: React.Dispatch<React.SetStateAction<PromotionFormState>>;
 products: Product[];
 productSearch: string;
 setProductSearch: (value: string) => void;
 productsLoading: boolean;
 saving: boolean;
 onClose: () => void;
 onSave: () => void;
}) {
 const toggleProduct = (productId: string) => {
 setForm((current) => ({
 ...current,
 product_ids: current.product_ids.includes(productId)
 ? current.product_ids.filter((id) => id !== productId)
 : [...current.product_ids, productId],
 }));
 };

 return (
 <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
 <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-card shadow-lg dark:bg-card">
 <div className="flex items-center justify-between border-b border-border px-5 py-4 dark:border-border">
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
 {editing ? "Update Promotion" : "New Promotion"}
 </p>
 <h2 className="mt-0.5 text-xl font-bold text-foreground">
 {editing ? editing.name : "Create seller-funded promotion"}
 </h2>
 </div>
 <button
 type="button"
 disabled={saving}
 onClick={onClose}
 className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground dark:border-border"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={16} />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto p-5 sm:p-6">
 {editing && (
 <div className="mb-5 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm leading-6 text-primary-800">
 Product targeting is fixed when the promotion is created in the current
 backend. You can edit promotion terms here. To change targeted products,
 create a new promotion.
 </div>
 )}

 <div className="grid gap-5 lg:grid-cols-2">
 <section className="space-y-4 rounded-xl border border-border p-4 sm:p-5 dark:border-border">
 <div>
 <p className="font-bold text-foreground">
 Promotion details
 </p>
 <p className="mt-1 text-xs text-muted-foreground">
 Define the code, discount and usage limits.
 </p>
 </div>

 <Field label="Promotion name" required>
 <input
 value={form.name}
 onChange={(event) =>
 setForm((x) => ({ ...x, name: event.target.value }))
 }
 className={inputClass}
 placeholder="Weekend Soap Discount"
 />
 </Field>

 <Field
 label="Promo code"
 required={!form.automatic}
 hint={
 form.automatic
 ? "Optional for automatic promotions."
 : "Customers will enter this code during checkout."
 }
 >
 <input
 value={form.code}
 disabled={Boolean(editing)}
 onChange={(event) =>
 setForm((x) => ({
 ...x,
 code: event.target.value.toUpperCase().replace(/\s+/g, ""),
 }))
 }
 className={inputClass}
 placeholder="SOAP10"
 />
 </Field>

 <Field label="Description">
 <textarea
 value={form.description}
 onChange={(event) =>
 setForm((x) => ({ ...x, description: event.target.value }))
 }
 className={textareaClass}
 placeholder="Customer-facing explanation of this promotion."
 />
 </Field>

 <div className="grid gap-3 sm:grid-cols-2">
 <Field label="Discount type" required>
 <select
 value={form.promotion_type}
 disabled={Boolean(editing)}
 onChange={(event) =>
 setForm((x) => ({
 ...x,
 promotion_type: event.target.value as PromotionType,
 }))
 }
 className={inputClass}
 >
 <option value="percentage">Percentage</option>
 <option value="fixed_amount">Fixed amount</option>
 <option value="free_shipping">Free shipping</option>
 <option value="buy_x_get_y">Buy X Get Y</option>
 </select>
 </Field>

 <Field
 label={
 form.promotion_type === "percentage"
 ? "Discount %"
 : "Discount value"
 }
 required={
 !["free_shipping", "buy_x_get_y"].includes(
 form.promotion_type,
 )
 }
 >
 <input
 type="number"
 min={0}
 max={
 form.promotion_type === "percentage" ? 100 : undefined
 }
 step="0.01"
 value={form.discount_value}
 onChange={(event) =>
 setForm((x) => ({
 ...x,
 discount_value: event.target.value,
 }))
 }
 className={inputClass}
 />
 </Field>
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 <Field label="Minimum order amount">
 <input
 type="number"
 min={0}
 value={form.minimum_order_amount}
 onChange={(event) =>
 setForm((x) => ({
 ...x,
 minimum_order_amount: event.target.value,
 }))
 }
 className={inputClass}
 placeholder="Optional"
 />
 </Field>

 <Field label="Maximum discount amount">
 <input
 type="number"
 min={0}
 value={form.maximum_discount_amount}
 onChange={(event) =>
 setForm((x) => ({
 ...x,
 maximum_discount_amount: event.target.value,
 }))
 }
 className={inputClass}
 placeholder="Optional"
 />
 </Field>
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 <Field label="Total usage limit">
 <input
 type="number"
 min={0}
 value={form.usage_limit}
 onChange={(event) =>
 setForm((x) => ({ ...x, usage_limit: event.target.value }))
 }
 className={inputClass}
 placeholder="Unlimited"
 />
 </Field>

 <Field label="Usage per customer">
 <input
 type="number"
 min={1}
 value={form.usage_per_customer}
 onChange={(event) =>
 setForm((x) => ({
 ...x,
 usage_per_customer: event.target.value,
 }))
 }
 className={inputClass}
 placeholder="1"
 />
 </Field>
 </div>
 </section>

 <section className="space-y-4 rounded-xl border border-border p-4 sm:p-5 dark:border-border">
 <div>
 <p className="font-bold text-foreground">
 Schedule & behaviour
 </p>
 <p className="mt-1 text-xs text-muted-foreground">
 Control when and how customers can use the promotion.
 </p>
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 <Field label="Start date / time">
 <input
 type="datetime-local"
 value={form.starts_at}
 onChange={(event) =>
 setForm((x) => ({ ...x, starts_at: event.target.value }))
 }
 className={inputClass}
 />
 </Field>

 <Field label="End date / time">
 <input
 type="datetime-local"
 value={form.ends_at}
 onChange={(event) =>
 setForm((x) => ({ ...x, ends_at: event.target.value }))
 }
 className={inputClass}
 />
 </Field>
 </div>

 <Toggle
 label="Promotion active"
 hint="Inactive promotions cannot be applied at checkout."
 checked={form.is_active}
 onChange={(value) =>
 setForm((x) => ({ ...x, is_active: value }))
 }
 />

 <Toggle
 label="Automatic promotion"
 hint="The backend may apply this without requiring a code when checkout integration is completed."
 checked={form.automatic}
 onChange={(value) =>
 setForm((x) => ({ ...x, automatic: value }))
 }
 />

 <Toggle
 label="Stackable"
 hint="Marks the promotion as eligible to combine with other promotions. Final checkout combination rules remain backend-controlled."
 checked={form.stackable}
 onChange={(value) =>
 setForm((x) => ({ ...x, stackable: value }))
 }
 />

 <div className="rounded-xl border border-primary/25 bg-primary/10 p-4 text-xs leading-5 text-primary">
 <strong>Seller-funded discount:</strong> this promotion reduces the
 seller-controlled amount. Xerin commission remains governed by the
 platform commission engine.
 </div>
 </section>
 </div>

 {!editing && (
 <section className="mt-5 rounded-xl border border-border p-4 sm:p-5 dark:border-border">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <p className="font-bold text-foreground">
 Select products
 </p>
 <p className="mt-1 text-xs text-muted-foreground">
 Only your own products can be targeted. The backend verifies
 ownership again when saving.
 </p>
 </div>
 <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
 {form.product_ids.length} selected
 </span>
 </div>

 <label className="relative mt-4 block">
 <HugeiconsIcon icon={Search01Icon}
 size={16}
 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
 />
 <input
 value={productSearch}
 onChange={(event) => setProductSearch(event.target.value)}
 placeholder="Search your products..."
 className={`${inputClass} pl-10`}
 />
 </label>

 {productsLoading ? (
 <div className="py-8 text-center text-sm text-muted-foreground">
 <Spinner className="mx-auto" />
 <p className="mt-2">Loading your products...</p>
 </div>
 ) : (
 <div className="mt-4 grid max-h-[340px] gap-2 overflow-y-auto sm:grid-cols-2">
 {products.map((product) => {
 const productId = String(product.id);
 const selected = form.product_ids.includes(productId);
 return (
 <button
 type="button"
 key={product.id}
 onClick={() => toggleProduct(productId)}
 className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
 selected
 ? "border-primary/40 bg-primary/10"
 : "border-border hover:border-primary/25 dark:border-border dark:bg-card/[0.03]"
 }`}
 >
 <span
 className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
 selected
 ? "border-[var(--primary)] bg-primary text-primary-foreground"
 : "border-[var(--muted-foreground)]"
 }`}
 >
 {selected && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />}
 </span>
 <span className="min-w-0">
 <span className="block truncate text-sm font-semibold text-foreground">
 {product.name}
 </span>
 <span className="mt-0.5 block truncate text-xs text-muted-foreground">
 {product.sku} · Customer price {money(product.sale_price || product.price)}
 </span>
 </span>
 </button>
 );
 })}

 {!products.length && (
 <div className="col-span-full rounded-xl border border-dashed border-border p-8 text-center">
 <HugeiconsIcon icon={PackageIcon} size={24} className="mx-auto text-muted-foreground" />
 <p className="mt-2 text-sm text-muted-foreground">
 No seller products are available for promotion.
 </p>
 </div>
 )}
 </div>
 )}
 </section>
 )}
 </div>

 <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end dark:border-border">
 <button
 type="button"
 disabled={saving}
 onClick={onClose}
 className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground disabled:opacity-50 dark:border-border /70"
 >
 Cancel
 </button>
 <button
 type="button"
 disabled={saving}
 onClick={onSave}
 className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
 >
 {saving && <Spinner />}
 {saving
 ? "Saving..."
 : editing
 ? "Save Changes"
 : "Create Promotion"}
 </button>
 </div>
 </div>
 </div>
 );
}

function StatusBadge({
 active,
 startsAt,
 endsAt,
}: {
 active: boolean;
 startsAt?: string | null;
 endsAt?: string | null;
}) {
 const now = Date.now();
 const starts = startsAt ? new Date(startsAt).getTime() : null;
 const ends = endsAt ? new Date(endsAt).getTime() : null;

 let label = active ? "Active" : "Inactive";
 let className = active
 ? "border-green-light-4 bg-green-light-6 text-green-dark"
 : "border-border bg-muted text-muted-foreground";

 if (active && starts && starts > now) {
 label = "Scheduled";
 className = "border-primary-200 bg-primary-50 text-primary-700";
 } else if (ends && ends < now) {
 label = "Expired";
 className = "border-yellow-light-2 bg-yellow-light-4 text-yellow-dark-2";
 }

 return (
 <span
 className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${className}`}
 >
 {label}
 </span>
 );
}

function SummaryCard({
 label,
 value,
 icon: Icon,
}: {
 label: string;
 value: number;
 icon: IconSvgElement;
}) {
 return (
 <div className="rounded-xl border border-border bg-muted p-4 dark:border-border dark:bg-card/[0.03]">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-2xl font-bold text-foreground">
 {value}
 </p>
 <p className="mt-1 text-xs font-medium text-muted-foreground /55">
 {label}
 </p>
 </div>
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-primary shadow-sm dark:bg-card/10">
 <HugeiconsIcon icon={Icon} size={16} />
 </span>
 </div>
 </div>
 );
}

function Field({
 label,
 hint,
 required = false,
 children,
}: {
 label: string;
 hint?: string;
 required?: boolean;
 children: React.ReactNode;
}) {
 return (
 <label className="block">
 <span className="mb-1.5 block text-xs font-semibold text-muted-foreground /70">
 {label} {required && <span className="text-destructive">*</span>}
 </span>
 {children}
 {hint && (
 <span className="mt-1.5 block text-[11px] leading-4 text-muted-foreground">
 {hint}
 </span>
 )}
 </label>
 );
}

function Toggle({
 label,
 hint,
 checked,
 onChange,
}: {
 label: string;
 hint: string;
 checked: boolean;
 onChange: (value: boolean) => void;
}) {
 return (
 <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border p-3 dark:border-border">
 <span>
 <span className="block text-sm font-semibold text-foreground /80">
 {label}
 </span>
 <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
 {hint}
 </span>
 </span>
 <input
 type="checkbox"
 checked={checked}
 onChange={(event) => onChange(event.target.checked)}
 className="mt-1 h-4 w-4 accent-[var(--primary)]"
 />
 </label>
 );
}

const inputClass =
 "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-ring/30 dark:border-border ";
const textareaClass =
 "min-h-24 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-ring/30 dark:border-border ";
