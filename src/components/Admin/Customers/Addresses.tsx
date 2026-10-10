"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { customersService, type CustomerAddress } from "@/lib/api/endpoints/customers";
import { ApiError } from "@/lib/api/client";
import Link from "next/link";

const getErrorMessage = (error: unknown) => {
 if (error instanceof ApiError) return error.message;
 if (error instanceof Error) return error.message;
 return "We couldn't load this information. Please refresh the page or try again later.";
};

const AdminCustomerAddresses = () => {
 const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");

 const fetchData = async () => {
 setLoading(true);
 try {
 const data = await customersService.listAllAddresses();
 setAddresses(data);
 } catch (error) {
 if (error instanceof ApiError && error.status === 401) return;
 toast.error(getErrorMessage(error));
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 void fetchData();
 }, []);

 const filtered = addresses.filter((a) =>
 [a.country, a.region, a.city, a.street, a.label].some((f) =>
 f?.toLowerCase().includes(search.toLowerCase())
 )
 );

 const total = addresses.length;
 const defaultShipping = addresses.filter((a) => a.is_default_shipping).length;
 const defaultBilling = addresses.filter((a) => a.is_default_billing).length;
 const countries = new Set(addresses.map((a) => a.country)).size;

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
 <SummaryCard label="Total Addresses" value={total} />
 <SummaryCard label="Default Shipping" value={defaultShipping} />
 <SummaryCard label="Default Billing" value={defaultBilling} />
 <SummaryCard label="Countries" value={countries} />
 </div>

 <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
 <div className="mb-4">
 <input
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Search addresses..."
 className="rounded-xl border border-border bg-muted px-4 py-2 text-sm text-accent-foreground"
 />
 </div>

 {loading ? (
 <div className="py-8 text-center text-muted-foreground">Loading addresses...</div>
 ) : filtered.length === 0 ? (
 <div className="py-8 text-center text-muted-foreground">No addresses found.</div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead className="bg-muted">
 <tr>
 <th className="px-4 py-3 text-sm font-medium text-accent-foreground">Customer</th>
 <th className="px-4 py-3 text-sm font-medium text-accent-foreground">Label</th>
 <th className="px-4 py-3 text-sm font-medium text-accent-foreground">Country</th>
 <th className="px-4 py-3 text-sm font-medium text-accent-foreground">Region</th>
 <th className="px-4 py-3 text-sm font-medium text-accent-foreground">City</th>
 <th className="px-4 py-3 text-sm font-medium text-accent-foreground">Default</th>
 <th className="px-4 py-3 text-sm font-medium text-accent-foreground">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {filtered.map((a) => (
 <tr key={a.id} className="hover:bg-muted">
 <td className="px-4 py-3 text-sm font-medium text-foreground">
 {a.user_id ? <Link href={`/admin/customers/${a.user_id}`} className="hover:text-primary hover:underline">{a.customer_name ?? "View customer"}</Link> : a.customer_name ?? "-"}
 </td>
 <td className="px-4 py-3 text-sm text-muted-foreground">{a.label ?? "-"}</td>
 <td className="px-4 py-3 text-sm text-muted-foreground">{a.country}</td>
 <td className="px-4 py-3 text-sm text-muted-foreground">{a.region}</td>
 <td className="px-4 py-3 text-sm text-muted-foreground">{a.city}</td>
 <td className="px-4 py-3 text-sm text-muted-foreground">
 {a.is_default ? "Default" : a.is_default_shipping ? "Shipping" : a.is_default_billing ? "Billing" : "No"}
 </td>
 <td className="px-4 py-3 text-sm">
 <div className="flex gap-1">
 {a.user_id ? <Link href={`/admin/customers/${a.user_id}`} className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/15">View customer</Link> : null}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
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

export default AdminCustomerAddresses;
