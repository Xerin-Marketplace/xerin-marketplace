"use client";

import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import InfoPopover from "@/components/Common/Info/InfoPopover";
import { HugeiconsIcon } from "@hugeicons/react";
import {
 Search01Icon,
 RefreshCwIcon,
 PackageIcon,
 CheckmarkCircle02Icon,
 Copy01Icon,
 PercentCircleIcon,
} from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import { brokersApi } from "@/lib/api/endpoints/brokers";
import type { BrokerOpportunity } from "@/types/api/broker";

function money(v: string | number, c = "TZS") {
 const n = Number(v);
 return Number.isFinite(n) ? `${c} ${n.toLocaleString()}` : `${c} 0`;
}

export default function BrokerOpportunities() {
 const [rows, setRows] = useState<BrokerOpportunity[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [busy, setBusy] = useState<string | null>(null);
 const [tab, setTab] = useState<"available" | "accepted">("available");

 const load = async () => {
 setLoading(true);
 try {
 setRows(
 tab === "accepted"
 ? await brokersApi.acceptedOpportunities()
 : await brokersApi.opportunities(search.trim() ? { search: search.trim() } : undefined),
 );
 } catch (e) {
 toast.error(e instanceof Error ? e.message : "Unable to load Broker opportunities");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void load();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [tab]);

 const count = useMemo(() => rows.length, [rows]);

 const accept = async (o: BrokerOpportunity) => {
 setBusy(o.offer.id);
 try {
 await brokersApi.acceptOpportunity(o.offer.id);
 toast.success("Opportunity accepted. Your referral link is ready.");
 await load();
 } catch (e) {
 toast.error(e instanceof Error ? e.message : "Unable to accept opportunity");
 } finally {
 setBusy(null);
 }
 };

 const share = async (o: BrokerOpportunity) => {
 setBusy(o.offer.id);
 try {
 const r = await brokersApi.referralLink(o.offer.id);
 const url = `${window.location.origin}${r.share_path}`;
 await navigator.clipboard.writeText(url);
 toast.success(`Referral link copied · Code ${r.referral_code}`);
 } catch (e) {
 toast.error(e instanceof Error ? e.message : "Unable to create referral link");
 } finally {
 setBusy(null);
 }
 };

 const stop = async (o: BrokerOpportunity) => {
 setBusy(o.offer.id);
 try {
 await brokersApi.stopOpportunity(o.offer.id);
 toast.success("Promotion stopped.");
 await load();
 } catch (e) {
 toast.error(e instanceof Error ? e.message : "Unable to stop promotion");
 } finally {
 setBusy(null);
 }
 };

 return (
 <div className="space-y-5 pb-20">
 {/* Header — same pattern as Broker products */}
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h1 className="text-xl font-bold text-foreground sm:text-2xl">
 Promotion opportunities
 </h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Accept seller campaigns and earn per attributed sale.{" "}
 <InfoPopover title="How opportunities work" trigger="link" triggerLabel="How it works" align="end">
 <p>Each opportunity is a product a seller pays you to promote. Accept it, share your referral link, and earn the listed reward for every attributed sale.</p>
 <p>Commission is credited when the order is delivered — cancelled or refunded orders reverse it.</p>
 <p>Some offers have a sales cap or an end date — promote early.</p>
 </InfoPopover>
 </p>
 </div>
 <button
 onClick={() => void load()}
 className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
 >
 <HugeiconsIcon icon={RefreshCwIcon} size={15} />
 Refresh
 </button>
 </div>

 {/* Tabs + search */}
 <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex gap-1 rounded-lg bg-muted p-1">
 {(["available", "accepted"] as const).map((t) => (
 <button
 key={t}
 onClick={() => setTab(t)}
 className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
 tab === t
 ? "bg-card text-foreground shadow-sm"
 : "text-muted-foreground hover:text-foreground"
 }`}
 >
 {t === "available" ? "Available" : "My Promotions"}
 </button>
 ))}
 </div>
 <div className="relative sm:w-72">
 <HugeiconsIcon
 icon={Search01Icon}
 size={15}
 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
 />
 <input
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 onKeyDown={(e) => e.key === "Enter" && void load()}
 placeholder="Search products…"
 className="h-10 w-full rounded-lg border border-border bg-muted pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary/30"
 />
 </div>
 </div>

 {/* Results */}
 {loading ? (
 <div className="rounded-xl border border-border bg-card p-12 text-center">
 <Spinner className="mx-auto" />
 </div>
 ) : rows.length === 0 ? (
 <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
 <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
 <HugeiconsIcon icon={PackageIcon} size={24} />
 </span>
 <p className="mt-3 font-semibold text-foreground">
 {tab === "accepted" ? "No active promotions" : "No opportunities available"}
 </p>
 <p className="mt-1 max-w-sm text-sm text-muted-foreground">
 Campaigns disappear when stock runs out, the seller disables them, or their end date passes.
 </p>
 </div>
 ) : (
 <>
 <p className="text-xs font-medium text-muted-foreground">
 {count} opportunit{count === 1 ? "y" : "ies"}
 </p>
 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
 {rows.map((o) => (
 <article
 key={o.offer.id}
 className="flex flex-col rounded-xl border border-border bg-card p-5 transition hover:shadow-sm"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <h2 className="truncate font-bold text-foreground">{o.product.name}</h2>
 <p className="mt-0.5 text-xs text-muted-foreground">
 {o.available_quantity} in stock
 </p>
 </div>
 {o.already_accepted && (
 <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-light-6 px-2.5 py-1 text-[11px] font-semibold text-green-dark">
 <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
 Accepted
 </span>
 )}
 </div>

 <div className="mt-4 grid grid-cols-2 gap-2.5">
 <div className="rounded-lg bg-muted p-3">
 <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
 Customer price
 </p>
 <p className="mt-1 text-sm font-bold text-foreground">
 {money(o.product.sale_price || o.product.price, o.product.currency)}
 </p>
 </div>
 <div className="rounded-lg bg-primary/10 p-3">
 <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
 <HugeiconsIcon icon={PercentCircleIcon} size={11} />
 You earn / sale
 </p>
 <p className="mt-1 text-sm font-bold text-primary">
 {money(o.offer.estimated_reward_per_unit, o.product.currency)}
 </p>
 </div>
 </div>

 <p className="mt-3 text-xs text-muted-foreground">
 Reward:{" "}
 <span className="font-semibold text-foreground">
 {o.offer.commission_type === "fixed"
 ? money(o.offer.commission_value, o.product.currency)
 : `${o.offer.commission_value}%`}
 </span>
 {o.offer.max_attributed_sales
 ? ` · cap of ${o.offer.max_attributed_sales} sales`
 : ""}
 </p>

 <div className="mt-4 flex gap-2 pt-1">
 {o.already_accepted ? (
 <>
 <button
 disabled={busy === o.offer.id}
 onClick={() => void share(o)}
 className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
 >
 <HugeiconsIcon icon={Copy01Icon} size={13} />
 Copy link
 </button>
 <button
 disabled={busy === o.offer.id}
 onClick={() => void stop(o)}
 className="rounded-lg border border-border px-3 py-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
 >
 Stop
 </button>
 </>
 ) : (
 <button
 disabled={busy === o.offer.id}
 onClick={() => void accept(o)}
 className="w-full rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
 >
 {busy === o.offer.id ? "Accepting…" : "Accept & get link"}
 </button>
 )}
 </div>
 </article>
 ))}
 </div>
 </>
 )}
 </div>
 );
}
