import { generateObject } from "ai";
import { z } from "zod";
import { routerModel } from "./models";
import type { RouterDecision } from "./types";

const decisionSchema = z.object({
  agent: z.enum(["code", "design", "research", "marketing", "general"]),
  reason: z.string().min(1).max(240),
  confidence: z.number().min(0).max(1),
});

const ROUTER_SYSTEM = `You are a routing classifier. Given a user task, pick the single best specialist agent.

Agents:
- code: writing, debugging, reviewing, or explaining software. Anything involving programming languages, APIs, infra, data pipelines.
- design: visual, UX, UI, branding, layout, color, typography, image critique or generation prompts.
- research: gathering facts, comparing options, summarizing sources, market scans, technical investigation.
- marketing: copywriting, positioning, ad creative, landing pages, social posts, sales emails, growth ideas.
- general: small talk, planning, scheduling, anything that doesn't clearly fit above.

Rules:
- Pick exactly one agent.
- "reason" is one short sentence (under 30 words).
- "confidence" reflects how sure you are; use <0.6 only when the request is genuinely ambiguous.`;

export async function route(userMessage: string): Promise<RouterDecision & { routerLabel: string }> {
  const { model, label } = routerModel();
  const { object } = await generateObject({
    model,
    schema: decisionSchema,
    system: ROUTER_SYSTEM,
    prompt: userMessage,
    temperature: 0,
  });
  return { ...object, routerLabel: label };
}
