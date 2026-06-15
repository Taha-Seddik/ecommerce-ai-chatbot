import { getTranslations, setRequestLocale } from 'next-intl/server';
import { OrderStatusBadge } from '@/components/order/orderStatusBadge';
import { getUserOrders } from '@/features/orders/orders.repo';
import { getSession } from '@/lib/auth/session';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/money';

export default async function AccountOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  const t = await getTranslations('account');
  const orders = session ? await getUserOrders(session.userId) : [];
  const df = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' });

  return (
    <div>
      <h1 className='font-display text-2xl tracking-tight md:text-3xl'>{t('nav.orders')}</h1>
      {orders.length === 0 ? (
        <p className='text-muted mt-4 text-sm'>
          {t('noOrders')}{' '}
          <Link href='/products' className='text-accent font-medium'>
            {t('startShopping')}
          </Link>
        </p>
      ) : (
        <ul className='divide-border mt-4 divide-y'>
          {orders.map((o) => (
            <li key={o.id} className='flex items-center justify-between gap-4 py-4'>
              <div>
                <Link
                  href={`/account/orders/${o.id}`}
                  className='hover:text-accent font-mono text-sm transition-colors'>
                  {o.reference}
                </Link>
                <p className='text-muted text-xs'>
                  {df.format(o.createdAt)} · {o.items.length} {t('items')}
                </p>
              </div>
              <div className='flex items-center gap-3'>
                <OrderStatusBadge status={o.status} />
                <span className='tabular text-sm font-medium'>{formatPrice(o.amountCents, o.currency, locale)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
