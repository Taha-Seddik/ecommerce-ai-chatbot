'use client';

import { Button } from '@heroui/react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from '@/features/admin/admin.actions';
import { useRouter } from '@/i18n/navigation';

const inputClass =
  'border-border bg-surface focus:border-accent w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors';

export type CategoryFormData = {
  id?: string;
  titleEn: string;
  titleFr: string;
  slug: string;
  parentCategoryId: string | null;
  sortOrder: number;
  show: boolean;
  image: string;
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className='flex flex-col gap-1.5 text-sm font-medium'>
      {label}
      {children}
    </label>
  );
}

export function AdminCategoryForm({
  parents,
  category,
}: {
  parents: { id: string; label: string }[];
  category?: CategoryFormData;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const input = {
      titleEn: String(fd.get('titleEn') || ''),
      titleFr: String(fd.get('titleFr') || ''),
      slug: String(fd.get('slug') || ''),
      parentCategoryId: String(fd.get('parentCategoryId') || '') || null,
      sortOrder: Number(fd.get('sortOrder') || 0),
      show: fd.get('show') === 'on',
      image: String(fd.get('image') || ''),
    };
    const res = category?.id ? await updateCategoryAction(category.id, input) : await createCategoryAction(input);
    if (!res.ok) {
      setError(res.error);
      setPending(false);
      return;
    }
    router.push('/admin/categories');
  }

  async function onDelete() {
    if (!category?.id || !confirm('Delete this category?')) return;
    await deleteCategoryAction(category.id);
    router.push('/admin/categories');
  }

  return (
    <form onSubmit={onSubmit} className='flex max-w-xl flex-col gap-5'>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='Title (EN)'>
          <input name='titleEn' defaultValue={category?.titleEn} required className={inputClass} />
        </Field>
        <Field label='Title (FR)'>
          <input name='titleFr' defaultValue={category?.titleFr} required className={inputClass} />
        </Field>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='Slug (optional)'>
          <input name='slug' defaultValue={category?.slug} placeholder='auto' className={inputClass} />
        </Field>
        <Field label='Parent'>
          <select name='parentCategoryId' defaultValue={category?.parentCategoryId ?? ''} className={inputClass}>
            <option value=''>— (top level)</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='Sort order'>
          <input name='sortOrder' type='number' defaultValue={category?.sortOrder ?? 0} className={inputClass} />
        </Field>
        <Field label='Image URL (optional)'>
          <input name='image' defaultValue={category?.image} className={inputClass} />
        </Field>
      </div>
      <label className='flex items-center gap-2 text-sm'>
        <input type='checkbox' name='show' defaultChecked={category?.show ?? true} /> Visible
      </label>
      {error && <p className='text-danger text-sm'>Error: {error}</p>}
      <div className='flex gap-3'>
        <Button type='submit' variant='primary' isDisabled={pending}>
          {category?.id ? 'Save changes' : 'Create category'}
        </Button>
        {category?.id && (
          <Button type='button' variant='ghost' onPress={onDelete} className='text-danger'>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
