import { describe, expect, it } from 'vitest';
import { discountedCents, formatPrice } from '@/lib/money';

describe('discountedCents', () => {
  it('applies a whole-percent discount', () => {
    expect(discountedCents(10000, 20)).toBe(8000);
  });
  it('returns the price unchanged with no discount', () => {
    expect(discountedCents(10000, 0)).toBe(10000);
  });
});

describe('formatPrice', () => {
  it('formats USD for en', () => {
    expect(formatPrice(189900, 'USD', 'en')).toBe('$1,899.00');
  });
});
