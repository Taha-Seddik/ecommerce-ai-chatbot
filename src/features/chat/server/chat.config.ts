/** Tunable knobs for the chat agent's OpenAI calls and tool-use loop.
 *  Centralised here so behaviour can be adjusted without touching the orchestration logic. */

/** Max OpenAI round trips per user message. Tools are withheld on the final round to force an answer. */
export const MAX_TOOL_ROUNDS = 4;

/** Hard cap on the tokens the model may generate per round. */
export const MAX_COMPLETION_TOKENS = 2048;

/** Abort an OpenAI request that takes longer than this (ms). */
export const REQUEST_TIMEOUT_MS = 30_000;

/** SDK auto-retries on transient errors — kept low to bound latency and spend. */
export const MAX_RETRIES = 1;
