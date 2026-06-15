import { Container } from '@/components/ui/container';

export default function Loading() {
  return (
    <Container className='py-8 md:py-12'>
      <div className='bg-surface-secondary h-4 w-48 animate-pulse rounded' />
      <div className='mt-6 grid gap-8 md:grid-cols-2 md:gap-12'>
        <div className='bg-surface-secondary aspect-square animate-pulse rounded-2xl' />
        <div className='flex flex-col gap-4'>
          <div className='bg-surface-secondary h-8 w-3/4 animate-pulse rounded' />
          <div className='bg-surface-secondary h-6 w-1/3 animate-pulse rounded' />
          <div className='bg-surface-secondary h-24 w-full animate-pulse rounded' />
          <div className='bg-surface-secondary h-12 w-full animate-pulse rounded' />
        </div>
      </div>
    </Container>
  );
}
