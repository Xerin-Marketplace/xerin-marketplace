"use client";


import { Spinner } from "@/components/ui/Spinner";
import {
 sellerAccountApi,
 type SellerSession,
 type SellerUserProfile,
} from "@/lib/api/endpoints/seller-account";
import { sellersApi } from "@/lib/api/endpoints/sellers";
import type {
 PayoutAccount,
 Seller,
 SellerBusinessProfile,
 SellerKycStatus,
} from "@/types/api/seller";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { BellIcon, Building03Icon, CheckmarkCircle02Icon, LinkSquare01Icon, Key01Icon, Loading03Icon, ShieldCheckIcon, Store01Icon, UserIcon, Delete02Icon, LockIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import NotificationCenter from "@/components/Notifications/NotificationCenter";

export type SellerAccountView =
 | "overview"
 | "profile"
 | "security"
 | "notifications"
 | "store"
 | "support";
export default function SellerAccount({ view }: { view: SellerAccountView }) {
 const [user, setUser] = useState<SellerUserProfile | null>(null);
 const [seller, setSeller] = useState<Seller | null>(null);
 const [business, setBusiness] = useState<SellerBusinessProfile | null>(null);
 const [kyc, setKyc] = useState<SellerKycStatus | null>(null);
 const [payouts, setPayouts] = useState<PayoutAccount[]>([]);
 const [sessions, setSessions] = useState<SellerSession[]>([]);
 const [loading, setLoading] = useState(true);
 const [loadError, setLoadError] = useState("");
 const [saving, setSaving] = useState(false);
 const [profile, setProfile] = useState({
 first_name: "",
 last_name: "",
 phone: "",
 });
 const [sellerForm, setSellerForm] = useState({
 business_name: "",
 contact_email: "",
 contact_phone: "",
 });
 const [businessForm, setBusinessForm] = useState({
 business_description: "",
 business_country: "",
 business_region: "",
 business_city: "",
 business_address: "",
 });
 const [passwords, setPasswords] = useState({
 current: "",
 next: "",
 confirm: "",
 });

 useEffect(() => {
 void load();
 }, []);
 async function load() {
 setLoading(true);
 setLoadError("");
 try {
 const [u, s, b, k, p] = await Promise.all([
 sellerAccountApi.getUser(),
 sellersApi.getMe(),
 sellersApi.getProfile(),
 sellersApi.getKycStatus(),
 sellersApi.getPayoutAccounts(),
 ]);
 setUser(u);
 setSeller(s);
 setBusiness(b);
 setKyc(k);
 setPayouts(p);
 setProfile({
 first_name: u.first_name || "",
 last_name: u.last_name || "",
 phone: u.phone || "",
 });
 setSellerForm({
 business_name: s.business_name || "",
 contact_email: s.contact_email || "",
 contact_phone: s.contact_phone || "",
 });
 setBusinessForm({
 business_description: b.business_description || "",
 business_country: b.business_country || "",
 business_region: b.business_region || "",
 business_city: b.business_city || "",
 business_address: b.business_address || "",
 });
 if (view === "security")
 setSessions(await sellerAccountApi.listSessions());
 } catch (cause) {
 const message = cause instanceof Error ? cause.message : "Unable to load seller account settings.";
 setLoadError(message);
 toast.error(message);
 } finally {
 setLoading(false);
 }
 }

 async function saveProfile(event: FormEvent) {
 event.preventDefault();
 setSaving(true);
 try {
 const updated = await sellerAccountApi.updateUser({
 ...profile,
 phone: profile.phone || null,
 });
 setUser(updated);
 toast.success("Profile information updated.");
 } catch {
 toast.error("Profile update failed.");
 } finally {
 setSaving(false);
 }
 }
 async function saveBusiness(event: FormEvent) {
 event.preventDefault();
 setSaving(true);
 try {
 const [s, b] = await Promise.all([
 sellersApi.updateMe(sellerForm),
 sellersApi.updateProfile(businessForm),
 ]);
 setSeller(s);
 setBusiness(b);
 toast.success("Business information updated.");
 } catch {
 toast.error("Business update failed.");
 } finally {
 setSaving(false);
 }
 }
 async function changePassword(event: FormEvent) {
 event.preventDefault();
 if (passwords.next.length < 6)
 return toast.error("New password must contain at least 6 characters.");
 if (passwords.next !== passwords.confirm)
 return toast.error("New passwords do not match.");
 setSaving(true);
 try {
 await sellerAccountApi.changePassword(passwords.current, passwords.next);
 toast.success("Password changed. Please sign in again.");
 window.location.assign("/signin");
 } catch {
 toast.error("Password change failed.");
 } finally {
 setSaving(false);
 }
 }

 if (loading)
 return (
 <div className="flex min-h-72 items-center justify-center">
 <Spinner className="text-primary" />
 </div>
 );
 if (loadError)
 return <div className="rounded-xl border border-red-light-4 bg-red-light-6 p-6 text-center text-sm text-red-dark"><p>{loadError}</p><button type="button" onClick={() => void load()} className="mt-3 rounded-xl bg-red-dark px-4 py-2 font-semibold text-white">Retry</button></div>;
 if (view === "security")
 return (
 <Security
 user={user}
 passwords={passwords}
 setPasswords={setPasswords}
 submit={changePassword}
 saving={saving}
 sessions={sessions}
 revoke={async (id) => {
 await sellerAccountApi.revokeSession(id);
 setSessions((v) => v.filter((s) => s.id !== id));
 toast.success("Session signed out.");
 }}
 />
 );
 if (view === "notifications")
 return <Notifications />;
 if (view === "store")
 return (
 <StoreSettings
 seller={seller}
 business={business}
 form={businessForm}
 setForm={setBusinessForm}
 save={saveBusiness}
 saving={saving}
 />
 );
 if (view === "support") return <Support />;

 const kycDisplayStatus = kyc?.missing_documents.length
 ? "Incomplete"
 : kyc?.seller_status === "under_review"
 ? "Under Review"
 : kyc?.seller_status === "approved"
 ? "Approved"
 : "Ready to Submit";

 return (
 <div className="space-y-6">
 <PageIntro
 title={view === "profile" ? "Seller Profile" : "Account Settings"}
 text="Manage your seller identity, business details and account status."
 />
 <AccountNav />
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <Status
 label="Account Status"
 value={
 seller?.status === "approved"
 ? "Approved Seller"
 : seller?.status || "Pending"
 }
 good={seller?.status === "approved"}
 />
 <Status
 label="KYC Status"
 value={kycDisplayStatus}
 good={kycDisplayStatus === "Approved"}
 />
 <Status
 label="Store Status"
 value="Unavailable"
 good={false}
 />
 <Status
 label="Payout Status"
 value={
 payouts.some(
 (account) =>
 account.is_active !== false &&
 account.verification_status === "verified",
 )
 ? "Verified & Ready"
 : payouts.length
 ? "Verification Pending"
 : "Not Configured"
 }
 good={payouts.some(
 (account) =>
 account.is_active !== false &&
 account.verification_status === "verified",
 )}
 />
 </div>
 <form onSubmit={saveProfile}>
 <Section
 icon={UserIcon}
 title="Profile Information"
 description="Personal details used for your Seller Center account."
 >
 <div className="grid gap-4 md:grid-cols-2">
 <Field
 label="First name"
 value={profile.first_name}
 set={(v) => setProfile({ ...profile, first_name: v })}
 />
 <Field
 label="Last name"
 value={profile.last_name}
 set={(v) => setProfile({ ...profile, last_name: v })}
 />
 <Field
 label="Email address"
 value={user?.email || ""}
 disabled
 hint={
 user?.is_verified
 ? "Verified email"
 : "Email verification pending"
 }
 />
 <Field
 label="Phone number"
 value={profile.phone}
 set={(v) => setProfile({ ...profile, phone: v })}
 />
 </div>
 <Actions saving={saving} />
 </Section>
 </form>
 <form onSubmit={saveBusiness}>
 <Section
 icon={Building03Icon}
 title="Business Information"
 description="Legal business information used for verification and payouts."
 >
 <div className="grid gap-4 md:grid-cols-2">
 <Field
 label="Business name"
 value={sellerForm.business_name}
 set={(v) => setSellerForm({ ...sellerForm, business_name: v })}
 disabled={seller?.status === "approved"}
 hint={
 seller?.status === "approved"
 ? "Approved sensitive field, contact support to request a change"
 : undefined
 }
 />
 <Field
 label="Business type"
 value={seller?.business_category || "Not provided"}
 disabled
 />
 <Field
 label="Business email"
 value={sellerForm.contact_email}
 set={(v) => setSellerForm({ ...sellerForm, contact_email: v })}
 />
 <Field
 label="Business phone"
 value={sellerForm.contact_phone}
 set={(v) => setSellerForm({ ...sellerForm, contact_phone: v })}
 />
 <Field
 label="Country"
 value={businessForm.business_country}
 set={(v) =>
 setBusinessForm({ ...businessForm, business_country: v })
 }
 />
 <Field
 label="Region"
 value={businessForm.business_region}
 set={(v) =>
 setBusinessForm({ ...businessForm, business_region: v })
 }
 />
 <Field
 label="City"
 value={businessForm.business_city}
 set={(v) =>
 setBusinessForm({ ...businessForm, business_city: v })
 }
 />
 <Field
 label="Business address"
 value={businessForm.business_address}
 set={(v) =>
 setBusinessForm({ ...businessForm, business_address: v })
 }
 />
 </div>
 <div className="mt-4 rounded-xl bg-yellow-light-4 p-4 text-sm text-yellow-dark-2 dark:bg-amber-400/10 dark:text-amber-300">
 KYC review:{" "}
 {kyc?.missing_documents.length
 ? `Incomplete · ${kyc.missing_documents.length} document(s) missing`
 : "Submitted for review"}
 .{" "}
 <Link className="font-semibold underline" href="/seller/kyc">
 Open verification
 </Link>
 </div>
 <Actions saving={saving} />
 </Section>
 </form>
 </div>
 );
}

function PageIntro({ title, text }: { title: string; text: string }) {
 return (
 <div>
 <h2 className="text-2xl font-bold">{title}</h2>
 <p className="mt-1 text-sm text-muted-foreground">{text}</p>
 </div>
 );
}
function AccountNav() {
 return (
 <div className="flex flex-wrap gap-2">
 {[
 ["Overview", "/seller/account"],
 ["Profile", "/seller/account/profile"],
 ["Security", "/seller/account/security"],
 ["Notifications", "/seller/account/notifications"],
 ["Delivery Addresses", "/account/addresses"],
 ["Store", "/seller/store"],
 ].map(([l, h]) => (
 <Link
 key={h}
 href={h}
 className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-[var(--primary)] dark:border-border dark:bg-card"
 >
 {l}
 </Link>
 ))}
 </div>
 );
}
function Section({
 icon: Icon,
 title,
 description,
 children,
}: {
 icon: IconSvgElement;
 title: string;
 description: string;
 children: React.ReactNode;
}) {
 return (
 <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
 <div className="mb-5 flex gap-3">
 <span className="rounded-xl bg-primary/10 p-2.5 text-primary dark:bg-primary-400/10">
 <HugeiconsIcon icon={Icon} size={20} />
 </span>
 <div>
 <h3 className="font-bold">{title}</h3>
 <p className="text-sm text-muted-foreground">{description}</p>
 </div>
 </div>
 {children}
 </div>
 );
}
function Field({
 label,
 value,
 set,
 disabled,
 hint,
 type = "text",
}: {
 label: string;
 value: string;
 set?: (v: string) => void;
 disabled?: boolean;
 hint?: string;
 type?: string;
}) {
 return (
 <label className="block text-sm font-semibold">
 {label}
 <input
 type={type}
 value={value}
 disabled={disabled}
 onChange={(e) => set?.(e.target.value)}
 className="mt-2 w-full rounded-xl border border-border bg-muted px-4 py-3 font-normal outline-none focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-65 dark:border-border"
 />
 {hint && (
 <small className="mt-1 block font-normal text-muted-foreground">{hint}</small>
 )}
 </label>
 );
}
function Actions({ saving }: { saving: boolean }) {
 return (
 <div className="mt-6 flex justify-end gap-3">
 <button
 type="reset"
 className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold dark:border-border"
 >
 Cancel
 </button>
 <button
 disabled={saving}
 className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
 >
 {saving ? "Saving..." : "Save changes"}
 </button>
 </div>
 );
}
function Status({
 label,
 value,
 good,
}: {
 label: string;
 value: string;
 good: boolean;
}) {
 return (
 <div className="rounded-xl border border-border bg-card p-5 dark:border-border dark:bg-card">
 <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
 {label}
 </p>
 <p
 className={`mt-2 flex items-center gap-2 font-bold ${good ? "text-green-600" : "text-yellow-dark"}`}
 >
 <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
 {value}
 </p>
 </div>
 );
}
function Security({
 user,
 passwords,
 setPasswords,
 submit,
 saving,
 sessions,
 revoke,
}: {
 user: SellerUserProfile | null;
 passwords: { current: string; next: string; confirm: string };
 setPasswords: (v: { current: string; next: string; confirm: string }) => void;
 submit: (e: FormEvent) => void;
 saving: boolean;
 sessions: SellerSession[];
 revoke: (id: string) => void;
}) {
 const [deleteOpen, setDeleteOpen] = useState(false);
 const [deletePassword, setDeletePassword] = useState("");
 const [deleteConfirm, setDeleteConfirm] = useState("");
 const [deleting, setDeleting] = useState(false);
 const readyToDelete = deletePassword.length >= 6 && deleteConfirm === "DELETE";

 const deleteAccount = async () => {
 setDeleting(true);
 try {
 await sellerAccountApi.deleteAccount({
 current_password: deletePassword,
 confirmation: deleteConfirm,
 });
 toast.success("Your account has been deleted.");
 window.location.assign("/");
 } catch {
 toast.error("Could not delete the account. Check your password and try again.");
 } finally {
 setDeleting(false);
 }
 };

 return (
 <div className="space-y-6">
 <PageIntro
 title="Security"
 text="Protect your Seller Center account and manage active sessions."
 />
 <AccountNav />
 <Section
 icon={UserIcon}
 title="Account Details"
 description="The identity attached to this Seller Center account."
 >
 <dl className="grid gap-4 sm:grid-cols-2">
 <div className="rounded-xl border border-border bg-muted/40 p-4">
 <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full name</dt>
 <dd className="mt-1 text-sm font-semibold text-foreground">
 {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Not set"}
 </dd>
 </div>
 <div className="rounded-xl border border-border bg-muted/40 p-4">
 <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</dt>
 <dd className="mt-1 truncate text-sm font-semibold text-foreground">{user?.email || "Not set"}</dd>
 </div>
 <div className="rounded-xl border border-border bg-muted/40 p-4">
 <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</dt>
 <dd className="mt-1 text-sm font-semibold text-foreground">{user?.phone || "Not set"}</dd>
 </div>
 <div className="rounded-xl border border-border bg-muted/40 p-4">
 <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account status</dt>
 <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
 {user?.is_verified ? (
 <>
 <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} className="text-green-600" />
 <span className="text-green-600">Verified</span>
 </>
 ) : (
 <span className="text-muted-foreground">{user?.status || "Unverified"}</span>
 )}
 </dd>
 </div>
 </dl>
 </Section>
 <form onSubmit={submit}>
 <Section
 icon={Key01Icon}
 title="Change Password"
 description="Changing your password signs out existing refresh sessions."
 >
 <div className="grid gap-4 md:grid-cols-3">
 <Field
 type="password"
 label="Current password"
 value={passwords.current}
 set={(v) => setPasswords({ ...passwords, current: v })}
 />
 <Field
 type="password"
 label="New password"
 value={passwords.next}
 set={(v) => setPasswords({ ...passwords, next: v })}
 />
 <Field
 type="password"
 label="Confirm password"
 value={passwords.confirm}
 set={(v) => setPasswords({ ...passwords, confirm: v })}
 />
 </div>
 <Actions saving={saving} />
 </Section>
 </form>
 <Section
 icon={ShieldCheckIcon}
 title="Active Sessions"
 description="Sign out sessions you no longer recognize."
 >
 <div className="space-y-3">
 {sessions.length ? (
 sessions.map((s) => (
 <div
 key={s.id}
 className="flex items-center justify-between rounded-xl border border-border p-4 dark:border-border"
 >
 <div>
 <b>Seller Center session</b>
 <p className="text-xs text-muted-foreground">
 Created {new Date(s.created_at).toLocaleString()} · Expires{" "}
 {new Date(s.expires_at).toLocaleString()}
 </p>
 </div>
 <button
 type="button"
 onClick={() => revoke(s.id)}
 className="text-sm font-semibold text-destructive"
 >
 Sign out
 </button>
 </div>
 ))
 ) : (
 <p className="text-sm text-muted-foreground">No other active sessions.</p>
 )}
 </div>
 <div className="mt-5 rounded-xl bg-muted p-4 text-sm">
 <b>Two-factor authentication</b>
 <p className="text-muted-foreground">
 Preparation complete; activation will be available when the
 authentication API supports 2FA.
 </p>
 </div>
 </Section>

 <section className="rounded-xl border border-red-light-4 bg-red-light-6/40 p-6">
 <div className="flex items-start gap-3">
 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
 <HugeiconsIcon icon={Delete02Icon} size={18} />
 </span>
 <div className="min-w-0 flex-1">
 <h3 className="text-base font-semibold text-destructive">Delete account</h3>
 <p className="mt-1 text-sm text-muted-foreground">
 Permanently close your Xerin account. Your orders, payments and
 records stay on file for legal reasons, but you will not be able
 to sign in again. This cannot be undone.
 </p>
 {!deleteOpen ? (
 <button
 type="button"
 onClick={() => setDeleteOpen(true)}
 className="mt-4 rounded-lg border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive hover:text-white"
 >
 Delete my account
 </button>
 ) : (
 <div className="mt-4 space-y-3 rounded-xl border border-destructive/25 bg-card p-4">
 <label className="block text-sm font-medium text-foreground">
 Type <span className="font-mono font-bold">DELETE</span> to confirm
 <input
 type="text"
 value={deleteConfirm}
 onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
 placeholder="DELETE"
 autoComplete="off"
 className="mt-1.5 h-10 w-full rounded-lg border border-border bg-muted px-3.5 text-sm outline-none focus:border-destructive/50 focus:ring-2 focus:ring-destructive/20"
 />
 </label>
 <label className="block text-sm font-medium text-foreground">
 Current password
 <input
 type="password"
 value={deletePassword}
 onChange={(e) => setDeletePassword(e.target.value)}
 placeholder="Enter your current password"
 autoComplete="current-password"
 className="mt-1.5 h-10 w-full rounded-lg border border-border bg-muted px-3.5 text-sm outline-none focus:border-destructive/50 focus:ring-2 focus:ring-destructive/20"
 />
 </label>
 <div className="flex flex-wrap gap-2 pt-1">
 <button
 type="button"
 onClick={() => {
 setDeleteOpen(false);
 setDeletePassword("");
 setDeleteConfirm("");
 }}
 className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
 >
 Keep my account
 </button>
 <button
 type="button"
 disabled={!readyToDelete || deleting}
 onClick={() => void deleteAccount()}
 className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
 >
 {deleting && <HugeiconsIcon icon={Loading03Icon} size={15} className="animate-spin" />}
 {deleting ? "Deleting..." : "Permanently delete account"}
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </section>
 </div>
 );
}
function Notifications() {
 return (
 <div className="space-y-6">
 <PageIntro
 title="Notifications"
 text="Review seller workflow alerts and actions that need your attention."
 />
 <AccountNav />
 <NotificationCenter />
 </div>
 );
}
function StoreSettings({
 seller,
 business,
 form,
 setForm,
 save,
 saving,
}: {
 seller: Seller | null;
 business: SellerBusinessProfile | null;
 form: {
 business_description: string;
 business_country: string;
 business_region: string;
 business_city: string;
 business_address: string;
 };
 setForm: (v: typeof form) => void;
 save: (e: FormEvent) => void;
 saving: boolean;
}) {
 return (
 <div className="space-y-6">
 <PageIntro
 title="Store Settings"
 text="Control how your business appears to customers."
 />
 <AccountNav />
 <form onSubmit={save}>
 <Section
 icon={Store01Icon}
 title="Store Information"
 description="Store identity and customer-facing contact information."
 >
 <div className="grid gap-4 md:grid-cols-2">
 <Field
 label="Store name"
 value={seller?.business_name || ""}
 disabled
 />
 <Field
 label="Store slug"
 value={(seller?.business_name || "store")
 .toLowerCase()
 .replace(/\s+/g, "-")}
 disabled
 />
 <Field
 label="Support email"
 value={seller?.contact_email || ""}
 disabled
 />
 <Field
 label="Support phone"
 value={seller?.contact_phone || ""}
 disabled
 />
 </div>
 <label className="mt-4 block text-sm font-semibold">
 Store description
 <textarea
 value={form.business_description}
 onChange={(e) =>
 setForm({ ...form, business_description: e.target.value })
 }
 rows={5}
 className="mt-2 w-full rounded-xl border border-border bg-muted p-4 font-normal outline-none focus:border-[var(--primary)] dark:border-border"
 />
 </label>
 <div className="mt-4 grid gap-4 md:grid-cols-2">
 <Field
 label="Return policy"
 value="Configure through Seller Support"
 disabled
 />
 <Field
 label="Shipping information"
 value={
 business?.business_country
 ? `Ships from ${business.business_city || business.business_country}`
 : "Not configured"
 }
 disabled
 />
 </div>
 <div className="mt-6 flex justify-end gap-3">
 <Link
 href="/shop-with-sidebar"
 className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold dark:border-border"
 >
 <HugeiconsIcon icon={LinkSquare01Icon} size={16} />
 View storefront
 </Link>
 <button
 disabled={saving}
 className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
 >
 Update store
 </button>
 </div>
 </Section>
 </form>
 </div>
 );
}
function Support() {
 return (
 <div className="space-y-6">
 <PageIntro
 title="Seller Help & Support"
 text="Get assistance without leaving Seller Center."
 />
 <Section
 icon={BellIcon}
 title="Contact Seller Support"
 description="Our operations team can help with verification, products and payouts."
 >
 <div className="grid gap-4 md:grid-cols-3">
 {[
 ["Verification support", "KYC documents and review feedback"],
 ["Catalog support", "Product submission and approval"],
 ["Payout support", "Settlement and payout account issues"],
 ].map(([a, b]) => (
 <div
 key={a}
 className="rounded-xl border border-border p-4 dark:border-border"
 >
 <b>{a}</b>
 <p className="mt-1 text-sm text-muted-foreground">{b}</p>
 <a
 href="mailto:support@xerinmart.com"
 className="mt-3 inline-block text-sm font-semibold text-primary"
 >
 Email support
 </a>
 </div>
 ))}
 </div>
 </Section>
 </div>
 );
}
