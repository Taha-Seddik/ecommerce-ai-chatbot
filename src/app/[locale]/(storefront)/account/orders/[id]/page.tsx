import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { OrderStatusBadge } from '@/components/order/orderStatusBadge';
import { getOrderById } from '@/features/orders/orders.repo';
import { getSession } from '@/lib/auth/session';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/money';

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  const order = await getOrderById(id);
  // Only the owner can view a user-bound order.
  if (!order || (order.userId && order.userId !== session?.userId)) notFound();

  const t = await getTranslations('account');
  const tOrder = await getTranslations('order');
  const df = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'long' });
  const addr = order.addressDetails;

  return (
    <div>
      <Link href='/account/orders' className='text-muted hover:text-foreground text-sm'>
        ← {t('nav.orders')}
      </Link>

      <div className='mt-3 flex items-center justify-between gap-4'>
        <h1 className='font-display font-mono text-2xl'>{order.reference}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className='text-muted mt-1 text-sm'>{df.format(order.createdAt)}</p>

      <ul className='divide-border mt-6 divide-y'>
        {order.items.map((i) => (
          <li key={i.id} className='flex justify-between gap-3 py-3 text-sm'>
            <span>
              {i.titleSnapshot} × {i.quantity}
            </span>
            <span className='tabular'>{formatPrice(i.unitPriceCents * i.quantity, order.currency, locale)}</span>
          </li>
        ))}
      </ul>
      <div className='border-border mt-2 flex justify-between border-t pt-3 font-semibold'>
        <span>{tOrder('total')}</span>
        <span className='tabular'>{formatPrice(order.amountCents, order.currency, locale)}</span>
      </div>

      {addr && (
        <div className='mt-8'>
          <h2 className='font-display mb-2 text-lg'>{t('shippingAddress')}</h2>
          <address className='text-muted text-sm not-italic'>
            {addr.fullName}
            <br />
            {addr.adresse}
            <br />
            {addr.zipCode} {addr.city}
            <br />
            {addr.telephone}
          </address>
        </div>
      )}
    </div>
  );
}
