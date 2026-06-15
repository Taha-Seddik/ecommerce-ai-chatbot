'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/cn';

type GalleryImage = { url: string; alt?: string | null };

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];

  return (
    <div className='flex flex-col gap-3'>
      <div className='bg-surface-secondary relative aspect-square overflow-hidden rounded-2xl'>
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
      </div>

      {images.length > 1 && (
        <div className='grid grid-cols-5 gap-2'>
          {images.map((img, i) => (
            <button
              key={i}
              type='button'
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                'bg-surface-secondary relative aspect-square overflow-hidden rounded-lg transition-opacity',
                i === active ? 'ring-accent ring-2' : 'opacity-70 hover:opacity-100',
              )}>
              <Image src={img.url} alt='' fill sizes='15vw' className='object-cover' />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
