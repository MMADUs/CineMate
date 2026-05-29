export const TAX_RATE = 0.11;

export function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

export function calculateTaxedTotal(subtotal: number) {
  // tax amount
  const taxAmount = Math.round(subtotal * TAX_RATE);
  // total amount
  const totalAmount = subtotal + taxAmount;

  return {
    taxAmount: String(taxAmount),
    totalAmount: String(totalAmount),
  };
}
