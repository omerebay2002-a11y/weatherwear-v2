import { streamText, type CoreMessage } from "ai";
import { modelFor } from "./models";
import { AGENT_PROMPTS } from "./agents/prompts";
import { TOOLS_PER_AGENT } from "./tools";
import { plan, type Plan } from "./planner";
import { route } from "./router";
import { estimateCostUsd } from "./pricing";
import type { AgentKind } from "./types";

export type TraceEvent =
  | { type: "plan"; plan: Plan; plannerLabel: string }
  | { type: "route"; agent: AgentKind; reason: string; confidence: number; routerLabel: string }
  | { type: "step_start"; index: number; agent: AgentKind; instruction: string; modelLabel: string }
  | { type: "step_delta"; index: number; text: string }
  | { type: "tool_call"; index: number; tool: string; args: unknown }
  | { type: "tool_result"; index: number; tool: string; result: unknown }
  | { type: "step_end"; index: number; costUsd: number | null }
  | { type: "final_delta"; text: string }
  | { type: "done"; totalCostUsd: number | null }
  | { type: "error"; message: string };

type Emit = (event: TraceEvent) => void;

async function runStep({
  index,
  agent,
  instruction,
  priorContext,
  emit,
}: {
  index: number;
  agent: AgentKind;
  instruction: string;
  priorContext: string;
  emit: Emit;
}): Promise<{ text: string; costUsd: number | null }> {
  const { model, label } = modelFor(agent);
  emit({ type: "step_start", index, agent, instruction, modelLabel: label });

  const messages: CoreMessage[] = [];
  if (priorContext) {
    messages.push({
      role: "system",
      content: `Outputs from earlier steps in this plan:\n\n${priorContext}`,
    });
  }
  messages.push({ role: "user", content: instruction });

  const result = streamText({
    model,
    system: AGENT_PROMPTS[agent],
    messages,
    tools: TOOLS_PER_AGENT[agent],
    maxSteps: 5,
    temperature: agent === "code" || agent === "research" ? 0.2 : 0.7,
    onStepFinish({ toolCalls, toolResults }) {
      for (const tc of (toolCalls ?? []) as Array<{ toolName: string; args: unknown }>) {
        emit({ type: "tool_call", index, tool: tc.toolName, args: tc.args });
      }
      for (const tr of (toolResults ?? []) as Array<{ toolName: string; result: unknown }>) {
        emit({ type: "tool_result", index, tool: tr.toolName, result: tr.result });
      }
    },
  });

  let full = "";
  for await (const chunk of result.textStream) {
    full += chunk;
    emit({ type: "step_delta", index, text: chunk });
  }
  const usage = await result.usage;
  const costUsd = estimateCostUsd(label, usage.promptTokens, usage.completionTokens);
  emit({ type: "step_end", index, costUsd });
  return { text: full, costUsd };
}

async function synthesize({
  userTask,
  stepOutputs,
  emit,
}: {
  userTask: string;
  stepOutputs: Array<{ agent: AgentKind; text: string }>;
  emit: Emit;
}): Promise<{ costUsd: number | null }> {
  const { model, label } = modelFor("general");
  const body = stepOutputs
    .map((s, i) => `## Step ${i + 1} — ${s.agent} agent\n\n${s.text}`)
    .join("\n\n---\n\n");

  const result = streamText({
    model,
    system:
      "You are the final synthesizer. Merge the specialist outputs below into a single, cohesive answer for the user. Remove duplication. Keep the strongest version of each idea. Don't mention the steps or agents — speak as one voice.",
    messages: [
      {
        role: "user",
        content: `Original task:\n${userTask}\n\nSpecialist outputs:\n\n${body}`,
      },
    ],
    temperature: 0.4,
  });

  for await (const chunk of result.textStream) {
    emit({ type: "final_delta", text: chunk });
  }
  const usage = await result.usage;
  return { costUsd: estimateCostUsd(label, usage.promptTokens, usage.completionTokens) };
}

export async function orchestrate({
  userText,
  allMessages,
  emit,
}: {
  /** Plain-text version of the last user message (for routing/planning). */
  userText: string;
  /** Full message history including multimodal content. The last message must be the user's. */
  allMessages: CoreMessage[];
  emit: Emit;
}) {
  try {
    const p = await plan(userText);
    emit({ type: "plan", plan: p, plannerLabel: p.plannerLabel });

    let totalCost = 0;
    let costAvailable = true;

    if (p.mode === "single") {
      const decision = await route(userText);
      emit({
        type: "route",
        agent: decision.agent,
        reason: decision.reason,
        confidence: decision.confidence,
        routerLabel: decision.routerLabel,
      });

      const { model, label } = modelFor(decision.agent);
      emit({
        type: "step_start",
        index: 0,
        agent: decision.agent,
        instruction: userText,
        modelLabel: label,
      });

      const result = streamText({
        model,
        system: AGENT_PROMPTS[decision.agent],
        messages: allMessages,
        tools: TOOLS_PER_AGENT[decision.agent],
        maxSteps: 5,
        temperature: decision.agent === "code" || decision.agent === "research" ? 0.2 : 0.7,
        onStepFinish({ toolCalls, toolResults }) {
          for (const tc of (toolCalls ?? []) as Array<{ toolName: string; args: unknown }>) {
            emit({ type: "tool_call", index: 0, tool: tc.toolName, args: tc.args });
          }
          for (const tr of (toolResults ?? []) as Array<{ toolName: string; result: unknown }>) {
            emit({ type: "tool_result", index: 0, tool: tr.toolName, result: tr.result });
          }
        },
      });

      for await (const chunk of result.textStream) {
        emit({ type: "final_delta", text: chunk });
      }
      const usage = await result.usage;
      const costUsd = estimateCostUsd(label, usage.promptTokens, usage.completionTokens);
      emit({ type: "step_end", index: 0, costUsd });
      if (costUsd == null) costAvailable = false;
      else totalCost += costUsd;
      emit({ type: "done", totalCostUsd: costAvailable ? totalCost : null });
      return;
    }

    const stepOutputs: Array<{ agent: AgentKind; text: string }> = [];
    for (let i = 0; i < p.steps.length; i++) {
      const step = p.steps[i];
      const priorContext = stepOutputs
        .map((s, j) => `Step ${j + 1} (${s.agent}):\n${s.text}`)
        .join("\n\n---\n\n");
      const { text, costUsd } = await runStep({
        index: i,
        agent: step.agent,
        instruction: step.instruction,
        priorContext,
        emit,
      });
      stepOutputs.push({ agent: step.agent, text });
      if (costUsd == null) costAvailable = false;
      else totalCost += costUsd;
    }

    const { costUsd: synthCost } = await synthesize({
      userTask: userText,
      stepOutputs,
      emit,
    });
    if (synthCost == null) costAvailable = false;
    else totalCost += synthCost;

    emit({ type: "done", totalCostUsd: costAvailable ? totalCost : null });
  } catch (e) {
    emit({ type: "error", message: e instanceof Error ? e.message : String(e) });
  }
}
