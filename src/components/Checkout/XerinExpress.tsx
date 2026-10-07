import PriceDisplay from "@/components/shared/PriceDisplay";
import type { XerinExpressOption } from "@/types/api/commerce";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, TruckDeliveryIcon, ZapIcon } from "@hugeicons/core-free-icons";

function etaLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export default function XerinExpress({
  options,
  selected,
  onSelect,
  loading,
}: {
  options: XerinExpressOption[];
  selected: string;
  onSelect: (o: XerinExpressOption) => void;
  loading: boolean;
}) {
  if (loading)
    return (
      <div className="rounded-xl bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          Finding the best Xerin Express options…
        </p>
      </div>
    );

  return (
    <section>
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={ZapIcon} size={20} className="text-primary" />
        <h3 className="font-semibold text-foreground">Xerin Express Delivery</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Choose your delivery speed. A partner is assigned automatically.
      </p>

      {options.length > 0 ? (
        <div className="mt-3 space-y-2">
          {options.map((o) => {
            const active = selected === o.rate_id;
            const isExpress = o.tier === "express";
            return (
              <button
                type="button"
                key={o.rate_id}
                onClick={() => onSelect(o)}
                className={`flex w-full items-start gap-3 rounded-xl p-3.5 text-left transition sm:p-4 ${
                  active
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "bg-muted hover:bg-muted/60"
                }`}
              >
                <span
                  className={`mt-0.5 size-4 shrink-0 rounded-full border-2 ${
                    active
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        isExpress
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/15 text-muted-foreground"
                      }`}
                    >
                      {isExpress ? "Express" : "Standard"}
                    </span>
                    <b className="truncate text-sm text-foreground">{o.label}</b>
                  </span>
                  <span className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <HugeiconsIcon icon={Clock01Icon} size={13} className="shrink-0" />
                    {etaLabel(o.promised_delivery_minutes)}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <HugeiconsIcon icon={TruckDeliveryIcon} size={13} className="shrink-0" />
                    <span className="truncate">{o.logistics_company_name}</span>
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold text-foreground">
                  {Number(o.delivery_amount) === 0 ? (
                    "Free"
                  ) : (
                    <PriceDisplay
                      amount={Number(o.delivery_amount)}
                      sourceCurrency="TZS"
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 rounded-xl bg-yellow-light-4 p-3 text-sm text-yellow-dark-2">
          Xerin Express is not available for this address yet. Standard
          delivery will be arranged with the seller.
        </p>
      )}
    </section>
  );
}
