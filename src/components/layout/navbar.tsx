import { getTranslations } from 'next-intl/server';
import { IconSearch, IconUser } from '@/components/ui/icons';
import { CartButton } from '@/features/cart/cartButton';
import { Container } from '@/components/ui/container';
import { ThemeToggle } from '@/components/ui/themeToggle';
import { CurrencySwitcher } from '@/features/currency/currencySwitcher';
import { getTopCategories } from '@/features/categories/categories.repo';
import { Link } from '@/i18n/navigation';
import { BRAND } from '@/lib/brand';
import { pickLocale } from '@/lib/content';
import { LocaleSwitcher } from './localeSwitcher';

const iconBtn =
  'grid size-9 place-items-center rounded-lg text-foreground transition-colors hover:bg-surface-secondary';

export async function Navbar({ locale }: { locale: string }) {
  const t = await getTranslations();
  const categories = await getTopCategories();

  return (
    <header className='bg-background/80 border-border sticky top-0 z-40 border-b backdrop-blur-md'>
      <Container className='flex h-16 items-center gap-6'>
        <Link href='/' className='font-display text-xl font-medium tracking-tight'>
          {BRAND.name}
        </Link>

        <nav className='hidden items-center gap-5 text-sm md:flex'>
          <Link href='/products' className='hover:text-accent transition-colors'>
            {t('nav.shop')}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className='text-muted hover:text-foreground transition-colors'>
              {pickLocale(c.title, locale)}
            </Link>
          ))}
        </nav>

        <div className='ml-auto flex items-center gap-0.5'>
          <Link href='/search' aria-label={t('common.search')} className={iconBtn}>
            <IconSearch />
          </Link>
          <CurrencySwitcher />
          <LocaleSwitcher />
          <ThemeToggle />
          <Link href='/account' aria-label={t('nav.account')} className={iconBtn}>
            <IconUser />
          </Link>
          <CartButton locale={locale} label={t('nav.cart')} title={t('cart.title')} />
        </div>
      </Container>
    </header>
  );
}
