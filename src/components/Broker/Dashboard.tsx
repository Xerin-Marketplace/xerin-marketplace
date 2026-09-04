"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  LockKeyhole,
  Package,
  MapPin,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { brokersApi } from "@/lib/api/endpoints/brokers";
import type { Broker, BrokerAnalyticsOverview } from "@/types/api/broker";

const labels: Record<string, string> = {
  pending_kyc: "Complete KYC",
  kyc_submitted: "KYC Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Action Required",
  suspended: "Suspended",
};

const money = (value: string | number, currency = "TZS") =>
  `${currency} ${Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;

export default function BrokerDashboard() {
  const [broker, setBroker] = useState<Broker | null>(null);
  const [analytics, setAnalytics] = useState<BrokerAnalyticsOverview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    brokersApi
      .me()
      .then(async (result) => {
        setBroker(result);
        if (result.status === "approved") {
          brokersApi.analyticsOverview(30).then(setAnalytics).catch(() => {});
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load Broker Center"));
  }, []);

  if (error) {
    return (
      <Panel>
        <p className="font-semibold text-red-600">{error}</p>
      </Panel>
    );
  }

  if (!broker) {
    return (
      <Panel>
        <p className="font-semibold text-[#111827]">Loading Broker Center…</p>
      </Panel>
    );
  }

  const approved = broker.status === "approved";

  const quickActions = [
    {
      title: "Wallet",
      description: approved ? "Balance & payouts" : "Locked until KYC approval",
      href: approved ? "/broker/wallet" : "",
      icon: WalletCards,
    },
    {
      title: "Earnings",
      description: approved ? "View commission & escrow" : "Locked until KYC approval",
      href: approved ? "/broker/earnings" : "",
      icon: BadgeDollarSign,
    },
    {
      title: "Own Products",
      description: approved ? "Create 24-hour listings" : "Locked until KYC approval",
      href: approved ? "/broker/products" : "",
      icon: Package,
    },
    {
      title: "Promotion Opportunities",
      description: approved ? "Browse seller campaigns" : "Locked until KYC approval",
      href: approved ? "/broker/opportunities" : "",
      icon: BarChart3,
    },
    {
      title: "Delivery Addresses",
      description: "Manage addresses used when you shop on Xerin",
      href: "/account/addresses",
      icon: MapPin,
    },
  ];

  return (
    <div className="space-y-6 text-[#111827]">
      <section className="overflow-hidden rounded-3xl border border-[#1f2937] bg-[#111111] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f97316]">Broker Center</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Welcome, {broker.first_name || "Broker"}
            </h1>
            <p className="mt-2 text-sm font-medium text-white/70">
              Broker ID: <span className="font-black text-white">{broker.broker_code}</span>
            </p>
          </div>
          <span className="w-fit rounded-full border border-[#f97316]/40 bg-[#f97316]/10 px-4 py-2 text-sm font-black text-[#fb923c]">
            {labels[broker.status] || broker.status}
          </span>
        </div>
      </section>

      {!approved && (
        <section className="rounded-3xl border border-[#fed7aa] bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff2e8] text-[#f97316]">
              <ShieldCheck size={25} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black text-[#111111]">
                Complete identity verification to activate your Broker account.
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[#4b5563]">
                Products, promotion opportunities, earnings and wallet access stay locked until an administrator approves your KYC.
              </p>
              {broker.status !== "suspended" && (
                <Link
                  href="/broker/kyc"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ea580c]"
                >
                  Open KYC Verification
                  <ArrowRight size={17} />
                </Link>
              )}
              {broker.status_reason && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  Reason: {broker.status_reason}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {approved && analytics && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              title="Referral Clicks"
              value={analytics.total_clicks.toLocaleString()}
              subtitle={`${analytics.unique_visitors.toLocaleString()} unique visitors`}
            />
            <Metric
              title="Attributed Orders"
              value={analytics.attributed_orders.toLocaleString()}
              subtitle={`${Number(analytics.conversion_rate).toFixed(2)}% conversion`}
            />
            <Metric
              title="Available Earnings"
              value={money(analytics.available_earnings, analytics.currency)}
              subtitle={`${money(analytics.pending_earnings, analytics.currency)} pending`}
            />
            <Metric
              title="Wallet"
              value={money(analytics.wallet_available, analytics.currency)}
              subtitle={`${money(analytics.wallet_paid_out, analytics.currency)} paid out`}
            />
          </div>

          <Link
            href="/broker/analytics"
            className="group block rounded-2xl border border-[#fed7aa] bg-[#fff8f3] p-5 transition hover:border-[#f97316] hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-[#111111]">Open full performance analytics</p>
                <p className="mt-1 text-sm font-medium text-[#4b5563]">
                  Campaign clicks, conversions, successful sales, refunds and commission performance.
                </p>
              </div>
              <ArrowRight className="shrink-0 text-[#f97316] transition group-hover:translate-x-1" size={20} />
            </div>
          </Link>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff2e8] text-[#f97316]">
                <Icon size={22} />
              </div>
              <p className="mt-4 text-base font-black text-[#111111]">{item.title}</p>
              <div className="mt-2 flex items-start gap-2">
                {!approved && <LockKeyhole className="mt-0.5 shrink-0 text-[#6b7280]" size={15} />}
                <p className="text-sm font-medium leading-5 text-[#4b5563]">{item.description}</p>
              </div>
            </>
          );

          return item.href ? (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm transition hover:border-[#f97316] hover:shadow-md"
            >
              {content}
            </Link>
          ) : (
            <article key={item.title} className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
              {content}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <article className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-[#4b5563]">{title}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-[#111111]">{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#6b7280]">{subtitle}</p>
    </article>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">{children}</div>;
}
