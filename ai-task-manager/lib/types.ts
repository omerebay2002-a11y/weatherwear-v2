export type AgentKind = "code" | "design" | "research" | "marketing" | "general";

export type RouterDecision = {
  agent: AgentKind;
  reason: string;
  confidence: number;
};

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};
