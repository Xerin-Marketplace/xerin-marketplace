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
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h1 className="text-xl font-bold text-foreground sm:text-2xl">
 Welcome, {broker.first_name || "Broker"}
 </h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Broker ID: <span className="font-semibold text-foreground">{broker.broker_code}</span>
 </p>
 </div>
 <span className="rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
 {labels[broker.status] || broker.status}
 </span>
 </div>

 {!approved && (
 <section className="rounded-xl border border-primary/25 bg-card p-5 sm:p-6">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
 <HugeiconsIcon icon={ShieldCheckIcon} size={20} />
 </div>
 <div className="min-w-0 flex-1">
 <h2 className="text-base font-bold text-foreground">
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
 <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
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

 {/* Performance funnel — real conversion data */}
 <section className="rounded-xl border border-border bg-card p-5">
 <div className="mb-4 flex items-center justify-between">
 <div>
 <h2 className="text-sm font-bold text-foreground">30-day conversion funnel</h2>
 <p className="text-xs text-muted-foreground">From clicks to successful sales.</p>
 </div>
 <Link
 href="/broker/analytics"
 className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
 >
 Full analytics
 <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
 </Link>
 </div>
 <Funnel
 stages={[
 { label: "Clicks", value: analytics.total_clicks },
 { label: "Unique visitors", value: analytics.unique_visitors },
 { label: "Orders", value: analytics.attributed_orders },
 { label: "Successful sales", value: analytics.successful_sales },
 ]}
 />
 </section>
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

function Funnel({ stages }: { stages: { label: string; value: number }[] }) {
 const max = Math.max(...stages.map((s) => s.value), 1);
 return (
 <div className="space-y-3">
 {stages.map((stage) => (
 <div key={stage.label}>
 <div className="mb-1 flex items-center justify-between text-xs">
 <span className="font-medium text-muted-foreground">{stage.label}</span>
 <span className="font-bold text-foreground">{stage.value.toLocaleString()}</span>
 </div>
 <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
 <div
 className="h-full rounded-full bg-primary transition-all duration-500"
 style={{ width: `${Math.max((stage.value / max) * 100, stage.value > 0 ? 4 : 0)}%` }}
 />
 </div>
 </div>
 ))}
 </div>
 );
}
