import React from "react";
import type { Address, User } from "@/types/api/user";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, Location01Icon, Call02Icon, UserIcon } from "@hugeicons/core-free-icons";

type CustomerDetailsProps = {
 profile?: User;
 selectedAddress?: Address;
 isLoading?: boolean;
};

const CustomerDetails = ({
 profile,
 selectedAddress,
 isLoading = false,
}: CustomerDetailsProps) => {
 const customerName =
 profile?.full_name?.trim() ||
 [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
 selectedAddress?.recipient_name ||
 "Customer";

 const phone = profile?.phone || selectedAddress?.recipient_phone || "Not configured";
 const email = profile?.email || "Not configured";

 return (
 <section className="mt-5 sm:mt-9">
 <div className="mb-3 flex items-center justify-between gap-3 sm:mb-5.5">
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
 Customer
 </p>
 <h2 className="mt-1 text-lg font-bold text-foreground sm:text-2xl sm:font-medium">
 Customer details
 </h2>
 </div>
 <a
 href="/account"
 className="text-xs font-semibold text-primary hover:underline"
 >
 Edit profile
 </a>
 </div>

 <div>
 {isLoading ? (
 <div className="grid gap-3 sm:grid-cols-2">
 <div className="h-14 animate-pulse rounded-xl bg-muted dark:bg-muted" />
 <div className="h-14 animate-pulse rounded-xl bg-muted dark:bg-muted" />
 </div>
 ) : (
 <div className="grid gap-3 sm:grid-cols-2">
 <Detail icon={<HugeiconsIcon icon={UserIcon} size={16} />} label="Customer" value={customerName} />
 <Detail icon={<HugeiconsIcon icon={Mail01Icon} size={16} />} label="Email" value={email} />
 <Detail icon={<HugeiconsIcon icon={Call02Icon} size={16} />} label="Phone" value={phone} />
 <Detail
 icon={<HugeiconsIcon icon={Location01Icon} size={16} />}
 label="Delivery address"
 value={
 selectedAddress
 ? selectedAddress.formatted_address ||
 [
 selectedAddress.street,
 selectedAddress.city,
 selectedAddress.region,
 selectedAddress.country,
 ]
 .filter(Boolean)
 .join(", ")
 : "Select a delivery address above"
 }
 />
 </div>
 )}

 <p className="mt-4 rounded-xl bg-muted px-3 py-2.5 text-xs leading-5 text-muted-foreground dark:bg-muted">
 Customer identity is loaded from your Xerin profile. Delivery country,
 city, region, street, postal information and Google coordinates come
 from the confirmed saved address selected above, so you do not need to
 enter them again during checkout.
 </p>
 </div>
 </section>
 );
};

function Detail({
 icon,
 label,
 value,
}: {
 icon: React.ReactNode;
 label: string;
 value: string;
}) {
 return (
 <div className="min-w-0 rounded-xl p-3">
 <div className="flex items-start gap-2.5">
 <span className="mt-0.5 text-primary">{icon}</span>
 <div className="min-w-0">
 <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
 {label}
 </p>
 <p className="mt-1 break-words text-sm font-semibold text-foreground">
 {value}
 </p>
 </div>
 </div>
 </div>
 );
}

export default CustomerDetails;
