const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY = "USD";

export function formatPrice(
  cents: number,
  options?: {
    locale?: string;
    showCurrency?: boolean;
  },
) {
  const locale = options?.locale ?? DEFAULT_LOCALE;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    currencyDisplay: options?.showCurrency === false ? "code" : "symbol",
  }).format(cents / 100);
}

export function formatPriceNumber(cents: number) {
  return (cents / 100).toFixed(2);
}

export function toCents(value: string | number) {
  if (typeof value === "string") {
    return Math.round(parseFloat(value) * 100);
  }

  return Math.round(value * 100);
}
