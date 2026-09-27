"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { resolveProductImageUrl } from "@/lib/products/adapters";
import { brokersApi } from "@/lib/api/endpoints/brokers";
import { productsApi } from "@/lib/api/endpoints/products";
import type { BrokerProduct } from "@/types/api/broker";
import type { Brand, Category, ListingCurrency } from "@/types/api/product";
import { HugeiconsIcon } from "@hugeicons/react";
import {
 PlusSignIcon,
 Cancel01Icon,
 PackageIcon,
 PercentCircleIcon,
 Timer01Icon,
} from "@hugeicons/core-free-icons";

const ACCENT = "#C6922E"; // Winga gold

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

 // Lock body scroll while the drawer is open.
 useEffect(() => {
 document.body.style.overflow = drawerOpen ? "hidden" : "";
 return () => {
 document.body.style.overflow = "";
 };
 }, [drawerOpen]);

 const active = useMemo(
 () => items.filter((x) => x.status === "approved" && x.is_active).length,
 [items],
 );

 const expired = useMemo(
 () =>
 items.filter(
 (x) => x.listing_expired_at || (!x.is_active && x.status === "inactive"),
 ).length,
 [items],
 );

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
 : "Product submitted for marketplace review. The 24-hour clock starts only after approval.",
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
 <div className="space-y-6 pb-20">
 {/* Hero */}
 <section
 className="rounded-2xl p-6 text-white shadow-sm sm:p-8"
 style={{ background: `linear-gradient(135deg, #1a1408 0%, #2a2110 55%, ${ACCENT}22 100%)`, backgroundColor: "#20180a" }}
 >
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
 Sell your own product
 </p>
 <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
 24-hour Broker listings
 </h1>
 <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
 Create products you own. Once approved and public, each listing
 stays live for exactly 24 hours, then Xerin archives it automatically.
 </p>
 </div>
 <button
 onClick={() => setDrawerOpen(true)}
 className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
 style={{ backgroundColor: ACCENT }}
 >
 <HugeiconsIcon icon={PlusSignIcon} size={16} />
 Create product
 </button>
 </div>

 <div className="mt-6 grid grid-cols-3 gap-3">
 <Stat n={items.length} l="All listings" />
 <Stat n={active} l="Live now" />
 <Stat n={expired} l="Expired" />
 </div>
 </section>

 {error && (
 <div className="rounded-xl border border-red-light-4 bg-red-light-6 p-4 text-sm font-semibold text-red-dark">
 {error}
 </div>
 )}

 {message && (
 <div className="rounded-xl border border-green-light-4 bg-green-light-6 p-4 text-sm font-semibold text-green-dark">
 {message}
 </div>
 )}

 {/* Product list */}
 <section>
 <div className="mb-4 flex items-center justify-between">
 <h2 className="text-lg font-bold text-foreground">Your Broker products</h2>
 <span className="text-xs font-medium text-muted-foreground">
 {items.length} total
 </span>
 </div>

 {!items.length ? (
 <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
 <span
 className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white"
 style={{ backgroundColor: `${ACCENT}` }}
 >
 <HugeiconsIcon icon={PackageIcon} size={26} />
 </span>
 <p className="font-bold text-foreground">No Broker products yet</p>
 <p className="mt-1 max-w-sm text-sm text-muted-foreground">
 Create your first 24-hour listing — it goes live after a quick review.
 </p>
 <button
 onClick={() => setDrawerOpen(true)}
 className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
 style={{ backgroundColor: ACCENT }}
 >
 <HugeiconsIcon icon={PlusSignIcon} size={15} />
 Create product
 </button>
 </div>
 ) : (
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
 {items.map((p) => (
 <article
 key={p.id}
 className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md"
 >
 <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
 {p.images?.[0] ? (
 <img
 src={resolveProductImageUrl(p.images[0].thumbnail_url || p.images[0].image_url)}
 alt={p.name}
 className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
 />
 ) : (
 <div className="flex h-full items-center justify-center text-muted-foreground">
 <HugeiconsIcon icon={PackageIcon} size={32} />
 </div>
 )}
 <span
 className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyle[p.status] || statusStyle.draft}`}
 >
 {p.status.replace("_", " ")}
 </span>
 </div>

 <div className="p-4">
 <h3 className="truncate font-bold text-foreground">{p.name}</h3>
 <p className="mt-1 text-sm font-semibold" style={{ color: ACCENT }}>
 {p.currency} {Number(p.sale_price || p.price).toLocaleString()}
 </p>
 <p className="mt-0.5 text-xs text-muted-foreground">
 Stock {p.available_quantity}/{p.quantity}
 {p.status === "approved" && p.is_active ? ` · ${countdown(p.seconds_remaining)} left` : ""}
 </p>

 {p.rejection_reason && (
 <p className="mt-2 text-xs font-semibold text-destructive">
 Reason: {p.rejection_reason}
 </p>
 )}

 {p.is_active && p.status !== "pending_review" && (
 <button
 disabled={busy}
 onClick={() => void archive(p.id)}
 className="mt-3 w-full rounded-lg border border-border py-2 text-xs font-bold text-foreground transition hover:bg-muted disabled:opacity-50"
 >
 Archive listing
 </button>
 )}
 </div>
 </article>
 ))}
 </div>
 )}
 </section>

 {/* Create drawer */}
 {drawerOpen && (
 <div className="fixed inset-0 z-[90]">
 <div
 className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
 onClick={() => !busy && setDrawerOpen(false)}
 />
 <aside
 role="dialog"
 aria-modal="true"
 aria-label="Create Broker product"
 className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-card shadow-2xl"
 >
 <header className="flex items-center justify-between border-b border-border px-5 py-4">
 <div>
 <h2 className="text-lg font-bold text-foreground">Create Broker product</h2>
 <p className="text-xs text-muted-foreground">
 Listings go live for 24 hours after approval.
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
 <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted px-4 py-6 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
 <HugeiconsIcon icon={PlusSignIcon} size={16} />
 {files.length ? `${files.length} image(s) selected` : "Choose images (JPEG, PNG, WEBP)"}
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
 className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
 style={{ backgroundColor: ACCENT }}
 >
 {busy ? "Publishing…" : (
 <>
 <HugeiconsIcon icon={Timer01Icon} size={16} />
 Create &amp; publish for 24h
 </>
 )}
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
 {required && <span className="ml-0.5" style={{ color: ACCENT }}>*</span>}
 </span>
 {children}
 </label>
 );
}

function Stat({ n, l }: { n: number; l: string }) {
 return (
 <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm">
 <div className="text-2xl font-extrabold text-white">{n}</div>
 <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/60">
 {l}
 </div>
 </div>
 );
}
