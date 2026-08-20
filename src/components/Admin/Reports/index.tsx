"use client";

import { useEffect,useMemo,useState } from "react";
import { AdminReport,getAdminReport } from "@/lib/api/endpoints/admin";
export type ReportView="sales"|"orders"|"products"|"inventory"|"customers"|"payments";
const names={sales:"Sales Reports",orders:"Order Reports",products:"Product Reports",inventory:"Inventory Reports",customers:"Customer Reports",payments:"Payment Reports"};
const pretty=(v:string)=>v.replaceAll("_"," ").replace(/\b\w/g,l=>l.toUpperCase());
const format=(v:number,type:string)=>type==="currency"?new Intl.NumberFormat("en-TZ",{style:"currency",currency:"TZS",maximumFractionDigits:0}).format(v):type==="percent"?`${v}%`:new Intl.NumberFormat().format(v);
export default function AdminReports({view}:{view:ReportView}){const[report,setReport]=useState<AdminReport|null>(null);const[loading,setLoading]=useState(true);const[error,setError]=useState("");const[range,setRange]=useState("30");const[query,setQuery]=useState("");
 const dates=()=>{const to=new Date();const from=new Date();from.setDate(from.getDate()-Number(range));return{date_from:from.toISOString(),date_to:to.toISOString()}};
 const load=async()=>{setLoading(true);setError("");try{setReport(await getAdminReport(view,dates()))}catch(e){setError(e instanceof Error?e.message:"Unable to generate report")}finally{setLoading(false)}};useEffect(()=>{void load()},[view,range]);
 const rows=useMemo(()=>(report?.rows||[]).filter(r=>Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase())),[report,query]);const max=Math.max(...(report?.breakdown.map(b=>b.value)||[1]),1);
 const exportCsv=()=>{if(!report||!rows.length)return;const keys=Object.keys(rows[0]);const esc=(v:unknown)=>`"${String(v??"").replaceAll('"','""')}"`;const csv=[keys.map(esc).join(","),...rows.map(r=>keys.map(k=>esc(r[k])).join(","))].join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`xerin-${view}-report.csv`;a.click();URL.revokeObjectURL(a.href)};
 return <div className="admin-operations-page space-y-5">
<section className="admin-operations-header">
<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
<div>
<p className="text-xs font-bold uppercase tracking-[.18em] text-[#f47524]">Business intelligence</p>
<h2 className="mt-2 text-2xl font-bold tracking-[-.02em] text-[#111827] dark:text-white">{names[view]}</h2>
<p className="mt-1 max-w-2xl text-sm text-[#64748b] dark:text-white/60">Live operational totals, distribution and detailed records for the selected reporting period.</p>
</div>
<div className="flex flex-col gap-2 sm:flex-row">
<select value={range} onChange={e=>setRange(e.target.value)} className="min-h-11 rounded-xl border border-[#dfe5ec] bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
<option value="7">Last 7 days</option>
<option value="30">Last 30 days</option>
<option value="90">Last 90 days</option>
<option value="365">Last year</option>
</select>
<button onClick={exportCsv} disabled={!rows.length} className="min-h-11 rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#253044] disabled:opacity-40 dark:bg-[#f47524]">Export CSV</button>
</div>
</div>
</section>{error&&<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{loading?<div className="rounded-2xl border bg-white p-12 text-center text-gray-500">Generating report...</div>:report&&<>
<section className="admin-metric-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{report.metrics.map(m=>
<article key={m.label} className="admin-metric-card">
<p className="text-sm text-gray-500">{m.label}</p>
<p className="mt-2 text-2xl font-semibold">{format(m.value,m.format)}</p>
<p className="mt-1 text-xs text-gray-400">Selected period</p>
</article>)}</section>
<section className="grid gap-5 lg:grid-cols-[1fr_2fr]">
<article className="admin-operations-card p-5">
<h3 className="font-semibold">Distribution</h3>
<div className="mt-5 space-y-4">{report.breakdown.length?report.breakdown.map(b=>
<div key={b.label}>
<div className="mb-1 flex justify-between text-sm">
<span>{pretty(b.label)}</span>
<b>{b.value}</b>
</div>
<div className="h-2 rounded-full bg-gray-100">
<div style={{width:`${Math.max(4,100*b.value/max)}%`}} className="h-2 rounded-full bg-orange-500"/>
</div>
</div>):<p className="text-sm text-gray-500">No distribution data for this period.</p>}</div>
</article>
<article className="admin-operations-card overflow-hidden">
<div className="admin-operations-toolbar">
<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search report records" className="min-h-11 min-w-0 flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-orange-400"/>
<button onClick={()=>void load()} className="min-h-11 rounded-xl border px-4 text-sm font-semibold">Refresh</button>
</div>
<ReportTable rows={rows}/>
</article>
</section>
</>}</div>}
function ReportTable({rows}:{rows:AdminReport["rows"]}){if(!rows.length)return <div className="p-10 text-center">
<p className="text-3xl">📊</p>
<p className="mt-2 font-medium">No records in this period</p>
<p className="mt-1 text-sm text-gray-500">Try a wider reporting range.</p>
</div>;const keys=Object.keys(rows[0]).filter(k=>k!=="id").slice(0,7);return <div className="overflow-x-auto">
<table className="w-full min-w-[700px] text-left text-sm">
<thead className="bg-gray-50 text-xs uppercase text-gray-500">
<tr>{keys.map(k=>
<th key={k} className="px-4 py-3">{pretty(k)}</th>)}</tr>
</thead>
<tbody className="divide-y">{rows.map((r,i)=>
<tr key={String(r.id||i)} className="hover:bg-gray-50">{keys.map(k=>
<td key={k} className="px-4 py-3">{k==="date"&&r[k]?new Date(String(r[k])).toLocaleDateString():k==="amount"?format(Number(r[k]),"currency"):k==="status"?<StatusBadge value={String(r[k])}/>:String(r[k]??"—")}</td>)}</tr>)}</tbody>
</table>
</div>}
function StatusBadge({value}:{value:string}){const normalized=value.toLowerCase();const tone=normalized.includes("complete")||normalized.includes("paid")||normalized.includes("success")||normalized.includes("active")?"success":normalized.includes("fail")||normalized.includes("cancel")||normalized.includes("reject")?"danger":normalized.includes("pending")||normalized.includes("processing")?"warning":"neutral";return <span className={`admin-status-badge admin-status-${tone}`}>{pretty(value)}</span>}
