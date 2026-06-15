export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className='border-border flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center'>
      <p className='font-display text-xl'>{title}</p>
      {hint && <p className='text-muted mt-1 text-sm'>{hint}</p>}
    </div>
  );
}
