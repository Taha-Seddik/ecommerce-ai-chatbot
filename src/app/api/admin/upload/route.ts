import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createId } from '@paralleldrive/cuid2';
import { type NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { getSession } from '@/lib/auth/session';

const MAX_BYTES = 5 * 1024 * 1024;

// Local-disk image upload (admin only). On the VPS, public/uploads is a persisted directory.
// Security: the bytes are validated + re-encoded with sharp (not trusting the client MIME/name),
// so only genuine raster images are stored, normalized to stripped-metadata WebP.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.roles.includes('admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'no file' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'too large' }, { status: 400 });

  const input = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  try {
    // Throws if the bytes aren't a decodable image; re-encode to WebP (caps size, strips metadata).
    output = await sharp(input).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  } catch {
    return NextResponse.json({ error: 'not a valid image' }, { status: 400 });
  }

  const dir = join(process.cwd(), 'public', 'uploads', 'products');
  await mkdir(dir, { recursive: true });
  const name = `${createId()}.webp`;
  await writeFile(join(dir, name), output);

  return NextResponse.json({ url: `/uploads/products/${name}` });
}
