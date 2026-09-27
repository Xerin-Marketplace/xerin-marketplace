"use client";
import {useEffect,useMemo,useState}from"react";
import{ApplicationSetting,AuditLog,BackgroundJob,SystemEvent,AlertNotificationRow,MigrationEventRow,WeeklyReportRow,MonitoringOverview,acknowledgeSystemEvent,cancelBackgroundJob,listApplicationSettings,listAuditLogs,listBackgroundJobs,listSystemEvents,retryBackgroundJob,updateApplicationSetting,getMonitoringOverview,listAlertNotifications,listMigrationEvents,listWeeklyReports}from"@/lib/api/endpoints/admin";
export type SystemView="audit"|"events"|"jobs"|"settings"|"monitoring"|"alerts"|"migrations"|"reports";
const titles={audit:"Audit Logs",events:"System Events",jobs:"Background Jobs",settings:"Application Settings",monitoring:"Monitoring Overview",alerts:"Email Alerts",migrations:"Migrations",reports:"Weekly Reports"};const pretty=(v:string)=>v.replaceAll("."," · ").replaceAll("_"," ").replace(/\b\w/g,l=>l.toUpperCase());
export default function AdminSystemManagement({view}:{view:SystemView}){const[logs,setLogs]=useState<AuditLog[]>([]),[events,setEvents]=useState<SystemEvent[]>([]),[jobs,setJobs]=useState<BackgroundJob[]>([]),[settings,setSettings]=useState<ApplicationSetting[]>([]);const[loading,setLoading]=useState(true),[error,setError]=useState(""),[query,setQuery]=useState(""),[busy,setBusy]=useState<string|null>(null),[overview,setOverview]=useState<MonitoringOverview|null>(null),[alerts,setAlerts]=useState<AlertNotificationRow[]>([]),[migrations,setMigrations]=useState<MigrationEventRow[]>([]),[reports,setReports]=useState<WeeklyReportRow[]>([]);
const load=async()=>{setLoading(true);setError("");try{if(view==="audit")setLogs(await listAuditLogs());if(view==="events")setEvents(await listSystemEvents());if(view==="jobs")setJobs(await listBackgroundJobs());if(view==="settings")setSettings(await listApplicationSettings());if(view==="monitoring")setOverview(await getMonitoringOverview());if(view==="alerts")setAlerts(await listAlertNotifications());if(view==="migrations")setMigrations(await listMigrationEvents());if(view==="reports")setReports(await listWeeklyReports())}catch(e){setError(e instanceof Error?e.message:"Unable to load system data")}finally{setLoading(false)}};useEffect(()=>{void load()},[view]);const source=view==="audit"?logs:view==="events"?events:view==="jobs"?jobs:view==="alerts"?alerts:view==="migrations"?migrations:view==="reports"?reports:settings;const filtered=useMemo(()=>source.filter(r=>JSON.stringify(r).toLowerCase().includes(query.toLowerCase())),[source,query]);const act=async(id:string,fn:()=>Promise<unknown>)=>{setBusy(id);setError("");try{await fn();await load()}catch(e){setError(e instanceof Error?e.message:"System action failed")}finally{setBusy(null)}};
const metrics=view==="monitoring"?[["Audit events (24h)",overview?.last_24h.audit_events??0],["Critical (24h)",overview?.last_24h.critical??0],["Warnings (24h)",overview?.last_24h.warnings??0],["Open security",overview?.open_security_events??0],["Pending alerts",overview?.pending_alerts??0],["Failed alerts (7d)",overview?.failed_alerts_7d??0],["Server errors (24h)",overview?.last_24h.server_errors??0],["Security events (24h)",overview?.last_24h.security_events??0]]:view==="alerts"?[["Alerts",alerts.length],["Sent",alerts.filter(x=>x.status==="sent").length],["Pending",alerts.filter(x=>x.status==="pending").length],["Failed",alerts.filter(x=>x.status==="failed").length]]:view==="migrations"?[["Migrations",migrations.length],["Succeeded",migrations.filter(x=>x.status==="succeeded").length],["Failed",migrations.filter(x=>x.status==="failed").length],["Running",migrations.filter(x=>x.status==="started").length]]:view==="reports"?[["Reports",reports.length],["Sent",reports.filter(x=>x.status==="sent").length],["Failed",reports.filter(x=>x.status==="failed").length],["Latest",reports[0]?.sent_at?new Date(reports[0].sent_at).toLocaleDateString():"—"]]:view==="audit"?[["Audit entries",logs.length],["Actors",new Set(logs.map(x=>x.actor_id).filter(Boolean)).size],["Changes",logs.filter(x=>x.action.includes("updated")).length],["Today",logs.filter(x=>new Date(x.created_at).toDateString()===new Date().toDateString()).length]]:view==="events"?[["Events",events.length],["Open",events.filter(x=>x.status==="open").length],["Critical",events.filter(x=>x.severity==="critical").length],["Acknowledged",events.filter(x=>x.status==="acknowledged").length]]:view==="jobs"?[["Jobs",jobs.length],["Queued",jobs.filter(x=>x.status==="queued").length],["Running",jobs.filter(x=>x.status==="running").length],["Failed",jobs.filter(x=>x.status==="failed").length]]:[["Settings",settings.length],["Public",settings.filter(x=>x.is_public).length],["Operational",settings.filter(x=>!x.is_public).length],["Configured",settings.filter(x=>x.id).length]];
return <div className="admin-operations-page space-y-5">
<section className="admin-operations-header">
<p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Platform reliability</p>
<h2 className="mt-2 text-2xl font-bold tracking-[-.02em] text-foreground">{titles[view]}</h2>
<p className="mt-1 max-w-2xl text-sm text-muted-foreground /60">Observe platform state, triage exceptions and apply controlled changes with an administrator audit trail.</p>
</section>
<section className="admin-metric-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([l,v])=>
<article key={l} className="admin-metric-card">
<p className="text-sm text-muted-foreground">{l}</p>
<p className="mt-2 text-2xl font-semibold">{v}</p>
</article>)}</section>{error&&<div className="rounded-xl border border-red-light-4 bg-red-light-6 p-4 text-sm text-red-dark">{error}</div>}<section className="admin-operations-card overflow-hidden">
<div className="admin-operations-toolbar">
<input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${titles[view].toLowerCase()}`} className="min-h-11 min-w-0 flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-primary-400"/>
<button onClick={()=>void load()} className="min-h-11 rounded-xl border px-4 text-sm font-semibold">Refresh</button>
</div>{loading?<p className="p-10 text-center text-muted-foreground">Loading system data...</p>:!filtered.length?<Empty view={view}/>:view==="audit"?<AuditTable rows={filtered as AuditLog[]}/>:view==="events"?<EventTable rows={filtered as SystemEvent[]} busy={busy} act={act}/>:view==="jobs"?<JobTable rows={filtered as BackgroundJob[]} busy={busy} act={act}/>:view==="monitoring"?<MonitoringOverviewCard overview={overview}/>:view==="alerts"?<AlertTable rows={filtered as AlertNotificationRow[]}/>:view==="migrations"?<MigrationTable rows={filtered as MigrationEventRow[]}/>:view==="reports"?<ReportTable rows={filtered as WeeklyReportRow[]}/>:<Settings rows={filtered as ApplicationSetting[]} busy={busy} act={act}/>}</section>
</div>}
function AuditTable({rows}:{rows:AuditLog[]}){return <Table heads={["Actor","Action","Resource","Details","Time"]}>{rows.map(r=>
<tr key={r.id}>
<Td main={r.actor_name}/>
<Td main={pretty(r.action)}/>
<Td main={pretty(r.resource_type)} sub={r.resource_id||"—"}/>
<Td main={Object.keys(r.details||{}).length?JSON.stringify(r.details):"No metadata"}/>
<Td main={new Date(r.created_at).toLocaleString()}/>
</tr>)}</Table>}
function EventTable({rows,busy,act}:{rows:SystemEvent[];busy:string|null;act:(id:string,fn:()=>Promise<unknown>)=>void}){return <Table heads={["Source","Event","Message","Severity","Status",""]}>{rows.map(r=>
<tr key={r.id}>
<Td main={r.source}/>
<Td main={pretty(r.event_type)}/>
<Td main={r.message}/>
<td className="px-4 py-3"><StatusBadge value={r.severity} kind="severity"/></td>
<td className="px-4 py-3"><StatusBadge value={r.status}/></td>
<td className="px-4 py-3">{r.status==="open"&&<button disabled={busy===r.id} onClick={()=>void act(r.id,()=>acknowledgeSystemEvent(r.id))} className="font-semibold text-primary">Acknowledge</button>}</td>
</tr>)}</Table>}
function JobTable({rows,busy,act}:{rows:BackgroundJob[];busy:string|null;act:(id:string,fn:()=>Promise<unknown>)=>void}){return <Table heads={["Job","Queue","Attempts","Status","Failure",""]}>{rows.map(r=>
<tr key={r.id}>
<Td main={pretty(r.job_type)}/>
<Td main={r.queue}/>
<Td main={`${r.attempts} / ${r.max_attempts}`}/>
<td className="px-4 py-3"><StatusBadge value={r.status}/></td>
<Td main={r.failure_reason||"—"}/>
<td className="px-4 py-3 whitespace-nowrap">{["failed","cancelled"].includes(r.status)&&<button disabled={busy===r.id} onClick={()=>void act(r.id,()=>retryBackgroundJob(r.id))} className="mr-3 font-semibold text-primary">Retry</button>}{["queued","scheduled"].includes(r.status)&&<button disabled={busy===r.id} onClick={()=>void act(r.id,()=>cancelBackgroundJob(r.id))} className="font-semibold text-destructive">Cancel</button>}</td>
</tr>)}</Table>}
function Settings({rows,busy,act}:{rows:ApplicationSetting[];busy:string|null;act:(id:string,fn:()=>Promise<unknown>)=>void}){return <div className="grid gap-4 p-5 md:grid-cols-2">{rows.map(r=>
<Setting key={r.key} row={r} busy={busy===r.key} save={value=>act(r.key,()=>updateApplicationSetting(r.key,{value,category:r.category,description:r.description}))}/>)}</div>}
function Setting({row,busy,save}:{row:ApplicationSetting;busy:boolean;save:(v:unknown)=>void}){const[value,setValue]=useState(String(row.value));const bool=typeof row.value==="boolean";return <article className="admin-setting-card">
<div className="flex justify-between">
<div>
<h3 className="font-semibold">{pretty(row.key)}</h3>
<p className="mt-1 text-xs text-muted-foreground">{row.description}</p>
</div>
<span className="rounded-full bg-muted px-2 py-1 text-xs">{pretty(row.category)}</span>
</div>{bool?<label className="mt-5 flex items-center gap-3">
<input type="checkbox" checked={value==="true"} onChange={e=>setValue(String(e.target.checked))}/>
<span>Enabled</span>
</label>:<input value={value} onChange={e=>setValue(e.target.value)} type={typeof row.value==="number"?"number":"text"} className="mt-5 w-full rounded-xl border px-3 py-2.5"/>}<button disabled={busy} onClick={()=>save(bool?value==="true":typeof row.value==="number"?Number(value):value)} className="mt-4 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-foreground disabled:opacity-40">{busy?"Saving...":"Save setting"}</button>
</article>}
function MonitoringOverviewCard({overview}:{overview:MonitoringOverview|null}){
if(!overview)return <div className="p-10 text-center text-muted-foreground">Monitoring overview unavailable.</div>;
return <div className="grid gap-4 p-5 md:grid-cols-2">
<article className="admin-setting-card"><h3 className="font-semibold">Alerting</h3>
<p className="mt-2 text-sm">Recipient: <span className="font-mono">{overview.alert_recipient||"not configured"}</span></p>
<p className="mt-1 text-sm">Enabled: <StatusBadge value={overview.enabled?"enabled":"disabled"}/></p></article>
<article className="admin-setting-card"><h3 className="font-semibold">Weekly report</h3>
<p className="mt-2 text-sm">Schedule: {overview.weekly_report.day} {overview.weekly_report.time}</p>
<p className="mt-1 text-sm">Status: {overview.weekly_report.last_status||"never sent"} {overview.weekly_report.last_sent?`· ${new Date(overview.weekly_report.last_sent).toLocaleString()}`:""}</p></article>
<article className="admin-setting-card"><h3 className="font-semibold">Last migration</h3>
<p className="mt-2 text-sm">{overview.last_migration?`${overview.last_migration.name||"revision"} — ${overview.last_migration.status}`:"None recorded"}</p>
<p className="mt-1 text-xs text-muted-foreground">{overview.last_migration?new Date(overview.last_migration.at).toLocaleString():""}</p></article>
<article className="admin-setting-card"><h3 className="font-semibold">24h snapshot</h3>
<p className="mt-2 text-sm">{overview.last_24h.audit_events} audit events · {overview.last_24h.security_events} security · {overview.last_24h.server_errors} server errors</p></article>
</div>}
function AlertTable({rows}:{rows:AlertNotificationRow[]}){return <Table heads={["Subject","Severity","Status","Attempts","Aggregated","Sent","Time"]}>{rows.map(r=>
<tr key={r.id}>
<Td main={r.subject} sub={r.event_type||""}/>
<td className="px-4 py-3"><StatusBadge value={r.severity} kind="severity"/></td>
<td className="px-4 py-3"><StatusBadge value={r.status}/></td>
<Td main={String(r.attempts)} sub={r.last_error?r.last_error.slice(0,80):undefined}/>
<Td main={String(r.aggregate_count)}/>
<Td main={r.sent_at?new Date(r.sent_at).toLocaleString():"—"}/>
<Td main={new Date(r.created_at).toLocaleString()}/>
</tr>)}</Table>}
function MigrationTable({rows}:{rows:MigrationEventRow[]}){return <Table heads={["Migration","Status","Environment","Duration","Error","Time"]}>{rows.map(r=>
<tr key={r.id}>
<Td main={r.name||r.revision||"—"} sub={r.app_version||""}/>
<td className="px-4 py-3"><StatusBadge value={r.status}/></td>
<Td main={r.environment||"—"}/>
<Td main={r.duration_ms!=null?`${r.duration_ms}ms`:"—"}/>
<Td main={r.error_summary?r.error_summary.slice(0,120):"—"}/>
<Td main={new Date(r.created_at).toLocaleString()}/>
</tr>)}</Table>}
function ReportTable({rows}:{rows:WeeklyReportRow[]}){return <Table heads={["Report","Period","Status","Sent"]}>{rows.map(r=>
<tr key={r.id}>
<Td main={r.subject}/>
<Td main={`${r.period_start?.slice(0,10)} → ${r.period_end?.slice(0,10)}`}/>
<td className="px-4 py-3"><StatusBadge value={r.status}/></td>
<Td main={r.sent_at?new Date(r.sent_at).toLocaleString():"—"}/>
</tr>)}</Table>}
function Table({heads,children}:{heads:string[];children:React.ReactNode}){return <div className="overflow-x-auto">
<table className="w-full min-w-[850px] text-left text-sm">
<thead className="bg-muted text-xs uppercase text-muted-foreground">
<tr>{heads.map(h=>
<th key={h} className="px-4 py-3">{h}</th>)}</tr>
</thead>
<tbody className="divide-y">{children}</tbody>
</table>
</div>}function Td({main,sub}:{main:string;sub?:string}){return <td className="max-w-[260px] px-4 py-3">
<p className="truncate font-medium">{main}</p>{sub&&<p className="truncate text-xs text-muted-foreground">{sub}</p>}</td>}function StatusBadge({value,kind="status"}:{value:string;kind?:"status"|"severity"}){const normalized=value.toLowerCase();const tone=kind==="severity"?(normalized==="critical"||normalized==="high"?"danger":normalized==="medium"?"warning":"neutral"):(normalized==="completed"||normalized==="acknowledged"||normalized==="running"||normalized==="success"?"success":normalized==="failed"||normalized==="cancelled"?"danger":normalized==="queued"||normalized==="scheduled"||normalized==="open"?"warning":"neutral");return <span className={`admin-status-badge admin-status-${tone}`}>{pretty(value)}</span>}function Empty({view}:{view:SystemView}){return <div className="p-10 text-center">
<p className="text-3xl">⚙️</p>
<p className="mt-2 font-medium">No {titles[view].toLowerCase()} recorded</p>
<p className="mt-1 text-sm text-muted-foreground">Operational records will appear here when the platform produces them.</p>
</div>}
