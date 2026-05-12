"use client";

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image"; image: string };

export type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  content: string | ContentPart[];
  createdAt: number;
  meta?: {
    plan?: {
      mode: "single" | "multi";
      steps: Array<{ agent: string; instruction: string }>;
      rationale: string;
    };
    trace?: Array<
      | { kind: "step"; agent: string; modelLabel: string; instruction: string; output: string }
      | { kind: "tool"; tool: string; args: unknown; result: unknown }
    >;
    totalCostUsd?: number | null;
    durationMs?: number;
  };
};

export type Thread = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: StoredMessage[];
};

const KEY = "ai-task-manager:threads:v1";

export function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Thread[];
  } catch {
    return [];
  }
}

export function saveThreads(threads: Thread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(threads));
}

export function newThread(): Thread {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
}

export function titleFromFirstMessage(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length <= 48 ? trimmed : trimmed.slice(0, 45) + "…";
}
