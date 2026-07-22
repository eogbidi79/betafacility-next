const LOCALE: Record<string, string> = { NGN: "en-NG", CAD: "en-CA" };

/** Format a whole-number amount in its listing currency (NGN or CAD). */
export function formatMoney(amount: number, currency = "NGN"): string {
  try {
    return new Intl.NumberFormat(LOCALE[currency] ?? "en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    const symbol = currency === "CAD" ? "CA$" : "₦";
    return `${symbol}${amount.toLocaleString()}`;
  }
}
