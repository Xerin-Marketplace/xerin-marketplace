"use client";

import React, { useState } from "react";
import { useApplyCoupon } from "@/hooks/useCartActions";

const Coupon = () => {
  const [code, setCode] = useState("");
  const applyCoupon = useApplyCoupon();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    applyCoupon.mutate(code.trim());
  };

  return (
    <div className="mt-4 rounded-2xl border border-[#e7ebf0] bg-white shadow-sm dark:border-white/10 dark:bg-darkTheme-card sm:mt-7.5">
      <div className="border-b border-gray-3 px-4 py-4 dark:border-darkTheme-border-color sm:px-6 sm:py-5">
        <h3 className="text-base font-bold text-dark dark:text-white sm:text-xl sm:font-medium">Have any Coupon Code?</h3>
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <input
            type="text"
            name="coupon"
            id="coupon"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter coupon code"
            className="h-12 w-full rounded-xl border border-gray-3 bg-gray-1 px-4 text-base outline-none duration-200 placeholder:text-dark-4 focus:ring-2 focus:ring-orange/25 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color dark:placeholder:text-darkTheme-secondary-muted sm:text-sm"
          />

          <button
            type="submit"
            disabled={applyCoupon.isPending || !code.trim()}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-blue px-6 font-semibold text-white duration-200 hover:bg-blue-dark disabled:opacity-50 sm:w-auto"
          >
            {applyCoupon.isPending ? "Applying..." : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coupon;
