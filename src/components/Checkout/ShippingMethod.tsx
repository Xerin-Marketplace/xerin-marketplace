import React from "react";
import Image from "next/image";

interface ShippingMethodProps {
  selected: string;
  onChange: (value: string) => void;
}

const ShippingMethod = ({ selected, onChange }: ShippingMethodProps) => {
  return (
    <div className="bg-white dark:bg-darkTheme-card shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 dark:border-darkTheme-border-color py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark dark:text-white">Shipping Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-4">
          <label
            htmlFor="free"
            className="flex cursor-pointer select-none items-center gap-3.5 dark:text-darkTheme-body-color"
          >
            <div className="relative">
              <input
                type="radio"
                name="shipping"
                id="free"
                className="sr-only"
                checked={selected === "free"}
                onChange={() => onChange("free")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  selected === "free"
                    ? "border-4 border-blue"
                    : "border border-gray-4 dark:border-darkTheme-border-color"
                }`}
              />
            </div>
            Free Shipping
          </label>

          <label
            htmlFor="fedex"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="radio"
                name="shipping"
                id="fedex"
                className="sr-only"
                checked={selected === "fedex"}
                onChange={() => onChange("fedex")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  selected === "fedex"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              />
            </div>

            <div className="rounded-md border-[0.5px] border-gray-4 dark:border-darkTheme-border-color py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 dark:hover:bg-darkTheme-secondary-bg hover:border-transparent hover:shadow-none">
              <div className="flex items-center">
                <div className="pr-4">
                  <Image src="/images/checkout/fedex.svg" alt="fedex" width={64} height={18} />
                </div>
                <div className="border-l border-gray-4 dark:border-darkTheme-border-color pl-4">
                  <p className="font-semibold text-dark dark:text-white">$10.99</p>
                  <p className="text-custom-xs dark:text-darkTheme-secondary-muted">Standard Shipping</p>
                </div>
              </div>
            </div>
          </label>

          <label
            htmlFor="dhl"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="radio"
                name="shipping"
                id="dhl"
                className="sr-only"
                checked={selected === "dhl"}
                onChange={() => onChange("dhl")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  selected === "dhl"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              />
            </div>

            <div className="rounded-md border-[0.5px] border-gray-4 dark:border-darkTheme-border-color py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 dark:hover:bg-darkTheme-secondary-bg hover:border-transparent hover:shadow-none">
              <div className="flex items-center">
                <div className="pr-4">
                  <Image src="/images/checkout/dhl.svg" alt="dhl" width={64} height={20} />
                </div>
                <div className="border-l border-gray-4 dark:border-darkTheme-border-color pl-4">
                  <p className="font-semibold text-dark dark:text-white">$12.50</p>
                  <p className="text-custom-xs dark:text-darkTheme-secondary-muted">Standard Shipping</p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ShippingMethod;
