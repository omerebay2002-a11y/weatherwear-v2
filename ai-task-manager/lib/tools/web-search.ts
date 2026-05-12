import { tool } from "ai";
import { z } from "zod";

/**
 * Web search via Tavily (https://tavily.com).
 * If TAVILY_API_KEY isn't set, the tool gracefully tells the model that
 * search is unavailable so it falls back to its own knowledge.
 */
export const webSearch = tool({
  description:
    "Search the live web for current information. Use for facts that may have changed, prices, comparisons, recent news, model capabilities, or anything time-sensitive.",
  parameters: z.object({
    query: z.string().min(2).max(400),
    max_results: z.number().int().min(1).max(10).optional(),
  }),
  async execute({ query, max_results = 5 }) {
    const key = process.env.TAVILY_API_KEY;
    if (!key) {
      return {
        ok: false,
        error:
          "Web search not configured. Set TAVILY_API_KEY to enable. Answer from training data and flag uncertainty.",
      };
    }
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query,
        max_results,
        search_depth: "advanced",
        include_answer: true,
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `Search failed: ${res.status}` };
    }
    const data = (await res.json()) as {
      answer?: string;
      results: Array<{ title: string; url: string; content: string }>;
    };
    return {
      ok: true,
      answer: data.answer,
      results: data.results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content.slice(0, 600),
      })),
    };
  },
});
