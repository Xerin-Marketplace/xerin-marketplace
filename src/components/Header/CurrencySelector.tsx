"use client";

import React, { useMemo } from "react";
import { useCurrency } from "@/app/context/CurrencyContext";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

export default function CurrencySelector({ compact = false }: { compact?: boolean }) {
 const { currencies, selectedCurrency, setSelectedCurrency, isLoading } = useCurrency();

 const active = useMemo(
 () => currencies.find((currency) => currency.code === selectedCurrency),
 [currencies, selectedCurrency],
 );

 return (
 <label
 className={`group relative inline-flex items-center gap-1.5 ${
 compact
 ? ""
 : "rounded-lg border border-border bg-muted/60 px-3 py-2 transition-colors hover:border-primary dark:hover:border-primary"
 }`}
 >
 {!compact ? (
 <span className="text-xs font-medium text-muted-foreground">Currency</span>
 ) : null}

 <span className="pointer-events-none inline-flex items-center gap-1 text-xs font-semibold text-foreground">
 {active?.symbol && active.symbol !== active.code ? (
 <span className="text-muted-foreground">{active.symbol}</span>
 ) : null}
 {selectedCurrency}
 <HugeiconsIcon
 icon={ArrowDown01Icon}
 className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-y-px"
 aria-hidden
 />
 </span>

 <select
 aria-label="Display currency"
 value={selectedCurrency}
 disabled={isLoading}
 onChange={(event) => setSelectedCurrency(event.target.value)}
 className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0 disabled:cursor-wait"
 >
 {currencies.map((currency) => (
 <option key={currency.code} value={currency.code} className="text-foreground">
 {currency.code}
 {currency.symbol && currency.symbol !== currency.code ? ` · ${currency.symbol}` : ""}
 {currency.name ? ` — ${currency.name}` : ""}
 </option>
 ))}
 </select>
 </label>
 );
}
