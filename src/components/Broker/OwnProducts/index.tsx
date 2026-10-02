"use client";

import { FormEvent, useEffect, useState } from "react";
import { resolveProductImageUrl } from "@/lib/products/adapters";
import { brokersApi } from "@/lib/api/endpoints/brokers";
import { productsApi } from "@/lib/api/endpoints/products";
import type { BrokerProduct } from "@/types/api/broker";
import type { Brand, Category, ListingCurrency } from "@/types/api/product";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Cancel01Icon } from "@hugeicons/core-free-icons";

const emptyForm = {
 name: "",
 description: "",
 category_id: "",
 brand_id: "",
 price: "",
 sale_price: "",
 currency: "TZS",
 weight: "",
 quantity: "1",
 fulfillment_location: "",
};

const input =
 "h-11 w-full rounded-lg border border-border bg-muted px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-primary/30";

const statusStyle: Record<string, string> = {
 approved: "bg-green-100 text-green-700",
 pending_review: "bg-amber-100 text-amber-700",
 rejected: "bg-red-100 text-red-700",
 inactive: "bg-muted text-muted-foreground",
 draft: "bg-muted text-muted-foreground",
};

function countdown(seconds?: number | null) {
 if (seconds == null) return "—";
 const h = Math.floor(seconds / 3600);
 const m = Math.floor((seconds % 3600) / 60);
 return `${h}h ${m}m`;
}

export default function BrokerOwnProducts() {
 const [items, setItems] = useState<BrokerProduct[]>([]);
 const [categories, setCategories] = useState<Category[]>([]);
 const [brands, setBrands] = useState<Brand[]>([]);
 const [currencies, setCurrencies] = useState<ListingCurrency[]>([]);
 const [form, setForm] = useState(emptyForm);
 const [files, setFiles] = useState<File[]>([]);
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState("");
 const [message, setMessage] = useState("");
 const [drawerOpen, setDrawerOpen] = useState(false);

 const load = async () => {
 setError("");
 try {
 const [p, c, b, cu] = await Promise.all([
 brokersApi.products(),
 productsApi.getCategories(),
 productsApi.getBrands(),
 productsApi.getListingCurrencies(),
 ]);
 setItems(p);
 setCategories(c);
 setBrands(b);
 setCurrencies(cu);
 } catch (e) {
 setError(e instanceof Error ? e.message : "Unable to load Broker products");
 }
 };

 useEffect(() => {
 void load();
 }, []);

 useEffect(() => {
 document.body.style.overflow = drawerOpen ? "hidden" : "";
 return () => {
 document.body.style.overflow = "";
 };
 }, [drawerOpen]);

 async function submit(e: FormEvent) {
 e.preventDefault();
 setBusy(true);
 setError("");
 setMessage("");

 try {
 if (!files.length) throw new Error("Choose at least one product image.");

 const created = await brokersApi.createProduct({
 name: form.name,
 description: form.description || null,
 category_id: form.category_id,
 brand_id: form.brand_id || null,
 price: form.price,
 sale_price: form.sale_price || null,
 currency: form.currency,
 weight: form.weight || null,
 quantity: Number(form.quantity),
 fulfillment_location: form.fulfillment_location,
 });

 await brokersApi.uploadProductImages(created.id, files);
 const published = await brokersApi.publishProduct(created.id);

 setForm(emptyForm);
 setFiles([]);
 setDrawerOpen(false);

 setMessage(
 published.status === "approved"
 ? "Product is live. Its 24-hour clock has started."
 : "Product submitted for review. The 24-hour clock starts only after approval.",
 );

 await load();
 } catch (e) {
 setError(e instanceof Error ? e.message : "Unable to create product");
 } finally {
 setBusy(false);
 }
 }

 async function archive(id: string) {
 if (!confirm("Archive this Broker listing?")) return;

 setBusy(true);
 try {
 await brokersApi.archiveProduct(id);
 await load();
 } catch (e) {
 setError(e instanceof Error ? e.message : "Unable to archive product");
 } finally {
 setBusy(false);
 }
 }

 return (
 <div className="space-y-5 pb-20">
 {/* Page header — same pattern as the other dashboards */}
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h1 className="text-xl font-bold text-foreground sm:text-2xl">
 Broker products
 </h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Each approved listing stays live for 24 hours, then archives automatically.
 </p>
 </div>
 <button
 onClick={() => setDrawerOpen(true)}
 className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
 >
 <HugeiconsIcon icon={PlusSignIcon} size={15} />
 Create product
 </button>
 </div>

 {error && (
 <div className="rounded-lg border border-red-light-4 bg-red-light-6 p-3.5 text-sm font-medium text-red-dark">
 {error}
 </div>
 )}

 {message && (
 <div className="rounded-lg border border-green-light-4 bg-green-light-6 p-3.5 text-sm font-medium text-green-dark">
 {message}
 </div>
 )}

 {/* Products — simple dashboard table */}
 <div className="overflow-hidden rounded-xl border border-border bg-card">
 {!items.length ? (
 <div className="px-6 py-12 text-center">
 <p className="font-semibold text-foreground">No Broker products yet</p>
 <p className="mt-1 text-sm text-muted-foreground">
 Create your first listing to start selling.
 </p>
 <button
 onClick={() => setDrawerOpen(true)}
 className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
 >
 Create product
 </button>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[720px] text-sm">
 <thead>
 <tr className="border-b border-border bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
 <th className="px-4 py-3">Product</th>
 <th className="px-4 py-3">Status</th>
 <th className="px-4 py-3">Price</th>
 <th className="px-4 py-3">Stock</th>
 <th className="px-4 py-3">Time left</th>
 <th className="px-4 py-3 text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {items.map((p) => (
 <tr key={p.id} className="transition hover:bg-muted/40">
 <td className="px-4 py-3">
 <div className="flex items-center gap-3">
 <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
 {p.images?.[0] ? (
 <img
 src={resolveProductImageUrl(
 p.images[0].thumbnail_url || p.images[0].image_url,
 )}
 alt={p.name}
 className="h-full w-full object-cover"
 />
 ) : (
 <span className="text-xs text-muted-foreground">—</span>
 )}
 </span>
 <span className="min-w-0">
 <span className="block truncate font-semibold text-foreground">
 {p.name}
 </span>
 {p.rejection_reason && (
 <span className="block truncate text-xs text-destructive">
 {p.rejection_reason}
 </span>
 )}
 </span>
 </div>
 </td>
 <td className="px-4 py-3">
 <span
 className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusStyle[p.status] || statusStyle.draft}`}
 >
 {p.status.replace("_", " ")}
 </span>
 </td>
 <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
 {p.currency} {Number(p.sale_price || p.price).toLocaleString()}
 </td>
 <td className="px-4 py-3 text-muted-foreground">
 {p.available_quantity}/{p.quantity}
 </td>
 <td className="px-4 py-3 text-muted-foreground">
 {p.status === "approved" && p.is_active
 ? countdown(p.seconds_remaining)
 : "—"}
 </td>
 <td className="px-4 py-3 text-right">
 {p.is_active && p.status !== "pending_review" && (
 <button
 disabled={busy}
 onClick={() => void archive(p.id)}
 className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
 >
 Archive
 </button>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Create drawer */}
 {drawerOpen && (
 <div className="fixed inset-0 z-[90]">
 <div
 className="absolute inset-0 bg-black/50"
 onClick={() => !busy && setDrawerOpen(false)}
 />
 <aside
 role="dialog"
 aria-modal="true"
 aria-label="Create Broker product"
 className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-card shadow-2xl"
 >
 <header className="flex items-center justify-between border-b border-border px-5 py-4">
 <div>
 <h2 className="text-base font-bold text-foreground">
 Create Broker product
 </h2>
 <p className="text-xs text-muted-foreground">
 Listings stay live for 24 hours after approval.
 </p>
 </div>
 <button
 type="button"
 onClick={() => !busy && setDrawerOpen(false)}
 aria-label="Close"
 className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={18} />
 </button>
 </header>

 <form onSubmit={submit} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
 <Field label="Product name" required>
 <input
 required
 value={form.name}
 onChange={(e) => setForm({ ...form, name: e.target.value })}
 className={input}
 placeholder="e.g. Wireless Speaker X200"
 />
 </Field>

 <div className="grid gap-4 sm:grid-cols-2">
 <Field label="Category" required>
 <select
 required
 value={form.category_id}
 onChange={(e) => setForm({ ...form, category_id: e.target.value })}
 className={input}
 >
 <option value="">Select category</option>
 {categories.map((x) => (
 <option key={x.id} value={String(x.id)}>{x.name}</option>
 ))}
 </select>
 </Field>

 <Field label="Brand (optional)">
 <select
 value={form.brand_id}
 onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
 className={input}
 >
 <option value="">No brand</option>
 {brands.map((x) => (
 <option key={x.id} value={String(x.id)}>{x.name}</option>
 ))}
 </select>
 </Field>
 </div>

 <div className="grid gap-4 sm:grid-cols-3">
 <Field label="Currency">
 <select
 value={form.currency}
 onChange={(e) => setForm({ ...form, currency: e.target.value })}
 className={input}
 >
 {currencies.map((x) => (
 <option key={x.code} value={x.code}>{x.code}</option>
 ))}
 </select>
 </Field>
 <Field label="Price" required>
 <input
 required
 min="1"
 type="number"
 value={form.price}
 onChange={(e) => setForm({ ...form, price: e.target.value })}
 className={input}
 />
 </Field>
 <Field label="Sale price">
 <input
 min="0"
 type="number"
 value={form.sale_price}
 onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
 className={input}
 />
 </Field>
 </div>

 <div className="grid gap-4 sm:grid-cols-2">
 <Field label="Stock quantity" required>
 <input
 required
 min="1"
 type="number"
 value={form.quantity}
 onChange={(e) => setForm({ ...form, quantity: e.target.value })}
 className={input}
 />
 </Field>
 <Field label="Weight (kg)">
 <input
 min="0"
 step="0.01"
 type="number"
 value={form.weight}
 onChange={(e) => setForm({ ...form, weight: e.target.value })}
 className={input}
 />
 </Field>
 </div>

 <Field label="Pickup / fulfillment location" required>
 <input
 required
 value={form.fulfillment_location}
 onChange={(e) => setForm({ ...form, fulfillment_location: e.target.value })}
 placeholder="e.g. Mikocheni, Dar es Salaam"
 className={input}
 />
 </Field>

 <Field label="Product images" required>
 <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted px-4 py-5 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
 <HugeiconsIcon icon={PlusSignIcon} size={15} />
 {files.length
 ? `${files.length} image(s) selected`
 : "Choose images (JPEG, PNG, WEBP)"}
 <input
 required={!files.length}
 multiple
 accept="image/jpeg,image/png,image/webp"
 type="file"
 onChange={(e) => setFiles(Array.from(e.target.files || []))}
 className="hidden"
 />
 </label>
 </Field>

 <Field label="Description">
 <textarea
 rows={4}
 value={form.description}
 onChange={(e) => setForm({ ...form, description: e.target.value })}
 className={`${input} h-auto py-3`}
 placeholder="Key details buyers should know"
 />
 </Field>

 <div className="sticky bottom-0 -mx-5 border-t border-border bg-card px-5 py-4">
 <button
 disabled={busy}
 className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
 >
 {busy ? "Publishing…" : "Create & publish"}
 </button>
 </div>
 </form>
 </aside>
 </div>
 )}
 </div>
 );
}

function Field({
 label,
 required,
 children,
}: {
 label: string;
 required?: boolean;
 children: React.ReactNode;
}) {
 return (
 <label className="block">
 <span className="mb-1.5 block text-sm font-medium text-foreground">
 {label}
 {required && <span className="ml-0.5 text-destructive">*</span>}
 </span>
 {children}
 </label>
 );
}
