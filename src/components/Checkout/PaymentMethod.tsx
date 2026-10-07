import type { PaymentOption } from "@/types/api/commerce";
import { HugeiconsIcon } from "@hugeicons/react";
import { Money03Icon, CreditCardIcon, ShieldCheckIcon, SmartPhone01Icon } from "@hugeicons/core-free-icons";

interface PaymentMethodProps {
 options: PaymentOption[];
 selected: string;
 onChange: (value: string) => void;
 isLoading?: boolean;
 provider: string;
 phoneNumber: string;
 onProviderChange: (value: string) => void;
 onPhoneNumberChange: (value: string) => void;
}

const iconFor = (method: string) => {
 if (method === "mobile_money") return SmartPhone01Icon;
 if (method === "cash_on_delivery") return Money03Icon;
 return CreditCardIcon;
};

const PaymentMethod = ({
 options,
 selected,
 onChange,
 isLoading,
 provider,
 phoneNumber,
 onProviderChange,
 onPhoneNumberChange,
}: PaymentMethodProps) => {
 const selectedOption = options.find((item) => item.id === selected);

 return (
 <section>

 <div>
 {isLoading ? (
 <p className="text-muted-foreground">Loading payment options…</p>
 ) : options.length ? (
 <div className="space-y-3">
 {options.map((method) => {
 const Icon = iconFor(method.id);
 const disabled = method.id === "card";
 return (
 <label
 key={method.id}
 className={`flex min-h-[76px] items-start gap-3 rounded-xl p-3 transition sm:p-4 ${
 disabled
 ? "cursor-not-allowed bg-muted opacity-60"
 : selected === method.id
 ? "cursor-pointer bg-primary/10"
 : "cursor-pointer bg-muted"
 }`}
 >
 <input
 type="radio"
 name="payment"
 checked={selected === method.id}
 disabled={disabled}
 onChange={() => onChange(method.id)}
 className="mt-1 accent-orange disabled:cursor-not-allowed"
 />
 <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted-foreground/10 text-muted-foreground">
 <HugeiconsIcon icon={Icon} size={17} />
 </span>
 <span className="min-w-0">
 <span className="flex items-center gap-2 font-semibold text-foreground">
 {method.label}
 {disabled && (
 <span className="rounded-md bg-muted-foreground/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
 Coming soon
 </span>
 )}
 </span>
 <span className="mt-1 block text-xs leading-5 text-muted-foreground">
 {method.id === "cash_on_delivery"
 ? "Pay when the logistics company delivers your local order."
 : method.id === "mobile_money"
 ? "Pay securely using your preferred mobile network through Selcom."
 : "Visa and Mastercard payments are not available yet."}
 </span>
 </span>
 </label>
 );
 })}

 {selectedOption?.requires_phone && (
 <div className="mt-4 grid gap-3 rounded-xl bg-muted p-3 sm:grid-cols-2 sm:p-4 dark:bg-muted">
 <label className="text-sm font-medium text-foreground">
 Mobile network
 <select
 value={provider}
 onChange={(event) =>
 onProviderChange(event.target.value)
 }
 className="mt-2 h-12 w-full rounded-xl bg-muted px-3 text-base dark:bg-muted sm:text-sm"
 >
 <option value="">Select network</option>
 {selectedOption.providers.map((name) => (
 <option key={name} value={name}>
 {name}
 </option>
 ))}
 </select>
 </label>

 <label className="text-sm font-medium text-foreground">
 Mobile number
 <input
 type="tel"
 value={phoneNumber}
 onChange={(event) =>
 onPhoneNumberChange(event.target.value)
 }
 placeholder="+255 7XX XXX XXX"
 className="mt-2 h-12 w-full rounded-xl bg-muted px-3 text-base dark:bg-muted sm:text-sm"
 />
 </label>
 </div>
 )}

 {selected === "card" && (
 <div className="mt-4 rounded-xl bg-primary/5 p-4 text-sm text-foreground">
 <div className="font-semibold">
 Secure Card Payment
 </div>
 <div className="mt-3 flex flex-wrap gap-2">
 <span className="rounded-lg bg-muted px-3 py-2 font-bold tracking-wide text-primary-900 dark:bg-muted">VISA</span>
 <span className="rounded-lg bg-muted px-3 py-2 font-bold tracking-wide text-primary-900 dark:bg-muted">Mastercard</span>
 </div>
 <p className="mt-3 text-xs leading-5">
 After you place the order, Xerin redirects you to Selcom Secure Checkout to enter your Visa or Mastercard details. Card number and CVV never pass through or get stored by Xerin.
 </p>
 </div>
 )}

 {selected === "cash_on_delivery" && (
 <div className="flex items-start gap-2 rounded-xl bg-green-light-6 p-4 text-xs leading-5 text-emerald-800">

 No digital escrow is created until money is actually collected.
 Xerin still records the COD payment and fulfilment state.
 </div>
 )}
 </div>
 ) : (
 <p className="text-red">No payment method is currently enabled.</p>
 )}
 </div>
 </section>
 );
};

export default PaymentMethod;
