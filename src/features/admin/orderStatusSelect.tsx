'use client';

import { useRouter } from 'next/navigation';
import { type ChangeEvent, useState } from 'react';
import { ORDER_STATUSES } from '@/db/schema/enums';
import { updateOrderStatusAction } from '@/features/admin/admin.actions';

export function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, setPending] = useState(false);

  async function onChange(e: ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setValue(next);
    setPending(true);
    await updateOrderStatusAction(id, next);
    setPending(false);
    router.refresh();
  }

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={pending}
      className='border-border bg-surface focus:border-accent rounded-lg border px-2 py-1 text-sm outline-none'>
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
