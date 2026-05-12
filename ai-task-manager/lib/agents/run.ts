import { streamText, type CoreMessage } from "ai";
import { modelFor } from "../models";
import { AGENT_PROMPTS } from "./prompts";
import { TOOLS_PER_AGENT } from "../tools";
import type { AgentKind } from "../types";

export function runAgent({
  agent,
  messages,
  extraSystem,
}: {
  agent: AgentKind;
  messages: CoreMessage[];
  extraSystem?: string;
}) {
  const { model, label } = modelFor(agent);
  const system =
    extraSystem ? `${AGENT_PROMPTS[agent]}\n\n${extraSystem}` : AGENT_PROMPTS[agent];
  const stream = streamText({
    model,
    system,
    messages,
    tools: TOOLS_PER_AGENT[agent],
    maxSteps: 5,
    temperature: agent === "code" || agent === "research" ? 0.2 : 0.7,
  });
  return { stream, modelLabel: label };
}
