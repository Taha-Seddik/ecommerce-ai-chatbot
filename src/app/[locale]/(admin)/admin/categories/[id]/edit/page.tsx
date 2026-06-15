import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getCategoryForEdit, listAllCategories } from '@/features/admin/admin.repo';
import { AdminCategoryForm } from '@/features/admin/adminCategoryForm';
import { Link } from '@/i18n/navigation';
import { pickLocale } from '@/lib/content';

export default async function EditCategoryPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [c, cats] = await Promise.all([getCategoryForEdit(id), listAllCategories()]);
  if (!c) notFound();
  const parents = cats.filter((x) => x.id !== id).map((x) => ({ id: x.id, label: pickLocale(x.title, locale) }));

  return (
    <div>
      <Link href='/admin/categories' className='text-muted hover:text-foreground text-sm'>
        ← Categories
      </Link>
      <h1 className='font-display mt-3 mb-6 text-2xl tracking-tight'>Edit category</h1>
      <AdminCategoryForm
        parents={parents}
        category={{
          id: c.id,
          titleEn: c.title.en,
          titleFr: c.title.fr,
          slug: c.slug,
          parentCategoryId: c.parentCategoryId,
          sortOrder: c.sortOrder,
          show: c.show,
          image: c.image ?? '',
        }}
      />
    </div>
  );
}
