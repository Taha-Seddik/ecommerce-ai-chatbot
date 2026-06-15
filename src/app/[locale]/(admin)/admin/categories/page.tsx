import { setRequestLocale } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/buttonLink';
import { listAllCategories } from '@/features/admin/admin.repo';
import { Link } from '@/i18n/navigation';
import { pickLocale } from '@/lib/content';

export default async function AdminCategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cats = await listAllCategories();
  const byId = new Map(cats.map((c) => [c.id, c]));

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='font-display text-2xl tracking-tight'>Categories ({cats.length})</h1>
        <ButtonLink href='/admin/categories/new' variant='primary' size='sm'>
          New category
        </ButtonLink>
      </div>

      <table className='w-full text-sm'>
        <thead className='text-muted border-border border-b text-left'>
          <tr>
            <th className='py-2 pr-3 font-medium'>Title</th>
            <th className='py-2 pr-3 font-medium'>Slug</th>
            <th className='py-2 pr-3 font-medium'>Parent</th>
            <th className='py-2 pr-3 font-medium'>Visible</th>
          </tr>
        </thead>
        <tbody className='divide-border divide-y'>
          {cats.map((c) => (
            <tr key={c.id} className='hover:bg-surface-secondary/50'>
              <td className='py-2 pr-3'>
                <Link href={`/admin/categories/${c.id}/edit`} className='hover:text-accent font-medium'>
                  {pickLocale(c.title, locale)}
                </Link>
              </td>
              <td className='text-muted py-2 pr-3 font-mono text-xs'>{c.slug}</td>
              <td className='text-muted py-2 pr-3'>
                {c.parentCategoryId ? pickLocale(byId.get(c.parentCategoryId)!.title, locale) : '—'}
              </td>
              <td className='py-2 pr-3'>{c.show ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
