import { getLocale, getTranslations } from 'next-intl/server';
import { RatingStars } from '@/components/product/ratingStars';
import type { ProductReview } from '@/features/products/products.repo';

export async function ReviewList({ reviews }: { reviews: ProductReview[] }) {
  const t = await getTranslations('product');
  const locale = await getLocale();
  const df = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'medium' });

  if (!reviews.length) return null;

  return (
    <div className='flex flex-col gap-6'>
      {reviews.map((r) => (
        <div key={r.id} className='border-border border-b pb-6 last:border-0'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='bg-surface-secondary grid size-9 place-items-center rounded-full text-xs font-medium'>
                {r.firstName[0]}
                {r.lastName[0]}
              </div>
              <div>
                <p className='text-sm font-medium'>
                  {r.firstName} {r.lastName[0]}.
                </p>
                <p className='text-muted text-xs'>
                  {df.format(r.createdAt)}
                  {r.isVerifiedPurchase ? ` · ${t('verifiedPurchase')}` : ''}
                </p>
              </div>
            </div>
            <RatingStars value={r.rating} showCount={false} />
          </div>
          {r.title && <p className='mt-3 font-medium'>{r.title}</p>}
          {r.body && <p className='text-muted mt-1 text-sm leading-relaxed'>{r.body}</p>}
        </div>
      ))}
    </div>
  );
}
