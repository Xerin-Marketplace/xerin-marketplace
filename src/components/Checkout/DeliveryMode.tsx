"use client";


import { Spinner } from "@/components/ui/Spinner";
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
 <section>
 <div className="rounded-xl bg-muted p-4">
 {loading ? (
 <div className="flex items-center gap-2 text-sm font-semibold"><Spinner size={17} /> Detecting delivery route…</div>
 ) : awaitingAddress || !detected ? (
 <div>
 <p className="font-bold text-foreground">Waiting for delivery address</p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 Select and confirm a delivery address below. Xerin will then detect whether this order is domestic or cross-border.
 </p>
 </div>
 ) : (
 <div>
 <p className="font-bold text-foreground">{crossBorder ?"International / Cross-border" : "Domestic / Local"}</p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 {crossBorder
 ? "At least one product store is in a different country from the delivery destination."
 : "All product stores are in the same country as the delivery destination."}
 </p>
 {detected?.origins?.length ? (
 <div className="mt-3 flex flex-wrap gap-2">
 {detected.origins.map((origin) => (
 <span key={origin.store_id} className="rounded-full bg-background px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
 {origin.store_name}: {origin.origin_country} → {origin.destination_country}
 </span>
 ))}
 </div>
 ) : null}
 {!crossBorder && config?.cod_allowed && (
 <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[10px] font-bold uppercase text-muted-foreground ring-1 ring-border">
 COD may be available
 </span>
 )}
 </div>
 )}
 </div>
 </section>
 );
}
