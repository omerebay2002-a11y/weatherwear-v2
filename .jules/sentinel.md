## 2024-06-01 - Avoid exposing raw error messages in Edge APIs
**Vulnerability:** Information disclosure via unhandled API exceptions leaking sensitive error details (`e.message`) to the client.
**Learning:** Vercel Edge functions return `Response` objects directly. Previously, `catch` blocks returned `e.message` directly in the HTTP body, which can leak stack details, service configurations, or API key issues.
**Prevention:** Always log the actual error (`e`) server-side via `console.error` for debugging, and return a sanitized, generic error message (e.g. "Internal server error" or localized equivalent) to the client.
