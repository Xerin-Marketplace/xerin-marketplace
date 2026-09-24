import React, { useState } from "react";
import type { CheckoutForm } from "./index";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckIcon } from "@hugeicons/core-free-icons";

interface ShippingProps {
 form: CheckoutForm;
 updateField: (field: keyof CheckoutForm, value: string | boolean) => void;
}

const Shipping = ({ form, updateField }: ShippingProps) => {
 const [dropdown, setDropdown] = useState(false);

 return (
 <div className="mt-4 rounded-xl border border-border bg-card shadow-sm dark:border-border sm:mt-7.5">
 <div
 onClick={() => setDropdown(!dropdown)}
 className="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-foreground sm:px-5.5 sm:py-5 sm:text-lg sm:font-medium"
 >
 Ship to a different address?
 <HugeiconsIcon icon={CheckIcon} size={22} />
 </div>

 <div className={`border-t border-border p-4 dark:border-border sm:p-6 lg:p-8.5 ${dropdown ? "block" : "hidden"}`}>
 <div className="mb-4 sm:mb-5">
 <label htmlFor="shippingCountry" className="mb-2 block text-sm font-medium">
 Country <span className="text-red">*</span>
 </label>
 <input
 type="text"
 id="shippingCountry"
 value={form.shippingCountry}
 onChange={(e) => updateField("shippingCountry", e.target.value)}
 className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-base outline-none duration-200 placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring/30 sm:text-sm"
 />
 </div>

 <div className="mb-4 sm:mb-5">
 <label htmlFor="shippingStreet" className="mb-2 block text-sm font-medium">
 Delivery Address <span className="text-red">*</span>
 </label>
 <input
 type="text"
 id="shippingStreet"
 value={form.shippingStreet}
 onChange={(e) => updateField("shippingStreet", e.target.value)}
 placeholder="House number and street name"
 className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-base outline-none duration-200 placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring/30 sm:text-sm"
 />
 <div className="mt-3 sm:mt-5">
 <input
 type="text"
 id="shippingStreet2"
 value={form.shippingStreet2}
 onChange={(e) => updateField("shippingStreet2", e.target.value)}
 placeholder="Apartment, suite, unit, etc. (optional)"
 className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-base outline-none duration-200 placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring/30 sm:text-sm"
 />
 </div>
 </div>

 <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-5 sm:grid-cols-2 sm:gap-5">
 <div className="w-full">
 <label htmlFor="shippingCity" className="mb-2 block text-sm font-medium">
 City <span className="text-red">*</span>
 </label>
 <input
 type="text"
 id="shippingCity"
 value={form.shippingCity}
 onChange={(e) => updateField("shippingCity", e.target.value)}
 className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-base outline-none duration-200 placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring/30 sm:text-sm"
 />
 </div>

 <div className="w-full">
 <label htmlFor="shippingRegion" className="mb-2 block text-sm font-medium">
 Region/State <span className="text-red">*</span>
 </label>
 <input
 type="text"
 id="shippingRegion"
 value={form.shippingRegion}
 onChange={(e) => updateField("shippingRegion", e.target.value)}
 className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-base outline-none duration-200 placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring/30 sm:text-sm"
 />
 </div>
 </div>

 <div className="mb-4 sm:mb-5">
 <label htmlFor="shippingPostalCode" className="mb-2 block text-sm font-medium">
 Postal Code
 </label>
 <input
 type="text"
 id="shippingPostalCode"
 value={form.shippingPostalCode}
 onChange={(e) => updateField("shippingPostalCode", e.target.value)}
 className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-base outline-none duration-200 placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring/30 sm:text-sm"
 />
 </div>

 <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
 <div className="w-full">
 <label htmlFor="shippingPhone" className="mb-2 block text-sm font-medium">
 Phone Number <span className="text-red">*</span>
 </label>
 <input
 type="text"
 id="shippingPhone"
 value={form.shippingPhone}
 onChange={(e) => updateField("shippingPhone", e.target.value)}
 className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-base outline-none duration-200 placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring/30 sm:text-sm"
 />
 </div>

 <div className="w-full">
 <label htmlFor="shippingEmail" className="mb-2 block text-sm font-medium">
 Email Address <span className="text-red">*</span>
 </label>
 <input
 type="email"
 id="shippingEmail"
 value={form.shippingEmail}
 onChange={(e) => updateField("shippingEmail", e.target.value)}
 className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-base outline-none duration-200 placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring/30 sm:text-sm"
 />
 </div>
 </div>
 </div>
 </div>
 );
};

export default Shipping;
