/**
 * Coarse USD-per-million-tokens estimates. Update when prices change.
 * Used only for in-UI telemetry, not billing.
 */
const PRICE: Record<string, { in: number; out: number }> = {
  "anthropic/claude-opus-4-7": { in: 15, out: 75 },
  "anthropic/claude-sonnet-4-6": { in: 3, out: 15 },
  "anthropic/claude-haiku-4-5": { in: 0.8, out: 4 },
  "openai/gpt-5": { in: 5, out: 20 },
  "openai/gpt-5-mini": { in: 0.5, out: 2 },
  "google/gemini-2.5-pro": { in: 3.5, out: 10.5 },
  "google/gemini-2.5-flash": { in: 0.35, out: 1.05 },
};

export function estimateCostUsd(
  label: string,
  promptTokens: number,
  completionTokens: number,
): number | null {
  const p = PRICE[label];
  if (!p) return null;
  return (promptTokens / 1_000_000) * p.in + (completionTokens / 1_000_000) * p.out;
}
