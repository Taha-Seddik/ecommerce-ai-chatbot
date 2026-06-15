import { setRequestLocale } from 'next-intl/server';
import { listAllUsers } from '@/features/admin/admin.repo';

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const users = await listAllUsers();
  const df = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

  return (
    <div>
      <h1 className='font-display mb-6 text-2xl tracking-tight'>Customers ({users.length})</h1>
      <table className='w-full text-sm'>
        <thead className='text-muted border-border border-b text-left'>
          <tr>
            <th className='py-2 pr-3 font-medium'>Name</th>
            <th className='py-2 pr-3 font-medium'>Email</th>
            <th className='py-2 pr-3 font-medium'>Orders</th>
            <th className='py-2 pr-3 font-medium'>Joined</th>
          </tr>
        </thead>
        <tbody className='divide-border divide-y'>
          {users.map((u) => (
            <tr key={u.id} className='hover:bg-surface-secondary/50'>
              <td className='py-2 pr-3 font-medium'>
                {u.firstName} {u.lastName}
              </td>
              <td className='text-muted py-2 pr-3'>{u.email}</td>
              <td className='py-2 pr-3'>{u.orderCount}</td>
              <td className='text-muted py-2 pr-3'>{u.createdAt ? df.format(u.createdAt) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
