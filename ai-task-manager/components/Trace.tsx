"use client";

import { useState } from "react";

const AGENT_COLOR: Record<string, string> = {
  code: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  design: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  research: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  marketing: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  general: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

export type TraceData = {
  plan?: {
    mode: "single" | "multi";
    steps: Array<{ agent: string; instruction: string }>;
    rationale: string;
  };
  trace: Array<
    | { kind: "step"; agent: string; modelLabel: string; instruction: string; output: string }
    | { kind: "tool"; tool: string; args: unknown; result: unknown }
  >;
  totalCostUsd?: number | null;
  durationMs?: number;
};

export default function Trace({ data }: { data: TraceData }) {
  const [open, setOpen] = useState(false);
  const stepCount = data.trace.filter((t) => t.kind === "step").length;
  const toolCount = data.trace.filter((t) => t.kind === "tool").length;
  const agents = Array.from(
    new Set(data.trace.filter((t) => t.kind === "step").map((t) => (t as { agent: string }).agent)),
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-surface hover:bg-surface/80"
      >
        <span className="text-zinc-400">{open ? "▼" : "▶"}</span>
        <span className="text-zinc-300">trace</span>
        <span className="flex gap-1">
          {agents.map((a) => (
            <span key={a} className={`px-1.5 py-0.5 rounded border ${AGENT_COLOR[a] ?? AGENT_COLOR.general}`}>
              {a}
            </span>
          ))}
        </span>
        <span className="ml-auto flex items-center gap-3 text-zinc-500">
          {data.plan && <span>plan: {data.plan.mode}</span>}
          <span>
            {stepCount} step{stepCount === 1 ? "" : "s"}
          </span>
          {toolCount > 0 && (
            <span>
              {toolCount} tool{toolCount === 1 ? "" : "s"}
            </span>
          )}
          {data.durationMs != null && <span>{(data.durationMs / 1000).toFixed(1)}s</span>}
          {data.totalCostUsd != null && <span>${data.totalCostUsd.toFixed(4)}</span>}
        </span>
      </button>
      {open && (
        <div className="bg-bg/60 p-3 space-y-3 max-h-96 overflow-y-auto">
          {data.plan && (
            <div className="text-zinc-400">
              <span className="text-zinc-500">plan rationale:</span> {data.plan.rationale}
            </div>
          )}
          {data.trace.map((t, i) => (
            <div key={i} className="border-l-2 border-border pl-3 space-y-1">
              {t.kind === "step" ? (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded border ${AGENT_COLOR[t.agent] ?? AGENT_COLOR.general}`}
                    >
                      {t.agent}
                    </span>
                    <span className="text-zinc-500">{t.modelLabel}</span>
                  </div>
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">instruction:</span> {t.instruction}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded border border-violet-500/30 bg-violet-500/15 text-violet-300">
                      tool
                    </span>
                    <span className="text-zinc-300">{t.tool}</span>
                  </div>
                  <pre className="text-[11px] text-zinc-400 whitespace-pre-wrap break-all">
                    {JSON.stringify(t.args, null, 2)}
                  </pre>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
