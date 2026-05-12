import { generateObject } from "ai";
import { z } from "zod";
import { routerModel } from "./models";
import type { AgentKind } from "./types";

const stepSchema = z.object({
  agent: z.enum(["code", "design", "research", "marketing", "general"]),
  instruction: z
    .string()
    .min(4)
    .max(500)
    .describe("What this specialist should do, written as a direct instruction."),
});

const planSchema = z.object({
  mode: z.enum(["single", "multi"]).describe(
    'Use "single" if one specialist alone can handle the task. Use "multi" only when the task genuinely needs multiple domains (e.g. research a topic AND write marketing copy about it).',
  ),
  steps: z.array(stepSchema).min(1).max(4),
  rationale: z.string().min(1).max(300),
});

const PLANNER_SYSTEM = `You decompose a user task into the minimum sequence of specialist calls.

Specialists:
- code: software engineering (code, debug, review, architecture)
- design: UI/UX, visual, branding, image-generation prompts
- research: web search, comparisons, market scans, fact-finding
- marketing: copy, positioning, ads, landing pages, emails
- general: everything else (planning, chitchat, simple Q&A)

Rules:
1. Prefer "single" mode. Only use "multi" when the task crosses domains (e.g. "research X then write a landing page for it" = research + marketing).
2. Maximum 4 steps. Steps run sequentially; later steps can reference earlier outputs.
3. Each instruction must be self-contained: include the relevant context so the specialist doesn't need to re-read the original task.
4. Rationale: one short sentence explaining the split.`;

export type Plan = z.infer<typeof planSchema>;
export type PlanStep = z.infer<typeof stepSchema>;

export async function plan(userMessage: string): Promise<Plan & { plannerLabel: string }> {
  const { model, label } = routerModel();
  const { object } = await generateObject({
    model,
    schema: planSchema,
    system: PLANNER_SYSTEM,
    prompt: userMessage,
    temperature: 0,
  });
  return { ...object, plannerLabel: label };
}

export const SPECIALIST_AGENTS: AgentKind[] = [
  "code",
  "design",
  "research",
  "marketing",
  "general",
];
