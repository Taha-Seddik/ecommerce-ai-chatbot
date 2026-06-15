import { describe, expect, it } from 'vitest';
import { convertFromBase, isCurrency } from '@/lib/currency';

describe('convertFromBase', () => {
  it('keeps USD (base) unchanged', () => {
    expect(convertFromBase(10000, 'USD')).toBe(10000);
  });
  it('converts USD to EUR', () => {
    expect(convertFromBase(10000, 'EUR')).toBe(9200);
  });
});

describe('isCurrency', () => {
  it('accepts known currencies and rejects others', () => {
    expect(isCurrency('EUR')).toBe(true);
    expect(isCurrency('XXX')).toBe(false);
    expect(isCurrency(undefined)).toBe(false);
  });
});
