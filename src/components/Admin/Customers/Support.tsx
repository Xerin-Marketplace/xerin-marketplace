"use client";


import { Spinner } from "@/components/ui/Spinner";
import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { CheckmarkCircle02Icon, ArrowLeft01Icon, ArrowRight01Icon, Clock01Icon, ViewIcon, HeadphonesIcon, MessageMultiple01Icon, RefreshCwIcon, Search01Icon, ShieldAlertIcon, TruckIcon, UserIcon, UserGroupIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import {
 customersService,
 type SupportTicket,
} from "@/lib/api/endpoints/customers";
import { ApiError } from "@/lib/api/client";

const getErrorMessage = (error: unknown) => {
 if (error instanceof ApiError) return error.message;
 if (error instanceof Error) return error.message;
 return "Something went wrong.";
};

const STATUS_BADGES: Record<string, string> = {
 open: "border-primary-200 bg-primary-50 text-primary-700",
 pending: "border-yellow-light-2 bg-yellow-light-4 text-yellow-dark-2",
 in_progress: "border-indigo-200 bg-indigo-50 text-indigo-700",
 processing: "border-indigo-200 bg-indigo-50 text-indigo-700",
 resolved: "border-green-light-4 bg-green-light-6 text-green-dark",
 closed: "border-border bg-muted text-muted-foreground",
};

const PRIORITY_BADGES: Record<string, string> = {
 low: "border-border bg-muted text-muted-foreground",
 medium: "border-yellow-light-2 bg-yellow-light-4 text-yellow-dark-2",
 high: "border-primary/25 bg-primary/10 text-primary",
 urgent: "border-red-light-4 bg-red-light-6 text-red-dark",
};

const pretty = (value?: string | null) =>
 (value || "unknown")
 .replaceAll("_", " ")
 .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AdminCustomerSupport() {
 const [tickets, setTickets] = useState<SupportTicket[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [query, setQuery] = useState("");
 const [debouncedQuery, setDebouncedQuery] = useState("");
 const [status, setStatus] = useState("");
 const [priority, setPriority] = useState("");
 const [channel, setChannel] = useState("");
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(20);
 const [total, setTotal] = useState(0);
 const [totalPages, setTotalPages] = useState(0);
 const [selected, setSelected] = useState<SupportTicket | null>(null);
 const [detailLoading, setDetailLoading] = useState(false);

 useEffect(() => {
 const timer = window.setTimeout(() => {
 setDebouncedQuery(query.trim());
 setPage(1);
 }, 350);
 return () => window.clearTimeout(timer);
 }, [query]);

 const fetchData = async () => {
 setLoading(true);
 setError("");

 try {
 const data = await customersService.listSupportTickets({
 page,
 page_size: pageSize,
 search: debouncedQuery || undefined,
 status: status || undefined,
 priority: priority || undefined,
 channel: channel || undefined,
 });

 setTickets(data.results);
 setTotal(data.total);
 setTotalPages(data.total_pages);
 } catch (cause) {
 if (cause instanceof ApiError && cause.status === 401) return;
 const message = getErrorMessage(cause);
 setError(message);
 toast.error(message);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void fetchData();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [page, pageSize, debouncedQuery, status, priority, channel]);

 const openTicket = async (ticket: SupportTicket) => {
 setSelected(ticket);
 setDetailLoading(true);

 try {
 const detail = await customersService.getSupportTicket(ticket.id);
 setSelected(detail);
 } catch {
 // Until backend Task 2 supplies ticket detail/conversation, the list row
 // still opens so the administrator can inspect available information.
 } finally {
 setDetailLoading(false);
 }
 };

 const stats = useMemo(
 () => ({
 open: tickets.filter((ticket) => ticket.status === "open").length,
 ongoing: tickets.filter((ticket) =>
 ["pending", "in_progress", "processing"].includes(ticket.status),
 ).length,
 done: tickets.filter((ticket) =>
 ["resolved", "closed"].includes(ticket.status),
 ).length,
 urgent: tickets.filter((ticket) =>
 ["high", "urgent"].includes(ticket.priority),
 ).length,
 }),
 [tickets],
 );

 const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
 const to = Math.min(page * pageSize, total);

 return (
 <div className="space-y-5">
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <p className="text-xs font-bold uppercase tracking-[.14em] text-primary">
 Customer care operations
 </p>
 <h2 className="mt-1 text-2xl font-bold text-foreground">
 Customer Support Tickets
 </h2>
 <p className="mt-1 max-w-4xl text-sm leading-6 text-muted-foreground">
 Central support workspace for customer issues involving marketplace
 sellers, orders and logistics. Administrators can see what is new,
 ongoing, being processed and completed, while maintaining visibility
 across every party in the case.
 </p>
 </section>

 <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <Metric icon={HeadphonesIcon} label="Open on page" value={stats.open} />
 <Metric icon={Clock01Icon} label="Ongoing / processing" value={stats.ongoing} />
 <Metric icon={CheckmarkCircle02Icon} label="Resolved / done" value={stats.done} />
 <Metric icon={ShieldAlertIcon} label="High priority" value={stats.urgent} />
 </section>

 <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <div className="grid gap-3 lg:grid-cols-[minmax(280px,1.8fr)_repeat(3,minmax(145px,1fr))]">
 <div className="relative">
 <HugeiconsIcon icon={Search01Icon}
 size={16}
 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
 />
 <input
 value={query}
 onChange={(event) => setQuery(event.target.value)}
 placeholder="Search ticket, customer, seller, order or logistics..."
 className="h-11 w-full rounded-xl border-2 border-border pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)]"
 />
 </div>

 <select
 value={status}
 onChange={(event) => {
 setStatus(event.target.value);
 setPage(1);
 }}
 className="h-11 rounded-xl border-2 border-border bg-card px-3 text-sm"
 >
 <option value="">All statuses</option>
 <option value="open">Open / New</option>
 <option value="pending">Pending</option>
 <option value="in_progress">In Progress</option>
 <option value="processing">Processing</option>
 <option value="resolved">Resolved</option>
 <option value="closed">Closed / Done</option>
 </select>

 <select
 value={priority}
 onChange={(event) => {
 setPriority(event.target.value);
 setPage(1);
 }}
 className="h-11 rounded-xl border-2 border-border bg-card px-3 text-sm"
 >
 <option value="">All priorities</option>
 {["low", "medium", "high", "urgent"].map((value) => (
 <option key={value} value={value}>
 {pretty(value)}
 </option>
 ))}
 </select>

 <select
 value={channel}
 onChange={(event) => {
 setChannel(event.target.value);
 setPage(1);
 }}
 className="h-11 rounded-xl border-2 border-border bg-card px-3 text-sm"
 >
 <option value="">All channels</option>
 <option value="customer">Customer</option>
 <option value="seller">Seller</option>
 <option value="logistics">Logistics</option>
 <option value="order">Order issue</option>
 </select>
 </div>
 </section>

 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
 {loading ? (
 <div className="p-12 text-center text-muted-foreground">
 <Spinner className="mx-auto" />
 <p className="mt-3 text-sm">Loading support tickets...</p>
 </div>
 ) : error ? (
 <div className="p-12 text-center">
 <p className="text-sm font-semibold text-destructive">{error}</p>
 <button
 type="button"
 onClick={() => void fetchData()}
 className="mt-3 text-sm font-semibold text-primary"
 >
 Retry
 </button>
 </div>
 ) : !tickets.length ? (
 <div className="p-12 text-center">
 <HugeiconsIcon icon={MessageMultiple01Icon} className="mx-auto text-muted-foreground" size={32} />
 <p className="mt-3 font-semibold text-foreground">
 No matching support tickets
 </p>
 <p className="mt-1 text-sm text-muted-foreground">
 New customer, seller and logistics conversations will appear
 here.
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[1200px] text-left text-sm">
 <thead className="bg-muted text-xs uppercase text-muted-foreground">
 <tr>
 {[
 "Ticket",
 "Customer",
 "Issue / Context",
 "Parties",
 "Priority",
 "Status",
 "Assigned",
 "Updated",
 "Action",
 ].map((heading) => (
 <th key={heading} className="px-5 py-3">
 {heading}
 </th>
 ))}
 </tr>
 </thead>

 <tbody className="divide-y divide-[var(--border)]">
 {tickets.map((ticket) => (
 <tr key={ticket.id} className="hover:bg-primary/10/20">
 <td className="px-5 py-4">
 <p className="font-bold text-foreground">
 {ticket.ticket_number}
 </p>
 <p className="mt-0.5 text-[10px] text-muted-foreground">
 {ticket.id.slice(0, 12)}
 </p>
 </td>

 <td className="px-5 py-4">
 <div className="flex items-center gap-2.5">
 <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
 <HugeiconsIcon icon={UserIcon} size={14} />
 </span>
 <div>
 <p className="font-semibold text-foreground">
 {ticket.customer_name || "Customer"}
 </p>
 <p className="text-xs text-muted-foreground">
 {ticket.customer_email ||
 ticket.user_id.slice(0, 10)}
 </p>
 </div>
 </div>
 </td>

 <td className="max-w-sm px-5 py-4">
 <p className="font-semibold text-foreground">
 {ticket.subject}
 </p>
 <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
 {ticket.description || "No description"}
 </p>
 {ticket.order_id && (
 <p className="mt-1 text-[10px] font-semibold text-primary">
 Order {ticket.order_id.slice(0, 10)}
 </p>
 )}
 </td>

 <td className="px-5 py-4">
 <div className="flex flex-wrap gap-1.5">
 <Party label="Customer" />
 {ticket.seller_name && <Party label="Seller" />}
 {ticket.logistics_provider && (
 <Party label="Logistics" />
 )}
 </div>
 </td>

 <td className="px-5 py-4">
 <span
 className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
 PRIORITY_BADGES[ticket.priority] ||
 "border-border bg-muted text-muted-foreground"
 }`}
 >
 {pretty(ticket.priority)}
 </span>
 </td>

 <td className="px-5 py-4">
 <span
 className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
 STATUS_BADGES[ticket.status] ||
 "border-border bg-muted text-muted-foreground"
 }`}
 >
 {pretty(ticket.status)}
 </span>
 </td>

 <td className="px-5 py-4 text-xs text-muted-foreground">
 {ticket.assigned_to_name || "Unassigned"}
 </td>

 <td className="px-5 py-4 text-xs text-muted-foreground">
 {new Date(
 ticket.updated_at || ticket.created_at,
 ).toLocaleString()}
 </td>

 <td className="px-5 py-4">
 <button
 type="button"
 onClick={() => void openTicket(ticket)}
 className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background"
 >
 <HugeiconsIcon icon={ViewIcon} size={14} />
 Open Case
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {!loading && !error && (
 <Pagination
 page={page}
 pageSize={pageSize}
 total={total}
 totalPages={totalPages}
 onPageChange={setPage}
 onPageSizeChange={(size) => {
 setPageSize(size);
 setPage(1);
 }}
 />
 )}
 </section>

 {selected && (
 <div
 className="fixed inset-0 z-[110] flex justify-end bg-black/50 backdrop-blur-[2px]"
 onMouseDown={() => setSelected(null)}
 >
 <aside
 className="flex h-full w-full max-w-3xl flex-col bg-muted shadow-lg"
 onMouseDown={(event) => event.stopPropagation()}
 >
 <div className="flex items-start justify-between border-b bg-card px-6 py-5">
 <div>
 <p className="text-xs font-bold uppercase tracking-[.14em] text-primary">
 Support case
 </p>
 <h3 className="mt-1 text-xl font-bold text-foreground">
 {selected.ticket_number}
 </h3>
 <p className="mt-1 text-sm text-muted-foreground">
 {selected.subject}
 </p>
 </div>
 <button
 onClick={() => setSelected(null)}
 className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={16} />
 </button>
 </div>

 <div className="flex-1 space-y-5 overflow-y-auto p-6">
 {detailLoading && (
 <p className="text-sm text-muted-foreground">
 Loading complete ticket conversation...
 </p>
 )}

 <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
 <Info
 label="Customer"
 value={selected.customer_name || selected.user_id}
 />
 <Info label="Seller" value={selected.seller_name || "—"} />
 <Info
 label="Logistics"
 value={selected.logistics_provider || "—"}
 />
 <Info label="Priority" value={pretty(selected.priority)} />
 <Info label="Status" value={pretty(selected.status)} />
 <Info
 label="Assigned to"
 value={selected.assigned_to_name || "Unassigned"}
 />
 </section>

 <section className="rounded-xl border bg-card p-5">
 <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
 Issue description
 </p>
 <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
 {selected.description || "No description provided."}
 </p>
 </section>

 <section className="rounded-xl border bg-card p-5">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-bold text-foreground">
 Conversation & Case Timeline
 </p>
 <p className="mt-1 text-xs text-muted-foreground">
 Customer, seller, logistics and administrator messages
 will be visible in one chronological thread.
 </p>
 </div>
 <HugeiconsIcon icon={UserGroupIcon} size={18} className="text-primary" />
 </div>

 {selected.messages?.length ? (
 <div className="mt-5 space-y-3">
 {selected.messages.map((message) => (
 <div
 key={message.id}
 className="rounded-xl border bg-muted p-4"
 >
 <div className="flex items-center justify-between gap-3">
 <p className="text-xs font-bold text-foreground">
 {message.sender_name || "Participant"} ·{" "}
 {pretty(message.sender_role)}
 </p>
 <p className="text-[10px] text-muted-foreground">
 {new Date(message.created_at).toLocaleString()}
 </p>
 </div>
 <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
 {message.message}
 </p>
 </div>
 ))}
 </div>
 ) : (
 <div className="mt-5 rounded-xl border border-dashed bg-muted p-5 text-center text-sm text-muted-foreground">
 Conversation messages will be populated when Backend Task 2
 adds the ticket message/thread endpoint.
 </div>
 )}
 </section>

 <section className="rounded-xl border bg-card p-5">
 <p className="font-bold text-foreground">Related operations</p>
 <div className="mt-4 grid gap-3 sm:grid-cols-3">
 <Context
 icon={UserIcon}
 label="Customer"
 value={selected.customer_name || "Linked"}
 />
 <Context
 icon={MessageMultiple01Icon}
 label="Seller"
 value={selected.seller_name || "Not linked"}
 />
 <Context
 icon={TruckIcon}
 label="Logistics"
 value={selected.logistics_provider || "Not linked"}
 />
 </div>
 </section>

 <div className="rounded-xl border border-yellow-light-2 bg-yellow-light-4 p-4 text-xs leading-5 text-yellow-dark-2">
 Ticket assignment, status changes, replies, internal notes and
 case resolution are already represented in the frontend API
 contract. We will make those controls live when we implement
 Backend Task 2.
 </div>
 </div>
 </aside>
 </div>
 )}
 </div>
 );
}

function Metric({
 icon: Icon,
 label,
 value,
}: {
 icon: IconSvgElement;
 label: string;
 value: string | number;
}) {
 return (
 <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <HugeiconsIcon icon={Icon} size={16} />
 </span>
 <p className="mt-4 text-2xl font-bold text-foreground">{value}</p>
 <p className="mt-1 text-xs text-muted-foreground">{label}</p>
 </article>
 );
}

function Party({ label }: { label: string }) {
 return (
 <span className="rounded-full border border-border bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
 {label}
 </span>
 );
}

function Info({ label, value }: { label: string; value: string }) {
 return (
 <div className="rounded-xl border bg-card p-4">
 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
 {label}
 </p>
 <p className="mt-1 break-words text-sm font-semibold text-foreground">
 {value}
 </p>
 </div>
 );
}

function Context({
 icon: Icon,
 label,
 value,
}: {
 icon: IconSvgElement;
 label: string;
 value: string;
}) {
 return (
 <div className="rounded-xl bg-muted p-4">
 <HugeiconsIcon icon={Icon} size={16} className="text-primary" />
 <p className="mt-2 text-xs font-bold text-foreground">{label}</p>
 <p className="mt-1 text-xs text-muted-foreground">{value}</p>
 </div>
 );
}
