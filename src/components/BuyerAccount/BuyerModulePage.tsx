"use client";
import { formatCurrency } from "@/lib/formatCurrency";
import { ordersApi, paymentsApi } from "@/lib/api/endpoints/commerce";
import {
  sellerAccountApi,
  type SellerSession,
} from "@/lib/api/endpoints/seller-account";
import { usersApi } from "@/lib/api/endpoints/users";
import type { Address, User } from "@/types/api/user";
import type { Order, Payment } from "@/types/api/commerce";
import {
  AlertCircle,
  Bell,
  CreditCard,
  KeyRound,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Shield,
  Star,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AddressBookSection from "@/components/MyAccount/AddressBookSection";
type View =
  | "orders"
  | "payments"
  | "addresses"
  | "reviews"
  | "notifications"
  | "security"
  | "details";
const copy = {
  orders: ["My Orders", "Track purchases and delivery progress.", Package],
  payments: [
    "My Payments",
    "Review buyer payment activity and receipts.",
    CreditCard,
  ],
  addresses: [
    "My Addresses",
    "Manage delivery and billing destinations.",
    MapPin,
  ],
  reviews: ["My Reviews", "Manage product feedback you have submitted.", Star],
  notifications: ["Notifications", "Review account and order updates.", Bell],
  security: [
    "Account Security",
    "Protect your buyer account and active sessions.",
    Shield,
  ],
  details: [
    "Account Details",
    "Update your personal buyer information.",
    UserRound,
  ],
} as const;
export default function BuyerModulePage({ view }: { view: View }) {
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [orders, setOrders] = useState<Order[]>([]),
    [payments, setPayments] = useState<Payment[]>([]),
    [addresses, setAddresses] = useState<Address[]>([]),
    [profile, setProfile] = useState<User | null>(null),
    [sessions, setSessions] = useState<SellerSession[]>([]);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
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
      if (view === "orders")
        setOrders((await ordersApi.mine()).results);
      else if (view === "payments")
        setPayments(await paymentsApi.mine());
      else if (view === "addresses")
        setAddresses(await usersApi.getAddresses());
      else if (view === "details") {
        const p = await usersApi.getMe();
        setProfile(p);
        setForm({
          first_name: p.first_name || "",
          last_name: p.last_name || "",
          phone: p.phone || "",
        });
      } else if (view === "security")
        setSessions(await sellerAccountApi.listSessions());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [view]);
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
      await sellerAccountApi.changePassword(passwords.current, passwords.next);
      toast.success("Password changed. Sign in again.");
      window.location.assign("/signin");
    } catch {
      toast.error("Unable to change password.");
    }
  }
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[#f7941d]">Buyer Account</p>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-[#64748b]">{description}</p>
      </div>
      <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-darkTheme-card">
        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-xl bg-orange-50 p-2.5 text-[#f7941d] dark:bg-orange-400/10">
            <Icon size={21} />
          </span>
          <h2 className="font-bold">{title}</h2>
        </div>
        {loading ? (
          <State
            icon={Loader2}
            spin
            text={`Loading ${title.toLowerCase()}...`}
          />
        ) : error ? (
          <div className="text-center">
            <State
              icon={AlertCircle}
              text={`We could not load ${title.toLowerCase()}.`}
            />
            <button
              onClick={() => void load()}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#f7941d]"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : view === "orders" ? (
          <Orders items={orders} />
        ) : view === "payments" ? (
          <Payments items={payments} />
        ) : view === "addresses" ? (
          <AddressBookSection
            isActive
            displayName="Buyer"
            emailLabel="Authenticated account"
            phoneLabel="Account contact"
          />
        ) : view === "details" ? (
          <Details
            profile={profile}
            form={form}
            setForm={setForm}
            submit={saveDetails}
          />
        ) : view === "security" ? (
          <Security
            sessions={sessions}
            passwords={passwords}
            setPasswords={setPasswords}
            submit={changePassword}
            revoke={async (id) => {
              await sellerAccountApi.revokeSession(id);
              setSessions((v) => v.filter((s) => s.id !== id));
              toast.success("Session signed out.");
            }}
          />
        ) : (
          <Unavailable view={view} />
        )}
      </section>
    </div>
  );
}
function Payments({ items }: { items: Payment[] }) {
  if (!items.length)
    return (
      <Empty
        title="No payments yet"
        text="Payments will appear here after you initiate checkout."
        action="Start Shopping"
        href="/shop-with-sidebar"
      />
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-[#f8fafc] dark:bg-white/5">
          <tr>
            {[
              "Reference",
              "Order",
              "Amount",
              "Method",
              "Status",
              "Date",
              "Receipt",
            ].map((x) => (
              <th key={x} className="p-3">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr
              key={p.id}
              className="border-t border-[#e2e8f0] dark:border-white/10"
            >
              <td className="p-3 font-semibold">
                {p.provider_transaction_id || p.id.slice(0, 8)}
              </td>
              <td className="p-3">{p.order_id.slice(0, 8)}</td>
              <td className="p-3">
                {formatCurrency(p.amount, p.currency)}
              </td>
              <td className="p-3 capitalize">
                {(p.provider || p.method || "—").replaceAll("_", " ")}
              </td>
              <td className="p-3 capitalize">{p.status || "Pending"}</td>
              <td className="p-3">
                {p.created_at
                  ? new Date(p.created_at).toLocaleDateString()
                  : "—"}
              </td>
              <td className="p-3 text-[#64748b]">
                {p.status === "completed" ? "Available" : "Pending"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Orders({ items }: { items: Order[] }) {
  if (!items.length)
    return (
      <Empty
        title="No orders yet"
        text="Your orders will appear here after you complete a purchase."
        action="Start Shopping"
        href="/shop-with-sidebar"
      />
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-[#f8fafc] dark:bg-white/5">
          <tr>
            {[
              "Order",
              "Date",
              "Total",
              "Payment",
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
          {items.map((o) => (
            <tr
              key={o.id}
              className="border-t border-[#e2e8f0] dark:border-white/10"
            >
              <td className="p-3 font-semibold">
                {o.id.slice(0, 8)}
              </td>
              <td className="p-3">
                {o.created_at
                  ? new Date(o.created_at).toLocaleDateString()
                  : "—"}
              </td>
              <td className="p-3">{formatCurrency(o.total, o.currency)}</td>
              <td className="p-3 text-[#64748b]">See payment history</td>
              <td className="p-3 capitalize">{o.status.replaceAll("_", " ")}</td>
              <td className="p-3">{o.items.length}</td>
              <td className="p-3">
                <Link
                  href={`/account/orders/${o.id}`}
                  className="font-semibold text-[#f7941d]"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Addresses({ items }: { items: Address[] }) {
  const [rows, setRows] = useState(items);
  async function remove(a: Address) {
    if (a.is_default && rows.length > 1)
      return toast.error(
        "Select another default address before deleting this one.",
      );
    if (!window.confirm("Delete this saved address?")) return;
    try {
      await usersApi.deleteAddress(a.id);
      setRows((v) => v.filter((x) => x.id !== a.id));
      toast.success("Address deleted.");
    } catch {
      toast.error("Unable to delete address.");
    }
  }
  async function makeDefault(a: Address) {
    try {
      const updated = await usersApi.updateAddress(a.id, {
        country: a.country,
        region: a.region,
        city: a.city,
        street: a.street,
        postal_code: a.postal_code,
        is_default: true,
      });
      setRows((v) => v.map((x) => ({ ...x, is_default: x.id === updated.id })));
      toast.success("Default address updated.");
    } catch {
      toast.error("Unable to update default address.");
    }
  }
  if (!rows.length)
    return (
      <Empty
        title="No saved addresses"
        text="Add a delivery address to make checkout faster."
        action="Add Delivery Address"
        href="/account/details"
      />
    );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rows.map((a) => (
        <article
          key={String(a.id)}
          className="rounded-xl border border-[#e2e8f0] p-4 dark:border-white/10"
        >
          <div className="flex justify-between">
            <b>{a.is_default ? "Default address" : "Saved address"}</b>
            {a.is_default && (
              <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
                Default
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-[#64748b]">
            {a.street}, {a.city}, {a.region}, {a.country}
          </p>
          <div className="mt-4 flex gap-3 text-sm font-semibold text-[#f7941d]">
            {!a.is_default && (
              <button onClick={() => void makeDefault(a)}>Set default</button>
            )}
            <button onClick={() => void remove(a)} className="text-red-600">
              Delete
            </button>
          </div>
        </article>
      ))}
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
      <p className="mt-4 text-sm text-[#64748b]">
        Email: {profile?.is_verified ? "Verified" : "Not verified"} · Account:{" "}
        {profile?.status || "Unknown"}
      </p>
      <button className="mt-5 rounded-xl bg-[#f7941d] px-5 py-2.5 text-sm font-semibold text-white">
        Save changes
      </button>
    </form>
  );
}
function Security({
  sessions,
  passwords,
  setPasswords,
  submit,
  revoke,
}: {
  sessions: SellerSession[];
  passwords: { current: string; next: string; confirm: string };
  setPasswords: (v: typeof passwords) => void;
  submit: (e: FormEvent) => void;
  revoke: (id: string) => void;
}) {
  return (
    <div className="space-y-7">
      <form onSubmit={submit}>
        <h3 className="mb-3 font-bold">Change password</h3>
        <div className="grid gap-4 sm:grid-cols-3">
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
        <button className="mt-4 rounded-xl bg-[#f7941d] px-5 py-2.5 text-sm font-semibold text-white">
          Change password
        </button>
      </form>
      <div>
        <h3 className="mb-3 font-bold">Active sessions</h3>
        {sessions.length ? (
          sessions.map((s) => (
            <div
              key={s.id}
              className="flex justify-between border-t border-[#e2e8f0] py-3 text-sm dark:border-white/10"
            >
              <span>
                Session created {new Date(s.created_at).toLocaleString()}
              </span>
              <button
                onClick={() => revoke(s.id)}
                className="font-semibold text-red-600"
              >
                Sign out
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#64748b]">No other active sessions.</p>
        )}
      </div>
      <div className="rounded-xl bg-[#f8fafc] p-4 text-sm dark:bg-white/5">
        <b>Two-factor authentication</b>
        <p className="text-[#64748b]">
          Prepared for activation when 2FA becomes available.
        </p>
      </div>
    </div>
  );
}
function Unavailable({ view }: { view: View }) {
  const labels: Record<string, [string, string]> = {
    payments: [
      "No payments yet",
      "Buyer payment history will appear here when the payment-list API becomes available.",
    ],
    reviews: [
      "No reviews yet",
      "Reviews you submit for purchased products will appear here.",
    ],
    notifications: [
      "You are all caught up",
      "Account and order notifications will appear here.",
    ],
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
      <p className="mt-2 text-sm text-[#64748b]">{text}</p>
      {action && href && (
        <Link
          href={href}
          className="mt-5 inline-block rounded-xl bg-[#f7941d] px-5 py-2.5 text-sm font-semibold text-white"
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
  icon: typeof AlertCircle;
  text: string;
  spin?: boolean;
}) {
  return (
    <p className="flex justify-center gap-2 py-10 text-sm text-[#64748b]">
      <Icon size={18} className={spin ? "animate-spin" : ""} />
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
        className="mt-2 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 font-normal outline-none focus:border-[#f7941d] disabled:opacity-60 dark:border-white/10 dark:bg-white/5"
      />
    </label>
  );
}
