'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { loginAction } from './auth.actions';

const inputClass =
  'border-border bg-surface focus:border-accent h-11 w-full rounded-lg border px-3 text-sm transition-colors outline-none';

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [state, action, pending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.ok) router.replace('/account');
  }, [state, router]);

  return (
    <form action={action} className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1.5'>
        <label htmlFor='email' className='text-sm font-medium'>
          {t('email')}
        </label>
        <input id='email' name='email' type='email' required autoComplete='email' className={inputClass} />
      </div>
      <div className='flex flex-col gap-1.5'>
        <label htmlFor='password' className='text-sm font-medium'>
          {t('password')}
        </label>
        <input
          id='password'
          name='password'
          type='password'
          required
          autoComplete='current-password'
          className={inputClass}
        />
      </div>

      {state && !state.ok && <p className='text-danger text-sm'>{t(`error.${state.error}`)}</p>}

      <Button type='submit' variant='primary' size='lg' isDisabled={pending} className='mt-2'>
        {t('signIn')}
      </Button>
    </form>
  );
}
