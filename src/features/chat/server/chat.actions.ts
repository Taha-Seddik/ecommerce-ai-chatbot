'use server';

import OpenAI from 'openai';
import { env } from '@/lib/env';
import { MAX_COMPLETION_TOKENS, MAX_RETRIES, MAX_TOOL_ROUNDS, REQUEST_TIMEOUT_MS } from './chat.config';
import { systemPrompt } from './chat.prompt';
import { isRateLimited } from './chat.rateLimit';
import { CHAT_TOOLS, runChatTool } from './chat.tools';
import {
  MAX_HISTORY_TURNS,
  MAX_MESSAGE_CHARS,
  PRODUCT_MARKER,
  type ChatProductCardData,
  type ChatResult,
  type ChatTurn,
} from '../chat.types';

type ApiMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;
type FunctionToolCall = OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall;

// ── Message & reply helpers ───────────────────────────────────────────────────────────

/** Sanitise untrusted client history: keep only real user/assistant turns, cap the count and length. */
function toApiMessages(history: ChatTurn[]): ApiMessage[] {
  return history
    .filter((t) => (t.role === 'user' || t.role === 'assistant') && typeof t.content === 'string' && t.content.trim())
    .slice(-MAX_HISTORY_TURNS)
    .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_MESSAGE_CHARS) }));
}

/** Parse a tool call's JSON arguments, tolerating malformed model output. */
function parseArgs(raw: string | undefined): Record<string, unknown> {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

/**
 * Turn the model's raw reply into the client result. Resolves every `::product[slug]` marker against
 * the cards the tools actually surfaced (dropping hallucinated slugs), and strips any leftover invalid
 * or token-cut-off markers from the text so the UI never renders a dangling reference with no card.
 */
function resolveReply(raw: string, surfaced: Map<string, ChatProductCardData>): ChatResult {
  const referenced = new Set<string>();
  for (const m of raw.matchAll(PRODUCT_MARKER)) referenced.add(m[1]);

  const products = [...referenced]
    .map((slug) => surfaced.get(slug))
    .filter((p): p is ChatProductCardData => Boolean(p));
  const valid = new Set(products.map((p) => p.slug));

  const text = raw
    .replace(/::product\[([a-z0-9-]+)\]/g, (marker, slug) => (valid.has(slug) ? marker : ''))
    .replace(/::product(?:\[[a-z0-9-]*)?$/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim();

  return { ok: true, text, products };
}

// ── Tool-use loop ─────────────────────────────────────────────────────────────────────

/** Run each tool call, accumulate the cards it surfaced, and return the `tool` reply messages. */
async function runToolCalls(
  toolCalls: FunctionToolCall[],
  locale: string,
  surfaced: Map<string, ChatProductCardData>,
): Promise<ApiMessage[]> {
  const replies: ApiMessage[] = [];
  for (const tc of toolCalls) {
    const { resultText, found } = await runChatTool(tc.function.name, parseArgs(tc.function.arguments), locale);
    for (const p of found) surfaced.set(p.slug, p);
    replies.push({ role: 'tool', tool_call_id: tc.id, content: resultText });
  }
  return replies;
}

/** Echo the model's tool-calling turn back into the conversation before answering each call. */
function assistantToolTurn(message: OpenAI.Chat.Completions.ChatCompletionMessage, toolCalls: FunctionToolCall[]): ApiMessage {
  return {
    role: 'assistant',
    content: message.content,
    tool_calls: toolCalls.map((tc) => ({
      id: tc.id,
      type: 'function' as const,
      function: { name: tc.function.name, arguments: tc.function.arguments },
    })),
  };
}

/**
 * Run one assistant turn: a manual, hard-bounded OpenAI tool-use loop. The model searches the
 * catalogue, then replies with prose + `::product[slug]` markers; we return the reply plus the
 * (deduped) product cards it actually referenced so the UI can render them inline.
 */
export async function sendChatMessage(history: ChatTurn[], locale: string): Promise<ChatResult> {
  if (!env.OPENAI_API_KEY) return { ok: false, kind: 'disabled' };

  const base = toApiMessages(history);
  if (!base.length || base[base.length - 1].role !== 'user') return { ok: false, kind: 'error' };

  if (await isRateLimited()) return { ok: false, kind: 'rate_limited' };

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: REQUEST_TIMEOUT_MS, maxRetries: MAX_RETRIES });
  const messages: ApiMessage[] = [{ role: 'system', content: systemPrompt(locale) }, ...base];
  const surfaced = new Map<string, ChatProductCardData>();
  let intermediate = '';

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const completion = await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        messages,
        // Withhold tools on the final round so the model must answer with what it has gathered.
        tools: round < MAX_TOOL_ROUNDS - 1 ? CHAT_TOOLS : undefined,
      });

      const message = completion.choices[0]?.message;
      if (!message) return { ok: false, kind: 'error' };

      // Buffer any prose in case the model keeps calling tools and never sends a clean final turn.
      if (message.content?.trim()) intermediate = message.content;

      const toolCalls = (message.tool_calls ?? []).filter(
        (tc): tc is FunctionToolCall => tc.type === 'function',
      );

      // No tool calls → this is the model's final answer.
      if (!toolCalls.length) {
        return resolveReply((message.content ?? '').trim() || intermediate, surfaced);
      }

      messages.push(assistantToolTurn(message, toolCalls));
      messages.push(...(await runToolCalls(toolCalls, locale, surfaced)));
    }

    // Loop exhausted — prefer buffered prose over a canned apology.
    return resolveReply(intermediate || "Sorry, I couldn't quite finish that. Could you rephrase what you're looking for?", surfaced);
  } catch {
    return { ok: false, kind: 'error' };
  }
}
