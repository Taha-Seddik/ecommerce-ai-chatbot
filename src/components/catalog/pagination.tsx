import { IconChevronLeft, IconChevronRight } from '@/components/ui/icons';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

export function Pagination({
  page,
  pageCount,
  basePath,
  params = {},
}: {
  page: number;
  pageCount: number;
  basePath: string;
  params?: Record<string, string>;
}) {
  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams(params);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const cellBase = 'grid size-9 place-items-center rounded-lg text-sm transition-colors';
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav className='mt-12 flex items-center justify-center gap-1.5' aria-label='Pagination'>
      {page > 1 && (
        <Link href={href(page - 1)} className={cn(cellBase, 'hover:bg-surface-secondary')} aria-label='Previous page'>
          <IconChevronLeft className='size-4' />
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn(cellBase, p === page ? 'bg-foreground text-background' : 'hover:bg-surface-secondary')}>
          {p}
        </Link>
      ))}
      {page < pageCount && (
        <Link href={href(page + 1)} className={cn(cellBase, 'hover:bg-surface-secondary')} aria-label='Next page'>
          <IconChevronRight className='size-4' />
        </Link>
      )}
    </nav>
  );
}
