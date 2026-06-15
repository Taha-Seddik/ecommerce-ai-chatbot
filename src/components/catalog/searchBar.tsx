import { getTranslations } from 'next-intl/server';
import { IconSearch } from '@/components/ui/icons';

/** Native GET form — works without JS, navigates to /{locale}/search?q=… */
export async function SearchBar({ locale, defaultValue }: { locale: string; defaultValue?: string }) {
  const t = await getTranslations('search');
  return (
    <form action={`/${locale}/search`} method='get' className='relative'>
      <IconSearch className='text-muted pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2' />
      <input
        name='q'
        defaultValue={defaultValue}
        placeholder={t('placeholder')}
        aria-label={t('title')}
        className='border-border bg-surface focus:border-accent h-12 w-full rounded-full border pr-4 pl-12 text-sm transition-colors outline-none'
      />
    </form>
  );
}
