"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import {
 ArrowLeft01Icon,
 CreditCardIcon,
 ShieldCheckIcon,
 SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/Spinner";
import { useOrder } from "@/hooks/useCommerce";
import { cartApi, checkoutApi, paymentsApi } from "@/lib/api/endpoints/commerce";
import type { OrderPaymentState, PaymentOption, PaymentProviderErrorDetail } from "@/types/api/commerce";
import { formatCurrency } from "@/lib/formatCurrency";

const retryStorageKey = (orderId: string) => `xerin:payment-retry:${orderId}`;

const MNO_LOGOS = ["Vodacom M-Pesa", "Airtel Money", "Mixx by Yas", "HaloPesa"];
const CARD_LOGOS = ["VISA", "Mastercard"];

export default function PaymentPage() {
 const params = useParams<{ orderId: string }>();
 const router = useRouter();
 const orderId = params.orderId;
 const order = useOrder(orderId);

 const [options, setOptions] = useState<PaymentOption[]>([]);
 const [optionsLoading, setOptionsLoading] = useState(true);
 const [method, setMethod] = useState<"mobile_money" | "card">("mobile_money");
 const [provider, setProvider] = useState("");
 const [phone, setPhone] = useState("");
 const [paying, setPaying] = useState(false);
 const [listening, setListening] = useState<OrderPaymentState | null>(null);
 const [stateError, setStateError] = useState("");

 useEffect(() => {
 let cancelled = false;
 (async () => {
 try {
 const [opts, state] = await Promise.all([
 checkoutApi.paymentOptions(true),
 paymentsApi.orderState(orderId).catch(() => null),
 ]);
 if (cancelled) return;
 setOptions(opts.filter((o) => o.id === "mobile_money" || o.id === "card"));
 if (state) setListening(state);
 } catch {
 toast.error("Could not load payment methods.");
 } finally {
 if (!cancelled) setOptionsLoading(false);
 }
 })();
 return () => {
 cancelled = true;
 };
 }, [orderId]);

 useEffect(() => {
 if (listening?.payment_status === "completed") router.replace(`/payment-success/${orderId}`);
 }, [listening?.payment_status, orderId, router]);

 useEffect(() => {
 if (!listening || !["pending", "processing"].includes(listening.payment_status)) return;
 const tick = async () => {
 try {
 let next = await paymentsApi.orderState(orderId);
 const latest = next.latest_payment;
 if (
 latest?.id &&
 ["zenopay", "selcom"].includes((latest.provider || "").toLowerCase()) &&
 ["pending", "processing"].includes(next.payment_status)
 ) {
 try {
 const verified = await paymentsApi.verifyStatus(latest.id);
 if (["completed", "failed", "cancelled"].includes(verified.status)) {
 next = await paymentsApi.orderState(orderId);
 }
 } catch {
 /* webhook may arrive shortly — keep polling */
 }
 }
 setListening(next);
 setStateError("");
 } catch {
 setStateError("Still listening — could not refresh the status just now.");
 }
 };
 const interval = window.setInterval(tick, Math.max(5000, (listening.poll_after_seconds || 5) * 1000));
 return () => window.clearInterval(interval);
 }, [listening?.payment_status, listening?.poll_after_seconds, orderId]);

 const mobileOption = options.find((o) => o.id === "mobile_money");
 const isListening = Boolean(listening && ["pending", "processing"].includes(listening.payment_status));
 const orderCancelled = Boolean(order.data && ["cancelled", "refunded"].includes(order.data.status));
 const paymentFailed = Boolean(listening && ["failed", "cancelled"].includes(listening.payment_status));
 const dead = orderCancelled || paymentFailed;
 const amount = listening?.latest_payment ? Number(listening.latest_payment.amount) : Number(order.data?.total || 0);
 const currency = order.data?.currency || "TZS";

 const canPay =
 method === "mobile_money" ? provider && phone.trim().length >= 9 : method === "card";

 const [reordering, setReordering] = useState(false);
 const reorder = async () => {
 if (!order.data) return;
 setReordering(true);
 try {
 await cartApi.merge(
 order.data.items.map((item) => ({
 product_id: item.product_id,
 variant_id: item.variant_id || undefined,
 quantity: item.quantity,
 })),
 );
 router.push("/checkout");
 } catch {
 toast.error("Could not rebuild your order — please add the items again.");
 setReordering(false);
 }
 };

 const pay = async () => {
 if (!order.data || !canPay) return;
 setPaying(true);
 try {
 const payload = {
 provider: method === "mobile_money" ? provider : undefined,
 phone_number: method === "mobile_money" ? phone.trim() : undefined,
 success_url: method === "card" ? `${window.location.origin}/order-success/${orderId}?payment=success` : undefined,
 failure_url: method === "card" ? `${window.location.origin}/payment-failed/${orderId}` : undefined,
 };

 const retryable = listening?.latest_payment;
 let payment;
 if (retryable && ["failed", "cancelled"].includes(retryable.status)) {
 payment = await paymentsApi.retry(retryable.id, payload);
 } else {
 payment = await paymentsApi.initiate({ order_id: String(order.data.id), method, ...payload });
 }

 sessionStorage.setItem(
 retryStorageKey(orderId),
 JSON.stringify({ method, provider: provider || undefined, phone_number: phone.trim() || undefined }),
 );

 const checkoutUrl = payment.provider_response?.checkout_url;
 if (method === "card" && checkoutUrl) {
 window.location.assign(checkoutUrl);
 return;
 }

 toast.success("Payment request sent — approve it on your phone.");
 setListening(await paymentsApi.orderState(orderId));
 } catch (cause: unknown) {
 const err = cause as { response?: { data?: { detail?: string | PaymentProviderErrorDetail } }; message?: string };
 const detail = err.response?.data?.detail;
 toast.error(typeof detail === "string" ? detail : detail?.message || err.message || "Unable to start the payment.");
 } finally {
 setPaying(false);
 }
 };

 if (order.isLoading) {
 return (
 <main className="grid min-h-screen place-items-center bg-muted px-4">
 <div className="flex w-full max-w-xs items-center gap-4 rounded-2xl bg-card p-4">
 <Spinner size={20} />
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-semibold">Loading payment…</p>
 <p className="text-xs text-muted-foreground">Preparing your order total</p>
 </div>
 </div>
 </main>
 );
 }

 if (!order.data) {
 return (
 <main className="grid min-h-screen place-items-center bg-muted px-4">
 <div className="rounded-2xl bg-card p-10 text-center">
 <h1 className="text-xl font-bold">Order not found</h1>
 <Link href="/account/orders" className="mt-6 inline-flex h-12 items-center rounded-xl bg-primary px-6 font-bold text-white">My orders</Link>
 </div>
 </main>
 );
 }

 const data = order.data;

 /* Listening — waiting for the phone prompt */
 if (isListening && listening) {
 return (
 <main className="min-h-screen bg-muted px-4 py-12">
 <div className="mx-auto w-full max-w-md">
 <Link href="/">
 <img src="/images/logo/logooriginal.png" alt="Xerin Mart" className="h-10 w-auto" />
 </Link>

 <div className="mt-12 flex items-center gap-4 rounded-2xl bg-card p-5">
 <Spinner size={26} />
 <div className="min-w-0 flex-1">
 <p className="truncate text-base font-bold text-foreground">Processing payment…</p>
 <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
 Approve the prompt on your phone — this updates automatically.
 </p>
 </div>
 <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">{formatCurrency(amount, currency)}</span>
 </div>

 <div className="mt-4 rounded-2xl bg-card p-5">
 <dl className="divide-y divide-border/60">
 <div className="flex items-center justify-between py-3">
 <dt className="text-sm text-muted-foreground">Order</dt>
 <dd className="text-sm font-semibold">#{data.order_number || data.id.slice(0, 8).toUpperCase()}</dd>
 </div>
 <div className="flex items-center justify-between py-3">
 <dt className="text-sm text-muted-foreground">Waiting for</dt>
 <dd className="text-sm font-semibold capitalize">{(listening.latest_payment?.provider || provider || "your network").replaceAll("_", " ")}</dd>
 </div>
 </dl>
 </div>

 {stateError && <p className="mt-4 text-center text-xs text-muted-foreground">{stateError}</p>}

 <Link href={`/account/orders/${data.id}`} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-card px-4 text-sm font-semibold">
 Leave this page — the order keeps processing
 </Link>
 </div>
 </main>
 );
 }

 /* Dead order — offer a one-tap rebuild instead of a dead end */
 if (dead) {
 const expired = orderCancelled;
 return (
 <main className="min-h-screen bg-muted px-4 py-12">
 <div className="mx-auto w-full max-w-md">
 <Link href="/">
 <img src="/images/logo/logooriginal.png" alt="Xerin Mart" className="h-10 w-auto" />
 </Link>

 <div className="mt-12 rounded-2xl bg-card p-6 sm:p-7">
 <h1 className="text-xl font-bold text-foreground">
 {expired ? "This order expired" : "Payment did not go through"}
 </h1>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">
 {expired
 ? "The payment window ran out before the order was paid. No money was taken — rebuild it with one tap."
 : listening?.message?.trim() || "No money was taken. You can start a fresh payment or rebuild the order."}
 </p>

 <dl className="mt-5 divide-y divide-border/60">
 <div className="flex items-center justify-between py-3">
 <dt className="text-sm text-muted-foreground">Order</dt>
 <dd className="text-sm font-semibold">#{data.order_number || data.id.slice(0, 8).toUpperCase()}</dd>
 </div>
 <div className="flex items-center justify-between py-3">
 <dt className="text-sm text-muted-foreground">Total</dt>
 <dd className="text-sm font-bold">{formatCurrency(Number(data.total || 0), data.currency)}</dd>
 </div>
 </dl>

 {!expired && !orderCancelled ? (
 <button
 type="button"
 onClick={() => setListening(null)}
 className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-xl bg-primary py-4 font-bold text-white"
 >
 Try another payment
 </button>
 ) : (
 <button
 type="button"
 disabled={reordering}
 onClick={() => void reorder()}
 className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white disabled:opacity-50"
 >
 {reordering && <Spinner size={18} />}
 {reordering ? "Rebuilding your order…" : "Order these items again"}
 </button>
 )}

 <Link href="/" className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-muted px-4 text-sm font-semibold">
 Back to shop
 </Link>
 </div>
 </div>
 </main>
 );
 }

 /* Method picker + summary */
 return (
 <main className="min-h-screen bg-muted px-4 pb-16 pt-8 sm:pt-10">
 <div className="mx-auto w-full max-w-4xl">
 <div className="flex items-center justify-between">
 <Link href="/">
 <img src="/images/logo/logooriginal.png" alt="Xerin Mart" className="h-9 w-auto" />
 </Link>
 <Link href={`/account/orders/${data.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
 <HugeiconsIcon icon={ArrowLeft01Icon} size={15} /> Order #{data.order_number || data.id.slice(0, 8).toUpperCase()}
 </Link>
 </div>

 <h1 className="mt-6 text-2xl font-bold text-foreground">Payment</h1>

 {/* Method tabs */}
 {optionsLoading ? (
 <div className="mt-4 flex items-center gap-3 rounded-2xl bg-card p-5 text-sm text-muted-foreground">
 <Spinner size={18} /> Loading payment methods…
 </div>
 ) : (
 <>
 <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-card p-1.5">
 {(["mobile_money", "card"] as const).map((id) => {
 const active = method === id;
 const Icon = id === "mobile_money" ? SmartPhone01Icon : CreditCardIcon;
 return (
 <button
 key={id}
 type="button"
 onClick={() => setMethod(id)}
 className={`flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold transition ${
 active ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
 }`}
 >
 <HugeiconsIcon icon={Icon} size={18} />
 {id === "mobile_money" ? "Mobile Money" : "Card"}
 </button>
 );
 })}
 </div>

 <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1fr_340px]">
 {/* Method form */}
 <div className="rounded-2xl bg-card p-5 sm:p-6">
 {method === "mobile_money" ? (
 <div>
 <div className="grid gap-4 sm:grid-cols-2">
 <label className="text-sm font-semibold text-foreground">
 Mobile network*
 <select
 value={provider}
 onChange={(event) => setProvider(event.target.value)}
 className="mt-2 h-12 w-full rounded-xl bg-muted px-3 text-base outline-none focus:ring-2 focus:ring-primary/25 sm:text-sm"
 >
 <option value="">Select network</option>
 {(mobileOption?.providers ?? []).map((name) => <option key={name} value={name}>{name}</option>)}
 </select>
 </label>
 <label className="text-sm font-semibold text-foreground">
 Mobile number*
 <input
 type="tel"
 value={phone}
 onChange={(event) => setPhone(event.target.value)}
 placeholder="2557XXXXXXXX"
 className="mt-2 h-12 w-full rounded-xl bg-muted px-3 text-base outline-none focus:ring-2 focus:ring-primary/25 sm:text-sm"
 />
 </label>
 </div>
 <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
 <HugeiconsIcon icon={ShieldCheckIcon} size={15} className="mt-0.5 shrink-0 text-primary" />
 You will get a secure prompt on this number — approve it to complete the payment.
 </p>
 </div>
 ) : (
 <div>
 <p className="text-sm leading-6 text-muted-foreground">
 You will be taken to our secure card checkout to enter your Visa or Mastercard details — we never handle your card number.
 </p>
 <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
 <HugeiconsIcon icon={ShieldCheckIcon} size={15} className="text-primary" />
 Encrypted card processing by Selcom Pay
 </div>
 </div>
 )}

 <button
 type="button"
 disabled={!canPay || paying}
 onClick={() => void pay()}
 className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
 >
 {paying && <Spinner size={18} />}
 {paying ? "Starting payment…" : `Pay ${formatCurrency(amount, currency)}`}
 </button>
 </div>

 {/* Summary */}
 <div className="rounded-2xl bg-card p-5 sm:p-6">
 <dl className="space-y-3 text-sm">
 <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-semibold">{formatCurrency(Number(data.subtotal || 0), currency)}</dd></div>
 {Number(data.discount_amount || 0) > 0 && (
 <div className="flex justify-between"><dt className="text-muted-foreground">Savings</dt><dd className="font-semibold text-green-dark">-{formatCurrency(Number(data.discount_amount), currency)}</dd></div>
 )}
 <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd className="font-semibold">{formatCurrency(Number(data.shipping_amount || 0), currency)}</dd></div>
 {Number(data.tax_amount || 0) > 0 && (
 <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd className="font-semibold">{formatCurrency(Number(data.tax_amount), currency)}</dd></div>
 )}
 <div className="flex justify-between border-t border-border/60 pt-3 text-base"><dt className="font-bold">Total</dt><dd className="font-bold">{formatCurrency(Number(data.total || 0), currency)}</dd></div>
 </dl>

 <div className="mt-6 flex flex-wrap items-center gap-2">
 {(method === "mobile_money" ? MNO_LOGOS : CARD_LOGOS).map((name) => (
 <span key={name} className="rounded-md bg-muted px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
 {name}
 </span>
 ))}
 </div>
 </div>
 </div>
 </>
 )}
 </div>
 </main>
 );
}
