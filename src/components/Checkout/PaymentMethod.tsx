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
 <section className="mt-4 rounded-xl border border-border bg-card shadow-sm dark:border-border sm:mt-7.5">
 <div className="border-b border-border px-4 py-4 dark:border-border sm:px-6 sm:py-5">
 <h3 className="font-bold text-foreground">
 Payment Method
 </h3>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 Choose Mobile Payment or Card Payment. Cash on Delivery only appears
 when the selected logistics service is eligible.
 </p>
 </div>

 <div className="p-4 sm:p-6">
 {isLoading ? (
 <p className="text-muted-foreground">Loading payment options…</p>
 ) : options.length ? (
 <div className="space-y-3">
 {options.map((method) => {
 const Icon = iconFor(method.id);
 return (
 <label
 key={method.id}
 className={`flex min-h-[76px] cursor-pointer items-start gap-3 rounded-xl border p-3 transition sm:p-4 ${
 selected === method.id
 ? "border-primary bg-primary/5"
 : "border-border dark:border-border"
 }`}
 >
 <input
 type="radio"
 name="payment"
 checked={selected === method.id}
 onChange={() => onChange(method.id)}
 className="mt-1 accent-orange"
 />
 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
 <HugeiconsIcon icon={Icon} size={17} />
 </span>
 <span>
 <span className="font-semibold text-foreground">
 {method.label}
 </span>
 <span className="mt-1 block text-xs leading-5 text-muted-foreground">
 {method.id === "cash_on_delivery"
 ? "Pay when the logistics company delivers your local order."
 : method.id === "mobile_money"
 ? "Pay securely using your preferred mobile network through Selcom."
 : "Pay securely using Visa or Mastercard through the protected card checkout."}
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
 className="mt-2 h-12 w-full rounded-xl border border-border bg-card px-3 text-base dark:border-border dark:bg-muted sm:text-sm"
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
 className="mt-2 h-12 w-full rounded-xl border border-border bg-card px-3 text-base dark:border-border dark:bg-muted sm:text-sm"
 />
 </label>
 </div>
 )}

 {selected === "card" && (
 <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
 <div className="flex items-center gap-2 font-semibold">
 <HugeiconsIcon icon={ShieldCheckIcon} size={16} />
 Secure Card Payment
 </div>
 <div className="mt-3 flex flex-wrap gap-2">
 <span className="rounded-lg border border-primary-200 bg-card px-3 py-2 font-bold tracking-wide text-primary-900 dark:border-border dark:bg-muted">VISA</span>
 <span className="rounded-lg border border-primary-200 bg-card px-3 py-2 font-bold tracking-wide text-primary-900 dark:border-border dark:bg-muted">Mastercard</span>
 </div>
 <p className="mt-3 text-xs leading-5">
 After you place the order, Xerin redirects you to Selcom Secure Checkout to enter your Visa or Mastercard details. Card number and CVV never pass through or get stored by Xerin.
 </p>
 </div>
 )}

 {selected === "cash_on_delivery" && (
 <div className="flex items-start gap-2 rounded-xl border border-green-light-4 bg-green-light-6 p-4 text-xs leading-5 text-emerald-800">
 <HugeiconsIcon icon={ShieldCheckIcon} size={15} className="mt-0.5 shrink-0" />
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
