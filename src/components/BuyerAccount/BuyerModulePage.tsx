"use client";
import { formatCurrency } from "@/lib/formatCurrency";
import { ordersApi, paymentsApi } from "@/lib/api/endpoints/commerce";
import { authApi } from "@/lib/api/endpoints/auth";
import { accountApi, type AccountSession } from "@/lib/api/endpoints/account";
import { usersApi } from "@/lib/api/endpoints/users";
import { useAuthStore } from "@/store/useAuthStore";
import type { User } from "@/types/api/user";
import type { Order, Payment } from "@/types/api/commerce";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { AlertCircleIcon, BellIcon, CreditCardIcon, Key01Icon, Loading03Icon, Location01Icon, PackageIcon, RefreshCwIcon, ShieldIcon, StarIcon, UserIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AddressBookSection from "@/components/MyAccount/AddressBookSection";
import NotificationCenter from "@/components/Notifications/NotificationCenter";
import CustomerReviews from "@/components/BuyerAccount/CustomerReviews";
type View =
 | "orders"
 | "payments"
 | "addresses"
 | "reviews"
 | "notifications"
 | "security"
 | "details";
const copy = {
 orders: ["My Orders", "Track purchases and delivery progress.", PackageIcon],
 payments: [
 "My Payments",
 "Review buyer payment activity and receipts.",
 CreditCardIcon,
 ],
 addresses: [
 "My Addresses",
 "Manage delivery and billing destinations.",
 Location01Icon,
 ],
 reviews: ["My Reviews", "Manage product feedback you have submitted.", StarIcon],
 notifications: ["Notifications", "Review account and order updates.", BellIcon],
 security: [
 "Account Security",
 "Protect your buyer account and active sessions.",
 ShieldIcon,
 ],
 details: [
 "Account Details",
 "Update your personal buyer information.",
 UserIcon,
 ],
} as const;
export default function BuyerModulePage({ view }: { view: View }) {
 const searchParams = useSearchParams();
 const requestedReturnTo = searchParams.get("returnTo");
 const returnTo = requestedReturnTo?.startsWith("/") && !requestedReturnTo.startsWith("//")
 ? requestedReturnTo
 : null;
 const authenticatedUser = useAuthStore((state) => state.user);
 const [loading, setLoading] = useState(true),
 [error, setError] = useState(false),
 [orders, setOrders] = useState<Order[]>([]),
 [payments, setPayments] = useState<Payment[]>([]),
 [profile, setProfile] = useState<User | null>(null);
 const [paymentPage, setPaymentPage] = useState(1);
 const [paymentMeta, setPaymentMeta] = useState({
 total: 0,
 total_pages: 0,
 });
 const [paymentSearch, setPaymentSearch] = useState("");
 const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
 const [orderPage, setOrderPage] = useState(1);
 const [orderMeta, setOrderMeta] = useState({
 total: 0,
 total_pages: 0,
 });
 const [orderSearch, setOrderSearch] = useState("");
 const [orderStatusFilter, setOrderStatusFilter] = useState("all");
 const [orderPaymentFilter, setOrderPaymentFilter] = useState("all");
 const [passwords, setPasswords] = useState({
 current: "",
 next: "",
 confirm: "",
 });
 const [sessions, setSessions] = useState<AccountSession[]>([]);
 const [sessionsState, setSessionsState] = useState<"idle" | "ok" | "error">("idle");
 const [form, setForm] = useState({
 first_name: "",
 last_name: "",
 phone: "",
 });
 const [title, description, Icon] = copy[view];
 async function load() {
 setLoading(true);
 setError(false);
 try {
 if (view === "orders") {
 const result = await ordersApi.mine({
 page: orderPage,
 page_size: 20,
 search: orderSearch.trim() || undefined,
 status:
 orderStatusFilter === "all"
 ? undefined
 : orderStatusFilter,
 payment_status:
 orderPaymentFilter === "all"
 ? undefined
 : orderPaymentFilter,
 });
 setOrders(result.results);
 setOrderMeta({
 total: result.total,
 total_pages: result.total
 ? Math.ceil(result.total / Math.max(1, result.page_size))
 : 0,
 });
 }
 else if (view === "payments") {
 const result = await paymentsApi.mine({
 page: paymentPage,
 page_size: 20,
 search: paymentSearch.trim() || undefined,
 payment_status:
 paymentStatusFilter === "all"
 ? undefined
 : paymentStatusFilter,
 });
 setPayments(result.results);
 setPaymentMeta({
 total: result.total,
 total_pages: result.total
 ? Math.ceil(result.total / Math.max(1, result.page_size))
 : 0,
 });
 }
 else if (view === "addresses") {
 // Delivery addresses are a universal shopping capability. The user's
 // identity is already present in the authenticated session, so do not
 // make this page depend on a role-specific profile permission.
 setProfile((authenticatedUser as User | null) ?? null);
 }
 else if (view === "details") {
 const p = await usersApi.getMe();
 setProfile(p);
 setForm({
 first_name: p.first_name || "",
 last_name: p.last_name || "",
 phone: p.phone || "",
 });
 } else if (view === "security") {
 // Session management is a best-effort enhancement: a failed list call
 // must not break the password-change controls on this page.
 try {
 setSessions(await accountApi.listSessions());
 setSessionsState("ok");
 } catch {
 setSessions([]);
 setSessionsState("error");
 }
 }
 } catch {
 setError(true);
 } finally {
 setLoading(false);
 }
 }
 useEffect(() => {
 void load();
 }, [
 view,
 paymentPage,
 paymentSearch,
 paymentStatusFilter,
 orderPage,
 orderSearch,
 orderStatusFilter,
 orderPaymentFilter,
 authenticatedUser,
 ]);
 async function saveDetails(e: FormEvent) {
 e.preventDefault();
 try {
 const p = await usersApi.updateMe(form);
 setProfile(p);
 toast.success("Account details updated.");
 } catch {
 toast.error("Unable to update account details.");
 }
 }
 async function changePassword(e: FormEvent) {
 e.preventDefault();
 if (passwords.next !== passwords.confirm)
 return toast.error("Passwords do not match.");
 try {
 await authApi.changePassword({
 current_password: passwords.current,
 new_password: passwords.next,
 });
 toast.success("Password changed. Sign in again.");
 window.location.assign("/signin");
 } catch {
 toast.error("Unable to change password.");
 }
 }
 async function revokeSession(id: string) {
 try {
 await accountApi.revokeSession(id);
 setSessions((prev) => prev.filter((s) => s.id !== id));
 toast.success("Session signed out.");
 } catch {
 toast.error("Unable to sign out that session.");
 }
 }
 async function revokeOtherSessions() {
 try {
 await accountApi.revokeOtherSessions();
 await load();
 toast.success("Other sessions signed out.");
 } catch {
 toast.error("Unable to sign out other sessions.");
 }
 }
 return (
 <div className="space-y-5">
 <div>
 <p className="text-sm font-semibold text-primary">{view === "addresses" ? "Shopping & Delivery" : "Buyer Account"}</p>
 <h1 className="text-2xl font-bold">{title}</h1>
 <p className="mt-1 text-sm text-muted-foreground">{description}</p>
 </div>
 <section className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border">
 <div className="mb-5 flex items-center gap-3">
 <span className="rounded-xl bg-primary/10 p-2.5 text-primary dark:bg-primary-400/10">
 <HugeiconsIcon icon={Icon} size={20} />
 </span>
 <h2 className="font-bold">{title}</h2>
 </div>
 {loading ? (
 <State
 icon={Loading03Icon}
 spin
 text={`Loading ${title.toLowerCase()}...`}
 />
 ) : error ? (
 <div className="text-center">
 <State
 icon={AlertCircleIcon}
 text={`We could not load ${title.toLowerCase()}.`}
 />
 <button
 onClick={() => void load()}
 className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
 >
 <HugeiconsIcon icon={RefreshCwIcon} size={16} />
 Retry
 </button>
 </div>
 ) : view === "orders" ? (
 <Orders
 items={orders}
 page={orderPage}
 total={orderMeta.total}
 totalPages={orderMeta.total_pages}
 search={orderSearch}
 statusFilter={orderStatusFilter}
 paymentFilter={orderPaymentFilter}
 onSearch={(value) => {
 setOrderSearch(value);
 setOrderPage(1);
 }}
 onStatusFilter={(value) => {
 setOrderStatusFilter(value);
 setOrderPage(1);
 }}
 onPaymentFilter={(value) => {
 setOrderPaymentFilter(value);
 setOrderPage(1);
 }}
 onPage={setOrderPage}
 />
 ) : view === "payments" ? (
 <Payments
 items={payments}
 page={paymentPage}
 total={paymentMeta.total}
 totalPages={paymentMeta.total_pages}
 search={paymentSearch}
 statusFilter={paymentStatusFilter}
 onSearch={(value) => {
 setPaymentSearch(value);
 setPaymentPage(1);
 }}
 onStatusFilter={(value) => {
 setPaymentStatusFilter(value);
 setPaymentPage(1);
 }}
 onPage={setPaymentPage}
 />
 ) : view === "addresses" ? (
 <div className="space-y-4">
 {returnTo && (
 <div className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm text-accent-foreground sm:flex-row sm:items-center sm:justify-between dark:border-primary-400/20 dark:bg-primary-400/10 /75">
 <div>
 <p className="font-bold text-foreground">Delivery address for your checkout</p>
 <p className="mt-1">Add or update the destination you want to use, then return to checkout.</p>
 </div>
 <Link
 href={returnTo}
 className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-4 py-2.5 font-bold text-primary-foreground transition hover:bg-primary/90"
 >
 Back to checkout
 </Link>
 </div>
 )}
 <AddressBookSection
 isActive
 displayName={`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Name not provided"}
 emailLabel={profile?.email || "Email unavailable"}
 phoneLabel={profile?.phone || "Phone number not added"}
 />
 </div>
 ) : view === "details" ? (
 <Details
 profile={profile}
 form={form}
 setForm={setForm}
 submit={saveDetails}
 />
 ) : view === "security" ? (
 <Security
 passwords={passwords}
 setPasswords={setPasswords}
 submit={changePassword}
 sessions={sessions}
 sessionsState={sessionsState}
 onRevoke={revokeSession}
 onRevokeOthers={revokeOtherSessions}
 />
 ) : view === "notifications" ? (
 <NotificationCenter />
 ) : view === "reviews" ? (
 <CustomerReviews />
 ) : (
 <Unavailable view={view} />
 )}
 </section>
 </div>
 );
}
function Payments({
 items,
 page,
 total,
 totalPages,
 search,
 statusFilter,
 onSearch,
 onStatusFilter,
 onPage,
}: {
 items: Payment[];
 page: number;
 total: number;
 totalPages: number;
 search: string;
 statusFilter: string;
 onSearch: (value: string) => void;
 onStatusFilter: (value: string) => void;
 onPage: (value: number) => void;
}) {
 const completed = items.filter((p) => ["completed", "paid", "succeeded", "success"].includes(p.status.toLowerCase())).length;
 const pending = items.filter((p) => ["pending", "processing", "initiated"].includes(p.status.toLowerCase())).length;
 const attention = items.filter((p) => ["failed", "cancelled"].includes(p.status.toLowerCase())).length;

 const statusClass = (status: string) => {
 const value = status.toLowerCase();
 if (["completed", "paid", "succeeded", "success"].includes(value)) return "bg-green-light-6 text-green-dark dark:bg-success/10 dark:text-emerald-300";
 if (["failed", "cancelled"].includes(value)) return "bg-red-light-6 text-red-dark dark:bg-destructive/10 dark:text-red-300";
 if (value === "refunded") return "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300";
 return "bg-yellow-light-4 text-yellow-dark-2 dark:bg-warning/10 dark:text-amber-300";
 };

 return (
 <div className="space-y-5">
 <div className="grid gap-3 sm:grid-cols-3">
 <div className="rounded-xl border border-border bg-muted p-4 dark:border-border">
 <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Visible records</p>
 <p className="mt-1 text-2xl font-bold">{items.length}</p>
 </div>
 <div className="rounded-xl border border-border bg-muted p-4 dark:border-border">
 <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Completed</p>
 <p className="mt-1 text-2xl font-bold text-green-dark">{completed}</p>
 </div>
 <div className="rounded-xl border border-border bg-muted p-4 dark:border-border">
 <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Needs attention</p>
 <p className="mt-1 text-2xl font-bold text-destructive">{attention}</p>
 </div>
 </div>

 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <p className="font-semibold">Payment History</p>
 <p className="mt-1 text-xs text-muted-foreground">{total} payment record{total === 1 ? "" : "s"} · {pending} pending on this page</p>
 </div>
 <div className="flex flex-col gap-2 sm:flex-row">
 <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search payment or order..." className="h-10 rounded-xl border border-border px-3 text-sm outline-none focus:border-[var(--primary)] dark:border-border" />
 <select value={statusFilter} onChange={(e) => onStatusFilter(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm dark:border-border">
 <option value="all">All statuses</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option>
 </select>
 </div>
 </div>

 {!items.length ? (
 <Empty title="No payments found" text="Payment records will appear here after checkout." action="Start Shopping" href="/search" />
 ) : (
 <div className="space-y-3">
 {items.map((p) => {
 const requiresAction = ["pending", "processing", "initiated", "failed", "cancelled"].includes(p.status.toLowerCase()) && p.method !== "cash_on_delivery";
 return (
 <article key={p.id} className="rounded-xl border border-border bg-card p-4 dark:border-border sm:p-5">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-2">
 <p className="font-bold">{formatCurrency(p.amount, p.currency)}</p>
 <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClass(p.status)}`}>{p.status.replaceAll("_", " ")}</span>
 </div>
 <p className="mt-2 break-all text-xs text-muted-foreground">Reference: {p.provider_transaction_id || p.id}</p>
 <p className="mt-1 text-xs text-muted-foreground">Created {new Date(p.created_at).toLocaleString()}</p>
 </div>
 <div className="text-sm sm:text-right">
 <p className="font-semibold capitalize">{p.method.replaceAll("_", " ")}</p>
 <p className="mt-1 text-xs capitalize text-muted-foreground">{(p.provider || "Xerin payment").replaceAll("_", " ")}</p>
 </div>
 </div>

 {p.failure_reason && <div className="mt-4 rounded-xl bg-red-light-6 p-3 text-sm text-red-dark dark:bg-destructive/10 dark:text-red-300"><b>Payment issue:</b> {p.failure_reason}</div>}
 {p.method === "cash_on_delivery" && !p.paid_at && <div className="mt-4 rounded-xl bg-yellow-light-4 p-3 text-sm text-yellow-dark-2 dark:bg-warning/10 dark:text-amber-300">Cash on delivery · payment is collected when your order is delivered.</div>}

 <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4 dark:border-border">
 <Link href={`/account/orders/${p.order_id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-foreground px-4 text-sm font-bold text-background dark:bg-card dark:text-foreground">
 View Order & Tracking
 </Link>
 {requiresAction && (
 <Link href={`/account/orders/${p.order_id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">
 Review Payment
 </Link>
 )}
 <span className="ml-auto text-xs text-muted-foreground">
 {p.paid_at ? `Paid ${new Date(p.paid_at).toLocaleString()}` : "Not marked paid"}
 </span>
 </div>
 </article>
 );
 })}
 </div>
 )}

 {totalPages > 1 && <div className="flex items-center justify-end gap-3">
 <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold disabled:opacity-40">Previous</button>
 <span className="text-xs text-muted-foreground">Page {page} of {Math.max(totalPages, 1)}</span>
 <button disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold disabled:opacity-40">Next</button>
 </div>}
 </div>
 );
}

function Orders({
 items,
 page,
 total,
 totalPages,
 search,
 statusFilter,
 paymentFilter,
 onSearch,
 onStatusFilter,
 onPaymentFilter,
 onPage,
}: {
 items: Order[];
 page: number;
 total: number;
 totalPages: number;
 search: string;
 statusFilter: string;
 paymentFilter: string;
 onSearch: (value: string) => void;
 onStatusFilter: (value: string) => void;
 onPaymentFilter: (value: string) => void;
 onPage: (value: number) => void;
}) {
 return (
 <div>
 <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
 <div>
 <p className="text-sm font-semibold">Order History</p>
 <p className="mt-1 text-xs text-muted-foreground">
 {total} order{total === 1 ? "" : "s"} · Search and filters are
 processed by the backend before pagination.
 </p>
 </div>

 <div className="grid gap-2 sm:grid-cols-3">
 <input
 value={search}
 onChange={(event) => onSearch(event.target.value)}
 placeholder="Order, product, tracking..."
 className="h-10 rounded-xl border border-border px-3 text-sm outline-none dark:border-border"
 />

 <select
 value={statusFilter}
 onChange={(event) => onStatusFilter(event.target.value)}
 className="h-10 rounded-xl border border-border bg-card px-3 text-sm dark:border-border"
 >
 <option value="all">All fulfilment</option>
 <option value="pending">Pending</option>
 <option value="paid">Paid</option>
 <option value="processing">Processing</option>
 <option value="shipped">Shipped</option>
 <option value="delivered">Delivered</option>
 <option value="cancelled">Cancelled</option>
 <option value="refunded">Refunded</option>
 </select>

 <select
 value={paymentFilter}
 onChange={(event) => onPaymentFilter(event.target.value)}
 className="h-10 rounded-xl border border-border bg-card px-3 text-sm dark:border-border"
 >
 <option value="all">All payments</option>
 <option value="pending">Payment pending</option>
 <option value="processing">Payment processing</option>
 <option value="completed">Paid</option>
 <option value="failed">Payment failed</option>
 <option value="refunded">Refunded</option>
 </select>
 </div>
 </div>

 {!items.length ? (
 <Empty
 title="No orders found"
 text="Try another search/filter or start shopping."
 action="Start Shopping"
 href="/search"
 />
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[850px] text-left text-sm">
 <thead className="bg-muted">
 <tr>
 {[
 "Order",
 "Date",
 "Total",
 "Fulfilment",
 "Items",
 "Action",
 ].map((x) => (
 <th key={x} className="p-3">
 {x}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {items.map((order) => (
 <tr
 key={order.id}
 className="border-t border-border dark:border-border"
 >
 <td className="p-3 font-semibold">
 {order.id.slice(0, 8).toUpperCase()}
 </td>
 <td className="p-3">
 {new Date(order.created_at).toLocaleDateString()}
 </td>
 <td className="p-3">
 {formatCurrency(order.total, order.currency)}
 </td>
 <td className="p-3 capitalize">
 {order.status.replaceAll("_", " ")}
 </td>
 <td className="p-3">{order.items.length}</td>
 <td className="p-3">
 <Link
 href={`/account/orders/${order.id}`}
 className="font-semibold text-primary"
 >
 Track Order
 </Link>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {totalPages > 1 && (
 <div className="mt-5 flex items-center justify-end gap-3">
 <button
 disabled={page <= 1}
 onClick={() => onPage(page - 1)}
 className="rounded-lg border border-border px-3 py-2 text-sm font-semibold disabled:opacity-40"
 >
 Previous
 </button>
 <span className="text-xs text-muted-foreground">
 Page {page} of {Math.max(totalPages, 1)}
 </span>
 <button
 disabled={page >= totalPages}
 onClick={() => onPage(page + 1)}
 className="rounded-lg border border-border px-3 py-2 text-sm font-semibold disabled:opacity-40"
 >
 Next
 </button>
 </div>
 )}
 </div>
 );
}

function Details({
 profile,
 form,
 setForm,
 submit,
}: {
 profile: User | null;
 form: { first_name: string; last_name: string; phone: string };
 setForm: (v: typeof form) => void;
 submit: (e: FormEvent) => void;
}) {
 return (
 <form onSubmit={submit}>
 <div className="grid gap-4 sm:grid-cols-2">
 <Field
 label="First name"
 value={form.first_name}
 set={(v) => setForm({ ...form, first_name: v })}
 />
 <Field
 label="Last name"
 value={form.last_name}
 set={(v) => setForm({ ...form, last_name: v })}
 />
 <Field label="Email" value={profile?.email || ""} disabled />
 <Field
 label="Phone"
 value={form.phone}
 set={(v) => setForm({ ...form, phone: v })}
 />
 </div>
 <p className="mt-4 text-sm text-muted-foreground">
 Email: {profile?.is_verified ? "Verified" : "Not verified"} · Account:{" "}
 {profile?.status || "Unknown"}
 </p>
 <button className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
 Save changes
 </button>
 </form>
 );
}
function Security({
 passwords,
 setPasswords,
 submit,
 sessions,
 sessionsState,
 onRevoke,
 onRevokeOthers,
}: {
 passwords: { current: string; next: string; confirm: string };
 setPasswords: (v: typeof passwords) => void;
 submit: (e: FormEvent) => void;
 sessions: AccountSession[];
 sessionsState: "idle" | "ok" | "error";
 onRevoke: (id: string) => void;
 onRevokeOthers: () => void;
}) {
 const strong =
 passwords.next.length >= 6;

 return (
 <div className="space-y-6">
 <div className="rounded-xl border border-border p-5 dark:border-border">
 <div className="flex items-start gap-3">
 <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
 <HugeiconsIcon icon={Key01Icon} size={18} />
 </span>
 <div>
 <h3 className="font-bold">Change password</h3>
 <p className="mt-1 text-sm text-muted-foreground">
 Changing your password invalidates existing refresh sessions. You will need to sign in again.
 </p>
 </div>
 </div>

 <form onSubmit={submit} className="mt-5">
 <div className="grid gap-4">
 <Field type="password" label="Current password" value={passwords.current} set={(v)=>setPasswords({...passwords,current:v})}/>
 <Field type="password" label="New password" value={passwords.next} set={(v)=>setPasswords({...passwords,next:v})}/>
 <Field type="password" label="Confirm new password" value={passwords.confirm} set={(v)=>setPasswords({...passwords,confirm:v})}/>
 </div>
 <div className="mt-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
 Use at least 6 characters. A combination of letters and numbers is recommended.
 {passwords.next && <span className={`ml-2 font-bold ${strong ? "text-green-dark" : "text-yellow-dark"}`}>{strong ? "Good password format" : "Password can be stronger"}</span>}
 </div>
 <button disabled={!passwords.current || !passwords.next || passwords.next !== passwords.confirm} className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
 Change password
 </button>
 </form>
 </div>

 <div className="rounded-xl border border-border p-5 dark:border-border">
 <div className="flex items-start justify-between gap-4">
 <div className="flex items-start gap-3">
 <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
 <HugeiconsIcon icon={ShieldIcon} size={18} />
 </span>
 <div>
 <h3 className="font-bold">Active sessions</h3>
 <p className="mt-1 text-sm text-muted-foreground">
 Sign out sessions you no longer recognize.
 </p>
 </div>
 </div>
 {sessionsState === "ok" && sessions.length > 1 && (
 <button
 onClick={onRevokeOthers}
 className="shrink-0 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted dark:border-border"
 >
 Sign out other devices
 </button>
 )}
 </div>

 <div className="mt-4">
 {sessionsState === "error" ? (
 <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
 Session list could not be loaded right now. Your password controls above still work.
 </div>
 ) : sessions.length ? (
 <div className="divide-y divide-border rounded-xl border border-border dark:border-border">
 {sessions.map((s) => (
 <div key={s.id} className="flex items-center justify-between gap-3 p-3">
 <div className="min-w-0">
 <p className="truncate text-sm font-semibold">Marketplace session</p>
 <p className="mt-0.5 text-xs text-muted-foreground">
 {s.created_at ? `Started ${new Date(s.created_at).toLocaleString()}` : "Start time unavailable"}
 {s.expires_at ? ` · Expires ${new Date(s.expires_at).toLocaleString()}` : ""}
 </p>
 </div>
 <button
 onClick={() => onRevoke(s.id)}
 className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 dark:border-border"
 >
 Sign out
 </button>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">No other active sessions.</p>
 )}
 </div>
 </div>

 <div className="rounded-xl border border-border p-5 dark:border-border">
 <h3 className="font-bold">Account security status</h3>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">
 Password changes and active-session management are supported by the backend. Two-factor authentication is not currently exposed as a customer API, so this page does not show a non-functional control for it.
 </p>
 </div>

 <DeleteAccountCard />
 </div>
 );
}

function DeleteAccountCard() {
 const router = useRouter();
 const user = useAuthStore((state) => state.user);
 const clearSession = useAuthStore((state) => state.clearSession);
 const [password, setPassword] = useState("");
 const [confirmation, setConfirmation] = useState("");
 const [busy, setBusy] = useState(false);

 const isCustomer = (user as { account_type?: string } | null)?.account_type === "customer"
 || !user?.roles?.some((r) => ["admin", "super_admin", "seller", "broker"].includes(r));
 const ready = password.length >= 6 && confirmation.trim().toUpperCase() === "DELETE";

 if (!isCustomer) return null;

 const submit = async (e: FormEvent) => {
 e.preventDefault();
 if (!ready || busy) return;
 setBusy(true);
 try {
 await accountApi.deleteAccount({ current_password: password, confirmation: "DELETE" });
 clearSession();
 toast.success("Your account has been deleted.");
 router.push("/");
 } catch {
 toast.error("Unable to delete account. Check your password and try again.");
 setBusy(false);
 }
 };

 return (
 <div className="rounded-xl border border-destructive/40 p-5">
 <div className="flex items-start gap-3">
 <span className="rounded-xl bg-destructive/10 p-2.5 text-destructive">
 <HugeiconsIcon icon={AlertCircleIcon} size={18} />
 </span>
 <div>
 <h3 className="font-bold text-destructive">Delete account</h3>
 <p className="mt-1 text-sm text-muted-foreground">
 Permanently remove your Xerin account. Your profile is anonymised and you will no longer be able to sign in. Active orders are preserved for the sellers.
 </p>
 </div>
 </div>

 <form onSubmit={submit} className="mt-5 grid gap-4">
 <Field type="password" label="Current password" value={password} set={setPassword}/>
 <div>
 <label className="block text-sm font-medium">
 Type <span className="font-bold text-destructive">DELETE</span> to confirm
 <input
 type="text"
 value={confirmation}
 onChange={(e) => setConfirmation(e.target.value)}
 placeholder="DELETE"
 className="mt-1.5 h-11 w-full rounded-xl border-2 border-border bg-card px-4 text-sm font-medium outline-none transition placeholder:text-muted-foreground focus:border-destructive/60"
 />
 </label>
 </div>
 <button
 disabled={!ready || busy}
 className="w-fit rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
 >
 {busy ? "Deleting..." : "Delete my account"}
 </button>
 </form>
 </div>
 );
}
function Unavailable({ view }: { view: View }) {
 const labels: Record<string, [string, string]> = {
 payments: [
 "No payments yet",
 "Buyer payment history will appear here when the payment-list API becomes available.",
 ],
 reviews: ["Reviews unavailable", "The backend does not currently expose buyer review history or review mutations."],
 notifications: ["Notifications unavailable", "The backend does not currently expose buyer notifications or unread counts."],
 };
 const [a, b] = labels[view];
 return <Empty title={a} text={b} />;
}
function Empty({
 title,
 text,
 action,
 href,
}: {
 title: string;
 text: string;
 action?: string;
 href?: string;
}) {
 return (
 <div className="py-10 text-center">
 <h3 className="font-bold">{title}</h3>
 <p className="mt-2 text-sm text-muted-foreground">{text}</p>
 {action && href && (
 <Link
 href={href}
 className="mt-5 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
 >
 {action}
 </Link>
 )}
 </div>
 );
}
function State({
 icon: Icon,
 text,
 spin,
}: {
 icon: IconSvgElement;
 text: string;
 spin?: boolean;
}) {
 return (
 <p className="flex justify-center gap-2 py-10 text-sm text-muted-foreground">
 <HugeiconsIcon icon={Icon} size={18} className={spin ? "animate-spin" : ""} />
 {text}
 </p>
 );
}
function Field({
 label,
 value,
 set,
 disabled,
 type = "text",
}: {
 label: string;
 value: string;
 set?: (v: string) => void;
 disabled?: boolean;
 type?: string;
}) {
 return (
 <label className="text-sm font-semibold">
 {label}
 <input
 type={type}
 value={value}
 disabled={disabled}
 onChange={(e) => set?.(e.target.value)}
 className="mt-2 w-full rounded-xl border border-border bg-muted px-4 py-3 font-normal outline-none focus:border-[var(--primary)] disabled:opacity-60 dark:border-border"
 />
 </label>
 );
}
