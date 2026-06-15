import { setRequestLocale } from 'next-intl/server';
import { listAllCategories } from '@/features/admin/admin.repo';
import { AdminProductForm } from '@/features/admin/adminProductForm';
import { Link } from '@/i18n/navigation';
import { pickLocale } from '@/lib/content';

export default async function NewProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const categories = (await listAllCategories()).map((c) => ({ id: c.id, label: pickLocale(c.title, locale) }));

  return (
    <div>
      <Link href='/admin/products' className='text-muted hover:text-foreground text-sm'>
        ← Products
      </Link>
      <h1 className='font-display mt-3 mb-6 text-2xl tracking-tight'>New product</h1>
      <AdminProductForm categories={categories} />
    </div>
  );
}
