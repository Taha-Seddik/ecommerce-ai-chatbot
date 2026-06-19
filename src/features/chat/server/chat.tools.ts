import 'server-only';
import type OpenAI from 'openai';
import { searchProducts } from '@/features/products/products.repo';
import { getNavCategories } from '@/features/categories/categories.repo';
import { pickLocale } from '@/lib/content';
import { formatPrice } from '@/lib/money';
import type { ChatProductCardData } from '../chat.types';

/** Tool (function) schemas advertised to the model. Descriptions are prescriptive about WHEN to
 *  call — smaller models reach for tools more reliably when the trigger conditions are explicit. */
export const CHAT_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description:
        'Search the live Norden catalogue. Call this whenever the shopper asks about products, ' +
        'wants recommendations, or mentions a need (e.g. "a rug for my living room", "something under $200"). ' +
        'Always search before naming or recommending a product — never invent products or prices. ' +
        'Returns real, in-stock-aware items, each with a `slug` you can show as a card.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Keywords matched against product names & descriptions, e.g. "oak dining table", "wool throw".',
          },
          category: {
            type: 'string',
            description: 'Optional category slug to narrow the search (get valid slugs from list_categories).',
          },
          min_price: { type: 'number', description: 'Optional minimum price in US dollars.' },
          max_price: { type: 'number', description: 'Optional maximum price in US dollars.' },
          in_stock_only: { type: 'boolean', description: 'If true, only return products currently in stock.' },
          limit: { type: 'integer', description: 'How many products to return, 1–8. Default 6.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_categories',
      description:
        'List the store\'s product categories and their slugs. Call this when the shopper asks "what do you sell?", ' +
        'wants to browse, or when you need a valid category slug to pass to search_products.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
];

type ToolOutcome = { resultText: string; found: ChatProductCardData[] };

function clampLimit(value: unknown): number {
  const n = typeof value === 'number' ? Math.floor(value) : 6;
  return Math.min(8, Math.max(1, Number.isFinite(n) ? n : 6));
}

async function searchTool(input: Record<string, unknown>, locale: string): Promise<ToolOutcome> {
  const limit = clampLimit(input.limit);
  const { rows } = await searchProducts({
    q: typeof input.query === 'string' ? input.query : undefined,
    categorySlug: typeof input.category === 'string' ? input.category : undefined,
    minPrice: typeof input.min_price === 'number' ? input.min_price : undefined,
    maxPrice: typeof input.max_price === 'number' ? input.max_price : undefined,
    inStock: input.in_stock_only === true,
    page: 1,
  });

  const top = rows.slice(0, limit);
  const found: ChatProductCardData[] = top.map((p) => ({
    slug: p.slug,
    title: pickLocale(p.title, locale),
    thumbnail: p.thumbnail,
    priceCents: p.priceCents,
    discountPercentage: p.discountPercentage,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    inStock: p.stock > 0,
  }));

  if (!found.length) {
    return { resultText: 'No matching products were found. Suggest the shopper broaden their search.', found };
  }

  // Compact, model-friendly summary. The `slug` is what the assistant must echo as `::product[slug]`.
  const lines = found.map((p) => {
    const price = formatPrice(Math.round(p.priceCents * (1 - p.discountPercentage / 100)), 'USD', 'en');
    const rating = p.ratingCount > 0 ? `, rated ${p.ratingAvg.toFixed(1)}/5 (${p.ratingCount})` : '';
    const stock = p.inStock ? 'in stock' : 'out of stock';
    const off = p.discountPercentage > 0 ? `, ${p.discountPercentage}% off` : '';
    return `- slug: ${p.slug} | ${p.title} | ${price} (base USD)${off} | ${stock}${rating}`;
  });
  return { resultText: `Found ${found.length} product(s):\n${lines.join('\n')}`, found };
}

async function categoriesTool(locale: string): Promise<ToolOutcome> {
  const cats = await getNavCategories();
  const lines = cats.map((c) => {
    const children = c.children.map((ch) => `${pickLocale(ch.title, locale)} (slug: ${ch.slug})`).join(', ');
    const base = `- ${pickLocale(c.title, locale)} (slug: ${c.slug})`;
    return children ? `${base} — subcategories: ${children}` : base;
  });
  return { resultText: `Categories:\n${lines.join('\n')}`, found: [] };
}

/** Execute a tool call by name. Unknown/failed tools return an error string (not thrown) so the loop continues. */
export async function runChatTool(name: string, input: unknown, locale: string): Promise<ToolOutcome> {
  const args = (input ?? {}) as Record<string, unknown>;
  try {
    if (name === 'search_products') return await searchTool(args, locale);
    if (name === 'list_categories') return await categoriesTool(locale);
    return { resultText: `Unknown tool: ${name}`, found: [] };
  } catch {
    return { resultText: `The ${name} tool failed. Apologise briefly and suggest browsing the shop.`, found: [] };
  }
}
