import React, { useState } from "react";
import type { CheckoutForm } from "./index";

interface ShippingProps {
  form: CheckoutForm;
  updateField: (field: keyof CheckoutForm, value: string | boolean) => void;
}

const Shipping = ({ form, updateField }: ShippingProps) => {
  const [dropdown, setDropdown] = useState(false);

  return (
    <div className="mt-4 rounded-2xl border border-[#e7ebf0] bg-white shadow-sm dark:border-white/10 dark:bg-darkTheme-card sm:mt-7.5">
      <div
        onClick={() => setDropdown(!dropdown)}
        className="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-dark dark:text-white sm:px-5.5 sm:py-5 sm:text-lg sm:font-medium"
      >
        Ship to a different address?
        <svg
          className={`fill-current ease-out duration-200 ${dropdown && "rotate-180"}`}
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.06103 7.80259C4.30813 7.51431 4.74215 7.48092 5.03044 7.72802L10.9997 12.8445L16.9689 7.72802C17.2572 7.48092 17.6912 7.51431 17.9383 7.80259C18.1854 8.09088 18.1521 8.5249 17.8638 8.772L11.4471 14.272C11.1896 14.4927 10.8097 14.4927 10.5523 14.272L4.1356 8.772C3.84731 8.5249 3.81393 8.09088 4.06103 7.80259Z"
            fill=""
          />
        </svg>
      </div>

      <div className={`border-t border-gray-3 p-4 dark:border-white/10 sm:p-6 lg:p-8.5 ${dropdown ? "block" : "hidden"}`}>
        <div className="mb-4 sm:mb-5">
          <label htmlFor="shippingCountry" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
            Country <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="shippingCountry"
            value={form.shippingCountry}
            onChange={(e) => updateField("shippingCountry", e.target.value)}
            className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
          />
        </div>

        <div className="mb-4 sm:mb-5">
          <label htmlFor="shippingStreet" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
            Delivery Address <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="shippingStreet"
            value={form.shippingStreet}
            onChange={(e) => updateField("shippingStreet", e.target.value)}
            placeholder="House number and street name"
            className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
          />
          <div className="mt-3 sm:mt-5">
            <input
              type="text"
              id="shippingStreet2"
              value={form.shippingStreet2}
              onChange={(e) => updateField("shippingStreet2", e.target.value)}
              placeholder="Apartment, suite, unit, etc. (optional)"
              className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-5 sm:grid-cols-2 sm:gap-5">
          <div className="w-full">
            <label htmlFor="shippingCity" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
              City <span className="text-red">*</span>
            </label>
            <input
              type="text"
              id="shippingCity"
              value={form.shippingCity}
              onChange={(e) => updateField("shippingCity", e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
            />
          </div>

          <div className="w-full">
            <label htmlFor="shippingRegion" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
              Region/State <span className="text-red">*</span>
            </label>
            <input
              type="text"
              id="shippingRegion"
              value={form.shippingRegion}
              onChange={(e) => updateField("shippingRegion", e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
            />
          </div>
        </div>

        <div className="mb-4 sm:mb-5">
          <label htmlFor="shippingPostalCode" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
            Postal Code
          </label>
          <input
            type="text"
            id="shippingPostalCode"
            value={form.shippingPostalCode}
            onChange={(e) => updateField("shippingPostalCode", e.target.value)}
            className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
          <div className="w-full">
            <label htmlFor="shippingPhone" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
              Phone Number <span className="text-red">*</span>
            </label>
            <input
              type="text"
              id="shippingPhone"
              value={form.shippingPhone}
              onChange={(e) => updateField("shippingPhone", e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
            />
          </div>

          <div className="w-full">
            <label htmlFor="shippingEmail" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
              Email Address <span className="text-red">*</span>
            </label>
            <input
              type="email"
              id="shippingEmail"
              value={form.shippingEmail}
              onChange={(e) => updateField("shippingEmail", e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
