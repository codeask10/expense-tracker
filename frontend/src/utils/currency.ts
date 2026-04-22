const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Convert paise → formatted ₹ string */
export function formatRupees(paise: number): string {
  return formatter.format(paise / 100);
}

/** Convert rupee input → paise integer */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Convert paise → rupees (for display in inputs) */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}
