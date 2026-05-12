import { tool } from "ai";
import { z } from "zod";

/**
 * Sandboxed JS evaluator. Pure-function only — no globals, no I/O.
 * Useful for the code agent to verify small snippets or run math.
 */
export const codeEval = tool({
  description:
    "Evaluate a small pure JavaScript expression and return the result. Use for quick sanity checks, math, or verifying small algorithms. No I/O, no network, no DOM.",
  parameters: z.object({
    expression: z
      .string()
      .min(1)
      .max(4000)
      .describe("A single JS expression or an IIFE. Must return a value."),
  }),
  async execute({ expression }) {
    try {
      const fn = new Function(`"use strict"; return (${expression});`);
      const value = fn();
      const serialized =
        typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
      return { ok: true, value: serialized.slice(0, 4000) };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "eval failed" };
    }
  },
});
