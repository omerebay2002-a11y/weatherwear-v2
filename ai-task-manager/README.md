# AI Task Manager

A chat that **plans** every task, **routes** it to the right specialists,
**uses tools** when needed, and **synthesizes** one clean answer — with full
trace, telemetry, and persistent threads.

## Architecture

```
                     ┌──────────────────────┐
user message ───────▶│  Planner (Haiku)     │  single-step or multi-step?
                     └──────────────────────┘
                              │
              single ─────────┴───────── multi
                │                          │
                ▼                          ▼
       ┌────────────────┐         ┌────────────────────────────┐
       │  Router        │         │  Plan: step₁ → step₂ → …   │
       │  picks 1 of 5  │         │  (each step = an agent)    │
       └────────────────┘         └────────────────────────────┘
                │                          │
                ▼                          ▼
       ┌─────────────────────────────────────────┐
       │  Specialist agent(s)                    │
       │  - own system prompt                    │
       │  - own model (best per domain)          │
       │  - own tools (web search, fetch, …)    │
       └─────────────────────────────────────────┘
                │                          │
                ▼                          ▼
       ┌────────────────┐         ┌────────────────────────────┐
       │  stream reply  │         │  Synthesizer merges steps  │
       └────────────────┘         └────────────────────────────┘
```

**Agents:** `code` · `design` · `research` · `marketing` · `general`
Each has its own system prompt (`lib/agents/prompts.ts`) and a model
preference list (`lib/models.ts`).

**Tools (per agent, in `lib/tools/`):**
- `webSearch` — Tavily search (research, marketing, general)
- `fetchUrl` — clean text from any URL (all agents)
- `imagePrompt` — composes prompts for image models (design)
- `codeEval` — sandboxed JS expression eval (code)

## Features

- **Multi-step planning** — the planner decides whether a task needs one
  specialist or a chain across domains. "Research X then write a landing
  page" automatically becomes `research → marketing → synthesizer`.
- **Multi-provider routing** — Anthropic, OpenAI, Google. The best available
  provider for each agent is picked at runtime based on which API keys
  are set.
- **Live trace** — every reply shows which agents ran, which tools fired,
  on which model, total latency, and an estimated USD cost.
- **Persistent threads** — sidebar of chats, stored in browser
  localStorage. Switch, rename (auto from first message), delete.
- **Multimodal input** — attach an image to any message; vision-capable
  models receive it natively.
- **Streaming everything** — plan, step deltas, tool calls, tool results,
  and final synthesis all stream over SSE.

## Stack

- Next.js 15 (App Router)
- Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`)
- Zod (structured output for router + planner)
- Tailwind CSS

## Setup

```bash
cd ai-task-manager
npm install
cp .env.example .env.local
# add at least one provider key (ANTHROPIC_API_KEY recommended)
# optional: TAVILY_API_KEY for live web search
npm run dev
```

Open http://localhost:3000.

## Environment

| Key | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | one of three | Claude (Opus 4.7, Sonnet 4.6, Haiku 4.5) |
| `OPENAI_API_KEY` | one of three | GPT-5 / GPT-5-mini |
| `GOOGLE_GENERATIVE_AI_API_KEY` | one of three | Gemini 2.5 Pro / Flash |
| `TAVILY_API_KEY` | optional | Live web search tool |
| `ROUTER_MODEL` | optional | Override the router's model |

## Adding a new specialist

1. Add the kind to `AgentKind` in `lib/types.ts`.
2. Add a system prompt in `lib/agents/prompts.ts`.
3. Add a model preference list in `lib/models.ts` (`PREFERENCES`).
4. Add the enum value in both the router schema (`lib/router.ts`) and the
   planner schema (`lib/planner.ts`), and describe it in the system prompts.
5. Add per-agent tools in `lib/tools/index.ts` (`TOOLS_PER_AGENT`).

The API, planner, orchestrator, and UI pick it up automatically.

## Adding a new tool

1. Create `lib/tools/my-tool.ts` exporting a `tool({...})`.
2. Register it in `TOOLS_PER_AGENT` (`lib/tools/index.ts`) under each agent
   that should be able to call it.

## Roadmap

- MCP support (auto-wire any MCP server as agent tools)
- Server-side thread storage (currently localStorage)
- Per-agent eval suite
- Parallel step execution where the plan allows it
