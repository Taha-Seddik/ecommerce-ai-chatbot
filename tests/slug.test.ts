import { describe, expect, it } from 'vitest';
import { slugify } from '@/lib/slug';

describe('slugify', () => {
  it('lowercases and dasherizes', () => {
    expect(slugify('Haven 3-Seater Sofa')).toBe('haven-3-seater-sofa');
  });
  it('strips accents', () => {
    expect(slugify('Canapé Lumé')).toBe('canape-lume');
  });
  it('falls back for empty input', () => {
    expect(slugify('!!!')).toBe('item');
  });
});
