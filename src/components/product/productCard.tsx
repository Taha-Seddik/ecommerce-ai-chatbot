import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { ProductCardData } from '@/features/products/products.repo';
import { WishlistButton } from '@/features/wishlist/wishlistButton';
import { pickLocale } from '@/lib/content';
import { Price } from './price';
import { RatingStars } from './ratingStars';

export async function ProductCard({
  product,
  locale,
  priority = false,
}: {
  product: ProductCardData;
  locale: string;
  priority?: boolean;
}) {
  const t = await getTranslations('product');
  const title = pickLocale(product.title, locale);
  const soldOut = product.stock <= 0;

  return (
    <Link href={`/products/${product.slug}`} className='group block'>
      <div className='bg-surface-secondary relative aspect-square overflow-hidden rounded-xl'>
        {product.thumbnail && (
          <Image
            src={product.thumbnail}
            alt={title}
            fill
            priority={priority}
            sizes='(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw'
            className='object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]'
          />
        )}
        <div className='absolute top-3 left-3 flex flex-col gap-1.5'>
          {product.discountPercentage > 0 && (
            <span className='bg-danger text-danger-foreground rounded-full px-2 py-0.5 text-xs font-semibold'>
              −{product.discountPercentage}%
            </span>
          )}
          {product.isFeatured && product.discountPercentage === 0 && (
            <span className='bg-foreground text-background rounded-full px-2 py-0.5 text-xs font-semibold'>
              {t('new')}
            </span>
          )}
        </div>
        <WishlistButton productId={product.id} className='absolute top-3 right-3' />
        {soldOut && (
          <div className='bg-background/55 absolute inset-0 grid place-items-center'>
            <span className='text-foreground text-sm font-medium tracking-wide uppercase'>{t('outOfStock')}</span>
          </div>
        )}
      </div>

      <div className='mt-3 flex flex-col gap-1'>
        <h3 className='leading-snug font-medium'>{title}</h3>
        {product.ratingCount > 0 && <RatingStars value={product.ratingAvg} count={product.ratingCount} />}
        <Price priceCents={product.priceCents} discount={product.discountPercentage} className='mt-0.5' />
      </div>
    </Link>
  );
}
