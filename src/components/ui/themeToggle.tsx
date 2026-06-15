'use client';

import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

/**
 * Light/dark switch backed by next-themes. The icon is chosen purely via the `dark:`
 * variant (driven by the `.dark` class), so there's no hydration mismatch and no effect.
 */
export function ThemeToggle() {
  const t = useTranslations('theme');
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant='ghost'
      size='sm'
      isIconOnly
      aria-label={t('toggle')}
      onPress={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
      <span className='inline dark:hidden'>☾</span>
      <span className='hidden dark:inline'>☀</span>
    </Button>
  );
}
