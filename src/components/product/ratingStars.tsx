import { IconStar } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

export function RatingStars({
  value,
  count,
  showCount = true,
  className,
}: {
  value: number;
  count?: number;
  showCount?: boolean;
  className?: string;
}) {
  const filled = Math.round(value);
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className='flex' aria-label={`${value.toFixed(1)} / 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <IconStar
            key={i}
            className={cn('size-3.5', i < filled ? 'text-accent' : 'text-default-foreground/25')}
            filled={i < filled}
          />
        ))}
      </div>
      {showCount && count ? <span className='text-muted text-xs'>({count})</span> : null}
    </div>
  );
}
