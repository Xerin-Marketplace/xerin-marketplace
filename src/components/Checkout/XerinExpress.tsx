import PriceDisplay from "@/components/shared/PriceDisplay";
import type { XerinExpressOption } from "@/types/api/commerce";

export default function XerinExpress({options,selected,onSelect,loading}:{options:XerinExpressOption[];selected:string;onSelect:(o:XerinExpressOption)=>void;loading:boolean}){
 if(loading) return <p className="rounded-xl bg-muted p-6 text-sm text-muted-foreground">Finding the best Xerin Express options…</p>;
 return <section>
<h3 className="font-semibold text-foreground">Xerin Express</h3>
<p className="mt-1 text-xs text-muted-foreground">Choose your delivery speed. A partner is assigned automatically.</p>
<div className="mt-4 grid gap-3 sm:grid-cols-2">{options.map(o=><button type="button" key={o.tier} onClick={()=>onSelect(o)} className={`rounded-xl p-4 text-left transition ${selected===o.rate_id?"bg-primary/10":"bg-muted hover:bg-muted/60"}`}><div className="flex items-center justify-between"><b className="text-foreground">{o.label}</b><PriceDisplay amount={Number(o.delivery_amount)} sourceCurrency="TZS"/></div><p className="mt-2 text-xs text-muted-foreground">Delivery within {o.promised_delivery_minutes<60?`${o.promised_delivery_minutes} min`:`${Math.ceil(o.promised_delivery_minutes/60)} hr`}</p></button>)}</div>
{!options.length&&<p className="mt-4 rounded-xl bg-yellow-light-4 p-3 text-sm text-yellow-dark-2">No Xerin Express Standard or Express service currently qualifies for this route.</p>}
</section>
}
