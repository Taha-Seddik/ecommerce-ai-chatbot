'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef } from 'react';
import { mergeGuestCartAction } from '@/features/cart/cart.actions';
import { useGuestCart } from '@/features/cart/cart.store';
import { mergeWishlistAction } from '@/features/wishlist/wishlist.actions';
import { useWishlist } from '@/features/wishlist/wishlist.store';
import { useRouter } from '@/i18n/navigation';
import { loginAction } from './auth.actions';

const inputClass =
  'border-border bg-surface focus:border-accent h-11 w-full rounded-lg border px-3 text-sm transition-colors outline-none';

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [state, action, pending] = useActionState(loginAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  // One-click demo: fill the seeded credentials and submit the real login form.
  const loginAs = (email: string) => {
    const f = formRef.current;
    if (!f) return;
    (f.elements.namedItem('email') as HTMLInputElement).value = email;
    (f.elements.namedItem('password') as HTMLInputElement).value = 'password123';
    f.requestSubmit();
  };

  useEffect(() => {
    if (!state?.ok) return;
    // Merge the guest cart + wishlist into the user's DB, then continue.
    Promise.all([
      mergeGuestCartAction(useGuestCart.getState().lines).then((m) => useGuestCart.setState({ lines: m })),
      mergeWishlistAction(useWishlist.getState().ids).then((ids) => useWishlist.setState({ ids })),
    ])
      .catch(() => {})
      .finally(() => router.replace('/account'));
  }, [state, router]);

  return (
    <form ref={formRef} action={action} className='flex flex-col gap-4'>
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

      <p className='text-muted mt-1 text-center text-xs'>{t('demoTitle')}</p>
      <div className='grid grid-cols-2 gap-2'>
        <button
          type='button'
          onClick={() => loginAs('customer@norden.example')}
          disabled={pending}
          className='border-border hover:bg-surface-secondary rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50'>
          {t('demoCustomer')}
        </button>
        <button
          type='button'
          onClick={() => loginAs('admin@norden.example')}
          disabled={pending}
          className='border-border hover:bg-surface-secondary rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50'>
          {t('demoAdmin')}
        </button>
      </div>
    </form>
  );
}
