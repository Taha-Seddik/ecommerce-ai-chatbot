'use server';

import { headers } from 'next/headers';
import OpenAI from 'openai';
import { env } from '@/lib/env';
import { BRAND } from '@/lib/brand';
import { CHAT_TOOLS, runChatTool } from './chat.tools';
import {
  MAX_HISTORY_TURNS,
  MAX_MESSAGE_CHARS,
  PRODUCT_MARKER,
  type ChatProductCardData,
  type ChatResult,
  type ChatTurn,
} from './chat.types';

const MAX_TOOL_ROUNDS = 4;
const MAX_COMPLETION_TOKENS = 2048;
const REQUEST_TIMEOUT_MS = 30_000;

// Lightweight in-memory per-IP rate limit. The VPS runs a single PM2 instance, so a module-level
// map is sufficient to stop an anonymous visitor from running up OpenAI spend. Not a substitute for
// a real limiter in a multi-instance deploy, but right-sized for this demo.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 12;
const hits = new Map<string, number[]>();

async function clientKey(): Promise<string> {
  try {
    const h = await headers();
    const fwd = h.get('x-forwarded-for');
    if (fwd) return fwd.split(',')[0]!.trim();
    return h.get('x-real-ip') ?? 'local';
  } catch {
    return 'local';
  }
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  // Opportunistic prune so the map can't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      const fresh = v.filter((t) => now - t < RATE_WINDOW_MS);
      if (fresh.length) hits.set(k, fresh);
      else hits.delete(k);
    }
  }
  return false;
}

const LANGUAGE: Record<string, string> = { en: 'English', fr: 'French', ar: 'Arabic' };
const BRAND_DESCRIPTION: Record<string, string> = {
  en: BRAND.descriptionEn,
  fr: BRAND.descriptionFr,
  ar: BRAND.descriptionAr,
};

function systemPrompt(locale: string): string {
  const language = LANGUAGE[locale] ?? 'English';
  return [
    `You are Nora, the friendly shopping assistant for ${BRAND.name}, a modern home & furniture store.`,
    `${BRAND_DESCRIPTION[locale] ?? BRAND.descriptionEn}`,
    '',
    'Your job: help shoppers find the right products, answer questions about the catalogue, and explain store policies.',
    '',
    'TOOLS',
    '- Use `search_products` to find real products before recommending anything. Never invent products, prices, or stock.',
    '- Use `list_categories` when the shopper wants to browse or you need a category slug.',
    '',
    'SHOWING PRODUCTS',
    '- To show a product, write its slug on its own line as `::product[the-slug]` — the app renders it as a rich card',
    '  with photo, price and a link. For example: `::product[oak-dining-table]`.',
    '- Only use slugs returned by the tools, and use each slug at most once. Put a short sentence before the card(s);',
    '  do NOT restate the price or full name right next to the card — the card already shows them.',
    '- Show at most 3–4 cards per reply. Pick the best matches rather than dumping everything.',
    '',
    'STORE FACTS',
    '- Payment: Cash on Delivery or card (Stripe, test mode). Free shipping over $150. Returns within 30 days.',
    '- Prices display in the currency the shopper picked (USD, EUR or TND); the card handles formatting.',
    '- Available in English, French and Arabic (right-to-left).',
    '',
    'STYLE',
    `- Reply in ${language}. Be warm, concise (usually 1–3 sentences), and genuinely helpful — like a great shop assistant.`,
    '- If a request is unrelated to shopping at Norden, gently steer back. If you are unsure, say so rather than guessing.',
  ].join('\n');
}

function toApiMessages(history: ChatTurn[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  return history
    .filter((t) => (t.role === 'user' || t.role === 'assistant') && typeof t.content === 'string' && t.content.trim())
    .slice(-MAX_HISTORY_TURNS)
    .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_MESSAGE_CHARS) }));
}

function referencedSlugs(text: string): string[] {
  const slugs = new Set<string>();
  for (const m of text.matchAll(PRODUCT_MARKER)) slugs.add(m[1]);
  return [...slugs];
}

/** Drop markers for slugs the tools never surfaced (hallucinations) and any trailing partial marker
 *  left by a token-limit cutoff, so the client never renders a dangling "here it is:" with no card. */
function sanitizeReply(raw: string, valid: Set<string>): string {
  return raw
    .replace(/::product\[([a-z0-9-]+)\]/g, (marker, slug) => (valid.has(slug) ? marker : ''))
    .replace(/::product(?:\[[a-z0-9-]*)?$/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

/**
 * Run one assistant turn: a manual OpenAI tool-use loop. The model searches the catalogue, then
 * replies with prose + `::product[slug]` markers. We return the reply plus the (deduped) product
 * cards it actually referenced, so the UI can render them inline.
 */
export async function sendChatMessage(history: ChatTurn[], locale: string): Promise<ChatResult> {
  if (!env.OPENAI_API_KEY) return { ok: false, kind: 'disabled' };

  const base = toApiMessages(history);
  if (!base.length || base[base.length - 1].role !== 'user') return { ok: false, kind: 'error' };

  if (isRateLimited(await clientKey())) return { ok: false, kind: 'rate_limited' };

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 });
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt(locale) },
    ...base,
  ];
  const surfaced = new Map<string, ChatProductCardData>();
  let intermediate = '';

  const finish = (raw: string): ChatResult => {
    const products = referencedSlugs(raw)
      .map((slug) => surfaced.get(slug))
      .filter((p): p is ChatProductCardData => Boolean(p));
    const valid = new Set(products.map((p) => p.slug));
    return { ok: true, text: sanitizeReply(raw, valid), products };
  };

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const completion = await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        messages,
        // Withhold tools on the final round so the model is forced to answer with what it has gathered.
        tools: round < MAX_TOOL_ROUNDS - 1 ? CHAT_TOOLS : undefined,
      });

      const message = completion.choices[0]?.message;
      if (!message) return { ok: false, kind: 'error' };

      const toolCalls = (message.tool_calls ?? []).filter(
        (tc): tc is OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall => tc.type === 'function',
      );

      // Buffer any prose the model emitted alongside tool calls, in case it never sends a clean turn.
      if (message.content && message.content.trim()) intermediate = message.content;

      if (toolCalls.length) {
        // Echo the assistant turn (with its tool calls), then answer each call with a tool message.
        messages.push({
          role: 'assistant',
          content: message.content,
          tool_calls: toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: { name: tc.function.name, arguments: tc.function.arguments },
          })),
        });
        for (const tc of toolCalls) {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(tc.function.arguments || '{}');
          } catch {
            args = {};
          }
          const { resultText, found } = await runChatTool(tc.function.name, args, locale);
          for (const p of found) surfaced.set(p.slug, p);
          messages.push({ role: 'tool', tool_call_id: tc.id, content: resultText });
        }
        continue;
      }

      const text = (message.content ?? '').trim();
      return finish(text || intermediate);
    }

    // Loop exhausted — return whatever prose we buffered rather than a canned apology when possible.
    return finish(intermediate || "Sorry, I couldn't quite finish that. Could you rephrase what you're looking for?");
  } catch {
    return { ok: false, kind: 'error' };
  }
}
