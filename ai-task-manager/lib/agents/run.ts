import { streamText, type CoreMessage } from "ai";
import { modelFor } from "../models";
import { AGENT_PROMPTS } from "./prompts";
import type { AgentKind } from "../types";

export function runAgent({
  agent,
  messages,
}: {
  agent: AgentKind;
  messages: CoreMessage[];
}) {
  const { model, label } = modelFor(agent);
  const stream = streamText({
    model,
    system: AGENT_PROMPTS[agent],
    messages,
    temperature: agent === "code" || agent === "research" ? 0.2 : 0.7,
  });
  return { stream, modelLabel: label };
}
