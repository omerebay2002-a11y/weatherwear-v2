import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import type { LanguageModelV1 } from "ai";
import type { AgentKind } from "./types";

type Provider = "anthropic" | "openai" | "google";

const has = {
  anthropic: () => !!process.env.ANTHROPIC_API_KEY,
  openai: () => !!process.env.OPENAI_API_KEY,
  google: () => !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
};

function pick(model: string, provider: Provider): LanguageModelV1 {
  if (provider === "anthropic") return anthropic(model);
  if (provider === "openai") return openai(model);
  return google(model);
}

// Preference order per agent: first available wins.
// Picks reflect each model's strength as of 2026.
const PREFERENCES: Record<AgentKind, Array<{ provider: Provider; model: string }>> = {
  code: [
    { provider: "anthropic", model: "claude-opus-4-7" },
    { provider: "anthropic", model: "claude-sonnet-4-6" },
    { provider: "openai", model: "gpt-5" },
  ],
  design: [
    { provider: "anthropic", model: "claude-opus-4-7" },
    { provider: "openai", model: "gpt-5" },
    { provider: "google", model: "gemini-2.5-pro" },
  ],
  research: [
    { provider: "openai", model: "gpt-5" },
    { provider: "google", model: "gemini-2.5-pro" },
    { provider: "anthropic", model: "claude-opus-4-7" },
  ],
  marketing: [
    { provider: "anthropic", model: "claude-opus-4-7" },
    { provider: "openai", model: "gpt-5" },
    { provider: "anthropic", model: "claude-sonnet-4-6" },
  ],
  general: [
    { provider: "anthropic", model: "claude-sonnet-4-6" },
    { provider: "openai", model: "gpt-5" },
    { provider: "google", model: "gemini-2.5-pro" },
  ],
};

export function modelFor(agent: AgentKind): { model: LanguageModelV1; label: string } {
  for (const { provider, model } of PREFERENCES[agent]) {
    if (has[provider]()) return { model: pick(model, provider), label: `${provider}/${model}` };
  }
  throw new Error(
    "No API key configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY.",
  );
}

export function routerModel(): { model: LanguageModelV1; label: string } {
  const override = process.env.ROUTER_MODEL;
  if (has.anthropic()) {
    const name = override ?? "claude-haiku-4-5";
    return { model: anthropic(name), label: `anthropic/${name}` };
  }
  if (has.openai()) return { model: openai("gpt-5-mini"), label: "openai/gpt-5-mini" };
  if (has.google()) return { model: google("gemini-2.5-flash"), label: "google/gemini-2.5-flash" };
  throw new Error("No API key configured for the router.");
}
