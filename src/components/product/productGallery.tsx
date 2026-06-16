'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconChevronLeft, IconChevronRight } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

type GalleryImage = { url: string; alt?: string | null };

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const count = images.length;
  const main = images[active] ?? images[0];

  const go = (dir: number) => setActive((i) => (i + dir + count) % count);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen, count]);

  const navBtn =
    'bg-surface/85 shadow-soft hover:bg-surface absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full transition';

  return (
    <div className='flex flex-col gap-3'>
      <div className='group bg-surface-secondary relative aspect-square overflow-hidden rounded-2xl'>
        {main && (
          <Image
            src={main.url}
            alt={main.alt ?? title}
            fill
            priority
            sizes='(min-width: 768px) 50vw, 100vw'
            className='object-cover'
          />
        )}

        <button
          type='button'
          onClick={() => setFullscreen(true)}
          aria-label='View fullscreen'
          className='bg-surface/85 shadow-soft hover:bg-surface absolute right-3 bottom-3 grid size-9 place-items-center rounded-full transition'>
          <svg viewBox='0 0 24 24' className='size-5' fill='none' stroke='currentColor' strokeWidth='1.7'>
            <path d='M9 3H4v5M20 8V3h-5M15 21h5v-5M4 16v5h5' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </button>

        {count > 1 && (
          <>
            <button
              type='button'
              onClick={() => go(-1)}
              aria-label='Previous image'
              className={cn(navBtn, 'left-3 opacity-0 group-hover:opacity-100')}>
              <IconChevronLeft className='size-5' />
            </button>
            <button
              type='button'
              onClick={() => go(1)}
              aria-label='Next image'
              className={cn(navBtn, 'right-3 opacity-0 group-hover:opacity-100')}>
              <IconChevronRight className='size-5' />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className='grid grid-cols-5 gap-2'>
          {images.map((img, i) => (
            <button
              key={i}
              type='button'
              onClick={() => setActive(i)}
              aria-label={`Image ${i + 1}`}
              className={cn(
                'bg-surface-secondary relative aspect-square overflow-hidden rounded-lg transition',
                i === active ? 'ring-accent ring-2' : 'opacity-60 hover:opacity-100',
              )}>
              <Image src={img.url} alt='' fill sizes='12vw' className='object-cover' />
            </button>
          ))}
        </div>
      )}

      {fullscreen &&
        createPortal(
          <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/90'
            role='dialog'
            aria-modal='true'>
            <button
              type='button'
              onClick={() => setFullscreen(false)}
              aria-label='Close'
              className='absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20'>
              ×
            </button>
            <div className='relative h-full max-h-[88vh] w-full max-w-5xl'>
              {main && <Image src={main.url} alt={main.alt ?? title} fill sizes='90vw' className='object-contain' />}
            </div>
            {count > 1 && (
              <>
                <button
                  type='button'
                  onClick={() => go(-1)}
                  aria-label='Previous image'
                  className='absolute top-1/2 left-4 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20'>
                  <IconChevronLeft />
                </button>
                <button
                  type='button'
                  onClick={() => go(1)}
                  aria-label='Next image'
                  className='absolute top-1/2 right-4 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20'>
                  <IconChevronRight />
                </button>
                <div className='tabular absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white'>
                  {active + 1} / {count}
                </div>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
