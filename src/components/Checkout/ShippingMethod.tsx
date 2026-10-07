import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkBadge01Icon, Clock01Icon, RouteIcon } from "@hugeicons/core-free-icons";
import type { DeliveryMode, EligibleLogisticsCompany, MultiSellerDeliveryOption } from "@/types/api/commerce";
import PriceDisplay from "@/components/shared/PriceDisplay";

export default function ShippingMethod({ companies, excludedCompanies = [], options, selected, onChange, selectedCompanyId, onCompanyChange, deliveryMode, destinationCountry, destinationRegion, destinationCity, hasSelectedAddress, addressReady, isLoadingCompanies, isLoadingPricing }: {
 companies: EligibleLogisticsCompany[]; options: MultiSellerDeliveryOption[]; selected: string;
 excludedCompanies?: Array<{ logistics_company_id: string; name: string; code: string; reasons: string[]; uncovered_sellers: string[] }>;
 onChange: (rateId: string) => void; selectedCompanyId: string; onCompanyChange: (companyId: string) => void;
 deliveryMode: DeliveryMode;
 destinationCountry?: string;
 destinationRegion?: string;
 destinationCity?: string;
 hasSelectedAddress: boolean;
 addressReady: boolean;
 isLoadingCompanies?: boolean;
 isLoadingPricing?: boolean;
}) {
 return <section>
 <div><div className="flex items-center gap-3"><div><h3 className="font-bold text-foreground">Choose Logistics Company</h3><p className="mt-0.5 text-xs text-muted-foreground">Providers covering every store for this {deliveryMode === "international" ? "cross-border" : "local"} delivery</p>{destinationCountry && <p className="mt-1 text-xs font-semibold text-muted-foreground">Delivering to: {destinationCountry}{destinationRegion ? ` · ${destinationRegion}` : ""}{destinationCity ? ` · ${destinationCity}` : ""}</p>}</div></div></div>
 <div className="p-4 sm:p-6">
 {!hasSelectedAddress ? <Empty text="Choose a delivery address before selecting a logistics company." /> : !addressReady ? <Empty text="Confirm the exact delivery point above first. We will check available logistics companies immediately after the address is verified." /> : isLoadingCompanies ? <Loading text="Checking seller pickup coverage…" /> : companies.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{companies.map((company) => {
 const active = company.logistics_company_id === selectedCompanyId;
 return <button type="button" key={company.logistics_company_id} onClick={() => onCompanyChange(company.logistics_company_id)} className={`min-h-[92px] rounded-xl p-3 text-left transition sm:p-4 ${active ? "bg-primary/10" : "bg-muted hover:bg-muted/60"}`}><span className="flex items-start justify-between gap-3"><span className="min-w-0"><b className="block break-words text-sm text-foreground">{company.name}</b><span className="mt-1 block text-xs text-muted-foreground">Covers {company.covered_seller_count} of {company.seller_count} sellers · {company.services.length} service{company.services.length === 1 ? "" : "s"}</span></span>{active && <HugeiconsIcon icon={CheckmarkBadge01Icon} className="shrink-0 text-primary" size={19} />}</span><span className="mt-2 flex flex-wrap gap-1.5">{company.supports_tracking && <Tag text="Tracking" />}{company.supports_cod && <Tag text="COD" />}</span></button>;
 })}</div> : <Empty text="No logistics company currently covers this store-to-customer delivery route for the confirmed address." />}

 {selectedCompanyId && <div className="mt-5  pt-5"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Delivery price options</p>{isLoadingPricing ? <div className="mt-3"><Loading text="Calculating road distances and delivery price…" /></div> : options.length ? <div className="mt-3 space-y-3">{options.map((option) => <label key={option.rate_id} className={`flex min-h-[92px] cursor-pointer items-start gap-3 rounded-xl p-3 transition sm:p-4 ${selected === option.rate_id ? "bg-primary/10" : "bg-muted hover:bg-muted/60"}`}><input type="radio" name="delivery-rate" checked={selected === option.rate_id} onChange={() => onChange(option.rate_id)} className="mt-1 accent-orange" /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><b className="break-words text-foreground">{option.method_name}</b><strong className="text-primary"><PriceDisplay amount={Number(option.delivery_amount)} sourceCurrency="TZS" /></strong></span><span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><HugeiconsIcon icon={Clock01Icon} size={12} />{option.min_delivery_days}–{option.max_delivery_days} business days</span><span className="inline-flex items-center gap-1"><HugeiconsIcon icon={RouteIcon} size={12} />{Number(option.billable_distance_km).toFixed(1)} km billable distance</span></span><span className="mt-2 block text-[11px] leading-5 text-muted-foreground">Pricing strategy: {option.strategy.replaceAll("_", " ")} · {option.seller_count} store route{option.seller_count === 1 ? "" : "s"}</span>
 {option.sellers.length > 0 && <span className="mt-3 grid gap-2">{option.sellers.map((route) => <span key={`${route.store_id || route.pickup_location_id}-${route.seller_id}`} className="rounded-lg bg-muted px-3 py-2 text-[11px] leading-5 text-muted-foreground dark:bg-muted"><span className="flex flex-wrap items-center justify-between gap-2"><b className="text-foreground">{route.store_name || route.pickup_label}</b><span className="rounded-full bg-card/70 px-2 py-0.5 font-bold uppercase dark:bg-muted">{route.route_type === "cross_border" ? "Cross-border" : "Domestic"}</span></span><span className="mt-0.5 block">{route.origin_country || "Store origin"} → {destinationCountry || "Delivery destination"} · {Number(route.distance_km).toFixed(1)} km road distance{Number(route.duration_minutes) > 0 ? ` · ${Math.round(Number(route.duration_minutes))} min` : ""}</span></span>)}</span>}
 </span></label>)}</div> : <div className="mt-3"><Empty text="This provider has no active rate for the selected route." /></div>}</div>}
 </div>
 </section>;
}

function Loading({ text }: { text: string }) { return <p className="animate-pulse py-4 text-sm text-muted-foreground">{text}</p>; }
function Empty({ text }: { text: string }) { return <div className="rounded-xl bg-yellow-light-4 p-4 text-sm leading-6 text-yellow-dark-2">{text}</div>; }
function Tag({ text }: { text: string }) { return <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">{text}</span>; }


