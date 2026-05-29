import { calculateTaxedTotal, toNumber } from './money';

describe('money utilities', () => {
  it('converts numeric strings to numbers', () => {
    expect(toNumber('45000')).toBe(45000);
    expect(toNumber(45000)).toBe(45000);
  });

  it('calculates 11 percent tax and total as strings', () => {
    expect(calculateTaxedTotal(100000)).toEqual({
      taxAmount: '11000',
      totalAmount: '111000',
    });
  });
});
