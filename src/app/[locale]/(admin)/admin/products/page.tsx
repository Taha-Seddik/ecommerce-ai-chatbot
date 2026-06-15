import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/buttonLink';
import { listAllProducts } from '@/features/admin/admin.repo';
import { Link } from '@/i18n/navigation';
import { pickLocale } from '@/lib/content';
import { formatPrice } from '@/lib/money';

export default async function AdminProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const products = await listAllProducts();

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='font-display text-2xl tracking-tight'>Products ({products.length})</h1>
        <ButtonLink href='/admin/products/new' variant='primary' size='sm'>
          New product
        </ButtonLink>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='text-muted border-border border-b text-left'>
            <tr>
              <th className='py-2 pr-3 font-medium'>Product</th>
              <th className='py-2 pr-3 font-medium'>Category</th>
              <th className='py-2 pr-3 font-medium'>Price</th>
              <th className='py-2 pr-3 font-medium'>Stock</th>
              <th className='py-2 pr-3 font-medium'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-border divide-y'>
            {products.map((p) => (
              <tr key={p.id} className='hover:bg-surface-secondary/50'>
                <td className='py-2 pr-3'>
                  <Link href={`/admin/products/${p.id}/edit`} className='flex items-center gap-3'>
                    <span className='bg-surface-secondary relative size-10 shrink-0 overflow-hidden rounded'>
                      {p.thumbnail && <Image src={p.thumbnail} alt='' fill sizes='40px' className='object-cover' />}
                    </span>
                    <span className='hover:text-accent font-medium'>{pickLocale(p.title, locale)}</span>
                  </Link>
                </td>
                <td className='text-muted py-2 pr-3'>{p.category ? pickLocale(p.category.title, locale) : '—'}</td>
                <td className='tabular py-2 pr-3'>{formatPrice(p.priceCents, p.currency, locale)}</td>
                <td className='py-2 pr-3'>{p.stock}</td>
                <td className='py-2 pr-3'>
                  <span className={p.isPublished ? 'text-success' : 'text-muted'}>
                    {p.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
