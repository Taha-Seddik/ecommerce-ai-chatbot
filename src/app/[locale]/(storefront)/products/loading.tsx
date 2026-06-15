import { ProductGridSkeleton } from '@/components/product/productGrid';
import { Container } from '@/components/ui/container';

export default function Loading() {
  return (
    <Container className='py-10 md:py-14'>
      <div className='bg-surface-secondary h-4 w-40 animate-pulse rounded' />
      <div className='bg-surface-secondary mt-4 mb-8 h-9 w-64 animate-pulse rounded' />
      <ProductGridSkeleton count={8} />
    </Container>
  );
}
