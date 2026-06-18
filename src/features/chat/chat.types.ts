/** Shared chat types — safe to import from both client and server. */

export type ChatRole = 'user' | 'assistant';

/** One turn in the conversation. Assistant turns keep their raw text, including any
 *  `::product[slug]` markers, so the UI can re-render cards and the model has full context. */
export type ChatTurn = {
  role: ChatRole;
  content: string;
};

/** Compact product payload the chat renders as an inline card. Prices are base (USD) cents —
 *  the currency context converts + formats them, exactly like the rest of the storefront. */
export type ChatProductCardData = {
  slug: string;
  title: string;
  thumbnail: string | null;
  priceCents: number;
  discountPercentage: number;
  ratingAvg: number;
  ratingCount: number;
  inStock: boolean;
};

export type ChatResult =
  | { ok: true; text: string; products: ChatProductCardData[] }
  | { ok: false; kind: 'disabled' | 'error' | 'rate_limited' };

/** Inline protocol — the assistant emits `::product[the-slug]` and the UI swaps it for a card.
 *  Inspired by the reference chatbot's `::video[...]` text protocol. */
export const PRODUCT_MARKER = /::product\[([a-z0-9-]+)\]/g;

/** Limits applied to untrusted client history before it reaches the model. */
export const MAX_HISTORY_TURNS = 12;
export const MAX_MESSAGE_CHARS = 2000;
