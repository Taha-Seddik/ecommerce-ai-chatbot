import { describe, expect, it } from 'vitest';
import { makeOrderRef } from '@/lib/orderRef';

describe('makeOrderRef', () => {
  it('produces a prefixed, unique reference', () => {
    const a = makeOrderRef();
    const b = makeOrderRef();
    expect(a).toMatch(/^NRD-[A-Z0-9]{8}$/);
    expect(a).not.toBe(b);
  });
});
