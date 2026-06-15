import { setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { AdminSidebar } from '@/features/admin/adminSidebar';
import { requireAdmin } from '@/lib/auth/session';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  return (
    <div className='min-h-dvh'>
      <Container className='py-8'>
        <div className='grid gap-8 md:grid-cols-[200px_1fr]'>
          <AdminSidebar />
          <main className='min-w-0'>{children}</main>
        </div>
      </Container>
    </div>
  );
}
