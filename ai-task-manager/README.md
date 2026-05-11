# AI Task Manager

A chat that routes each task to the best specialist agent on the best model.

## How it works

```
user message
    │
    ▼
┌─────────────────┐    classifies into one of:
│  Router (Haiku) │ ── code · design · research · marketing · general
└─────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│  Specialist agent                           │
│  - own system prompt                        │
│  - best model for the domain                │
│  - own temperature                          │
└─────────────────────────────────────────────┘
    │
    ▼
streamed reply (with routing metadata in headers)
```

The router is a tiny, cheap, fast model (default: Claude Haiku 4.5). It uses
structured output to pick exactly one specialist. Each specialist has its own
system prompt and model preference list — first available provider wins.

## Stack

- Next.js 15 (App Router, edge runtime)
- Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`)
- Tailwind CSS
- Zod (for the router's structured output)

## Setup

```bash
cd ai-task-manager
npm install
cp .env.example .env.local
# add at least one API key
npm run dev
```

Open http://localhost:3000.

## Adding a new specialist

1. Add the kind to `AgentKind` in `lib/types.ts`.
2. Add a system prompt in `lib/agents/prompts.ts`.
3. Add a model preference list in `lib/models.ts` (`PREFERENCES`).
4. Add the enum value in the router schema in `lib/router.ts` and describe it
   in `ROUTER_SYSTEM`.

That's it — the API route and UI pick it up automatically.

## Adding tools (MCP, function calls, web search)

The agent runner in `lib/agents/run.ts` is intentionally minimal. To give a
specialist tools, pass a `tools` map to `streamText` — per-agent. For example,
a research agent gets `webSearch`, a code agent gets a file-read tool, a
marketing agent gets a "publish to Slack" tool. Tools are scoped per agent, so
the router decides which capabilities are even reachable for a given task.

## Roadmap

- Per-agent tool sets (MCP support)
- Conversation memory + task threading
- Multi-step plans (router → planner → parallel specialists → synthesizer)
- Cost + latency telemetry per turn
- Per-agent eval suite
