'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * Client providers. HeroUI v3 needs NO provider; we only wire next-themes for dark mode.
 * `attribute="class"` matches HeroUI's `.dark` selector and our Tailwind `dark:` variant.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
