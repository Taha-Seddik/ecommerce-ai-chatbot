import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/buttonLink';
import { Container } from '@/components/ui/container';
import { ClearGuestCart } from '@/features/cart/clearGuestCart';
import { getOrderById } from '@/features/orders/orders.repo';
import { formatPrice } from '@/lib/money';

export default async function OrderConfirmationPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const order = await getOrderById(id);
  if (!order) notFound();

  const t = await getTranslations('order');

  return (
    <Container className='py-16 md:py-24'>
      <ClearGuestCart />
      <div className='mx-auto max-w-lg text-center'>
        <div className='bg-success-soft text-success-soft-foreground mx-auto grid size-14 place-items-center rounded-full text-2xl'>
          ✓
        </div>
        <h1 className='font-display mt-6 text-3xl tracking-tight'>{t('confirmed')}</h1>
        <p className='text-muted mt-2'>{t('thankYou')}</p>

        <div className='border-border mt-8 rounded-2xl border p-6 text-left'>
          <div className='flex justify-between gap-4'>
            <span className='text-muted'>{t('reference')}</span>
            <span className='font-mono'>{order.reference}</span>
          </div>
          <div className='mt-2 flex justify-between gap-4'>
            <span className='text-muted'>{t('status')}</span>
            <span>{t(`statuses.${order.status}`)}</span>
          </div>

          <ul className='border-border mt-4 space-y-2 border-t pt-4 text-sm'>
            {order.items.map((item) => (
              <li key={item.id} className='flex justify-between gap-3'>
                <span className='text-muted'>
                  {item.titleSnapshot} × {item.quantity}
                </span>
                <span className='tabular'>
                  {formatPrice(item.unitPriceCents * item.quantity, order.currency, locale)}
                </span>
              </li>
            ))}
          </ul>

          <div className='border-border mt-4 flex justify-between border-t pt-4 font-semibold'>
            <span>{t('total')}</span>
            <span className='tabular'>{formatPrice(order.amountCents, order.currency, locale)}</span>
          </div>
        </div>

        <ButtonLink href='/products' variant='primary' size='lg' className='mt-8'>
          {t('continueShopping')}
        </ButtonLink>
      </div>
    </Container>
  );
}
