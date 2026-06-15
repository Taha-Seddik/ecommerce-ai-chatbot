'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { type FormEvent, useEffect, useState } from 'react';
import { resolveCart } from '@/features/cart/cart.actions';
import { useGuestCart } from '@/features/cart/cart.store';
import type { CartView } from '@/features/cart/cart.types';
import { placeOrderAction } from '@/features/checkout/checkout.actions';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/money';

type Defaults = Partial<Record<'fullName' | 'email' | 'telephone' | 'adresse' | 'city' | 'zipCode', string>>;

const inputClass =
  'border-border bg-surface focus:border-accent h-11 w-full rounded-lg border px-3 text-sm transition-colors outline-none';

function Field({
  id,
  label,
  type = 'text',
  defaultValue,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label htmlFor={id} className='text-sm font-medium'>
        {label}
      </label>
      <input id={id} name={id} type={type} defaultValue={defaultValue} required={required} className={inputClass} />
    </div>
  );
}

export function CheckoutForm({
  locale,
  defaults,
  stripeEnabled,
}: {
  locale: string;
  defaults: Defaults;
  stripeEnabled: boolean;
}) {
  const t = useTranslations('checkout');
  const router = useRouter();
  const lines = useGuestCart((s) => s.lines);
  const [view, setView] = useState<CartView | null>(null);
  const [method, setMethod] = useState<'cod' | 'card'>('cod');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    resolveCart(lines, locale).then((v) => {
      if (!active) return;
      setView(v);
      if (v.lines.length === 0) router.replace('/cart');
    });
    return () => {
      active = false;
    };
  }, [lines, locale, router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    const res = await placeOrderAction(useGuestCart.getState().lines, raw);
    if (!res.ok) {
      setError(res.error);
      setPending(false);
      return;
    }
    if (res.kind === 'stripe') {
      window.location.href = res.url;
      return;
    }
    router.push(`/order/${res.orderId}/confirmation`);
  }

  const total = view ? formatPrice(view.subtotalCents, view.currency, locale) : '—';

  return (
    <form onSubmit={onSubmit} className='grid items-start gap-10 lg:grid-cols-[1fr_360px]'>
      <div className='flex flex-col gap-8'>
        <fieldset className='flex flex-col gap-4'>
          <legend className='font-display mb-2 text-xl'>{t('shipping')}</legend>
          <Field id='fullName' label={t('fullName')} defaultValue={defaults.fullName} required />
          <Field id='email' label={t('email')} type='email' defaultValue={defaults.email} required />
          <Field id='telephone' label={t('phone')} defaultValue={defaults.telephone} required />
          <Field id='adresse' label={t('address')} defaultValue={defaults.adresse} required />
          <div className='grid grid-cols-2 gap-4'>
            <Field id='city' label={t('city')} defaultValue={defaults.city} required />
            <Field id='zipCode' label={t('zipCode')} defaultValue={defaults.zipCode} required />
          </div>
          <Field id='moreInfos' label={t('notes')} />
        </fieldset>

        <fieldset className='flex flex-col gap-3'>
          <legend className='font-display mb-2 text-xl'>{t('payment')}</legend>
          <label className='border-border flex cursor-pointer items-start gap-3 rounded-xl border p-4'>
            <input
              type='radio'
              name='paymentMethod'
              value='cod'
              checked={method === 'cod'}
              onChange={() => setMethod('cod')}
              className='mt-1'
            />
            <span>
              <span className='block font-medium'>{t('cod')}</span>
              <span className='text-muted block text-sm'>{t('codDesc')}</span>
            </span>
          </label>
          <label
            className={cn(
              'border-border flex items-start gap-3 rounded-xl border p-4',
              stripeEnabled ? 'cursor-pointer' : 'opacity-50',
            )}>
            <input
              type='radio'
              name='paymentMethod'
              value='card'
              checked={method === 'card'}
              onChange={() => setMethod('card')}
              disabled={!stripeEnabled}
              className='mt-1'
            />
            <span>
              <span className='block font-medium'>{t('card')}</span>
              <span className='text-muted block text-sm'>{stripeEnabled ? t('cardDesc') : t('cardDisabled')}</span>
            </span>
          </label>
        </fieldset>

        {error && <p className='text-danger text-sm'>{t(`error.${error}`)}</p>}
      </div>

      <aside className='bg-surface-secondary h-fit rounded-2xl p-6'>
        <h2 className='font-display mb-4 text-lg'>{t('summary')}</h2>
        <ul className='flex flex-col gap-3'>
          {(view?.lines ?? []).map((l) => (
            <li key={l.productId} className='flex justify-between gap-3 text-sm'>
              <span className='text-muted'>
                {l.title} × {l.quantity}
              </span>
              <span className='tabular'>{formatPrice(l.lineTotalCents, l.currency, locale)}</span>
            </li>
          ))}
        </ul>
        <div className='border-border mt-4 space-y-2 border-t pt-4 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted'>{t('subtotal')}</span>
            <span className='tabular'>{total}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted'>{t('shippingFee')}</span>
            <span>{t('free')}</span>
          </div>
          <div className='flex justify-between text-base font-semibold'>
            <span>{t('total')}</span>
            <span className='tabular'>{total}</span>
          </div>
        </div>
        <Button
          type='submit'
          variant='primary'
          size='lg'
          isDisabled={pending || !view || view.lines.length === 0}
          className='mt-6 w-full'>
          {method === 'card' ? t('payNow') : t('placeOrder')}
        </Button>
      </aside>
    </form>
  );
}
