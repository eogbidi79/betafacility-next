export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(amount: number): string {
  return naira.format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value);
}
