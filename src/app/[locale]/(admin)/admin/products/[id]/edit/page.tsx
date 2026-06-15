import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getProductForEdit, listAllCategories } from '@/features/admin/admin.repo';
import { AdminProductForm } from '@/features/admin/adminProductForm';
import { Link } from '@/i18n/navigation';
import { pickLocale } from '@/lib/content';

export default async function EditProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [p, categories] = await Promise.all([getProductForEdit(id), listAllCategories()]);
  if (!p) notFound();

  return (
    <div>
      <Link href='/admin/products' className='text-muted hover:text-foreground text-sm'>
        ← Products
      </Link>
      <h1 className='font-display mt-3 mb-6 text-2xl tracking-tight'>Edit product</h1>
      <AdminProductForm
        categories={categories.map((c) => ({ id: c.id, label: pickLocale(c.title, locale) }))}
        product={{
          id: p.id,
          titleEn: p.title.en,
          titleFr: p.title.fr,
          descriptionEn: p.description.en,
          descriptionFr: p.description.fr,
          reference: p.reference,
          price: p.priceCents / 100,
          discountPercentage: p.discountPercentage,
          stock: p.stock,
          categoryId: p.categoryId,
          isFeatured: p.isFeatured,
          isPublished: p.isPublished,
          images: p.images.map((i) => i.url),
        }}
      />
    </div>
  );
}
