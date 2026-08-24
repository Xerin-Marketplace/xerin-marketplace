"use client";

import { Globe2, MapPin, ShieldCheck } from "lucide-react";
import type {
  DeliveryCheckoutConfig,
  DeliveryMode,
} from "@/types/api/commerce";

export default function DeliveryModeSelector({
  value,
  onChange,
  config,
}: {
  value: DeliveryMode;
  onChange: (mode: DeliveryMode) => void;
  config?: DeliveryCheckoutConfig;
}) {
  const internationalAllowed =
    Boolean(config?.international_delivery_allowed);

  return (
    <section className="rounded-2xl border border-[#e7ebf0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-darkTheme-card sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-orange">
        Customer Phase 4
      </p>
      <h2 className="mt-1 text-xl font-bold text-dark dark:text-white">
        Choose Delivery Type
      </h2>
      <p className="mt-1 text-sm leading-6 text-dark-4">
        Choose domestic delivery for Tanzania-only routes, or International /
        Cross-border when a product must move between countries. A cross-border
        order may still be delivered to a Tanzania address.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange("local")}
          className={`rounded-2xl border p-4 text-left transition ${
            value === "local"
              ? "border-orange bg-orange/5 ring-2 ring-orange/10"
              : "border-gray-3 dark:border-white/10"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange/10 text-orange">
              <MapPin size={18} />
            </span>
            <div>
              <p className="font-bold text-dark dark:text-white">
                Local — Tanzania
              </p>
              <p className="mt-1 text-xs leading-5 text-dark-4">
                Choose an approved local logistics company and its delivery
                service.
              </p>
              {config?.cod_allowed && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">
                  <ShieldCheck size={11} />
                  COD may be available
                </span>
              )}
            </div>
          </div>
        </button>

        <button
          type="button"
          disabled={!internationalAllowed}
          onClick={() => internationalAllowed && onChange("international")}
          className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
            value === "international"
              ? "border-orange bg-orange/5 ring-2 ring-orange/10"
              : "border-gray-3 dark:border-white/10"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Globe2 size={18} />
            </span>
            <div>
              <p className="font-bold text-dark dark:text-white">
                International / Cross-border
              </p>
              <p className="mt-1 text-xs leading-5 text-dark-4">
                Use this when a product ships from another country, including
                deliveries from UAE, China, Turkey, UK, USA and other countries
                into Tanzania.
              </p>
              {!internationalAllowed && (
                <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-500">
                  Cross-border delivery disabled by marketplace
                </span>
              )}
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}
