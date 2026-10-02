"use client";


import { Spinner } from "@/components/ui/Spinner";
import { operationsCommandApi } from "@/lib/api/endpoints/operations-command";
import type { ActivityLog, OperationsException, OperationsOverview, SupportTicketSummary, SystemAlert } from "@/types/api/operations-command";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { Activity01Icon, Alert02Icon, BellRingIcon, Download01Icon, ChartEvaluationIcon, HeadphonesIcon, RefreshCwIcon, ShieldAlertIcon, TruckIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Tab = "exceptions" | "support" | "alerts" | "activity" | "reports";
const pretty = (value?: string | null) => (value || "unknown").replaceAll("_", " ").replace(/\b\w/g, (x) => x.toUpperCase());
const age = (minutes: number) => minutes >= 1440 ? `${Math.floor(minutes / 1440)}d ${Math.floor(minutes % 1440 / 60)}h` : minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
const when = (value: string) => new Intl.DateTimeFormat("en-TZ", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function OperationsCommandCenter() {
 const [overview, setOverview] = useState<OperationsOverview | null>(null); const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
 const [alerts, setAlerts] = useState<SystemAlert[]>([]); const [activity, setActivity] = useState<ActivityLog[]>([]); const [tab, setTab] = useState<Tab>("exceptions");
 const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(""); const [error, setError] = useState(""); const [query, setQuery] = useState("");
 const [securityTarget, setSecurityTarget] = useState<OperationsException | null>(null); const [securityNote, setSecurityNote] = useState("");
 const load = useCallback(async () => { setLoading(true); setError(""); const results = await Promise.allSettled([operationsCommandApi.overview(), operationsCommandApi.tickets(), operationsCommandApi.alerts(), operationsCommandApi.activity()]); const failures: string[] = []; if (results[0].status === "fulfilled") setOverview(results[0].value); else failures.push(results[0].reason instanceof Error ? results[0].reason.message : "Operations overview unavailable."); if (results[1].status === "fulfilled") setTickets(results[1].value.results); else failures.push(results[1].reason instanceof Error ? results[1].reason.message : "Support tickets unavailable."); if (results[2].status === "fulfilled") setAlerts(results[2].value); else failures.push(results[2].reason instanceof Error ? results[2].reason.message : "System alerts unavailable."); if (results[3].status === "fulfilled") setActivity(results[3].value); else failures.push(results[3].reason instanceof Error ? results[3].reason.message : "Activity logs unavailable."); if (failures.length) setError(Array.from(new Set(failures)).join(" ")); setLoading(false); }, []);
 useEffect(() => { void load(); }, [load]);
 const exceptions = useMemo(() => (overview?.exceptions || []).filter((row) => `${row.title} ${row.type} ${row.resource_id}`.toLowerCase().includes(query.toLowerCase())), [overview, query]);
 const act = async (id: string, fn: () => Promise<unknown>) => { setBusy(id); setError(""); try { await fn(); await load(); } catch (e) { setError(e instanceof Error ? e.message : "The recovery action failed."); } finally { setBusy(""); } };
 const exceptionAction = (row: OperationsException) => { if (row.type === "notification_failure") return void act(row.resource_id, () => operationsCommandApi.retryNotification(row.resource_id)); if (row.type === "security_event") { setSecurityNote(""); setSecurityTarget(row); } };
 const resolveSecurity = async () => { if (!securityTarget || securityNote.trim().length < 5) return; const id = securityTarget.resource_id; await act(id, () => operationsCommandApi.resolveSecurityEvent(id, securityNote.trim())); setSecurityTarget(null); setSecurityNote(""); };
 const exportCsv = () => { if (!exceptions.length) return; const esc = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`; const csv = [["type", "severity", "resource_id", "title", "age_minutes"], ...exceptions.map((x) => [x.type, x.severity, x.resource_id, x.title, x.age_minutes])].map((row) => row.map(esc).join(",")).join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "xerin-operations-exceptions.csv"; anchor.click(); URL.revokeObjectURL(url); };
 const count = (key: keyof OperationsOverview) => Number(overview?.[key] || 0);
 return <div className="space-y-5">
<section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-muted sm:p-6">
<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
<div>
<p className="text-xs font-bold uppercase tracking-[.16em] text-destructive">Store operations</p>
<h2 className="mt-2 text-2xl font-bold sm:text-3xl">Exception command center</h2>
<p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Prioritize support SLA breaches, notification failures, security events, payment exceptions, refunds and failed deliveries from one live queue.</p>
</div>
<div className="grid grid-cols-2 gap-2">
<button onClick={() => void act("notifications", operationsCommandApi.processNotifications)} disabled={busy === "notifications"} className="min-h-11 rounded-xl border border-border px-3 text-xs font-bold disabled:opacity-50 dark:border-border">Process notifications</button>
<button onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-3 text-xs font-bold text-background disabled:opacity-60 dark:bg-destructive">
{loading ? <Spinner /> : <HugeiconsIcon icon={RefreshCwIcon} size={16} />}Refresh</button>
</div>
</div>
</section>
 {error && <p className="rounded-xl border border-yellow-light-2 bg-yellow-light-4 p-4 text-sm text-amber-900">Some command-center resources are unavailable for this role: {error}</p>}
 <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
<Metric icon={HeadphonesIcon} label="Open support" value={count("open_support_tickets")} danger={count("breached_support_tickets") > 0} note={`${count("breached_support_tickets")} SLA breached`} />
<Metric icon={BellRingIcon} label="Notification failures" value={count("failed_notification_deliveries")} danger={count("failed_notification_deliveries") > 0} note={`${count("stale_notification_deliveries")} stale`} />
<Metric icon={ShieldAlertIcon} label="Security events" value={count("unresolved_security_events")} danger={count("unresolved_security_events") > 0} note="Unresolved" />
<Metric icon={Alert02Icon} label="Financial exceptions" value={count("failed_payments") + count("pending_refunds")} danger={count("failed_payments") > 0} note={`${count("failed_payments")} payments · ${count("pending_refunds")} refunds`} />
<Metric icon={TruckIcon} label="Failed deliveries" value={count("failed_deliveries")} danger={count("failed_deliveries") > 0} note="Needs dispatch review" />
</section>
 <section className="rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-muted">
<div className="overflow-x-auto border-b dark:border-border">
<div className="flex min-w-max gap-1 p-2">{(["exceptions", "support", "alerts", "activity", "reports"] as Tab[]).map((value) => <button key={value} onClick={() => setTab(value)} className={`min-h-11 rounded-xl px-4 text-sm font-bold capitalize ${tab === value ? "bg-destructive text-white" : "text-muted-foreground hover:bg-muted dark:hover:bg-muted"}`}>{value}{value === "exceptions" && overview ? ` (${overview.exceptions.length})` : ""}</button>)}</div>
</div>
 {tab === "exceptions" && <div>
<div className="grid gap-2 border-b p-4 sm:grid-cols-[1fr_auto] dark:border-border">
<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exception queue…" className="min-h-11 rounded-xl border bg-transparent px-3 text-sm" />
<button onClick={exportCsv} disabled={!exceptions.length} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold disabled:opacity-40">
<HugeiconsIcon icon={Download01Icon} size={16} />Export CSV</button>
</div>
<ExceptionQueue rows={exceptions} busy={busy} action={exceptionAction} />
</div>}
 {tab === "support" && <Support rows={tickets} />}{tab === "alerts" && <Alerts rows={alerts} busy={busy} resolve={(id) => void act(id, () => operationsCommandApi.resolveAlert(id))} />}{tab === "activity" && <ActivityList rows={activity} />}{tab === "reports" && <Reports />}
 {loading && <div className="p-10 text-center text-sm text-muted-foreground">
<Spinner className="mx-auto" />
<p className="mt-2">Loading operational state…</p>
</div>}
 </section>
 {securityTarget && <div className="fixed inset-0 z-[130] grid place-items-center bg-carbon/60 p-4 backdrop-blur-sm" onMouseDown={() => !busy && setSecurityTarget(null)}><div className="w-full max-w-lg rounded-xl bg-card p-5 shadow-lg dark:bg-muted sm:p-6" onMouseDown={(event) => event.stopPropagation()}><p className="text-xs font-bold uppercase tracking-[.15em] text-destructive">Security resolution</p><h3 className="mt-2 text-xl font-bold">Resolve security event</h3><p className="mt-1 break-words text-sm text-muted-foreground">{securityTarget.title}</p><label className="mt-5 block text-sm font-semibold">Resolution note<textarea autoFocus rows={5} value={securityNote} onChange={(event) => setSecurityNote(event.target.value)} className="mt-2 w-full rounded-xl border p-3 text-sm outline-none focus:border-red-500" placeholder="Describe what was verified and how the event was resolved…"/></label><p className="mt-2 text-xs text-muted-foreground">Minimum five characters. This note is submitted to the live security-event endpoint.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={Boolean(busy)} onClick={() => setSecurityTarget(null)} className="min-h-11 rounded-xl border font-bold">Cancel</button><button disabled={Boolean(busy) || securityNote.trim().length < 5} onClick={() => void resolveSecurity()} className="min-h-11 rounded-xl bg-destructive font-bold text-white disabled:opacity-40">{busy ? "Resolving…" : "Confirm resolution"}</button></div></div></div>}
 </div>;
}
function Metric({ icon: Icon, label, value, danger, note }: { icon: IconSvgElement; label: string; value: number; danger: boolean; note: string }) { return <article className="rounded-xl border border-border bg-card p-4 dark:border-border dark:bg-muted">
<HugeiconsIcon icon={Icon} size={18} className={danger ? "text-destructive" : "text-green-dark"} />
<p className="mt-3 text-2xl font-bold">{value}</p>
<p className="text-xs font-semibold text-muted-foreground dark:text-foreground">{label}</p>
<p className="mt-1 text-[10px] text-muted-foreground">{note}</p>
</article>; }
function Empty({ text }: { text: string }) { return <p className="m-4 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">{text}</p>; }
function ExceptionQueue({ rows, busy, action }: { rows: OperationsException[]; busy: string; action: (row: OperationsException) => void }) { if (!rows.length) return <Empty text="No operational exceptions require attention." />; return <div className="space-y-2 p-3 sm:p-4">{rows.map((row) => <article key={`${row.type}-${row.resource_id}`} className={`rounded-xl border p-4 ${row.severity === "critical" ? "border-red-light-4 bg-red-light-6" : "border-yellow-light-2 bg-yellow-light-4"}`}>
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
<div className="min-w-0">
<div className="flex flex-wrap items-center gap-2">
<span className="rounded-full bg-card/70 px-2 py-1 text-[10px] font-bold uppercase">{pretty(row.type)}</span>
<span className="text-xs font-bold uppercase text-red-dark">{row.severity}</span>
</div>
<p className="mt-2 break-words text-sm font-bold text-foreground">{row.title}</p>
<p className="mt-1 text-xs text-muted-foreground">Open for {age(row.age_minutes)} · {row.resource_id}</p>
</div>
<div className="flex shrink-0 gap-2">{row.type === "support_sla" ? <Link href="/admin/customers/support" className="inline-flex min-h-10 items-center rounded-xl bg-foreground px-3 text-xs font-bold text-background">Open support</Link> : ["notification_failure", "security_event"].includes(row.type) ? <button disabled={busy === row.resource_id} onClick={() => action(row)} className="min-h-10 rounded-xl bg-destructive px-3 text-xs font-bold text-white disabled:opacity-50">{row.type === "notification_failure" ? "Retry" : "Resolve"}</button> : row.type === "payment_failure" ? <Link href="/admin/dashboard?tab=finance&menu=payments&item=failed-payments" className="inline-flex min-h-10 items-center rounded-xl bg-foreground px-3 text-xs font-bold text-background">Review payment</Link> : null}</div>
</div>
</article>)}</div>; }
function Support({ rows }: { rows: SupportTicketSummary[] }) { if (!rows.length) return <Empty text="No support tickets were returned." />; return <div className="grid gap-3 p-4 md:grid-cols-2">{rows.map((row) => <article key={row.id} className="rounded-xl border p-4 dark:border-border">
<div className="flex justify-between gap-2">
<div>
<p className="font-bold">{row.ticket_number}</p>
<p className="text-xs text-muted-foreground">{row.customer_name || "Customer"}</p>
</div>
<span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase dark:bg-muted">{pretty(row.status)}</span>
</div>
<p className="mt-3 text-sm font-semibold">{row.subject}</p>
<p className="mt-1 text-xs text-muted-foreground">Priority: {pretty(row.priority)} · {row.assigned_to_name || "Unassigned"}</p>
<Link href="/admin/customers/support" className="mt-3 inline-block text-xs font-bold text-destructive">Open support workspace →</Link>
</article>)}</div>; }
function Alerts({ rows, busy, resolve }: { rows: SystemAlert[]; busy: string; resolve: (id: string) => void }) { if (!rows.length) return <Empty text="No unresolved system alerts." />; return <div className="space-y-3 p-4">{rows.map((row) => <article key={row.id} className="rounded-xl border p-4 dark:border-border">
<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
<div>
<p className="font-bold">{row.title}</p>
<p className="mt-1 text-sm text-muted-foreground">{row.message}</p>
<p className="mt-2 text-xs text-muted-foreground">{pretty(row.type)} · {pretty(row.severity)} · {when(row.created_at)}</p>
</div>
<button disabled={busy === row.id} onClick={() => resolve(row.id)} className="min-h-10 shrink-0 rounded-xl bg-success px-3 text-xs font-bold text-white disabled:opacity-50">Resolve</button>
</div>
</article>)}</div>; }
function ActivityList({ rows }: { rows: ActivityLog[] }) { if (!rows.length) return <Empty text="No administrator activity was returned." />; return <div className="space-y-2 p-4">{rows.map((row) => <article key={row.id} className="flex items-start gap-3 rounded-xl border p-3 dark:border-border">
<span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600">
<HugeiconsIcon icon={Activity01Icon} size={16} />
</span>
<div className="min-w-0">
<p className="truncate text-sm font-bold">{pretty(row.action)}</p>
<p className="truncate text-xs text-muted-foreground">{pretty(row.resource_type)} · {row.resource_id || "Platform"}</p>
<p className="mt-1 text-[10px] text-muted-foreground">{when(row.created_at)}</p>
</div>
</article>)}</div>; }
function Reports() { const links = [{ label: "Sales report", href: "/admin/analytics?report=sales" }, { label: "Order report", href: "/admin/analytics?report=orders" }, { label: "Product report", href: "/admin/analytics?report=products" }, { label: "Customer report", href: "/admin/analytics?report=customers" }, { label: "Payment report", href: "/admin/dashboard?tab=finance&menu=payments&item=payment-reports" }, { label: "Audit logs", href: "/admin/dashboard?tab=overview&menu=system-management&item=audit-logs" }]; return <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">{links.map((item) => <Link key={item.label} href={item.href} className="group rounded-xl border p-4 dark:border-border">
<HugeiconsIcon icon={ChartEvaluationIcon} className="text-destructive" size={18} />
<p className="mt-3 font-bold">{item.label}</p>
<p className="mt-1 text-xs text-muted-foreground">Open live reporting workspace</p>
<p className="mt-3 text-xs font-bold text-destructive">View report →</p>
</Link>)}</div>; }
