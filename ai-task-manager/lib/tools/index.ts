import type { Tool } from "ai";
import { webSearch } from "./web-search";
import { fetchUrl } from "./fetch-url";
import { imagePrompt } from "./image-prompt";
import { codeEval } from "./code-eval";
import type { AgentKind } from "../types";

export const TOOLS_PER_AGENT: Record<AgentKind, Record<string, Tool>> = {
  code: { codeEval, fetchUrl },
  design: { imagePrompt, fetchUrl },
  research: { webSearch, fetchUrl },
  marketing: { webSearch, fetchUrl },
  general: { webSearch, fetchUrl },
};

export type ToolName = "webSearch" | "fetchUrl" | "imagePrompt" | "codeEval";
