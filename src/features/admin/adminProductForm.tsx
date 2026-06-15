'use client';

import { Button } from '@heroui/react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { createProductAction, deleteProductAction, updateProductAction } from '@/features/admin/admin.actions';
import { ImageUploader } from '@/features/admin/imageUploader';
import { useRouter } from '@/i18n/navigation';

const inputClass =
  'border-border bg-surface focus:border-accent w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors';

export type ProductFormData = {
  id?: string;
  titleEn: string;
  titleFr: string;
  descriptionEn: string;
  descriptionFr: string;
  reference: string;
  price: number;
  discountPercentage: number;
  stock: number;
  categoryId: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  images: string[];
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className='flex flex-col gap-1.5 text-sm font-medium'>
      {label}
      {children}
    </label>
  );
}

export function AdminProductForm({
  categories,
  product,
}: {
  categories: { id: string; label: string }[];
  product?: ProductFormData;
}) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(product?.images ?? []);
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
      descriptionEn: String(fd.get('descriptionEn') || ''),
      descriptionFr: String(fd.get('descriptionFr') || ''),
      reference: String(fd.get('reference') || ''),
      price: Number(fd.get('price') || 0),
      discountPercentage: Number(fd.get('discountPercentage') || 0),
      stock: Number(fd.get('stock') || 0),
      currency: 'USD',
      categoryId: String(fd.get('categoryId') || '') || null,
      isFeatured: fd.get('isFeatured') === 'on',
      isPublished: fd.get('isPublished') === 'on',
      images,
    };
    const res = product?.id ? await updateProductAction(product.id, input) : await createProductAction(input);
    if (!res.ok) {
      setError(res.error);
      setPending(false);
      return;
    }
    router.push('/admin/products');
  }

  async function onDelete() {
    if (!product?.id || !confirm('Delete this product?')) return;
    await deleteProductAction(product.id);
    router.push('/admin/products');
  }

  return (
    <form onSubmit={onSubmit} className='flex max-w-2xl flex-col gap-5'>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='Title (EN)'>
          <input name='titleEn' defaultValue={product?.titleEn} required className={inputClass} />
        </Field>
        <Field label='Title (FR)'>
          <input name='titleFr' defaultValue={product?.titleFr} required className={inputClass} />
        </Field>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='Description (EN)'>
          <textarea
            name='descriptionEn'
            defaultValue={product?.descriptionEn}
            required
            rows={3}
            className={inputClass}
          />
        </Field>
        <Field label='Description (FR)'>
          <textarea
            name='descriptionFr'
            defaultValue={product?.descriptionFr}
            required
            rows={3}
            className={inputClass}
          />
        </Field>
      </div>
      <div className='grid grid-cols-3 gap-3'>
        <Field label='Price (USD)'>
          <input
            name='price'
            type='number'
            step='0.01'
            min='0'
            defaultValue={product?.price}
            required
            className={inputClass}
          />
        </Field>
        <Field label='Discount %'>
          <input
            name='discountPercentage'
            type='number'
            min='0'
            max='100'
            defaultValue={product?.discountPercentage ?? 0}
            className={inputClass}
          />
        </Field>
        <Field label='Stock'>
          <input name='stock' type='number' min='0' defaultValue={product?.stock ?? 0} className={inputClass} />
        </Field>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='Category'>
          <select name='categoryId' defaultValue={product?.categoryId ?? ''} className={inputClass}>
            <option value=''>—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label='Reference'>
          <input name='reference' defaultValue={product?.reference} placeholder='auto' className={inputClass} />
        </Field>
      </div>
      <Field label='Images'>
        <ImageUploader value={images} onChange={setImages} />
      </Field>
      <div className='flex gap-6'>
        <label className='flex items-center gap-2 text-sm'>
          <input type='checkbox' name='isPublished' defaultChecked={product?.isPublished ?? true} /> Published
        </label>
        <label className='flex items-center gap-2 text-sm'>
          <input type='checkbox' name='isFeatured' defaultChecked={product?.isFeatured ?? false} /> Featured
        </label>
      </div>
      {error && <p className='text-danger text-sm'>Error: {error}</p>}
      <div className='flex gap-3'>
        <Button type='submit' variant='primary' isDisabled={pending}>
          {product?.id ? 'Save changes' : 'Create product'}
        </Button>
        {product?.id && (
          <Button type='button' variant='ghost' onPress={onDelete} className='text-danger'>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
