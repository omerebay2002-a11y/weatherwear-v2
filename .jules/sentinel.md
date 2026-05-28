## 2024-11-20 - Prevent Information Disclosure in Vercel Edge Functions
**Vulnerability:** API endpoints (chat, analyze-clothing, suggest-outfit) were catching errors and returning `e.message` directly to the client.
**Learning:** Returning raw error messages from Vercel Edge functions, especially those integrating with third-party APIs like Anthropic, can leak sensitive internal details, stack traces, or configuration nuances to end users.
**Prevention:** Always log detailed errors server-side using `console.error` for debugging purposes, and return generic, non-descript error messages (e.g., "Internal server error" or equivalent localized messaging) to the client.
