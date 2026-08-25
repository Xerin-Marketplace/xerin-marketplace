"use client";

import { Globe2, Loader2, MapPin, ShieldCheck } from "lucide-react";
import type { DeliveryCheckoutConfig, DetectedDeliveryMode, DeliveryMode } from "@/types/api/commerce";

export default function DeliveryModeSelector({
  value,
  config,
  detected,
  loading,
}: {
  value: DeliveryMode;
  config?: DeliveryCheckoutConfig;
  detected?: DetectedDeliveryMode;
  loading?: boolean;
}) {
  const crossBorder = value === "international";
  return (
    <section className="rounded-2xl border border-[#e7ebf0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-darkTheme-card sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-orange">Automatic delivery route</p>
      <h2 className="mt-1 text-xl font-bold text-dark dark:text-white">Delivery Type</h2>
      <p className="mt-1 text-sm leading-6 text-dark-4">
        Xerin detects this automatically from the product store country and your selected delivery address.
      </p>
      <div className="mt-5 rounded-2xl border border-orange bg-orange/5 p-4 ring-2 ring-orange/10">
        {loading ? (
          <div className="flex items-center gap-2 text-sm font-semibold"><Loader2 className="animate-spin" size={17} /> Detecting delivery route…</div>
        ) : (
          <div className="flex items-start gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${crossBorder ? "bg-blue-50 text-blue-600" : "bg-orange/10 text-orange"}`}>
              {crossBorder ? <Globe2 size={18} /> : <MapPin size={18} />}
            </span>
            <div className="min-w-0">
              <p className="font-bold text-dark dark:text-white">{crossBorder ? "International / Cross-border" : "Domestic / Local"}</p>
              <p className="mt-1 text-xs leading-5 text-dark-4">
                {crossBorder
                  ? "At least one product store is in a different country from the delivery destination."
                  : "All product stores are in the same country as the delivery destination."}
              </p>
              {detected?.origins?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {detected.origins.map((origin) => (
                    <span key={origin.store_id} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm dark:bg-white/10 dark:text-white/70">
                      {origin.store_name}: {origin.origin_country} → {origin.destination_country}
                    </span>
                  ))}
                </div>
              ) : null}
              {!crossBorder && config?.cod_allowed && (
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">
                  <ShieldCheck size={11} /> COD may be available
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
