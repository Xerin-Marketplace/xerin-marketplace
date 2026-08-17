"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { useOrder } from "@/hooks/useCommerce";
import { paymentsApi } from "@/lib/api/endpoints/commerce";
import { formatCurrency } from "@/lib/formatCurrency";
import type {
  OrderPaymentState,
  PaymentProviderErrorDetail,
} from "@/types/api/commerce";

type RetryContext = {
  method?: string;
  provider?: string;
  phone_number?: string;
};

const MNO_PROVIDERS = ["Airtel", "Tigo", "Halopesa", "Azampesa", "Mpesa"];

const retryStorageKey = (orderId: string) =>
  `xerin:payment-retry:${orderId}`;

const readRetryContext = (orderId: string): RetryContext => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(
      sessionStorage.getItem(retryStorageKey(orderId)) || "{}",
    ) as RetryContext;
  } catch {
    return {};
  }
};

export default function OrderSuccessPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const order = useOrder(orderId);

  const [paymentState, setPaymentState] =
    useState<OrderPaymentState | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [retryContext, setRetryContext] = useState<RetryContext>(() =>
    readRetryContext(orderId),
  );

  const payment = paymentState?.latest_payment ?? null;
  const method = retryContext.method || payment?.method || "";
  const [provider, setProvider] = useState(
    retryContext.provider || "",
  );
  const [phone, setPhone] = useState(
    retryContext.phone_number || "",
  );

  const refreshPaymentState = async (quiet = false) => {
    if (!quiet) setStatusLoading(true);
    setStatusError("");
    try {
      const next = await paymentsApi.orderState(orderId);
      setPaymentState(next);

      if (next.payment_status === "completed") {
        sessionStorage.removeItem(retryStorageKey(orderId));
        setRetryContext({});
      }

      return next;
    } catch (cause) {
      const error = cause as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      setStatusError(
        error.response?.data?.detail ||
          error.message ||
          "Unable to refresh payment status.",
      );
      return null;
    } finally {
      if (!quiet) setStatusLoading(false);
    }
  };

  useEffect(() => {
    void refreshPaymentState();
  }, [orderId]);

  useEffect(() => {
    const shouldPoll =
      paymentState?.payment_status === "pending" ||
      paymentState?.payment_status === "processing";

    if (!shouldPoll) return;

    const interval = window.setInterval(() => {
      void refreshPaymentState(true);
    }, Math.max(3000, (paymentState?.poll_after_seconds || 4) * 1000));

    return () => window.clearInterval(interval);
  }, [paymentState?.payment_status, paymentState?.poll_after_seconds, orderId]);

  useEffect(() => {
    if (!payment) return;

    if (!provider && method === "mobile_money") {
      const stored = readRetryContext(orderId);
      setProvider(stored.provider || "");
    }
    if (!phone && method === "mobile_money") {
      const stored = readRetryContext(orderId);
      setPhone(stored.phone_number || "");
    }
  }, [payment?.id, method, orderId]);

  const displayStatus = paymentState?.payment_status || "not_started";
  const isProcessing = ["pending", "processing"].includes(displayStatus);
  const isCompleted = displayStatus === "completed";
  const isFailed = ["failed", "cancelled"].includes(displayStatus);
  const isCod = payment?.method === "cash_on_delivery";

  const canRetry = useMemo(() => {
    if (!paymentState?.retryable || !payment) return false;
    if (payment.method === "mobile_money") {
      return Boolean(provider && phone.trim());
    }
    return payment.method === "card";
  }, [paymentState?.retryable, payment, provider, phone]);

  const retryPayment = async () => {
    if (!payment) {
      toast.error("The failed payment attempt could not be found.");
      return;
    }

    if (payment.method === "mobile_money" && (!provider || !phone.trim())) {
      toast.error("Choose a mobile network and enter the payment phone number.");
      return;
    }

    setRetrying(true);
    try {
      const successUrl = `${window.location.origin}/order-success/${orderId}`;
      const failureUrl = `${window.location.origin}/order-success/${orderId}`;

      const nextPayment = await paymentsApi.retry(payment.id, {
        provider:
          payment.method === "mobile_money"
            ? provider
            : undefined,
        phone_number:
          payment.method === "mobile_money"
            ? phone.trim()
            : undefined,
        success_url:
          payment.method === "card"
            ? successUrl
            : undefined,
        failure_url:
          payment.method === "card"
            ? failureUrl
            : undefined,
      });

      const context: RetryContext = {
        method: payment.method,
        provider:
          payment.method === "mobile_money"
            ? provider
            : "azampay",
        phone_number:
          payment.method === "mobile_money"
            ? phone.trim()
            : undefined,
      };
      sessionStorage.setItem(
        retryStorageKey(orderId),
        JSON.stringify(context),
      );
      setRetryContext(context);

      const checkoutUrl = nextPayment.provider_response?.checkout_url;
      if (payment.method === "card" && checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }

      toast.success(
        "Payment request sent. Xerin will update this page when AzamPay confirms the result.",
      );
      await refreshPaymentState(true);
    } catch (error: unknown) {
      const candidate = error as {
        response?: {
          data?: {
            detail?: string | PaymentProviderErrorDetail;
          };
        };
        message?: string;
      };
      const detail = candidate.response?.data?.detail;
      toast.error(
        typeof detail === "string"
          ? detail
          : detail?.message ||
              candidate.message ||
              "Payment provider is temporarily unavailable.",
      );
      await refreshPaymentState(true);
    } finally {
      setRetrying(false);
    }
  };

  if (order.isLoading || (statusLoading && !paymentState)) {
    return (
      <section className="py-20 text-center">
        Checking your order and payment status…
      </section>
    );
  }

  if (order.error || !order.data) {
    return (
      <section className="py-20 text-center">
        <h1 className="text-2xl font-semibold">
          Order confirmation is unavailable
        </h1>
        <Link href="/account/orders" className="mt-4 inline-block text-blue">
          View your orders
        </Link>
      </section>
    );
  }

  const data = order.data;

  return (
    <section className="bg-gray-2 py-16 dark:bg-darkTheme-bg">
      <div className="mx-auto max-w-2xl space-y-5 px-4">
        <div className="rounded-2xl bg-white p-8 shadow-1 dark:bg-darkTheme-card">
          <p className="font-semibold text-green">Order received</p>
          <h1 className="mt-2 text-3xl font-semibold text-dark dark:text-white">
            Thank you for your order
          </h1>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-dark-4">Order number</dt>
              <dd className="break-all font-medium">{data.id}</dd>
            </div>
            <div>
              <dt className="text-sm text-dark-4">Order status</dt>
              <dd className="font-medium capitalize">
                {paymentState?.order_status || data.status}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-dark-4">Payment status</dt>
              <dd className="font-medium capitalize">
                {displayStatus.replaceAll("_", " ")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-dark-4">Total</dt>
              <dd className="font-medium">
                {formatCurrency(data.total, data.currency)}
              </dd>
            </div>
          </dl>
        </div>

        {isProcessing && !isCod && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-900">
            <div className="flex items-start gap-3">
              <LoaderCircle size={20} className="mt-0.5 shrink-0 animate-spin" />
              <div className="flex-1">
                <h2 className="font-bold">
                  Waiting for payment confirmation
                </h2>
                <p className="mt-1 text-sm leading-6">
                  {paymentState?.message ||
                    "Complete the payment authorization with your provider. This page checks automatically for AzamPay confirmation."}
                </p>
                <p className="mt-2 text-xs text-blue-700">
                  You may keep this page open or return to your order later.
                  Xerin trusts the verified AzamPay callback, not the browser,
                  before marking payment successful.
                </p>
              </div>
            </div>
          </div>
        )}

        {isCod && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <div className="flex items-start gap-3">
              <Clock3 size={20} className="mt-0.5 shrink-0" />
              <div>
                <h2 className="font-bold">Cash on Delivery confirmed</h2>
                <p className="mt-1 text-sm">
                  Your order is active. Payment will be collected during delivery.
                </p>
              </div>
            </div>
          </div>
        )}

        {isFailed && !isCompleted && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 className="font-bold">
                  Your order is safe — payment was not completed
                </h2>
                <p className="mt-1 text-sm leading-6">
                  {paymentState?.message ||
                    "Retry payment against this same order. You do not need to rebuild your cart."}
                </p>

                {payment?.method === "mobile_money" && (
                  <div className="mt-4 grid gap-3 rounded-xl bg-white/70 p-4">
                    <label className="text-xs font-semibold">
                      Mobile network
                      <select
                        value={provider}
                        onChange={(event) => setProvider(event.target.value)}
                        className="mt-1 h-11 w-full rounded-lg border border-amber-200 bg-white px-3"
                      >
                        <option value="">Select network</option>
                        {MNO_PROVIDERS.map((row) => (
                          <option key={row} value={row}>{row}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-semibold">
                      Payment phone number
                      <input
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="2557XXXXXXXX"
                        className="mt-1 h-11 w-full rounded-lg border border-amber-200 bg-white px-3"
                      />
                    </label>
                  </div>
                )}

                {payment?.method === "card" && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/70 p-3 text-sm font-semibold">
                    <CreditCard size={15} />
                    AzamPay card payment
                  </div>
                )}

                <button
                  type="button"
                  disabled={!canRetry || retrying}
                  onClick={() => void retryPayment()}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#f7941d] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={retrying ? "animate-spin" : ""}
                  />
                  {retrying ? "Retrying..." : "Retry Payment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
            <CheckCircle2 size={20} className="mt-0.5" />
            <div>
              <p className="font-bold">Payment confirmed</p>
              <p className="mt-1 text-sm">
                {paymentState?.message ||
                  "Your payment was verified and your order is moving through fulfilment."}
              </p>
            </div>
          </div>
        )}

        {statusError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{statusError}</p>
            <button
              type="button"
              onClick={() => void refreshPaymentState()}
              className="mt-2 font-semibold underline"
            >
              Check again
            </button>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow-1 dark:bg-darkTheme-card">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void refreshPaymentState()}
              disabled={statusLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-3 px-5 py-3 font-medium disabled:opacity-50"
            >
              <RefreshCw size={14} className={statusLoading ? "animate-spin" : ""} />
              Refresh Payment
            </button>
            <Link
              href={`/account/orders/${data.id}`}
              className="rounded-lg bg-blue px-5 py-3 font-medium text-white"
            >
              View order
            </Link>
            <Link
              href="/shop-with-sidebar"
              className="rounded-lg border border-gray-3 px-5 py-3 font-medium"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
