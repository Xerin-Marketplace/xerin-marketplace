import React, { useState } from "react";
import Image from "next/image";

const ShippingMethod = () => {
  const [shippingMethod, setShippingMethod] = useState("free");
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
                type="checkbox"
                name="free"
                id="free"
                className="sr-only"
                onChange={() => setShippingMethod("free")}
              />
              {/* selectShipping === 'free' ? 'border-4 border-blue' : 'border border-gray-4' */}
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  shippingMethod === "free"
                    ? "border-4 border-blue"
                    : "border border-gray-4 dark:border-darkTheme-border-color"
                }`}
              ></div>
            </div>
            Free Shipping
          </label>

          <label
            htmlFor="fedex"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="fedex"
                id="fedex"
                className="sr-only"
                onChange={() => setShippingMethod("fedex")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  shippingMethod === "fedex"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div className="rounded-md border-[0.5px] border-gray-4 dark:border-darkTheme-border-color py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 dark:hover:bg-darkTheme-secondary-bg hover:border-transparent hover:shadow-none">
              <div className="flex items-center">
                <div className="pr-4">
                  <Image
                    src="/images/checkout/fedex.svg"
                    alt="fedex"
                    width={64}
                    height={18}
                  />
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
                type="checkbox"
                name="dhl"
                id="dhl"
                className="sr-only"
                onChange={() => setShippingMethod("dhl")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  shippingMethod === "dhl"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div className="rounded-md border-[0.5px] border-gray-4 dark:border-darkTheme-border-color py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 dark:hover:bg-darkTheme-secondary-bg hover:border-transparent hover:shadow-none">
              <div className="flex items-center">
                <div className="pr-4">
                  <Image
                    src="/images/checkout/dhl.svg"
                    alt="dhl"
                    width={64}
                    height={20}
                  />
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
