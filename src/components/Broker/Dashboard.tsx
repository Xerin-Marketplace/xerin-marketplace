"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, DollarCircleIcon, ChartColumnIcon, LockKeyIcon, PackageIcon, Location01Icon, ShieldCheckIcon, Wallet03Icon } from "@hugeicons/core-free-icons";
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
 <p className="font-semibold text-destructive">{error}</p>
 </Panel>
 );
 }

 if (!broker) {
 return (
 <Panel>
 <p className="font-semibold text-foreground">Loading Broker Center…</p>
 </Panel>
 );
 }

 const approved = broker.status === "approved";

 const quickActions = [
 {
 title: "Wallet",
 description: approved ? "Balance & payouts" : "Locked until KYC approval",
 href: approved ? "/broker/wallet" : "",
 icon: Wallet03Icon,
 },
 {
 title: "Earnings",
 description: approved ? "View commission & escrow" : "Locked until KYC approval",
 href: approved ? "/broker/earnings" : "",
 icon: DollarCircleIcon,
 },
 {
 title: "Own Products",
 description: approved ? "Create 24-hour listings" : "Locked until KYC approval",
 href: approved ? "/broker/products" : "",
 icon: PackageIcon,
 },
 {
 title: "Promotion Opportunities",
 description: approved ? "Browse seller campaigns" : "Locked until KYC approval",
 href: approved ? "/broker/opportunities" : "",
 icon: ChartColumnIcon,
 },
 {
 title: "Delivery Addresses",
 description: "Manage addresses used when you shop on Xerin",
 href: "/account/addresses",
 icon: Location01Icon,
 },
 ];

 return (
 <div className="space-y-6 text-foreground">
 <section className="overflow-hidden rounded-xl border border-[var(--foreground)] bg-[var(--foreground)] p-6 shadow-sm sm:p-8">
 <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
 <div>
 <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Broker Center</p>
 <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
 Welcome, {broker.first_name || "Broker"}
 </h1>
 <p className="mt-2 text-sm font-medium text-white/70">
 Broker ID: <span className="font-black text-white">{broker.broker_code}</span>
 </p>
 </div>
 <span className="w-fit rounded-full border border-[var(--primary)]/40 bg-primary/10 px-4 py-2 text-sm font-black text-primary">
 {labels[broker.status] || broker.status}
 </span>
 </div>
 </section>

 {!approved && (
 <section className="rounded-xl border border-primary/25 bg-card p-6 shadow-sm sm:p-7">
 <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <HugeiconsIcon icon={ShieldCheckIcon} size={24} />
 </div>
 <div className="min-w-0 flex-1">
 <h2 className="text-lg font-black text-foreground">
 Complete identity verification to activate your Broker account.
 </h2>
 <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-muted-foreground">
 Products, promotion opportunities, earnings and wallet access stay locked until an administrator approves your KYC.
 </p>
 {broker.status !== "suspended" && (
 <Link
 href="/broker/kyc"
 className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:bg-primary/90"
 >
 Open KYC Verification
 <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
 </Link>
 )}
 {broker.status_reason && (
 <p className="mt-4 rounded-xl bg-red-light-6 px-4 py-3 text-sm font-bold text-red-dark">
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
 className="group block rounded-xl border border-primary/25 bg-primary/10 p-5 transition hover:border-[var(--primary)] hover:shadow-sm"
 >
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="font-black text-foreground">Open full performance analytics</p>
 <p className="mt-1 text-sm font-medium text-muted-foreground">
 Campaign clicks, conversions, successful sales, refunds and commission performance.
 </p>
 </div>
 <HugeiconsIcon icon={ArrowRight01Icon} className="shrink-0 text-primary transition group-hover:translate-x-1" size={20} />
 </div>
 </Link>
 </>
 )}

 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 {quickActions.map((item) => {
 const Icon = item.icon;
 const content = (
 <>
 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <HugeiconsIcon icon={Icon} size={20} />
 </div>
 <p className="mt-4 text-base font-black text-foreground">{item.title}</p>
 <div className="mt-2 flex items-start gap-2">
 {!approved && <HugeiconsIcon icon={LockKeyIcon} className="mt-0.5 shrink-0 text-muted-foreground" size={16} />}
 <p className="text-sm font-medium leading-5 text-muted-foreground">{item.description}</p>
 </div>
 </>
 );

 return item.href ? (
 <Link
 key={item.title}
 href={item.href}
 className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-[var(--primary)] hover:shadow-md"
 >
 {content}
 </Link>
 ) : (
 <article key={item.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
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
 <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <p className="text-sm font-bold text-muted-foreground">{title}</p>
 <p className="mt-2 text-2xl font-black tracking-tight text-foreground">{value}</p>
 <p className="mt-1 text-xs font-semibold text-muted-foreground">{subtitle}</p>
 </article>
 );
}

function Panel({ children }: { children: React.ReactNode }) {
 return <div className="rounded-xl border border-border bg-card p-6 shadow-sm">{children}</div>;
}
