/**
 * Seed the demo catalog. Run with `npm run db:seed`.
 * Uses its own libSQL client (not src/db/index.ts) to avoid the `server-only` import guard.
 */
import { createId } from '@paralleldrive/cuid2';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import bcrypt from 'bcryptjs';
import * as schema from './schema';
import type { LocalizedText } from './schema';

try {
  process.loadEnvFile('.env');
} catch {
  // defaults below cover local dev
}

const client = createClient({
  url: process.env.DATABASE_URL ?? 'file:./data/app.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client, { schema, casing: 'snake_case' });

// Curated, hand-vetted furniture/interior photos (Unsplash CDN) — objects only, no people.
const UNSPLASH = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;

const PHOTOS: Record<string, string[]> = {
  sofas: ['1555041469-a586c61ea9bc', '1567016432779-094069958ea5', '1493663284031-b7e3aefcae8e'],
  'coffee-tables': ['1542372147193-a7aca54189cd', '1600623050499-84929aad17c9', '1581428982868-e410dd047a90'],
  armchairs: ['1580480055273-228ff5388ef8', '1567538096630-e0c55bd6374c', '1586023492125-27b2c045efd7'],
  beds: ['1635594202056-9ea3b497e5c0', '1690957530220-98bacb3c1163', '1560185128-e173042f79dd'],
  nightstands: ['1581428982868-e410dd047a90', '1600623050499-84929aad17c9', '1542372147193-a7aca54189cd'],
  'dining-tables': ['1600623050499-84929aad17c9', '1581428982868-e410dd047a90', '1542372147193-a7aca54189cd'],
  'dining-chairs': ['1581539250439-c96689b516dd', '1612372606404-0ab33e7187ee', '1598300042247-d088f8ab3a91'],
  'pendant-lights': ['1580130281320-0ef0754f2bf7', '1585128719715-46776b56a0d1', '1517991104123-1d56a6e81ed9'],
  'table-lamps': ['1517991104123-1d56a6e81ed9', '1585128719715-46776b56a0d1', '1580130281320-0ef0754f2bf7'],
  rugs: ['1588421874990-1fe162747f9b', '1594040226829-7f251ab46d80', '1599503815079-dfb7085fc667'],
  vases: ['1612196808214-b8e1d6145a8c', '1582131503261-fca1d1c0589f', '1631125915902-d8abe9225ff2'],
  decor: ['1612196808214-b8e1d6145a8c', '1631125915902-d8abe9225ff2', '1582131503261-fca1d1c0589f'],
  'living-room': ['1583847268964-b28dc8f51f92'],
  bedroom: ['1598928506311-c55ded91a20c'],
  dining: ['1600623050499-84929aad17c9'],
  lighting: ['1585128719715-46776b56a0d1'],
};

function imagesFor(catSlug: string, offset: number, n = 3): string[] {
  const pool = PHOTOS[catSlug] ?? PHOTOS.decor;
  return Array.from({ length: n }, (_, i) => UNSPLASH(pool[(offset + i) % pool.length]));
}

function categoryImage(slug: string): string {
  const pool = PHOTOS[slug] ?? PHOTOS.decor;
  return UNSPLASH(pool[0]);
}

type CategorySeed = { slug: string; title: LocalizedText; parent?: string };

const categories: CategorySeed[] = [
  { slug: 'living-room', title: { en: 'Living Room', fr: 'Salon', ar: 'غرفة المعيشة' } },
  { slug: 'bedroom', title: { en: 'Bedroom', fr: 'Chambre', ar: 'غرفة النوم' } },
  { slug: 'dining', title: { en: 'Dining', fr: 'Salle à manger', ar: 'غرفة الطعام' } },
  { slug: 'lighting', title: { en: 'Lighting', fr: 'Luminaires', ar: 'الإضاءة' } },
  { slug: 'decor', title: { en: 'Decor & Accessories', fr: 'Décoration & Accessoires', ar: 'الديكور والإكسسوارات' } },
  // sub-categories
  { slug: 'sofas', title: { en: 'Sofas', fr: 'Canapés', ar: 'أرائك' }, parent: 'living-room' },
  { slug: 'coffee-tables', title: { en: 'Coffee Tables', fr: 'Tables basses', ar: 'طاولات قهوة' }, parent: 'living-room' },
  { slug: 'armchairs', title: { en: 'Armchairs', fr: 'Fauteuils', ar: 'كراسي بذراعين' }, parent: 'living-room' },
  { slug: 'beds', title: { en: 'Beds', fr: 'Lits', ar: 'أسرّة' }, parent: 'bedroom' },
  { slug: 'nightstands', title: { en: 'Nightstands', fr: 'Tables de chevet', ar: 'طاولات جانبية للسرير' }, parent: 'bedroom' },
  { slug: 'dining-tables', title: { en: 'Dining Tables', fr: 'Tables à manger', ar: 'طاولات طعام' }, parent: 'dining' },
  { slug: 'dining-chairs', title: { en: 'Dining Chairs', fr: 'Chaises', ar: 'كراسي طعام' }, parent: 'dining' },
  { slug: 'pendant-lights', title: { en: 'Pendant Lights', fr: 'Suspensions', ar: 'إضاءة معلّقة' }, parent: 'lighting' },
  { slug: 'table-lamps', title: { en: 'Table Lamps', fr: 'Lampes de table', ar: 'مصابيح طاولة' }, parent: 'lighting' },
  { slug: 'rugs', title: { en: 'Rugs', fr: 'Tapis', ar: 'سجّاد' }, parent: 'decor' },
  { slug: 'vases', title: { en: 'Vases', fr: 'Vases', ar: 'مزهريات' }, parent: 'decor' },
];

type ProductSeed = {
  cat: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  priceCents: number;
  discount?: number;
  stock?: number;
  featured?: boolean;
};

const products: ProductSeed[] = [
  // Sofas
  {
    cat: 'sofas',
    slug: 'haven-3-seater-sofa',
    title: { en: 'Haven 3-Seater Sofa', fr: 'Canapé 3 places Haven', ar: 'أريكة هايفن بثلاثة مقاعد' },
    description: {
      en: 'A deep, low-slung sofa in bouclé with solid oak feet.',
      fr: 'Un canapé profond et bas en bouclette, pieds en chêne massif.',
      ar: 'أريكة عميقة ومنخفضة من قماش البوكليه بأرجل من خشب البلوط الصلب.',
    },
    priceCents: 189900,
    stock: 12,
    featured: true,
  },
  {
    cat: 'sofas',
    slug: 'lina-modular-sofa',
    title: { en: 'Lina Modular Sofa', fr: 'Canapé modulable Lina', ar: 'أريكة لينا المعيارية' },
    description: {
      en: 'Reconfigurable modular seating for any room shape.',
      fr: 'Assise modulable et reconfigurable pour toute pièce.',
      ar: 'مقاعد معيارية قابلة لإعادة التشكيل لتناسب أي شكل من أشكال الغرف.',
    },
    priceCents: 244900,
    discount: 15,
    stock: 7,
  },
  {
    cat: 'sofas',
    slug: 'noak-leather-loveseat',
    title: { en: 'Noak Leather Loveseat', fr: 'Causeuse en cuir Noak', ar: 'أريكة نواك الجلدية بمقعدين' },
    description: {
      en: 'Full-grain tan leather that ages beautifully.',
      fr: 'Cuir pleine fleur fauve qui se patine avec le temps.',
      ar: 'جلد طبيعي كامل الحبيبات بلون بنّي يزداد جمالاً مع مرور الوقت.',
    },
    priceCents: 159900,
    stock: 5,
  },
  // Coffee tables
  {
    cat: 'coffee-tables',
    slug: 'fjord-oak-coffee-table',
    title: { en: 'Fjord Oak Coffee Table', fr: 'Table basse en chêne Fjord', ar: 'طاولة قهوة فيورد من خشب البلوط' },
    description: {
      en: 'Sculpted solid oak with a soft matte finish.',
      fr: 'Chêne massif sculpté, finition mate douce.',
      ar: 'خشب بلوط صلب منحوت بلمسة نهائية مطفية ناعمة.',
    },
    priceCents: 64900,
    stock: 20,
    featured: true,
  },
  {
    cat: 'coffee-tables',
    slug: 'mara-travertine-table',
    title: { en: 'Mara Travertine Table', fr: 'Table en travertin Mara', ar: 'طاولة مارا من حجر الترافرتين' },
    description: {
      en: 'Honed travertine with a warm, organic grain.',
      fr: 'Travertin adouci au grain chaud et organique.',
      ar: 'حجر ترافرتين مصقول بعروق دافئة وطبيعية.',
    },
    priceCents: 89900,
    discount: 10,
    stock: 9,
  },
  {
    cat: 'coffee-tables',
    slug: 'orbit-nesting-tables',
    title: { en: 'Orbit Nesting Tables', fr: 'Tables gigognes Orbit', ar: 'طاولات أوربت المتداخلة' },
    description: {
      en: 'A pair of nesting tables in powder-coated steel.',
      fr: 'Paire de tables gigognes en acier thermolaqué.',
      ar: 'زوج من الطاولات المتداخلة من الفولاذ المطلي بالبودرة.',
    },
    priceCents: 42900,
    stock: 18,
  },
  // Armchairs
  {
    cat: 'armchairs',
    slug: 'pebble-lounge-chair',
    title: { en: 'Pebble Lounge Chair', fr: 'Fauteuil lounge Pebble', ar: 'كرسي استرخاء بيبل' },
    description: { en: 'An enveloping lounge chair in soft wool.', fr: 'Fauteuil lounge enveloppant en laine douce.', ar: 'كرسي استرخاء محتضِن من الصوف الناعم.' },
    priceCents: 99900,
    stock: 14,
    featured: true,
  },
  {
    cat: 'armchairs',
    slug: 'sling-accent-chair',
    title: { en: 'Sling Accent Chair', fr: "Fauteuil d'appoint Sling", ar: 'كرسي سلينغ الزخرفي' },
    description: {
      en: 'Leather sling seat on a bentwood frame.',
      fr: 'Assise en cuir suspendu sur cadre en bois courbé.',
      ar: 'مقعد جلدي معلّق على هيكل من الخشب المنحني.',
    },
    priceCents: 74900,
    discount: 20,
    stock: 6,
  },
  // Beds
  {
    cat: 'beds',
    slug: 'dune-platform-bed',
    title: { en: 'Dune Platform Bed', fr: 'Lit plateforme Dune', ar: 'سرير ديون بمنصة' },
    description: {
      en: 'A low platform bed with an upholstered headboard.',
      fr: 'Lit plateforme bas avec tête de lit rembourrée.',
      ar: 'سرير منخفض بمنصة مع لوح رأس منجّد.',
    },
    priceCents: 134900,
    stock: 8,
    featured: true,
  },
  {
    cat: 'beds',
    slug: 'ash-canopy-bed',
    title: { en: 'Ash Canopy Bed', fr: 'Lit à baldaquin Ash', ar: 'سرير آش بمظلّة' },
    description: { en: 'Minimal four-poster in solid ash.', fr: 'Lit à baldaquin minimaliste en frêne massif.', ar: 'سرير بأربعة أعمدة بتصميم بسيط من خشب الدردار الصلب.' },
    priceCents: 179900,
    stock: 4,
  },
  // Nightstands
  {
    cat: 'nightstands',
    slug: 'tide-nightstand',
    title: { en: 'Tide Nightstand', fr: 'Table de chevet Tide', ar: 'طاولة جانبية للسرير تايد' },
    description: {
      en: 'A compact nightstand with a single soft-close drawer.',
      fr: 'Table de chevet compacte, tiroir à fermeture douce.',
      ar: 'طاولة جانبية مدمجة بدرج واحد ذي إغلاق هادئ.',
    },
    priceCents: 34900,
    stock: 25,
  },
  {
    cat: 'nightstands',
    slug: 'cane-bedside-table',
    title: { en: 'Cane Bedside Table', fr: 'Table de chevet Cannage', ar: 'طاولة سرير جانبية من الخيزران' },
    description: {
      en: 'Woven cane front with a warm oak frame.',
      fr: 'Façade en cannage tressé, structure en chêne chaud.',
      ar: 'واجهة من الخيزران المنسوج مع هيكل من خشب البلوط الدافئ.',
    },
    priceCents: 39900,
    discount: 10,
    stock: 16,
  },
  // Dining tables
  {
    cat: 'dining-tables',
    slug: 'grove-dining-table',
    title: { en: 'Grove Dining Table', fr: 'Table à manger Grove', ar: 'طاولة طعام غروف' },
    description: {
      en: 'Seats six around a single solid-oak plank top.',
      fr: 'Six convives autour d’un plateau en chêne massif.',
      ar: 'تتسع لستة أشخاص حول سطح من لوح واحد من خشب البلوط الصلب.',
    },
    priceCents: 154900,
    stock: 6,
    featured: true,
  },
  {
    cat: 'dining-tables',
    slug: 'pillar-round-table',
    title: { en: 'Pillar Round Table', fr: 'Table ronde Pillar', ar: 'طاولة بيلار المستديرة' },
    description: { en: 'A pedestal round table in micro-cement.', fr: 'Table ronde sur pied central en micro-ciment.', ar: 'طاولة مستديرة بقاعدة مركزية من الميكرو إسمنت.' },
    priceCents: 119900,
    stock: 7,
  },
  // Dining chairs
  {
    cat: 'dining-chairs',
    slug: 'wren-dining-chair',
    title: { en: 'Wren Dining Chair', fr: 'Chaise Wren', ar: 'كرسي طعام رِن' },
    description: {
      en: 'A curved, stackable chair in molded plywood.',
      fr: 'Chaise galbée et empilable en contreplaqué moulé.',
      ar: 'كرسي منحني قابل للتكديس من الخشب الرقائقي المقولب.',
    },
    priceCents: 18900,
    stock: 40,
  },
  {
    cat: 'dining-chairs',
    slug: 'spindle-side-chair',
    title: { en: 'Spindle Side Chair', fr: 'Chaise Spindle', ar: 'كرسي سبيندل الجانبي' },
    description: {
      en: 'A modern take on the classic spindle-back.',
      fr: 'Réinterprétation moderne du dossier à barreaux.',
      ar: 'رؤية عصرية لظهر الكرسي الكلاسيكي ذي القضبان.',
    },
    priceCents: 22900,
    discount: 15,
    stock: 30,
  },
  // Pendant lights
  {
    cat: 'pendant-lights',
    slug: 'halo-pendant-light',
    title: { en: 'Halo Pendant Light', fr: 'Suspension Halo', ar: 'إضاءة معلّقة هالو' },
    description: {
      en: 'A frosted glass globe on a slim brass stem.',
      fr: 'Globe en verre dépoli sur tige fine en laiton.',
      ar: 'كرة من الزجاج المصنفر على ساق نحيلة من النحاس الأصفر.',
    },
    priceCents: 24900,
    stock: 22,
    featured: true,
  },
  {
    cat: 'pendant-lights',
    slug: 'paper-cloud-pendant',
    title: { en: 'Paper Cloud Pendant', fr: 'Suspension Paper Cloud', ar: 'إضاءة معلّقة بيبر كلاود' },
    description: {
      en: 'A sculptural rice-paper shade that diffuses softly.',
      fr: 'Abat-jour sculptural en papier de riz, lumière douce.',
      ar: 'غطاء فني من ورق الأرز ينشر الضوء بنعومة.',
    },
    priceCents: 16900,
    stock: 28,
  },
  // Table lamps
  {
    cat: 'table-lamps',
    slug: 'mushroom-table-lamp',
    title: { en: 'Mushroom Table Lamp', fr: 'Lampe champignon', ar: 'مصباح طاولة على شكل فطر' },
    description: { en: 'A retro dome lamp in glazed ceramic.', fr: 'Lampe dôme rétro en céramique émaillée.', ar: 'مصباح قبّة بطراز كلاسيكي من السيراميك المزجّج.' },
    priceCents: 12900,
    discount: 10,
    stock: 35,
  },
  {
    cat: 'table-lamps',
    slug: 'arc-reading-lamp',
    title: { en: 'Arc Reading Lamp', fr: 'Lampe de lecture Arc', ar: 'مصباح قراءة آرك' },
    description: {
      en: 'An adjustable arc lamp with a warm dimmable LED.',
      fr: 'Lampe arc réglable, LED chaude et variable.',
      ar: 'مصباح مقوّس قابل للتعديل بإضاءة LED دافئة قابلة للتعتيم.',
    },
    priceCents: 14900,
    stock: 19,
  },
  // Rugs
  {
    cat: 'rugs',
    slug: 'dune-wool-rug',
    title: { en: 'Dune Wool Rug', fr: 'Tapis en laine Dune', ar: 'سجادة صوف ديون' },
    description: {
      en: 'A hand-tufted wool rug in warm sand tones.',
      fr: 'Tapis en laine tufté main, tons sable chauds.',
      ar: 'سجادة صوف منسوجة يدوياً بدرجات رملية دافئة.',
    },
    priceCents: 49900,
    stock: 15,
    featured: true,
  },
  {
    cat: 'rugs',
    slug: 'grid-flatweave-rug',
    title: { en: 'Grid Flatweave Rug', fr: 'Tapis tissé plat Grid', ar: 'سجادة منسوجة مسطحة غريد' },
    description: {
      en: 'A low-pile flatweave with a subtle grid motif.',
      fr: 'Tissage plat ras au motif de grille discret.',
      ar: 'سجادة مسطحة قصيرة الوبر بنقشة شبكية خفيفة.',
    },
    priceCents: 34900,
    discount: 25,
    stock: 11,
  },
  // Vases
  {
    cat: 'vases',
    slug: 'ripple-stoneware-vase',
    title: { en: 'Ripple Stoneware Vase', fr: 'Vase en grès Ripple', ar: 'مزهرية ريبل من الخزف الحجري' },
    description: {
      en: 'A wheel-thrown vase with a rippled reactive glaze.',
      fr: 'Vase tourné à la main, émail réactif ondulé.',
      ar: 'مزهرية مشكّلة على عجلة الفخار بطلاء تفاعلي متموّج.',
    },
    priceCents: 8900,
    stock: 50,
  },
  {
    cat: 'vases',
    slug: 'totem-ceramic-vase',
    title: { en: 'Totem Ceramic Vase', fr: 'Vase céramique Totem', ar: 'مزهرية توتيم من السيراميك' },
    description: {
      en: 'A sculptural stacked-form vase in matte clay.',
      fr: 'Vase sculptural en argile mate, formes empilées.',
      ar: 'مزهرية فنية بأشكال متراكمة من الطين المطفي.',
    },
    priceCents: 10900,
    stock: 33,
  },
  {
    cat: 'vases',
    slug: 'bud-glass-vase-set',
    title: { en: 'Bud Glass Vase Set', fr: 'Set de vases soliflores', ar: 'طقم مزهريات زجاجية صغيرة' },
    description: {
      en: 'A trio of hand-blown bud vases in smoked glass.',
      fr: 'Trio de soliflores soufflés bouche, verre fumé.',
      ar: 'ثلاثية من المزهريات الصغيرة المنفوخة يدوياً من الزجاج المدخّن.',
    },
    priceCents: 6900,
    stock: 44,
  },
  // A few more for breadth
  {
    cat: 'sofas',
    slug: 'cloud-daybed',
    title: { en: 'Cloud Daybed', fr: 'Méridienne Cloud', ar: 'أريكة استلقاء كلاود' },
    description: {
      en: 'A versatile daybed for lounging or guests.',
      fr: 'Méridienne polyvalente pour se détendre ou recevoir.',
      ar: 'أريكة استلقاء متعددة الاستخدامات للراحة أو استقبال الضيوف.',
    },
    priceCents: 129900,
    stock: 6,
  },
  {
    cat: 'coffee-tables',
    slug: 'plinth-side-table',
    title: { en: 'Plinth Side Table', fr: "Table d'appoint Plinth", ar: 'طاولة جانبية بلينث' },
    description: { en: 'A monolithic side table in solid timber.', fr: "Table d'appoint monolithique en bois massif.", ar: 'طاولة جانبية أحادية الكتلة من الخشب الصلب.' },
    priceCents: 29900,
    stock: 21,
  },
  {
    cat: 'decor',
    slug: 'linen-throw-blanket',
    title: { en: 'Linen Throw Blanket', fr: 'Plaid en lin', ar: 'بطانية كتان' },
    description: { en: 'A stonewashed linen throw with fringed edges.', fr: 'Plaid en lin lavé à bords frangés.', ar: 'بطانية من الكتان المغسول بحجر ذات حواف مهدّبة.' },
    priceCents: 11900,
    discount: 10,
    stock: 60,
  },
  {
    cat: 'decor',
    slug: 'walnut-wall-mirror',
    title: { en: 'Walnut Wall Mirror', fr: 'Miroir mural noyer', ar: 'مرآة حائط من خشب الجوز' },
    description: { en: 'A round mirror framed in solid walnut.', fr: 'Miroir rond encadré de noyer massif.', ar: 'مرآة مستديرة بإطار من خشب الجوز الصلب.' },
    priceCents: 22900,
    stock: 17,
  },
];

const reviewBlurbs = [
  { rating: 5, title: 'Beautiful piece', body: 'Even better in person — the quality is excellent.' },
  { rating: 5, title: 'Worth it', body: 'Solid, well made, and ships well packaged.' },
  { rating: 4, title: 'Lovely', body: 'Really happy with it, just slightly smaller than I imagined.' },
  { rating: 4, title: 'Great value', body: 'Looks far more expensive than it is.' },
  { rating: 5, title: 'Highlight of the room', body: 'Everyone asks where it’s from.' },
];

async function seed() {
  console.log('Clearing existing data…');
  // Child → parent order (cascades would cover most, but be explicit).
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.reviews);
  await db.delete(schema.cartItems);
  await db.delete(schema.carts);
  await db.delete(schema.wishlistItems);
  await db.delete(schema.wishlists);
  await db.delete(schema.productImages);
  await db.delete(schema.products);
  await db.delete(schema.categories);
  await db.delete(schema.userRoles);
  await db.delete(schema.users);
  await db.delete(schema.roles);
  await db.delete(schema.currencies);
  await db.delete(schema.settings);

  console.log('Seeding roles & users…');
  const roleIds = { user: createId(), moderator: createId(), admin: createId() };
  await db.insert(schema.roles).values([
    { id: roleIds.user, name: 'user' },
    { id: roleIds.moderator, name: 'moderator' },
    { id: roleIds.admin, name: 'admin' },
  ]);

  const passwordHash = bcrypt.hashSync('password123', 10);
  const admin = { id: createId(), email: 'admin@norden.example', firstName: 'Avery', lastName: 'Stone' };
  const customers = [
    { id: createId(), email: 'customer@norden.example', firstName: 'Jordan', lastName: 'Lee' },
    { id: createId(), email: 'mara@norden.example', firstName: 'Mara', lastName: 'Holt' },
    { id: createId(), email: 'theo@norden.example', firstName: 'Theo', lastName: 'Vance' },
    { id: createId(), email: 'ines@norden.example', firstName: 'Inès', lastName: 'Roy' },
  ];
  await db.insert(schema.users).values(
    [admin, ...customers].map((u) => ({
      id: u.id,
      email: u.email,
      passwordHash,
      firstName: u.firstName,
      lastName: u.lastName,
      telephone: '+1 555 0100',
      city: 'Copenhagen',
    })),
  );
  await db
    .insert(schema.userRoles)
    .values([
      { userId: admin.id, roleId: roleIds.admin },
      { userId: admin.id, roleId: roleIds.user },
      ...customers.map((c) => ({ userId: c.id, roleId: roleIds.user })),
    ]);

  console.log('Seeding currencies…');
  await db.insert(schema.currencies).values([
    { code: 'USD', symbol: '$', rateToBase: 1_000_000, isDefault: true },
    { code: 'EUR', symbol: '€', rateToBase: 920_000 },
    { code: 'TND', symbol: 'DT', rateToBase: 3_100_000 },
  ]);

  console.log('Seeding categories…');
  const categoryIds = new Map<string, string>();
  for (const c of categories) categoryIds.set(c.slug, createId());
  const categoryRows: (typeof schema.categories.$inferInsert)[] = [];
  for (const [i, c] of categories.entries()) {
    categoryRows.push({
      id: categoryIds.get(c.slug)!,
      slug: c.slug,
      title: c.title,
      parentCategoryId: c.parent ? categoryIds.get(c.parent) : null,
      sortOrder: i,
      image: categoryImage(c.slug),
    });
  }
  await db.insert(schema.categories).values(categoryRows);

  console.log('Seeding products & images (fetching furniture photos)…');
  const productRows: (typeof schema.products.$inferInsert)[] = [];
  const imageRows: (typeof schema.productImages.$inferInsert)[] = [];
  const catOffset = new Map<string, number>();
  for (const p of products) {
    const id = createId();
    const offset = catOffset.get(p.cat) ?? 0;
    catOffset.set(p.cat, offset + 1);
    const urls = imagesFor(p.cat, offset);
    productRows.push({
      id,
      reference: `NRD-${p.slug.slice(0, 6).toUpperCase()}`,
      slug: p.slug,
      title: p.title,
      description: p.description,
      thumbnail: urls[0],
      priceCents: p.priceCents,
      currency: 'USD',
      shippingCostCents: p.priceCents > 50000 ? 0 : 1500,
      discountPercentage: p.discount ?? 0,
      stock: p.stock ?? 10,
      isFeatured: p.featured ?? false,
      categoryId: categoryIds.get(p.cat)!,
      createdById: admin.id,
    });
    urls.forEach((url, i) =>
      imageRows.push({ id: createId(), productId: id, url, alt: p.title.en, width: 800, height: 800, sortOrder: i }),
    );
  }
  await db.insert(schema.products).values(productRows);
  await db.insert(schema.productImages).values(imageRows);

  console.log('Seeding reviews…');
  const ratingAgg = new Map<string, { sum: number; count: number }>();
  const reviewRows: (typeof schema.reviews.$inferInsert)[] = [];
  productRows.forEach((p, idx) => {
    if (idx % 2 !== 0) return; // review roughly half the catalog
    const pid = p.id as string;
    const n = 1 + (idx % 3); // 1..3 reviews
    for (let i = 0; i < n; i++) {
      const reviewer = customers[(idx + i) % customers.length];
      const blurb = reviewBlurbs[(idx + i) % reviewBlurbs.length];
      reviewRows.push({
        id: createId(),
        productId: pid,
        userId: reviewer.id,
        rating: blurb.rating,
        title: blurb.title,
        body: blurb.body,
        isVerifiedPurchase: true,
      });
      const agg = ratingAgg.get(pid) ?? { sum: 0, count: 0 };
      agg.sum += blurb.rating;
      agg.count += 1;
      ratingAgg.set(pid, agg);
    }
  });
  if (reviewRows.length) await db.insert(schema.reviews).values(reviewRows);

  // Recompute denormalized rating fields.
  const { eq } = await import('drizzle-orm');
  for (const [productId, agg] of ratingAgg) {
    await db
      .update(schema.products)
      .set({ ratingAvg: Math.round((agg.sum / agg.count) * 10) / 10, ratingCount: agg.count })
      .where(eq(schema.products.id, productId));
  }

  console.log('Seeding homepage settings…');
  const featuredSlugs = products.filter((p) => p.featured).map((p) => p.slug);
  await db.insert(schema.settings).values({
    key: 'homepage',
    settingsData: {
      hero: {
        image: UNSPLASH('1583847268964-b28dc8f51f92'),
        eyebrow: { en: 'New collection', fr: 'Nouvelle collection', ar: 'مجموعة جديدة' },
      },
      carousel: [
        { image: UNSPLASH('1618220179428-22790b461013') },
        { image: UNSPLASH('1598928506311-c55ded91a20c') },
        { image: categoryImage('sofas') },
      ],
      featuredProductSlugs: featuredSlugs,
      featuredCategorySlugs: ['living-room', 'lighting', 'bedroom', 'decor'],
    },
  });

  console.log(
    `✅ Seed complete: ${categories.length} categories, ${productRows.length} products, ${imageRows.length} images, ${reviewRows.length} reviews, ${customers.length + 1} users.`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
