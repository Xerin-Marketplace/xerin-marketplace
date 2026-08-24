export const DEFAULT_CURRENCY = "TZS";

export function formatCurrency(
  amount: number | string | null | undefined,
  currency = DEFAULT_CURRENCY,
) {
  const value = typeof amount === "string" ? Number(amount) : amount ?? 0;
  const normalizedCurrency = (currency || DEFAULT_CURRENCY).toUpperCase();

  // TZS is normally presented without fractional units.
  // Foreign display currencies keep up to 3 decimal places so FX conversions
  // such as TZS 2,856 -> USD 2.856 are not rounded to a whole dollar.
  const maximumFractionDigits = normalizedCurrency === "TZS" ? 0 : 3;

  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: normalizedCurrency,
    currencyDisplay: normalizedCurrency === "TZS" ? "narrowSymbol" : "symbol",
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}
