"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { brokersApi } from "@/lib/api/endpoints/brokers";
import type {
 BrokerPayoutAccount,
 BrokerPayoutRequest,
 BrokerWallet,
 BrokerWalletTransaction,
} from "@/types/api/broker";
import { formatCurrency } from "@/utils/currency";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import {
 PlusSignIcon,
 Cancel01Icon,
 BankIcon,
 SmartPhone01Icon,
} from "@hugeicons/core-free-icons";

const cash = (v: string | number, c: string) =>
 formatCurrency(Number(v || 0), c);

const input =
 "h-11 w-full rounded-lg border border-border bg-muted px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-primary/30";

const accountBadge: Record<string, string> = {
 verified: "bg-green-100 text-green-700",
 pending: "bg-amber-100 text-amber-700",
 rejected: "bg-red-100 text-red-700",
};

const payoutBadge: Record<string, string> = {
 completed: "bg-green-100 text-green-700",
 pending: "bg-amber-100 text-amber-700",
 approved: "bg-blue-100 text-blue-700",
 processing: "bg-blue-100 text-blue-700",
 rejected: "bg-red-100 text-red-700",
 failed: "bg-red-100 text-red-700",
 cancelled: "bg-muted text-muted-foreground",
};

export default function BrokerWalletPage() {
 const [wallet, setWallet] = useState<BrokerWallet | null>(null);
 const [tx, setTx] = useState<BrokerWalletTransaction[]>([]);
 const [accounts, setAccounts] = useState<BrokerPayoutAccount[]>([]);
 const [payouts, setPayouts] = useState<BrokerPayoutRequest[]>([]);
 const [busy, setBusy] = useState(false);
 const [drawerOpen, setDrawerOpen] = useState(false);

 const load = async () => {
 try {
 const [w, t, a, p] = await Promise.all([
 brokersApi.wallet(),
 brokersApi.walletTransactions({ page: 1, page_size: 50 }),
 brokersApi.payoutAccounts(),
 brokersApi.payouts({ page: 1, page_size: 50 }),
 ]);
 setWallet(w);
 setTx(t.results);
 setAccounts(a);
 setPayouts(p.results);
 } catch (e) {
 toast.error(e instanceof Error ? e.message : "Unable to load Broker wallet");
 }
 };

 useEffect(() => {
 void load();
 }, []);

 useEffect(() => {
 document.body.style.overflow = drawerOpen ? "hidden" : "";
 return () => {
 document.body.style.overflow = "";
 };
 }, [drawerOpen]);

 const verified = useMemo(
 () => accounts.filter((a) => a.is_active && a.verification_status === "verified"),
 [accounts],
 );

 async function addAccount(e: FormEvent<HTMLFormElement>) {
 e.preventDefault();
 setBusy(true);
 const f = new FormData(e.currentTarget);
 try {
 await brokersApi.createPayoutAccount({
 account_type: String(f.get("account_type")) as "mobile_money" | "bank",
 provider: String(f.get("provider")),
 account_name: String(f.get("account_name")),
 account_number: String(f.get("account_number")),
 currency: String(f.get("currency") || "TZS"),
 is_default: true,
 });
 toast.success("Payout account added and ready to use");
 setDrawerOpen(false);
 await load();
 } catch (x) {
 toast.error(x instanceof Error ? x.message : "Unable to add payout account");
 } finally {
 setBusy(false);
 }
 }

 async function request(e: FormEvent<HTMLFormElement>) {
 e.preventDefault();
 setBusy(true);
 const f = new FormData(e.currentTarget);
 try {
 await brokersApi.requestPayout({
 payout_account_id: String(f.get("payout_account_id")),
 amount: String(f.get("amount")),
 note: String(f.get("note") || ""),
 });
 toast.success("Payout requested");
 (e.target as HTMLFormElement).reset();
 await load();
 } catch (x) {
 toast.error(x instanceof Error ? x.message : "Payout request failed");
 } finally {
 setBusy(false);
 }
 }

 const c = wallet?.currency || "TZS";

 const balanceCards = [
 { label: "Available", value: wallet?.available_balance || "0", strong: true },
 { label: "Pending", value: wallet?.pending_balance || "0" },
 { label: "Reserved", value: wallet?.reserved_balance || "0" },
 { label: "Paid out", value: wallet?.paid_out_balance || "0" },
 { label: "Reversed", value: wallet?.reversed_balance || "0" },
 ];

 return (
 <div className="space-y-5 pb-20">
 <div>
 <h1 className="text-xl font-bold text-foreground sm:text-2xl">
 Wallet &amp; payouts
 </h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Only escrow-released commission is withdrawable. Payouts stay on hold
 until Admin completes or rejects them.
 </p>
 </div>

 {wallet?.is_frozen && (
 <div className="rounded-lg border border-red-light-4 bg-red-light-6 p-3.5 text-sm font-medium text-red-dark">
 Your wallet is frozen. Contact support for assistance.
 </div>
 )}

 {/* Balances */}
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
 {balanceCards.map((b) => (
 <article
 key={b.label}
 className={`rounded-xl border border-border bg-card p-4 ${
 b.strong ? "ring-1 ring-primary/30" : ""
 }`}
 >
 <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
 {b.label}
 </p>
 <p className="mt-1.5 text-lg font-bold text-foreground">
 {cash(b.value, c)}
 </p>
 </article>
 ))}
 </div>

 <div className="grid gap-5 xl:grid-cols-2">
 {/* Payout accounts */}
 <section className="rounded-xl border border-border bg-card p-5">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="font-bold text-foreground">Payout accounts</h2>
 <p className="mt-0.5 text-xs text-muted-foreground">
 Mobile money or bank — ready to use as soon as you add it.
 </p>
 </div>
 <button
 onClick={() => setDrawerOpen(true)}
 className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
 >
 <HugeiconsIcon icon={PlusSignIcon} size={14} />
 Add account
 </button>
 </div>

 <div className="mt-4 space-y-2">
 {accounts.length === 0 ? (
 <p className="rounded-lg bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
 No payout account yet.
 </p>
 ) : (
 accounts.map((a) => (
 <div
 key={a.id}
 className="flex items-center justify-between gap-3 rounded-lg border border-border p-3.5"
 >
 <div className="flex min-w-0 items-center gap-3">
 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
 <HugeiconsIcon
 icon={a.account_type === "bank" ? BankIcon : SmartPhone01Icon}
 size={17}
 />
 </span>
 <div className="min-w-0">
 <p className="truncate text-sm font-semibold text-foreground">
 {a.provider} · {a.account_number}
 </p>
 <p className="text-xs text-muted-foreground">
 {a.account_name} · {a.account_type.replaceAll("_", " ")}
 </p>
 </div>
 </div>
 <span
 className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${accountBadge[a.verification_status] || accountBadge.pending}`}
 >
 {a.verification_status}
 </span>
 </div>
 ))
 )}
 </div>
 </section>

 {/* Request withdrawal */}
 <section className="rounded-xl border border-border bg-card p-5">
 <h2 className="font-bold text-foreground">Request withdrawal</h2>
 <p className="mt-0.5 text-xs text-muted-foreground">
 Available balance:{" "}
 <span className="font-semibold text-foreground">
 {cash(wallet?.available_balance || 0, c)}
 </span>
 </p>
 <form onSubmit={request} className="mt-4 space-y-3">
 <div>
 <label className="mb-1.5 block text-sm font-medium text-foreground">
 Payout account
 </label>
 <select name="payout_account_id" required className={input}>
 <option value="">Select a payout account</option>
 {verified.map((a) => (
 <option key={a.id} value={a.id}>
 {a.provider} · {a.account_number}
 </option>
 ))}
 </select>
 </div>
 <div>
 <label className="mb-1.5 block text-sm font-medium text-foreground">
 Amount ({c})
 </label>
 <input
 name="amount"
 type="number"
 min="1"
 step="0.01"
 required
 placeholder="0.00"
 className={input}
 />
 </div>
 <div>
 <label className="mb-1.5 block text-sm font-medium text-foreground">
 Note (optional)
 </label>
 <textarea
 name="note"
 rows={2}
 className={`${input} h-auto py-3`}
 />
 </div>
 <button
 disabled={busy || verified.length === 0}
 className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
 >
 {busy ? "Submitting…" : "Request payout"}
 </button>
 {verified.length === 0 && (
 <p className="text-xs text-muted-foreground">
 Add a payout account to request a payout.
 </p>
 )}
 </form>
 </section>
 </div>

 {/* Payout history */}
 <section className="rounded-xl border border-border bg-card">
 <div className="border-b border-border px-4 py-3">
 <h2 className="font-bold text-foreground">Payout history</h2>
 </div>
 <div className="divide-y divide-border">
 {payouts.length === 0 ? (
 <p className="p-5 text-sm text-muted-foreground">No payouts yet.</p>
 ) : (
 payouts.map((p) => (
 <div
 key={p.id}
 className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
 >
 <div>
 <p className="text-sm font-bold text-foreground">
 {cash(p.amount, p.currency)}
 </p>
 <p className="text-xs text-muted-foreground">
 {new Date(p.requested_at).toLocaleString()}
 </p>
 </div>
 <div className="flex items-center gap-2">
 <span
 className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${payoutBadge[p.status] || payoutBadge.pending}`}
 >
 {p.status}
 </span>
 {["pending", "approved"].includes(p.status) && (
 <button
 onClick={async () => {
 try {
 await brokersApi.cancelPayout(p.id);
 toast.success("Payout cancelled");
 await load();
 } catch (e) {
 toast.error(e instanceof Error ? e.message : "Unable to cancel");
 }
 }}
 className="text-xs font-semibold text-destructive hover:underline"
 >
 Cancel
 </button>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </section>

 {/* Wallet ledger */}
 <section className="rounded-xl border border-border bg-card">
 <div className="border-b border-border px-4 py-3">
 <h2 className="font-bold text-foreground">Wallet ledger</h2>
 </div>
 <div className="divide-y divide-border">
 {tx.length === 0 ? (
 <p className="p-5 text-sm text-muted-foreground">
 No wallet transactions yet.
 </p>
 ) : (
 tx.map((t) => (
 <div
 key={t.id}
 className="flex items-center justify-between gap-3 p-4"
 >
 <div className="min-w-0">
 <p className="truncate text-sm font-semibold text-foreground">
 {t.transaction_type.replaceAll("_", " ")}
 </p>
 <p className="truncate text-xs text-muted-foreground">
 {t.description || t.reference}
 </p>
 </div>
 <div className="shrink-0 text-right">
 <p className="text-sm font-bold text-foreground">
 {cash(t.amount, t.currency)}
 </p>
 <p className="text-xs text-muted-foreground">
 {new Date(t.created_at).toLocaleDateString()}
 </p>
 </div>
 </div>
 ))
 )}
 </div>
 </section>

 {/* Add account drawer */}
 {drawerOpen && (
 <div className="fixed inset-0 z-[90]">
 <div
 className="absolute inset-0 bg-black/50"
 onClick={() => !busy && setDrawerOpen(false)}
 />
 <aside
 role="dialog"
 aria-modal="true"
 aria-label="Add payout account"
 className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-2xl"
 >
 <header className="flex items-center justify-between border-b border-border px-5 py-4">
 <div>
 <h2 className="text-base font-bold text-foreground">
 Add payout account
 </h2>
 <p className="text-xs text-muted-foreground">
 Admin verifies the account before payouts go there.
 </p>
 </div>
 <button
 type="button"
 onClick={() => !busy && setDrawerOpen(false)}
 aria-label="Close"
 className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={18} />
 </button>
 </header>

 <form onSubmit={addAccount} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
 <Field label="Account type" required>
 <div className="grid grid-cols-2 gap-2">
 {[
 { v: "mobile_money", l: "Mobile money", icon: SmartPhone01Icon },
 { v: "bank", l: "Bank", icon: BankIcon },
 ].map((o) => (
 <label
 key={o.v}
 className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-muted px-3.5 py-3 text-sm font-medium text-foreground transition has-[:checked]:border-primary has-[:checked]:bg-primary/5"
 >
 <input
 type="radio"
 name="account_type"
 value={o.v}
 defaultChecked={o.v === "mobile_money"}
 className="accent-primary"
 />
 <HugeiconsIcon icon={o.icon} size={16} className="text-muted-foreground" />
 {o.l}
 </label>
 ))}
 </div>
 </Field>

 <Field label="Provider" required>
 <input
 name="provider"
 required
 placeholder="e.g. M-Pesa, CRDB"
 className={input}
 />
 </Field>

 <Field label="Account name" required>
 <input
 name="account_name"
 required
 placeholder="Name on the account"
 className={input}
 />
 </Field>

 <Field label="Account number" required>
 <input
 name="account_number"
 required
 placeholder="Phone or account number"
 className={input}
 />
 </Field>

 <Field label="Currency">
 <select name="currency" defaultValue="TZS" className={input}>
 <option value="TZS">TZS</option>
 </select>
 </Field>

 <div className="sticky bottom-0 -mx-5 border-t border-border bg-card px-5 py-4">
 <button
 disabled={busy}
 className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
 >
 {busy ? "Saving…" : "Save account"}
 </button>
 </div>
 </form>
 </aside>
 </div>
 )}
 </div>
 );
}

function Field({
 label,
 required,
 children,
}: {
 label: string;
 required?: boolean;
 children: React.ReactNode;
}) {
 return (
 <div>
 <span className="mb-1.5 block text-sm font-medium text-foreground">
 {label}
 {required && <span className="ml-0.5 text-destructive">*</span>}
 </span>
 {children}
 </div>
 );
}
