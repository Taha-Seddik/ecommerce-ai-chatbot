import { getTranslations } from 'next-intl/server';
import type { OrderStatus } from '@/db/schema';
import { cn } from '@/lib/cn';

const styles: Record<OrderStatus, string> = {
  PendingApproval: 'bg-warning-soft text-warning-soft-foreground',
  Approved: 'bg-success-soft text-success-soft-foreground',
  ShippingInProgress: 'bg-accent-soft text-accent-soft-foreground',
  Delivered: 'bg-success-soft text-success-soft-foreground',
  Cancelled: 'bg-default text-default-foreground',
  Failed: 'bg-danger-soft text-danger-soft-foreground',
};

export async function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = await getTranslations('order');
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', styles[status])}>
      {t(`statuses.${status}`)}
    </span>
  );
}
