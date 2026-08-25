"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Clock3,
  CreditCard,
  RefreshCw,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
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

      toast.success("A new payment attempt has been started.");
      router.replace(`/order-success/${orderId}`);
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
      <main className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-darkTheme-bg">
        <div className="mx-auto flex max-w-xl items-center justify-center gap-3 rounded-2xl bg-white p-8 shadow-sm dark:bg-darkTheme-card">
          <RefreshCw className="animate-spin" size={18} />
          Checking payment result…
        </div>
      </main>
    );
  }

  if (!order.data || !state) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-darkTheme-bg">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-darkTheme-card">
          <h1 className="text-xl font-bold">Payment result unavailable</h1>
          <Link href="/account/orders" className="mt-5 inline-flex rounded-xl bg-[#f7941d] px-5 py-3 font-bold text-white">
            View Orders
          </Link>
        </div>
      </main>
    );
  }

  const data = order.data;

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-6 dark:bg-darkTheme-bg sm:px-4 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center justify-between gap-3 px-1">
          <Link href="/">
            <img src="/images/logo/logo.png" alt="Xerin Marketplace" className="h-10 w-auto" />
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 shadow-sm dark:bg-darkTheme-card">
            <ShieldAlert size={13} /> Payment result
          </span>
        </div>

        <section className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm dark:border-amber-500/20 dark:bg-darkTheme-card">
          <div className="bg-amber-50 px-5 py-7 text-center dark:bg-amber-500/10 sm:px-8 sm:py-9">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-600 text-white">
              {timedOut ? <Clock3 size={32} /> : <AlertTriangle size={32} />}
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-[.16em] text-amber-700">
              {timedOut
                ? "Payment window expired"
                : providerCancelled
                  ? "Payment cancelled"
                  : "Payment not completed"}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {timedOut
                ? "This order has been cancelled"
                : providerCancelled
                  ? "The payment attempt was cancelled"
                  : "The payment attempt failed"}
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-white/60">
              {state.message}
            </p>
          </div>

          <div className="p-5 sm:p-8">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Info label="Order number" value={data.id} />
              <Info label="Order total" value={formatCurrency(data.total, data.currency)} />
              <Info label="Order status" value={state.order_status.replaceAll("_", " ")} capitalize />
              <Info label="Payment status" value={state.payment_status.replaceAll("_", " ")} capitalize />
            </dl>

            {timedOut ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Reserved inventory has been released. Because this order is terminal, payment cannot be retried against it. Place a new order if you still want the products.
              </div>
            ) : state.retryable && payment ? (
              <div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-white/10 sm:p-5">
                <h2 className="font-bold text-slate-900 dark:text-white">Retry payment</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  The same pending order is reused; Xerin does not create a duplicate order.
                </p>

                {payment.method === "mobile_money" && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold">
                      Mobile network
                      <select
                        value={provider}
                        onChange={(event) => setProvider(event.target.value)}
                        className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base dark:border-white/10 dark:bg-white/5 sm:text-sm"
                      >
                        <option value="">Select network</option>
                        {MNO_PROVIDERS.map((row) => <option key={row} value={row}>{row}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-semibold">
                      Mobile number
                      <input
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="2557XXXXXXXX"
                        className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base dark:border-white/10 dark:bg-white/5 sm:text-sm"
                      />
                    </label>
                  </div>
                )}

                {payment.method === "card" && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold dark:bg-white/5">
                    <CreditCard size={16} /> Secure card payment
                  </div>
                )}

                <button
                  type="button"
                  disabled={!canRetry || retrying}
                  onClick={() => void retryPayment()}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f7941d] px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {payment.method === "mobile_money" ? <Smartphone size={17} /> : <CreditCard size={17} />}
                  {retrying ? "Starting retry..." : "Retry Payment"}
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                This payment cannot currently be retried. You can review the order or return to the marketplace.
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/account/orders/${data.id}`}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-4 font-semibold text-slate-700 dark:border-white/10 dark:text-white"
              >
                View Order
              </Link>
              <Link
                href="/shop-with-sidebar"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-4 font-semibold text-slate-700 dark:border-white/10 dark:text-white"
              >
                {timedOut ? "Shop Again" : "Continue Shopping"}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 p-3 dark:border-white/10">
      <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white ${capitalize ? "capitalize" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
