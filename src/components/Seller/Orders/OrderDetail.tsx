"use client";


import { Spinner } from "@/components/ui/Spinner";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, PackageIcon, CheckmarkCircle02Icon, ImageAdd01Icon, Image01Icon, ViewIcon, Layers01Icon, ShoppingBag01Icon, SparklesIcon, Location01Icon, RulerIcon, JusticeScale01Icon, PackageOpenIcon, Edit01Icon, Delete02Icon, Chatting01Icon, PackageCheckIcon, RefreshCwIcon, SentIcon, TruckIcon, CancelCircleIcon } from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";

import { API_BASE_URL } from "@/lib/api/endpoints";
import { sellerOrdersApi } from "@/lib/api/endpoints/seller-orders";
import { getMyProductImages, getProduct, getProductVariants } from "@/lib/api/endpoints/products";
import type { Product, ProductVariant } from "@/types/api/product";
import type {
 SellerOrder,
 SellerOrderMessage,
 SellerOrderPackage,
 SellerFulfillmentReadiness,
 ShipmentHandover,
} from "@/types/api/seller-order";
import { Badge } from "./index";

const money = (value: number | string, currency = "TZS") =>
 new Intl.NumberFormat("en-TZ", {
 style: "currency",
 currency,
 maximumFractionDigits: 0,
 }).format(Number(value || 0));


const resolveProductImageUrl = (imageUrl?: string | null) => {
 if (!imageUrl) return "";

 if (
 imageUrl.startsWith("data:") ||
 imageUrl.startsWith("blob:")
 ) {
 return imageUrl;
 }

 // When using the same-origin Next.js API proxy, mirror the existing
 // storefront behavior for backend product uploads.
 if (API_BASE_URL.startsWith("/")) {
 if (imageUrl.startsWith("/uploads/")) {
 return imageUrl.replace(/^\/uploads\//, "/backend-uploads/");
 }

 if (imageUrl.startsWith("uploads/")) {
 return `/backend-uploads/${imageUrl.replace(/^uploads\//, "")}`;
 }

 return imageUrl;
 }

 try {
 const apiUrl = new URL(API_BASE_URL);
 const apiOrigin = apiUrl.origin;

 // Product images are served from the API host root, not /api/v1.
 if (imageUrl.startsWith("/uploads/")) {
 return `${apiOrigin}${imageUrl}`;
 }

 if (imageUrl.startsWith("uploads/")) {
 return `${apiOrigin}/${imageUrl}`;
 }

 // Repair older absolute URLs that contain /api/v1/uploads/.
 if (
 imageUrl.startsWith("http://") ||
 imageUrl.startsWith("https://")
 ) {
 const absolute = new URL(imageUrl);

 if (absolute.pathname.startsWith("/api/v1/uploads/")) {
 absolute.pathname = absolute.pathname.replace(
 /^\/api\/v1\/uploads\//,
 "/uploads/",
 );
 }

 return absolute.toString();
 }

 return `${apiOrigin}/${imageUrl.replace(/^\//, "")}`;
 } catch {
 return imageUrl;
 }
};

const errorMessage = (error: unknown) => {
 const candidate = error as {
 response?: { data?: { detail?: string | { message?: string; blockers?: string[] } } };
 message?: string;
 };
 const detail = candidate.response?.data?.detail;
 return (typeof detail === "string" ? detail : detail?.message) || candidate.message || "Request failed";
};

export default function SellerOrderDetail({ orderId }: { orderId: string }) {
 const [order, setOrder] = useState<SellerOrder | null>(null);
 const [productImages, setProductImages] = useState<Record<string, string>>({});
 const [productDetails, setProductDetails] = useState<Record<string, Product>>({});
 const [productVariants, setProductVariants] = useState<Record<string, ProductVariant[]>>({});
 const [productDetailItemId, setProductDetailItemId] = useState<string | null>(null);
 const [loading, setLoading] = useState(true);
 const [busy, setBusy] = useState(false);
 const [notes, setNotes] = useState("");

 const [packageInfo, setPackageInfo] = useState<SellerOrderPackage | null>(null);
 const [packageLoading, setPackageLoading] = useState(true);
 const [packageSaving, setPackageSaving] = useState(false);
 const [packageEditorOpen, setPackageEditorOpen] = useState(false);
 const [packageForm, setPackageForm] = useState({
 weight_kg: "",
 length_cm: "",
 width_cm: "",
 height_cm: "",
 package_count: "1",
 notes: "",
 is_ready: false,
 attachment_urls: [] as string[],
 });
 const [packageEvidenceUploading, setPackageEvidenceUploading] = useState(false);
 const [readiness, setReadiness] = useState<SellerFulfillmentReadiness | null>(null);
 const [readinessLoading, setReadinessLoading] = useState(true);
 const [readinessError, setReadinessError] = useState("");
 const [handover, setHandover] = useState<ShipmentHandover | null>(null);
 const [handoverLoading, setHandoverLoading] = useState(false);
 const [handoverError, setHandoverError] = useState("");
 const [handoverNotes, setHandoverNotes] = useState("");
 const [confirmingHandover, setConfirmingHandover] = useState(false);

 const [messages, setMessages] = useState<SellerOrderMessage[]>([]);
 const [messagesLoading, setMessagesLoading] = useState(true);
 const [sendingMessage, setSendingMessage] = useState(false);
 const [messageText, setMessageText] = useState("");
 const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
 const [attachmentDraft, setAttachmentDraft] = useState("");

 const loadOrderImages = async (value: SellerOrder) => {
 const ids = Array.from(new Set(value.items.map((item) => item.product_id)));

 const rows = await Promise.all(
 ids.map(async (productId) => {
 let product: Product | null = null;
 let variants: ProductVariant[] = [];
 let imageUrl = "";

 try {
 product = await getProduct(productId);
 const primary =
 product.images?.find((image) => image.is_primary) ||
 product.images?.[0];
 imageUrl = resolveProductImageUrl(
 primary?.image_url || primary?.thumbnail_url || "",
 );
 } catch {
 // The seller-owned image endpoint below is the fallback source.
 }

 try {
 const sellerImages = await getMyProductImages(productId);
 const primary =
 sellerImages.find((image) => image.is_primary) || sellerImages[0];
 imageUrl =
 imageUrl ||
 resolveProductImageUrl(
 primary?.image_url || primary?.thumbnail_url || "",
 );
 } catch {
 // Keep the public product image if available.
 }

 try {
 variants = await getProductVariants(productId);
 } catch {
 variants = [];
 }

 return { productId, product, variants, imageUrl };
 }),
 );

 setProductImages(
 Object.fromEntries(rows.map((row) => [row.productId, row.imageUrl])),
 );
 setProductDetails(
 Object.fromEntries(
 rows
 .filter((row) => row.product)
 .map((row) => [row.productId, row.product as Product]),
 ),
 );
 setProductVariants(
 Object.fromEntries(rows.map((row) => [row.productId, row.variants])),
 );
 };

 const load = async () => {
 setLoading(true);
 try {
 const value = await sellerOrdersApi.get(orderId);
 setOrder(value);
 void loadOrderImages(value);
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setLoading(false);
 }
 };

 const syncPackageForm = (value: SellerOrderPackage | null) => {
 setPackageForm({
 weight_kg: value?.weight_kg == null ? "" : String(value.weight_kg),
 length_cm: value?.length_cm == null ? "" : String(value.length_cm),
 width_cm: value?.width_cm == null ? "" : String(value.width_cm),
 height_cm: value?.height_cm == null ? "" : String(value.height_cm),
 package_count: String(value?.package_count || 1),
 notes: value?.notes || "",
 is_ready: Boolean(value?.is_ready),
 attachment_urls: value?.attachments?.map((item) => item.file_url) || [],
 });
 };

 const loadPackage = async () => {
 setPackageLoading(true);
 try {
 const value = await sellerOrdersApi.package(orderId);
 setPackageInfo(value);
 syncPackageForm(value);
 } catch (error) {
 const candidate = error as { response?: { status?: number } };
 if (candidate.response?.status === 404) {
 setPackageInfo(null);
 syncPackageForm(null);
 } else {
 toast.error(errorMessage(error));
 }
 } finally {
 setPackageLoading(false);
 }
 };

 const loadReadiness = async () => {
 setReadinessLoading(true);
 setReadinessError("");
 try {
 setReadiness(await sellerOrdersApi.readiness(orderId));
 } catch (error) {
 setReadinessError(errorMessage(error));
 } finally {
 setReadinessLoading(false);
 }
 };

 const loadHandover = async (silent = false) => {
 if (!silent) setHandoverLoading(true);
 setHandoverError("");
 try {
 setHandover(await sellerOrdersApi.handover(orderId));
 } catch (error) {
 const candidate = error as { response?: { status?: number } };
 if (candidate.response?.status === 404 || candidate.response?.status === 409) {
 setHandover(null);
 } else {
 setHandoverError(errorMessage(error));
 }
 } finally {
 if (!silent) setHandoverLoading(false);
 }
 };

 const confirmHandover = async () => {
 if (handover?.status !== "courier_arrived") {
 toast.error("Wait until the assigned logistics company confirms the courier has arrived.");
 return;
 }

 setConfirmingHandover(true);
 try {
 const confirmed = await sellerOrdersApi.confirmHandover(orderId, {
 notes: handoverNotes.trim() || null,
 });
 setHandover(confirmed);
 setHandoverNotes("");
 toast.success("Physical product handover confirmed. Logistics can now record pickup proof.");
 void load();
 } catch (error) {
 toast.error(errorMessage(error));
 void loadHandover(true);
 } finally {
 setConfirmingHandover(false);
 }
 };

 const openPackageEditor = () => {
 syncPackageForm(packageInfo);
 setPackageEditorOpen(true);
 };

 const uploadPackageEvidence = async (files: FileList | null) => {
 if (!files?.length) return;

 const remaining = Math.max(0, 10 - packageForm.attachment_urls.length);
 if (remaining === 0) {
 toast.error("A maximum of 10 packaging evidence photos is allowed.");
 return;
 }

 const selected = Array.from(files).slice(0, remaining);
 const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
 const invalid = selected.find(
 (file) => !allowedTypes.has(file.type) || file.size > 10 * 1024 * 1024,
 );
 if (invalid) {
 toast.error("Evidence photos must be JPG, PNG or WEBP and no larger than 10 MB each.");
 return;
 }

 setPackageEvidenceUploading(true);
 try {
 const uploadedUrls: string[] = [];
 for (const file of selected) {
 const uploaded = await sellerOrdersApi.uploadPackageEvidence(orderId, file);
 uploadedUrls.push(uploaded.file_url);
 }
 setPackageForm((current) => ({
 ...current,
 attachment_urls: [...current.attachment_urls, ...uploadedUrls],
 }));
 toast.success(
 `${uploadedUrls.length} packaging evidence photo${uploadedUrls.length === 1 ? "" : "s"} uploaded.`,
 );
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setPackageEvidenceUploading(false);
 }
 };

 const savePackage = async () => {
 const count = Number(packageForm.package_count);
 const weight = packageForm.weight_kg ? Number(packageForm.weight_kg) : null;
 const length = packageForm.length_cm ? Number(packageForm.length_cm) : null;
 const width = packageForm.width_cm ? Number(packageForm.width_cm) : null;
 const height = packageForm.height_cm ? Number(packageForm.height_cm) : null;

 if (!Number.isInteger(count) || count <= 0) {
 toast.error("Package count must be at least 1.");
 return;
 }

 for (const [label, value] of [
 ["Weight", weight],
 ["Length", length],
 ["Width", width],
 ["Height", height],
 ] as const) {
 if (value !== null && (!Number.isFinite(value) || value < 0)) {
 toast.error(`${label} must be zero or greater.`);
 return;
 }
 }

 if (packageForm.is_ready && (weight === null || weight <= 0)) {
 toast.error("Enter package weight before confirming Ready for Pickup.");
 return;
 }

 setPackageSaving(true);
 try {
 const saved = await sellerOrdersApi.savePackage(orderId, {
 weight_kg: weight,
 length_cm: length,
 width_cm: width,
 height_cm: height,
 package_count: count,
 notes: packageForm.notes.trim() || null,
 is_ready: packageForm.is_ready,
 attachment_urls: packageForm.attachment_urls,
 });

 setPackageInfo(saved);
 syncPackageForm(saved);
 setPackageEditorOpen(false);
 toast.success(
 saved.is_ready
 ? "Package confirmed and ready for pickup."
 : "Package details saved as a draft.",
 );
 void loadReadiness();
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setPackageSaving(false);
 }
 };

 const loadMessages = async () => {
 setMessagesLoading(true);
 try {
 setMessages(await sellerOrdersApi.messages(orderId));
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setMessagesLoading(false);
 }
 };

 useEffect(() => {
 void load();
 void loadMessages();
 void loadPackage();
 void loadReadiness();
 void loadHandover();
 }, [orderId]);

 const run = async (fn: () => Promise<SellerOrder>, message: string) => {
 setBusy(true);
 try {
 setOrder(await fn());
 void loadReadiness();
 void loadHandover(true);
 toast.success(message);
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setBusy(false);
 }
 };

 const cancel = async () => {
 const reason = prompt("Reason for cancellation request:");
 if (!reason) return;

 await run(
 () => sellerOrdersApi.cancel(orderId, reason, notes),
 "Cancellation requested",
 );
 };

 const addAttachmentUrl = () => {
 const value = attachmentDraft.trim();
 if (!value) return;
 if (attachmentUrls.length >= 10) {
 toast.error("A maximum of 10 attachment URLs is allowed per message.");
 return;
 }
 setAttachmentUrls((current) => [...current, value]);
 setAttachmentDraft("");
 };

 const sendMessage = async () => {
 const message = messageText.trim();
 if (!message) {
 toast.error("Enter a message first.");
 return;
 }

 setSendingMessage(true);
 try {
 const created = await sellerOrdersApi.sendMessage(orderId, {
 message,
 is_internal: false,
 attachment_urls: attachmentUrls,
 });

 setMessages((current) => [...current, created]);
 setMessageText("");
 setAttachmentUrls([]);
 setAttachmentDraft("");
 toast.success("Message sent.");
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setSendingMessage(false);
 }
 };

 useEffect(() => {
 if (order?.seller_status !== "ready_to_ship" || handover?.status !== "awaiting_courier") return;

 const timer = window.setInterval(() => {
 void loadHandover(true);
 }, 15000);

 return () => window.clearInterval(timer);
 }, [order?.seller_status, handover?.status, orderId]);

 const orderedMessages = useMemo(
 () =>
 [...messages].sort(
 (a, b) =>
 new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
 ),
 [messages],
 );

 const productDetailItem =
 order?.items.find((item) => item.id === productDetailItemId) || null;
 const productDetailProduct = productDetailItem
 ? productDetails[productDetailItem.product_id]
 : undefined;
 const productDetailVariant = productDetailItem
 ? (productVariants[productDetailItem.product_id] || []).find(
 (variant) => variant.id === productDetailItem.variant_id,
 )
 : undefined;

 if (loading) {
 return (
 <div className="p-14 text-center text-muted-foreground">
 <Spinner className="mx-auto" />
 <p className="mt-2">Loading order...</p>
 </div>
 );
 }

 if (!order) {
 return (
 <div className="rounded-xl border bg-card p-8">
 Seller order could not be loaded.
 </div>
 );
 }

 const status = order.seller_status;

 return (
 <div className="space-y-5">
 <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm dark:border-border dark:bg-card sm:flex-row sm:items-center sm:justify-between">
 <div>
 <Link
 href="/seller/orders"
 className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"
 >
 <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
 Back to orders
 </Link>

 <h1 className="mt-3 text-2xl font-bold">
 Order #{order.order_id.slice(0, 8)}
 </h1>

 <div className="mt-2">
 <Badge status={status} />
 </div>
 </div>

 <div className="text-right">
 <p className="text-xs text-muted-foreground">Seller subtotal</p>
 <p className="text-2xl font-bold text-primary">
 {money(order.seller_subtotal, order.currency)}
 </p>
 </div>
 </div>

 {order.order_status === "paid" && (
 <section className="rounded-xl border border-green-light-4 bg-green-light-6 p-5 text-emerald-900 shadow-sm">
 <div className="flex items-start gap-3">
 <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-light-5 text-green-dark">
 <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
 </span>
 <div>
 <p className="font-bold">Customer payment confirmed · review the products before packaging</p>
 <p className="mt-1 text-sm leading-6 text-emerald-800/80">
 Verify the product image, variant and quantity below. Accept the order only when the paid items match what you will prepare for pickup.
 </p>
 </div>
 </div>
 </section>
 )}

 <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
 <div className="space-y-5">
 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card">
 <div className="border-b border-primary-100 bg-muted px-5 py-5 dark:border-primary-500/20 sm:px-6">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-start gap-3">
 <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
 <HugeiconsIcon icon={ShoppingBag01Icon} size={20} />
 </span>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-primary">
 Paid product review
 </p>
 {order.order_status === "paid" && (
 <span className="rounded-full bg-green-light-5 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-green-dark">
 Payment verified
 </span>
 )}
 </div>
 <h2 className="mt-1 text-xl font-extrabold text-foreground">
 Products the customer bought
 </h2>
 <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground /55">
 Verify the exact product, selected variant and quantity before accepting, packaging or handing the order to logistics.
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 rounded-xl border border-primary-100 bg-card px-4 py-3 shadow-sm dark:border-border">
 <HugeiconsIcon icon={Layers01Icon} size={16} className="text-primary" />
 <div>
 <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Total units</p>
 <p className="text-base font-extrabold text-foreground">
 {order.item_count}
 </p>
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-4 p-5 sm:p-6">
 {order.items.map((item) => {
 const product = productDetails[item.product_id];
 const variant = (productVariants[item.product_id] || []).find(
 (row) => row.id === item.variant_id,
 );
 const attributes = variant?.attributes
 ? Object.entries(variant.attributes).filter(
 ([, value]) => value !== null && value !== undefined && String(value).trim() !== "",
 )
 : [];

 return (
 <article
 key={item.id}
 className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/25 hover:shadow-sm dark:border-border"
 >
 <div className="grid min-w-0 gap-0 md:grid-cols-[190px_minmax(0,1fr)]">
 <div className="relative min-h-[190px] border-b border-border bg-muted p-4 dark:border-border dark:bg-black/10 md:border-b-0 md:border-r">
 <OrderProductImage
 src={productImages[item.product_id]}
 alt={item.product_name}
 large
 />
 <span className="absolute left-5 top-5 rounded-full bg-card/95 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-green-dark shadow-sm backdrop-blur dark:bg-card/60">
 Paid item
 </span>
 </div>

 <div className="min-w-0 p-5">
 <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
 <div className="min-w-0">
 <p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">
 Customer selected
 </p>
 <h3 className="mt-1 text-xl font-extrabold leading-tight text-foreground">
 {item.product_name}
 </h3>

 <div className="mt-3 flex flex-wrap gap-2">
 <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary dark:bg-primary/10 dark:text-primary-300">
 <HugeiconsIcon icon={SparklesIcon} size={14} />
 {item.variant_name || variant?.variant_name || "Standard"}
 </span>
 <span className="rounded-xl bg-muted px-3 py-2 text-xs font-bold text-accent-foreground /70">
 Qty {item.quantity}
 </span>
 {(variant?.sku || product?.sku) && (
 <span className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground dark:border-border /50">
 SKU {variant?.sku || product?.sku}
 </span>
 )}
 </div>

 {attributes.length > 0 && (
 <div className="mt-3 flex flex-wrap gap-2">
 {attributes.slice(0, 4).map(([key, value]) => (
 <span
 key={key}
 className="rounded-lg border border-primary-100 bg-primary-50/70 px-2.5 py-1.5 text-[11px] font-semibold text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-300"
 >
 {prettyLabel(key)}: {formatAttributeValue(value)}
 </span>
 ))}
 </div>
 )}

 <p className="mt-4 line-clamp-2 max-w-2xl text-xs leading-5 text-muted-foreground /50">
 {product?.description ||
 "Open Product Details to review the complete product listing and selected configuration before packing."}
 </p>
 </div>

 <div className="grid shrink-0 grid-cols-2 gap-2 xl:w-[250px]">
 <div className="rounded-xl bg-muted p-3">
 <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
 Unit price
 </p>
 <p className="mt-1 text-sm font-extrabold text-foreground">
 {money(item.unit_price, order.currency)}
 </p>
 </div>
 <div className="rounded-xl bg-primary/10 p-3 dark:bg-primary/10">
 <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--warning)]">
 Line total
 </p>
 <p className="mt-1 text-sm font-extrabold text-primary dark:text-primary-300">
 {money(item.total_price, order.currency)}
 </p>
 </div>
 </div>
 </div>

 <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4 dark:border-border">
 <button
 type="button"
 onClick={() => {
 setProductDetailItemId(item.id);
 }}
 className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-bold text-background shadow-sm transition hover:bg-primary dark:hover:bg-primary dark:hover:text-background"
 >
 <HugeiconsIcon icon={ViewIcon} size={16} />
 View Product Details
 </button>

 <Link
 href={`/products/${item.product_id}`}
 target="_blank"
 className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-muted-foreground transition hover:border-primary/25 hover:text-primary dark:border-border /60"
 >
 Open marketplace listing
 </Link>

 <span className="ml-auto hidden text-[11px] font-medium text-muted-foreground lg:inline">
 Verify variant before packaging
 </span>
 </div>
 </div>
 </div>
 </article>
 );
 })}
 </div>
 </section>

 <section className="rounded-xl border bg-card p-4 dark:border-border dark:bg-card sm:p-5">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
 <div>
 <h2 className="flex items-center gap-2 font-bold"><HugeiconsIcon icon={PackageCheckIcon} size={18} />Fulfillment readiness</h2>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">Every blocking requirement must pass before Ready to Ship is accepted.</p>
 </div>
 <button type="button" onClick={() => void loadReadiness()} disabled={readinessLoading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold dark:border-border">{readinessLoading ? <Spinner /> : <HugeiconsIcon icon={RefreshCwIcon} size={14} />}Refresh checks</button>
 </div>

 {readinessLoading ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div> : readinessError ? <div className="mt-4 rounded-xl border border-red-light-4 bg-red-light-6 p-4 text-sm text-red-dark"><b>Readiness check unavailable.</b><p className="mt-1 break-words text-xs">{readinessError}</p></div> : readiness ? <>
 <div className={`mt-4 rounded-xl border p-4 ${readiness.ready_to_ship ? "border-green-light-4 bg-green-light-6 text-emerald-800" : "border-yellow-light-2 bg-yellow-light-4 text-yellow-dark-2"}`}><p className="font-bold">{readiness.ready_to_ship ? "All blocking checks passed" : `${readiness.blockers.length} requirement${readiness.blockers.length === 1 ? "" : "s"} still blocking`}</p><p className="mt-1 text-xs leading-5">{readiness.ready_to_ship ? "This seller order can now be marked Ready to Ship." : "Complete the failed items below, then refresh the checklist."}</p></div>
 <div className="mt-3 grid gap-2 sm:grid-cols-2">{readiness.checks.map((check) => <div key={check.code} className={`flex min-h-16 items-start gap-3 rounded-xl border p-3 ${check.ready ? "border-emerald-100 bg-green-light-6/60" : check.blocking ? "border-border bg-red-light-6/60" : "border-amber-100 bg-yellow-light-4/60"}`}>
 {check.ready ? <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mt-0.5 shrink-0 text-green-dark" size={18} /> : <HugeiconsIcon icon={CancelCircleIcon} className={`mt-0.5 shrink-0 ${check.blocking ? "text-destructive" : "text-amber-500"}`} size={18} />}
 <div className="min-w-0"><p className="text-sm font-semibold text-foreground">{check.label}</p>{check.detail && <p className="mt-0.5 break-words text-xs leading-5 text-muted-foreground">{check.detail}</p>}{!check.blocking && !check.ready && <span className="mt-1 inline-block text-[10px] font-bold uppercase text-yellow-dark-2">Recommended</span>}</div>
 </div>)}</div>
 <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-muted px-3 py-1.5">{readiness.physical_package_count} physical package{readiness.physical_package_count === 1 ? "" : "s"}</span><span className="rounded-full bg-muted px-3 py-1.5">{Number(readiness.total_weight_kg).toLocaleString()} kg total</span>{!readiness.pickup_location_id && <Link href="/seller/pickup-locations" className="rounded-full bg-primary/10 px-3 py-1.5 font-semibold text-primary">Configure pickup location</Link>}</div>
 </> : null}
 </section>

 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card">
 <div className="border-b border-border bg-carbon p-5 text-white dark:border-border sm:p-6">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
 <div className="flex items-start gap-3">
 <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-orange-950/20">
 <HugeiconsIcon icon={PackageOpenIcon} size={20} />
 </span>
 <div>
 <p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-primary-300">Fulfilment workspace</p>
 <h2 className="mt-1 text-lg font-extrabold">
 Packaging & Ready for Pickup
 </h2>
 <p className="mt-1 max-w-2xl text-xs leading-5 text-white/60">
 Record the physical package details and evidence that logistics will use during pickup and handover.
 </p>
 </div>
 </div>

 {!["shipped", "delivered", "cancelled"].includes(status) && (
 <button
 type="button"
 onClick={openPackageEditor}
 disabled={packageLoading || packageSaving}
 className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary disabled:opacity-50"
 >
 <HugeiconsIcon icon={Edit01Icon} size={14} />
 {packageInfo ? "Edit Package" : "Prepare Package"}
 </button>
 )}
 </div>
 </div>

 <div className="p-5 sm:p-6">
 {packageLoading ? (
 <div className="mt-5 rounded-xl border border-dashed p-7 text-center text-sm text-muted-foreground dark:border-border">
 <Spinner className="mx-auto" />
 <p className="mt-2">Loading package information...</p>
 </div>
 ) : packageInfo ? (
 <div className="mt-5 space-y-4">
 <div
 className={`rounded-xl border p-4 ${
 packageInfo.is_ready
 ? "border-green-light-4 bg-green-light-6"
 : "border-yellow-light-2 bg-yellow-light-4"
 }`}
 >
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <p
 className={`font-semibold ${
 packageInfo.is_ready
 ? "text-emerald-800"
 : "text-yellow-dark-2"
 }`}
 >
 {packageInfo.is_ready
 ? "Package confirmed · Ready for Pickup"
 : "Package draft · Not ready yet"}
 </p>
 <p
 className={`mt-1 text-xs ${
 packageInfo.is_ready
 ? "text-green-dark"
 : "text-yellow-dark-2"
 }`}
 >
 {packageInfo.is_ready
 ? "The fulfilment action can now move this order to Ready to Ship."
 : "Review the package details and confirm readiness before handoff."}
 </p>
 </div>

 {packageInfo.prepared_at && (
 <span className="text-xs text-green-dark">
 Prepared {new Date(packageInfo.prepared_at).toLocaleString()}
 </span>
 )}
 </div>
 </div>

 <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
 <PackageMetric
 icon={JusticeScale01Icon}
 label="Weight"
 value={
 packageInfo.weight_kg == null
 ? "Not set"
 : `${Number(packageInfo.weight_kg).toLocaleString()} kg`
 }
 />
 <PackageMetric
 icon={RulerIcon}
 label="Dimensions"
 value={
 packageInfo.length_cm != null ||
 packageInfo.width_cm != null ||
 packageInfo.height_cm != null
 ? `${packageInfo.length_cm ?? "—"} × ${packageInfo.width_cm ?? "—"} × ${packageInfo.height_cm ?? "—"} cm`
 : "Not set"
 }
 />
 <PackageMetric
 icon={PackageIcon}
 label="Packages"
 value={String(packageInfo.package_count)}
 />
 <PackageMetric
 icon={ImageAdd01Icon}
 label="Evidence"
 value={`${packageInfo.attachments?.length || 0} attachment${packageInfo.attachments?.length === 1 ? "" : "s"}`}
 />
 </div>

 {packageInfo.notes && (
 <div className="rounded-xl border border-border bg-muted p-4 dark:border-border dark:bg-card/[0.03]">
 <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
 Packaging notes
 </p>
 <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground /65">
 {packageInfo.notes}
 </p>
 </div>
 )}

 {packageInfo.attachments?.length > 0 && (
 <div>
 <p className="text-xs font-semibold text-muted-foreground">
 Packaging evidence
 </p>
 <div className="mt-2 flex flex-wrap gap-2">
 {packageInfo.attachments.map((attachment) => (
 <a
 key={attachment.id}
 href={attachment.file_url}
 target="_blank"
 rel="noreferrer"
 className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted dark:border-border /60 dark:hover:bg-card/5"
 >
 <HugeiconsIcon icon={ImageAdd01Icon} size={14} />
 <span className="max-w-[250px] truncate">
 {attachment.file_name || attachment.file_url}
 </span>
 </a>
 ))}
 </div>
 </div>
 )}
 </div>
 ) : (
 <div className="mt-5 rounded-xl border border-dashed border-border bg-muted p-7 text-center dark:border-border dark:bg-card/[0.025]">
 <HugeiconsIcon icon={PackageOpenIcon} size={28} className="mx-auto text-muted-foreground" />
 <p className="mt-3 font-semibold text-muted-foreground /70">
 Package not prepared
 </p>
 <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
 Add package weight and other fulfilment details. When everything
 has been checked, confirm the package as Ready for Pickup.
 </p>
 </div>
 )}
 </div>
 </section>

 <section className="rounded-xl border bg-card p-5 dark:border-border dark:bg-card">
 <h2 className="font-bold">Fulfilment action</h2>
 <p className="mt-1 text-xs text-muted-foreground">
 Actions follow the backend order state machine. The Ready to Ship
 action unlocks only after the package has been confirmed above.
 </p>

 <textarea
 value={notes}
 onChange={(event) => setNotes(event.target.value)}
 placeholder="Optional seller notes..."
 className="mt-4 min-h-24 w-full rounded-xl border p-3 text-sm dark:border-border"
 />

 <div className="mt-4 flex flex-wrap gap-2">
 {status === "new" && (
 <Action
 icon={CheckmarkCircle02Icon}
 label="Accept order"
 busy={busy}
 onClick={() =>
 run(
 () => sellerOrdersApi.accept(orderId, notes),
 "Order accepted",
 )
 }
 />
 )}

 {status === "accepted" && (
 <Action
 icon={PackageIcon}
 label="Start processing"
 busy={busy}
 onClick={() =>
 run(
 () => sellerOrdersApi.process(orderId, notes),
 "Processing started",
 )
 }
 />
 )}

 {(status === "accepted" || status === "processing") && (
 <div className="flex flex-col items-start gap-1">
 <Action
 icon={PackageCheckIcon}
 label="Mark ready to ship"
 busy={busy || readinessLoading || !readiness?.ready_to_ship}
 onClick={() =>
 run(
 () => sellerOrdersApi.ready(orderId, notes),
 "Ready to ship",
 )
 }
 />
 {!readinessLoading && !readiness?.ready_to_ship && (
 <span className="text-[11px] text-yellow-dark">
 Complete all blocking readiness checks first.
 </span>
 )}
 </div>
 )}

 {status === "ready_to_ship" && (
 <div className="inline-flex max-w-xl items-start gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-xs leading-5 text-primary-900 dark:border-primary-500/30 dark:bg-primary/10 /70">
 <HugeiconsIcon icon={TruckIcon} size={16} className="mt-0.5 shrink-0" />
 <span>
 <b>Ready for logistics pickup.</b> Do not dispatch this order manually. The assigned logistics company will update shipment movement after physical handover and pickup proof are completed.
 </span>
 </div>
 )}

 {![
 "shipped",
 "delivered",
 "cancelled",
 "cancellation_requested",
 ].includes(status) && (
 <button
 disabled={busy}
 onClick={cancel}
 className="inline-flex items-center gap-2 rounded-xl border border-red-light-4 px-4 py-2.5 text-sm font-semibold text-destructive"
 >
 <HugeiconsIcon icon={CancelCircleIcon} size={16} />
 Request cancellation
 </button>
 )}
 </div>
 </section>

 {status === "ready_to_ship" && (
 <section className="rounded-xl border bg-card p-5 shadow-sm dark:border-border dark:bg-card">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
 <div>
 <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
 <HugeiconsIcon icon={TruckIcon} size={18} className="text-primary" />
 Logistics Handover
 </h2>
 <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground /55">
 Confirm the physical handover only after the assigned courier is present and you have given the prepared package to them.
 </p>
 </div>
 <button
 type="button"
 onClick={() => void loadHandover()}
 disabled={handoverLoading}
 className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-muted-foreground disabled:opacity-50 dark:border-border /70"
 >
 {handoverLoading ? <Spinner /> : <HugeiconsIcon icon={RefreshCwIcon} size={14} />}
 Refresh handover
 </button>
 </div>

 {handoverLoading && !handover ? (
 <div className="mt-4 rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground dark:border-border /60">
 Checking courier handover status...
 </div>
 ) : handoverError ? (
 <div className="mt-4 rounded-xl border border-red-light-4 bg-red-light-6 p-4 text-sm text-red-dark">
 {handoverError}
 </div>
 ) : !handover ? (
 <div className="mt-4 rounded-xl border border-yellow-light-2 bg-yellow-light-4 p-4 text-sm text-yellow-dark-2">
 The handover record is not available yet. Make sure this order has a shipment and an assigned logistics company.
 </div>
 ) : handover.status === "awaiting_courier" ? (
 <div className="mt-4 rounded-xl border border-yellow-light-2 bg-yellow-light-4 p-4 text-amber-900">
 <p className="font-bold">Waiting for courier arrival</p>
 <p className="mt-1 text-xs leading-5">
 The package is ready. The assigned logistics company must first mark the courier as arrived. This status refreshes automatically every 15 seconds.
 </p>
 </div>
 ) : handover.status === "courier_arrived" ? (
 <div className="mt-4 space-y-4">
 <div className="rounded-xl border border-primary/25 bg-primary/10 p-4 text-foreground">
 <p className="font-bold">Courier has arrived · seller confirmation required</p>
 <p className="mt-1 text-xs leading-5 text-accent-foreground">
 Arrival recorded {handover.courier_arrived_at ? new Date(handover.courier_arrived_at).toLocaleString() : "by the logistics company"}. Verify the courier and package before confirming physical handover.
 </p>
 {handover.courier_arrival_notes && (
 <p className="mt-2 rounded-lg bg-card/80 px-3 py-2 text-xs text-muted-foreground">
 Logistics note: {handover.courier_arrival_notes}
 </p>
 )}
 </div>

 <textarea
 value={handoverNotes}
 onChange={(event) => setHandoverNotes(event.target.value)}
 maxLength={1000}
 placeholder="Optional handover note, e.g. 2 sealed packages handed to courier..."
 className="min-h-24 w-full rounded-xl border border-border p-3 text-sm text-foreground outline-none focus:border-primary-400 dark:border-border"
 />

 <button
 type="button"
 onClick={() => void confirmHandover()}
 disabled={confirmingHandover}
 className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
 >
 {confirmingHandover ? <Spinner /> : <HugeiconsIcon icon={PackageCheckIcon} size={16} />}
 {confirmingHandover ? "Confirming..." : "Confirm Product Handover"}
 </button>
 </div>
 ) : (
 <div className="mt-4 rounded-xl border border-green-light-4 bg-green-light-6 p-4 text-emerald-900">
 <div className="flex items-start gap-3">
 <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} className="mt-0.5 shrink-0 text-green-dark" />
 <div>
 <p className="font-bold">Product handover confirmed</p>
 <p className="mt-1 text-xs leading-5">
 Confirmed {handover.seller_confirmed_at ? new Date(handover.seller_confirmed_at).toLocaleString() : "successfully"}. Logistics can now capture/upload the pickup proof photo for customer verification.
 </p>
 {handover.seller_confirmation_notes && (
 <p className="mt-2 text-xs">Seller note: {handover.seller_confirmation_notes}</p>
 )}
 </div>
 </div>
 </div>
 )}
 </section>
 )}

 <section className="overflow-hidden rounded-xl border bg-card dark:border-border dark:bg-card">
 <div className="flex flex-col gap-3 border-b px-5 py-4 dark:border-border sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h2 className="flex items-center gap-2 font-bold">
 <HugeiconsIcon icon={Chatting01Icon} size={18} />
 Order Conversation
 </h2>
 <p className="mt-1 text-xs text-muted-foreground">
 This conversation is permanently linked to this seller order.
 </p>
 </div>

 <button
 type="button"
 onClick={() => void loadMessages()}
 disabled={messagesLoading}
 className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-muted-foreground disabled:opacity-50 dark:border-border /60"
 >
 {messagesLoading ? <Spinner /> : <HugeiconsIcon icon={RefreshCwIcon} size={14} />}
 Refresh
 </button>
 </div>

 <div className="max-h-[430px] overflow-y-auto bg-muted/60 p-4 dark:bg-card/[0.025]">
 {messagesLoading ? (
 <div className="py-10 text-center text-sm text-muted-foreground">
 <Spinner className="mx-auto" />
 <p className="mt-2">Loading order messages...</p>
 </div>
 ) : orderedMessages.length ? (
 <div className="space-y-3">
 {orderedMessages.map((message) => (
 <MessageBubble key={message.id} message={message} />
 ))}
 </div>
 ) : (
 <div className="py-10 text-center">
 <HugeiconsIcon icon={Chatting01Icon}
 size={28}
 className="mx-auto text-muted-foreground"
 />
 <p className="mt-3 font-semibold text-muted-foreground /70">
 No messages yet
 </p>
 <p className="mt-1 text-sm text-muted-foreground">
 Start the conversation when you need clarification about the
 order or packaging.
 </p>
 </div>
 )}
 </div>

 <div className="border-t p-4 dark:border-border">
 <textarea
 value={messageText}
 onChange={(event) => setMessageText(event.target.value)}
 placeholder="Write a message about this order..."
 className="min-h-24 w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-ring/30 dark:border-border"
 />

 <div className="mt-3 rounded-xl border border-border p-3 dark:border-border">
 <div className="flex items-center gap-2">
 <HugeiconsIcon icon={ImageAdd01Icon} size={16} className="text-muted-foreground" />
 <p className="text-xs font-semibold text-muted-foreground /60">
 Attachment URL
 </p>
 </div>

 <div className="mt-2 flex gap-2">
 <input
 value={attachmentDraft}
 onChange={(event) => setAttachmentDraft(event.target.value)}
 onKeyDown={(event) => {
 if (event.key === "Enter") {
 event.preventDefault();
 addAttachmentUrl();
 }
 }}
 placeholder="https://.../packaging-photo.jpg"
 className="h-10 flex-1 rounded-lg border border-border px-3 text-sm outline-none dark:border-border"
 />
 <button
 type="button"
 onClick={addAttachmentUrl}
 className="rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground dark:border-border /60"
 >
 Add
 </button>
 </div>

 {attachmentUrls.length > 0 && (
 <div className="mt-2 flex flex-wrap gap-2">
 {attachmentUrls.map((url) => (
 <button
 key={url}
 type="button"
 title="Remove attachment"
 onClick={() =>
 setAttachmentUrls((current) =>
 current.filter((item) => item !== url),
 )
 }
 className="max-w-full truncate rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground dark:bg-card/10 /60"
 >
 {url}
 </button>
 ))}
 </div>
 )}
 </div>

 <div className="mt-3 flex justify-end">
 <button
 type="button"
 disabled={sendingMessage || !messageText.trim()}
 onClick={() => void sendMessage()}
 className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
 >
 {sendingMessage ? (
 <Spinner />
 ) : (
 <HugeiconsIcon icon={SentIcon} size={16} />
 )}
 {sendingMessage ? "Sending..." : "Send Message"}
 </button>
 </div>
 </div>
 </section>
 </div>

 <div className="space-y-5">
 <section className="rounded-xl border bg-card p-5 dark:border-border dark:bg-card">
 <h2 className="font-bold">Customer</h2>
 <p className="mt-3 font-semibold">{order.customer_name}</p>
 <p className="text-sm text-muted-foreground">
 {order.customer_phone || "No phone"}
 </p>
 </section>

 <section className="rounded-xl border bg-card p-5 dark:border-border dark:bg-card">
 <h2 className="flex items-center gap-2 font-bold">
 <HugeiconsIcon icon={Location01Icon} size={16} />
 Delivery
 </h2>
 <p className="mt-3 text-sm">
 {order.shipping_method_name || "Shipping method pending"}
 </p>
 <p className="text-sm text-muted-foreground">
 {order.shipping_carrier || "Carrier pending"}
 </p>
 <Address value={order.shipping_address} />
 </section>

 {order.cancellation_reason && (
 <section className="rounded-xl border border-red-light-4 bg-red-light-6 p-5">
 <b className="text-red-dark">Cancellation reason</b>
 <p className="mt-2 text-sm text-red-dark">
 {order.cancellation_reason}
 </p>
 </section>
 )}
 </div>
 </div>

 {productDetailItem && (
 <div className="fixed inset-0 z-[145] flex items-center justify-center bg-carbon/70 p-3 backdrop-blur-sm sm:p-5">
 <div className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-xl bg-card shadow-lg dark:bg-card">
 <div className="flex items-center justify-between border-b border-border px-5 py-4 dark:border-border sm:px-6">
 <div>
 <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-primary">
 Paid order product
 </p>
 <h2 className="mt-1 text-xl font-extrabold text-foreground">
 {productDetailItem.product_name}
 </h2>
 </div>
 <button
 type="button"
 onClick={() => setProductDetailItemId(null)}
 className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-muted dark:border-border dark:hover:bg-card/5"
 aria-label="Close product details"
 >
 <HugeiconsIcon icon={CancelCircleIcon} size={18} />
 </button>
 </div>

 <div className="max-h-[calc(94vh-78px)] overflow-y-auto p-5 sm:p-6">
 <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
 <div>
 <div className="overflow-hidden rounded-xl border border-border bg-muted p-4 dark:border-border dark:bg-black/10">
 <OrderProductImage
 src={productImages[productDetailItem.product_id]}
 alt={productDetailItem.product_name}
 modal
 />
 </div>

 <div className="mt-3 grid grid-cols-2 gap-3">
 <DetailMetric
 label="Quantity"
 value={String(productDetailItem.quantity)}
 />
 <DetailMetric
 label="Line total"
 value={money(productDetailItem.total_price, order.currency)}
 orange
 />
 </div>
 </div>

 <div className="min-w-0">
 <div className="rounded-xl border border-primary-100 bg-primary/10 p-4 dark:border-primary-500/20 dark:bg-primary/10">
 <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--warning)]">
 Exact configuration customer purchased
 </p>
 <p className="mt-2 text-lg font-extrabold text-foreground">
 {productDetailItem.variant_name ||
 productDetailVariant?.variant_name ||
 "Standard"}
 </p>

 {productDetailVariant?.attributes &&
 Object.keys(productDetailVariant.attributes).length > 0 && (
 <div className="mt-3 grid gap-2 sm:grid-cols-2">
 {Object.entries(productDetailVariant.attributes).map(
 ([key, value]) => (
 <div
 key={key}
 className="rounded-xl border border-primary-100 bg-card/80 px-3 py-2.5 dark:border-primary-500/20"
 >
 <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
 {prettyLabel(key)}
 </p>
 <p className="mt-1 text-sm font-bold text-foreground">
 {formatAttributeValue(value)}
 </p>
 </div>
 ),
 )}
 </div>
 )}
 </div>

 <div className="mt-4 grid gap-3 sm:grid-cols-3">
 <DetailMetric
 label="Product SKU"
 value={
 productDetailVariant?.sku ||
 productDetailProduct?.sku ||
 "Not available"
 }
 />
 <DetailMetric
 label="Unit price"
 value={money(productDetailItem.unit_price, order.currency)}
 />
 <DetailMetric
 label="Store"
 value={order.store_name || "Seller store"}
 />
 </div>

 <div className="mt-4 rounded-xl border border-border p-4 dark:border-border">
 <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
 Product description
 </p>
 <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground /65">
 {productDetailProduct?.description ||
 "No product description was returned by the product endpoint."}
 </p>
 </div>

 <div className="mt-5 flex flex-wrap gap-2">
 <Link
 href={`/products/${productDetailItem.product_id}`}
 target="_blank"
 className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
 >
 <HugeiconsIcon icon={ViewIcon} size={16} />
 Open marketplace listing
 </Link>
 <button
 type="button"
 onClick={() => setProductDetailItemId(null)}
 className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground dark:border-border /60"
 >
 Close
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {packageEditorOpen && (
 <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
 <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-card shadow-lg dark:bg-card">
 <div className="flex items-center justify-between border-b border-border px-5 py-4 dark:border-border">
 <div>
 <h2 className="mt-0.5 text-xl font-bold">
 Prepare Package
 </h2>
 <p className="mt-1 text-xs text-muted-foreground">
 Order #{order.order_id.slice(0, 8)}
 </p>
 </div>

 <button
 type="button"
 disabled={packageSaving}
 onClick={() => setPackageEditorOpen(false)}
 className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground dark:border-border"
 >
 <HugeiconsIcon icon={CancelCircleIcon} size={16} />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto p-5 sm:p-6">
 <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm leading-6 text-primary-800">
 Package information is used for logistics handoff. Confirm
 <strong> Ready for Pickup</strong> only after the items have been
 checked and physically packaged.
 </div>

 <div className="mt-5 grid gap-4 sm:grid-cols-2">
 <PackageField
 label="Weight (kg)"
 required
 hint="Required before confirming readiness."
 >
 <input
 type="number"
 min={0}
 step="0.001"
 value={packageForm.weight_kg}
 onChange={(event) =>
 setPackageForm((current) => ({
 ...current,
 weight_kg: event.target.value,
 }))
 }
 className={packageInputClass}
 placeholder="e.g. 1.250"
 />
 </PackageField>

 <PackageField label="Package count" required>
 <input
 type="number"
 min={1}
 step={1}
 value={packageForm.package_count}
 onChange={(event) =>
 setPackageForm((current) => ({
 ...current,
 package_count: event.target.value,
 }))
 }
 className={packageInputClass}
 />
 </PackageField>

 <PackageField label="Length (cm)">
 <input
 type="number"
 min={0}
 step="0.01"
 value={packageForm.length_cm}
 onChange={(event) =>
 setPackageForm((current) => ({
 ...current,
 length_cm: event.target.value,
 }))
 }
 className={packageInputClass}
 placeholder="Optional"
 />
 </PackageField>

 <PackageField label="Width (cm)">
 <input
 type="number"
 min={0}
 step="0.01"
 value={packageForm.width_cm}
 onChange={(event) =>
 setPackageForm((current) => ({
 ...current,
 width_cm: event.target.value,
 }))
 }
 className={packageInputClass}
 placeholder="Optional"
 />
 </PackageField>

 <PackageField label="Height (cm)">
 <input
 type="number"
 min={0}
 step="0.01"
 value={packageForm.height_cm}
 onChange={(event) =>
 setPackageForm((current) => ({
 ...current,
 height_cm: event.target.value,
 }))
 }
 className={packageInputClass}
 placeholder="Optional"
 />
 </PackageField>
 </div>

 <div className="mt-4">
 <PackageField label="Packaging notes">
 <textarea
 value={packageForm.notes}
 onChange={(event) =>
 setPackageForm((current) => ({
 ...current,
 notes: event.target.value,
 }))
 }
 className={`${packageInputClass} min-h-24 py-3`}
 placeholder="Packaging condition, handling instructions, item checks..."
 />
 </PackageField>
 </div>

 <div className="mt-4 overflow-hidden rounded-xl border border-primary/25 bg-card dark:border-primary-500/20">
 <div className="p-4 sm:p-5">
 <div className="flex items-start gap-3">
 <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
 <HugeiconsIcon icon={ImageAdd01Icon} size={18} />
 </span>
 <div>
 <p className="text-sm font-bold text-foreground">
 Packaging evidence
 </p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground /55">
 Upload clear photos showing the actual product after packaging.
 These photos document the condition handed to logistics.
 </p>
 </div>
 </div>

 <label
 className={`mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-6 text-center transition ${
 packageEvidenceUploading
 ? "cursor-wait border-primary/40 bg-primary/10/70 opacity-70"
 : "border-primary/25 bg-card/80 hover:border-[var(--primary)] hover:bg-primary/10/50 dark:bg-card/[0.025]"
 }`}
 >
 {packageEvidenceUploading ? (
 <Spinner className="text-primary" />
 ) : (
 <HugeiconsIcon icon={Image01Icon} size={28} className="text-primary" />
 )}
 <span className="mt-3 text-sm font-bold text-foreground">
 {packageEvidenceUploading ? "Uploading evidence..." : "Choose packaging photos"}
 </span>
 <span className="mt-1 text-[11px] leading-5 text-muted-foreground">
 JPG, PNG or WEBP · max 10 MB each · up to 10 photos
 </span>
 <span className="mt-3 rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-background">
 Browse from computer
 </span>
 <input
 type="file"
 accept="image/jpeg,image/png,image/webp"
 multiple
 disabled={packageEvidenceUploading}
 onChange={(event) => {
 void uploadPackageEvidence(event.target.files);
 event.currentTarget.value = "";
 }}
 className="sr-only"
 />
 </label>

 {packageForm.attachment_urls.length > 0 && (
 <div className="mt-4">
 <div className="mb-2 flex items-center justify-between">
 <p className="text-xs font-bold text-muted-foreground /65">
 Uploaded evidence
 </p>
 <span className="text-[10px] font-semibold text-muted-foreground">
 {packageForm.attachment_urls.length}/10 photos
 </span>
 </div>
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
 {packageForm.attachment_urls.map((url, index) => (
 <div
 key={url}
 className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted dark:border-border"
 >
 <img
 src={resolveProductImageUrl(url)}
 alt={`Packaging evidence ${index + 1}`}
 className="h-full w-full object-cover"
 />
 <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 from-black/75 to-transparent px-2.5 pb-2 pt-6">
 <span className="text-[10px] font-bold text-white">
 Photo {index + 1}
 </span>
 <button
 type="button"
 onClick={() =>
 setPackageForm((current) => ({
 ...current,
 attachment_urls: current.attachment_urls.filter(
 (item) => item !== url,
 ),
 }))
 }
 className="grid h-7 w-7 place-items-center rounded-lg bg-card/90 text-destructive shadow-sm transition hover:bg-card"
 title="Remove packaging evidence"
 >
 <HugeiconsIcon icon={Delete02Icon} size={14} />
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>

 <label
 className={`mt-5 flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
 packageForm.is_ready
 ? "border-green-light-4 bg-green-light-6"
 : "border-border bg-muted"
 }`}
 >
 <input
 type="checkbox"
 checked={packageForm.is_ready}
 onChange={(event) =>
 setPackageForm((current) => ({
 ...current,
 is_ready: event.target.checked,
 }))
 }
 className="mt-1 h-4 w-4 accent-emerald-600"
 />
 <span>
 <span
 className={`block text-sm font-bold ${
 packageForm.is_ready
 ? "text-emerald-800"
 : "text-accent-foreground"
 }`}
 >
 Confirm package is Ready for Pickup
 </span>
 <span
 className={`mt-1 block text-xs leading-5 ${
 packageForm.is_ready
 ? "text-green-dark"
 : "text-muted-foreground"
 }`}
 >
 I have checked the ordered items, completed packaging and
 confirm these details are ready for logistics handoff.
 </span>
 </span>
 </label>
 </div>

 <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end dark:border-border">
 <button
 type="button"
 disabled={packageSaving}
 onClick={() => setPackageEditorOpen(false)}
 className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground disabled:opacity-50 dark:border-border /60"
 >
 Cancel
 </button>
 <button
 type="button"
 disabled={packageSaving || packageEvidenceUploading}
 onClick={() => void savePackage()}
 className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
 >
 {packageSaving && (
 <Spinner />
 )}
 {packageSaving
 ? "Saving..."
 : packageForm.is_ready
 ? "Save & Confirm Ready"
 : "Save Package Draft"}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

function MessageBubble({ message }: { message: SellerOrderMessage }) {
 const sellerMessage =
 (message.sender_role_label || "").toLowerCase() === "seller";

 return (
 <div className={`flex ${sellerMessage ? "justify-end" : "justify-start"}`}>
 <div
 className={`max-w-[82%] rounded-xl px-4 py-3 ${
 sellerMessage
 ? "bg-primary/10 text-primary dark:bg-primary-400/10 /70"
 : "border border-border bg-card text-accent-foreground dark:border-border /75"
 }`}
 >
 <div className="mb-1 flex flex-wrap items-center gap-2">
 <span className="text-[10px] font-bold uppercase tracking-wide">
 {message.sender_role_label || "Order participant"}
 </span>
 {message.is_internal && (
 <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">
 Internal
 </span>
 )}
 </div>

 <p className="whitespace-pre-wrap text-sm leading-6">
 {message.message}
 </p>

 {message.attachments?.length > 0 && (
 <div className="mt-3 space-y-1.5">
 {message.attachments.map((attachment) => (
 <a
 key={attachment.id}
 href={attachment.file_url}
 target="_blank"
 rel="noreferrer"
 className="block max-w-full truncate rounded-lg border border-current/10 bg-card/60 px-2.5 py-2 text-xs underline dark:bg-black/10"
 >
 {attachment.file_name || attachment.file_url}
 </a>
 ))}
 </div>
 )}

 <p className="mt-2 text-[10px] opacity-60">
 {new Date(message.created_at).toLocaleString()}
 </p>
 </div>
 </div>
 );
}

function OrderProductImage({
 src,
 alt,
 large = false,
 modal = false,
}: {
 src?: string;
 alt: string;
 large?: boolean;
 modal?: boolean;
}) {
 const [failed, setFailed] = useState(false);
 const sizeClass = modal
 ? "h-[320px] w-full"
 : large
 ? "h-[170px] w-full"
 : "h-24 w-24";

 return (
 <div
 className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border ${sizeClass}`}
 >
 {src && !failed ? (
 <img
 src={src}
 alt={alt}
 className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-[1.02]"
 onError={() => setFailed(true)}
 />
 ) : (
 <div className="text-center">
 <HugeiconsIcon icon={Image01Icon} size={large || modal ? 36 : 28} className="mx-auto text-muted-foreground" />
 {(large || modal) && (
 <p className="mt-2 text-[10px] font-semibold text-muted-foreground">
 Product image unavailable
 </p>
 )}
 </div>
 )}
 </div>
 );
}

const prettyLabel = (value: string) =>
 value
 .replaceAll("_", " ")
 .replaceAll("-", " ")
 .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatAttributeValue = (value: unknown) => {
 if (Array.isArray(value)) return value.join(", ");
 if (typeof value === "object" && value !== null) return JSON.stringify(value);
 return String(value);
};

function DetailMetric({
 label,
 value,
 orange = false,
}: {
 label: string;
 value: string;
 orange?: boolean;
}) {
 return (
 <div
 className={`rounded-xl border p-3.5 ${
 orange
 ? "border-primary-100 bg-primary/10 dark:border-primary-500/20 dark:bg-primary/10"
 : "border-border bg-muted dark:border-border "
 }`}
 >
 <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
 {label}
 </p>
 <p
 className={`mt-1 break-words text-sm font-extrabold ${
 orange
 ? "text-primary dark:text-primary-300"
 : "text-foreground "
 }`}
 >
 {value}
 </p>
 </div>
 );
}

function PackageMetric({
 icon: Icon,
 label,
 value,
}: {
 icon: any;
 label: string;
 value: string;
}) {
 return (
 <div className="rounded-xl border border-border bg-muted p-3 dark:border-border dark:bg-card/[0.03]">
 <div className="flex items-center gap-2 text-muted-foreground">
 <HugeiconsIcon icon={Icon} size={14} />
 <p className="text-[10px] font-bold uppercase tracking-wide">{label}</p>
 </div>
 <p className="mt-2 text-sm font-semibold text-accent-foreground /75">
 {value}
 </p>
 </div>
 );
}

function PackageField({
 label,
 required = false,
 hint,
 children,
}: {
 label: string;
 required?: boolean;
 hint?: string;
 children: React.ReactNode;
}) {
 return (
 <label className="block">
 <span className="mb-1.5 block text-xs font-semibold text-muted-foreground /65">
 {label} {required && <span className="text-destructive">*</span>}
 </span>
 {children}
 {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
 </label>
 );
}

const packageInputClass =
 "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-ring/30 dark:border-border ";

function Action({
 icon: Icon,
 label,
 busy,
 onClick,
}: {
 icon: any;
 label: string;
 busy: boolean;
 onClick: () => void;
}) {
 return (
 <button
 disabled={busy}
 onClick={onClick}
 className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
 >
 <HugeiconsIcon icon={Icon} size={16} />
 {label}
 </button>
 );
}

function Address({
 value,
}: {
 value?: Record<string, unknown> | null;
}) {
 if (!value) {
 return (
 <p className="mt-3 text-xs text-muted-foreground">
 Shipping address unavailable.
 </p>
 );
 }

 const parts = [
 value.recipient_name,
 value.street,
 value.ward,
 value.district,
 value.city,
 value.region,
 value.country,
 ]
 .filter(Boolean)
 .map(String);

 return (
 <p className="mt-3 text-xs leading-5 text-muted-foreground">
 {parts.join(", ")}
 </p>
 );
}
