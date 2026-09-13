"use client";

import React from "react";
import { useCurrency } from "@/app/context/CurrencyContext";

export default function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { currencies, selectedCurrency, setSelectedCurrency, isLoading } = useCurrency();

  return (
    <label className={`inline-flex items-center gap-1.5 ${compact ? "" : "rounded-[10px] border border-gray-3 bg-gray-1/60 px-3 py-2 transition-colors hover:border-orange dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg dark:hover:border-orange"}`}>
      {!compact ? <span className="text-xs font-medium text-dark-4 dark:text-darkTheme-body-color">Currency</span> : null}
      <select
        aria-label="Display currency"
        value={selectedCurrency}
        disabled={isLoading}
        onChange={(event) => setSelectedCurrency(event.target.value)}
        className="bg-transparent text-xs font-semibold text-dark outline-none cursor-pointer dark:text-white"
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code}
          </option>
        ))}
      </select>
    </label>
  );
}
