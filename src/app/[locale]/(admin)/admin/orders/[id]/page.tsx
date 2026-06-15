import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getAdminOrderById } from '@/features/admin/admin.repo';
import { OrderStatusSelect } from '@/features/admin/orderStatusSelect';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/money';

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const order = await getAdminOrderById(id);
  if (!order) notFound();
  const addr = order.addressDetails;

  return (
    <div className='max-w-2xl'>
      <Link href='/admin/orders' className='text-muted hover:text-foreground text-sm'>
        ← Orders
      </Link>
      <div className='mt-3 flex flex-wrap items-center justify-between gap-3'>
        <h1 className='font-display font-mono text-2xl'>{order.reference}</h1>
        <OrderStatusSelect id={order.id} status={order.status} />
      </div>
      <p className='text-muted mt-1 text-sm'>
        {order.paymentMethod} {order.onlinePaymentStatus ? `· ${order.onlinePaymentStatus}` : ''}
      </p>

      <ul className='divide-border mt-6 divide-y text-sm'>
        {order.items.map((i) => (
          <li key={i.id} className='flex justify-between gap-3 py-3'>
            <span>
              {i.titleSnapshot} × {i.quantity}
            </span>
            <span className='tabular'>{formatPrice(i.unitPriceCents * i.quantity, order.currency, locale)}</span>
          </li>
        ))}
      </ul>
      <div className='border-border mt-2 flex justify-between border-t pt-3 font-semibold'>
        <span>Total</span>
        <span className='tabular'>{formatPrice(order.amountCents, order.currency, locale)}</span>
      </div>

      {addr && (
        <div className='mt-8'>
          <h2 className='font-display mb-2 text-lg'>Shipping</h2>
          <address className='text-muted text-sm not-italic'>
            {addr.fullName}
            <br />
            {addr.email}
            <br />
            {addr.adresse}
            <br />
            {addr.zipCode} {addr.city}
            <br />
            {addr.telephone}
            {addr.moreInfos ? (
              <>
                <br />
                {addr.moreInfos}
              </>
            ) : null}
          </address>
        </div>
      )}
    </div>
  );
}
