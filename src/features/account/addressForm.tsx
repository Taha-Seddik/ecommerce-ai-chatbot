'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { updateAddressAction } from './account.actions';

const inputClass =
  'border-border bg-surface focus:border-accent h-11 w-full rounded-lg border px-3 text-sm transition-colors outline-none';

export function AddressForm({
  defaults,
}: {
  defaults: { adresse: string; city: string; zipCode: string; telephone: string };
}) {
  const t = useTranslations('account');
  const [state, action, pending] = useActionState(updateAddressAction, null);

  return (
    <form action={action} className='flex max-w-md flex-col gap-4'>
      <label className='flex flex-col gap-1.5 text-sm font-medium'>
        {t('address')}
        <input name='adresse' defaultValue={defaults.adresse} required className={inputClass} />
      </label>
      <div className='grid grid-cols-2 gap-3'>
        <label className='flex flex-col gap-1.5 text-sm font-medium'>
          {t('city')}
          <input name='city' defaultValue={defaults.city} required className={inputClass} />
        </label>
        <label className='flex flex-col gap-1.5 text-sm font-medium'>
          {t('zipCode')}
          <input name='zipCode' defaultValue={defaults.zipCode} required className={inputClass} />
        </label>
      </div>
      <label className='flex flex-col gap-1.5 text-sm font-medium'>
        {t('phone')}
        <input name='telephone' defaultValue={defaults.telephone} className={inputClass} />
      </label>

      {state?.ok && <p className='text-success text-sm'>{t('saved')}</p>}
      {state && !state.ok && <p className='text-danger text-sm'>{t('saveError')}</p>}

      <Button type='submit' variant='primary' size='lg' isDisabled={pending} className='mt-2 w-fit'>
        {t('save')}
      </Button>
    </form>
  );
}
