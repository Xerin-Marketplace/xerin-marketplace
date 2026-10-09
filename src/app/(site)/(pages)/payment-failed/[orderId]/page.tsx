"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, Clock01Icon, CreditCardIcon, RefreshCwIcon, SmartPhone01Icon } from "@hugeicons/core-free-icons";
import { useOrder } from "@/hooks/useCommerce";
import { paymentsApi } from "@/lib/api/endpoints/commerce";
import type {
 OrderPaymentState,
 PaymentProviderErrorDetail,
} from "@/types/api/commerce";
import { formatCurrency } from "@/lib/formatCurrency";


type RetryContext = {
 method?: string;
 provider?: string;
 phone_number?: string;
};

const MNO_PROVIDERS = ["M-Pesa", "Airtel Money", "Mixx by Yas", "HaloPesa"];
const retryStorageKey = (orderId: string) => `xerin:payment-retry:${orderId}`;

function readRetryContext(orderId: string): RetryContext {
 if (typeof window === "undefined") return {};
 try {
 return JSON.parse(
 sessionStorage.getItem(retryStorageKey(orderId)) || "{}",
 ) as RetryContext;
 } catch {
 return {};
 }
}

export default function PaymentFailedPage() {
 const params = useParams<{ orderId: string }>();
 const router = useRouter();
 const orderId = params.orderId;
 const order = useOrder(orderId);

 const [state, setState] = useState<OrderPaymentState | null>(null);
 const [loadingState, setLoadingState] = useState(true);
 const [retrying, setRetrying] = useState(false);
 const stored = useMemo(() => readRetryContext(orderId), [orderId]);
 const [provider, setProvider] = useState(stored.provider || "");
 const [phone, setPhone] = useState(stored.phone_number || "");

 const refresh = async () => {
 setLoadingState(true);
 try {
 const next = await paymentsApi.orderState(orderId);
 setState(next);
 if (next.payment_status === "completed") {
 router.replace(`/payment-success/${orderId}`);
 } else if (
 next.payment_status === "pending" ||
 next.payment_status === "processing"
 ) {
 router.replace(`/order-success/${orderId}`);
 }
 } catch {
 toast.error("Unable to verify the latest payment state.");
 } finally {
 setLoadingState(false);
 }
 };

 useEffect(() => {
 void refresh();
 }, [orderId]);

 const payment = state?.latest_payment ?? null;

 useEffect(() => {
 if (!payment || payment.method !== "mobile_money") return;
 const saved = readRetryContext(orderId);
 if (!provider && saved.provider) setProvider(saved.provider);
 if (!phone && saved.phone_number) setPhone(saved.phone_number);
 }, [payment?.id, orderId]);

 const failureReason =
 payment?.failure_reason?.trim() ||
 state?.message?.trim() ||
 "The payment provider did not complete this payment.";

 const timedOut =
 state?.order_status === "cancelled" &&
 order.data?.cancellation_reason === "payment_confirmation_timeout";
 const providerCancelled =
 !timedOut && state?.payment_status === "cancelled";
 const failed = state?.payment_status === "failed";

 const canRetry = Boolean(
 state?.retryable &&
 payment &&
 (payment.method === "card" ||
 (payment.method === "mobile_money" && provider && phone.trim())),
 );

 const retryPayment = async () => {
 if (!payment || !canRetry) return;
 setRetrying(true);
 try {
 const successUrl = `${window.location.origin}/order-success/${orderId}`;
 const failureUrl = `${window.location.origin}/payment-failed/${orderId}`;
 const next = await paymentsApi.retry(payment.id, {
 provider: payment.method === "mobile_money" ? provider : undefined,
 phone_number:
 payment.method === "mobile_money" ? phone.trim() : undefined,
 success_url: payment.method === "card" ? successUrl : undefined,
 failure_url: payment.method === "card" ? failureUrl : undefined,
 });

 sessionStorage.setItem(
 retryStorageKey(orderId),
 JSON.stringify({
 method: payment.method,
 provider:
 payment.method === "mobile_money"
 ? provider
 : payment.provider || "azampay",
 phone_number:
 payment.method === "mobile_money" ? phone.trim() : undefined,
 }),
 );

 const checkoutUrl = next.provider_response?.checkout_url;
 if (payment.method === "card" && checkoutUrl) {
 window.location.assign(checkoutUrl);
 return;
 }

 toast.success(
 payment.method === "mobile_money"
 ? "A new payment request has been sent. Check your phone and complete the authorization."
 : "A new payment attempt has been started.",
 );
 router.replace(`/order-success/${orderId}?payment_id=${next.id}&payment=${next.status}`);
 } catch (cause: unknown) {
 const error = cause as {
 response?: { data?: { detail?: string | PaymentProviderErrorDetail } };
 message?: string;
 };
 const detail = error.response?.data?.detail;
 toast.error(
 typeof detail === "string"
 ? detail
 : detail?.message ||
 error.message ||
 "Unable to retry this payment.",
 );
 await refresh();
 } finally {
 setRetrying(false);
 }
 };

 if (order.isLoading || loadingState) {
 return (
 <main className="grid min-h-screen place-items-center bg-background px-4">
 <div className="flex items-center gap-3 text-sm text-muted-foreground">
 <HugeiconsIcon icon={RefreshCwIcon} className="animate-spin" size={18} />
 Checking your payment…
 </div>
 </main>
 );
 }

 if (!order.data || !state) {
 return (
 <main className="grid min-h-screen place-items-center bg-background px-4">
 <div className="max-w-sm text-center">
 <h1 className="text-xl font-bold">We could not load this payment</h1>
 <Link href="/account/orders" className="mt-6 inline-flex h-12 items-center rounded-xl bg-primary px-6 font-bold text-white">
 View my orders
 </Link>
 </div>
 </main>
 );
 }

 const data = order.data;
 const reference = data.order_number || data.id.slice(0, 8).toUpperCase();

 const headline = timedOut
 ? "Payment time ran out"
 : providerCancelled
 ? "Payment cancelled"
 : "Payment did not go through";

 const friendlyMessage = timedOut
 ? "The payment was not completed in time, so this order was cancelled and the items were released. No money was taken."
 : providerCancelled
 ? "You cancelled the payment prompt on your phone. No money was taken."
 : failureReason + " No money was taken for this attempt.";

 return (
 <main className="min-h-screen bg-background px-4 pb-16 pt-10 sm:pt-14">
 <div className="mx-auto w-full max-w-md">
 <Link href="/">
 <img src="/images/logo/logooriginal.png" alt="Xerin Marketplace" className="h-10 w-auto" />
 </Link>

 <span className={`mt-10 grid h-14 w-14 place-items-center rounded-full ${timedOut ? "bg-yellow-light-4 text-yellow-dark-2" : "bg-red-light-6 text-red-dark"}`}>
 <HugeiconsIcon icon={timedOut ? Clock01Icon : Alert02Icon} size={28} />
 </span>

 <h1 className="mt-5 text-2xl font-bold text-foreground sm:text-3xl">
 {headline}
 </h1>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">
 {friendlyMessage}
 </p>

 <dl className="mt-8 divide-y divide-border/60">
 <div className="flex items-center justify-between gap-4 py-3.5">
 <dt className="text-sm text-muted-foreground">Order</dt>
 <dd className="text-sm font-semibold text-foreground">#{reference}</dd>
 </div>
 <div className="flex items-center justify-between gap-4 py-3.5">
 <dt className="text-sm text-muted-foreground">Total</dt>
 <dd className="text-sm font-bold text-foreground">{formatCurrency(data.total, data.currency)}</dd>
 </div>
 <div className="flex items-center justify-between gap-4 py-3.5">
 <dt className="text-sm text-muted-foreground">Status</dt>
 <dd className="text-sm font-medium capitalize text-foreground">{state.payment_status.replaceAll("_", " ")}</dd>
 </div>
 </dl>

 {timedOut ? (
 <p className="mt-6 rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
 This order cannot be paid anymore — place a new order if you still want the items.
 </p>
 ) : state.retryable && payment ? (
 <div className="mt-8">
 <h2 className="text-base font-bold text-foreground">Try paying again</h2>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 Same order — no duplicate will be created.
 </p>

 {payment.method === "mobile_money" && (
 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 <label className="text-xs font-semibold text-foreground">
 Mobile network
 <select
 value={provider}
 onChange={(event) => setProvider(event.target.value)}
 className="mt-1.5 h-12 w-full rounded-xl bg-muted px-3 text-base outline-none focus:ring-2 focus:ring-primary/25 sm:text-sm"
 >
 <option value="">Select network</option>
 {MNO_PROVIDERS.map((row) => <option key={row} value={row}>{row}</option>)}
 </select>
 </label>
 <label className="text-xs font-semibold text-foreground">
 Mobile number
 <input
 value={phone}
 onChange={(event) => setPhone(event.target.value)}
 placeholder="2557XXXXXXXX"
 className="mt-1.5 h-12 w-full rounded-xl bg-muted px-3 text-base outline-none focus:ring-2 focus:ring-primary/25 sm:text-sm"
 />
 </label>
 </div>
 )}

 <button
 type="button"
 disabled={!canRetry || retrying}
 onClick={() => void retryPayment()}
 className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
 >
 {payment.method === "mobile_money" ? <HugeiconsIcon icon={SmartPhone01Icon} size={17} /> : <HugeiconsIcon icon={CreditCardIcon} size={17} />}
 {retrying ? "Starting…" : "Retry payment"}
 </button>
 </div>
 ) : (
 <p className="mt-6 rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
 This order can no longer be paid. Place a new order if you still want the items.
 </p>
 )}

 <div className="mt-8 grid gap-3 sm:grid-cols-2">
 <Link
 href={`/account/orders/${data.id}`}
 className="inline-flex min-h-12 items-center justify-center rounded-xl bg-muted px-4 font-semibold text-foreground"
 >
 View order
 </Link>
 <Link
 href="/"
 className="inline-flex min-h-12 items-center justify-center rounded-xl bg-muted px-4 font-semibold text-foreground"
 >
 {timedOut ? "Shop again" : "Continue shopping"}
 </Link>
 </div>
 </div>
 </main>
 );
}
