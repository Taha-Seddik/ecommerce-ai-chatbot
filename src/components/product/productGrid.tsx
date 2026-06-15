import type { ProductCardData } from '@/features/products/products.types';
import { ProductCard } from './productCard';

export function ProductGrid({ products, locale }: { products: ProductCardData[]; locale: string }) {
  return (
    <div className='grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4'>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} locale={locale} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className='animate-pulse'>
      <div className='bg-surface-secondary aspect-square rounded-xl' />
      <div className='bg-surface-secondary mt-3 h-4 w-3/4 rounded' />
      <div className='bg-surface-secondary mt-2 h-4 w-1/3 rounded' />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className='grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4'>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
