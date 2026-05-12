import { tool } from "ai";
import { z } from "zod";

export const fetchUrl = tool({
  description:
    "Fetch a public URL and return readable text. Use when the user shares a link or you need the contents of a specific page.",
  parameters: z.object({
    url: z.string().url(),
    max_chars: z.number().int().min(500).max(20000).optional(),
  }),
  async execute({ url, max_chars = 8000 }) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "ai-task-manager/0.1" },
        redirect: "follow",
      });
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("text") && !ct.includes("json") && !ct.includes("xml")) {
        return { ok: false, error: `Unsupported content-type: ${ct}` };
      }
      const raw = await res.text();
      const text = raw
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return { ok: true, url, content: text.slice(0, max_chars) };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "fetch failed" };
    }
  },
});
