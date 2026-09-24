"use client";


import { Spinner } from "@/components/ui/Spinner";
import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { CircleArrowDownIcon, CircleArrowUpIcon, ArrowLeft01Icon, ArrowRight01Icon, Clock01Icon, CreditCardIcon, RefreshCwIcon, RotateLeft01Icon, Search01Icon, Wallet03Icon } from "@hugeicons/core-free-icons";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";

import { sellerWalletApi } from "@/lib/api/endpoints/seller-wallet";
import type {
 SellerWalletTransaction,
 WalletTransactionType,
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

const money = (value: number | string, currency = "TZS") =>
 new Intl.NumberFormat("en-TZ", {
 style: "currency",
 currency,
 maximumFractionDigits: 0,
 }).format(Number(value || 0));

const pretty = (value: string) =>
 value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const transactionMeta = (type: WalletTransactionType) => {
 switch (type) {
 case "sale_credit":
 return { label: "Sale Credit", direction: "credit", icon: CircleArrowDownIcon };
 case "funds_release":
 return { label: "Funds Release", direction: "credit", icon: CircleArrowDownIcon };
 case "payout_hold":
 return { label: "Payout Hold", direction: "hold", icon: Clock01Icon };
 case "payout_completed":
 case "payout_released":
 return { label: pretty(type), direction: "debit", icon: CircleArrowUpIcon };
 case "refund_debit":
 return { label: "Refund Debit", direction: "debit", icon: RotateLeft01Icon };
 default:
 return { label: pretty(type), direction: "neutral", icon: CreditCardIcon };
 }
};

export default function SellerTransactions() {
 const [rows, setRows] = useState<SellerWalletTransaction[]>([]);
 const [loading, setLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(20);
 const [meta, setMeta] = useState({ total: 0, total_pages: 0 });
 const [search, setSearch] = useState("");
 const [typeFilter, setTypeFilter] = useState("all");

 const load = async () => {
 setLoading(true);
 try {
 const result = await sellerWalletApi.transactions({
 page,
 page_size: pageSize,
 });
 setRows(result.results);
 setMeta({ total: result.total, total_pages: result.total_pages });
 } catch (error) {
 toast.error(errorMessage(error));
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void load();
 }, [page, pageSize]);

 // Backend currently paginates wallet transactions but does not expose
 // search/type parameters. These filters intentionally operate only on the
 // current server-returned page instead of pretending they are server-side.
 const visibleRows = useMemo(() => {
 const term = search.trim().toLowerCase();

 return rows.filter((row) => {
 if (typeFilter !== "all" && row.transaction_type !== typeFilter) {
 return false;
 }

 if (!term) return true;

 return [
 row.reference,
 row.description || "",
 row.order_id || "",
 row.transaction_type,
 ]
 .join(" ")
 .toLowerCase()
 .includes(term);
 });
 }, [rows, search, typeFilter]);

 const creditTotal = visibleRows
 .filter((row) =>
 ["sale_credit", "funds_release"].includes(row.transaction_type),
 )
 .reduce((sum, row) => sum + Number(row.amount || 0), 0);

 const debitTotal = visibleRows
 .filter((row) =>
 ["payout_completed", "payout_released", "refund_debit"].includes(
 row.transaction_type,
 ),
 )
 .reduce((sum, row) => sum + Number(row.amount || 0), 0);

 return (
 <div className="space-y-5">
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
 <div>
 <h1 className="mt-1 text-2xl font-bold text-foreground">
 Wallet Transactions
 </h1>
 <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground /60">
 Review seller wallet credits, releases, payout holds, completed
 payouts, refunds and administrative adjustments.
 </p>
 </div>

 <button
 type="button"
 onClick={() => void load()}
 className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground dark:border-border /65"
 >
 <HugeiconsIcon icon={RefreshCwIcon} size={16} />
 Refresh
 </button>
 </div>

 <div className="mt-5 grid gap-3 sm:grid-cols-3">
 <Summary
 label="Transactions on page"
 value={String(visibleRows.length)}
 icon={Wallet03Icon}
 />
 <Summary
 label="Credits on page"
 value={
 visibleRows[0]
 ? money(creditTotal, visibleRows[0].currency)
 : money(0)
 }
 icon={CircleArrowDownIcon}
 />
 <Summary
 label="Debits on page"
 value={
 visibleRows[0]
 ? money(debitTotal, visibleRows[0].currency)
 : money(0)
 }
 icon={CircleArrowUpIcon}
 />
 </div>
 </section>

 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card">
 <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between dark:border-border">
 <div>
 <h2 className="font-bold text-foreground">
 Transaction Ledger
 </h2>
 <p className="mt-1 text-xs text-muted-foreground">
 Pagination is backend-controlled. Search and type filtering apply to
 the current page because the backend does not expose those query
 parameters yet.
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
 className="h-11 min-w-[260px] rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none dark:border-border"
 />
 </label>

 <select
 value={typeFilter}
 onChange={(event) => setTypeFilter(event.target.value)}
 className="h-11 rounded-xl border border-border bg-card px-3 text-sm outline-none dark:border-border"
 >
 <option value="all">All transaction types</option>
 <option value="sale_credit">Sale Credit</option>
 <option value="funds_release">Funds Release</option>
 <option value="payout_hold">Payout Hold</option>
 <option value="payout_completed">Payout Completed</option>
 <option value="payout_released">Payout Released</option>
 <option value="refund_debit">Refund Debit</option>
 <option value="adjustment">Adjustment</option>
 </select>
 </div>
 </div>

 {loading ? (
 <div className="p-12 text-center text-sm text-muted-foreground">
 <Spinner className="mx-auto" />
 <p className="mt-3">Loading wallet transactions...</p>
 </div>
 ) : (
 <>
 <div className="overflow-x-auto">
 <table className="w-full min-w-[1000px] text-left text-sm">
 <thead className="bg-muted text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
 <tr>
 {[
 "Type",
 "Reference",
 "Order",
 "Amount",
 "Eligible",
 "Released",
 "Created",
 ].map((header) => (
 <th key={header} className="px-5 py-3.5">
 {header}
 </th>
 ))}
 </tr>
 </thead>

 <tbody className="divide-y divide-border dark:divide-white/10">
 {visibleRows.map((row) => {
 const meta = transactionMeta(row.transaction_type);
 const Icon = meta.icon;

 return (
 <tr key={row.id}>
 <td className="px-5 py-4">
 <div className="flex items-center gap-2">
 <span
 className={`flex h-8 w-8 items-center justify-center rounded-lg ${
 meta.direction === "credit"
 ? "bg-green-light-6 text-green-dark"
 : meta.direction === "debit"
 ? "bg-red-light-6 text-destructive"
 : meta.direction === "hold"
 ? "bg-yellow-light-4 text-yellow-dark"
 : "bg-muted text-muted-foreground"
 }`}
 >
 <HugeiconsIcon icon={Icon} size={16} />
 </span>
 <div>
 <p className="font-semibold text-foreground /80">
 {meta.label}
 </p>
 {row.description && (
 <p className="mt-0.5 max-w-[240px] truncate text-[11px] text-muted-foreground">
 {row.description}
 </p>
 )}
 </div>
 </div>
 </td>

 <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
 {row.reference}
 </td>

 <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
 {row.order_id
 ? `${row.order_id.slice(0, 8)}…`
 : "—"}
 </td>

 <td className="px-5 py-4">
 <span
 className={`font-bold ${
 meta.direction === "credit"
 ? "text-green-dark"
 : meta.direction === "debit"
 ? "text-destructive"
 : "text-foreground "
 }`}
 >
 {meta.direction === "credit"
 ? "+"
 : meta.direction === "debit"
 ? "-"
 : ""}
 {money(row.amount, row.currency)}
 </span>
 </td>

 <td className="px-5 py-4 text-xs text-muted-foreground">
 {row.eligible_at
 ? new Date(row.eligible_at).toLocaleString()
 : "—"}
 </td>

 <td className="px-5 py-4 text-xs text-muted-foreground">
 {row.released_at
 ? new Date(row.released_at).toLocaleString()
 : "—"}
 </td>

 <td className="px-5 py-4 text-xs text-muted-foreground">
 {new Date(row.created_at).toLocaleString()}
 </td>
 </tr>
 );
 })}

 {!visibleRows.length && (
 <tr>
 <td colSpan={7} className="px-5 py-14 text-center">
 <HugeiconsIcon icon={CreditCardIcon} size={28} className="mx-auto text-muted-foreground" />
 <p className="mt-3 font-semibold text-muted-foreground /70">
 No wallet transactions found
 </p>
 <p className="mt-1 text-sm text-muted-foreground">
 Seller wallet transactions will appear here as settlement
 activity occurs.
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
 onPageSizeChange={(size) => {
 setPageSize(size);
 setPage(1);
 }}
 />
 </>
 )}
 </section>
 </div>
 );
}

function Summary({
 label,
 value,
 icon: Icon,
}: {
 label: string;
 value: string;
 icon: IconSvgElement;
}) {
 return (
 <div className="rounded-xl border border-border bg-muted p-4 dark:border-border dark:bg-card/[0.03]">
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className="text-lg font-bold text-foreground">
 {value}
 </p>
 <p className="mt-1 text-xs text-muted-foreground /50">
 {label}
 </p>
 </div>
 <HugeiconsIcon icon={Icon} size={18} className="text-primary" />
 </div>
 </div>
 );
}

