"use client";


import { Spinner } from "@/components/ui/Spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Globe02Icon, Loading03Icon, Location01Icon, ShieldCheckIcon } from "@hugeicons/core-free-icons";
import type { DeliveryCheckoutConfig, DetectedDeliveryMode, DeliveryMode } from "@/types/api/commerce";

export default function DeliveryModeSelector({
 value,
 config,
 detected,
 loading,
 awaitingAddress = false,
}: {
 value: DeliveryMode;
 config?: DeliveryCheckoutConfig;
 detected?: DetectedDeliveryMode;
 loading?: boolean;
 awaitingAddress?: boolean;
}) {
 const crossBorder = value === "international";
 return (
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border sm:p-6">
 <p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Automatic delivery route</p>
 <h2 className="mt-1 text-xl font-bold text-foreground">Delivery Type</h2>
 <p className="mt-1 text-sm leading-6 text-muted-foreground">
 Xerin detects this automatically from the product store country and your selected delivery address.
 </p>
 <div className="mt-5 rounded-xl border border-primary bg-primary/5 p-4 ring-2 ring-primary/10">
 {loading ? (
 <div className="flex items-center gap-2 text-sm font-semibold"><Spinner size={17} /> Detecting delivery route…</div>
 ) : awaitingAddress || !detected ? (
 <div className="flex items-start gap-3">
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
 <HugeiconsIcon icon={Location01Icon} size={18} />
 </span>
 <div className="min-w-0">
 <p className="font-bold text-foreground">Waiting for delivery address</p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 Select and confirm a delivery address below. Xerin will then detect whether this order is domestic or cross-border.
 </p>
 </div>
 </div>
 ) : (
 <div className="flex items-start gap-3">
 <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${crossBorder ? "bg-primary/5 text-primary-600" : "bg-primary/10 text-primary"}`}>
 {crossBorder ? <HugeiconsIcon icon={Globe02Icon} size={18} /> : <HugeiconsIcon icon={Location01Icon} size={18} />}
 </span>
 <div className="min-w-0">
 <p className="font-bold text-foreground">{crossBorder ?"International / Cross-border" : "Domestic / Local"}</p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 {crossBorder
 ? "At least one product store is in a different country from the delivery destination."
 : "All product stores are in the same country as the delivery destination."}
 </p>
 {detected?.origins?.length ? (
 <div className="mt-3 flex flex-wrap gap-2">
 {detected.origins.map((origin) => (
 <span key={origin.store_id} className="rounded-full bg-card px-2.5 py-1 text-[10px] font-bold text-muted-foreground shadow-sm dark:bg-muted /70">
 {origin.store_name}: {origin.origin_country} → {origin.destination_country}
 </span>
 ))}
 </div>
 ) : null}
 {!crossBorder && config?.cod_allowed && (
 <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-light-6 px-2.5 py-1 text-[10px] font-bold uppercase text-green-dark">
 <HugeiconsIcon icon={ShieldCheckIcon} size={11} /> COD may be available
 </span>
 )}
 </div>
 </div>
 )}
 </div>
 </section>
 );
}
