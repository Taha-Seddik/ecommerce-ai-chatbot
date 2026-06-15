import { setRequestLocale } from 'next-intl/server';
import { listAllOrders } from '@/features/admin/admin.repo';
import { OrderStatusSelect } from '@/features/admin/orderStatusSelect';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/money';

export default async function AdminOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const orders = await listAllOrders();
  const df = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

  return (
    <div>
      <h1 className='font-display mb-6 text-2xl tracking-tight'>Orders ({orders.length})</h1>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='text-muted border-border border-b text-left'>
            <tr>
              <th className='py-2 pr-3 font-medium'>Reference</th>
              <th className='py-2 pr-3 font-medium'>Date</th>
              <th className='py-2 pr-3 font-medium'>Customer</th>
              <th className='py-2 pr-3 font-medium'>Total</th>
              <th className='py-2 pr-3 font-medium'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-border divide-y'>
            {orders.map((o) => (
              <tr key={o.id} className='hover:bg-surface-secondary/50'>
                <td className='py-2 pr-3'>
                  <Link href={`/admin/orders/${o.id}`} className='hover:text-accent font-mono'>
                    {o.reference}
                  </Link>
                </td>
                <td className='text-muted py-2 pr-3'>{df.format(o.createdAt)}</td>
                <td className='text-muted py-2 pr-3'>{o.addressDetails?.fullName ?? o.email ?? '—'}</td>
                <td className='tabular py-2 pr-3'>{formatPrice(o.amountCents, o.currency, locale)}</td>
                <td className='py-2 pr-3'>
                  <OrderStatusSelect id={o.id} status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
