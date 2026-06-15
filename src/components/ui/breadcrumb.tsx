import { IconChevronRight } from '@/components/ui/icons';
import { Link } from '@/i18n/navigation';

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label='Breadcrumb' className='text-muted flex flex-wrap items-center gap-1.5 text-sm'>
      {items.map((item, i) => (
        <span key={i} className='flex items-center gap-1.5'>
          {item.href ? (
            <Link href={item.href} className='hover:text-foreground transition-colors'>
              {item.label}
            </Link>
          ) : (
            <span className='text-foreground'>{item.label}</span>
          )}
          {i < items.length - 1 && <IconChevronRight className='size-3.5' />}
        </span>
      ))}
    </nav>
  );
}
