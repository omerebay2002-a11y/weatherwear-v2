"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";

type AgentMeta = {
  agent: string;
  reason: string;
  confidence: string;
  agentModel: string;
  routerModel: string;
};

const AGENT_LABEL: Record<string, string> = {
  code: "Code",
  design: "Design",
  research: "Research",
  marketing: "Marketing",
  general: "General",
};

export default function Chat() {
  const [meta, setMeta] = useState<AgentMeta | null>(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    onResponse(response) {
      const h = response.headers;
      const agent = h.get("x-agent");
      if (!agent) return;
      setMeta({
        agent,
        reason: decodeURIComponent(h.get("x-agent-reason") ?? ""),
        confidence: h.get("x-agent-confidence") ?? "",
        agentModel: h.get("x-agent-model") ?? "",
        routerModel: h.get("x-router-model") ?? "",
      });
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4">
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-zinc-500 text-sm">
            Ask anything. The router will pick the right specialist —
            code, design, research, or marketing.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              {m.role === "user" ? "You" : meta ? `${AGENT_LABEL[meta.agent] ?? meta.agent} agent` : "Assistant"}
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-zinc-100">
              {m.content}
            </div>
          </div>
        ))}
        {meta && (
          <div className="text-[11px] text-zinc-500 border-t border-border pt-3">
            routed by {meta.routerModel} · running on {meta.agentModel} · confidence {meta.confidence}
            {meta.reason && <> · {meta.reason}</>}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="py-4 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="What do you want to ship?"
            className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-accent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-accent text-black font-medium px-4 py-3 rounded-lg text-sm disabled:opacity-40"
          >
            {isLoading ? "…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
