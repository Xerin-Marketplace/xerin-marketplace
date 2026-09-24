"use client";

import React from "react";
import { useCurrency } from "@/app/context/CurrencyContext";

export default function CurrencySelector({ compact = false }: { compact?: boolean }) {
 const { currencies, selectedCurrency, setSelectedCurrency, isLoading } = useCurrency();

 return (
 <label className={`inline-flex items-center gap-1.5 ${compact ? "" : "rounded-lg border border-border bg-muted/60 px-3 py-2 transition-colors hover:border-primary dark:hover:border-primary"}`}>
 {!compact ? <span className="text-xs font-medium text-muted-foreground">Currency</span> : null}
 <select
 aria-label="Display currency"
 value={selectedCurrency}
 disabled={isLoading}
 onChange={(event) => setSelectedCurrency(event.target.value)}
 className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer"
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
