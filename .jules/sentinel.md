## 2024-05-12 - Information Leakage in API Error Handlers
**Vulnerability:** API endpoints (`api/analyze-clothing.ts`, `api/suggest-outfit.ts`, `api/chat.ts`) were catching exceptions from the Anthropic SDK and returning `e.message` directly in the HTTP response.
**Learning:** Returning raw exception messages to the client can leak sensitive details about internal architecture, library versions, or even API keys and authentication errors. Additionally, endpoints lacked basic DoS protection via input length validation.
**Prevention:** Always log full errors server-side using `console.error` and return generic, safe error messages to clients. Add sensible max-length limits on payloads like text inputs or arrays.
