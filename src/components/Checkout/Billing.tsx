import React from "react";
import type { Address, User } from "@/types/api/user";
import { Mail, MapPin, Phone, UserRound } from "lucide-react";

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
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange">
            Customer
          </p>
          <h2 className="mt-1 text-lg font-bold text-dark dark:text-white sm:text-2xl sm:font-medium">
            Customer details
          </h2>
        </div>
        <a
          href="/account"
          className="text-xs font-semibold text-orange hover:underline"
        >
          Edit profile
        </a>
      </div>

      <div className="rounded-2xl border border-[#e7ebf0] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-darkTheme-card sm:p-6">
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
            <div className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail icon={<UserRound size={16} />} label="Customer" value={customerName} />
            <Detail icon={<Mail size={16} />} label="Email" value={email} />
            <Detail icon={<Phone size={16} />} label="Phone" value={phone} />
            <Detail
              icon={<MapPin size={16} />}
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

        <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-500 dark:bg-white/5 dark:text-white/60">
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
    <div className="min-w-0 rounded-xl border border-slate-200 p-3 dark:border-white/10">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 text-orange">{icon}</span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-semibold text-dark dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetails;
