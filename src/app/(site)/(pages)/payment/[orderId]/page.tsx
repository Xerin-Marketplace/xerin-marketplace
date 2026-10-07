"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import {
 Alert02Icon,
 ArrowLeft01Icon,
 CreditCardIcon,
 Money03Icon,
 RefreshCwIcon,
 ShieldCheckIcon,
 SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/Spinner";
import { useOrder } from "@/hooks/useCommerce";
import { checkoutApi, paymentsApi } from "@/lib/api/endpoints/commerce";
import type { OrderPaymentState, PaymentOption, PaymentProviderErrorDetail } from "@/types/api/commerce";
import { formatCurrency } from "@/lib/formatCurrency";

const retryStorageKey = (orderId: string) => `xerin:payment-retry:${orderId}`;
const iconFor = (method: string) =>
 method === "mobile_money" ? SmartPhone01Icon : method === "cash_on_delivery" ? Money03Icon : CreditCardIcon;

export default function PaymentPage() {
 const params = useParams<{ orderId: string }>();
 const router = useRouter();
 const orderId = params.orderId;
 const order = useOrder(orderId);

 const [options, setOptions] = useState<PaymentOption[]>([]);
 const [optionsLoading, setOptionsLoading] = useState(true);
 const [method, setMethod] = useState("");
 const [provider, setProvider] = useState("");
 const [phone, setPhone] = useState("");
 const [paying, setPaying] = useState(false);
 const [listening, setListening] = useState<OrderPaymentState | null>(null);
 const [stateError, setStateError] = useState("");

 // Fetch payment options + any in-flight payment state
 useEffect(() => {
 let cancelled = false;
 (async () => {
 try {
 const [opts, state] = await Promise.all([
 checkoutApi.paymentOptions(true),
 paymentsApi.orderState(orderId).catch(() => null),
 ]);
 if (cancelled) return;
 setOptions(opts);
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

 // Redirect once the payment resolves
 useEffect(() => {
 if (!listening) return;
 if (listening.payment_status === "completed") router.replace(`/payment-success/${orderId}`);
 else if (["failed", "cancelled"].includes(listening.payment_status)) router.replace(`/payment-failed/${orderId}`);
 }, [listening?.payment_status, orderId, router]);

 // Poll while the provider is processing the payment
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

 const selectedOption = options.find((o) => o.id === method);
 const isListening = Boolean(listening && ["pending", "processing"].includes(listening.payment_status));
 const amount = listening?.latest_payment ? Number(listening.latest_payment.amount) : Number(order.data?.total || 0);
 const currency = order.data?.currency || "TZS";

 const canPay = Boolean(
 method &&
 (method === "cash_on_delivery" ||
 method === "card" ||
 (selectedOption?.requires_phone ? provider && phone.trim().length >= 9 : true)),
 );

 const pay = async () => {
 if (!order.data || !canPay) return;
 setPaying(true);
 try {
 const payment = await paymentsApi.initiate({
 order_id: String(order.data.id),
 method,
 provider: method === "cash_on_delivery" ? undefined : provider || undefined,
 phone_number: selectedOption?.requires_phone ? phone.trim() : undefined,
 success_url: method === "card" ? `${window.location.origin}/order-success/${orderId}?payment=success` : undefined,
 failure_url: method === "card" ? `${window.location.origin}/payment-failed/${orderId}` : undefined,
 });

 sessionStorage.setItem(
 retryStorageKey(orderId),
 JSON.stringify({ method, provider: provider || undefined, phone_number: phone.trim() || undefined }),
 );

 if (method === "cash_on_delivery") {
 toast.success("Order placed — pay when your delivery arrives.");
 router.push(`/order-success/${orderId}?payment=cod`);
 return;
 }

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
 <main className="grid min-h-screen place-items-center bg-background px-4">
 <div className="flex w-full max-w-xs items-center gap-4 rounded-2xl bg-muted p-4">
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
 <main className="grid min-h-screen place-items-center bg-background px-4">
 <div className="max-w-sm text-center">
 <h1 className="text-xl font-bold">Order not found</h1>
 <Link href="/account/orders" className="mt-6 inline-flex h-12 items-center rounded-xl bg-primary px-6 font-bold text-white">My orders</Link>
 </div>
 </main>
 );
 }

 const data = order.data;

 /* Listening state — "approve on your phone" view */
 if (isListening && listening) {
 return (
 <main className="min-h-screen bg-background px-4 py-12">
 <div className="mx-auto w-full max-w-md">
 <Link href="/">
 <img src="/images/logo/logooriginal.png" alt="Xerin Mart" className="h-10 w-auto" />
 </Link>

 <div className="mt-12 flex items-center gap-4 rounded-2xl bg-muted p-5">
 <Spinner size={26} />
 <div className="min-w-0 flex-1">
 <p className="truncate text-base font-bold text-foreground">Processing payment…</p>
 <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
 Approve the prompt on your phone — this updates automatically.
 </p>
 </div>
 <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">{formatCurrency(amount, currency)}</span>
 </div>

 <dl className="mt-8 divide-y divide-border/60">
 <div className="flex items-center justify-between py-3.5">
 <dt className="text-sm text-muted-foreground">Order</dt>
 <dd className="text-sm font-semibold">#{data.order_number || data.id.slice(0, 8).toUpperCase()}</dd>
 </div>
 <div className="flex items-center justify-between py-3.5">
 <dt className="text-sm text-muted-foreground">Waiting for</dt>
 <dd className="text-sm font-semibold capitalize">{(listening.latest_payment?.provider || provider || "your network").replaceAll("_", " ")}</dd>
 </div>
 </dl>

 {stateError && <p className="mt-4 text-xs text-muted-foreground">{stateError}</p>}

 <div className="mt-8 grid gap-3">
 <Link href={`/account/orders/${data.id}`} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-muted px-4 text-sm font-semibold">
 Leave this page — the order keeps processing
 </Link>
 </div>
 </div>
 </main>
 );
 }

 /* Method picker */
 return (
 <main className="min-h-screen bg-background px-4 pb-16 pt-8 sm:pt-10">
 <div className="mx-auto w-full max-w-md">
 <Link href="/">
 <img src="/images/logo/logooriginal.png" alt="Xerin Mart" className="h-10 w-auto" />
 </Link>

 <Link href={`/account/orders/${data.id}`} className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
 <HugeiconsIcon icon={ArrowLeft01Icon} size={15} /> Back to order
 </Link>

 <div className="mt-5 flex items-end justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-foreground">Pay for your order</h1>
 <p className="mt-1 text-sm text-muted-foreground">#{data.order_number || data.id.slice(0, 8).toUpperCase()}</p>
 </div>
 <p className="text-2xl font-bold text-primary">{formatCurrency(Number(data.total || 0), data.currency)}</p>
 </div>

 <div className="mt-8">
 <p className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Payment method</p>
 {optionsLoading ? (
 <div className="mt-4 flex items-center gap-3 rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
 <Spinner size={18} /> Loading payment methods…
 </div>
 ) : (
 <div className="mt-3 space-y-2">
 {options.map((opt) => {
 const Icon = iconFor(opt.id);
 const active = method === opt.id;
 const disabled = opt.id === "card" && !(opt as PaymentOption & { enabled?: boolean }).enabled && false;
 return (
 <button
 key={opt.id}
 type="button"
 disabled={disabled}
 onClick={() => setMethod(opt.id)}
 className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left transition ${
 active ? "bg-primary/10 ring-2 ring-primary/40" : "bg-muted hover:bg-muted/70"
 }`}
 >
 <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${active ? "bg-primary text-white" : "bg-background text-foreground"}`}>
 <HugeiconsIcon icon={Icon} size={20} />
 </span>
 <span className="min-w-0 flex-1">
 <span className="block text-sm font-bold text-foreground">{opt.label}</span>
 <span className="mt-0.5 block text-xs text-muted-foreground">
 {opt.id === "mobile_money"
 ? "M-Pesa, Airtel Money, Mixx, HaloPesa"
 : opt.id === "cash_on_delivery"
 ? "Pay cash when your order arrives"
 : "Visa or Mastercard"}
 </span>
 </span>
 <span className={`h-5 w-5 shrink-0 rounded-full ring-2 ${active ? "bg-primary ring-primary" : "bg-transparent ring-border"}`} />
 </button>
 );
 })}
 </div>
 )}

 {selectedOption?.requires_phone && (
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 <label className="text-xs font-semibold text-foreground">
 Mobile network
 <select
 value={provider}
 onChange={(event) => setProvider(event.target.value)}
 className="mt-1.5 h-12 w-full rounded-xl bg-muted px-3 text-base outline-none focus:ring-2 focus:ring-primary/25 sm:text-sm"
 >
 <option value="">Select network</option>
 {selectedOption.providers.map((name) => <option key={name} value={name}>{name}</option>)}
 </select>
 </label>
 <label className="text-xs font-semibold text-foreground">
 Mobile number
 <input
 type="tel"
 value={phone}
 onChange={(event) => setPhone(event.target.value)}
 placeholder="2557XXXXXXXX"
 className="mt-1.5 h-12 w-full rounded-xl bg-muted px-3 text-base outline-none focus:ring-2 focus:ring-primary/25 sm:text-sm"
 />
 </label>
 </div>
 )}

 {method === "cash_on_delivery" && (
 <p className="mt-4 flex items-start gap-2 rounded-xl bg-muted p-4 text-xs leading-5 text-muted-foreground">
 <HugeiconsIcon icon={ShieldCheckIcon} size={16} className="mt-0.5 shrink-0 text-primary" />
 Pay in cash or mobile money when your delivery arrives. Nothing is charged now.
 </p>
 )}

 <button
 type="button"
 disabled={!canPay || paying}
 onClick={() => void pay()}
 className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
 >
 {paying ? <Spinner size={18} /> : <HugeiconsIcon icon={method === "mobile_money" ? SmartPhone01Icon : CreditCardIcon} size={18} />}
 {paying
 ? "Starting payment…"
 : method === "cash_on_delivery"
 ? "Place order — pay on delivery"
 : `Pay ${formatCurrency(Number(data.total || 0), data.currency)}`}
 </button>

 <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
 <HugeiconsIcon icon={ShieldCheckIcon} size={13} /> Payments are encrypted and processed securely by Xerin
 </p>
 </div>
 </div>
 </main>
 );
}
