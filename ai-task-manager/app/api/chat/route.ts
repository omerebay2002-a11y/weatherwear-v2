import type { CoreMessage } from "ai";
import { route } from "@/lib/router";
import { runAgent } from "@/lib/agents/run";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = (await req.json()) as { messages: CoreMessage[] };
  const messages = body.messages ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const userText =
    typeof lastUser?.content === "string"
      ? lastUser.content
      : (lastUser?.content ?? [])
          .filter((p: { type: string }) => p.type === "text")
          .map((p: { text?: string }) => p.text ?? "")
          .join("\n");

  if (!userText) {
    return new Response("Missing user message", { status: 400 });
  }

  const decision = await route(userText);
  const { stream, modelLabel } = runAgent({ agent: decision.agent, messages });

  return stream.toDataStreamResponse({
    headers: {
      "x-agent": decision.agent,
      "x-agent-reason": encodeURIComponent(decision.reason),
      "x-agent-confidence": decision.confidence.toFixed(2),
      "x-agent-model": modelLabel,
      "x-router-model": decision.routerLabel,
    },
  });
}
