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
    <>
      {/* Promo bar — scrolls away */}
      <div className='bg-ink text-ink-foreground/70'>
        <Container className='flex h-9 items-center justify-center overflow-hidden text-center text-[11px] font-medium tracking-wide whitespace-nowrap'>
          {t('nav.promo')}
        </Container>
      </div>

      {/* Sticky chrome: dark action row + light category bar */}
      <header className='shadow-lifted sticky top-0 z-40'>
        <div className='bg-ink text-white'>
          <Container className='flex h-16 items-center gap-3 md:gap-4'>
            <Link
              href='/'
              className='font-display shrink-0 text-2xl font-bold tracking-tight text-white'>
              {BRAND.name}
            </Link>

            <div className='flex flex-1 justify-center px-1 md:px-8'>
              <SearchModal placeholder={t('search.placeholder')} />
            </div>

            <div className='flex shrink-0 items-center gap-0.5 md:gap-1'>
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
    </>
  );
}
