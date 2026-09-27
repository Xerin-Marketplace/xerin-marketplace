"use client";
import {useEffect,useMemo,useState} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartColumnIcon, DollarCircleIcon, MousePointerClickIcon, PackageIcon, RefreshCwIcon, ShoppingCart01Icon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import {brokersApi} from "@/lib/api/endpoints/brokers";
import type {BrokerAnalyticsOverview, BrokerCampaignAnalytics} from "@/types/api/broker";

const money=(v:string|number,c="TZS")=>`${c} ${Number(v||0).toLocaleString(undefined,{maximumFractionDigits:2})}`;
const number=(v:number)=>Number(v||0).toLocaleString();
export default function BrokerAnalytics(){
 const [days,setDays]=useState(30),[summary,setSummary]=useState<BrokerAnalyticsOverview|null>(null),[campaigns,setCampaigns]=useState<BrokerCampaignAnalytics[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=async()=>{setLoading(true);setError("");try{const [a,c]=await Promise.all([brokersApi.analyticsOverview(days),brokersApi.campaignAnalytics({days,page:1,page_size:50})]);setSummary(a);setCampaigns(c.results);}catch(e){setError(e instanceof Error?e.message:"Unable to load Broker analytics");}finally{setLoading(false)}};
 useEffect(()=>{void load()},[days]);
 const best=useMemo(()=>[...campaigns].sort((a,b)=>b.attributed_orders-a.attributed_orders)[0],[campaigns]);
 if(loading&&!summary)return <Panel>Loading Broker analytics…</Panel>;
 if(error&&!summary)return <Panel><p className="text-destructive">{error}</p></Panel>;
 const s=summary!;
 const cards=[
 ["Referral Clicks",number(s.total_clicks),`${number(s.unique_visitors)} unique`,MousePointerClickIcon],
 ["Attributed Orders",number(s.attributed_orders),`${number(s.attributed_customers)} customers`,ShoppingCart01Icon],
 ["Conversion Rate",`${Number(s.conversion_rate).toFixed(2)}%`,`${number(s.successful_sales)} successful sales`,ChartColumnIcon],
 ["Lifetime Earnings",money(s.lifetime_earnings,s.currency),`${money(s.available_earnings,s.currency)} available`,DollarCircleIcon],
 ["Promoting",number(s.currently_promoting),`${number(s.available_opportunities)} opportunities`,UserMultiple02Icon],
 ["Own Listings",number(s.own_products_active),`${number(s.own_products_expired)} expired`,PackageIcon],
 ];
 return <div className="space-y-5">
 <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-bold text-foreground sm:text-2xl">Broker analytics</h1><p className="mt-1 text-sm text-muted-foreground">Referral, attribution, sales and earnings performance.</p></div><div className="flex gap-2"><select value={days} onChange={e=>setDays(Number(e.target.value))} className="h-10 rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option><option value={365}>1 year</option></select><button onClick={()=>void load()} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><HugeiconsIcon icon={RefreshCwIcon} size={15}/></button></div></div>
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label,value,sub,Icon]:any)=><article key={label} className="rounded-xl border bg-card p-5"><div className="flex items-center justify-between"><p className="text-sm font-bold text-muted-foreground">{label}</p><HugeiconsIcon icon={Icon} size={18} className="text-primary"/></div><p className="mt-3 text-2xl font-black text-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{sub}</p></article>)}</div>
 <div className="grid gap-4 lg:grid-cols-3"><article className="rounded-xl border bg-card p-5"><p className="text-sm font-bold text-muted-foreground">Wallet Available</p><p className="mt-2 text-2xl font-black">{money(s.wallet_available,s.currency)}</p></article><article className="rounded-xl border bg-card p-5"><p className="text-sm font-bold text-muted-foreground">Pending Wallet</p><p className="mt-2 text-2xl font-black">{money(s.wallet_pending,s.currency)}</p></article><article className="rounded-xl border bg-card p-5"><p className="text-sm font-bold text-muted-foreground">Paid Out</p><p className="mt-2 text-2xl font-black">{money(s.wallet_paid_out,s.currency)}</p></article></div>
 {best&&<section className="rounded-xl border border-primary/25 bg-primary/10 p-5"><p className="text-xs font-bold uppercase tracking-widest text-primary">Top campaign in this period</p><p className="mt-2 font-black text-foreground">{best.product_name}</p><p className="mt-1 text-sm text-muted-foreground">{number(best.attributed_orders)} attributed orders · {Number(best.conversion_rate).toFixed(2)}% conversion · {money(best.net_commission,s.currency)} net commission</p></section>}
 <section className="overflow-hidden rounded-xl border bg-card"><div className="border-b p-5"><h2 className="font-black">Campaign Performance</h2><p className="mt-1 text-sm text-muted-foreground">Performance for products you accepted and promoted.</p></div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr>{["Product","Code","Clicks","Orders","Success","Conversion","Net commission","Status"].map(h=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{campaigns.length?campaigns.map(c=><tr key={c.offer_id} className="border-t"><td className="px-4 py-4 font-bold">{c.product_name}</td><td className="px-4 py-4 font-mono text-xs">{c.referral_code||"—"}</td><td className="px-4 py-4">{number(c.clicks)}</td><td className="px-4 py-4">{number(c.attributed_orders)}</td><td className="px-4 py-4">{number(c.successful_sales)}</td><td className="px-4 py-4">{Number(c.conversion_rate).toFixed(2)}%</td><td className="px-4 py-4 font-bold">{money(c.net_commission,s.currency)}</td><td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-xs font-bold ${c.is_active?"bg-green-light-5 text-green-dark":"bg-muted text-muted-foreground"}`}>{c.is_active?"Active":"Stopped"}</span></td></tr>):<tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No promoted campaigns yet.</td></tr>}</tbody></table></div></section>
 </div>
}
function Panel({children}:{children:React.ReactNode}){return <div className="rounded-xl border bg-card p-6">{children}</div>}
