import React from "react";
import Image from "next/image";

interface PaymentMethodProps {
  selected: string;
  onChange: (value: string) => void;
}

const PaymentMethod = ({ selected, onChange }: PaymentMethodProps) => {
  return (
    <div className="bg-white dark:bg-darkTheme-card shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 dark:border-darkTheme-border-color py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark dark:text-white">Payment Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          {[
            { id: "cash", label: "Cash on delivery", icon: "/images/checkout/cash.svg", width: 21, height: 21 },
            { id: "bank", label: "Direct bank transfer", icon: "/images/checkout/bank.svg", width: 29, height: 12 },
            { id: "paypal", label: "PayPal", icon: "/images/checkout/paypal.svg", width: 75, height: 20 },
          ].map((method) => (
            <label
              key={method.id}
              htmlFor={method.id}
              className="flex cursor-pointer select-none items-center gap-4"
            >
              <div className="relative">
                <input
                  type="radio"
                  name="payment"
                  id={method.id}
                  className="sr-only"
                  checked={selected === method.id}
                  onChange={() => onChange(method.id)}
                />
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    selected === method.id
                      ? "border-4 border-blue"
                      : "border border-gray-4"
                  }`}
                />
              </div>

              <div
                className={`rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 dark:hover:bg-darkTheme-tertiary-bg hover:border-transparent hover:shadow-none min-w-[240px] ${
                  selected === method.id
                    ? "border-transparent bg-gray-2 dark:bg-darkTheme-secondary-bg"
                    : "border-gray-4 dark:border-darkTheme-border-color shadow-1"
                }`}
              >
                <div className="flex items-center">
                  <div className="pr-2.5">
                    <Image src={method.icon} alt={method.id} width={method.width} height={method.height} />
                  </div>
                  <div className="border-l border-gray-4 dark:border-darkTheme-border-color pl-2.5">
                    <p className="dark:text-darkTheme-body-color">{method.label}</p>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
