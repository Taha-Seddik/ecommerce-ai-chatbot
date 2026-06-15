import { setRequestLocale } from 'next-intl/server';
import { OrderStatusBadge } from '@/components/order/orderStatusBadge';
import { getDashboardStats, getLowStockProducts, getRecentOrders } from '@/features/admin/admin.repo';
import { Link } from '@/i18n/navigation';
import { pickLocale } from '@/lib/content';
import { formatPrice } from '@/lib/money';

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [stats, lowStock, recent] = await Promise.all([getDashboardStats(), getLowStockProducts(), getRecentOrders()]);
  const df = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

  const cards = [
    { label: 'Revenue (paid)', value: formatPrice(stats.revenueCents, 'USD', locale) },
    { label: 'Orders', value: String(stats.orderCount) },
    { label: 'Pending', value: String(stats.pendingCount) },
    { label: 'Products', value: String(stats.productCount) },
    { label: 'Customers', value: String(stats.userCount) },
  ];

  return (
    <div className='flex flex-col gap-8'>
      <h1 className='font-display text-2xl tracking-tight'>Dashboard</h1>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
        {cards.map((c) => (
          <div key={c.label} className='border-border rounded-xl border p-4'>
            <p className='text-muted text-xs'>{c.label}</p>
            <p className='tabular mt-1 text-xl font-semibold'>{c.value}</p>
          </div>
        ))}
      </div>

      <div className='grid gap-8 lg:grid-cols-2'>
        <section>
          <h2 className='font-display mb-3 text-lg'>Recent orders</h2>
          {recent.length === 0 ? (
            <p className='text-muted text-sm'>No orders yet.</p>
          ) : (
            <ul className='divide-border divide-y text-sm'>
              {recent.map((o) => (
                <li key={o.id} className='flex items-center justify-between gap-3 py-2'>
                  <Link href={`/admin/orders/${o.id}`} className='hover:text-accent font-mono'>
                    {o.reference}
                  </Link>
                  <span className='text-muted text-xs'>{df.format(o.createdAt)}</span>
                  <OrderStatusBadge status={o.status} />
                  <span className='tabular font-medium'>{formatPrice(o.amountCents, o.currency, locale)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className='font-display mb-3 text-lg'>Low stock</h2>
          {lowStock.length === 0 ? (
            <p className='text-muted text-sm'>All products well stocked.</p>
          ) : (
            <ul className='divide-border divide-y text-sm'>
              {lowStock.map((p) => (
                <li key={p.id} className='flex items-center justify-between gap-3 py-2'>
                  <Link href={`/admin/products/${p.id}/edit`} className='hover:text-accent'>
                    {pickLocale(p.title, locale)}
                  </Link>
                  <span className={p.stock === 0 ? 'text-danger font-medium' : 'text-warning'}>{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
