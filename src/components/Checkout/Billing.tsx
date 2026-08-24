import React from "react";
import type { CheckoutForm } from "./index";

interface BillingProps {
  form: CheckoutForm;
  updateField: (field: keyof CheckoutForm, value: string | boolean) => void;
}

const Billing = ({ form, updateField }: BillingProps) => {
  return (
    <div className="mt-5 sm:mt-9">
      <h2 className="mb-3 text-lg font-bold text-dark dark:text-white sm:mb-5.5 sm:text-2xl sm:font-medium">
        Delivery details
      </h2>

      <div className="rounded-2xl border border-[#e7ebf0] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-darkTheme-card sm:p-6 lg:p-8.5">
        <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-5 sm:grid-cols-2 sm:gap-5">
          <div className="w-full">
            <label htmlFor="firstName" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
              First Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="Xerin"
              className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
            />
          </div>

          <div className="w-full">
            <label htmlFor="lastName" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
              Last Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Market"
              className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
            />
          </div>
        </div>

        <div className="mb-4 sm:mb-5">
          <label htmlFor="companyName" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
            Business Name (optional)
          </label>
          <input
            type="text"
            id="companyName"
            value={form.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
          />
        </div>

        <div className="mb-4 sm:mb-5">
          <label htmlFor="country" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
            Country <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="country"
            value={form.country}
            onChange={(e) => updateField("country", e.target.value)}
            placeholder="Country"
            className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
          />
        </div>

        <div className="mb-4 sm:mb-5">
          <label htmlFor="street" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
            Delivery Address <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="street"
            value={form.street}
            onChange={(e) => updateField("street", e.target.value)}
            placeholder="House number and street name"
            className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
          />
          <div className="mt-3 sm:mt-5">
            <input
              type="text"
              id="street2"
              value={form.street2}
              onChange={(e) => updateField("street2", e.target.value)}
              placeholder="Apartment, suite, unit, etc. (optional)"
              className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-5 sm:grid-cols-2 sm:gap-5">
          <div className="w-full">
            <label htmlFor="city" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
              City <span className="text-red">*</span>
            </label>
            <input
              type="text"
              id="city"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
            />
          </div>

          <div className="w-full">
            <label htmlFor="region" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
              Region/State <span className="text-red">*</span>
            </label>
            <input
              type="text"
              id="region"
              value={form.region}
              onChange={(e) => updateField("region", e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
            />
          </div>
        </div>

        <div className="mb-4 sm:mb-5">
          <label htmlFor="postalCode" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            value={form.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
            className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
          />
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-5 sm:grid-cols-2 sm:gap-5">
          <div className="w-full">
            <label htmlFor="phone" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
              Phone Number <span className="text-red">*</span>
            </label>
            <input
              type="text"
              id="phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
            />
          </div>

          <div className="w-full">
            <label htmlFor="email" className="mb-2 block text-sm font-medium dark:text-darkTheme-body-color">
              Email Address <span className="text-red">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:border-transparent focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
