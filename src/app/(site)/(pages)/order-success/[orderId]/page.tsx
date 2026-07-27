"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMyPayments, useOrder } from "@/hooks/useCommerce";
import { formatCurrency } from "@/lib/formatCurrency";

export default function OrderSuccessPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const order = useOrder(orderId);
  const payments = useMyPayments();
  const payment = payments.data?.find((item) => item.order_id === orderId);

  if (order.isLoading || payments.isLoading) {
    return <section className="py-20 text-center">Loading order confirmation…</section>;
  }

  if (order.error || !order.data) {
    return (
      <section className="py-20 text-center">
        <h1 className="text-2xl font-semibold">Order confirmation is unavailable</h1>
        <Link href="/account/orders" className="mt-4 inline-block text-blue">View your orders</Link>
      </section>
    );
  }

  const data = order.data;
  return (
    <section className="bg-gray-2 py-20 dark:bg-darkTheme-bg">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-1 dark:bg-darkTheme-card">
        <p className="font-semibold text-green">Order received</p>
        <h1 className="mt-2 text-3xl font-semibold text-dark dark:text-white">Thank you for your order</h1>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-dark-4">Order number</dt><dd className="break-all font-medium">{data.id}</dd></div>
          <div><dt className="text-sm text-dark-4">Order status</dt><dd className="font-medium capitalize">{data.status}</dd></div>
          <div><dt className="text-sm text-dark-4">Payment status</dt><dd className="font-medium capitalize">{payment?.status ?? "pending"}</dd></div>
          <div><dt className="text-sm text-dark-4">Total</dt><dd className="font-medium">{formatCurrency(data.total, data.currency)}</dd></div>
        </dl>
        <p className="mt-8 text-dark-4">
          Delivery progress and status updates will appear in your order details.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/account/orders/${data.id}`} className="rounded-lg bg-blue px-5 py-3 font-medium text-white">View order</Link>
          <Link href="/shop-with-sidebar" className="rounded-lg border border-gray-3 px-5 py-3 font-medium">Continue shopping</Link>
        </div>
      </div>
    </section>
  );
}
