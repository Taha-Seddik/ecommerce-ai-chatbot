import { createId } from '@paralleldrive/cuid2';

/** Human-ish, collision-resistant order reference, e.g. NRD-Q7F2K9AB. */
export function makeOrderRef(): string {
  return `NRD-${createId().slice(0, 8).toUpperCase()}`;
}
