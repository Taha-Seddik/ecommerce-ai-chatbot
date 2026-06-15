'use server';

import { requireUser } from '@/lib/auth/session';
import { hashPassword } from '@/lib/password';
import { updateUserAddress, updateUserProfile } from './account.repo';
import { addressSchema, profileSchema } from './account.schema';

export type AccountActionResult = { ok: true } | { ok: false; error: 'validation' };

export async function updateProfileAction(
  _prev: AccountActionResult | null,
  formData: FormData,
): Promise<AccountActionResult> {
  const session = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'validation' };
  const { firstName, lastName, telephone, password } = parsed.data;
  await updateUserProfile(session.userId, {
    firstName,
    lastName,
    telephone: telephone || undefined,
    passwordHash: password ? await hashPassword(password) : undefined,
  });
  return { ok: true };
}

export async function updateAddressAction(
  _prev: AccountActionResult | null,
  formData: FormData,
): Promise<AccountActionResult> {
  const session = await requireUser();
  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'validation' };
  await updateUserAddress(session.userId, parsed.data);
  return { ok: true };
}
