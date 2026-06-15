'use client';

import Image from 'next/image';
import { type ChangeEvent, useState } from 'react';

export function ImageUploader({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [uploading, setUploading] = useState(false);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.set('file', f);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) urls.push((await res.json()).url);
    }
    onChange([...value, ...urls]);
    setUploading(false);
    e.target.value = '';
  }

  return (
    <div className='flex flex-wrap gap-2'>
      {value.map((url, i) => (
        <div key={url} className='border-border relative size-20 overflow-hidden rounded-lg border'>
          <Image src={url} alt='' fill sizes='80px' className='object-cover' />
          <button
            type='button'
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            aria-label='Remove image'
            className='absolute top-0 right-0 bg-black/60 px-1.5 text-xs text-white'>
            ×
          </button>
          {i === 0 && (
            <span className='bg-accent text-accent-foreground absolute bottom-0 left-0 px-1 text-[10px]'>cover</span>
          )}
        </div>
      ))}
      <label className='border-border text-muted hover:bg-surface-secondary grid size-20 cursor-pointer place-items-center rounded-lg border border-dashed text-2xl transition-colors'>
        {uploading ? '…' : '+'}
        <input type='file' accept='image/*' multiple onChange={onFile} className='hidden' />
      </label>
    </div>
  );
}
