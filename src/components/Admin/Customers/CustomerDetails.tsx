"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { customersService, type CustomerDetails } from "@/lib/api/endpoints/customers";
import { ApiError } from "@/lib/api/client";
import UnavailableFeature from "@/components/Admin/Common/UnavailableFeature";

const getErrorMessage = (error: unknown) => {
 if (error instanceof ApiError) return error.message;
 if (error instanceof Error) return error.message;
 return "Something went wrong.";
};

const TABS = [
 { key: "overview", label: "Overview" },
 { key: "orders", label: "Orders" },
 { key: "addresses", label: "Addresses" },
 { key: "payments", label: "Payments" },
 { key: "activity", label: "Activity" },
 { key: "unsupported", label: "Unavailable Data" },
];

const AdminCustomerDetails = ({ customerId }: { customerId: string }) => {
 const [data, setData] = useState<CustomerDetails | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [activeTab, setActiveTab] = useState("overview");

 const fetchData = async () => {
 setLoading(true);
 setError(null);
 try {
 const res = await customersService.getCustomer(customerId);
 setData(res);
 } catch (error) {
 setError(getErrorMessage(error));
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void fetchData();
 }, [customerId]);

 if (loading) return <div className="py-8 text-center text-muted-foreground">Loading customer...</div>;
 if (error) return <div className="rounded-xl border border-red-light-4 bg-red-light-6 p-6 text-sm text-red-800"><p>{error}</p><button type="button" onClick={() => void fetchData()} className="mt-3 rounded-lg bg-red-dark px-3 py-2 font-medium text-white">Retry</button></div>;
 if (!data) return <div className="py-8 text-center text-muted-foreground">Customer not found.</div>;

 const c = data.customer;
 const fullName = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "Unknown";
 const initials = fullName
 .split(" ")
 .map((n) => n[0])
 .join("")
 .toUpperCase() || "??";

 return (
 <div className="space-y-4">
 <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-center gap-4">
 <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold text-primary">
 {initials}
 </div>
 <div>
 <h2 className="text-xl font-semibold text-foreground">{fullName}</h2>
 <p className="text-sm text-muted-foreground">
 {c.email} · {c.phone ?? "No phone"} · ID: {c.id.slice(0, 12).toUpperCase()}
 </p>
 </div>
 </div>
 <div className="flex gap-2">
 <span className={`rounded-full px-3 py-1 text-xs font-medium ${c.status === "active" ? "bg-green-light-6 text-[var(--success)]" : "bg-muted text-muted-foreground"}`}>
 {c.status.replace("_", " ")}
 </span>
 <span className={`rounded-full px-3 py-1 text-xs font-medium ${c.is_verified ? "bg-green-light-6 text-[var(--success)]" : "bg-yellow-light-4 text-[var(--warning)]"}`}>
 {c.is_verified ? "Verified" : "Unverified"}
 </span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
 <SummaryCard label="Orders" value={data.stats.orders} />
 <SummaryCard label="Completed" value={data.stats.completed_orders} />
 <SummaryCard label="Cancelled" value={data.stats.cancelled_orders} />
 <SummaryCard label="Total Spent" value={data.stats.total_spent.toLocaleString()} />
 <SummaryCard label="Avg Order" value={data.stats.average_order.toLocaleString()} />
 </div>

 <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <div className="mb-4 border-b border-border">
 <div className="flex flex-wrap gap-4">
 {TABS.map((t) => (
 <button
 key={t.key}
 type="button"
 onClick={() => setActiveTab(t.key)}
 className={`border-b-2 px-2 py-3 text-sm font-medium ${activeTab === t.key ? "border-[var(--primary)] text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
 >
 {t.label}
 </button>
 ))}
 </div>
 </div>

 {activeTab === "overview" && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
 <div className="rounded-xl border border-border bg-muted p-4">
 <h3 className="mb-3 text-sm font-semibold text-foreground">Profile Information</h3>
 <div className="space-y-2 text-sm">
 <div className="flex justify-between"><span className="text-muted-foreground">Full Name</span><span className="text-foreground">{fullName}</span></div>
 <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-foreground">{c.email}</span></div>
 <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="text-foreground">{c.phone ?? "-"}</span></div>
 <div className="flex justify-between"><span className="text-muted-foreground">Gender</span><span className="text-foreground">{c.gender ?? "-"}</span></div>
 <div className="flex justify-between"><span className="text-muted-foreground">Date of Birth</span><span className="text-foreground">{c.date_of_birth ? new Date(c.date_of_birth).toLocaleDateString() : "-"}</span></div>
 <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span className="text-foreground">{new Date(c.created_at).toLocaleString()}</span></div>
 <div className="flex justify-between"><span className="text-muted-foreground">Last Login</span><span className="text-foreground">{c.last_login_at ? new Date(c.last_login_at).toLocaleString() : "-"}</span></div>
 </div>
 </div>

 <div className="rounded-xl border border-border bg-muted p-4">
 <h3 className="mb-3 text-sm font-semibold text-foreground">Recent Orders</h3>
 {data.orders.slice(0, 5).length === 0 ? (
 <p className="text-sm text-muted-foreground">No orders yet.</p>
 ) : (
 <div className="space-y-2">
 {data.orders.slice(0, 5).map((o) => (
 <div key={o.id} className="flex items-center justify-between rounded-lg bg-card p-2 text-sm">
 <span className="font-medium text-foreground">{o.order_number}</span>
 <span className="text-muted-foreground">{o.total_amount.toLocaleString()} {o.currency}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 <div className="rounded-xl border border-border bg-muted p-4">
 <h3 className="mb-3 text-sm font-semibold text-foreground">Customer Timeline</h3>
 <div className="space-y-3">
 <TimelineItem title="Registered" date={c.created_at} />
 {c.is_verified && <TimelineItem title="Verified Email" date={c.created_at} />}
 {data.orders.length > 0 && <TimelineItem title="First Order" date={data.orders[data.orders.length - 1].created_at} />}
 {c.last_login_at && <TimelineItem title="Last Login" date={c.last_login_at} />}
 </div>
 </div>
 </div>
 )}

 {activeTab === "orders" && (
 <SimpleTable
 headers={["Order Number", "Date", "Amount", "Payment", "Status"]}
 rows={data.orders.map((o) => [o.order_number, new Date(o.created_at).toLocaleDateString(), `${o.total_amount.toLocaleString()} ${o.currency}`, o.payment_status, o.status])}
 empty="No orders found."
 />
 )}

 {activeTab === "addresses" && (
 <SimpleTable
 headers={["Label", "Type", "Country", "Region", "City", "Street", "Default"]}
 rows={data.addresses.map((a) => [
 a.label ?? "-",
 a.address_type,
 a.country,
 a.region,
 a.city,
 a.street,
 a.is_default ? "Yes" : "No",
 ])}
 empty="No addresses found."
 />
 )}

 {activeTab === "payments" && (
 <SimpleTable
 headers={["Method", "Reference", "Amount", "Status", "Date"]}
 rows={data.payments.map((p) => [p.method, p.transaction_reference ?? "-", `${p.amount.toLocaleString()} ${p.currency}`, p.status, new Date(p.created_at).toLocaleDateString()])}
 empty="No payments found."
 />
 )}

 {activeTab === "activity" && (
 <SimpleTable
 headers={["Date", "Device", "Browser", "IP Address", "Country"]}
 rows={data.login_history.map((h) => [
 new Date(h.login_at).toLocaleString(),
 h.device ?? "-",
 h.browser ?? "-",
 h.ip_address ?? "-",
 h.country ?? "-",
 ])}
 empty="No login history found."
 />
 )}

 {activeTab === "unsupported" && <UnavailableFeature title="Customer reviews, wishlist, and internal notes are unavailable" description="The backend customer-detail contract does not currently provide persisted records or mutation endpoints for these sections." />}
 </div>

 <div className="mt-4">
 <Link href="/admin/customers" className="text-sm font-medium text-primary hover:underline">
 ← Back to All Customers
 </Link>
 </div>
 </div>
 );
};

const SummaryCard = ({ label, value }: { label: string; value: string | number }) => (
 <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
 <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
 <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
 </div>
);

const TimelineItem = ({ title, date }: { title: string; date: string }) => (
 <div className="flex items-start gap-3">
 <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
 <div>
 <p className="text-sm font-medium text-foreground">{title}</p>
 <p className="text-xs text-muted-foreground">{new Date(date).toLocaleString()}</p>
 </div>
 </div>
);

const SimpleTable = ({ headers, rows, empty }: { headers: string[]; rows: (string | number)[][]; empty: string }) => (
 <div className="overflow-x-auto">
 {rows.length === 0 ? (
 <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>
 ) : (
 <table className="w-full text-left">
 <thead className="bg-muted">
 <tr>
 {headers.map((h) => (
 <th key={h} className="px-4 py-3 text-sm font-medium text-accent-foreground">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {rows.map((row, idx) => (
 <tr key={idx} className="hover:bg-muted">
 {row.map((cell, cidx) => (
 <td key={cidx} className="px-4 py-3 text-sm text-muted-foreground">{cell}</td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
);

export default AdminCustomerDetails;
