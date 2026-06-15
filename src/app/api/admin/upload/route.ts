import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createId } from '@paralleldrive/cuid2';
import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

const MAX_BYTES = 5 * 1024 * 1024;

// Local-disk image upload (admin only). On the VPS, public/uploads is a persisted directory.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.roles.includes('admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'no file' }, { status: 400 });
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'not an image' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'too large' }, { status: 400 });

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const dir = join(process.cwd(), 'public', 'uploads', 'products');
  await mkdir(dir, { recursive: true });
  const name = `${createId()}.${ext}`;
  await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/products/${name}` });
}
