import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { AccountNav } from '@/features/account/accountNav';
import { requireUser } from '@/lib/auth/session';

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser();

  return (
    <Container className='py-10 md:py-14'>
      <div className='grid gap-8 md:grid-cols-[200px_1fr]'>
        <AccountNav />
        <div className='min-w-0'>{children}</div>
      </div>
    </Container>
  );
}
