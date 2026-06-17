import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { IconHeart, IconUser } from '@/components/ui/icons';
import { CartButton } from '@/features/cart/cartButton';
import { getNavCategories } from '@/features/categories/categories.repo';
import { CurrencySwitcher } from '@/features/currency/currencySwitcher';
import { SearchModal } from '@/features/search/searchModal';
import { Link } from '@/i18n/navigation';
import { BRAND } from '@/lib/brand';
import { CategoryNav } from './categoryNav';
import { LocaleSwitcher } from './localeSwitcher';

const iconBtn =
  'grid size-9 place-items-center rounded-md text-white/85 transition-colors hover:bg-white/10 hover:text-white';

export async function Navbar({ locale }: { locale: string }) {
  const t = await getTranslations();
  const categories = await getNavCategories();
  const navCategories = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    children: c.children.map((ch) => ({ id: ch.id, slug: ch.slug, title: ch.title })),
  }));

  return (
    /* Sticky chrome: dark action row + light category bar */
    <header className='shadow-lifted sticky top-0 z-40'>
      <div className='bg-ink text-white'>
        <Container className='grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-4'>
          <Link
            href='/'
            className='font-display justify-self-start text-2xl font-bold tracking-tight text-white'>
            {BRAND.name}
          </Link>

          <div className='flex justify-center px-1'>
            <SearchModal placeholder={t('search.placeholder')} />
          </div>

          <div className='flex items-center justify-self-end gap-0.5 md:gap-1'>
            <CurrencySwitcher />
            <LocaleSwitcher />
            <Link href='/wishlist' aria-label={t('nav.wishlist')} className={iconBtn}>
              <IconHeart />
            </Link>
            <Link href='/account' aria-label={t('nav.account')} className={iconBtn}>
              <IconUser />
            </Link>
            <CartButton locale={locale} label={t('nav.cart')} title={t('cart.title')} />
          </div>
        </Container>
      </div>

      <div className='bg-surface border-border text-foreground hidden border-b md:block'>
        <Container>
          <CategoryNav categories={navCategories} shopLabel={t('nav.shop')} />
        </Container>
      </div>
    </header>
  );
}
