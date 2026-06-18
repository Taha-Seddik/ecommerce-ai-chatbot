'use client';

import { ChatProductCard } from './chatProductCard';
import type { ChatProductCardData } from './chat.types';

/**
 * Render an assistant reply, swapping each `::product[slug]` marker for a live product card.
 * Splitting on a capturing regex yields [text, slug, text, slug, …] — odd indices are slugs.
 */
export function ChatMessage({
  text,
  products,
  onNavigate,
}: {
  text: string;
  products: ChatProductCardData[];
  onNavigate?: () => void;
}) {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const parts = text.split(/::product\[([a-z0-9-]+)\]/g);
  const rendered = new Set<string>();

  return (
    <div className='flex flex-col gap-2'>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const product = bySlug.get(part);
          if (!product || rendered.has(part)) return null; // skip unknown/duplicate slugs
          rendered.add(part);
          return <ChatProductCard key={`p-${i}`} product={product} onNavigate={onNavigate} />;
        }
        const trimmed = part.replace(/^\n+|\n+$/g, '');
        if (!trimmed) return null;
        return (
          <p key={`t-${i}`} className='text-sm leading-relaxed whitespace-pre-wrap'>
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
