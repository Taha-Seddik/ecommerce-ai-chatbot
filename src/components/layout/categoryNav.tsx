'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { pickLocale } from '@/lib/content';

type Localized = { en: string; fr: string };
type NavCategory = {
  id: string;
  slug: string;
  title: Localized;
  children: { id: string; slug: string; title: Localized }[];
};

export function CategoryNav({ categories, shopLabel }: { categories: NavCategory[]; shopLabel: string }) {
  const locale = useLocale();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <nav className='flex h-11 items-center gap-6 text-sm' onMouseLeave={() => setOpenId(null)}>
      <Link href='/products' className='hover:text-accent font-medium transition-colors'>
        {shopLabel}
      </Link>
      {categories.map((c) => (
        <div key={c.id} className='relative h-11' onMouseEnter={() => setOpenId(c.id)}>
          <Link
            href={`/category/${c.slug}`}
            className={cn(
              'inline-flex h-11 items-center transition-colors',
              openId === c.id ? 'text-foreground' : 'text-muted hover:text-foreground',
            )}>
            {pickLocale(c.title, locale)}
          </Link>
          {openId === c.id && c.children.length > 0 && (
            <div className='border-border bg-overlay shadow-lifted animate-in fade-in slide-in-from-top-1 absolute inset-s-0 z-50 mt-px min-w-48 rounded-xl border p-2 duration-150'>
              {c.children.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/category/${ch.slug}`}
                  className='hover:bg-surface-secondary block rounded-lg px-3 py-1.5 transition-colors'>
                  {pickLocale(ch.title, locale)}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
