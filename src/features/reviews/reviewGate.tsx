'use client';

import { useAccount } from '@/features/auth/account.store';
import { ReviewForm } from '@/features/reviews/reviewForm';
import { Link } from '@/i18n/navigation';

/**
 * Client-side gate for the review form. Reads the hydrated account store so the product page can
 * stay statically rendered (ISR) instead of opting into dynamic rendering via cookies().
 * The submit action (ReviewForm) still re-checks auth server-side, so this is presentation-only.
 */
export function ReviewGate({
  productId,
  signInPrompt,
  signInLabel,
}: {
  productId: string;
  signInPrompt: string;
  signInLabel: string;
}) {
  const account = useAccount((s) => s.account);

  if (account) return <ReviewForm productId={productId} />;

  return (
    <p className='text-muted mt-6 text-sm'>
      {signInPrompt}{' '}
      <Link href='/login' className='text-accent font-medium'>
        {signInLabel}
      </Link>
    </p>
  );
}
