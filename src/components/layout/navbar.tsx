import { getTranslations } from 'next-intl/server';
import { IconHeart, IconUser } from '@/components/ui/icons';
import { Container } from '@/components/ui/container';
import { CartButton } from '@/features/cart/cartButton';
import { CurrencySwitcher } from '@/features/currency/currencySwitcher';
import { getNavCategories } from '@/features/categories/categories.repo';
import { SearchModal } from '@/features/search/searchModal';
import { Link } from '@/i18n/navigation';
import { BRAND } from '@/lib/brand';
import { CategoryNav } from './categoryNav';
import { LocaleSwitcher } from './localeSwitcher';

const iconBtn =
  'grid size-9 place-items-center rounded-lg text-foreground transition-colors hover:bg-surface-secondary';

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
    <header className='bg-surface border-border sticky top-0 z-40 border-b'>
      <Container className='flex h-16 items-center gap-4'>
        <Link href='/' className='font-display shrink-0 text-xl font-semibold tracking-tight'>
          {BRAND.name}
        </Link>

        <div className='flex flex-1 justify-center px-1 md:px-8'>
          <SearchModal placeholder={t('search.placeholder')} />
        </div>

        <div className='flex shrink-0 items-center gap-1'>
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

      <div className='border-border hidden border-t md:block'>
        <Container>
          <CategoryNav categories={navCategories} shopLabel={t('nav.shop')} />
        </Container>
      </div>
    </header>
  );
}
