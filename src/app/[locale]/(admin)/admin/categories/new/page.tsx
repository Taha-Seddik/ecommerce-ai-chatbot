import { setRequestLocale } from 'next-intl/server';
import { listAllCategories } from '@/features/admin/admin.repo';
import { AdminCategoryForm } from '@/features/admin/adminCategoryForm';
import { Link } from '@/i18n/navigation';
import { pickLocale } from '@/lib/content';

export default async function NewCategoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const parents = (await listAllCategories()).map((c) => ({ id: c.id, label: pickLocale(c.title, locale) }));

  return (
    <div>
      <Link href='/admin/categories' className='text-muted hover:text-foreground text-sm'>
        ← Categories
      </Link>
      <h1 className='font-display mt-3 mb-6 text-2xl tracking-tight'>New category</h1>
      <AdminCategoryForm parents={parents} />
    </div>
  );
}
