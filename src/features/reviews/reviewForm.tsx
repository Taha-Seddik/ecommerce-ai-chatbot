'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { type FormEvent, useState } from 'react';
import { IconStar } from '@/components/ui/icons';
import { addReviewAction } from '@/features/reviews/reviews.actions';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

const inputClass =
  'border-border bg-surface focus:border-accent w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none';

export function ReviewForm({ productId }: { productId: string }) {
  const t = useTranslations('product');
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(false);
    const fd = new FormData(e.currentTarget);
    const res = await addReviewAction({
      productId,
      rating,
      title: String(fd.get('title') || ''),
      body: String(fd.get('body') || ''),
    });
    setPending(false);
    if (!res.ok) {
      setError(true);
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) return <p className='text-success mt-6 text-sm'>{t('reviewThanks')}</p>;

  return (
    <form onSubmit={onSubmit} className='border-border mt-8 flex max-w-md flex-col gap-3 border-t pt-6'>
      <p className='font-medium'>{t('writeReview')}</p>
      <div className='flex gap-1'>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type='button' onClick={() => setRating(n)} aria-label={`${n} / 5`}>
            <IconStar
              filled={n <= rating}
              className={cn('size-6', n <= rating ? 'text-accent' : 'text-default-foreground/30')}
            />
          </button>
        ))}
      </div>
      <input name='title' placeholder={t('reviewTitle')} className={inputClass} />
      <textarea name='body' placeholder={t('reviewBody')} rows={3} className={inputClass} />
      {error && <p className='text-danger text-sm'>{t('reviewError')}</p>}
      <Button type='submit' variant='secondary' isDisabled={pending} className='w-fit'>
        {t('submitReview')}
      </Button>
    </form>
  );
}
