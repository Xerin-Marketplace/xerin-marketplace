import PriceDisplay from "@/components/shared/PriceDisplay";
import type { XerinExpressOption } from "@/types/api/commerce";

function etaLabel(minutes: number) {
  if (minutes < 60) return `Within ${minutes} min`;
  const hours = minutes / 60;
  if (hours < 24)
    return `Within ${Number.isInteger(hours) ? hours : Math.ceil(hours)} hr`;
  const days = Math.round(hours / 24);
  return `${days}–${days + 1} day${days === 1 ? "" : "s"}`;
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
        <svg
          viewBox="0 0 24 24"
          className="size-5 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
        <h3 className="font-semibold text-foreground">Xerin Express</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Choose your delivery speed. A partner is assigned automatically.
      </p>

      {options.length > 0 ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {options.map((o) => {
            const active = selected === o.rate_id;
            return (
              <button
                type="button"
                key={o.rate_id}
                onClick={() => onSelect(o)}
                className={`flex items-center gap-3 rounded-xl p-3.5 text-left transition ${
                  active
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "bg-muted hover:bg-muted/60"
                }`}
              >
                <span
                  className={`size-4 shrink-0 rounded-full border-2 ${
                    active
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <b className="text-sm text-foreground">{o.label}</b>
                    {o.tier === "express" && (
                      <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                        Fastest
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {etaLabel(o.promised_delivery_minutes)}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-foreground">
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
