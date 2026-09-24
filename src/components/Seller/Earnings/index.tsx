"use client";


import { Spinner } from "@/components/ui/Spinner";
import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { ArrowDownToLineIcon, Money03Icon, DollarCircleIcon, Clock01Icon, BankIcon, RefreshCwIcon, ShieldCheckIcon, ChartIncreaseIcon, Wallet03Icon } from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";

import { sellerWalletApi } from "@/lib/api/endpoints/seller-wallet";
import type {
 SellerEarningsSummary,
 SellerWallet,
} from "@/types/api/seller-wallet";

const errorMessage = (error: unknown) => {
 const candidate = error as {
 response?: { data?: { detail?: string | Array<{ msg?: string }> } };
 message?: string;
 };
 const detail = candidate.response?.data?.detail;
 if (typeof detail === "string") return detail;
 if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg || "Request failed.";
 return candidate.message || "Request failed.";
};

const money = (value: number | string | null | undefined, currency = "TZS") =>
 new Intl.NumberFormat("en-TZ", {
 style: "currency",
 currency,
 maximumFractionDigits: 0,
 }).format(Number(value || 0));

export default function SellerEarnings() {
 const [summary, setSummary] = useState<SellerEarningsSummary | null>(null);
 const [wallet, setWallet] = useState<SellerWallet | null>(null);
 const [loading, setLoading] = useState(true);

 const load = async () => {
 setLoading(true);
 try {
 const [summaryData, walletData] = await Promise.all([
 sellerWalletApi.earningsSummary(),
 sellerWalletApi.wallet(),
 ]);
 setSummary(summaryData);
 setWallet(walletData);
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void load();
 }, []);

 const currency = wallet?.currency || summary?.currency || "TZS";

 const settlementTotal = useMemo(() => {
 if (!wallet) return 0;
 return (
 Number(wallet.pending_balance || 0) +
 Number(wallet.available_balance || 0) +
 Number(wallet.reserved_balance || 0)
 );
 }, [wallet]);

 if (loading) {
 return (
 <div className="rounded-xl border border-border bg-card p-14 text-center text-sm text-muted-foreground shadow-sm dark:border-border dark:bg-card">
 <Spinner className="mx-auto" />
 <p className="mt-3">Loading seller earnings...</p>
 </div>
 );
 }

 return (
 <div className="space-y-5">
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
 <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
 <div className="max-w-3xl">
 <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-foreground">
 Earnings & Wallet
 </h1>
 <p className="mt-2 text-sm leading-6 text-muted-foreground /60">
 Track your marketplace earnings, Xerin commission, held funds and
 available balance. Financial values shown here come directly from
 the seller commission and wallet APIs.
 </p>
 </div>

 <button
 type="button"
 onClick={() => void load()}
 className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted dark:border-border /65 dark:hover:bg-card/5"
 >
 <HugeiconsIcon icon={RefreshCwIcon} size={16} />
 Refresh
 </button>
 </div>

 {wallet?.is_frozen && (
 <div className="mt-5 rounded-xl border border-red-light-4 bg-red-light-6 p-4 text-sm leading-6 text-red-dark">
 <div className="flex items-start gap-3">
 <HugeiconsIcon icon={ShieldCheckIcon} size={18} className="mt-0.5 shrink-0" />
 <p>
 This seller wallet is currently frozen. Balance information remains
 visible, but payout-related actions may be restricted by the backend.
 </p>
 </div>
 </div>
 )}
 </section>

 <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <Metric
 label="Gross Sales"
 value={money(summary?.gross_sales, summary?.currency || currency)}
 hint={`${summary?.transaction_count || 0} commission records`}
 icon={ChartIncreaseIcon}
 />
 <Metric
 label="Xerin Commission"
 value={money(
 summary?.commission_deducted,
 summary?.currency || currency,
 )}
 hint="Marketplace commission deducted"
 icon={DollarCircleIcon}
 />
 <Metric
 label="Net Earnings"
 value={money(summary?.net_earnings, summary?.currency || currency)}
 hint="Seller entitlement before settlement movement"
 icon={Money03Icon}
 />
 <Metric
 label="Wallet Exposure"
 value={money(settlementTotal, currency)}
 hint="Pending + available + reserved"
 icon={Wallet03Icon}
 />
 </section>

 <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
 <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
 <div>
 <h2 className="font-bold text-foreground">
 Settlement Balances
 </h2>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 These balances come from the seller wallet ledger and represent
 different stages of settlement.
 </p>
 </div>

 <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
 <BalanceCard
 label="Pending"
 value={money(wallet?.pending_balance, currency)}
 hint="Seller funds not yet available"
 icon={Clock01Icon}
 />
 <BalanceCard
 label="Available"
 value={money(wallet?.available_balance, currency)}
 hint="Eligible for payout"
 icon={ArrowDownToLineIcon}
 highlight
 />
 <BalanceCard
 label="Reserved"
 value={money(wallet?.reserved_balance, currency)}
 hint="Reserved for payout/settlement"
 icon={BankIcon}
 />
 <BalanceCard
 label="Paid Out"
 value={money(wallet?.paid_out_balance, currency)}
 hint="Completed seller payouts"
 icon={Money03Icon}
 />
 <BalanceCard
 label="Refunded"
 value={money(wallet?.refunded_balance, currency)}
 hint="Amounts reversed/refunded"
 icon={RefreshCwIcon}
 />
 <BalanceCard
 label="Debt"
 value={money(wallet?.debt_balance, currency)}
 hint="Outstanding seller liability"
 icon={ShieldCheckIcon}
 />
 </div>
 </div>

 <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
 <h2 className="font-bold text-foreground">
 How settlement works
 </h2>
 <div className="mt-5 space-y-4">
 <FlowStep
 index={1}
 title="Sale is recorded"
 text="Commission records preserve gross sale, Xerin commission and seller net earnings."
 />
 <FlowStep
 index={2}
 title="Funds remain pending"
 text="Eligible seller funds remain pending until the payment/escrow workflow releases them."
 />
 <FlowStep
 index={3}
 title="Funds become available"
 text="Released funds move into Available Balance and can later be requested as payout."
 />
 </div>

 <div className="mt-5 rounded-xl border border-yellow-light-2 bg-yellow-light-4 p-4 text-xs leading-5 text-yellow-dark-2">
 Customer-payment-to-escrow allocation is intentionally completed during
 the Customer payment phase. Until then, some wallet balances can remain
 zero even when historical commission records exist.
 </div>
 </div>
 </section>
 </div>
 );
}

function Metric({
 label,
 value,
 hint,
 icon: Icon,
}: {
 label: string;
 value: string;
 hint: string;
 icon: IconSvgElement;
}) {
 return (
 <div className="rounded-xl border border-border bg-card p-4 shadow-sm dark:border-border dark:bg-card">
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className="text-xs font-semibold text-muted-foreground /50">
 {label}
 </p>
 <p className="mt-2 text-xl font-bold text-foreground">
 {value}
 </p>
 <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{hint}</p>
 </div>
 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary-400/10">
 <HugeiconsIcon icon={Icon} size={18} />
 </span>
 </div>
 </div>
 );
}

function BalanceCard({
 label,
 value,
 hint,
 icon: Icon,
 highlight = false,
}: {
 label: string;
 value: string;
 hint: string;
 icon: IconSvgElement;
 highlight?: boolean;
}) {
 return (
 <div
 className={`rounded-xl border p-4 ${
 highlight
 ? "border-primary/25 bg-primary/10"
 : "border-border bg-muted dark:border-border dark:bg-card/[0.03]"
 }`}
 >
 <HugeiconsIcon icon={Icon}
 size={16}
 className={highlight ? "text-primary" : "text-muted-foreground"}
 />
 <p className="mt-3 text-xs font-semibold text-muted-foreground">{label}</p>
 <p className="mt-1 text-lg font-bold text-foreground">
 {value}
 </p>
 <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{hint}</p>
 </div>
 );
}

function FlowStep({
 index,
 title,
 text,
}: {
 index: number;
 title: string;
 text: string;
}) {
 return (
 <div className="flex gap-3">
 <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
 {index}
 </span>
 <div>
 <p className="text-sm font-semibold text-foreground /80">
 {title}
 </p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground /50">
 {text}
 </p>
 </div>
 </div>
 );
}
