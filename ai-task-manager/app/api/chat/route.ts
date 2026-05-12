import type { CoreMessage } from "ai";
import { orchestrate, type TraceEvent } from "@/lib/orchestrator";

export const runtime = "nodejs";
export const maxDuration = 120;

type IncomingPart =
  | { type: "text"; text: string }
  | { type: "image"; image: string };

type IncomingMessage = {
  role: "user" | "assistant" | "system";
  content: string | IncomingPart[];
};

function toCoreMessage(m: IncomingMessage): CoreMessage {
  if (typeof m.content === "string") {
    return { role: m.role, content: m.content } as CoreMessage;
  }
  if (m.role === "user") {
    return {
      role: "user",
      content: m.content.map((p) =>
        p.type === "image" ? { type: "image" as const, image: p.image } : { type: "text" as const, text: p.text },
      ),
    };
  }
  // Assistant/system: collapse to text.
  const text = m.content.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join("\n");
  return { role: m.role, content: text } as CoreMessage;
}

function extractText(content: string | IncomingPart[]): string {
  if (typeof content === "string") return content;
  return content
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("\n");
}

export async function POST(req: Request) {
  const body = (await req.json()) as { messages: IncomingMessage[] };
  const incoming = body.messages ?? [];
  const lastUser = [...incoming].reverse().find((m) => m.role === "user");
  if (!lastUser) return new Response("Missing user message", { status: 400 });

  const userText = extractText(lastUser.content);
  const allMessages = incoming.map(toCoreMessage);

  if (!userText && (typeof lastUser.content === "string" || !lastUser.content.some((p) => p.type === "image"))) {
    return new Response("Missing user message content", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: TraceEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      await orchestrate({
        userText: userText || "(image only)",
        allMessages,
        emit,
      });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
