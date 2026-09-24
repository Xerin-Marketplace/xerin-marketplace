"use client";


import { Spinner } from "@/components/ui/Spinner";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { CheckmarkBadge01Icon, Money03Icon, ArrowLeft01Icon, ArrowRight01Icon, AlertCircleIcon, Clock01Icon, BankIcon, RefreshCwIcon, Search01Icon, ShieldCheckIcon, SmartPhone01Icon, Wallet03Icon, CancelCircleIcon } from "@hugeicons/core-free-icons";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";

import { sellerWalletApi } from "@/lib/api/endpoints/seller-wallet";
import { sellersApi } from "@/lib/api/endpoints/sellers";
import type { PayoutAccount } from "@/types/api/seller";
import type {
 PayoutStatus,
 SellerPayoutRequest,
 SellerWallet,
} from "@/types/api/seller-wallet";

type StatusFilter =
 | "all"
 | "pending"
 | "approved"
 | "processing"
 | "completed"
 | "rejected"
 | "failed"
 | "cancelled";

const money = (value: number | string | null | undefined, currency = "TZS") =>
 new Intl.NumberFormat("en-TZ", {
 style: "currency",
 currency,
 maximumFractionDigits: 0,
 }).format(Number(value || 0));

const pretty = (value: string) =>
 value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const errorMessage = (error: unknown) => {
 const candidate = error as {
 response?: { data?: { detail?: string | Array<{ msg?: string }> } };
 message?: string;
 };

 const detail = candidate.response?.data?.detail;
 if (typeof detail === "string") return detail;
 if (Array.isArray(detail) && detail[0]?.msg) {
 return detail[0].msg || "Request failed.";
 }

 return candidate.message || "Request failed.";
};

const statusMeta = (status: PayoutStatus) => {
 switch (status) {
 case "completed":
 return {
 label: "Completed",
 className: "border-green-light-4 bg-green-light-6 text-green-dark",
 };
 case "approved":
 return {
 label: "Approved",
 className: "border-primary-200 bg-primary-50 text-primary-700",
 };
 case "processing":
 return {
 label: "Processing",
 className: "border-violet-200 bg-violet-50 text-violet-700",
 };
 case "rejected":
 case "failed":
 return {
 label: pretty(status),
 className: "border-red-light-4 bg-red-light-6 text-red-dark",
 };
 case "cancelled":
 return {
 label: "Cancelled",
 className: "border-border bg-muted text-muted-foreground",
 };
 default:
 return {
 label: "Pending",
 className: "border-yellow-light-2 bg-yellow-light-4 text-yellow-dark-2",
 };
 }
};

const maskAccount = (value: string) => {
 if (!value) return "—";
 if (value.length <= 4) return value;
 return `${"•".repeat(Math.min(value.length - 4, 8))}${value.slice(-4)}`;
};

export default function SellerPayouts() {
 const [wallet, setWallet] = useState<SellerWallet | null>(null);
 const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
 const [rows, setRows] = useState<SellerPayoutRequest[]>([]);

 const [loading, setLoading] = useState(true);
 const [historyLoading, setHistoryLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [busyPayout, setBusyPayout] = useState<string | null>(null);
 const [cancelTarget, setCancelTarget] = useState<SellerPayoutRequest | null>(null);

 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(10);
 const [meta, setMeta] = useState({ total: 0, total_pages: 0 });

 const [search, setSearch] = useState("");
 const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

 const [accountId, setAccountId] = useState("");
 const [amount, setAmount] = useState("");
 const [note, setNote] = useState("");

 const loadFoundation = async () => {
 setLoading(true);
 try {
 const [walletData, payoutAccounts] = await Promise.all([
 sellerWalletApi.wallet(),
 sellersApi.getPayoutAccounts(),
 ]);

 setWallet(walletData);
 setAccounts(payoutAccounts);

 const verifiedDefault =
 payoutAccounts.find(
 (account) =>
 account.is_default &&
 account.is_active !== false &&
 account.verification_status === "verified",
 ) ||
 payoutAccounts.find(
 (account) =>
 account.is_active !== false &&
 account.verification_status === "verified",
 );

 setAccountId((current) =>
 current || (verifiedDefault ? String(verifiedDefault.id) : ""),
 );
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setLoading(false);
 }
 };

 const loadHistory = async () => {
 setHistoryLoading(true);
 try {
 const result = await sellerWalletApi.payouts({
 page,
 page_size: pageSize,
 });
 setRows(result.results);
 setMeta({
 total: result.total,
 total_pages: result.total_pages,
 });
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setHistoryLoading(false);
 }
 };

 useEffect(() => {
 void loadFoundation();
 }, []);

 useEffect(() => {
 void loadHistory();
 }, [page, pageSize]);

 const verifiedAccounts = useMemo(
 () =>
 accounts.filter(
 (account) =>
 account.is_active !== false &&
 account.verification_status === "verified",
 ),
 [accounts],
 );

 const selectedAccount = verifiedAccounts.find(
 (account) => String(account.id) === accountId,
 );

 // Current backend payout history endpoint provides pagination only.
 // Search and status filtering below intentionally apply to the current page.
 const visibleRows = useMemo(() => {
 const term = search.trim().toLowerCase();

 return rows.filter((row) => {
 if (statusFilter !== "all" && row.status !== statusFilter) return false;

 if (!term) return true;

 const account = accounts.find(
 (candidate) => String(candidate.id) === row.payout_account_id,
 );

 return [
 row.id,
 row.provider_reference || "",
 row.seller_note || "",
 row.admin_note || "",
 row.status,
 account?.provider || "",
 account?.account_name || "",
 ]
 .join(" ")
 .toLowerCase()
 .includes(term);
 });
 }, [rows, search, statusFilter, accounts]);

 const pendingAmount = rows
 .filter((row) =>
 ["pending", "approved", "processing"].includes(row.status),
 )
 .reduce((sum, row) => sum + Number(row.amount || 0), 0);

 const completedAmount = rows
 .filter((row) => row.status === "completed")
 .reduce((sum, row) => sum + Number(row.amount || 0), 0);

 const submitPayout = async () => {
 if (!wallet) return;

 const numericAmount = Number(amount);

 if (!selectedAccount) {
 toast.error("Select a verified payout account.");
 return;
 }

 if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
 toast.error("Enter a valid payout amount.");
 return;
 }

 if (numericAmount > Number(wallet.available_balance || 0)) {
 toast.error("Payout amount exceeds your available balance.");
 return;
 }

 setSubmitting(true);
 try {
 await sellerWalletApi.requestPayout({
 payout_account_id: String(selectedAccount.id),
 amount: numericAmount,
 note: note.trim() || null,
 });

 toast.success("Payout request submitted.");
 setAmount("");
 setNote("");
 setPage(1);

 await Promise.all([loadFoundation(), loadHistory()]);
 } catch (error) {
 // The backend remains authoritative for minimum payout and wallet rules.
 toast.error(errorMessage(error));
 } finally {
 setSubmitting(false);
 }
 };

 const cancelPayout = async () => {
 if (!cancelTarget) return;
 const row = cancelTarget;
 setBusyPayout(row.id);
 try {
 await sellerWalletApi.cancelPayout(row.id);
 toast.success("Payout request cancelled.");
 setCancelTarget(null);
 await Promise.all([loadFoundation(), loadHistory()]);
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setBusyPayout(null);
 }
 };

 const currency = wallet?.currency || "TZS";

 return (
 <div className="space-y-5">
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
 <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
 <div className="max-w-3xl">
 <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-foreground">
 Payout Requests
 </h1>
 <p className="mt-2 text-sm leading-6 text-muted-foreground /60">
 Request settlement of available seller funds to a verified payout
 account and follow each request from pending through completion.
 </p>
 </div>

 <button
 type="button"
 onClick={() => {
 void loadFoundation();
 void loadHistory();
 }}
 className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground dark:border-border /65"
 >
 <HugeiconsIcon icon={RefreshCwIcon} size={16} />
 Refresh
 </button>
 </div>

 <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
 <Summary
 label="Available Balance"
 value={money(wallet?.available_balance, currency)}
 icon={Wallet03Icon}
 highlight
 />
 <Summary
 label="Reserved Balance"
 value={money(wallet?.reserved_balance, currency)}
 icon={ShieldCheckIcon}
 />
 <Summary
 label="Pending on this page"
 value={money(pendingAmount, currency)}
 icon={Clock01Icon}
 />
 <Summary
 label="Completed on this page"
 value={money(completedAmount, currency)}
 icon={CheckmarkBadge01Icon}
 />
 </div>
 </section>

 {wallet?.is_frozen && (
 <div className="rounded-xl border border-red-light-4 bg-red-light-6 p-4 text-sm leading-6 text-red-dark">
 <div className="flex items-start gap-3">
 <HugeiconsIcon icon={AlertCircleIcon} size={18} className="mt-0.5 shrink-0" />
 <p>
 Your seller wallet is currently frozen. Payout requests may be
 blocked by the backend until the restriction is removed.
 </p>
 </div>
 </div>
 )}

 <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
 <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
 <div className="flex items-center gap-3">
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary-400/10">
 <HugeiconsIcon icon={Money03Icon} size={18} />
 </span>
 <div>
 <h2 className="font-bold text-foreground">
 Request Payout
 </h2>
 <p className="mt-0.5 text-xs text-muted-foreground">
 Only active and verified accounts can receive payouts.
 </p>
 </div>
 </div>

 {loading ? (
 <div className="py-10 text-center text-sm text-muted-foreground">
 <Spinner className="mx-auto" />
 <p className="mt-2">Loading payout configuration...</p>
 </div>
 ) : verifiedAccounts.length === 0 ? (
 <div className="mt-5 rounded-xl border border-yellow-light-2 bg-yellow-light-4 p-4">
 <p className="text-sm font-semibold text-yellow-dark-2">
 No verified payout account
 </p>
 <p className="mt-1 text-xs leading-5 text-yellow-dark-2">
 Add a payout account and wait for authorized Xerin staff to verify
 it before requesting settlement.
 </p>
 <Link
 href="/seller/kyc?tab=payouts"
 className="mt-3 inline-flex rounded-lg bg-card px-3 py-2 text-xs font-semibold text-yellow-dark-2 shadow-sm"
 >
 Manage Payout Accounts
 </Link>
 </div>
 ) : (
 <div className="mt-5 space-y-4">
 <Field label="Payout account" required>
 <select
 value={accountId}
 onChange={(event) => setAccountId(event.target.value)}
 className={inputClass}
 >
 <option value="">Select verified account</option>
 {verifiedAccounts.map((account) => (
 <option key={account.id} value={account.id}>
 {account.provider} · {account.account_name} ·{" "}
 {maskAccount(account.account_number)}
 </option>
 ))}
 </select>
 </Field>

 {selectedAccount && (
 <div className="rounded-xl border border-green-light-4 bg-green-light-6 p-3">
 <div className="flex items-start gap-3">
 {selectedAccount.account_type === "mobile_money" ? (
 <HugeiconsIcon icon={SmartPhone01Icon}
 size={16}
 className="mt-0.5 text-green-dark"
 />
 ) : (
 <HugeiconsIcon icon={BankIcon}
 size={16}
 className="mt-0.5 text-green-dark"
 />
 )}
 <div>
 <p className="text-sm font-semibold text-emerald-800">
 {selectedAccount.provider}
 </p>
 <p className="mt-0.5 text-xs text-green-dark">
 {selectedAccount.account_name} ·{" "}
 {maskAccount(selectedAccount.account_number)}
 </p>
 <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-green-dark">
 Verified
 {selectedAccount.is_default ? " · Default" : ""}
 </p>
 </div>
 </div>
 </div>
 )}

 <Field
 label={`Amount (${currency})`}
 required
 hint={`Available: ${money(wallet?.available_balance, currency)}`}
 >
 <input
 type="number"
 min={0}
 step="0.01"
 value={amount}
 onChange={(event) => setAmount(event.target.value)}
 className={inputClass}
 placeholder="Enter payout amount"
 />
 </Field>

 <button
 type="button"
 onClick={() =>
 setAmount(String(Number(wallet?.available_balance || 0)))
 }
 className="text-xs font-semibold text-primary"
 >
 Use full available balance
 </button>

 <Field
 label="Seller note"
 hint="Optional note attached to this payout request."
 >
 <textarea
 value={note}
 onChange={(event) => setNote(event.target.value)}
 className={`${inputClass} min-h-24 py-3`}
 placeholder="Optional payout note..."
 maxLength={1000}
 />
 </Field>

 <button
 type="button"
 disabled={
 submitting ||
 wallet?.is_frozen ||
 !accountId ||
 !amount ||
 Number(amount) <= 0
 }
 onClick={() => void submitPayout()}
 className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
 >
 {submitting ? "Submitting..." : "Request Payout"}
 </button>

 <div className="rounded-xl border border-primary-200 bg-primary-50 p-3 text-xs leading-5 text-primary-800">
 The backend validates the Finance minimum payout amount, available
 wallet balance, account ownership and verification status when you
 submit the request.
 </div>
 </div>
 )}
 </div>

 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card">
 <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between dark:border-border">
 <div>
 <h2 className="font-bold text-foreground">
 Payout History
 </h2>
 <p className="mt-1 text-xs text-muted-foreground">
 Pagination is backend-controlled. Search and status filters apply
 to the current page because the current payout endpoint exposes
 page and page_size only.
 </p>
 </div>

 <div className="flex flex-col gap-2 sm:flex-row">
 <label className="relative">
 <HugeiconsIcon icon={Search01Icon}
 size={16}
 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
 />
 <input
 value={search}
 onChange={(event) => setSearch(event.target.value)}
 placeholder="Filter current page..."
 className="h-11 min-w-[240px] rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none dark:border-border"
 />
 </label>

 <select
 value={statusFilter}
 onChange={(event) =>
 setStatusFilter(event.target.value as StatusFilter)
 }
 className="h-11 rounded-xl border border-border bg-card px-3 text-sm outline-none dark:border-border"
 >
 <option value="all">All statuses</option>
 <option value="pending">Pending</option>
 <option value="approved">Approved</option>
 <option value="processing">Processing</option>
 <option value="completed">Completed</option>
 <option value="rejected">Rejected</option>
 <option value="failed">Failed</option>
 <option value="cancelled">Cancelled</option>
 </select>
 </div>
 </div>

 {historyLoading ? (
 <div className="p-12 text-center text-sm text-muted-foreground">
 <Spinner className="mx-auto" />
 <p className="mt-3">Loading payout history...</p>
 </div>
 ) : (
 <>
 <div className="overflow-x-auto">
 <table className="w-full min-w-[1050px] text-left text-sm">
 <thead className="bg-muted text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
 <tr>
 {[
 "Requested",
 "Account",
 "Amount",
 "Status",
 "Provider Ref",
 "Processed",
 "Completed",
 "Action",
 ].map((header) => (
 <th key={header} className="px-5 py-3.5">
 {header}
 </th>
 ))}
 </tr>
 </thead>

 <tbody className="divide-y divide-border dark:divide-white/10">
 {visibleRows.map((row) => {
 const account = accounts.find(
 (candidate) =>
 candidate.id === row.payout_account_id,
 );
 const metaStatus = statusMeta(row.status);

 return (
 <tr key={row.id}>
 <td className="px-5 py-4 text-xs text-muted-foreground">
 {new Date(row.requested_at).toLocaleString()}
 </td>

 <td className="px-5 py-4">
 {account ? (
 <>
 <p className="font-semibold text-foreground /80">
 {account.provider}
 </p>
 <p className="mt-0.5 text-xs text-muted-foreground">
 {maskAccount(account.account_number)}
 </p>
 </>
 ) : (
 <span className="font-mono text-xs text-muted-foreground">
 {row.payout_account_id.slice(0, 8)}…
 </span>
 )}
 </td>

 <td className="px-5 py-4 font-bold text-foreground">
 {money(row.amount, row.currency)}
 </td>

 <td className="px-5 py-4">
 <span
 className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${metaStatus.className}`}
 >
 {metaStatus.label}
 </span>
 {row.admin_note && (
 <p className="mt-1 max-w-[220px] text-[11px] leading-4 text-muted-foreground">
 {row.admin_note}
 </p>
 )}
 </td>

 <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
 {row.provider_reference || "—"}
 </td>

 <td className="px-5 py-4 text-xs text-muted-foreground">
 {row.processed_at
 ? new Date(row.processed_at).toLocaleString()
 : "—"}
 </td>

 <td className="px-5 py-4 text-xs text-muted-foreground">
 {row.completed_at
 ? new Date(row.completed_at).toLocaleString()
 : "—"}
 </td>

 <td className="px-5 py-4">
 {row.status === "pending" ? (
 <button
 type="button"
 disabled={busyPayout === row.id}
 onClick={() => setCancelTarget(row)}
 className="inline-flex items-center gap-1.5 rounded-lg border border-red-light-4 px-3 py-2 text-xs font-semibold text-destructive disabled:opacity-50"
 >
 <HugeiconsIcon icon={CancelCircleIcon} size={14} />
 Cancel
 </button>
 ) : (
 <span className="text-xs text-muted-foreground">
 —
 </span>
 )}
 </td>
 </tr>
 );
 })}

 {!visibleRows.length && (
 <tr>
 <td colSpan={8} className="px-5 py-14 text-center">
 <HugeiconsIcon icon={Money03Icon}
 size={28}
 className="mx-auto text-muted-foreground"
 />
 <p className="mt-3 font-semibold text-muted-foreground /70">
 No payout requests found
 </p>
 <p className="mt-1 text-sm text-muted-foreground">
 Eligible seller payout requests will appear here.
 </p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 <Pagination
 page={page}
 pageSize={pageSize}
 total={meta.total}
 totalPages={meta.total_pages}
 onPageChange={setPage}
 onPageSizeChange={(value) => {
 setPageSize(value);
 setPage(1);
 }}
 />
 </>
 )}
 </section>
 </section>
 {cancelTarget && (
 <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
 <div role="dialog" aria-modal="true" aria-labelledby="cancel-payout-title" className="w-full max-w-md rounded-t-2xl bg-card p-5 shadow-lg dark:bg-card sm:rounded-xl sm:p-6">
 <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-light-6 text-destructive dark:bg-destructive/10"><HugeiconsIcon icon={AlertCircleIcon} size={20} /></span><div><h2 id="cancel-payout-title" className="font-bold text-foreground">Cancel payout request?</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">The request for <strong className="text-accent-foreground /80">{money(cancelTarget.amount, cancelTarget.currency)}</strong> will be cancelled. Funds will be returned according to the wallet rules.</p></div></div>
 <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={busyPayout !== null} onClick={() => setCancelTarget(null)} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold dark:border-border">Keep request</button><button type="button" disabled={busyPayout !== null} onClick={() => void cancelPayout()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-bold text-white disabled:opacity-50">{busyPayout && <Spinner />}Cancel payout</button></div>
 </div>
 </div>
 )}
 </div>
 );
}

function Summary({
 label,
 value,
 icon: Icon,
 highlight = false,
}: {
 label: string;
 value: string;
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
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className="text-lg font-bold text-foreground">
 {value}
 </p>
 <p className="mt-1 text-xs text-muted-foreground /50">
 {label}
 </p>
 </div>
 <HugeiconsIcon icon={Icon}
 size={18}
 className={highlight ? "text-primary" : "text-muted-foreground"}
 />
 </div>
 </div>
 );
}

function Field({
 label,
 required = false,
 hint,
 children,
}: {
 label: string;
 required?: boolean;
 hint?: string;
 children: React.ReactNode;
}) {
 return (
 <label className="block">
 <span className="mb-1.5 block text-xs font-semibold text-muted-foreground /65">
 {label} {required && <span className="text-destructive">*</span>}
 </span>
 {children}
 {hint && (
 <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">
 {hint}
 </span>
 )}
 </label>
 );
}

const inputClass =
 "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-ring/30 dark:border-border ";
