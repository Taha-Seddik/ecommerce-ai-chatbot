'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { updateProfileAction } from './account.actions';

const inputClass =
  'border-border bg-surface focus:border-accent h-11 w-full rounded-lg border px-3 text-sm transition-colors outline-none';

export function ProfileForm({ defaults }: { defaults: { firstName: string; lastName: string; telephone: string } }) {
  const t = useTranslations('account');
  const [state, action, pending] = useActionState(updateProfileAction, null);

  return (
    <form action={action} className='flex max-w-md flex-col gap-4'>
      <div className='grid grid-cols-2 gap-3'>
        <label className='flex flex-col gap-1.5 text-sm font-medium'>
          {t('firstName')}
          <input name='firstName' defaultValue={defaults.firstName} required className={inputClass} />
        </label>
        <label className='flex flex-col gap-1.5 text-sm font-medium'>
          {t('lastName')}
          <input name='lastName' defaultValue={defaults.lastName} required className={inputClass} />
        </label>
      </div>
      <label className='flex flex-col gap-1.5 text-sm font-medium'>
        {t('phone')}
        <input name='telephone' defaultValue={defaults.telephone} className={inputClass} />
      </label>
      <label className='flex flex-col gap-1.5 text-sm font-medium'>
        {t('newPassword')}
        <input name='password' type='password' autoComplete='new-password' minLength={8} className={inputClass} />
      </label>

      {state?.ok && <p className='text-success text-sm'>{t('saved')}</p>}
      {state && !state.ok && <p className='text-danger text-sm'>{t('saveError')}</p>}

      <Button type='submit' variant='primary' size='lg' isDisabled={pending} className='mt-2 w-fit'>
        {t('save')}
      </Button>
    </form>
  );
}
