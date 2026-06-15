import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { settings } from '@/db/schema';

export type HomepageSettings = {
  hero?: { image?: string; eyebrow?: { en: string; fr: string } };
  carousel?: { image: string }[];
  featuredProductSlugs?: string[];
  featuredCategorySlugs?: string[];
};

export async function getHomepageSettings(): Promise<HomepageSettings | null> {
  const [row] = await db.select().from(settings).where(eq(settings.key, 'homepage')).limit(1);
  return (row?.settingsData as HomepageSettings | undefined) ?? null;
}
