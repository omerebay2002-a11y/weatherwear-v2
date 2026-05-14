## 2024-10-24 - Exposed Internal Error Details in API Responses
**Vulnerability:** The Vercel Edge functions (`api/analyze-clothing.ts`, `api/chat.ts`, `api/suggest-outfit.ts`) were exposing internal Anthropic SDK error details (like `e.message` or raw error strings) directly to the client responses.
**Learning:** Returning raw error messages from third-party APIs or internal processing can leak sensitive stack traces or internal implementation details to end users.
**Prevention:** Catch errors internally, log the detailed error using `console.error` for debugging, and return a generic, sanitized error message (e.g., "An internal server error occurred") to the client.
