"use client";
import {useEffect,useMemo,useState} from "react";
import {BarChart3, BadgeDollarSign, MousePointerClick, Package, RefreshCw, ShoppingCart, Users} from "lucide-react";
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
 if(error&&!summary)return <Panel><p className="text-red-600">{error}</p></Panel>;
 const s=summary!;
 const cards=[
  ["Referral Clicks",number(s.total_clicks),`${number(s.unique_visitors)} unique`,MousePointerClick],
  ["Attributed Orders",number(s.attributed_orders),`${number(s.attributed_customers)} customers`,ShoppingCart],
  ["Conversion Rate",`${Number(s.conversion_rate).toFixed(2)}%`,`${number(s.successful_sales)} successful sales`,BarChart3],
  ["Lifetime Earnings",money(s.lifetime_earnings,s.currency),`${money(s.available_earnings,s.currency)} available`,BadgeDollarSign],
  ["Promoting",number(s.currently_promoting),`${number(s.available_opportunities)} opportunities`,Users],
  ["Own Listings",number(s.own_products_active),`${number(s.own_products_expired)} expired`,Package],
 ];
 return <div className="space-y-5">
  <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-300">B7 · Performance</p><h1 className="mt-2 text-3xl font-black">Broker Analytics</h1><p className="mt-2 text-sm text-white/65">Real referral, attribution, sales and earnings performance.</p></div><div className="flex gap-2"><select value={days} onChange={e=>setDays(Number(e.target.value))} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"><option className="text-slate-900" value={7}>7 days</option><option className="text-slate-900" value={30}>30 days</option><option className="text-slate-900" value={90}>90 days</option><option className="text-slate-900" value={365}>1 year</option></select><button onClick={()=>void load()} className="rounded-xl bg-orange-500 p-2.5"><RefreshCw size={18}/></button></div></div></section>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label,value,sub,Icon]:any)=><article key={label} className="rounded-2xl border bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-500">{label}</p><Icon size={19} className="text-orange-500"/></div><p className="mt-3 text-2xl font-black text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{sub}</p></article>)}</div>
  <div className="grid gap-4 lg:grid-cols-3"><article className="rounded-2xl border bg-white p-5"><p className="text-sm font-bold text-slate-500">Wallet Available</p><p className="mt-2 text-2xl font-black">{money(s.wallet_available,s.currency)}</p></article><article className="rounded-2xl border bg-white p-5"><p className="text-sm font-bold text-slate-500">Pending Wallet</p><p className="mt-2 text-2xl font-black">{money(s.wallet_pending,s.currency)}</p></article><article className="rounded-2xl border bg-white p-5"><p className="text-sm font-bold text-slate-500">Paid Out</p><p className="mt-2 text-2xl font-black">{money(s.wallet_paid_out,s.currency)}</p></article></div>
  {best&&<section className="rounded-2xl border border-orange-200 bg-orange-50 p-5"><p className="text-xs font-bold uppercase tracking-widest text-orange-700">Top campaign in this period</p><p className="mt-2 font-black text-slate-950">{best.product_name}</p><p className="mt-1 text-sm text-slate-600">{number(best.attributed_orders)} attributed orders · {Number(best.conversion_rate).toFixed(2)}% conversion · {money(best.net_commission,s.currency)} net commission</p></section>}
  <section className="overflow-hidden rounded-2xl border bg-white"><div className="border-b p-5"><h2 className="font-black">Campaign Performance</h2><p className="mt-1 text-sm text-slate-500">Performance for products you accepted and promoted.</p></div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr>{["Product","Code","Clicks","Orders","Success","Conversion","Net commission","Status"].map(h=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{campaigns.length?campaigns.map(c=><tr key={c.offer_id} className="border-t"><td className="px-4 py-4 font-bold">{c.product_name}</td><td className="px-4 py-4 font-mono text-xs">{c.referral_code||"—"}</td><td className="px-4 py-4">{number(c.clicks)}</td><td className="px-4 py-4">{number(c.attributed_orders)}</td><td className="px-4 py-4">{number(c.successful_sales)}</td><td className="px-4 py-4">{Number(c.conversion_rate).toFixed(2)}%</td><td className="px-4 py-4 font-bold">{money(c.net_commission,s.currency)}</td><td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-xs font-bold ${c.is_active?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-slate-600"}`}>{c.is_active?"Active":"Stopped"}</span></td></tr>):<tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">No promoted campaigns yet.</td></tr>}</tbody></table></div></section>
 </div>
}
function Panel({children}:{children:React.ReactNode}){return <div className="rounded-2xl border bg-white p-6">{children}</div>}
