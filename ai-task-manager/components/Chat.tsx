"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  loadThreads,
  saveThreads,
  newThread,
  titleFromFirstMessage,
  type Thread,
  type StoredMessage,
  type ContentPart,
} from "@/lib/storage";
import Sidebar from "./Sidebar";
import Trace, { type TraceData } from "./Trace";

type TraceEvent =
  | { type: "plan"; plan: TraceData["plan"] & object; plannerLabel: string }
  | {
      type: "route";
      agent: string;
      reason: string;
      confidence: number;
      routerLabel: string;
    }
  | {
      type: "step_start";
      index: number;
      agent: string;
      instruction: string;
      modelLabel: string;
    }
  | { type: "step_delta"; index: number; text: string }
  | { type: "tool_call"; index: number; tool: string; args: unknown }
  | { type: "tool_result"; index: number; tool: string; result: unknown }
  | { type: "step_end"; index: number; costUsd: number | null }
  | { type: "final_delta"; text: string }
  | { type: "done"; totalCostUsd: number | null }
  | { type: "error"; message: string };

function uuid() {
  return crypto.randomUUID();
}

export default function Chat() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<{ name: string; dataUrl: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [liveAssistant, setLiveAssistant] = useState<string>("");
  const [liveTrace, setLiveTrace] = useState<TraceData | null>(null);
  const startedAtRef = useRef<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on first render.
  useEffect(() => {
    const loaded = loadThreads();
    if (loaded.length === 0) {
      const t = newThread();
      setThreads([t]);
      setActiveId(t.id);
      saveThreads([t]);
    } else {
      setThreads(loaded);
      setActiveId(loaded[0].id);
    }
  }, []);

  // Persist whenever threads change.
  useEffect(() => {
    if (threads.length > 0) saveThreads(threads);
  }, [threads]);

  const active = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [threads, activeId],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, liveAssistant]);

  function patchThread(id: string, fn: (t: Thread) => Thread) {
    setThreads((prev) => prev.map((t) => (t.id === id ? fn(t) : t)));
  }

  function handleNew() {
    const t = newThread();
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
  }

  function handleDelete(id: string) {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (id === activeId) setActiveId(next[0]?.id ?? null);
      if (next.length === 0) {
        const t = newThread();
        setActiveId(t.id);
        return [t];
      }
      return next;
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Only images are supported for now.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({ name: file.name, dataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  async function send() {
    if (!active || busy) return;
    const text = input.trim();
    if (!text && !attachment) return;

    const userContent: string | ContentPart[] = attachment
      ? [
          { type: "text" as const, text },
          { type: "image" as const, image: attachment.dataUrl },
        ]
      : text;

    const userMsg: StoredMessage = {
      id: uuid(),
      role: "user",
      content: userContent,
      createdAt: Date.now(),
    };

    const isFirst = active.messages.length === 0;
    patchThread(active.id, (t) => ({
      ...t,
      title: isFirst && text ? titleFromFirstMessage(text) : t.title,
      messages: [...t.messages, userMsg],
      updatedAt: Date.now(),
    }));

    setInput("");
    setAttachment(null);
    setBusy(true);
    setLiveAssistant("");
    setLiveTrace({ trace: [] });
    startedAtRef.current = Date.now();

    // Build the API payload from full thread history.
    const apiMessages = [...active.messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const accumulatedTrace: TraceData = { trace: [] };
    const stepBuffers: Record<number, { agent: string; modelLabel: string; instruction: string; output: string }> = {};
    let finalText = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6);
          let event: TraceEvent;
          try {
            event = JSON.parse(json);
          } catch {
            continue;
          }

          switch (event.type) {
            case "plan":
              accumulatedTrace.plan = event.plan;
              setLiveTrace({ ...accumulatedTrace });
              break;
            case "route":
              // single-step path: synthesize a 1-step plan for the trace
              accumulatedTrace.plan = {
                mode: "single",
                steps: [{ agent: event.agent, instruction: "(direct)" }],
                rationale: event.reason,
              };
              setLiveTrace({ ...accumulatedTrace });
              break;
            case "step_start":
              stepBuffers[event.index] = {
                agent: event.agent,
                modelLabel: event.modelLabel,
                instruction: event.instruction,
                output: "",
              };
              accumulatedTrace.trace.push({
                kind: "step",
                agent: event.agent,
                modelLabel: event.modelLabel,
                instruction: event.instruction,
                output: "",
              });
              setLiveTrace({ ...accumulatedTrace });
              break;
            case "step_delta":
              if (stepBuffers[event.index]) {
                stepBuffers[event.index].output += event.text;
              }
              // In multi-step mode, step text is internal; show it streaming so the user
              // sees progress, but it'll be replaced by final_delta.
              if (!accumulatedTrace.plan || accumulatedTrace.plan.mode === "single") {
                finalText += event.text;
                setLiveAssistant(finalText);
              }
              break;
            case "tool_call":
              accumulatedTrace.trace.push({
                kind: "tool",
                tool: event.tool,
                args: event.args,
                result: null,
              });
              setLiveTrace({ ...accumulatedTrace });
              break;
            case "tool_result": {
              const last = [...accumulatedTrace.trace]
                .reverse()
                .find((t) => t.kind === "tool" && t.tool === event.tool && t.result === null);
              if (last && last.kind === "tool") last.result = event.result;
              setLiveTrace({ ...accumulatedTrace });
              break;
            }
            case "step_end":
              break;
            case "final_delta":
              finalText += event.text;
              setLiveAssistant(finalText);
              break;
            case "done":
              accumulatedTrace.totalCostUsd = event.totalCostUsd;
              accumulatedTrace.durationMs = Date.now() - startedAtRef.current;
              setLiveTrace({ ...accumulatedTrace });
              break;
            case "error":
              finalText = (finalText ? finalText + "\n\n" : "") + `Error: ${event.message}`;
              setLiveAssistant(finalText);
              break;
          }
        }
      }
    } catch (e) {
      finalText = `Error: ${e instanceof Error ? e.message : String(e)}`;
      setLiveAssistant(finalText);
    }

    const assistantMsg: StoredMessage = {
      id: uuid(),
      role: "assistant",
      content: finalText || "(no response)",
      createdAt: Date.now(),
      meta: {
        plan: accumulatedTrace.plan,
        trace: accumulatedTrace.trace,
        totalCostUsd: accumulatedTrace.totalCostUsd,
        durationMs: accumulatedTrace.durationMs ?? Date.now() - startedAtRef.current,
      },
    };
    patchThread(active.id, (t) => ({
      ...t,
      messages: [...t.messages, assistantMsg],
      updatedAt: Date.now(),
    }));
    setLiveAssistant("");
    setLiveTrace(null);
    setBusy(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        threads={threads}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNew}
        onDelete={handleDelete}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border px-6 py-4 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <h1 className="text-sm font-medium tracking-wide truncate">
            {active?.title ?? "AI Task Manager"}
          </h1>
          <span className="ml-auto text-xs text-zinc-500">
            router · planner · specialists · tools
          </span>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
            {(!active || active.messages.length === 0) && !busy && (
              <div className="text-zinc-500 text-sm space-y-2">
                <p>Ask anything. The system will:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Plan the task (single vs multi-step).</li>
                  <li>Route to the right specialist(s) — code, design, research, marketing.</li>
                  <li>Use tools (web search, URL fetch, etc.) when needed.</li>
                  <li>Synthesize one clean answer + show the trace.</li>
                </ol>
              </div>
            )}

            {active?.messages.map((m) => (
              <MessageView key={m.id} msg={m} />
            ))}

            {busy && (
              <div className="space-y-3">
                {liveTrace && <Trace data={liveTrace} />}
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Assistant</div>
                  <div className="whitespace-pre-wrap leading-relaxed text-zinc-100">
                    {liveAssistant || <span className="text-zinc-500">thinking…</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t border-border"
        >
          <div className="max-w-3xl w-full mx-auto px-4 py-3 space-y-2">
            {attachment && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 bg-surface border border-border rounded px-2 py-1 w-fit">
                <span>📎 {attachment.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-zinc-500 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex gap-2 items-end">
              <label className="bg-surface border border-border rounded-lg px-3 py-3 cursor-pointer hover:border-accent text-zinc-400">
                +
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="What do you want to ship?"
                rows={1}
                className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-accent resize-none max-h-40"
                disabled={busy}
              />
              <button
                type="submit"
                disabled={busy || (!input.trim() && !attachment)}
                className="bg-accent text-black font-medium px-4 py-3 rounded-lg text-sm disabled:opacity-40"
              >
                {busy ? "…" : "Send"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function MessageView({ msg }: { msg: StoredMessage }) {
  const isUser = msg.role === "user";
  const parts: ContentPart[] = Array.isArray(msg.content)
    ? msg.content
    : [{ type: "text", text: msg.content }];

  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wider text-zinc-500">
        {isUser ? "You" : "Assistant"}
      </div>
      {!isUser && msg.meta && (msg.meta.plan || msg.meta.trace?.length) ? (
        <Trace
          data={{
            plan: msg.meta.plan,
            trace: msg.meta.trace ?? [],
            totalCostUsd: msg.meta.totalCostUsd,
            durationMs: msg.meta.durationMs,
          }}
        />
      ) : null}
      <div className="whitespace-pre-wrap leading-relaxed text-zinc-100">
        {parts.map((p, i) =>
          p.type === "text" ? (
            <span key={i}>{p.text}</span>
          ) : (
            <img
              key={i}
              src={p.image}
              alt=""
              className="mt-2 max-h-64 rounded-md border border-border"
            />
          ),
        )}
      </div>
    </div>
  );
}
