"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  ImagePlus,
  ImageIcon,
  Eye,
  Layers3,
  ShoppingBag,
  Sparkles,
  MapPin,
  Ruler,
  Scale,
  PackageOpen,
  PencilLine,
  Trash2,
  MessageSquareText,
  PackageCheck,
  RefreshCw,
  Send,
  Truck,
  XCircle,
} from "lucide-react";
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
      <div className="p-14 text-center text-slate-500">
        <RefreshCw className="mx-auto animate-spin" />
        <p className="mt-2">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border bg-white p-8">
        Seller order could not be loaded.
      </div>
    );
  }

  const status = order.seller_status;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1f2937] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/seller/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"
          >
            <ArrowLeft size={14} />
            Back to orders
          </Link>

          <h1 className="mt-3 text-2xl font-bold dark:text-white">
            Order #{order.order_id.slice(0, 8)}
          </h1>

          <div className="mt-2">
            <Badge status={status} />
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Seller subtotal</p>
          <p className="text-2xl font-bold text-[#f7941d]">
            {money(order.seller_subtotal, order.currency)}
          </p>
        </div>
      </div>

      {order.order_status === "paid" && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={21} />
            </span>
            <div>
              <p className="font-bold">Customer payment confirmed — review the products before packaging</p>
              <p className="mt-1 text-sm leading-6 text-emerald-800/80">
                Verify the product image, variant and quantity below. Accept the order only when the paid items match what you will prepare for pickup.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-[#1f2937]">
            <div className="border-b border-orange-100 bg-gradient-to-r from-[#fff7ed] via-white to-[#fffaf5] px-5 py-5 dark:border-orange-500/20 dark:from-orange-500/10 dark:via-[#1f2937] dark:to-[#1f2937] sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f7941d] text-white shadow-[0_8px_20px_rgba(247,148,29,.25)]">
                    <ShoppingBag size={22} />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#f7941d]">
                        Paid product review
                      </p>
                      {order.order_status === "paid" && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700">
                          Payment verified
                        </span>
                      )}
                    </div>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
                      Products the customer bought
                    </h2>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-white/55">
                      Verify the exact product, selected variant and quantity before accepting, packaging or handing the order to logistics.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <Layers3 size={17} className="text-[#f7941d]" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Total units</p>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
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
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 transition hover:border-orange-200 hover:shadow-[0_16px_38px_rgba(15,23,42,.08)] dark:border-white/10 dark:from-white/[0.035] dark:via-white/[0.02] dark:to-transparent"
                  >
                    <div className="grid min-w-0 gap-0 md:grid-cols-[190px_minmax(0,1fr)]">
                      <div className="relative min-h-[190px] border-b border-slate-200 bg-[#f8fafc] p-4 dark:border-white/10 dark:bg-black/10 md:border-b-0 md:border-r">
                        <OrderProductImage
                          src={productImages[item.product_id]}
                          alt={item.product_name}
                          large
                        />
                        <span className="absolute left-5 top-5 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700 shadow-sm backdrop-blur dark:bg-slate-900/90">
                          Paid item
                        </span>
                      </div>

                      <div className="min-w-0 p-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">
                              Customer selected
                            </p>
                            <h3 className="mt-1 text-xl font-extrabold leading-tight text-slate-950 dark:text-white">
                              {item.product_name}
                            </h3>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#fff4e8] px-3 py-2 text-xs font-bold text-[#c66c0b] dark:bg-orange-500/10 dark:text-orange-300">
                                <Sparkles size={13} />
                                {item.variant_name || variant?.variant_name || "Standard"}
                              </span>
                              <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 dark:bg-white/5 dark:text-white/70">
                                Qty {item.quantity}
                              </span>
                              {(variant?.sku || product?.sku) && (
                                <span className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-white/50">
                                  SKU {variant?.sku || product?.sku}
                                </span>
                              )}
                            </div>

                            {attributes.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {attributes.slice(0, 4).map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="rounded-lg border border-blue-100 bg-blue-50/70 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
                                  >
                                    {prettyLabel(key)}: {formatAttributeValue(value)}
                                  </span>
                                ))}
                              </div>
                            )}

                            <p className="mt-4 line-clamp-2 max-w-2xl text-xs leading-5 text-slate-500 dark:text-white/50">
                              {product?.description ||
                                "Open Product Details to review the complete product listing and selected configuration before packing."}
                            </p>
                          </div>

                          <div className="grid shrink-0 grid-cols-2 gap-2 xl:w-[250px]">
                            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                Unit price
                              </p>
                              <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                                {money(item.unit_price, order.currency)}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-[#fff7ed] p-3 dark:bg-orange-500/10">
                              <p className="text-[9px] font-bold uppercase tracking-wide text-[#d97706]">
                                Line total
                              </p>
                              <p className="mt-1 text-sm font-extrabold text-[#c66c0b] dark:text-orange-300">
                                {money(item.total_price, order.currency)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => {
                              setProductDetailItemId(item.id);
                            }}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-black shadow-sm transition hover:bg-[#f7941d] dark:bg-white dark:text-slate-950 dark:hover:bg-[#f7941d] dark:hover:text-white"
                          >
                            <Eye size={17} />
                            View Product Details
                          </button>

                          <Link
                            href={`/products/${item.product_id}`}
                            target="_blank"
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:border-orange-200 hover:text-[#f7941d] dark:border-white/10 dark:text-white/60"
                          >
                            Open marketplace listing
                          </Link>

                          <span className="ml-auto hidden text-[11px] font-medium text-slate-400 lg:inline">
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

          <section className="rounded-2xl border bg-white p-4 dark:border-white/10 dark:bg-[#1f2937] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-bold dark:text-white"><PackageCheck size={18} />Fulfillment readiness</h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">Every blocking requirement must pass before Ready to Ship is accepted.</p>
              </div>
              <button type="button" onClick={() => void loadReadiness()} disabled={readinessLoading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold dark:border-white/10"><RefreshCw size={14} className={readinessLoading ? "animate-spin" : ""} />Refresh checks</button>
            </div>

            {readinessLoading ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />)}</div> : readinessError ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><b>Readiness check unavailable.</b><p className="mt-1 break-words text-xs">{readinessError}</p></div> : readiness ? <>
              <div className={`mt-4 rounded-xl border p-4 ${readiness.ready_to_ship ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}><p className="font-bold">{readiness.ready_to_ship ? "All blocking checks passed" : `${readiness.blockers.length} requirement${readiness.blockers.length === 1 ? "" : "s"} still blocking`}</p><p className="mt-1 text-xs leading-5">{readiness.ready_to_ship ? "This seller order can now be marked Ready to Ship." : "Complete the failed items below, then refresh the checklist."}</p></div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">{readiness.checks.map((check) => <div key={check.code} className={`flex min-h-16 items-start gap-3 rounded-xl border p-3 ${check.ready ? "border-emerald-100 bg-emerald-50/60" : check.blocking ? "border-red-100 bg-red-50/60" : "border-amber-100 bg-amber-50/60"}`}>
                {check.ready ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} /> : <XCircle className={`mt-0.5 shrink-0 ${check.blocking ? "text-red-500" : "text-amber-500"}`} size={18} />}
                <div className="min-w-0"><p className="text-sm font-semibold text-slate-800">{check.label}</p>{check.detail && <p className="mt-0.5 break-words text-xs leading-5 text-slate-500">{check.detail}</p>}{!check.blocking && !check.ready && <span className="mt-1 inline-block text-[10px] font-bold uppercase text-amber-700">Recommended</span>}</div>
              </div>)}</div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-slate-100 px-3 py-1.5">{readiness.physical_package_count} physical package{readiness.physical_package_count === 1 ? "" : "s"}</span><span className="rounded-full bg-slate-100 px-3 py-1.5">{Number(readiness.total_weight_kg).toLocaleString()} kg total</span>{!readiness.pickup_location_id && <Link href="/seller/pickup-locations" className="rounded-full bg-orange/10 px-3 py-1.5 font-semibold text-orange">Configure pickup location</Link>}</div>
            </> : null}
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,.055)] dark:border-white/10 dark:bg-[#1f2937]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-[#2b1b0d] p-5 text-white dark:border-white/10 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f7941d] text-white shadow-lg shadow-orange-950/20">
                    <PackageOpen size={21} />
                  </span>
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-orange-300">Fulfilment workspace</p>
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-xs font-semibold text-[#c66c0b] disabled:opacity-50"
                >
                  <PencilLine size={14} />
                  {packageInfo ? "Edit Package" : "Prepare Package"}
                </button>
              )}
              </div>
            </div>

            <div className="p-5 sm:p-6">
            {packageLoading ? (
              <div className="mt-5 rounded-xl border border-dashed p-7 text-center text-sm text-slate-500 dark:border-white/10">
                <RefreshCw size={18} className="mx-auto animate-spin" />
                <p className="mt-2">Loading package information...</p>
              </div>
            ) : packageInfo ? (
              <div className="mt-5 space-y-4">
                <div
                  className={`rounded-xl border p-4 ${
                    packageInfo.is_ready
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p
                        className={`font-semibold ${
                          packageInfo.is_ready
                            ? "text-emerald-800"
                            : "text-amber-800"
                        }`}
                      >
                        {packageInfo.is_ready
                          ? "Package confirmed — Ready for Pickup"
                          : "Package draft — Not ready yet"}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          packageInfo.is_ready
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        {packageInfo.is_ready
                          ? "The fulfilment action can now move this order to Ready to Ship."
                          : "Review the package details and confirm readiness before handoff."}
                      </p>
                    </div>

                    {packageInfo.prepared_at && (
                      <span className="text-xs text-emerald-700">
                        Prepared {new Date(packageInfo.prepared_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <PackageMetric
                    icon={Scale}
                    label="Weight"
                    value={
                      packageInfo.weight_kg == null
                        ? "Not set"
                        : `${Number(packageInfo.weight_kg).toLocaleString()} kg`
                    }
                  />
                  <PackageMetric
                    icon={Ruler}
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
                    icon={Box}
                    label="Packages"
                    value={String(packageInfo.package_count)}
                  />
                  <PackageMetric
                    icon={ImagePlus}
                    label="Evidence"
                    value={`${packageInfo.attachments?.length || 0} attachment${packageInfo.attachments?.length === 1 ? "" : "s"}`}
                  />
                </div>

                {packageInfo.notes && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Packaging notes
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-white/65">
                      {packageInfo.notes}
                    </p>
                  </div>
                )}

                {packageInfo.attachments?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Packaging evidence
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {packageInfo.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/5"
                        >
                          <ImagePlus size={13} />
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
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center dark:border-white/10 dark:bg-white/[0.025]">
                <PackageOpen size={28} className="mx-auto text-slate-300" />
                <p className="mt-3 font-semibold text-slate-600 dark:text-white/70">
                  Package not prepared
                </p>
                <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-slate-400">
                  Add package weight and other fulfilment details. When everything
                  has been checked, confirm the package as Ready for Pickup.
                </p>
              </div>
            )}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-5 dark:border-white/10 dark:bg-[#1f2937]">
            <h2 className="font-bold dark:text-white">Fulfilment action</h2>
            <p className="mt-1 text-xs text-slate-400">
              Actions follow the backend order state machine. The Ready to Ship
              action unlocks only after the package has been confirmed above.
            </p>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional seller notes..."
              className="mt-4 min-h-24 w-full rounded-xl border p-3 text-sm dark:border-white/10 dark:bg-white/5"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {status === "new" && (
                <Action
                  icon={CheckCircle2}
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
                  icon={Box}
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
                    icon={PackageCheck}
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
                    <span className="text-[11px] text-amber-600">
                      Complete all blocking readiness checks first.
                    </span>
                  )}
                </div>
              )}

              {status === "ready_to_ship" && (
                <div className="inline-flex max-w-xl items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs leading-5 text-orange-900 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
                  <Truck size={17} className="mt-0.5 shrink-0" />
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
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600"
                >
                  <XCircle size={16} />
                  Request cancellation
                </button>
              )}
            </div>
          </section>

          {status === "ready_to_ship" && (
            <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                    <Truck size={19} className="text-orange-500" />
                    Logistics Handover
                  </h2>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-white/55">
                    Confirm the physical handover only after the assigned courier is present and you have given the prepared package to them.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadHandover()}
                  disabled={handoverLoading}
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-50 dark:border-white/10 dark:text-white/70"
                >
                  <RefreshCw size={13} className={handoverLoading ? "animate-spin" : ""} />
                  Refresh handover
                </button>
              </div>

              {handoverLoading && !handover ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                  Checking courier handover status...
                </div>
              ) : handoverError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {handoverError}
                </div>
              ) : !handover ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  The handover record is not available yet. Make sure this order has a shipment and an assigned logistics company.
                </div>
              ) : handover.status === "awaiting_courier" ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                  <p className="font-bold">Waiting for courier arrival</p>
                  <p className="mt-1 text-xs leading-5">
                    The package is ready. The assigned logistics company must first mark the courier as arrived. This status refreshes automatically every 15 seconds.
                  </p>
                </div>
              ) : handover.status === "courier_arrived" ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-slate-900">
                    <p className="font-bold">Courier has arrived — seller confirmation required</p>
                    <p className="mt-1 text-xs leading-5 text-slate-700">
                      Arrival recorded {handover.courier_arrived_at ? new Date(handover.courier_arrived_at).toLocaleString() : "by the logistics company"}. Verify the courier and package before confirming physical handover.
                    </p>
                    {handover.courier_arrival_notes && (
                      <p className="mt-2 rounded-lg bg-white/80 px-3 py-2 text-xs text-slate-600">
                        Logistics note: {handover.courier_arrival_notes}
                      </p>
                    )}
                  </div>

                  <textarea
                    value={handoverNotes}
                    onChange={(event) => setHandoverNotes(event.target.value)}
                    maxLength={1000}
                    placeholder="Optional handover note, e.g. 2 sealed packages handed to courier..."
                    className="min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 outline-none focus:border-orange-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() => void confirmHandover()}
                    disabled={confirmingHandover}
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-black shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {confirmingHandover ? <RefreshCw size={16} className="animate-spin" /> : <PackageCheck size={16} />}
                    {confirmingHandover ? "Confirming..." : "Confirm Product Handover"}
                  </button>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
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

          <section className="overflow-hidden rounded-2xl border bg-white dark:border-white/10 dark:bg-[#1f2937]">
            <div className="flex flex-col gap-3 border-b px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-bold dark:text-white">
                  <MessageSquareText size={18} />
                  Order Conversation
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  This conversation is permanently linked to this seller order.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadMessages()}
                disabled={messagesLoading}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-50 dark:border-white/10 dark:text-white/60"
              >
                <RefreshCw
                  size={13}
                  className={messagesLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            <div className="max-h-[430px] overflow-y-auto bg-slate-50/60 p-4 dark:bg-white/[0.025]">
              {messagesLoading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  <RefreshCw size={18} className="mx-auto animate-spin" />
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
                  <MessageSquareText
                    size={28}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-3 font-semibold text-slate-600 dark:text-white/70">
                    No messages yet
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Start the conversation when you need clarification about the
                    order or packaging.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t p-4 dark:border-white/10">
              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Write a message about this order..."
                className="min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />

              <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <ImagePlus size={16} className="text-slate-400" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-white/60">
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
                    className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addAttachmentUrl}
                    className="rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-white/60"
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
                        className="max-w-full truncate rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600 dark:bg-white/10 dark:text-white/60"
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
                  className="inline-flex items-center gap-2 rounded-xl bg-[#f7941d] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {sendingMessage ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border bg-white p-5 dark:border-white/10 dark:bg-[#1f2937]">
            <h2 className="font-bold dark:text-white">Customer</h2>
            <p className="mt-3 font-semibold">{order.customer_name}</p>
            <p className="text-sm text-slate-500">
              {order.customer_phone || "No phone"}
            </p>
          </section>

          <section className="rounded-2xl border bg-white p-5 dark:border-white/10 dark:bg-[#1f2937]">
            <h2 className="flex items-center gap-2 font-bold dark:text-white">
              <MapPin size={17} />
              Delivery
            </h2>
            <p className="mt-3 text-sm">
              {order.shipping_method_name || "Shipping method pending"}
            </p>
            <p className="text-sm text-slate-500">
              {order.shipping_carrier || "Carrier pending"}
            </p>
            <Address value={order.shipping_address} />
          </section>

          {order.cancellation_reason && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <b className="text-red-700">Cancellation reason</b>
              <p className="mt-2 text-sm text-red-700">
                {order.cancellation_reason}
              </p>
            </section>
          )}
        </div>
      </div>

      {productDetailItem && (
        <div className="fixed inset-0 z-[145] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5">
          <div className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#1f2937]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10 sm:px-6">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#f7941d]">
                  Paid order product
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">
                  {productDetailItem.product_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setProductDetailItemId(null)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                aria-label="Close product details"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="max-h-[calc(94vh-78px)] overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                <div>
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-[#f8fafc] p-4 dark:border-white/10 dark:bg-black/10">
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
                  <div className="rounded-2xl border border-orange-100 bg-[#fff8f1] p-4 dark:border-orange-500/20 dark:bg-orange-500/10">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#d97706]">
                      Exact configuration customer purchased
                    </p>
                    <p className="mt-2 text-lg font-extrabold text-slate-950 dark:text-white">
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
                                className="rounded-xl border border-orange-100 bg-white/80 px-3 py-2.5 dark:border-orange-500/20 dark:bg-white/5"
                              >
                                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                  {prettyLabel(key)}
                                </p>
                                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
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

                  <div className="mt-4 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Product description
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-white/65">
                      {productDetailProduct?.description ||
                        "No product description was returned by the product endpoint."}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/products/${productDetailItem.product_id}`}
                      target="_blank"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#f7941d] px-4 text-sm font-bold text-white"
                    >
                      <Eye size={16} />
                      Open marketplace listing
                    </Link>
                    <button
                      type="button"
                      onClick={() => setProductDetailItemId(null)}
                      className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-white/60"
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
          <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1f2937]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <div>
                <h2 className="mt-0.5 text-xl font-bold dark:text-white">
                  Prepare Package
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Order #{order.order_id.slice(0, 8)}
                </p>
              </div>

              <button
                type="button"
                disabled={packageSaving}
                onClick={() => setPackageEditorOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-white/10"
              >
                <XCircle size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
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

              <div className="mt-4 overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-slate-50 dark:border-orange-500/20 dark:from-orange-500/10 dark:via-[#1f2937] dark:to-[#1f2937]">
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f7941d] text-white shadow-sm">
                      <ImagePlus size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Packaging evidence
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-white/55">
                        Upload clear photos showing the actual product after packaging.
                        These photos document the condition handed to logistics.
                      </p>
                    </div>
                  </div>

                  <label
                    className={`mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-6 text-center transition ${
                      packageEvidenceUploading
                        ? "cursor-wait border-orange-300 bg-orange-50/70 opacity-70"
                        : "border-orange-200 bg-white/80 hover:border-[#f7941d] hover:bg-orange-50/50 dark:bg-white/[0.025]"
                    }`}
                  >
                    {packageEvidenceUploading ? (
                      <RefreshCw size={26} className="animate-spin text-[#f7941d]" />
                    ) : (
                      <ImageIcon size={28} className="text-[#f7941d]" />
                    )}
                    <span className="mt-3 text-sm font-bold text-slate-800 dark:text-white">
                      {packageEvidenceUploading ? "Uploading evidence..." : "Choose packaging photos"}
                    </span>
                    <span className="mt-1 text-[11px] leading-5 text-slate-400">
                      JPG, PNG or WEBP · max 10 MB each · up to 10 photos
                    </span>
                    <span className="mt-3 rounded-full bg-[#111827] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
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
                        <p className="text-xs font-bold text-slate-600 dark:text-white/65">
                          Uploaded evidence
                        </p>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {packageForm.attachment_urls.length}/10 photos
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {packageForm.attachment_urls.map((url, index) => (
                          <div
                            key={url}
                            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5"
                          >
                            <img
                              src={resolveProductImageUrl(url)}
                              alt={`Packaging evidence ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/75 to-transparent px-2.5 pb-2 pt-6">
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
                                className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-red-500 shadow-sm transition hover:bg-white"
                                title="Remove packaging evidence"
                              >
                                <Trash2 size={13} />
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
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
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
                        : "text-slate-700"
                    }`}
                  >
                    Confirm package is Ready for Pickup
                  </span>
                  <span
                    className={`mt-1 block text-xs leading-5 ${
                      packageForm.is_ready
                        ? "text-emerald-700"
                        : "text-slate-500"
                    }`}
                  >
                    I have checked the ordered items, completed packaging and
                    confirm these details are ready for logistics handoff.
                  </span>
                </span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end dark:border-white/10">
              <button
                type="button"
                disabled={packageSaving}
                onClick={() => setPackageEditorOpen(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50 dark:border-white/10 dark:text-white/60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={packageSaving || packageEvidenceUploading}
                onClick={() => void savePackage()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f7941d] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {packageSaving && (
                  <RefreshCw size={14} className="animate-spin" />
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
        className={`max-w-[82%] rounded-2xl px-4 py-3 ${
          sellerMessage
            ? "bg-[#fff3e7] text-[#6f4317] dark:bg-orange-400/10 dark:text-orange-100"
            : "border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/75"
        }`}
      >
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide">
            {message.sender_role_label || "Order participant"}
          </span>
          {message.is_internal && (
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600">
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
                className="block max-w-full truncate rounded-lg border border-current/10 bg-white/60 px-2.5 py-2 text-xs underline dark:bg-black/10"
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
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 ${sizeClass}`}
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
          <ImageIcon size={large || modal ? 36 : 28} className="mx-auto text-slate-300" />
          {(large || modal) && (
            <p className="mt-2 text-[10px] font-semibold text-slate-400">
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
      className={`rounded-2xl border p-3.5 ${
        orange
          ? "border-orange-100 bg-[#fff7ed] dark:border-orange-500/20 dark:bg-orange-500/10"
          : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
      }`}
    >
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 break-words text-sm font-extrabold ${
          orange
            ? "text-[#c66c0b] dark:text-orange-300"
            : "text-slate-800 dark:text-white"
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={14} />
        <p className="text-[10px] font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-white/75">
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
      <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-white/65">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

const packageInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50 dark:border-white/10 dark:bg-white/5 dark:text-white";

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
      className="inline-flex items-center gap-2 rounded-xl bg-[#f7941d] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
    >
      <Icon size={16} />
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
      <p className="mt-3 text-xs text-slate-400">
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
    <p className="mt-3 text-xs leading-5 text-slate-500">
      {parts.join(", ")}
    </p>
  );
}
